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

type Config struct {
	MMDBSourceURL string
	MMDBPath      string
	ReleaseTag    string
	UpdateEvery   time.Duration
	FirstDelay    time.Duration
}

type Updater struct {
	store  *database.Store
	cfg    Config
	reader *maxminddb.Reader
	done   chan struct{}
	stopCh chan struct{}
}

func New(store *database.Store, cfg Config) *Updater {
	return &Updater{
		store:  store,
		cfg:    cfg,
		done:   make(chan struct{}),
		stopCh: make(chan struct{}),
	}
}

func (u *Updater) Start() {
	go u.loop()
	log.Println("[Updater] Started")
}

func (u *Updater) Stop() {
	close(u.stopCh)
	<-u.done
	log.Println("[Updater] Stopped")
}

func (u *Updater) RunOnce(ctx context.Context) error {
	return u.update(ctx, u.cfg.ReleaseTag)
}

func (u *Updater) GetReader() *maxminddb.Reader {
	return u.reader
}

func (u *Updater) loop() {
	defer close(u.done)

	select {
	case <-time.After(u.cfg.FirstDelay):
	case <-u.stopCh:
		return
	}

	ctx := context.Background()
	log.Println("[Updater] Initial update...")
	if err := u.update(ctx, u.cfg.ReleaseTag); err != nil {
		log.Printf("[Updater] Initial update failed: %v", err)
	}

	ticker := time.NewTicker(u.cfg.UpdateEvery)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			log.Println("[Updater] Scheduled update...")
			if err := u.update(ctx, u.cfg.ReleaseTag); err != nil {
				log.Printf("[Updater] Update failed: %v", err)
			}
		case <-u.stopCh:
			return
		}
	}
}

func (u *Updater) update(ctx context.Context, tag string) error {
	log.Printf("[Updater] Updating GeoIP data (tag: %s)", tag)
	startTime := time.Now()

	if err := downloader.DownloadMMDB(ctx, u.cfg.MMDBSourceURL, tag, u.cfg.MMDBPath); err != nil {
		u.recordUpdate(ctx, tag, "failed", 0)
		return fmt.Errorf("download mmdb: %w", err)
	}

	info, err := os.Stat(u.cfg.MMDBPath)
	filesize := int64(0)
	if err == nil {
		filesize = info.Size()
	}

	newReader, err := maxminddb.Open(u.cfg.MMDBPath)
	if err != nil {
		u.recordUpdate(ctx, tag, "failed", filesize)
		return fmt.Errorf("open mmdb: %w", err)
	}

	oldReader := u.reader
	u.reader = newReader
	if oldReader != nil {
		oldReader.Close()
	}

	u.recordUpdate(ctx, tag, "success", filesize)
	log.Printf("[Updater] Update completed in %s: %d bytes", time.Since(startTime), filesize)
	return nil
}

func (u *Updater) recordUpdate(ctx context.Context, tag, status string, filesize int64) {
	if err := u.store.RecordUpdate(ctx, tag, status, filesize); err != nil {
		log.Printf("[Updater] Record update failed: %v", err)
	}
}