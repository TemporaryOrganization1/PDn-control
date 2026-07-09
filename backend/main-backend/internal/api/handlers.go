package api

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/auth"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/email"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/models"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/workerpool"
	"golang.org/x/crypto/bcrypt"
)

type Config struct {
	ServerPort               string   `json:"serverPort"`
	DatabaseURL              string   `json:"databaseUrl"`
	ReportsDir               string   `json:"reportsDir"`
	ImagesDir                string   `json:"imagesDir"`
	CookieSecure             bool     `json:"cookieSecure"`
	SessionTTLHours          int      `json:"sessionTtlHours"`
	GuestLimit               int      `json:"guestLimit"`
	GuestCacheMaxItems       int      `json:"guestCacheMaxItems"`
	GuestCacheTTLMinutes     int      `json:"guestCacheTTLMinutes"`
	WorkerSecret             string   `json:"workerSecret"`
	ImageSecret              string   `json:"imageSecret"`
	CleanupIntervalMinutes   int      `json:"cleanupIntervalMinutes"`
	PlanCheckIntervalMinutes int      `json:"planCheckIntervalMinutes"`
	AllowedOrigins           []string `json:"allowedOrigins"`
	Workers                  []Worker `json:"workers"`
}

type Worker struct {
	URL     string `json:"url"`
	MaxLoad int    `json:"maxLoad"`
}

type Server struct {
	echo      *echo.Echo
	store     *store.MemoryStore
	authStore *auth.Store
	emailSvc  *email.Service
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

	if cfg.ReportsDir == "" {
		cfg.ReportsDir = "/app/reports"
	}
	if cfg.ImagesDir == "" {
		cfg.ImagesDir = "/tmp/pdn-disk"
	}

	authStore, err := auth.NewStore(cfg.DatabaseURL, cfg.ReportsDir)
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

	emailSvc, err := email.NewService()
	if err != nil {
		log.Printf("[API] Warning: email service not configured: %v", err)
	}

	s := &Server{
		echo:      echo.New(),
		store:     store.NewWithGuestConfig(cfg.GuestCacheMaxItems, cfg.GuestCacheTTLMinutes),
		authStore: authStore,
		emailSvc:  emailSvc,
		pool:      workerpool.NewPool(workerDefs),
		config:    cfg,
	}

	s.echo.Use(middleware.Logger())
	s.echo.Use(middleware.Recover())
	s.echo.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     allowedOrigins(cfg.AllowedOrigins),
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))
	s.registerRoutes()

	// Start cleanup goroutine
	ctx := context.Background()
	go s.startCleanup(ctx)

	return s, nil
}

func (s *Server) IsEmailServiceConfigured() bool {
	return s.emailSvc != nil
}

