package store

import (
	"errors"
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

type guestEntry struct {
	Count     int       `json:"count"`
	UpdatedAt time.Time `json:"updated_at"`
}

var ErrGuestLimit = errors.New("guest check limit reached")

type MemoryStore struct {
	tasks      map[string]*Task
	guestCache map[string]*guestEntry
	guestOrder []string // FIFO order for eviction
	maxItems   int
	ttl        time.Duration
	mu         sync.RWMutex
}

func New() *MemoryStore {
	return &MemoryStore{
		tasks:      make(map[string]*Task),
		guestCache: make(map[string]*guestEntry),
		guestOrder: make([]string, 0),
		maxItems:   0, // 0 means unlimited
		ttl:        24 * time.Hour,
	}
}

func NewWithGuestConfig(maxItems int, ttlMinutes int) *MemoryStore {
	ttl := time.Duration(ttlMinutes) * time.Minute
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}
	return &MemoryStore{
		tasks:      make(map[string]*Task),
		guestCache: make(map[string]*guestEntry),
		guestOrder: make([]string, 0),
		maxItems:   maxItems,
		ttl:        ttl,
	}
}

// evictExpired removes all expired guest entries.
func (s *MemoryStore) evictExpired() {
	now := time.Now()
	remaining := make([]string, 0, len(s.guestOrder))
	for _, ip := range s.guestOrder {
		entry, exists := s.guestCache[ip]
		if !exists || now.After(entry.UpdatedAt.Add(s.ttl)) {
			delete(s.guestCache, ip)
		} else {
			remaining = append(remaining, ip)
		}
	}
	s.guestOrder = remaining
}

// evictIfNeeded removes the oldest guest entries if maxItems is exceeded.
func (s *MemoryStore) evictIfNeeded() {
	if s.maxItems <= 0 {
		return
	}
	for len(s.guestOrder) > s.maxItems {
		oldest := s.guestOrder[0]
		s.guestOrder = s.guestOrder[1:]
		delete(s.guestCache, oldest)
	}
}

// GetGuestRemaining returns the number of remaining attempts for an IP.
func (s *MemoryStore) GetGuestRemaining(ip string, limit int) int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	entry, exists := s.guestCache[ip]
	if !exists {
		return limit
	}

	// Check if entry is expired
	if time.Now().After(entry.UpdatedAt.Add(s.ttl)) {
		return limit
	}

	remaining := limit - entry.Count
	if remaining < 0 {
		remaining = 0
	}
	return remaining
}

// IncrementGuestCheck increments the check count for an IP. Returns remaining attempts or error if limit reached.
func (s *MemoryStore) IncrementGuestCheck(ip string, limit int) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Expire old entries first
	s.evictExpired()

	entry, exists := s.guestCache[ip]
	if !exists {
		// New IP — track in FIFO order
		s.guestOrder = append(s.guestOrder, ip)
		entry = &guestEntry{Count: 0, UpdatedAt: time.Now()}
		s.guestCache[ip] = entry
	}

	// Check if entry is expired (shouldn't happen after evictExpired, but safety check)
	if time.Now().After(entry.UpdatedAt.Add(s.ttl)) {
		entry.Count = 0
	}

	if entry.Count >= limit {
		return 0, ErrGuestLimit
	}

	entry.Count++
	entry.UpdatedAt = time.Now()

	// Evict if cache is too large
	s.evictIfNeeded()

	remaining := limit - entry.Count
	if remaining < 0 {
		remaining = 0
	}
	return remaining, nil
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
