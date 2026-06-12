package main

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"
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

	if secret := os.Getenv("API_SECRET"); secret != "" {
		mainCfg.Server.Secret = secret
	}
	if port := os.Getenv("SERVER_PORT"); port != "" {
		mainCfg.Server.ServerPort = port
	}

	srv := api.NewServer(mainCfg.Server)

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
