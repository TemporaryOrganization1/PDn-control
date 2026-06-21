package api

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/models"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/workerpool"
)

type Config struct {
	ServerPort    string   `json:"serverPort"`
	Secret        string   `json:"secret"`
	JWTSecret     string   `json:"jwtSecret"`
	Workers       []Worker `json:"workers"`
	GuestMaxChecks int     `json:"guestMaxChecks"`
}

type Worker struct {
	URL     string `json:"url"`
	MaxLoad int    `json:"maxLoad"`
}

type Server struct {
	echo   *echo.Echo
	store  *store.MemoryStore
	pool   *workerpool.Pool
	config Config
	mu     sync.RWMutex
}

func NewServer(cfg Config) *Server {
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
		echo:   echo.New(),
		store:  store.New(),
		pool:   workerpool.NewPool(workerDefs),
		config: cfg,
	}

	s.echo.Use(middleware.Logger())
	s.echo.Use(middleware.Recover())
	s.echo.Use(middleware.CORS())
	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	s.echo.POST("/api/check", s.handleCheck)
	s.echo.GET("/api/progress/:reqId", s.handleProgress)
	s.echo.POST("/api/progress", s.handleProgressUpdate)
	s.echo.GET("/api/workers", s.handleWorkerStatus)
	s.echo.GET("/api/health", s.handleHealth)
}

func (s *Server) Start() error {
	log.Printf("[API] Listening on %s", s.config.ServerPort)
	return s.echo.Start(":" + s.config.ServerPort)
}

func (s *Server) Shutdown() error {
	return s.echo.Close()
}

// jwtClaims represents the JWT claims structure for authentication.
type jwtClaims struct {
	UserID  int64  `json:"user_id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Surname string `json:"surname"`
	jwt.RegisteredClaims
}

func (s *Server) handleCheck(c echo.Context) error {
	var req models.CheckRequest
	fmt.Println(req.Secret, "secret key")
	if err := c.Bind(&req); err != nil {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INTERNAL", "", err.Error())
	}

	if req.Secret != s.config.Secret {
		return s.errResponse(c, http.StatusUnauthorized, "ERR_UNAUTHORIZED", req.ReqID, "invalid secret")
	}

	if req.URL == "" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INVALID_URL", req.ReqID, "url is required")
	}

	if req.Type != "fast" && req.Type != "detail" {
		return s.errResponse(c, http.StatusBadRequest, "ERR_INVALID_TYPE", req.ReqID, "type must be 'fast' or 'detail'")
	}

	// Check if request is from an authenticated user (has JWT)
	authHeader := c.Request().Header.Get("Authorization")
	isAuthenticated := false
	log.Printf("[API] Auth header present: %v, JWTSecret configured: %v", authHeader != "", s.config.JWTSecret != "")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && parts[0] == "Bearer" && s.config.JWTSecret != "" {
			tokenStr := parts[1]
			claims := &jwtClaims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(s.config.JWTSecret), nil
			})
			if err != nil {
				log.Printf("[API] JWT validation error: %v", err)
			}
			if err == nil && token.Valid {
				isAuthenticated = true
				log.Printf("[API] JWT valid, user authenticated: user_id=%d", claims.UserID)
			}
		} else {
			log.Printf("[API] Auth header malformed or JWT secret empty: parts_len=%d, bearer=%v, secret_empty=%v",
				len(parts), len(parts) == 2 && parts[0] == "Bearer", s.config.JWTSecret == "")
		}
	}

	// Enforce guest check limit for unauthenticated users
	if !isAuthenticated {
		// Get client IP
		clientIP := c.RealIP()
		if clientIP == "" {
			clientIP = c.Request().RemoteAddr
		}

		guestMax := s.config.GuestMaxChecks
		if guestMax <= 0 {
			guestMax = 3 // default limit
		}

		currentCount := s.store.GetGuestCheckCount(clientIP)
		if currentCount >= guestMax {
			return s.errResponse(c, http.StatusForbidden, "ERR_GUEST_LIMIT_REACHED", req.ReqID,
				"Лимит бесплатных проверок исчерпан. Войдите в аккаунт для продолжения.")
		}
	}

	if req.ReqID == "" {
		req.ReqID = fmt.Sprintf("req-%d", time.Now().UnixMilli())
	}
	if req.Fallback == "" {
		req.Fallback = fmt.Sprintf("http://main-backend:4000/api/progress")
	}

	worker := s.pool.GetFreeWorker()
	if worker == nil {
		return s.errResponse(c, http.StatusServiceUnavailable, "ERR_WORKER_UNAVAILABLE", req.ReqID, "no workers available")
	}

	s.store.Create(req.ReqID, req.URL, req.Type)
	s.store.UpdateProgress(req.ReqID, 0, "queued", nil, nil)

	// Increment guest counter only after successful dispatch
	if !isAuthenticated {
		clientIP := c.RealIP()
		if clientIP == "" {
			clientIP = c.Request().RemoteAddr
		}
		s.store.IncrementGuestCheckCount(clientIP)
	}

	go s.dispatchTask(req, worker)

	return c.JSON(http.StatusOK, models.CheckResponse{
		Code:  "ERR_OK",
		ReqID: req.ReqID,
		Data:  map[string]string{"status": "accepted", "req-id": req.ReqID},
	})
}

func (s *Server) dispatchTask(req models.CheckRequest, worker *workerpool.Worker) {
	defer s.pool.ReleaseWorker(worker)

	s.store.SetWorker(req.ReqID, worker.URL)
	s.store.UpdateProgress(req.ReqID, 10, "dispatched", nil, nil)

	task := map[string]string{
		"url":      req.URL,
		"type":     req.Type,
		"req-id":   req.ReqID,
		"fallback": req.Fallback,
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
