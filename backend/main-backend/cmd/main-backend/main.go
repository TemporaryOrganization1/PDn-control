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
	if imageSecret := os.Getenv("IMAGE_SECRET"); imageSecret != "" {
		mainCfg.Server.ImageSecret = imageSecret
	} else if imageSecret := os.Getenv("IMAGES_SECRET"); imageSecret != "" {
		mainCfg.Server.ImageSecret = imageSecret
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
			if os.Getenv("FREE_SCAN_LIMIT") == "" {
				mainCfg.Server.FreeScanLimit = parsed
			}
		}
	}
	if limit := os.Getenv("FREE_SCAN_LIMIT"); limit != "" {
		if parsed, err := strconv.Atoi(limit); err == nil {
			mainCfg.Server.FreeScanLimit = parsed
		}
	}
	if days := os.Getenv("FREE_SCAN_WINDOW_DAYS"); days != "" {
		if parsed, err := strconv.Atoi(days); err == nil {
			mainCfg.Server.FreeScanWindowDays = parsed
		}
	}
	if iterations := os.Getenv("FREE_AI_ITERATIONS"); iterations != "" {
		if parsed, err := strconv.Atoi(iterations); err == nil {
			mainCfg.Server.FreeAIIterations = parsed
		}
	}
	if iterations := os.Getenv("PAID_AI_ITERATIONS"); iterations != "" {
		if parsed, err := strconv.Atoi(iterations); err == nil {
			mainCfg.Server.PaidAIIterations = parsed
		}
	}
	if reportsDir := os.Getenv("REPORTS_DIR"); reportsDir != "" {
		mainCfg.Server.ReportsDir = reportsDir
	}
	if imagesDir := os.Getenv("IMAGES_DIR"); imagesDir != "" {
		mainCfg.Server.ImagesDir = imagesDir
	}
	if origins := os.Getenv("CORS_ALLOWED_ORIGINS"); origins != "" {
		mainCfg.Server.AllowedOrigins = splitCSV(origins)
	}

	// Log SMTP configuration status
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	if smtpHost != "" && smtpPort != "" {
		if smtpUser != "" {
			log.Printf("[Main Backend] SMTP configured: host=%s, port=%s, user=%s", smtpHost, smtpPort, smtpUser)
		} else {
			log.Printf("[Main Backend] SMTP relay configured without auth: host=%s, port=%s", smtpHost, smtpPort)
		}
	} else {
		log.Println("[Main Backend] SMTP not configured - email verification disabled")
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
