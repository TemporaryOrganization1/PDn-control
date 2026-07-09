package auth

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
)

func TestDecodeReportPayloadSupportsLegacyAndObjectJSON(t *testing.T) {
	legacy, err := decodeReportPayload([]byte(`[{"id":"https","result":"ok","images":["img-1"]}]`))
	if err != nil {
		t.Fatalf("decode legacy payload: %v", err)
	}
	if len(legacy.Checks) != 1 || legacy.Checks[0].Images[0] != "img-1" {
		t.Fatalf("legacy payload = %#v, want check with image", legacy)
	}

	current, err := decodeReportPayload([]byte(`{
		"checks":[{"id":"ssl/tls","result":"warn","pages":["/"],"about":"SSL warning","images":["img-2"],"data":{"x":1}}],
		"screenshotId":"img-top",
		"ssl":{"issuer":"Example CA","validFrom":1700000000,"validTo":2000000000,"protocol":"TLS 1.3","subjectName":"example.com","subjectAlternativeNames":["example.com"]},
		"about":"About site",
		"country":"ru"
	}`))
	if err != nil {
		t.Fatalf("decode current payload: %v", err)
	}
	if current.ScreenshotID != "img-top" || current.SSL == nil || current.Country != "ru" || current.Checks[0].Images[0] != "img-2" {
		t.Fatalf("current payload = %#v, want full report payload", current)
	}
}

func testStore(t *testing.T) (*Store, context.Context) {
	t.Helper()
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is not set")
	}
	t.Setenv("PDF_FONT_DIR", "../pdfGen")
	s, err := NewStore(databaseURL, t.TempDir())
	if err != nil {
		t.Fatalf("create auth store: %v", err)
	}
	t.Cleanup(func() { _ = s.Close() })
	return s, context.Background()
}

func TestReportLifecycleWithDatabase(t *testing.T) {
	s, ctx := testStore(t)
	email := "report-lifecycle-" + NewPublicID() + "@example.com"
	if _, err := s.CreateUser(ctx, email, "hash"); err != nil {
		t.Fatalf("create user: %v", err)
	}

	reqID := "req-" + NewPublicID()
	imagePath := filepath.Join(t.TempDir(), "evidence.png")
	if err := os.WriteFile(imagePath, []byte("not a real image but enough for lifecycle deletion"), 0644); err != nil {
		t.Fatalf("write image file: %v", err)
	}
	if err := s.SaveImage(ctx, "img-"+NewPublicID(), reqID, imagePath); err != nil {
		t.Fatalf("save image: %v", err)
	}

	payload := store.ReportPayload{
		About:   "About site",
		Country: "ru",
		Checks:  []store.Result{{ID: "https", Result: "ok"}},
	}
	history, err := s.SaveCheckHistory(ctx, email, reqID, "https://example.com", "detail", "completed", payload)
	if err != nil {
		t.Fatalf("save check history: %v", err)
	}
	var checkID string
	if err := s.db.QueryRowContext(ctx, `SELECT COALESCE(check_id, '') FROM check_images WHERE req_id = $1`, reqID).Scan(&checkID); err != nil {
		t.Fatalf("query image check id: %v", err)
	}
	if checkID != history.ID {
		t.Fatalf("image check_id = %q, want %q", checkID, history.ID)
	}

	reportID, err := s.SaveReport(ctx, email, "https://example.com", reqID, payload)
	if err != nil {
		t.Fatalf("save report: %v", err)
	}
	duplicateID, err := s.SaveReport(ctx, email, "https://example.com", reqID, payload)
	if err != nil {
		t.Fatalf("save duplicate report: %v", err)
	}
	if duplicateID != reportID {
		t.Fatalf("duplicate report id = %q, want %q", duplicateID, reportID)
	}
	if err := s.SetHistoryReportID(ctx, reqID, reportID); err != nil {
		t.Fatalf("set history report id: %v", err)
	}

	report, err := s.ReportByID(ctx, reportID)
	if err != nil {
		t.Fatalf("query report: %v", err)
	}
	if report == nil {
		t.Fatal("report not found after save")
	}
	if err := s.DeleteReport(ctx, email, reportID); err != nil {
		t.Fatalf("delete report: %v", err)
	}
	if _, err := os.Stat(report.FilePath); !os.IsNotExist(err) {
		t.Fatalf("report file still exists or stat failed unexpectedly: %v", err)
	}
	if _, err := os.Stat(imagePath); !os.IsNotExist(err) {
		t.Fatalf("image file still exists or stat failed unexpectedly: %v", err)
	}
}

func TestCleanupExpiredDataDeletesPDFAndImages(t *testing.T) {
	s, ctx := testStore(t)
	email := "cleanup-" + NewPublicID() + "@example.com"
	if _, err := s.CreateUser(ctx, email, "hash"); err != nil {
		t.Fatalf("create user: %v", err)
	}

	reqID := "req-" + NewPublicID()
	imagePath := filepath.Join(t.TempDir(), "evidence.png")
	if err := os.WriteFile(imagePath, []byte("cleanup image"), 0644); err != nil {
		t.Fatalf("write image file: %v", err)
	}
	if err := s.SaveImage(ctx, "img-"+NewPublicID(), reqID, imagePath); err != nil {
		t.Fatalf("save image: %v", err)
	}
	payload := store.ReportPayload{Checks: []store.Result{{ID: "https", Result: "ok"}}}
	if _, err := s.SaveCheckHistory(ctx, email, reqID, "https://example.com", "detail", "completed", payload); err != nil {
		t.Fatalf("save history: %v", err)
	}
	reportID, err := s.SaveReport(ctx, email, "https://example.com", reqID, payload)
	if err != nil {
		t.Fatalf("save report: %v", err)
	}
	if err := s.SetHistoryReportID(ctx, reqID, reportID); err != nil {
		t.Fatalf("set report id: %v", err)
	}
	report, err := s.ReportByID(ctx, reportID)
	if err != nil || report == nil {
		t.Fatalf("query report: report=%#v err=%v", report, err)
	}
	if _, err := s.db.ExecContext(ctx, `UPDATE check_history SET expires_at = $1 WHERE req_id = $2`, time.Now().Add(-time.Hour), reqID); err != nil {
		t.Fatalf("expire history: %v", err)
	}

	checks, images, err := s.CleanupExpiredData(ctx)
	if err != nil {
		t.Fatalf("cleanup: %v", err)
	}
	if checks == 0 || images == 0 {
		t.Fatalf("cleanup deleted checks/images = %d/%d, want both > 0", checks, images)
	}
	if _, err := os.Stat(report.FilePath); !os.IsNotExist(err) {
		t.Fatalf("report file still exists or stat failed unexpectedly: %v", err)
	}
	if _, err := os.Stat(imagePath); !os.IsNotExist(err) {
		t.Fatalf("image file still exists or stat failed unexpectedly: %v", err)
	}
}
