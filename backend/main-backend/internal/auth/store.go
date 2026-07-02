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
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/pdfGen"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
)

var (
	ErrUserExists     = errors.New("user already exists")
	ErrInvalidSession = errors.New("invalid session")
	ErrGuestLimit     = errors.New("guest limit reached")
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type GuestStats struct {
	Limit     int `json:"limit"`
	Used      int `json:"used"`
	Remaining int `json:"remaining"`
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
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS auth_sessions (
			token_hash TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
			expires_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at)`,
		`CREATE TABLE IF NOT EXISTS guest_usage (
			guest_id TEXT PRIMARY KEY,
			used INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
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
func (s *Store) SaveReport(ctx context.Context, email, targetURL, reqID string, results []store.Result) (string, error) {
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

	if err := pdfGen.GeneratePDFReport(targetURL, results, filePath); err != nil {
		return "", fmt.Errorf("generate pdf report: %w", err)
	}

	_, err := s.db.ExecContext(ctx, `
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
	ID        string         `json:"id"`
	Email     string         `json:"email,omitempty"`
	ReqID     string         `json:"req_id"`
	URL       string         `json:"url"`
	CheckType string         `json:"check_type"`
	Status    string         `json:"status"`
	ReportID  string         `json:"report_id"`
	CreatedAt time.Time      `json:"created_at"`
	FileName  string         `json:"file_name"`
	Results   []store.Result `json:"results,omitempty"`
}

// SaveCheckHistory upserts a completed check independently from PDF generation.
func (s *Store) SaveCheckHistory(ctx context.Context, email, reqID, targetURL, checkType, status string, results []store.Result) (*CheckHistory, error) {
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

	resultsJSON, err := json.Marshal(results)
	if err != nil {
		return nil, fmt.Errorf("marshal check results: %w", err)
	}

	h := &CheckHistory{}
	err = s.db.QueryRowContext(ctx, `
		INSERT INTO check_history (id, email, req_id, url, check_type, status, results_json, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
		ON CONFLICT (req_id) DO UPDATE
		SET email = EXCLUDED.email,
			url = EXCLUDED.url,
			check_type = EXCLUDED.check_type,
			status = EXCLUDED.status,
			results_json = EXCLUDED.results_json
		RETURNING id, email, req_id, url, check_type, status, COALESCE(report_id, ''), created_at
	`, newID(), email, reqID, targetURL, checkType, status, string(resultsJSON)).
		Scan(&h.ID, &h.Email, &h.ReqID, &h.URL, &h.CheckType, &h.Status, &h.ReportID, &h.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("save check history: %w", err)
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
			COALESCE(h.results_json, '[]'::jsonb)
		FROM check_history h
		LEFT JOIN pdf_reports r ON r.id = h.report_id
		WHERE h.email = $1
			AND h.report_id IS NOT NULL
			AND h.report_id <> ''
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
		if err := rows.Scan(&h.ID, &h.Email, &h.ReqID, &h.URL, &h.CheckType, &h.Status, &h.ReportID, &h.CreatedAt, &filePath, &rawResults); err != nil {
			return nil, fmt.Errorf("scan check history: %w", err)
		}
		if filePath != "" {
			h.FileName = filepath.Base(filePath)
		}
		if len(rawResults) > 0 {
			if err := json.Unmarshal(rawResults, &h.Results); err != nil {
				return nil, fmt.Errorf("unmarshal check history results: %w", err)
			}
		}
		history = append(history, h)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("history rows iteration: %w", err)
	}
	return history, nil
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
		ID:           newID(),
		Email:        NormalizeEmail(email),
		PasswordHash: passwordHash,
		CreatedAt:    time.Now().UTC(),
	}
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO auth_users (id, email, password_hash, created_at)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at
	`, user.ID, user.Email, user.PasswordHash, user.CreatedAt).Scan(&user.CreatedAt)
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
		SELECT id, email, password_hash, created_at
		FROM auth_users
		WHERE email = $1
	`, NormalizeEmail(email)).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)
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

	log.Printf("[Auth] User %s (%s) deleted successfully", userID, email)
	return nil
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
		SELECT u.id, u.email, u.password_hash, u.created_at
		FROM auth_sessions s
		JOIN auth_users u ON u.id = s.user_id
		WHERE s.token_hash = $1 AND s.expires_at > NOW()
	`, HashToken(token)).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)
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

func (s *Store) GuestStats(ctx context.Context, guestID string, limit int) (GuestStats, error) {
	stats := GuestStats{Limit: limit, Remaining: limit}
	if guestID == "" {
		return stats, nil
	}

	err := s.db.QueryRowContext(ctx, `
		SELECT used
		FROM guest_usage
		WHERE guest_id = $1
	`, guestID).Scan(&stats.Used)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return stats, fmt.Errorf("get guest usage: %w", err)
	}
	stats.Remaining = limit - stats.Used
	if stats.Remaining < 0 {
		stats.Remaining = 0
	}
	return stats, nil
}

func (s *Store) ConsumeGuestAttempt(ctx context.Context, guestID string, limit int) (GuestStats, error) {
	stats := GuestStats{Limit: limit}
	err := s.db.QueryRowContext(ctx, `
		INSERT INTO guest_usage (guest_id, used, created_at, updated_at)
		VALUES ($1, 1, NOW(), NOW())
		ON CONFLICT (guest_id) DO UPDATE
		SET used = guest_usage.used + 1, updated_at = NOW()
		WHERE guest_usage.used < $2
		RETURNING used
	`, guestID, limit).Scan(&stats.Used)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return GuestStats{Limit: limit, Used: limit, Remaining: 0}, ErrGuestLimit
		}
		return stats, fmt.Errorf("consume guest attempt: %w", err)
	}
	stats.Remaining = limit - stats.Used
	if stats.Remaining < 0 {
		stats.Remaining = 0
	}
	return stats, nil
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
