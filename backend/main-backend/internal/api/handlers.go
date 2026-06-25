package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/auth"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/models"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/workerpool"
	"golang.org/x/crypto/bcrypt"
)

type Config struct {
	ServerPort           string   `json:"serverPort"`
	DatabaseURL          string   `json:"databaseUrl"`
	CookieSecure         bool     `json:"cookieSecure"`
	SessionTTLHours      int      `json:"sessionTtlHours"`
	GuestLimit           int      `json:"guestLimit"`
	GuestCacheMaxItems   int      `json:"guestCacheMaxItems"`
	GuestCacheTTLMinutes int      `json:"guestCacheTTLMinutes"`
	WorkerSecret         string   `json:"workerSecret"`
	AllowedOrigins       []string `json:"allowedOrigins"`
	Workers              []Worker `json:"workers"`
}

type Worker struct {
	URL     string `json:"url"`
	MaxLoad int    `json:"maxLoad"`
}

type Server struct {
	echo      *echo.Echo
	store     *store.MemoryStore
	authStore *auth.Store
	pool      *workerpool.Pool
	config    Config
	mu        sync.RWMutex
}

const (
	sessionCookieName = "pdn_session"
)

func NewServer(cfg Config) (*Server, error) {
	if cfg.SessionTTLHours <= 0 {
		cfg.SessionTTLHours = 24 * 30
	}
	if cfg.GuestLimit <= 0 {
		cfg.GuestLimit = 3
	}
	if cfg.GuestCacheMaxItems <= 0 {
		cfg.GuestCacheMaxItems = 10000
	}
	if cfg.GuestCacheTTLMinutes <= 0 {
		cfg.GuestCacheTTLMinutes = 1440
	}
	if cfg.DatabaseURL == "" {
		cfg.DatabaseURL = "postgres://geoip:geoip_secret@postgres:5432/geoip?sslmode=disable"
	}

	authStore, err := auth.NewStore(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	workerDefs := make([]struct {
		URL     string
		MaxLoad int
	}, len(cfg.Workers))
	for i, w := range cfg.Workers {
		workerDefs[i] = struct {
			URL     string
			MaxLoad int
		}{URL: w.URL, MaxLoad: w.MaxLoad}
	}

	s := &Server{
		echo:      echo.New(),
		store:     store.NewWithGuestConfig(cfg.GuestCacheMaxItems, cfg.GuestCacheTTLMinutes),
		authStore: authStore,
		pool:      workerpool.NewPool(workerDefs),
		config:    cfg,
	}

	s.echo.Use(middleware.Logger())
	s.echo.Use(middleware.Recover())
	s.echo.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     allowedOrigins(cfg.AllowedOrigins),
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))
	s.registerRoutes()
	return s, nil
}

func (s *Server) registerRoutes() {
	s.echo.POST("/api/auth/register", s.handleRegister)
	s.echo.POST("/api/auth/login", s.handleLogin)
	s.echo.POST("/api/auth/logout", s.handleLogout)
	s.echo.POST("/api/auth/change-password", s.handleChangePassword)
	s.echo.GET("/api/auth/me", s.handleMe)
	s.echo.POST("/api/check", s.handleCheck)
	s.echo.GET("/api/progress/:reqId", s.handleProgress)
	s.echo.POST("/api/progress", s.handleProgressUpdate)
	s.echo.GET("/api/workers", s.handleWorkerStatus)
	s.echo.GET("/api/health", s.handleHealth)
	s.echo.GET("/api/guest/remaining", s.handleGuestRemaining)
}

func (s *Server) Start() error {
	log.Printf("[API] Listening on %s", s.config.ServerPort)
	return s.echo.Start(":" + s.config.ServerPort)
}

func (s *Server) Shutdown() error {
	if s.authStore != nil {
		_ = s.authStore.Close()
	}
	return s.echo.Close()
}

func (s *Server) handleRegister(c echo.Context) error {
	var req models.AuthRequest
	if err := c.Bind(&req); err != nil {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", err.Error())
	}

	email := auth.NormalizeEmail(req.Email)
	if !validEmail(email) {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INVALID_CREDENTIALS", "", "valid email is required")
	}
	if len(req.Password) < 8 {
		return s.errResponse(c, http.StatusBadRequest, "ERR_WEAK_PASSWORD", "", "password must contain at least 8 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}

	user, err := s.authStore.CreateUser(c.Request().Context(), email, string(hash))
	if err != nil {
		if errors.Is(err, auth.ErrUserExists) {
			return s.errResponse(c, http.StatusConflict, "ERR_EMAIL_EXISTS", "", "email already exists")
		}
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}

	if err := s.issueSession(c, user.ID); err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}

	return c.JSON(http.StatusOK, models.MeResponse{
		User: toAuthUser(user),
	})
}

func (s *Server) handleLogin(c echo.Context) error {
	var req models.AuthRequest
	if err := c.Bind(&req); err != nil {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", err.Error())
	}

	user, err := s.authStore.UserByEmail(c.Request().Context(), req.Email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return s.errResponse(c, http.StatusUnauthorized, "ERR_INVALID_CREDENTIALS", "", "invalid email or password")
		}
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		return s.errResponse(c, http.StatusUnauthorized, "ERR_INVALID_CREDENTIALS", "", "invalid email or password")
	}

	if err := s.issueSession(c, user.ID); err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}

	return c.JSON(http.StatusOK, models.MeResponse{
		User: toAuthUser(user),
	})
}

