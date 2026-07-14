package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/entitlements"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/pdfGen"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
)

var (
	ErrUserExists      = errors.New("user already exists")
	ErrInvalidSession  = errors.New("invalid session")
	ErrScanLimit       = errors.New("free scan limit reached")
	ErrReportNotFound  = errors.New("report not found")
	ErrReportForbidden = errors.New("report access denied")
)

type User struct {
	ID            string     `json:"id"`
	Email         string     `json:"email"`
	PasswordHash  string     `json:"-"`
	CreatedAt     time.Time  `json:"created_at"`
	EmailVerified bool       `json:"email_verified"`
	Plan          string     `json:"plan"`
	PlanExpiresAt *time.Time `json:"plan_expires_at"`
}

type Store struct {
	db         *sql.DB
	reportsDir string
}

func NewStore(databaseURL string, reportsDir string) (*Store, error) {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	// Ensure reports directory exists
	if err := os.MkdirAll(reportsDir, 0755); err != nil {
		db.Close()
		return nil, fmt.Errorf("create reports directory: %w", err)
	}

	s := &Store{db: db, reportsDir: reportsDir}
	if err := s.migrate(ctx); err != nil {
		db.Close()
		return nil, err
	}
	return s, nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) migrate(ctx context.Context) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS pdf_reports (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL,
			url TEXT NOT NULL DEFAULT '',
			file_path TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE pdf_reports ADD COLUMN IF NOT EXISTS req_id TEXT NULL`,
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_pdf_reports_req_id ON pdf_reports(req_id)`,
		`CREATE INDEX IF NOT EXISTS idx_pdf_reports_email ON pdf_reports(email)`,
		`CREATE TABLE IF NOT EXISTS auth_users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			email_verified BOOLEAN NOT NULL DEFAULT FALSE,
			plan TEXT NOT NULL DEFAULT 'free',
			plan_expires_at TIMESTAMPTZ NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE`,
		`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'`,
		`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ NULL`,
		`CREATE TABLE IF NOT EXISTS email_verifications (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
			token_hash TEXT NOT NULL,
			expires_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at)`,
		`CREATE TABLE IF NOT EXISTS auth_sessions (
			token_hash TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
			expires_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at)`,
		`CREATE TABLE IF NOT EXISTS check_history (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL,
			req_id TEXT NOT NULL UNIQUE,
			url TEXT NOT NULL DEFAULT '',
			check_type TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'completed',
			results_json JSONB NOT NULL DEFAULT '[]'::jsonb,
			report_id TEXT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_check_history_email_created_at ON check_history(email, created_at DESC)`,
		`ALTER TABLE check_history ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL`,
		`ALTER TABLE check_history ADD COLUMN IF NOT EXISTS scan_profile JSONB NULL`,
		`CREATE INDEX IF NOT EXISTS idx_check_history_expires_at ON check_history(expires_at)`,
		`CREATE TABLE IF NOT EXISTS scan_usage_events (
			id TEXT PRIMARY KEY,
			subject_key TEXT NOT NULL,
			accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_scan_usage_subject_time ON scan_usage_events(subject_key, accepted_at)`,
		`CREATE TABLE IF NOT EXISTS check_images (
			id TEXT PRIMARY KEY,
			req_id TEXT NOT NULL,
			file_path TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
		)`,
		`CREATE INDEX IF NOT EXISTS idx_check_images_req_id ON check_images(req_id)`,
		`CREATE INDEX IF NOT EXISTS idx_check_images_expires_at ON check_images(expires_at)`,
		`ALTER TABLE check_images ADD COLUMN IF NOT EXISTS check_id TEXT NULL REFERENCES check_history(id) ON DELETE SET NULL`,
		`ALTER TABLE check_images ALTER COLUMN expires_at DROP NOT NULL`,
		`CREATE INDEX IF NOT EXISTS idx_check_images_check_id ON check_images(check_id)`,
		`INSERT INTO check_history (id, email, req_id, url, check_type, status, results_json, report_id, created_at)
			SELECT 'legacy-' || id, email, COALESCE(NULLIF(req_id, ''), 'legacy-' || id), url, 'unknown', 'completed', '[]'::jsonb, id, created_at
			FROM pdf_reports
			WHERE email <> ''
				AND NOT EXISTS (
					SELECT 1
					FROM check_history h
					WHERE h.report_id = pdf_reports.id
						OR (pdf_reports.req_id IS NOT NULL AND h.req_id = pdf_reports.req_id)
				)
			ON CONFLICT (req_id) DO NOTHING`,
		`DELETE FROM check_history legacy
			WHERE legacy.req_id LIKE 'legacy-%'
				AND legacy.report_id IS NOT NULL
				AND EXISTS (
					SELECT 1
					FROM check_history current
					WHERE current.report_id = legacy.report_id
						AND current.req_id <> legacy.req_id
						AND current.req_id NOT LIKE 'legacy-%'
				)`,
	}

	for _, stmt := range stmts {
		if _, err := s.db.ExecContext(ctx, stmt); err != nil {
			return fmt.Errorf("migrate auth database: %w", err)
		}
	}
	return nil
}

