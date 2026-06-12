package store

import (
	"log"
	"sync"
	"time"
)

type Task struct {
	ReqID     string    `json:"req-id"`
	URL       string    `json:"url"`
	Type      string    `json:"type"`
	Status    string    `json:"status"`
	Worker    string    `json:"worker,omitempty"`
	Progress  int       `json:"progress"`
	Results   []Result  `json:"results"`
	Errors    []string  `json:"errors"`
	CreatedAt time.Time `json:"created_at"`
}

type Result struct {
	ID     string   `json:"id"`
	Result string   `json:"result"`
	Pages  []string `json:"pages,omitempty"`
	About  string   `json:"about,omitempty"`
	Data   any      `json:"data,omitempty"`
}

type MemoryStore struct {
	tasks map[string]*Task
	mu    sync.RWMutex
}

func New() *MemoryStore {
	return &MemoryStore{tasks: make(map[string]*Task)}
}

func (s *MemoryStore) Create(reqID, url, taskType string) *Task {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := &Task{
		ReqID:     reqID,
		URL:       url,
		Type:      taskType,
		Status:    "queued",
		Progress:  0,
		Results:   []Result{},
		Errors:    []string{},
		CreatedAt: time.Now(),
	}
	s.tasks[reqID] = t
	return t
}

func (s *MemoryStore) Get(reqID string) *Task {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.tasks[reqID]
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