func (s *Server) registerRoutes() {
	s.echo.POST("/api/auth/register", s.handleRegister)
	s.echo.POST("/api/auth/login", s.handleLogin)
	s.echo.POST("/api/auth/logout", s.handleLogout)
	s.echo.POST("/api/auth/change-password", s.handleChangePassword)
	s.echo.POST("/api/auth/delete-account", s.handleDeleteAccount)
	s.echo.GET("/api/auth/me", s.handleMe)
	s.echo.GET("/api/auth/verify", s.handleVerifyEmail)
	s.echo.POST("/api/check", s.handleCheck)
	s.echo.GET("/api/progress/:reqId", s.handleProgress)
	s.echo.GET("/api/reports", s.handleListReports)
	s.echo.GET("/api/reports/:reportId", s.handleDownloadReport)
	s.echo.DELETE("/api/reports/:reportId", s.handleDeleteReport)
	s.echo.POST("/api/progress", s.handleProgressUpdate)
	s.echo.GET("/api/workers", s.handleWorkerStatus)
	s.echo.GET("/api/health", s.handleHealth)
	s.echo.GET("/api/guest/remaining", s.handleGuestRemaining)
	s.echo.POST("/api/img/upload", s.handleImageUpload)
	s.echo.GET("/api/img/:id", s.handleImageGet)
	s.echo.POST("/api/subscription/change", s.handleSubscriptionChange)
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

	// If user exists but is not verified, delete and re-create
	user, err := s.authStore.CreateUser(c.Request().Context(), email, string(hash))
	if err != nil {
		if errors.Is(err, auth.ErrUserExists) {
			// Try to delete the unverified user and re-create
			log.Printf("[API] User %s already exists, checking if unverified for re-registration", email)
			if delErr := s.authStore.DeleteUnverifiedUser(c.Request().Context(), email); delErr != nil {
				log.Printf("[API] Cannot re-register %s: %v", email, delErr)
				return s.errResponse(c, http.StatusConflict, "ERR_EMAIL_EXISTS", "", "email already exists and is verified")
			}
			// Retry creating the user
			user, err = s.authStore.CreateUser(c.Request().Context(), email, string(hash))
			if err != nil {
				return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
			}
			log.Printf("[API] Re-registered user %s after deleting unverified account", email)
		} else {
			return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
		}
	}

	// Always create verification token (mandatory email verification)
	log.Printf("[API] Creating email verification for user %s (ID: %s)", user.Email, user.ID)
	token, err := s.authStore.CreateEmailVerification(c.Request().Context(), user.ID)
	if err != nil {
		log.Printf("[API] Failed to create email verification for %s: %v", user.Email, err)
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to create verification token")
	}

	// Try to send verification email if email service is configured
	if s.emailSvc != nil {
		log.Printf("[API] Email service configured, sending verification email to %s...", user.Email)
		go func(email, token string) {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[API] PANIC in email goroutine for %s: %v", email, r)
				}
			}()
			if err := s.emailSvc.SendVerificationEmail(email, token); err != nil {
				log.Printf("[API] Failed to send verification email to %s: %v", email, err)
			} else {
				log.Printf("[API] Verification email sent successfully to %s", email)
			}
		}(user.Email, token)
	} else {
		log.Println("[API] Email service not configured - user must verify through other means")
	}

	// DO NOT issue session - user must verify email first
	log.Printf("[API] Account created for %s - email verification required before login", user.Email)

	return c.JSON(http.StatusOK, map[string]any{
		"status":  "pending_verification",
		"message": "Account created. Please check your email to verify your account before logging in.",
		"user": map[string]any{
			"id":             user.ID,
			"email":          user.Email,
			"email_verified": user.EmailVerified,
			"created_at":     user.CreatedAt.Format(time.RFC3339),
		},
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

	// Check if email is verified
	if !user.EmailVerified {
		log.Printf("[API] Login attempt for unverified email: %s", user.Email)
		return s.errResponse(c, http.StatusForbidden, "ERR_EMAIL_NOT_VERIFIED", "", "please verify your email before logging in")
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

func (s *Server) handleDeleteAccount(c echo.Context) error {
	user := s.currentUser(c)
	if user == nil {
		return s.errResponse(c, http.StatusUnauthorized, "ERR_UNAUTHORIZED", "", "unauthorized")
	}

	if err := s.authStore.DeleteUser(c.Request().Context(), user.ID, user.Email); err != nil {
		log.Printf("[API] Failed to delete account %s (%s): %v", user.ID, user.Email, err)
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to delete account")
	}

	s.clearCookie(c, sessionCookieName)
	log.Printf("[API] Account deleted: %s (%s)", user.ID, user.Email)
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
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
		req.Fallback = "http://main-backend:4000/api"
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

	go s.dispatchTask(user, req, worker)

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

func (s *Server) handleListReports(c echo.Context) error {
	user := s.currentUser(c)
	if user == nil {
		return s.errResponse(c, http.StatusUnauthorized, "ERR_UNAUTHORIZED", "", "unauthorized")
	}

	history, err := s.authStore.CheckHistoryByEmail(c.Request().Context(), user.Email)
	if err != nil {
		log.Printf("[API] Failed to list check history for %s: %v", user.Email, err)
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}

	return c.JSON(http.StatusOK, history)
}

func (s *Server) handleDownloadReport(c echo.Context) error {
	user := s.currentUser(c)

	reportID := c.Param("reportId")
	report, err := s.authStore.ReportByID(c.Request().Context(), reportID)
	if err != nil {
		log.Printf("[API] Failed to get report %s: %v", reportID, err)
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}
	if report == nil {
		return s.errResponse(c, http.StatusNotFound, "ERR_NOT_FOUND", "", "report not found")
	}

	log.Printf("[API] Download attempt: user=%v, report_email=%s, report_id=%s",
		user != nil, report.Email, reportID)

	// Check authorization:
	// - Authenticated users can download their own reports or guest reports (empty email)
	// - Guest users (not logged in) can only download guest reports (empty email)
	if user != nil {
		// Authenticated user: allow if report belongs to them OR is a guest report
		if report.Email != "" && report.Email != user.Email {
			log.Printf("[API] Access denied: report belongs to %s, user is %s", report.Email, user.Email)
			return s.errResponse(c, http.StatusForbidden, "ERR_FORBIDDEN", "", "access denied")
		}
	} else {
		// Guest user: only allow guest reports
		if report.Email != "" {
			log.Printf("[API] Access denied: guest trying to access user report")
			return s.errResponse(c, http.StatusUnauthorized, "ERR_UNAUTHORIZED", "", "unauthorized")
		}
	}

	log.Printf("[API] Access granted for report %s", reportID)

	// Check if file exists
	if _, err := os.Stat(report.FilePath); os.IsNotExist(err) {
		log.Printf("[API] Report file not found: %s", report.FilePath)
		return s.errResponse(c, http.StatusNotFound, "ERR_NOT_FOUND", "", "report file not found")
	}

	c.Response().Header().Set(echo.HeaderContentType, "application/pdf")
	c.Response().Header().Set(echo.HeaderContentDisposition, fmt.Sprintf(`attachment; filename="%s"`, report.FileName))
	return c.File(report.FilePath)
}

func (s *Server) handleDeleteReport(c echo.Context) error {
	user := s.currentUser(c)
	if user == nil {
		return s.errResponse(c, http.StatusUnauthorized, "ERR_UNAUTHORIZED", "", "unauthorized")
	}

	reportID := c.Param("reportId")
	if reportID == "" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", "report id is required")
	}

	if err := s.authStore.DeleteReport(c.Request().Context(), user.Email, reportID); err != nil {
		if errors.Is(err, auth.ErrReportNotFound) {
			return s.errResponse(c, http.StatusNotFound, "ERR_NOT_FOUND", "", "report not found")
		}
		if errors.Is(err, auth.ErrReportForbidden) {
			return s.errResponse(c, http.StatusForbidden, "ERR_FORBIDDEN", "", "access denied")
		}
		log.Printf("[API] Failed to delete report %s for %s: %v", reportID, user.Email, err)
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to delete report")
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
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

func (s *Server) dispatchTask(user *auth.User, req models.CheckRequest, worker *workerpool.Worker) {
	defer s.pool.ReleaseWorker(worker)

	s.store.SetWorker(req.ReqID, worker.URL)
	s.store.UpdateProgress(req.ReqID, 10, "dispatched", nil, nil)

	// Pass user email to worker so it can be included in progress updates
	userEmail := ""
	if user != nil {
		userEmail = user.Email
	}

	task := map[string]string{
		"url":             req.URL,
		"type":            req.Type,
		"req-id":          req.ReqID,
		"fallback":        req.Fallback,
		"progress-secret": s.config.WorkerSecret,
		"user-email":      userEmail,
		"image-secret":    s.config.ImageSecret,
	}

	result, err := s.pool.SendTask(worker.URL, task)
	if err != nil {
		log.Printf("[API] Task %s failed on %s: %v", req.ReqID, worker.URL, err)
		s.store.UpdateProgress(req.ReqID, 0, "failed", nil, []string{err.Error()})
		return
	}
	log.Printf("[API] Task %s accepted by %s: %v", req.ReqID, worker.URL, result)
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

	payload := normalizeReportPayload(update.Data)
	results := payload.Checks
	if hasReportPayload(payload) {
		s.store.SetReportPayload(update.ReqID, payload)
	}
	if isFinalProgress(update) && len(results) > 0 {
		task := s.store.Get(update.ReqID)
		targetURL := ""
		checkType := ""
		existingReportID := ""
		if task != nil {
			targetURL = task.URL
			checkType = task.Type
			existingReportID = task.ReportID
		}

		s.store.SetReportPayload(update.ReqID, payload)

		email := auth.NormalizeEmail(update.UserEmail)
		historyReportID := ""
		if email != "" {
			history, err := s.authStore.SaveCheckHistory(c.Request().Context(), email, update.ReqID, targetURL, checkType, update.Status, payload)
			if err != nil {
				log.Printf("[API] Failed to save check history for %s: %v", update.ReqID, err)
			} else if history != nil {
				historyReportID = history.ReportID
				if history.ReportID != "" {
					s.store.SetReportID(update.ReqID, history.ReportID)
					existingReportID = history.ReportID
				}
			}
		}

		if existingReportID == "" && historyReportID == "" {
			log.Printf("[API] Saving PDF report: req=%s, email=%s, results=%d", update.ReqID, email, len(results))
			reportID, err := s.authStore.SaveReport(c.Request().Context(), email, targetURL, update.ReqID, payload)
			if err != nil {
				log.Printf("[API] Failed to save PDF report for progress update %s: %v", update.ReqID, err)
			} else {
				log.Printf("[API] PDF report saved for progress update %s: id=%s", update.ReqID, reportID)
				s.store.SetReportID(update.ReqID, reportID)
				if email != "" {
					if err := s.authStore.SetHistoryReportID(c.Request().Context(), update.ReqID, reportID); err != nil {
						log.Printf("[API] Failed to attach PDF report to history for %s: %v", update.ReqID, err)
					}
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

func (s *Server) handleVerifyEmail(c echo.Context) error {
	token := c.QueryParam("token")
	if token == "" {
		return c.JSON(http.StatusBadRequest, models.CheckResponse{
			Code: "ERR_INVALID_CREDENTIALS",
			Msg:  "verification token is required",
		})
	}

	userID, err := s.authStore.VerifyEmailByToken(c.Request().Context(), token)
	if err != nil {
		log.Printf("[API] Email verification failed: %v", err)
		return c.JSON(http.StatusBadRequest, models.CheckResponse{
			Code: "ERR_INVALID_CREDENTIALS",
			Msg:  "invalid or expired verification token",
		})
	}

	// Issue session so user is automatically logged in
	if err := s.issueSession(c, userID); err != nil {
		log.Printf("[API] Failed to issue session after verification: %v", err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status":  "verified",
		"message": "Email verified successfully",
	})
}

func (s *Server) handleSubscriptionChange(c echo.Context) error {
	user := s.currentUser(c)
	if user == nil {
		return s.errResponse(c, http.StatusUnauthorized, "ERR_UNAUTHORIZED", "", "unauthorized")
	}

	var req struct {
		Plan string `json:"plan"`
	}
	if err := c.Bind(&req); err != nil {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", err.Error())
	}

	if req.Plan != "free" && req.Plan != "paid" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INVALID_PLAN", "", "plan must be 'free' or 'paid'")
	}

	// Prevent downgrade from paid to free if plan_expires_at is in the future
	if req.Plan == "free" && user.Plan == "paid" && !user.PlanExpiresAt.IsZero() && user.PlanExpiresAt.After(time.Now()) {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INVALID_PLAN", "", "cannot downgrade while paid plan is active")
	}

	if err := s.authStore.ChangeUserPlan(c.Request().Context(), user.ID, req.Plan); err != nil {
		log.Printf("[API] Failed to change plan for user %s: %v", user.ID, err)
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to change plan")
	}

	log.Printf("[API] Plan changed for user %s (%s) to %s", user.ID, user.Email, req.Plan)
	return c.JSON(http.StatusOK, map[string]string{
		"status":  "ok",
		"message": fmt.Sprintf("Plan changed to %s", req.Plan),
	})
}

func (s *Server) handleImageUpload(c echo.Context) error {
	// Check image secret
	secret := c.Request().Header.Get("X-Image-Secret")
	if secret == "" {
		secret = c.QueryParam("secret")
	}
	if s.config.ImageSecret != "" && secret != s.config.ImageSecret {
		return s.errResponse(c, http.StatusForbidden, "ERR_FORBIDDEN", "", "invalid image secret")
	}

	const maxUploadSize = 15 << 20 // 15 MB

	// Limit request body size
	c.Request().Body = http.MaxBytesReader(c.Response(), c.Request().Body, maxUploadSize)

	// Parse multipart form
	if err := c.Request().ParseMultipartForm(maxUploadSize); err != nil {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", "file too large or invalid multipart form")
	}

	file, header, err := c.Request().FormFile("file")
	if err != nil {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", "file is required")
	}
	defer file.Close()

	reqID := c.FormValue("req-id")
	if reqID == "" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", "req-id is required")
	}

	// Validate MIME type
	contentType := header.Header.Get("Content-Type")
	if contentType != "image/jpeg" && contentType != "image/png" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", "only PNG and JPEG images are allowed")
	}

	// Read file data
	data, err := io.ReadAll(file)
	if err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to read file")
	}

	if len(data) > maxUploadSize {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", "file exceeds 15MB limit")
	}

	// Generate unique ID
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to generate ID")
	}
	imageID := hex.EncodeToString(buf)

	// Determine extension
	ext := ".jpg"
	if contentType == "image/png" {
		ext = ".png"
	}

	// Create subdirectory: /tmp/pdn-disk/{first_char}/
	firstChar := string(imageID[0])
	subDir := filepath.Join(s.config.ImagesDir, firstChar)
	if err := os.MkdirAll(subDir, 0755); err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to create storage directory")
	}

	// Save file: /tmp/pdn-disk/{first_char}/{id}.{ext}
	filePath := filepath.Join(subDir, imageID+ext)
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to save file")
	}

	// Save record in DB
	if err := s.authStore.SaveImage(c.Request().Context(), imageID, reqID, filePath); err != nil {
		os.Remove(filePath)
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", "failed to save image record")
	}

	log.Printf("[API] Image uploaded: id=%s req_id=%s size=%d type=%s", imageID, reqID, len(data), contentType)
	return c.JSON(http.StatusOK, map[string]string{
		"image_id": imageID,
	})
}

func (s *Server) handleImageGet(c echo.Context) error {
	imageID := c.Param("id")
	if imageID == "" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", "image id is required")
	}

	record, err := s.authStore.GetImage(c.Request().Context(), imageID)
	if err != nil {
		return s.errResponse(c, http.StatusInternalServerError, "ERR_INTERNAL", "", err.Error())
	}
	if record == nil {
		return s.errResponse(c, http.StatusNotFound, "ERR_NOT_FOUND", "", "image not found or expired")
	}

	// Check file exists
	if _, err := os.Stat(record.FilePath); os.IsNotExist(err) {
		return s.errResponse(c, http.StatusNotFound, "ERR_NOT_FOUND", "", "image file not found")
	}

	// Determine content type from extension
	contentType := "image/jpeg"
	if strings.HasSuffix(record.FilePath, ".png") {
		contentType = "image/png"
	}

	c.Response().Header().Set(echo.HeaderContentType, contentType)
	c.Response().Header().Set("Cache-Control", "private, max-age=3600")
	return c.File(record.FilePath)
}

func (s *Server) startCleanup(ctx context.Context) {
	cleanupInterval := time.Duration(s.config.CleanupIntervalMinutes) * time.Minute
	if cleanupInterval <= 0 {
		cleanupInterval = 10 * time.Minute
	}
	planCheckInterval := time.Duration(s.config.PlanCheckIntervalMinutes) * time.Minute
	if planCheckInterval <= 0 {
		planCheckInterval = 1 * time.Minute
	}

	cleanupTicker := time.NewTicker(cleanupInterval)
	planCheckTicker := time.NewTicker(planCheckInterval)
	defer cleanupTicker.Stop()
	defer planCheckTicker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-cleanupTicker.C:
			checksDeleted, imagesDeleted, err := s.authStore.CleanupExpiredData(ctx)
			if err != nil {
				log.Printf("[API] Failed to cleanup expired data: %v", err)
				continue
			}
			if checksDeleted > 0 || imagesDeleted > 0 {
				log.Printf("[API] Cleanup completed: %d checks and %d images deleted", checksDeleted, imagesDeleted)
			}
		case <-planCheckTicker.C:
			_, _, err := s.authStore.CleanupExpiredData(ctx)
			if err != nil {
				log.Printf("[API] Failed to check expired plans: %v", err)
			}
		}
	}
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
	planExpiresAt := ""
	if user.PlanExpiresAt != nil {
		planExpiresAt = user.PlanExpiresAt.Format(time.RFC3339)
	}
	return &models.AuthUser{
		ID:            user.ID,
		Email:         user.Email,
		CreatedAt:     user.CreatedAt.Format(time.RFC3339),
		Plan:          user.Plan,
		PlanExpiresAt: planExpiresAt,
	}
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
		return []string{"http://localhost", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080"}
	}
	return origins
}

