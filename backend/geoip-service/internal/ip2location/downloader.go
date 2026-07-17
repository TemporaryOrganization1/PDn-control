package ip2location

import (
	"archive/zip"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const (
	IP2LocationDownloadURL = "https://www.ip2location.com/download"
	IP2LocationFileName    = "IP2LOCATION-LITE-DB1.BIN"
)

// DownloadBIN downloads the IP2Location LITE database, extracts the BIN from the ZIP,
// and writes it atomically to destPath.
func DownloadBIN(ctx context.Context, token, destPath string) error {
	url := fmt.Sprintf("%s/?token=%s&file=DB1LITEBIN", IP2LocationDownloadURL, token)
	log.Printf("[IP2Location] Downloading BIN from: %s", url)

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

	// Download ZIP to a temp file
	tmpZip := destPath + ".zip.tmp"
	zipFile, err := os.Create(tmpZip)
	if err != nil {
		return fmt.Errorf("create temp zip file: %w", err)
	}

	written, err := io.Copy(zipFile, resp.Body)
	zipFile.Close()
	if err != nil {
		os.Remove(tmpZip)
		return fmt.Errorf("write temp zip: %w", err)
	}
	log.Printf("[IP2Location] Downloaded ZIP: %d bytes to %s", written, tmpZip)

	// Extract BIN from ZIP
	extracted, err := extractBINFromZIP(tmpZip, destPath)
	if err != nil {
		os.Remove(tmpZip)
		return fmt.Errorf("extract BIN: %w", err)
	}

	if err := os.Remove(tmpZip); err != nil {
		log.Printf("[IP2Location] Warning: failed to remove temp zip: %v", err)
	}

	log.Printf("[IP2Location] Extracted BIN: %d bytes to %s", extracted, destPath)
	return nil
}

// extractBINFromZIP extracts IP2LocationFileName from the ZIP archive
// and writes it to destPath atomically (via .tmp file).
func extractBINFromZIP(zipPath, destPath string) (int64, error) {
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return 0, fmt.Errorf("open zip: %w", err)
	}
	defer reader.Close()

	for _, f := range reader.File {
		if f.Name != IP2LocationFileName {
			continue
		}

		rc, err := f.Open()
		if err != nil {
			return 0, fmt.Errorf("open BIN in zip: %w", err)
		}
		defer rc.Close()

		tmpFile := destPath + ".tmp"
		out, err := os.Create(tmpFile)
		if err != nil {
			return 0, fmt.Errorf("create temp file: %w", err)
		}

		written, err := io.Copy(out, rc)
		out.Close()
		if err != nil {
			os.Remove(tmpFile)
			return 0, fmt.Errorf("write BIN: %w", err)
		}

		if err := os.Rename(tmpFile, destPath); err != nil {
			os.Remove(tmpFile)
			return 0, fmt.Errorf("rename BIN: %w", err)
		}

		return written, nil
	}

	return 0, fmt.Errorf("BIN file %s not found in ZIP archive", IP2LocationFileName)
}