// SaveReport generates a PDF report for the given targetURL and results,
// saves it to the reports directory, and records it in pdf_reports table.
// Returns the generated report ID and the file path.
func (s *Store) SaveReport(ctx context.Context, email, targetURL, reqID string, payload store.ReportPayload) (string, error) {
	if reqID != "" {
		existingID, err := s.reportIDByReqID(ctx, reqID)
		if err != nil {
			return "", err
		}
		if existingID != "" {
			return existingID, nil
		}
	}

	reportID := newID()
	hostname := sanitizeFileBase(pdfGen.GetHostname(targetURL))
	fileName := fmt.Sprintf("%s_%s.pdf", hostname, reportID[:8])
	filePath := filepath.Join(s.reportsDir, fileName)

	log.Printf("[Auth] Generating PDF report %s for %s (%s)", reportID, email, targetURL)

	imagePaths, err := s.ImagePathsForPayload(ctx, reqID, payload)
	if err != nil {
		return "", err
	}
	if err := pdfGen.GeneratePDFReport(targetURL, payload, filePath, pdfGen.ReportOptions{ImagePaths: imagePaths}); err != nil {
		return "", fmt.Errorf("generate pdf report: %w", err)
	}

	_, err = s.db.ExecContext(ctx, `
		INSERT INTO pdf_reports (id, email, url, file_path, req_id, created_at)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''), NOW())
		ON CONFLICT (req_id) DO NOTHING
	`, reportID, email, targetURL, filePath, reqID)
	if err != nil {
		// Clean up the file if DB insert fails
		os.Remove(filePath)
		return "", fmt.Errorf("insert pdf report record: %w", err)
	}

	if reqID != "" {
		existingID, err := s.reportIDByReqID(ctx, reqID)
		if err != nil {
			os.Remove(filePath)
			return "", err
		}
		if existingID != reportID {
			os.Remove(filePath)
			return existingID, nil
		}
	}

	log.Printf("[Auth] PDF report saved: id=%s email=%s path=%s", reportID, email, filePath)
	return reportID, nil
}

func (s *Store) reportIDByReqID(ctx context.Context, reqID string) (string, error) {
	if reqID == "" {
		return "", nil
	}

	var id string
	err := s.db.QueryRowContext(ctx, `
		SELECT id
		FROM pdf_reports
		WHERE req_id = $1
	`, reqID).Scan(&id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil
		}
		return "", fmt.Errorf("query report by req_id: %w", err)
	}
	return id, nil
}

// CheckHistory represents a completed check. PDF metadata is optional.
type CheckHistory struct {
	ID           string                   `json:"id"`
	Email        string                   `json:"email,omitempty"`
	ReqID        string                   `json:"req_id"`
	URL          string                   `json:"url"`
	CheckType    string                   `json:"check_type"`
	Status       string                   `json:"status"`
	ReportID     string                   `json:"report_id"`
	CreatedAt    time.Time                `json:"created_at"`
	FileName     string                   `json:"file_name"`
	Results      []store.Result           `json:"results,omitempty"`
	ScreenshotID string                   `json:"screenshotId,omitempty"`
	SSL          *store.SslInfo           `json:"ssl,omitempty"`
	About        string                   `json:"about,omitempty"`
	Country      string                   `json:"country,omitempty"`
	ScanProfile  entitlements.ScanProfile `json:"scan_profile"`
}

// SaveCheckHistory upserts a completed check independently from PDF generation.
// For free users, sets expires_at = NOW() + 7 days. For paid users, expires_at remains NULL.
func (s *Store) SaveCheckHistory(ctx context.Context, email, reqID, targetURL, checkType, status string, payload store.ReportPayload, profile entitlements.ScanProfile) (*CheckHistory, error) {
	email = NormalizeEmail(email)
	if email == "" {
		return nil, nil
	}
	if reqID == "" {
		return nil, errors.New("req_id is required")
	}
	if status == "" {
		status = "completed"
	}

	resultsJSON, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal check results: %w", err)
	}
	profileJSON, err := json.Marshal(profile)
	if err != nil {
		return nil, fmt.Errorf("marshal scan profile: %w", err)
	}

	// Retention follows the immutable scan profile, not the user's current plan.
	isPaid := profile.IsFull()

	h := &CheckHistory{}
	if isPaid {
		err = s.db.QueryRowContext(ctx, `
			INSERT INTO check_history (id, email, req_id, url, check_type, status, results_json, scan_profile, expires_at, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NULL, NOW())
			ON CONFLICT (req_id) DO UPDATE
			SET email = EXCLUDED.email,
				url = EXCLUDED.url,
				check_type = EXCLUDED.check_type,
				status = EXCLUDED.status,
				results_json = EXCLUDED.results_json,
				scan_profile = EXCLUDED.scan_profile,
				expires_at = NULL
			RETURNING id, email, req_id, url, check_type, status, COALESCE(report_id, ''), created_at
		`, newID(), email, reqID, targetURL, checkType, status, string(resultsJSON), string(profileJSON)).
			Scan(&h.ID, &h.Email, &h.ReqID, &h.URL, &h.CheckType, &h.Status, &h.ReportID, &h.CreatedAt)
	} else {
		err = s.db.QueryRowContext(ctx, `
			INSERT INTO check_history (id, email, req_id, url, check_type, status, results_json, scan_profile, expires_at, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NOW() + INTERVAL '7 days', NOW())
			ON CONFLICT (req_id) DO UPDATE
			SET email = EXCLUDED.email,
				url = EXCLUDED.url,
				check_type = EXCLUDED.check_type,
				status = EXCLUDED.status,
				results_json = EXCLUDED.results_json,
				scan_profile = EXCLUDED.scan_profile,
				expires_at = NOW() + INTERVAL '7 days'
			RETURNING id, email, req_id, url, check_type, status, COALESCE(report_id, ''), created_at
		`, newID(), email, reqID, targetURL, checkType, status, string(resultsJSON), string(profileJSON)).
			Scan(&h.ID, &h.Email, &h.ReqID, &h.URL, &h.CheckType, &h.Status, &h.ReportID, &h.CreatedAt)
	}
	if err != nil {
		return nil, fmt.Errorf("save check history: %w", err)
	}
	h.Results = append([]store.Result(nil), payload.Checks...)
	h.ScreenshotID = payload.ScreenshotID
	h.SSL = payload.SSL
	h.About = payload.About
	h.Country = payload.Country
	h.ScanProfile = profile
	if err := s.AttachImagesToCheckHistory(ctx, reqID, h.ID); err != nil {
		return nil, err
	}
	return h, nil
}

func (s *Store) SetHistoryReportID(ctx context.Context, reqID, reportID string) error {
	if reqID == "" || reportID == "" {
		return nil
	}
	_, err := s.db.ExecContext(ctx, `
		UPDATE check_history
		SET report_id = $2
		WHERE req_id = $1 AND (report_id IS NULL OR report_id = '')
	`, reqID, reportID)
	if err != nil {
		return fmt.Errorf("update check history report id: %w", err)
	}
	return nil
}

