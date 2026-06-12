package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Config holds the PostgreSQL connection parameters.
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// Store wraps the pgx connection pool and provides DB operations.
type Store struct {
	pool *pgxpool.Pool
}

// NewStore creates a new Store with a connection pool.
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

// Close closes the connection pool.
func (s *Store) Close() {
	s.pool.Close()
	log.Println("[DB] Connection pool closed")
}

// Migrate creates the geoip_updates table if it does not exist.
func (s *Store) Migrate(ctx context.Context) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS geoip_updates (
			id BIGSERIAL PRIMARY KEY,
			tag VARCHAR(100) NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			filesize BIGINT DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
	}

	for _, q := range queries {
		if _, err := s.pool.Exec(ctx, q); err != nil {
			return fmt.Errorf("migrate: %w", err)
		}
	}
	log.Println("[DB] Migration completed")
	return nil
}

// RecordUpdate logs an update event into PostgreSQL.
func (s *Store) RecordUpdate(ctx context.Context, tag, status string, filesize int64) error {
	_, err := s.pool.Exec(ctx,
		`INSERT INTO geoip_updates (tag, status, filesize) VALUES ($1, $2, $3)`,
		tag, status, filesize,
	)
	return err
}

// GetUpdateHistory returns the last N update records.
func (s *Store) GetUpdateHistory(ctx context.Context, limit int) ([]struct {
	ID        int
	Tag       string
	Status    string
	Filesize  int64
	CreatedAt string
}, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, tag, status, filesize, created_at::text
		 FROM geoip_updates ORDER BY created_at DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []struct {
		ID        int
		Tag       string
		Status    string
		Filesize  int64
		CreatedAt string
	}
	for rows.Next() {
		var r struct {
			ID        int
			Tag       string
			Status    string
			Filesize  int64
			CreatedAt string
		}
		if err := rows.Scan(&r.ID, &r.Tag, &r.Status, &r.Filesize, &r.CreatedAt); err != nil {
			return nil, err
		}
		results = append(results, r)
	}
	return results, nil
}