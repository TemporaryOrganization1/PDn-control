package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/TemporaryOrganization1/PDn-control/backend/auth-service/internal/api"
	"github.com/TemporaryOrganization1/PDn-control/backend/auth-service/internal/database"
)

func main() {
	log.Println("[AUTH] Starting auth-service...")

	// Load configuration from environment variables
	cfg := loadConfig()

	// Connect to PostgreSQL
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	store, err := database.NewStore(ctx, database.Config{
		Host:     cfg.DBHost,
		Port:     cfg.DBPort,
		User:     cfg.DBUser,
		Password: cfg.DBPassword,
		DBName:   cfg.DBName,
	})
	if err != nil {
		log.Fatalf("[AUTH] Failed to connect to database: %v", err)
	}
	defer store.Close()

	// Run migrations
	migrateCtx, migrateCancel := context.WithTimeout(context.Background(), 30*time.Second)
	if err := store.Migrate(migrateCtx); err != nil {
		migrateCancel()
		log.Fatalf("[AUTH] Failed to run migrations: %v", err)
	}
	migrateCancel()
	log.Println("[AUTH] Database migrations completed")

	// Parse token TTLs
	accessTTL, err := time.ParseDuration(cfg.AccessTokenTTL)
	if err != nil {
		log.Fatalf("[AUTH] Invalid JWT_ACCESS_TOKEN_TTL: %v", err)
	}
	refreshTTL, err := time.ParseDuration(cfg.RefreshTokenTTL)
	if err != nil {
		log.Fatalf("[AUTH] Invalid JWT_REFRESH_TOKEN_TTL: %v", err)
	}

	// Create API server
	server := api.NewServer(store, api.Config{
		JWTSecret:          cfg.JWTSecret,
		AccessTokenTTL:     accessTTL,
		RefreshTokenTTL:    refreshTTL,
		VerificationBaseURL: cfg.VerificationBaseURL,
		AppEnv:             cfg.AppEnv,
	})

	// Start server in a goroutine
	go func() {
		if err := server.Start(cfg.ServerPort); err != nil {
			log.Fatalf("[AUTH] Server error: %v", err)
		}
	}()

	// Wait for shutdown signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[AUTH] Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("[AUTH] Server forced to shutdown: %v", err)
	}

	log.Println("[AUTH] Server exited gracefully")
}

// Config holds all configuration values loaded from environment variables.
type Config struct {
	ServerPort         string
	AppEnv             string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	JWTSecret          string
	AccessTokenTTL     string
	RefreshTokenTTL    string
	VerificationBaseURL string
}

func loadConfig() Config {
	return Config{
		ServerPort:         getEnv("AUTH_SERVER_PORT", "8081"),
		AppEnv:             getEnv("APP_ENV", "development"),
		DBHost:             getEnv("AUTH_DB_HOST", "postgres"),
		DBPort:             getEnv("AUTH_DB_PORT", "5432"),
		DBUser:             getEnv("AUTH_DB_USER", "auth_user"),
		DBPassword:         getEnv("AUTH_DB_PASSWORD", "auth_secret"),
		DBName:             getEnv("AUTH_DB_NAME", "auth"),
		JWTSecret:          getEnv("JWT_SECRET", "dev-jwt-secret-change-in-production"),
		AccessTokenTTL:     getEnv("JWT_ACCESS_TOKEN_TTL", "15m"),
		RefreshTokenTTL:    getEnv("JWT_REFRESH_TOKEN_TTL", "168h"),
		VerificationBaseURL: getEnv("VERIFICATION_BASE_URL", "http://localhost:8081/api/v1/auth/verify"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}