// CheckHistoryByEmail returns completed checks for the user, with PDF metadata when available.
func (s *Store) CheckHistoryByEmail(ctx context.Context, email string) ([]CheckHistory, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT h.id, h.email, h.req_id, h.url, h.check_type, h.status,
			COALESCE(h.report_id, ''), h.created_at, COALESCE(r.file_path, ''),
			COALESCE(h.results_json, '[]'::jsonb), h.scan_profile
		FROM check_history h
		LEFT JOIN pdf_reports r ON r.id = h.report_id
		WHERE h.email = $1
			AND (h.expires_at IS NULL OR h.expires_at > NOW())
		ORDER BY h.created_at DESC
	`, NormalizeEmail(email))
	if err != nil {
		return nil, fmt.Errorf("query check history: %w", err)
	}
	defer rows.Close()

	history := []CheckHistory{}
	for rows.Next() {
		var h CheckHistory
		var filePath string
		var rawResults []byte
		var rawProfile []byte
		if err := rows.Scan(&h.ID, &h.Email, &h.ReqID, &h.URL, &h.CheckType, &h.Status, &h.ReportID, &h.CreatedAt, &filePath, &rawResults, &rawProfile); err != nil {
			return nil, fmt.Errorf("scan check history: %w", err)
		}
		if len(rawProfile) > 0 {
			if err := json.Unmarshal(rawProfile, &h.ScanProfile); err != nil {
				return nil, fmt.Errorf("unmarshal scan profile: %w", err)
			}
		} else {
			h.ScanProfile = entitlements.LegacyFullProfile()
		}
		if filePath != "" {
			h.FileName = filepath.Base(filePath)
		}
		if len(rawResults) > 0 {
			payload, err := decodeReportPayload(rawResults)
			if err != nil {
				return nil, fmt.Errorf("unmarshal check history results: %w", err)
			}
			h.Results = payload.Checks
			h.ScreenshotID = payload.ScreenshotID
			h.SSL = payload.SSL
			h.About = payload.About
			h.Country = payload.Country
		}
		history = append(history, h)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("history rows iteration: %w", err)
	}
	return history, nil
}

func decodeReportPayload(raw []byte) (store.ReportPayload, error) {
	var payload store.ReportPayload
	if err := json.Unmarshal(raw, &payload); err == nil {
		if payload.Checks == nil {
			payload.Checks = []store.Result{}
		}
		return payload, nil
	}

	var legacy []store.Result
	if err := json.Unmarshal(raw, &legacy); err != nil {
		return store.ReportPayload{}, err
	}
	return store.PayloadFromResults(legacy), nil
}

// ReportsDir returns the directory where PDF reports are stored.
func (s *Store) ReportsDir() string {
	return s.reportsDir
}

func NormalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func (s *Store) CreateUser(ctx context.Context, email, passwordHash string) (*User, error) {
	user := &User{
		ID:            newID(),
		Email:         NormalizeEmail(email),
		PasswordHash:  passwordHash,
		EmailVerified: false,
		Plan:          "free",
		CreatedAt:     time.Now().UTC(),
	}
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO auth_users (id, email, password_hash, email_verified, plan, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at
	`, user.ID, user.Email, user.PasswordHash, user.EmailVerified, user.Plan, user.CreatedAt).Scan(&user.CreatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, ErrUserExists
		}
		return nil, fmt.Errorf("create user: %w", err)
	}
	return user, nil
}

