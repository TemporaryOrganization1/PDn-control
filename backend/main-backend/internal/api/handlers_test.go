package api

import (
	"testing"

	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/models"
)

func TestValidEmail(t *testing.T) {
	tests := []struct {
		email string
		want  bool
	}{
		{email: "user@example.com", want: true},
		{email: "user.name+tag@example.co.uk", want: true},
		{email: "missing-domain@", want: false},
		{email: "@missing-local.test", want: false},
		{email: "missing-at.example.com", want: false},
		{email: "two@@example.com", want: false},
		{email: "user@example", want: false},
	}

	for _, tt := range tests {
		if got := validEmail(tt.email); got != tt.want {
			t.Fatalf("validEmail(%q) = %v, want %v", tt.email, got, tt.want)
		}
	}
}

func TestNormalizeResultsKeepsNestedPagesAndAbout(t *testing.T) {
	input := []any{
		map[string]any{
			"id":     "https",
			"result": "ok",
			"images": []any{"img-1"},
			"data": map[string]any{
				"pages": []any{"https://example.com/privacy"},
				"about": "HTTPS check",
				"extra": "kept",
			},
		},
		map[string]any{
			"id":     "forms",
			"result": "fail",
			"pages":  []any{"/contact"},
			"about":  "Consent form check",
		},
		"ignored",
	}

	results := normalizeResults(input)
	if len(results) != 2 {
		t.Fatalf("len(results) = %d, want 2", len(results))
	}
	if results[0].ID != "https" || results[0].Result != "ok" {
		t.Fatalf("first result = %#v, want https ok", results[0])
	}
	if len(results[0].Pages) != 1 || results[0].Pages[0] != "https://example.com/privacy" {
		t.Fatalf("first pages = %#v, want nested page", results[0].Pages)
	}
	if results[0].About != "HTTPS check" {
		t.Fatalf("first about = %q, want HTTPS check", results[0].About)
	}
	if len(results[0].Images) != 1 || results[0].Images[0] != "img-1" {
		t.Fatalf("first images = %#v, want img-1", results[0].Images)
	}
	if data, ok := results[0].Data.(map[string]any); !ok || data["extra"] != "kept" {
		t.Fatalf("first data = %#v, want preserved nested data", results[0].Data)
	}
	if results[1].Pages[0] != "/contact" || results[1].About != "Consent form check" {
		t.Fatalf("second result = %#v, want top-level fields", results[1])
	}
}

func TestNormalizeReportPayloadAcceptsWorkerObject(t *testing.T) {
	input := map[string]any{
		"checks": []any{
			map[string]any{
				"id":     "ssl/tls",
				"result": "ok",
				"pages":  []any{"https://example.com"},
				"about":  "SSL is valid",
				"images": []any{"img-ssl"},
				"data": map[string]any{
					"endpoints": map[string]any{"api.example.com": "ok"},
				},
			},
		},
		"screenshotId": "img-top",
		"ssl": map[string]any{
			"issuer":                  "Example CA",
			"validFrom":               float64(1700000000),
			"validTo":                 float64(2000000000),
			"protocol":                "TLS 1.3",
			"subjectName":             "example.com",
			"subjectAlternativeNames": []any{"example.com", "www.example.com"},
		},
		"about":   "About site",
		"country": "RU",
	}

	payload := normalizeReportPayload(input)
	if payload.ScreenshotID != "img-top" {
		t.Fatalf("screenshot = %q, want img-top", payload.ScreenshotID)
	}
	if payload.About != "About site" || payload.Country != "ru" {
		t.Fatalf("about/country = %q/%q, want About site/ru", payload.About, payload.Country)
	}
	if payload.SSL == nil || payload.SSL.Issuer != "Example CA" || len(payload.SSL.SubjectAlternativeNames) != 2 {
		t.Fatalf("ssl = %#v, want normalized ssl", payload.SSL)
	}
	if len(payload.Checks) != 1 {
		t.Fatalf("checks length = %d, want 1", len(payload.Checks))
	}
	check := payload.Checks[0]
	if check.ID != "ssl/tls" || check.Images[0] != "img-ssl" || check.Pages[0] != "https://example.com" || check.About != "SSL is valid" {
		t.Fatalf("check = %#v, want full normalized check", check)
	}
}

func TestProgressAndOriginHelpers(t *testing.T) {
	if !isFinalProgress(models.ProgressUpdate{Status: "completed"}) {
		t.Fatal("completed progress update should be final")
	}
	if !isFinalProgress(models.ProgressUpdate{Progress: 100}) {
		t.Fatal("100 percent progress update should be final")
	}
	if isFinalProgress(models.ProgressUpdate{Status: "running", Progress: 99}) {
		t.Fatal("running 99 percent progress update should not be final")
	}

	got := allowedOrigins(nil)
	if len(got) != 5 {
		t.Fatalf("default allowed origins length = %d, want 5", len(got))
	}
	foundNextDevOrigin := false
	for _, origin := range got {
		if origin == "http://localhost:8080" {
			foundNextDevOrigin = true
			break
		}
	}
	if !foundNextDevOrigin {
		t.Fatalf("default allowed origins = %#v, want localhost:8080", got)
	}
	custom := []string{"https://pdn2.neurolife.tech"}
	if got := allowedOrigins(custom); len(got) != 1 || got[0] != custom[0] {
		t.Fatalf("custom allowed origins = %#v, want %#v", got, custom)
	}
}
