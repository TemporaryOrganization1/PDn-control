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

type Server struct {
	echo    *echo.Echo
	store   *database.Store
	updater *updater.Updater
	port    string
}

func NewServer(store *database.Store, u *updater.Updater, port string) *Server {
	e := echo.New()
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "method=${method}, uri=${uri}, status=${status}, latency=${latency_human}\n",
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	s := &Server{echo: e, store: store, updater: u, port: port}
	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	s.echo.GET("/health", s.healthCheck)
	s.echo.GET("/api/v1/lookup/:ip", s.lookupIP)
	s.echo.POST("/api/v1/update", s.triggerUpdate)
	s.echo.GET("/api/v1/updates", s.getUpdateHistory)
}

func (s *Server) Start() error {
	log.Printf("[API] Listening on :%s", s.port)
	return s.echo.Start(":" + s.port)
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.echo.Shutdown(ctx)
}

func (s *Server) healthCheck(c echo.Context) error {
	reader := s.updater.GetReader()
	loaded := reader != nil
	status := "ok"
	if !loaded {
		status = "degraded"
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": status, "service": "geoip-service",
		"mmdb_loaded": loaded, "time": time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Server) lookupIP(c echo.Context) error {
	ipStr := c.Param("ip")
	parsedIP := net.ParseIP(ipStr)
	if parsedIP == nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid IP address"})
	}

	reader := s.updater.GetReader()
	if reader == nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{
			"country_code": "unknown", "message": "GeoIP database not loaded yet",
		})
	}

	var record models.GeoIPRecord
	if err := reader.Lookup(parsedIP, &record); err != nil {
		log.Printf("[API] Lookup error for %s: %v", ipStr, err)
		return c.JSON(http.StatusOK, map[string]string{"country_code": "unknown"})
	}

	if record.Country.GeonameID == 0 {
		return c.JSON(http.StatusOK, map[string]string{"country_code": "unknown"})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"country_code": record.Country.ISOCode,
	})
}

func (s *Server) triggerUpdate(c echo.Context) error {
	go func() {
		ctx := context.Background()
		if err := s.updater.RunOnce(ctx); err != nil {
			log.Printf("[API] Manual update failed: %v", err)
		}
	}()
	return c.JSON(http.StatusAccepted, map[string]string{"status": "accepted", "message": "Update started"})
}

func (s *Server) getUpdateHistory(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()
	updates, err := s.store.GetUpdateHistory(ctx, 20)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to retrieve updates"})
	}
	return c.JSON(http.StatusOK, updates)
}