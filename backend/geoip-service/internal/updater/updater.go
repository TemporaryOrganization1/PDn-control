package updater

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	ip2locationLib "github.com/ip2location/ip2location-go"
	"github.com/oschwald/maxminddb-golang"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/database"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/downloader"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/geoip-service/internal/ip2location"
)

type Config struct {
	MMDBSourceURL string
	MMDBPath      string
	ReleaseTag    string
	UpdateEvery   time.Duration
	FirstDelay    time.Duration

	// IP2Location
	IP2LocationToken string
	IP2LocationPath  string
}

type Updater struct {
	store  *database.Store
	cfg    Config
	reader *maxminddb.Reader
	done   chan struct{}
	stopCh chan struct{}

	ip2LocationDB *ip2locationLib.DB
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

// GetIP2LocationDB returns the IP2Location database reader, or nil if not loaded.
func (u *Updater) GetIP2LocationDB() *ip2locationLib.DB {
	return u.ip2LocationDB
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
	mmdbSucceeded := false

	// 1. Download and load Maxmind MMDB
	if err := downloader.DownloadMMDB(ctx, u.cfg.MMDBSourceURL, tag, u.cfg.MMDBPath); err != nil {
		log.Printf("[Updater] Maxmind download failed (non-fatal): %v", err)
	} else {
		info, err := os.Stat(u.cfg.MMDBPath)
		filesize := int64(0)
		if err == nil {
			filesize = info.Size()
		}

		newReader, err := maxminddb.Open(u.cfg.MMDBPath)
		if err != nil {
			log.Printf("[Updater] Maxmind open failed (non-fatal): %v", err)
		} else {
			oldReader := u.reader
			u.reader = newReader
			if oldReader != nil {
				oldReader.Close()
			}
			mmdbSucceeded = true
			log.Printf("[Updater] Maxmind loaded: %d bytes", filesize)
		}
	}

	// 2. Download and load IP2Location BIN (if token is configured)
	if u.cfg.IP2LocationToken != "" {
		if err := u.updateIP2Location(ctx); err != nil {
			log.Printf("[Updater] IP2Location update failed (non-fatal): %v", err)
		}
	} else {
		log.Println("[Updater] IP2Location token not configured, skipping IP2Location update")
	}

	status := "success"
	if !mmdbSucceeded {
		status = "degraded"
	}
	u.recordUpdate(ctx, tag, status, 0)
	log.Printf("[Updater] Update completed in %s (status: %s)", time.Since(startTime), status)
	return nil
}

func (u *Updater) updateIP2Location(ctx context.Context) error {
	log.Println("[Updater] Updating IP2Location database...")

	if err := ip2location.DownloadBIN(ctx, u.cfg.IP2LocationToken, u.cfg.IP2LocationPath); err != nil {
		return fmt.Errorf("download ip2location: %w", err)
	}

	newDB, err := ip2locationLib.OpenDB(u.cfg.IP2LocationPath)
	if err != nil {
		return fmt.Errorf("open ip2location db: %w", err)
	}

	oldDB := u.ip2LocationDB
	u.ip2LocationDB = newDB
	if oldDB != nil {
		oldDB.Close()
	}

	log.Printf("[Updater] IP2Location database loaded from %s", u.cfg.IP2LocationPath)
	return nil
}

func (u *Updater) recordUpdate(ctx context.Context, tag, status string, filesize int64) {
	if err := u.store.RecordUpdate(ctx, tag, status, filesize); err != nil {
		log.Printf("[Updater] Record update failed: %v", err)
	}
}
