package workerpool

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestPoolCapacityAndRelease(t *testing.T) {
	p := NewPool([]struct {
		URL     string
		MaxLoad int
	}{
		{URL: "http://worker-a", MaxLoad: 2},
		{URL: "http://worker-b", MaxLoad: 1},
	})

	first := p.GetFreeWorker()
	second := p.GetFreeWorker()
	third := p.GetFreeWorker()
	fourth := p.GetFreeWorker()

	if first == nil || second == nil || third == nil {
		t.Fatalf("expected three workers to be reserved")
	}
	if fourth != nil {
		t.Fatalf("expected no free worker after max capacity, got %#v", fourth)
	}
	if got := p.GetAvailableCount(); got != 0 {
		t.Fatalf("available count = %d, want 0", got)
	}

	p.ReleaseWorker(first)
	if got := p.GetAvailableCount(); got != 1 {
		t.Fatalf("available count after release = %d, want 1", got)
	}
}

func TestPoolSendTaskPostsJSONToWorker(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/check" {
			t.Fatalf("path = %q, want /check", r.URL.Path)
		}
		if r.Method != http.MethodPost {
			t.Fatalf("method = %q, want POST", r.Method)
		}

		var task map[string]string
		if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
			t.Fatalf("decode task: %v", err)
		}
		if task["url"] != "https://example.com" || task["type"] != "detail" {
			t.Fatalf("task = %#v, want url and type", task)
		}

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"accepted"}`))
	}))
	defer server.Close()

	p := NewPool(nil)
	result, err := p.SendTask(server.URL, map[string]string{
		"url":  "https://example.com",
		"type": "detail",
	})
	if err != nil {
		t.Fatalf("SendTask failed: %v", err)
	}
	if result["status"] != "accepted" {
		t.Fatalf("result = %#v, want accepted status", result)
	}
}

func TestPoolSendTaskReturnsStatusError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "busy", http.StatusServiceUnavailable)
	}))
	defer server.Close()

	p := NewPool(nil)
	if _, err := p.SendTask(server.URL, map[string]string{"url": "https://example.com"}); err == nil {
		t.Fatal("SendTask error = nil, want worker status error")
	}
}
