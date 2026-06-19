package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Config holds PostgreSQL connection parameters.
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// Store wraps a pgx connection pool.
type Store struct {
	pool *pgxpool.Pool
}

// NewStore creates a new connection pool and verifies connectivity.
func NewStore(ctx context.Context, cfg Config) (*Store, error) {
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.DBName,
	)

	poolCfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("parse pool config: %w", err)
	}
	poolCfg.MaxConns = 5
	poolCfg.MinConns = 1

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("create pool: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		return nil, fmt.Errorf("ping database: %w", err)
	}

	log.Println("[DB] Connected to PostgreSQL")
	return &Store{pool: pool}, nil
}

// Close shuts down the connection pool.
func (s *Store) Close() {
	s.pool.Close()
	log.Println("[DB] Connection pool closed")
}

// Migrate creates the required tables if they don't exist.
func (s *Store) Migrate(ctx context.Context) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id                      BIGSERIAL PRIMARY KEY,
			email                   VARCHAR(255) NOT NULL UNIQUE,
			name                    VARCHAR(100) NOT NULL,
			surname                 VARCHAR(100) NOT NULL,
			password_hash           VARCHAR(255) NOT NULL,
			email_verified          BOOLEAN NOT NULL DEFAULT FALSE,
			verification_token      VARCHAR(64),
			verification_sent_at    TIMESTAMPTZ,
			refresh_token           VARCHAR(512),
			refresh_token_expires_at TIMESTAMPTZ,
			created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
		`CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)`,
	}

	for _, q := range queries {
		if _, err := s.pool.Exec(ctx, q); err != nil {
			return fmt.Errorf("migrate: %w", err)
		}
	}
	log.Println("[DB] Migration completed")
	return nil
}

// CreateUser inserts a new user into the database.
func (s *Store) CreateUser(ctx context.Context, email, name, surname, passwordHash, verificationToken string) (*UserRow, error) {
	var user UserRow
	err := s.pool.QueryRow(ctx,
		`INSERT INTO users (email, name, surname, password_hash, verification_token, verification_sent_at, email_verified)
		 VALUES ($1, $2, $3, $4, $5, NOW(), TRUE)
		 RETURNING id, email, name, surname, email_verified, created_at, updated_at`,
		email, name, surname, passwordHash, verificationToken,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Surname, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by email.
func (s *Store) GetUserByEmail(ctx context.Context, email string) (*UserRow, error) {
	var user UserRow
	err := s.pool.QueryRow(ctx,
		`SELECT id, email, name, surname, password_hash, email_verified, created_at, updated_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Surname, &user.PasswordHash, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return &user, nil
}

// GetUserByID retrieves a user by their ID.
func (s *Store) GetUserByID(ctx context.Context, id int64) (*UserRow, error) {
	var user UserRow
	err := s.pool.QueryRow(ctx,
		`SELECT id, email, name, surname, password_hash, email_verified, created_at, updated_at
		 FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Surname, &user.PasswordHash, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return &user, nil
}

// SaveRefreshToken stores a refresh token for a user.
func (s *Store) SaveRefreshToken(ctx context.Context, userID int64, tokenHash string, expiresAt time.Time) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE users SET refresh_token = $1, refresh_token_expires_at = $2, updated_at = NOW() WHERE id = $3`,
		tokenHash, expiresAt, userID,
	)
	return err
}

// GetUserByRefreshToken retrieves a user by their refresh token.
func (s *Store) GetUserByRefreshToken(ctx context.Context, tokenHash string) (*UserRow, error) {
	var user UserRow
	err := s.pool.QueryRow(ctx,
		`SELECT id, email, name, surname, password_hash, email_verified, created_at, updated_at
		 FROM users WHERE refresh_token = $1 AND refresh_token_expires_at > NOW()`,
		tokenHash,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Surname, &user.PasswordHash, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("get user by refresh token: %w", err)
	}
	return &user, nil
}

// InvalidateRefreshToken removes the refresh token from a user.
func (s *Store) InvalidateRefreshToken(ctx context.Context, tokenHash string) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE users SET refresh_token = NULL, refresh_token_expires_at = NULL, updated_at = NOW() WHERE refresh_token = $1`,
		tokenHash,
	)
	return err
}

// UserRow represents a user row retrieved from the database.
type UserRow struct {
	ID             int64     `json:"id"`
	Email          string    `json:"email"`
	Name           string    `json:"name"`
	Surname        string    `json:"surname"`
	PasswordHash   string    `json:"-"`
	EmailVerified  bool      `json:"email_verified"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}