func (s *Store) UserByEmail(ctx context.Context, email string) (*User, error) {
	user := &User{}
	err := s.db.QueryRowContext(ctx, `
		SELECT id, email, password_hash, email_verified, plan, plan_expires_at, created_at
		FROM auth_users
		WHERE email = $1
	`, NormalizeEmail(email)).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.EmailVerified, &user.Plan, &user.PlanExpiresAt, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *Store) UpdatePasswordHash(ctx context.Context, userID, passwordHash string) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE auth_users
		SET password_hash = $1
		WHERE id = $2
	`, passwordHash, userID)
	if err != nil {
		return fmt.Errorf("update password hash: %w", err)
	}
	return nil
}

// ChangeUserPlan changes the account plan. Scan artifacts keep their scan-time retention.
func (s *Store) ChangeUserPlan(ctx context.Context, userID, newPlan string, paidDuration time.Duration) error {
	if newPlan != "free" && newPlan != "paid" {
		return fmt.Errorf("invalid plan: %s", newPlan)
	}

	// Update user plan
	if newPlan == "paid" {
		if paidDuration <= 0 {
			paidDuration = 10 * time.Minute
		}
		_, err := s.db.ExecContext(ctx, `
			UPDATE auth_users
			SET plan = $1, plan_expires_at = NOW() + ($3 * INTERVAL '1 second')
			WHERE id = $2
		`, newPlan, userID, int(paidDuration.Seconds()))
		if err != nil {
			return fmt.Errorf("update user plan: %w", err)
		}
	} else {
		_, err := s.db.ExecContext(ctx, `
			UPDATE auth_users
			SET plan = $1, plan_expires_at = NULL
			WHERE id = $2
		`, newPlan, userID)
		if err != nil {
			return fmt.Errorf("update user plan: %w", err)
		}
	}

	log.Printf("[Auth] Changed plan for user %s to %s", userID, newPlan)
	return nil
}

// GetUserPlan returns the plan for a user by userID.
func (s *Store) GetUserPlan(ctx context.Context, userID string) (string, error) {
	var plan string
	err := s.db.QueryRowContext(ctx, `
		SELECT plan FROM auth_users WHERE id = $1
	`, userID).Scan(&plan)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil
		}
		return "", fmt.Errorf("query user plan: %w", err)
	}
	return plan, nil
}

// CleanupExpiredData removes expired checks and their associated PDF/image files for free users.
// It also downgrades expired paid plans to free.
func (s *Store) CleanupExpiredData(ctx context.Context) (int, int, error) {
	_, err := s.db.ExecContext(ctx, `
		UPDATE auth_users
		SET plan = 'free', plan_expires_at = NULL
		WHERE plan = 'paid' AND plan_expires_at <= NOW()
	`)
	if err != nil {
		log.Printf("[Auth] Warning: failed to downgrade expired plans: %v", err)
	}

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, req_id, COALESCE(report_id, '')
		FROM check_history
		WHERE expires_at <= NOW()
			AND email IN (SELECT email FROM auth_users WHERE plan = 'free')
	`)
	if err != nil {
		return 0, 0, fmt.Errorf("query expired checks: %w", err)
	}
	defer rows.Close()

	type expiredCheck struct {
		id       string
		reqID    string
		reportID string
	}
	var expired []expiredCheck
	for rows.Next() {
		var item expiredCheck
		if err := rows.Scan(&item.id, &item.reqID, &item.reportID); err != nil {
			return 0, 0, fmt.Errorf("scan expired check: %w", err)
		}
		expired = append(expired, item)
	}
	if err := rows.Err(); err != nil {
		return 0, 0, fmt.Errorf("expired checks rows iteration: %w", err)
	}

	checksDeleted := 0
	imagesDeleted := 0
	var pdfPaths []string
	var imagePaths []string

	if len(expired) > 0 {
		tx, err := s.db.BeginTx(ctx, nil)
		if err != nil {
			return 0, 0, fmt.Errorf("begin cleanup transaction: %w", err)
		}
		committed := false
		defer func() {
			if !committed {
				_ = tx.Rollback()
			}
		}()

		for _, item := range expired {
			if item.reportID != "" {
				var fp string
				err := tx.QueryRowContext(ctx, `SELECT file_path FROM pdf_reports WHERE id = $1`, item.reportID).Scan(&fp)
				if err != nil && !errors.Is(err, sql.ErrNoRows) {
					return 0, 0, fmt.Errorf("query expired pdf path: %w", err)
				}
				if fp != "" {
					pdfPaths = append(pdfPaths, fp)
				}
				if _, err := tx.ExecContext(ctx, `DELETE FROM pdf_reports WHERE id = $1`, item.reportID); err != nil {
					return 0, 0, fmt.Errorf("delete expired pdf report: %w", err)
				}
			}

			imgRows, err := tx.QueryContext(ctx, `SELECT file_path FROM check_images WHERE req_id = $1`, item.reqID)
			if err != nil {
				return 0, 0, fmt.Errorf("query expired check images: %w", err)
			}
			for imgRows.Next() {
				var fp string
				if err := imgRows.Scan(&fp); err != nil {
					imgRows.Close()
					return 0, 0, fmt.Errorf("scan expired image path: %w", err)
				}
				imagePaths = append(imagePaths, fp)
			}
			if err := imgRows.Err(); err != nil {
				imgRows.Close()
				return 0, 0, fmt.Errorf("expired image rows iteration: %w", err)
			}
			imgRows.Close()

			result, err := tx.ExecContext(ctx, `DELETE FROM check_images WHERE req_id = $1`, item.reqID)
			if err != nil {
				return 0, 0, fmt.Errorf("delete expired check images: %w", err)
			}
			if deleted, err := result.RowsAffected(); err == nil {
				imagesDeleted += int(deleted)
			}

			result, err = tx.ExecContext(ctx, `DELETE FROM check_history WHERE id = $1`, item.id)
			if err != nil {
				return 0, 0, fmt.Errorf("delete expired check: %w", err)
			}
			if deleted, err := result.RowsAffected(); err == nil {
				checksDeleted += int(deleted)
			}
		}

		if err := tx.Commit(); err != nil {
			return 0, 0, fmt.Errorf("commit cleanup transaction: %w", err)
		}
		committed = true
	}

	orphanRows, err := s.db.QueryContext(ctx, `
		SELECT file_path FROM check_images
		WHERE expires_at <= NOW()
			AND check_id IS NULL
	`)
	if err != nil {
		return checksDeleted, imagesDeleted, fmt.Errorf("query expired orphan images: %w", err)
	}
	var orphanPaths []string
	for orphanRows.Next() {
		var fp string
		if err := orphanRows.Scan(&fp); err != nil {
			orphanRows.Close()
			return checksDeleted, imagesDeleted, fmt.Errorf("scan expired orphan image: %w", err)
		}
		orphanPaths = append(orphanPaths, fp)
	}
	if err := orphanRows.Err(); err != nil {
		orphanRows.Close()
		return checksDeleted, imagesDeleted, fmt.Errorf("expired orphan image rows iteration: %w", err)
	}
	orphanRows.Close()

	if len(orphanPaths) > 0 {
		result, err := s.db.ExecContext(ctx, `DELETE FROM check_images WHERE expires_at <= NOW() AND check_id IS NULL`)
		if err != nil {
			return checksDeleted, imagesDeleted, fmt.Errorf("delete expired orphan images: %w", err)
		}
		if deleted, err := result.RowsAffected(); err == nil {
			imagesDeleted += int(deleted)
		}
		imagePaths = append(imagePaths, orphanPaths...)
	}

	// Guest/free scans no longer create PDFs. Retire anonymous legacy files after seven days.
	legacyRows, err := s.db.QueryContext(ctx, `
		DELETE FROM pdf_reports
		WHERE email = '' AND created_at <= NOW() - INTERVAL '7 days'
		RETURNING file_path
	`)
	if err != nil {
		return checksDeleted, imagesDeleted, fmt.Errorf("delete anonymous legacy pdf reports: %w", err)
	}
	for legacyRows.Next() {
		var fp string
		if err := legacyRows.Scan(&fp); err != nil {
			legacyRows.Close()
			return checksDeleted, imagesDeleted, fmt.Errorf("scan anonymous legacy pdf path: %w", err)
		}
		pdfPaths = append(pdfPaths, fp)
	}
	if err := legacyRows.Err(); err != nil {
		legacyRows.Close()
		return checksDeleted, imagesDeleted, fmt.Errorf("anonymous legacy pdf rows iteration: %w", err)
	}
	legacyRows.Close()

	removeFiles(pdfPaths)
	removeFiles(imagePaths)

	if checksDeleted > 0 || imagesDeleted > 0 {
		log.Printf("[Auth] Cleanup: deleted %d checks and %d images", checksDeleted, imagesDeleted)
	}

	return checksDeleted, imagesDeleted, nil
}