func toStringSlice(v any) []string {
	switch arr := v.(type) {
	case []string:
		return append([]string(nil), arr...)
	case []any:
		result := make([]string, 0, len(arr))
		for _, item := range arr {
			result = append(result, fmt.Sprintf("%v", item))
		}
		return result
	}
	return nil
}

func toStringValue(v any) string {
	if v == nil {
		return ""
	}
	switch value := v.(type) {
	case string:
		return strings.TrimSpace(value)
	case fmt.Stringer:
		return strings.TrimSpace(value.String())
	default:
		text := strings.TrimSpace(fmt.Sprintf("%v", value))
		if text == "<nil>" {
			return ""
		}
		return text
	}
}

func toInt64Value(v any) int64 {
	switch value := v.(type) {
	case int:
		return int64(value)
	case int64:
		return value
	case int32:
		return int64(value)
	case float64:
		return int64(value)
	case float32:
		return int64(value)
	case json.Number:
		n, _ := value.Int64()
		return n
	case string:
		var n int64
		if _, err := fmt.Sscanf(value, "%d", &n); err == nil {
			return n
		}
	}
	return 0
}

func normalizeNullableString(v any) string {
	value := toStringValue(v)
	switch strings.ToLower(value) {
	case "", "null", "<nil>":
		return ""
	default:
		return value
	}
}

