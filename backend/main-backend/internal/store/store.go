package store

import (
	"log"
	"sync"
	"time"

	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/entitlements"
)

type Task struct {
	ReqID        string                   `json:"req-id"`
	URL          string                   `json:"url"`
	Type         string                   `json:"type"`
	Status       string                   `json:"status"`
	Worker       string                   `json:"worker,omitempty"`
	Progress     int                      `json:"progress"`
	Results      []Result                 `json:"results"`
	ScreenshotID string                   `json:"screenshotId,omitempty"`
	SSL          *SslInfo                 `json:"ssl,omitempty"`
	About        string                   `json:"about,omitempty"`
	Country      string                   `json:"country,omitempty"`
	Errors       []string                 `json:"errors"`
	ReportID     string                   `json:"report_id,omitempty"`
	CreatedAt    time.Time                `json:"created_at"`
	ScanProfile  entitlements.ScanProfile `json:"scan_profile"`
	OwnerSubject string                   `json:"-"`
	OwnerEmail   string                   `json:"-"`
}

type Result struct {
	ID     string   `json:"id"`
	Result string   `json:"result"`
	Pages  []string `json:"pages,omitempty"`
	About  string   `json:"about,omitempty"`
	Images []string `json:"images,omitempty"`
	Data   any      `json:"data,omitempty"`
}

type SslInfo struct {
	Issuer                  string   `json:"issuer"`
	ValidFrom               int64    `json:"validFrom"`
	ValidTo                 int64    `json:"validTo"`
	Protocol                string   `json:"protocol"`
	SubjectName             string   `json:"subjectName"`
	SubjectAlternativeNames []string `json:"subjectAlternativeNames"`
}

type ReportPayload struct {
	Checks       []Result `json:"checks"`
	ScreenshotID string   `json:"screenshotId,omitempty"`
	SSL          *SslInfo `json:"ssl,omitempty"`
	About        string   `json:"about,omitempty"`
	Country      string   `json:"country,omitempty"`
}

func PayloadFromResults(results []Result) ReportPayload {
	return ReportPayload{Checks: append([]Result(nil), results...)}
}

type MemoryStore struct {
	tasks map[string]*Task
	mu    sync.RWMutex
}

func New() *MemoryStore {
	return &MemoryStore{
		tasks: make(map[string]*Task),
	}
}

func (s *MemoryStore) Create(reqID, url, taskType, ownerSubject, ownerEmail string, profile entitlements.ScanProfile) *Task {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := &Task{
		ReqID:        reqID,
		URL:          url,
		Type:         taskType,
		Status:       "queued",
		Progress:     0,
		Results:      []Result{},
		Errors:       []string{},
		CreatedAt:    time.Now(),
		ScanProfile:  profile,
		OwnerSubject: ownerSubject,
		OwnerEmail:   ownerEmail,
	}
	s.tasks[reqID] = t
	return t
}

func (s *MemoryStore) Get(reqID string) *Task {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.tasks[reqID]
}

func (s *MemoryStore) SetReportID(reqID, reportID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[reqID]
	if !ok {
		return
	}
	t.ReportID = reportID
}

func (s *MemoryStore) UpdateProgress(reqID string, progress int, status string, completed []string, errors []string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[reqID]
	if !ok {
		return
	}
	t.Progress = progress
	if status != "" {
		t.Status = status
	}
	if len(errors) > 0 {
		t.Errors = append(t.Errors, errors...)
	}
	log.Printf("[Store] Task %s progress: %d%% status: %s", reqID, progress, status)
}

func (s *MemoryStore) AddResult(reqID string, r Result) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[reqID]
	if !ok {
		return
	}
	t.Results = append(t.Results, r)
}

func (s *MemoryStore) SetResults(reqID string, results []Result) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[reqID]
	if !ok {
		return
	}
	t.Results = append([]Result(nil), results...)
}

func (s *MemoryStore) SetReportPayload(reqID string, payload ReportPayload) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[reqID]
	if !ok {
		return
	}
	t.Results = append([]Result(nil), payload.Checks...)
	t.ScreenshotID = payload.ScreenshotID
	t.SSL = payload.SSL
	t.About = payload.About
	t.Country = payload.Country
}

func (s *MemoryStore) SetWorker(reqID, workerURL string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[reqID]
	if !ok {
		return
	}
	t.Worker = workerURL
	t.Status = "running"
}

func (s *MemoryStore) SetStatus(reqID, status string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.tasks[reqID]
	if !ok {
		return
	}
	t.Status = status
}

func (s *MemoryStore) GetWorker(reqID string) string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	t, ok := s.tasks[reqID]
	if !ok {
		return ""
	}
	return t.Worker
}
