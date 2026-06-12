package api

import (
	"context"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/database"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/models"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/updater"
)

// Server wraps the Echo HTTP server and dependencies.
type Server struct {
	echo    *echo.Echo
	store   *database.Store
	updater *updater.Updater
	port    string
}

// NewServer creates a new HTTP server with all routes.
func NewServer(store *database.Store, updater *updater.Updater, port string) *Server {
	e := echo.New()

	// Middleware
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "method=${method}, uri=${uri}, status=${status}, latency=${latency_human}\n",
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost},
	}))

	s := &Server{
		echo:    e,
		store:   store,
		updater: updater,
		port:    port,
	}

	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	// Health check
	s.echo.GET("/health", s.healthCheck)

	// GeoIP lookup
	s.echo.GET("/api/v1/lookup/:ip", s.lookupIP)

	// Update management
	s.echo.POST("/api/v1/update", s.triggerUpdate)
	s.echo.GET("/api/v1/updates", s.getUpdateHistory)
}

// Start begins listening on the configured port.
func (s *Server) Start() error {
	log.Printf("[API] Starting server on :%s", s.port)
	return s.echo.Start(":" + s.port)
}

// Shutdown gracefully stops the server.
func (s *Server) Shutdown(ctx context.Context) error {
	return s.echo.Shutdown(ctx)
}

// healthCheck returns service health status.
func (s *Server) healthCheck(c echo.Context) error {
	reader := s.updater.GetReader()
	mmdbLoaded := reader != nil
	status := "ok"
	if !mmdbLoaded {
		status = "degraded"
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":      status,
		"service":     "geoip-service",
		"mmdb_loaded": mmdbLoaded,
		"time":        time.Now().UTC().Format(time.RFC3339),
	})
}

// lookupIP performs a GeoIP lookup for the given IP address using the MMDB reader.
func (s *Server) lookupIP(c echo.Context) error {
	ipStr := c.Param("ip")

	// Validate IP
	parsedIP := net.ParseIP(ipStr)
	if parsedIP == nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid IP address",
		})
	}

	reader := s.updater.GetReader()
	if reader == nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]interface{}{
			"ip":      ipStr,
			"found":   false,
			"message": "GeoIP database not loaded yet",
		})
	}

	var record models.GeoIPRecord
	err := reader.Lookup(parsedIP, &record)
	if err != nil {
		log.Printf("[API] MMDB Lookup error for %s: %v", ipStr, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "lookup failed",
		})
	}

	if record.Country.GeonameID == 0 {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"ip":      ipStr,
			"found":   false,
			"message": "IP not found in database",
		})
	}

	result := models.LookupResult{
		IP:         ipStr,
		Found:      true,
		Country:    record.Country.Names.En,
		CountryISO: record.Country.ISOCode,
		GeonameID:  record.Country.GeonameID,
		Continent:  record.Continent.Code,
		Network:    "", // maxminddb-golang doesn't provide network from the reader, only from decoder
	}

	return c.JSON(http.StatusOK, result)
}

// triggerUpdate forces an immediate data refresh.
func (s *Server) triggerUpdate(c echo.Context) error {
	go func() {
		ctx := context.Background()
		if err := s.updater.RunOnce(ctx); err != nil {
			log.Printf("[API] Manual update failed: %v", err)
		}
	}()

	return c.JSON(http.StatusAccepted, map[string]string{
		"status":  "accepted",
		"message": "Update started in background",
	})
}

// getUpdateHistory returns the last 20 update records.
func (s *Server) getUpdateHistory(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()

	updates, err := s.store.GetUpdateHistory(ctx, 20)
	if err != nil {
		log.Printf("[API] Failed to get update history: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to retrieve update history",
		})
	}

	return c.JSON(http.StatusOK, updates)
}