func normalizeCountry(v any) string {
	value := strings.ToLower(normalizeNullableString(v))
	if value == "localhost" {
		return "unknown"
	}
	return value
}

func normalizeSSLInfo(v any) *store.SslInfo {
	if v == nil {
		return nil
	}
	if info, ok := v.(*store.SslInfo); ok {
		return info
	}
	if info, ok := v.(store.SslInfo); ok {
		return &info
	}
	m, ok := v.(map[string]any)
	if !ok {
		return nil
	}

	info := &store.SslInfo{
		Issuer:                  normalizeNullableString(m["issuer"]),
		ValidFrom:               toInt64Value(m["validFrom"]),
		ValidTo:                 toInt64Value(m["validTo"]),
		Protocol:                normalizeNullableString(m["protocol"]),
		SubjectName:             normalizeNullableString(m["subjectName"]),
		SubjectAlternativeNames: toStringSlice(m["subjectAlternativeNames"]),
	}
	if info.Issuer == "" && info.ValidFrom == 0 && info.ValidTo == 0 && info.Protocol == "" && info.SubjectName == "" && len(info.SubjectAlternativeNames) == 0 {
		return nil
	}
	return info
}

func isFinalProgress(update models.ProgressUpdate) bool {
	return update.Status == "completed" || update.Progress >= 100
}

