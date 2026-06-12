package downloader

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func DownloadMMDB(ctx context.Context, baseURL, tag, destPath string) error {
	url := fmt.Sprintf("%s/%s/GeoLite2-Country.mmdb", baseURL, tag)
	log.Printf("[Downloader] Downloading MMDB from: %s", url)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("User-Agent", "geoip-service/1.0")

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("http get: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status: %d", resp.StatusCode)
	}

	dir := filepath.Dir(destPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("create dir: %w", err)
	}

	tmpFile := destPath + ".tmp"
	f, err := os.Create(tmpFile)
	if err != nil {
		return fmt.Errorf("create temp file: %w", err)
	}

	written, err := io.Copy(f, resp.Body)
	if err != nil {
		f.Close()
		os.Remove(tmpFile)
		return fmt.Errorf("write temp file: %w", err)
	}
	f.Close()

	if err := os.Rename(tmpFile, destPath); err != nil {
		os.Remove(tmpFile)
		return fmt.Errorf("rename temp file: %w", err)
	}

	log.Printf("[Downloader] Downloaded MMDB: %d bytes to %s", written, destPath)
	return nil
}

func EnsureDirExists(path string) error {
	dir := filepath.Dir(path)
	return os.MkdirAll(dir, 0755)
}