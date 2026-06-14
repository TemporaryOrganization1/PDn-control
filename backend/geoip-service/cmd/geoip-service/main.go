package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/api"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/database"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/downloader"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/updater"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[Main] Starting GeoIP Service...")

	godotenv.Load()

	dbCfg := database.Config{
		Host:     getEnv("POSTGRES_HOST", "localhost"),
		Port:     getEnv("POSTGRES_PORT", "5432"),
		User:     getEnv("POSTGRES_USER", "geoip"),
		Password: getEnv("POSTGRES_PASSWORD", "geoip_secret"),
		DBName:   getEnv("POSTGRES_DB", "geoip"),
	}

	serverPort := getEnv("SERVER_PORT", "8080")
	updateInterval, _ := time.ParseDuration(getEnv("UPDATE_INTERVAL", "168h"))
	firstDelay, _ := time.ParseDuration(getEnv("FIRST_UPDATE_DELAY", "30s"))
	releaseTag := getEnv("GEOIP_RELEASE_TAG", "20260605")
	mmdbSourceURL := getEnv("GEOIP_MMDB_URL", "https://github.com/Skiddle-ID/geoip2-mirror/releases/download")
	mmdbDir := getEnv("MMDB_DIR", "/data/geoip")
	mmdbPath := filepath.Join(mmdbDir, "GeoLite2-Country.mmdb")
	downloader.EnsureDirExists(mmdbPath)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	store, err := database.NewStore(ctx, dbCfg)
	if err != nil {
		log.Fatalf("[Main] DB connection failed: %v", err)
	}
	defer store.Close()

	migrateCtx, migrateCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer migrateCancel()
	if err := store.Migrate(migrateCtx); err != nil {
		log.Fatalf("[Main] Migration failed: %v", err)
	}

	svcUpdater := updater.New(store, updater.Config{
		MMDBSourceURL: mmdbSourceURL,
		MMDBPath:      mmdbPath,
		ReleaseTag:    releaseTag,
		UpdateEvery:   updateInterval,
		FirstDelay:    firstDelay,
	})
	svcUpdater.Start()
	defer svcUpdater.Stop()

	srv := api.NewServer(store, svcUpdater, serverPort)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := srv.Start(); err != nil {
			log.Printf("[Main] Server stopped: %v", err)
		}
	}()

	log.Println("[Main] Running. Press Ctrl+C to stop.")
	<-quit
	log.Println("[Main] Shutting down...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	srv.Shutdown(shutdownCtx)
	log.Println("[Main] Stopped")
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}