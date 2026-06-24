package main

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"

	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/api"
)

type MainConfig struct {
	Server api.Config `json:"server"`
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[Main Backend] Starting...")

	cfgPath := "config.json"
	if envPath := os.Getenv("CONFIG_PATH"); envPath != "" {
		cfgPath = envPath
	}

	data, err := os.ReadFile(cfgPath)
	if err != nil {
		log.Fatalf("Failed to read config %s: %v", cfgPath, err)
	}

	var mainCfg MainConfig
	if err := json.Unmarshal(data, &mainCfg); err != nil {
		log.Fatalf("Failed to parse config: %v", err)
	}

	if port := os.Getenv("SERVER_PORT"); port != "" {
		mainCfg.Server.ServerPort = port
	}
	if databaseURL := os.Getenv("DATABASE_URL"); databaseURL != "" {
		mainCfg.Server.DatabaseURL = databaseURL
	}
	if workerSecret := os.Getenv("WORKER_SECRET"); workerSecret != "" {
		mainCfg.Server.WorkerSecret = workerSecret
	}
	if cookieSecure := os.Getenv("COOKIE_SECURE"); cookieSecure != "" {
		mainCfg.Server.CookieSecure = cookieSecure == "true" || cookieSecure == "1"
	}
	if ttl := os.Getenv("SESSION_TTL_HOURS"); ttl != "" {
		if parsed, err := strconv.Atoi(ttl); err == nil {
			mainCfg.Server.SessionTTLHours = parsed
		}
	}
	if limit := os.Getenv("GUEST_LIMIT"); limit != "" {
		if parsed, err := strconv.Atoi(limit); err == nil {
			mainCfg.Server.GuestLimit = parsed
		}
	}
	if origins := os.Getenv("CORS_ALLOWED_ORIGINS"); origins != "" {
		mainCfg.Server.AllowedOrigins = splitCSV(origins)
	}

	srv, err := api.NewServer(mainCfg.Server)
	if err != nil {
		log.Fatalf("Failed to create server: %v", err)
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := srv.Start(); err != nil {
			log.Printf("[Main Backend] Server stopped: %v", err)
		}
	}()

	log.Println("[Main Backend] Running. Press Ctrl+C to stop.")
	<-quit
	log.Println("[Main Backend] Shutting down...")

	srv.Shutdown()
	log.Println("[Main Backend] Stopped")
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	return result
}