// DeleteUnverifiedUser removes a user and their verification tokens if email is not yet verified.
// This allows re-registration with the same email after token expiry.
func (s *Store) DeleteUnverifiedUser(ctx context.Context, email string) error {
	email = NormalizeEmail(email)

	// Find the user
	var userID string
	var emailVerified bool
	err := s.db.QueryRowContext(ctx, `
		SELECT id, email_verified FROM auth_users WHERE email = $1
	`, email).Scan(&userID, &emailVerified)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil // User doesn't exist, nothing to delete
		}
		return fmt.Errorf("find user: %w", err)
	}

	// Only delete if not verified
	if emailVerified {
		return ErrUserExists // User is already verified, cannot re-register
	}

	// Delete verification tokens
	_, _ = s.db.ExecContext(ctx, `DELETE FROM email_verifications WHERE user_id = $1`, userID)

	// Delete sessions
	_, _ = s.db.ExecContext(ctx, `DELETE FROM auth_sessions WHERE user_id = $1`, userID)

	// Delete user
	_, err = s.db.ExecContext(ctx, `DELETE FROM auth_users WHERE id = $1`, userID)
	if err != nil {
		return fmt.Errorf("delete unverified user: %w", err)
	}

	log.Printf("[Auth] Deleted unverified user %s (%s) for re-registration", userID, email)
	return nil
}

