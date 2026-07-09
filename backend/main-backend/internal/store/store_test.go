package store

import (
	"errors"
	"testing"
	"time"
)

func TestMemoryStoreGuestLimitAndExpiration(t *testing.T) {
	s := NewWithGuestConfig(10, 1)

	remaining, err := s.IncrementGuestCheck("203.0.113.10", 2)
	if err != nil {
		t.Fatalf("first guest check failed: %v", err)
	}
	if remaining != 1 {
		t.Fatalf("first remaining = %d, want 1", remaining)
	}

	remaining, err = s.IncrementGuestCheck("203.0.113.10", 2)
	if err != nil {
		t.Fatalf("second guest check failed: %v", err)
	}
	if remaining != 0 {
		t.Fatalf("second remaining = %d, want 0", remaining)
	}

	if _, err = s.IncrementGuestCheck("203.0.113.10", 2); !errors.Is(err, ErrGuestLimit) {
		t.Fatalf("third guest check error = %v, want ErrGuestLimit", err)
	}
	if remaining = s.GetGuestRemaining("203.0.113.10", 2); remaining != 0 {
		t.Fatalf("remaining after limit = %d, want 0", remaining)
	}

	s.mu.Lock()
	s.guestCache["203.0.113.10"].UpdatedAt = time.Now().Add(-2 * time.Minute)
	s.mu.Unlock()

	if remaining = s.GetGuestRemaining("203.0.113.10", 2); remaining != 2 {
		t.Fatalf("remaining after expiration = %d, want 2", remaining)
	}
}

func TestMemoryStoreEvictsOldestGuestWhenCacheIsFull(t *testing.T) {
	s := NewWithGuestConfig(1, 60)

	if _, err := s.IncrementGuestCheck("203.0.113.1", 3); err != nil {
		t.Fatalf("increment first guest: %v", err)
	}
	if _, err := s.IncrementGuestCheck("203.0.113.2", 3); err != nil {
		t.Fatalf("increment second guest: %v", err)
	}

	if remaining := s.GetGuestRemaining("203.0.113.1", 3); remaining != 3 {
		t.Fatalf("oldest guest remaining = %d, want reset limit 3 after eviction", remaining)
	}
	if remaining := s.GetGuestRemaining("203.0.113.2", 3); remaining != 2 {
		t.Fatalf("newest guest remaining = %d, want 2", remaining)
	}
}

func TestMemoryStoreTaskProgressAndResults(t *testing.T) {
	s := New()
	task := s.Create("req-1", "https://example.com", "detail")
	if task.Status != "queued" || task.Progress != 0 {
		t.Fatalf("new task status/progress = %s/%d, want queued/0", task.Status, task.Progress)
	}

	s.SetWorker("req-1", "http://worker:3000")
	s.UpdateProgress("req-1", 50, "running", []string{"https"}, []string{"warning"})
	s.SetReportPayload("req-1", ReportPayload{
		Checks:       []Result{{ID: "https", Result: "ok", Images: []string{"img-1"}}},
		ScreenshotID: "img-top",
		SSL:          &SslInfo{Issuer: "Example CA"},
		About:        "About site",
		Country:      "ru",
	})
	s.SetReportID("req-1", "report-1")

	got := s.Get("req-1")
	if got.Worker != "http://worker:3000" {
		t.Fatalf("worker = %q, want worker URL", got.Worker)
	}
	if got.Status != "running" || got.Progress != 50 {
		t.Fatalf("status/progress = %s/%d, want running/50", got.Status, got.Progress)
	}
	if len(got.Errors) != 1 || got.Errors[0] != "warning" {
		t.Fatalf("errors = %#v, want warning", got.Errors)
	}
	if len(got.Results) != 1 || got.Results[0].ID != "https" || got.Results[0].Images[0] != "img-1" {
		t.Fatalf("results = %#v, want https result", got.Results)
	}
	if got.ScreenshotID != "img-top" || got.SSL == nil || got.SSL.Issuer != "Example CA" || got.About != "About site" || got.Country != "ru" {
		t.Fatalf("payload fields = screenshot:%q ssl:%#v about:%q country:%q", got.ScreenshotID, got.SSL, got.About, got.Country)
	}
	if got.ReportID != "report-1" {
		t.Fatalf("report id = %q, want report-1", got.ReportID)
	}
}
