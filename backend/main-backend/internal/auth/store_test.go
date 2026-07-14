package auth

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/entitlements"
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
	imageID := "img-" + NewPublicID()
	if err := s.SaveImage(ctx, imageID, reqID, imagePath); err != nil {
		t.Fatalf("save image: %v", err)
	}

	payload := store.ReportPayload{
		About:   "About site",
		Country: "ru",
		Checks:  []store.Result{{ID: "https", Result: "ok"}},
	}
	history, err := s.SaveCheckHistory(ctx, email, reqID, "https://example.com", "detail", "completed", payload, entitlements.PaidProfile(10))
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
	allowed, err := s.ImageBelongsToEmail(ctx, imageID, email)
	if err != nil || !allowed {
		t.Fatalf("paid-origin image ownership = %v, err=%v, want owner access", allowed, err)
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

func TestPaidHistoryKeepsScanProfileAfterAccountDowngrade(t *testing.T) {
	s, ctx := testStore(t)
	email := "paid-snapshot-" + NewPublicID() + "@example.com"
	user, err := s.CreateUser(ctx, email, "hash")
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	if err := s.ChangeUserPlan(ctx, user.ID, entitlements.TierPaid, 10*time.Minute); err != nil {
		t.Fatalf("enable paid plan: %v", err)
	}

	reqID := "req-" + NewPublicID()
	profile := entitlements.PaidProfile(10)
	if _, err := s.SaveCheckHistory(ctx, email, reqID, "https://example.com", "detail", "completed", store.ReportPayload{
		Checks: []store.Result{{ID: "https", Result: "ok"}},
	}, profile); err != nil {
		t.Fatalf("save paid history: %v", err)
	}
	if err := s.ChangeUserPlan(ctx, user.ID, entitlements.TierFree, 0); err != nil {
		t.Fatalf("downgrade account: %v", err)
	}

	history, err := s.CheckHistoryByEmail(ctx, email)
	if err != nil {
		t.Fatalf("query history: %v", err)
	}
	if len(history) != 1 {
		t.Fatalf("history length = %d, want 1", len(history))
	}
	if history[0].ScanProfile != profile {
		t.Fatalf("stored profile = %#v, want %#v", history[0].ScanProfile, profile)
	}
	var expiresAt any
	if err := s.db.QueryRowContext(ctx, `SELECT expires_at FROM check_history WHERE req_id = $1`, reqID).Scan(&expiresAt); err != nil {
		t.Fatalf("query retention: %v", err)
	}
	if expiresAt != nil {
		t.Fatalf("paid-origin history expires_at = %#v, want NULL", expiresAt)
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
	if _, err := s.SaveCheckHistory(ctx, email, reqID, "https://example.com", "detail", "completed", payload, entitlements.FreeProfile(entitlements.TierFree, 3)); err != nil {
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

func TestScanQuotaUsesRollingWindowAndTransfersGuestUsage(t *testing.T) {
	s, ctx := testStore(t)
	guestSubject := "guest:" + NewPublicID()
	userSubject := "user:" + NewPublicID()

	if _, err := s.db.ExecContext(ctx, `
		INSERT INTO scan_usage_events (id, subject_key, accepted_at)
		VALUES ($1, $3, NOW() - INTERVAL '31 days'), ($2, $3, NOW() - INTERVAL '2 days')
	`, NewPublicID(), NewPublicID(), guestSubject); err != nil {
		t.Fatalf("seed scan usage: %v", err)
	}

	quota, err := s.ScanQuota(ctx, guestSubject, entitlements.TierGuest, 3, 30)
	if err != nil {
		t.Fatalf("query guest quota: %v", err)
	}
	if quota.Used != 1 || quota.Remaining != 2 {
		t.Fatalf("guest quota = %#v, want one event inside rolling window", quota)
	}

	if err := s.TransferScanUsage(ctx, guestSubject, userSubject); err != nil {
		t.Fatalf("transfer guest usage: %v", err)
	}
	quota, err = s.ScanQuota(ctx, userSubject, entitlements.TierFree, 3, 30)
	if err != nil {
		t.Fatalf("query transferred quota: %v", err)
	}
	if quota.Used != 1 || quota.Remaining != 2 {
		t.Fatalf("transferred quota = %#v, want guest event on account", quota)
	}
	guestQuota, err := s.ScanQuota(ctx, guestSubject, entitlements.TierGuest, 3, 30)
	if err != nil {
		t.Fatalf("query old guest quota: %v", err)
	}
	if guestQuota.Used != 0 {
		t.Fatalf("old guest quota used = %d, want 0", guestQuota.Used)
	}
}

func TestConsumeScanAttemptIsAtomic(t *testing.T) {
	s, ctx := testStore(t)
	subject := "user:" + NewPublicID()
	const attempts = 12

	var wg sync.WaitGroup
	var mu sync.Mutex
	succeeded := 0
	limited := 0
	unexpected := make([]error, 0)
	for range attempts {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_, err := s.ConsumeScanAttempt(ctx, subject, entitlements.TierFree, 3, 30)
			mu.Lock()
			defer mu.Unlock()
			switch {
			case err == nil:
				succeeded++
			case errors.Is(err, ErrScanLimit):
				limited++
			default:
				unexpected = append(unexpected, err)
			}
		}()
	}
	wg.Wait()

	if len(unexpected) > 0 {
		t.Fatalf("unexpected quota errors: %v", unexpected)
	}
	if succeeded != 3 || limited != attempts-3 {
		t.Fatalf("success/limited = %d/%d, want 3/%d", succeeded, limited, attempts-3)
	}
	quota, err := s.ScanQuota(ctx, subject, entitlements.TierFree, 3, 30)
	if err != nil {
		t.Fatalf("query final quota: %v", err)
	}
	if quota.Used != 3 || quota.Remaining != 0 || quota.NextAvailableAt == nil {
		t.Fatalf("final quota = %#v, want exhausted quota with next availability", quota)
	}
}