func (s *Store) CreateEmailVerification(ctx context.Context, userID string) (string, error) {
	token := newToken()
	tokenHash := HashToken(token)
	verificationID := newID()
	expiresAt := time.Now().UTC().Add(15 * time.Minute)

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO email_verifications (id, user_id, token_hash, expires_at)
		VALUES ($1, $2, $3, $4)
	`, verificationID, userID, tokenHash, expiresAt)
	if err != nil {
		return "", fmt.Errorf("create email verification: %w", err)
	}

	return token, nil
}

func (s *Store) VerifyEmailByToken(ctx context.Context, token string) (string, error) {
	tokenHash := HashToken(token)

	var userID string
	err := s.db.QueryRowContext(ctx, `
		UPDATE auth_users
		SET email_verified = TRUE
		WHERE id IN (
			SELECT user_id
			FROM email_verifications
			WHERE token_hash = $1 AND expires_at > NOW()
		)
		RETURNING id
	`, tokenHash).Scan(&userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", errors.New("invalid or expired verification token")
		}
		return "", fmt.Errorf("verify email: %w", err)
	}

	// Delete used verification tokens
	_, _ = s.db.ExecContext(ctx, `DELETE FROM email_verifications WHERE token_hash = $1`, tokenHash)

	return userID, nil
}

// DeleteUser removes a user and all associated data (sessions, check history, PDF reports/files).
func (s *Store) DeleteUser(ctx context.Context, userID, email string) error {
	email = NormalizeEmail(email)

	// Collect file paths of PDF reports to delete from disk
	rows, err := s.db.QueryContext(ctx, `
		SELECT file_path FROM pdf_reports WHERE email = $1
	`, email)
	if err != nil {
		return fmt.Errorf("query user reports: %w", err)
	}
	var filePaths []string
	for rows.Next() {
		var fp string
		if err := rows.Scan(&fp); err != nil {
			rows.Close()
			return fmt.Errorf("scan report file path: %w", err)
		}
		filePaths = append(filePaths, fp)
	}
	rows.Close()

	imageRows, err := s.db.QueryContext(ctx, `
		SELECT file_path
		FROM check_images
		WHERE req_id IN (SELECT req_id FROM check_history WHERE email = $1)
	`, email)
	if err != nil {
		return fmt.Errorf("query user image paths: %w", err)
	}
	var imageFilePaths []string
	for imageRows.Next() {
		var fp string
		if err := imageRows.Scan(&fp); err != nil {
			imageRows.Close()
			return fmt.Errorf("scan image file path: %w", err)
		}
		imageFilePaths = append(imageFilePaths, fp)
	}
	if err := imageRows.Err(); err != nil {
		imageRows.Close()
		return fmt.Errorf("image paths rows iteration: %w", err)
	}
	imageRows.Close()

	if _, err := s.db.ExecContext(ctx, `
		DELETE FROM check_images
		WHERE req_id IN (SELECT req_id FROM check_history WHERE email = $1)
	`, email); err != nil {
		return fmt.Errorf("delete user images: %w", err)
	}

	// Delete check_history records (by email)
	if _, err := s.db.ExecContext(ctx, `DELETE FROM check_history WHERE email = $1`, email); err != nil {
		return fmt.Errorf("delete check history: %w", err)
	}

	// Delete pdf_reports records (by email) — CASCADE not set, do it explicitly
	if _, err := s.db.ExecContext(ctx, `DELETE FROM pdf_reports WHERE email = $1`, email); err != nil {
		return fmt.Errorf("delete pdf reports: %w", err)
	}

	// Delete sessions — ON DELETE CASCADE should handle this, but delete explicitly for safety
	if _, err := s.db.ExecContext(ctx, `DELETE FROM auth_sessions WHERE user_id = $1`, userID); err != nil {
		return fmt.Errorf("delete user sessions: %w", err)
	}
	if _, err := s.db.ExecContext(ctx, `DELETE FROM scan_usage_events WHERE subject_key = $1`, "user:"+userID); err != nil {
		return fmt.Errorf("delete user scan usage: %w", err)
	}

	// Delete the user
	result, err := s.db.ExecContext(ctx, `DELETE FROM auth_users WHERE id = $1`, userID)
	if err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("check rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	// Clean up PDF files from disk
	for _, fp := range filePaths {
		if err := os.Remove(fp); err != nil && !os.IsNotExist(err) {
			log.Printf("[Auth] Warning: failed to remove report file %s: %v", fp, err)
		}
	}
	removeFiles(imageFilePaths)

	log.Printf("[Auth] User %s (%s) deleted successfully", userID, email)
	return nil
}

func (s *Store) DeleteReport(ctx context.Context, email, reportID string) error {
	email = NormalizeEmail(email)
	if email == "" || reportID == "" {
		return ErrReportNotFound
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin delete report transaction: %w", err)
	}
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	var reportEmail, filePath, reportReqID string
	err = tx.QueryRowContext(ctx, `
		SELECT email, file_path, COALESCE(req_id, '')
		FROM pdf_reports
		WHERE id = $1
	`, reportID).Scan(&reportEmail, &filePath, &reportReqID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrReportNotFound
		}
		return fmt.Errorf("query report for delete: %w", err)
	}
	if NormalizeEmail(reportEmail) != email {
		return ErrReportForbidden
	}

	reqIDs := map[string]struct{}{}
	if reportReqID != "" {
		reqIDs[reportReqID] = struct{}{}
	}
	rows, err := tx.QueryContext(ctx, `
		SELECT req_id FROM check_history WHERE report_id = $1 AND email = $2
	`, reportID, email)
	if err != nil {
		return fmt.Errorf("query history for delete: %w", err)
	}
	for rows.Next() {
		var reqID string
		if err := rows.Scan(&reqID); err != nil {
			rows.Close()
			return fmt.Errorf("scan history req_id: %w", err)
		}
		if reqID != "" {
			reqIDs[reqID] = struct{}{}
		}
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return fmt.Errorf("history req_id rows iteration: %w", err)
	}
	rows.Close()

	var imagePaths []string
	for reqID := range reqIDs {
		imgRows, err := tx.QueryContext(ctx, `SELECT file_path FROM check_images WHERE req_id = $1`, reqID)
		if err != nil {
			return fmt.Errorf("query report images: %w", err)
		}
		for imgRows.Next() {
			var fp string
			if err := imgRows.Scan(&fp); err != nil {
				imgRows.Close()
				return fmt.Errorf("scan report image path: %w", err)
			}
			imagePaths = append(imagePaths, fp)
		}
		if err := imgRows.Err(); err != nil {
			imgRows.Close()
			return fmt.Errorf("report image rows iteration: %w", err)
		}
		imgRows.Close()

		if _, err := tx.ExecContext(ctx, `DELETE FROM check_images WHERE req_id = $1`, reqID); err != nil {
			return fmt.Errorf("delete report images: %w", err)
		}
		if _, err := tx.ExecContext(ctx, `DELETE FROM check_history WHERE req_id = $1 AND email = $2`, reqID, email); err != nil {
			return fmt.Errorf("delete report history by req_id: %w", err)
		}
	}

	if _, err := tx.ExecContext(ctx, `DELETE FROM check_history WHERE report_id = $1 AND email = $2`, reportID, email); err != nil {
		return fmt.Errorf("delete report history: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `DELETE FROM pdf_reports WHERE id = $1 AND email = $2`, reportID, email); err != nil {
		return fmt.Errorf("delete pdf report record: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit delete report transaction: %w", err)
	}
	committed = true

	removeFiles([]string{filePath})
	removeFiles(imagePaths)
	log.Printf("[Auth] Deleted report %s for %s", reportID, email)
	return nil
}

func removeFiles(paths []string) {
	for _, fp := range paths {
		if fp == "" {
			continue
		}
		if err := os.Remove(fp); err != nil && !os.IsNotExist(err) {
			log.Printf("[Auth] Warning: failed to remove file %s: %v", fp, err)
		}
	}
}

// Report represents a PDF report record.
type Report struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	URL       string    `json:"url"`
	FilePath  string    `json:"file_path"`
	CreatedAt time.Time `json:"created_at"`
	FileName  string    `json:"file_name"` // derived from file_path for download
}

// ReportsByEmail returns all reports for the given email, ordered by creation date descending.
func (s *Store) ReportsByEmail(ctx context.Context, email string) ([]Report, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, email, url, file_path, created_at
		FROM pdf_reports
		WHERE email = $1
		ORDER BY created_at DESC
	`, NormalizeEmail(email))
	if err != nil {
		return nil, fmt.Errorf("query reports: %w", err)
	}
	defer rows.Close()

	var reports []Report
	for rows.Next() {
		var r Report
		if err := rows.Scan(&r.ID, &r.Email, &r.URL, &r.FilePath, &r.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan report: %w", err)
		}
		r.FileName = filepath.Base(r.FilePath)
		reports = append(reports, r)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration: %w", err)
	}
	return reports, nil
}

// ReportByID returns a single report by its ID.
func (s *Store) ReportByID(ctx context.Context, id string) (*Report, error) {
	var r Report
	err := s.db.QueryRowContext(ctx, `
		SELECT id, email, url, file_path, created_at
		FROM pdf_reports
		WHERE id = $1
	`, id).Scan(&r.ID, &r.Email, &r.URL, &r.FilePath, &r.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("query report: %w", err)
	}
	r.FileName = filepath.Base(r.FilePath)
	return &r, nil
}

// Deprecated: Use SaveReport instead.
func (s *Store) AddReport(email string, results []store.Result) {
	log.Printf("[Auth] AddReport is deprecated, use SaveReport. Called with email=%s results=%d", email, len(results))
}