func (s *Server) handleLogout(c echo.Context) error {
	if cookie, err := c.Cookie(sessionCookieName); err == nil {
		_ = s.authStore.DeleteSession(c.Request().Context(), cookie.Value)
	}
	s.clearCookie(c, sessionCookieName)
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleMe(c echo.Context) error {
	return c.JSON(http.StatusOK, models.MeResponse{
		User: toAuthUser(s.currentUser(c)),
	})
}

func (s *Server) handleChangePassword(c echo.Context) error {
	user := s.currentUser(c)
	if user == nil {
		return s.errResponse(c, http.StatusUnauthorized, "ERR_UNAUTHORIZED", "", "unauthorized")
	}

	var req models.ChangePasswordRequest
	if err := c.Bind(&req); err != nil {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", err.Error())
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)) != nil {
		return s.errResponse(c, http.StatusUnauthorized, "ERR_INVALID_CREDENTIALS", "", "invalid current password")
	}
	if len(req.NewPassword) < 8 {
		return s.errResponse(c, http.StatusBadRequest, "ERR_WEAK_PASSWORD", "", "password must contain at least 8 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}
	if err := s.authStore.UpdatePasswordHash(c.Request().Context(), user.ID, string(hash)); err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}

	user.PasswordHash = string(hash)
	return c.JSON(http.StatusOK, models.MeResponse{
		User: toAuthUser(user),
	})
}

func (s *Server) handleCheck(c echo.Context) error {
	var req models.CheckRequest
	if err := c.Bind(&req); err != nil {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", err.Error())
	}

	if req.URL == "" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INVALID_URL", req.ReqID, "url is required")
	}

	if req.Type != "fast" && req.Type != "detail" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INVALID_TYPE", req.ReqID, "type must be 'fast' or 'detail'")
	}

	if req.ReqID == "" {
		req.ReqID = fmt.Sprintf("req-%d", time.Now().UnixMilli())
	}
	if req.Fallback == "" {
		req.Fallback = "http://main-backend:4000/api/progress"
	}

	worker := s.pool.GetFreeWorker()
	if worker == nil {
		return s.errResponse(c, http.StatusServiceUnavailable, "ERR_WORKER_UNAVAILABLE", req.ReqID, "no workers available")
	}

	user := s.currentUser(c)
	var guestStats *models.GuestInfo

	if user == nil {
		clientIP := getClientIP(c)
		remaining, err := s.store.IncrementGuestCheck(clientIP, s.config.GuestLimit)
		if err != nil {
			s.pool.ReleaseWorker(worker)
			if errors.Is(err, store.ErrGuestLimit) {
				return s.errResponse(c, http.StatusForbidden, "ERR_GUEST_LIMIT", req.ReqID, "guest check limit reached")
			}
			return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", req.ReqID, err.Error())
		}
		used := s.config.GuestLimit - remaining
		if used < 0 {
			used = s.config.GuestLimit
		}
		guestStats = &models.GuestInfo{
			Limit:     s.config.GuestLimit,
			Used:      used,
			Remaining: remaining,
		}
	}

	s.store.Create(req.ReqID, req.URL, req.Type)
	s.store.UpdateProgress(req.ReqID, 0, "queued", nil, nil)

	go s.dispatchTask(req, worker)

	data := map[string]any{"status": "accepted", "req-id": req.ReqID}
	if guestStats != nil {
		data["guest"] = guestStats
	}

	return c.JSON(http.StatusOK, models.CheckResponse{
		Code:  "ERR_OK",
		ReqID: req.ReqID,
		Data:  data,
	})
}

func (s *Server) handleGuestRemaining(c echo.Context) error {
	clientIP := getClientIP(c)
	remaining := s.store.GetGuestRemaining(clientIP, s.config.GuestLimit)
	used := s.config.GuestLimit - remaining
	if used < 0 {
		used = s.config.GuestLimit
	}

	return c.JSON(http.StatusOK, models.GuestInfo{
		Limit:     s.config.GuestLimit,
		Used:      used,
		Remaining: remaining,
	})
}