func hasReportPayload(payload store.ReportPayload) bool {
	return len(payload.Checks) > 0 || payload.ScreenshotID != "" || payload.SSL != nil || payload.About != "" || payload.Country != ""
}

func normalizeReportPayload(data any) store.ReportPayload {
	switch value := data.(type) {
	case nil:
		return store.ReportPayload{}
	case store.ReportPayload:
		return value
	case []store.Result:
		return store.PayloadFromResults(value)
	case []any:
		return store.PayloadFromResults(normalizeResultItems(value))
	case map[string]any:
		payload := store.ReportPayload{
			ScreenshotID: normalizeNullableString(value["screenshotId"]),
			SSL:          normalizeSSLInfo(value["ssl"]),
			About:        normalizeNullableString(value["about"]),
			Country:      normalizeCountry(value["country"]),
		}
		if checks, ok := value["checks"]; ok {
			payload.Checks = normalizeResultList(checks)
		}
		return payload
	default:
		return store.ReportPayload{}
	}
}

func normalizeResultList(data any) []store.Result {
	switch items := data.(type) {
	case []store.Result:
		return append([]store.Result(nil), items...)
	case []any:
		return normalizeResultItems(items)
	default:
		return nil
	}
}

func normalizeResultItems(items []any) []store.Result {
	results := make([]store.Result, 0, len(items))
	for _, item := range items {
		rm, ok := item.(map[string]any)
		if !ok {
			continue
		}

		dataMap, _ := rm["data"].(map[string]any)
		pages := toStringSlice(rm["pages"])
		if len(pages) == 0 && dataMap != nil {
			pages = toStringSlice(dataMap["pages"])
		}

		about, _ := rm["about"].(string)
		if about == "" && dataMap != nil {
			about, _ = dataMap["about"].(string)
		}
		images := toStringSlice(rm["images"])
		if len(images) == 0 && dataMap != nil {
			images = toStringSlice(dataMap["images"])
		}

		id := normalizeNullableString(rm["id"])
		if id == "" {
			continue
		}
		result := normalizeNullableString(rm["result"])
		if result == "" {
			result = "ok"
		}

		results = append(results, store.Result{
			ID:     id,
			Result: result,
			Pages:  pages,
			About:  about,
			Images: images,
			Data:   rm["data"],
		})
	}
	return results
}

func normalizeResults(data any) []store.Result {
	return normalizeReportPayload(data).Checks
}