func (s *Store) CreateSession(ctx context.Context, userID string, ttl time.Duration) (string, error) {
	token := newToken()
	tokenHash := HashToken(token)
	expiresAt := time.Now().UTC().Add(ttl)

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO auth_sessions (token_hash, user_id, expires_at)
		VALUES ($1, $2, $3)
	`, tokenHash, userID, expiresAt)
	if err != nil {
		return "", fmt.Errorf("create session: %w", err)
	}
	return token, nil
}

func (s *Store) UserBySessionToken(ctx context.Context, token string) (*User, error) {
	if token == "" {
		return nil, ErrInvalidSession
	}

	user := &User{}
	err := s.db.QueryRowContext(ctx, `
		SELECT u.id, u.email, u.password_hash, u.email_verified, u.plan, u.plan_expires_at, u.created_at
		FROM auth_sessions s
		JOIN auth_users u ON u.id = s.user_id
		WHERE s.token_hash = $1 AND s.expires_at > NOW()
	`, HashToken(token)).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.EmailVerified, &user.Plan, &user.PlanExpiresAt, &user.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrInvalidSession
		}
		return nil, fmt.Errorf("get session user: %w", err)
	}
	return user, nil
}

func (s *Store) DeleteSession(ctx context.Context, token string) error {
	if token == "" {
		return nil
	}
	_, err := s.db.ExecContext(ctx, `DELETE FROM auth_sessions WHERE token_hash = $1`, HashToken(token))
	return err
}

// ScanQuota returns usage in an exact rolling window for a pseudonymous subject key.
func (s *Store) ScanQuota(ctx context.Context, subjectKey, tier string, limit, windowDays int) (entitlements.ScanQuota, error) {
	quota := entitlements.ScanQuota{Tier: tier, Limited: true, Limit: limit, WindowDays: windowDays}
	if subjectKey == "" || limit <= 0 || windowDays <= 0 {
		quota.Remaining = limit
		return quota, nil
	}

	var oldest sql.NullTime
	err := s.db.QueryRowContext(ctx, `
		SELECT COUNT(*), MIN(accepted_at)
		FROM scan_usage_events
		WHERE subject_key = $1
			AND accepted_at > NOW() - ($2 * INTERVAL '1 day')
	`, subjectKey, windowDays).Scan(&quota.Used, &oldest)
	if err != nil {
		return quota, fmt.Errorf("query scan quota: %w", err)
	}
	quota.Remaining = limit - quota.Used
	if quota.Remaining < 0 {
		quota.Remaining = 0
	}
	if quota.Remaining == 0 && oldest.Valid {
		next := oldest.Time.Add(time.Duration(windowDays) * 24 * time.Hour)
		quota.NextAvailableAt = &next
	}
	return quota, nil
}

// ConsumeScanAttempt atomically reserves one accepted scan in the rolling window.
func (s *Store) ConsumeScanAttempt(ctx context.Context, subjectKey, tier string, limit, windowDays int) (entitlements.ScanQuota, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return entitlements.ScanQuota{}, fmt.Errorf("begin scan quota transaction: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, subjectKey); err != nil {
		return entitlements.ScanQuota{}, fmt.Errorf("lock scan quota: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `
		DELETE FROM scan_usage_events
		WHERE subject_key = $1
			AND accepted_at <= NOW() - ($2 * INTERVAL '1 day')
	`, subjectKey, windowDays); err != nil {
		return entitlements.ScanQuota{}, fmt.Errorf("delete expired scan usage: %w", err)
	}

	quota := entitlements.ScanQuota{Tier: tier, Limited: true, Limit: limit, WindowDays: windowDays}
	var oldest sql.NullTime
	if err := tx.QueryRowContext(ctx, `
		SELECT COUNT(*), MIN(accepted_at)
		FROM scan_usage_events
		WHERE subject_key = $1
	`, subjectKey).Scan(&quota.Used, &oldest); err != nil {
		return entitlements.ScanQuota{}, fmt.Errorf("count scan usage: %w", err)
	}
	if quota.Used >= limit {
		quota.Remaining = 0
		if oldest.Valid {
			next := oldest.Time.Add(time.Duration(windowDays) * 24 * time.Hour)
			quota.NextAvailableAt = &next
		}
		return quota, ErrScanLimit
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO scan_usage_events (id, subject_key, accepted_at)
		VALUES ($1, $2, NOW())
	`, newID(), subjectKey); err != nil {
		return entitlements.ScanQuota{}, fmt.Errorf("insert scan usage: %w", err)
	}
	quota.Used++
	quota.Remaining = limit - quota.Used
	if err := tx.Commit(); err != nil {
		return entitlements.ScanQuota{}, fmt.Errorf("commit scan quota: %w", err)
	}
	return quota, nil
}