func (s *Server) dispatchTask(req models.CheckRequest, worker *workerpool.Worker) {
	defer s.pool.ReleaseWorker(worker)

	s.store.SetWorker(req.ReqID, worker.URL)
	s.store.UpdateProgress(req.ReqID, 10, "dispatched", nil, nil)

	task := map[string]string{
		"url":             req.URL,
		"type":            req.Type,
		"req-id":          req.ReqID,
		"fallback":        req.Fallback,
		"progress-secret": s.config.WorkerSecret,
	}

	result, err := s.pool.SendTask(worker.URL, task)
	if err != nil {
		log.Printf("[API] Task %s failed on %s: %v", req.ReqID, worker.URL, err)
		s.store.UpdateProgress(req.ReqID, 0, "failed", nil, []string{err.Error()})
		return
	}

	if data, ok := result["data"]; ok {
		s.store.UpdateProgress(req.ReqID, 100, "completed", nil, nil)
		if checkResults, ok := data.([]any); ok {
			for _, cr := range checkResults {
				if crMap, ok := cr.(map[string]any); ok {
					about, ok := crMap["about"].(string)
					if !ok {
						about = ""
					}
					s.store.AddResult(req.ReqID, store.Result{
						ID:     fmt.Sprintf("%v", crMap["id"]),
						Result: fmt.Sprintf("%v", crMap["result"]),
						Pages:  toStringSlice(crMap["pages"]),
						About:  about,
						Data:   crMap["data"],
					})
				}
			}
		}
	}
}

func (s *Server) handleProgress(c echo.Context) error {
	reqID := c.Param("reqId")
	t := s.store.Get(reqID)
	if t == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "task not found"})
	}
	return c.JSON(http.StatusOK, t)
}

func (s *Server) handleProgressUpdate(c echo.Context) error {
	if s.config.WorkerSecret != "" && c.Request().Header.Get("X-Worker-Secret") != s.config.WorkerSecret {
		return s.errResponse(c, http.StatusForbidden, "ERR_FORBIDDEN", "", "invalid worker secret")
	}

	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "cannot read body"})
	}

	var update models.ProgressUpdate
	if err := json.Unmarshal(body, &update); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid json"})
	}

	s.store.UpdateProgress(update.ReqID, update.Progress, update.Status, update.Completed, update.Errors)

	if update.Data != nil {
		if results, ok := update.Data.([]any); ok {
			for _, r := range results {
				if rm, ok := r.(map[string]any); ok {
					about, ok := rm["about"].(string)
					if !ok {
						about = ""
					}
					s.store.AddResult(update.ReqID, store.Result{
						ID:     fmt.Sprintf("%v", rm["id"]),
						Result: fmt.Sprintf("%v", rm["result"]),
						Pages:  toStringSlice(rm["pages"]),
						About:  about,
						Data:   rm["data"],
					})
				}
			}
		}
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleWorkerStatus(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"available": s.pool.GetAvailableCount(),
		"total":     len(s.config.Workers),
	})
}

func (s *Server) handleHealth(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) errResponse(c echo.Context, code int, errCode, reqID, msg string) error {
	return c.JSON(code, models.CheckResponse{
		Code:  errCode,
		ReqID: reqID,
		Msg:   msg,
	})
}

func (s *Server) currentUser(c echo.Context) *auth.User {
	cookie, err := c.Cookie(sessionCookieName)
	if err != nil || cookie.Value == "" {
		return nil
	}
	user, err := s.authStore.UserBySessionToken(c.Request().Context(), cookie.Value)
	if err != nil {
		return nil
	}
	return user
}

func (s *Server) issueSession(c echo.Context, userID string) error {
	ttl := time.Duration(s.config.SessionTTLHours) * time.Hour
	token, err := s.authStore.CreateSession(c.Request().Context(), userID, ttl)
	if err != nil {
		return err
	}
	c.SetCookie(&http.Cookie{
		Name:     sessionCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   int(ttl.Seconds()),
		HttpOnly: true,
		Secure:   s.config.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
	return nil
}

func (s *Server) clearCookie(c echo.Context, name string) {
	c.SetCookie(&http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   s.config.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
}

func getClientIP(c echo.Context) string {
	ip := c.RealIP()
	if ip == "" {
		ip = c.Request().RemoteAddr
	}
	// Strip port if present
	if idx := strings.LastIndex(ip, ":"); idx != -1 {
		ip = ip[:idx]
	}
	return ip
}

func toAuthUser(user *auth.User) *models.AuthUser {
	if user == nil {
		return nil
	}
	return &models.AuthUser{ID: user.ID, Email: user.Email}
}

func validEmail(email string) bool {
	if len(email) < 3 || len(email) > 254 || strings.Count(email, "@") != 1 {
		return false
	}
	parts := strings.Split(email, "@")
	return parts[0] != "" && parts[1] != "" && strings.Contains(parts[1], ".")
}

func allowedOrigins(origins []string) []string {
	if len(origins) == 0 {
		return []string{"http://localhost", "http://localhost:5173", "http://127.0.0.1:5173"}
	}
	return origins
}

func toStringSlice(v any) []string {
	if arr, ok := v.([]any); ok {
		result := make([]string, 0, len(arr))
		for _, item := range arr {
			z, ok := item.(string)
			if !ok {
				z = ""
			}
			result = append(result, z)
		}
		return result
	}
	return nil
}
