package workerpool

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"
)

type Worker struct {
	URL     string `json:"url"`
	MaxLoad int    `json:"maxLoad"`
	busy    int
	mu      sync.Mutex
}

type Pool struct {
	workers []*Worker
	client  *http.Client
	mu      sync.RWMutex
}

func NewPool(workerURLs []struct{ URL string; MaxLoad int }) *Pool {
	workers := make([]*Worker, len(workerURLs))
	for i, w := range workerURLs {
		workers[i] = &Worker{URL: w.URL, MaxLoad: w.MaxLoad}
	}
	return &Pool{
		workers: workers,
		client:  &http.Client{Timeout: 120 * time.Second},
	}
}

func (p *Pool) GetFreeWorker() *Worker {
	p.mu.RLock()
	defer p.mu.RUnlock()
	for _, w := range p.workers {
		w.mu.Lock()
		if w.busy < w.MaxLoad {
			w.busy++
			w.mu.Unlock()
			return w
		}
		w.mu.Unlock()
	}
	return nil
}

func (p *Pool) ReleaseWorker(w *Worker) {
	w.mu.Lock()
	if w.busy > 0 {
		w.busy--
	}
	w.mu.Unlock()
}

func (p *Pool) GetAvailableCount() int {
	p.mu.RLock()
	defer p.mu.RUnlock()
	count := 0
	for _, w := range p.workers {
		w.mu.Lock()
		if w.busy < w.MaxLoad {
			count++
		}
		w.mu.Unlock()
	}
	return count
}

func (p *Pool) SendTask(workerURL string, task map[string]string) (map[string]any, error) {
	body, err := json.Marshal(task)
	if err != nil {
		return nil, fmt.Errorf("marshal task: %w", err)
	}

	resp, err := p.client.Post(workerURL+"/check", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("send task to %s: %w", workerURL, err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("worker returned status %d: %s", resp.StatusCode, string(respBody))
	}

	var result map[string]any
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}

	log.Printf("[Pool] Task sent to %s", workerURL)
	return result, nil
}