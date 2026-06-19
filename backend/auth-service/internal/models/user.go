package models

import "time"

// User represents a user in the database.
type User struct {
	ID                     int64     `json:"id"`
	Email                  string    `json:"email"`
	Name                   string    `json:"name"`
	Surname                string    `json:"surname"`
	PasswordHash           string    `json:"-"`
	EmailVerified          bool      `json:"email_verified"`
	VerificationToken      *string   `json:"-"`
	VerificationSentAt     *time.Time `json:"-"`
	RefreshToken           *string   `json:"-"`
	RefreshTokenExpiresAt  *time.Time `json:"-"`
	CreatedAt              time.Time `json:"created_at"`
	UpdatedAt              time.Time `json:"updated_at"`
}

// RegisterRequest is the payload for POST /api/v1/auth/register.
type RegisterRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Surname  string `json:"surname"`
	Password string `json:"password"`
}

// LoginRequest is the payload for POST /api/v1/auth/login.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RefreshRequest is the payload for POST /api/v1/auth/refresh.
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// TokenPair is the response for successful login/refresh.
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"` // seconds
}

// APIResponse is a generic API response.
type APIResponse struct {
	Code    string      `json:"code"`
	Msg     string      `json:"msg"`
	Data    interface{} `json:"data,omitempty"`
	DevInfo string      `json:"dev_info,omitempty"` // only in development mode
}