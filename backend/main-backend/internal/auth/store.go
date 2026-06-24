package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
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
	db *sql.DB
}

func NewStore(databaseURL string) (*Store, error) {
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

	s := &Store{db: db}
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
	}

	for _, stmt := range stmts {
		if _, err := s.db.ExecContext(ctx, stmt); err != nil {
			return fmt.Errorf("migrate auth database: %w", err)
		}
	}
	return nil
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