// TransferScanUsage moves current guest usage to the authenticated account.
func (s *Store) TransferScanUsage(ctx context.Context, fromSubject, toSubject string) error {
	if fromSubject == "" || toSubject == "" || fromSubject == toSubject {
		return nil
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin scan usage transfer: %w", err)
	}
	defer func() { _ = tx.Rollback() }()
	first, second := fromSubject, toSubject
	if second < first {
		first, second = second, first
	}
	if _, err := tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, first); err != nil {
		return fmt.Errorf("lock source scan usage: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, second); err != nil {
		return fmt.Errorf("lock destination scan usage: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `UPDATE scan_usage_events SET subject_key = $2 WHERE subject_key = $1`, fromSubject, toSubject); err != nil {
		return fmt.Errorf("transfer scan usage: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit scan usage transfer: %w", err)
	}
	return nil
}

func (s *Store) CleanupScanUsage(ctx context.Context, windowDays int) error {
	if windowDays <= 0 {
		windowDays = 30
	}
	_, err := s.db.ExecContext(ctx, `
		DELETE FROM scan_usage_events
		WHERE accepted_at <= NOW() - ($1 * INTERVAL '1 day')
	`, windowDays)
	if err != nil {
		return fmt.Errorf("cleanup scan usage: %w", err)
	}
	return nil
}

// ImageRecord represents a stored check image.
type ImageRecord struct {
	ID        string    `json:"id"`
	ReqID     string    `json:"req_id"`
	FilePath  string    `json:"file_path"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// SaveImage inserts a new image record into check_images table with the given imageID.
// Sets check_id from check_history if available.
func (s *Store) SaveImage(ctx context.Context, imageID, reqID, filePath string) error {
	var checkID sql.NullString
	var historyExpiresAt sql.NullTime
	err := s.db.QueryRowContext(ctx, `
		SELECT id, expires_at FROM check_history WHERE req_id = $1 LIMIT 1
	`, reqID).Scan(&checkID, &historyExpiresAt)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("query check_id: %w", err)
	}

	var checkIDValue any
	var expiresAtValue any = time.Now().UTC().Add(7 * 24 * time.Hour)
	if checkID.Valid {
		checkIDValue = checkID.String
		if historyExpiresAt.Valid {
			expiresAtValue = historyExpiresAt.Time
		} else {
			expiresAtValue = nil
		}
	}

	_, err = s.db.ExecContext(ctx, `
		INSERT INTO check_images (id, req_id, check_id, file_path, created_at, expires_at)
		VALUES ($1, $2, $3, $4, NOW(), $5)
	`, imageID, reqID, checkIDValue, filePath, expiresAtValue)
	if err != nil {
		return fmt.Errorf("save image record: %w", err)
	}
	log.Printf("[Auth] Image saved: id=%s req_id=%s check_id=%v path=%s", imageID, reqID, checkIDValue, filePath)
	return nil
}

func (s *Store) AttachImagesToCheckHistory(ctx context.Context, reqID, checkID string) error {
	if reqID == "" || checkID == "" {
		return nil
	}
	_, err := s.db.ExecContext(ctx, `
		UPDATE check_images AS i
		SET check_id = h.id,
			expires_at = h.expires_at
		FROM check_history AS h
		WHERE i.req_id = $1
			AND h.id = $2
			AND h.req_id = i.req_id
	`, reqID, checkID)
	if err != nil {
		return fmt.Errorf("attach images to check history: %w", err)
	}
	return nil
}

func (s *Store) ImagePathsForPayload(ctx context.Context, reqID string, payload store.ReportPayload) (map[string]string, error) {
	ids := make(map[string]struct{})
	if payload.ScreenshotID != "" {
		ids[payload.ScreenshotID] = struct{}{}
	}
	for _, check := range payload.Checks {
		for _, imageID := range check.Images {
			if imageID != "" {
				ids[imageID] = struct{}{}
			}
		}
	}

	paths := make(map[string]string)
	if reqID != "" {
		rows, err := s.db.QueryContext(ctx, `
			SELECT id, file_path FROM check_images WHERE req_id = $1
		`, reqID)
		if err != nil {
			return nil, fmt.Errorf("query image paths by req_id: %w", err)
		}
		defer rows.Close()
		for rows.Next() {
			var id, filePath string
			if err := rows.Scan(&id, &filePath); err != nil {
				return nil, fmt.Errorf("scan image path: %w", err)
			}
			paths[id] = filePath
		}
		if err := rows.Err(); err != nil {
			return nil, fmt.Errorf("image path rows iteration: %w", err)
		}
	}

	for imageID := range ids {
		if _, ok := paths[imageID]; ok {
			continue
		}
		var filePath string
		err := s.db.QueryRowContext(ctx, `
			SELECT file_path FROM check_images WHERE id = $1
		`, imageID).Scan(&filePath)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}
			return nil, fmt.Errorf("query image path %s: %w", imageID, err)
		}
		paths[imageID] = filePath
	}

	return paths, nil
}

// GetImage returns the image record by ID. Returns nil if not found or expired.
func (s *Store) GetImage(ctx context.Context, imageID string) (*ImageRecord, error) {
	var r ImageRecord
	var expiresAt sql.NullTime
	err := s.db.QueryRowContext(ctx, `
		SELECT id, req_id, file_path, created_at, expires_at
		FROM check_images
		WHERE id = $1 AND (expires_at IS NULL OR expires_at > NOW())
	`, imageID).Scan(&r.ID, &r.ReqID, &r.FilePath, &r.CreatedAt, &expiresAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("query image: %w", err)
	}
	if expiresAt.Valid {
		r.ExpiresAt = expiresAt.Time
	}
	return &r, nil
}

func (s *Store) ImageBelongsToEmail(ctx context.Context, imageID, email string) (bool, error) {
	var allowed bool
	err := s.db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM check_images i
			JOIN check_history h ON h.req_id = i.req_id
			WHERE i.id = $1
				AND h.email = $2
				AND (i.expires_at IS NULL OR i.expires_at > NOW())
		)
	`, imageID, NormalizeEmail(email)).Scan(&allowed)
	if err != nil {
		return false, fmt.Errorf("check image ownership: %w", err)
	}
	return allowed, nil
}

// MarkImagesForDeletion sets expires_at = NOW() for all images associated with the given reqID.
func (s *Store) MarkImagesForDeletion(ctx context.Context, reqID string) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE check_images
		SET expires_at = NOW()
		WHERE req_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
	`, reqID)
	if err != nil {
		return fmt.Errorf("mark images for deletion: %w", err)
	}
	return nil
}

// DeleteExpiredImages deletes all expired image records with check_id IS NULL and returns their file paths for disk cleanup.
func (s *Store) DeleteExpiredImages(ctx context.Context) ([]string, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT file_path FROM check_images WHERE expires_at <= NOW() AND check_id IS NULL
	`)
	if err != nil {
		return nil, fmt.Errorf("query expired images: %w", err)
	}
	defer rows.Close()

	var paths []string
	for rows.Next() {
		var fp string
		if err := rows.Scan(&fp); err != nil {
			return nil, fmt.Errorf("scan expired image path: %w", err)
		}
		paths = append(paths, fp)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration: %w", err)
	}

	if len(paths) > 0 {
		result, err := s.db.ExecContext(ctx, `DELETE FROM check_images WHERE expires_at <= NOW() AND check_id IS NULL`)
		if err != nil {
			return nil, fmt.Errorf("delete expired images: %w", err)
		}
		deleted, _ := result.RowsAffected()
		log.Printf("[Auth] Deleted %d expired image records from DB", deleted)
	}

	return paths, nil
}

func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func NewPublicID() string {
	return newID()
}

func newID() string {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	return hex.EncodeToString(buf)
}

func newToken() string {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	return base64.RawURLEncoding.EncodeToString(buf)
}

var unsafeFileBaseChars = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func sanitizeFileBase(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return "report"
	}
	value = unsafeFileBaseChars.ReplaceAllString(value, "_")
	value = strings.Trim(value, "._-")
	if value == "" {
		return "report"
	}
	if len(value) > 80 {
		value = value[:80]
	}
	return value
}
