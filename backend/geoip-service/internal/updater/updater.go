package updater

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/oschwald/maxminddb-golang"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/database"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/downloader"
)

// Config for the updater.
type Config struct {
	MMDBSourceURL string
	MMDBPath      string
	ReleaseTag    string
	UpdateEvery   time.Duration
	FirstDelay    time.Duration
}

// Updater handles periodic GeoIP data synchronization.
type Updater struct {
	store    *database.Store
	cfg      Config
	reader   *maxminddb.Reader
	done     chan struct{}
	stopCh   chan struct{}
}

// New creates a new Updater.
func New(store *database.Store, cfg Config) *Updater {
	return &Updater{
		store:  store,
		cfg:    cfg,
		done:   make(chan struct{}),
		stopCh: make(chan struct{}),
	}
}

// Start begins the update cycle in a background goroutine.
func (u *Updater) Start() {
	go u.loop()
	log.Println("[Updater] Started background update loop")
}

// Stop signals the updater to stop.
func (u *Updater) Stop() {
	close(u.stopCh)
	<-u.done
	log.Println("[Updater] Stopped")
}

// RunOnce performs a single full update cycle immediately.
func (u *Updater) RunOnce(ctx context.Context) error {
	return u.update(ctx, u.cfg.ReleaseTag)
}

// GetReader returns the current MMDB reader (thread-safe after open).
func (u *Updater) GetReader() *maxminddb.Reader {
	return u.reader
}

func (u *Updater) loop() {
	defer close(u.done)

	// Wait for the initial delay
	select {
	case <-time.After(u.cfg.FirstDelay):
	case <-u.stopCh:
		return
	}

	// Perform initial update
	ctx := context.Background()
	log.Println("[Updater] Running initial update...")
	if err := u.update(ctx, u.cfg.ReleaseTag); err != nil {
		log.Printf("[Updater] Initial update failed: %v", err)
	}

	ticker := time.NewTicker(u.cfg.UpdateEvery)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			log.Println("[Updater] Running scheduled update...")
			if err := u.update(ctx, u.cfg.ReleaseTag); err != nil {
				log.Printf("[Updater] Scheduled update failed: %v", err)
			}
		case <-u.stopCh:
			return
		}
	}
}

func (u *Updater) update(ctx context.Context, tag string) error {
	log.Printf("[Updater] Starting GeoIP data update (tag: %s)", tag)
	startTime := time.Now()

	// Download the MMDB file
	if err := downloader.DownloadMMDB(ctx, u.cfg.MMDBSourceURL, tag, u.cfg.MMDBPath); err != nil {
		log.Printf("[Updater] Failed to download MMDB: %v", err)
		u.recordUpdate(ctx, tag, "failed", 0)
		return fmt.Errorf("download mmdb: %w", err)
	}

	// Stat the downloaded file for size tracking
	info, err := os.Stat(u.cfg.MMDBPath)
	filesize := int64(0)
	if err == nil {
		filesize = info.Size()
	}

	// Open the new MMDB file (closes old reader if exists)
	newReader, err := maxminddb.Open(u.cfg.MMDBPath)
	if err != nil {
		log.Printf("[Updater] Failed to open MMDB: %v", err)
		u.recordUpdate(ctx, tag, "failed", filesize)
		return fmt.Errorf("open mmdb: %w", err)
	}

	// Atomically swap readers
	oldReader := u.reader
	u.reader = newReader
	if oldReader != nil {
		oldReader.Close()
	}

	// Record success
	u.recordUpdate(ctx, tag, "success", filesize)

	elapsed := time.Since(startTime)
	log.Printf("[Updater] Update completed in %s: MMDB file %d bytes", elapsed, filesize)
	return nil
}

func (u *Updater) recordUpdate(ctx context.Context, tag, status string, filesize int64) {
	if err := u.store.RecordUpdate(ctx, tag, status, filesize); err != nil {
		log.Printf("[Updater] Failed to record update: %v", err)
	}
}
