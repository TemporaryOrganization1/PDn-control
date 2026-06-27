package downloader

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestDownloadMMDBWritesSuccessfulResponseAtomically(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/20260605/GeoLite2-Country.mmdb" {
			t.Fatalf("path = %q, want release MMDB path", r.URL.Path)
		}
		if got := r.Header.Get("User-Agent"); got != "geoip-service/1.0" {
			t.Fatalf("User-Agent = %q, want geoip-service/1.0", got)
		}
		_, _ = w.Write([]byte("mmdb-content"))
	}))
	defer server.Close()

	dest := filepath.Join(t.TempDir(), "nested", "GeoLite2-Country.mmdb")
	if err := DownloadMMDB(context.Background(), server.URL, "20260605", dest); err != nil {
		t.Fatalf("DownloadMMDB failed: %v", err)
	}

	content, err := os.ReadFile(dest)
	if err != nil {
		t.Fatalf("read downloaded file: %v", err)
	}
	if string(content) != "mmdb-content" {
		t.Fatalf("downloaded content = %q, want mmdb-content", string(content))
	}
	if _, err := os.Stat(dest + ".tmp"); !os.IsNotExist(err) {
		t.Fatalf("temporary file still exists or stat failed: %v", err)
	}
}

func TestDownloadMMDBReturnsErrorOnNonOKStatus(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "missing", http.StatusNotFound)
	}))
	defer server.Close()

	dest := filepath.Join(t.TempDir(), "GeoLite2-Country.mmdb")
	if err := DownloadMMDB(context.Background(), server.URL, "missing", dest); err == nil {
		t.Fatal("DownloadMMDB error = nil, want non-OK status error")
	}
	if _, err := os.Stat(dest); !os.IsNotExist(err) {
		t.Fatalf("destination file exists after failed download or stat failed: %v", err)
	}
}
