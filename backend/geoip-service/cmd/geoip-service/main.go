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

	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("[Main] No .env file found, using system environment variables")
	}

	// Database config
	dbCfg := database.Config{
		Host:     getEnv("POSTGRES_HOST", "localhost"),
		Port:     getEnv("POSTGRES_PORT", "5432"),
		User:     getEnv("POSTGRES_USER", "geoip"),
		Password: getEnv("POSTGRES_PASSWORD", "geoip_secret"),
		DBName:   getEnv("POSTGRES_DB", "geoip"),
	}

	// Server config
	serverPort := getEnv("SERVER_PORT", "8080")

	// Updater config
	updateInterval, err := time.ParseDuration(getEnv("UPDATE_INTERVAL", "168h"))
	if err != nil {
		log.Printf("[Main] Invalid UPDATE_INTERVAL, defaulting to 7 days: %v", err)
		updateInterval = 168 * time.Hour
	}
	firstDelay, err := time.ParseDuration(getEnv("FIRST_UPDATE_DELAY", "30s"))
	if err != nil {
		log.Printf("[Main] Invalid FIRST_UPDATE_DELAY, defaulting to 30s: %v", err)
		firstDelay = 30 * time.Second
	}

	releaseTag := getEnv("GEOIP_RELEASE_TAG", "20260605")
	mmdbSourceURL := getEnv("GEOIP_MMDB_URL", "https://github.com/Skiddle-ID/geoip2-mirror/releases/download")
	
	// MMDB file path - use a data directory
	mmdbDir := getEnv("MMDB_DIR", "/data/geoip")
	mmdbPath := filepath.Join(mmdbDir, "GeoLite2-Country.mmdb")
	if err := downloader.EnsureDirExists(mmdbPath); err != nil {
		log.Printf("[Main] Failed to create MMDB directory: %v", err)
	}

	// Connect to database
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	store, err := database.NewStore(ctx, dbCfg)
	if err != nil {
		log.Fatalf("[Main] Failed to connect to database: %v", err)
	}
	defer store.Close()

	// Run migrations
	migrateCtx, migrateCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer migrateCancel()

	if err := store.Migrate(migrateCtx); err != nil {
		log.Fatalf("[Main] Failed to run migrations: %v", err)
	}

	// Create updater
	updaterCfg := updater.Config{
		MMDBSourceURL: mmdbSourceURL,
		MMDBPath:      mmdbPath,
		ReleaseTag:    releaseTag,
		UpdateEvery:   updateInterval,
		FirstDelay:    firstDelay,
	}
	svcUpdater := updater.New(store, updaterCfg)
	svcUpdater.Start()
	defer svcUpdater.Stop()

	// Start HTTP server
	srv := api.NewServer(store, svcUpdater, serverPort)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := srv.Start(); err != nil {
			log.Printf("[Main] Server stopped: %v", err)
		}
	}()

	log.Println("[Main] GeoIP Service is running. Press Ctrl+C to stop.")

	<-quit
	log.Println("[Main] Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("[Main] Server forced to shutdown: %v", err)
	}

	log.Println("[Main] GeoIP Service stopped")
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}