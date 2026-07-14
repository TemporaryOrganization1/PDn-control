package store

import (
	"testing"

	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/entitlements"
)

func TestMemoryStoreTaskProgressAndResults(t *testing.T) {
	s := New()
	profile := entitlements.PaidProfile(10)
	task := s.Create("req-1", "https://example.com", "detail", "user:1", "owner@example.com", profile)
	if task.Status != "queued" || task.Progress != 0 {
		t.Fatalf("new task status/progress = %s/%d, want queued/0", task.Status, task.Progress)
	}
	if task.ScanProfile.Tier != entitlements.TierPaid || task.OwnerSubject != "user:1" {
		t.Fatalf("task entitlement snapshot = %#v, owner=%q", task.ScanProfile, task.OwnerSubject)
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
