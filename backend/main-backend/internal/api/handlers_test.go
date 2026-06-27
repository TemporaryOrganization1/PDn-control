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
			"data": map[string]any{
				"pages": []any{"https://example.com/privacy"},
				"about": "HTTPS check",
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
	if results[1].Pages[0] != "/contact" || results[1].About != "Consent form check" {
		t.Fatalf("second result = %#v, want top-level fields", results[1])
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

	if got := allowedOrigins(nil); len(got) != 3 {
		t.Fatalf("default allowed origins length = %d, want 3", len(got))
	}
	custom := []string{"https://pdn2.neurolife.tech"}
	if got := allowedOrigins(custom); len(got) != 1 || got[0] != custom[0] {
		t.Fatalf("custom allowed origins = %#v, want %#v", got, custom)
	}
}
