package api

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/models"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/workerpool"
)

type Config struct {
	ServerPort string   `json:"serverPort"`
	Secret     string   `json:"secret"`
	Workers    []Worker `json:"workers"`
}

type Worker struct {
	URL     string `json:"url"`
	MaxLoad int    `json:"maxLoad"`
}

type Server struct {
	echo     *echo.Echo
	store    *store.MemoryStore
	pool     *workerpool.Pool
	config   Config
	mu       sync.RWMutex
}

func NewServer(cfg Config) *Server {
	workerDefs := make([]struct{ URL string; MaxLoad int }, len(cfg.Workers))
	for i, w := range cfg.Workers {
		workerDefs[i] = struct{ URL string; MaxLoad int }{URL: w.URL, MaxLoad: w.MaxLoad}
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

func (s *Server) handleCheck(c echo.Context) error {
	var req models.CheckRequest
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

	s.store.Create(req.URL, req.URL, req.Type)
	s.store.UpdateProgress(req.ReqID, 0, "queued", nil, nil)

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
					s.store.AddResult(req.ReqID, store.Result{
						ID:     fmt.Sprintf("%v", crMap["id"]),
						Result: fmt.Sprintf("%v", crMap["result"]),
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
					s.store.AddResult(update.ReqID, store.Result{
						ID:     fmt.Sprintf("%v", rm["id"]),
						Result: fmt.Sprintf("%v", rm["result"]),
						Pages:  toStringSlice(rm["pages"]),
						About:  fmt.Sprintf("%v", rm["about"]),
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
			result = append(result, fmt.Sprintf("%v", item))
		}
		return result
	}
	return nil
}