package models

import "github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/entitlements"

type CheckRequest struct {
	URL      string `json:"url"`
	Type     string `json:"type"`
	ReqID    string `json:"req-id"`
	Fallback string `json:"fallback"`
}

type CheckResponse struct {
	Code  string `json:"code"`
	ReqID string `json:"req-id"`
	Data  any    `json:"data,omitempty"`
	Msg   string `json:"msg,omitempty"`
}

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type AuthUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	CreatedAt     string `json:"created_at"`
	Plan          string `json:"plan"`
	PlanExpiresAt string `json:"plan_expires_at,omitempty"`
}

type GuestInfo struct {
	Limit     int `json:"limit"`
	Used      int `json:"used"`
	Remaining int `json:"remaining"`
}

type MeResponse struct {
	User  *AuthUser `json:"user"`
	Guest GuestInfo `json:"guest"`
}

type ProgressUpdate struct {
	Code      string   `json:"code"`
	ReqID     string   `json:"req-id"`
	Data      any      `json:"data,omitempty"`
	Msg       string   `json:"msg,omitempty"`
	Completed []string `json:"completed,omitempty"`
	Errors    []string `json:"errors,omitempty"`
	Status    string   `json:"status,omitempty"`
	Progress  int      `json:"progress,omitempty"`
	UserEmail string   `json:"user-email,omitempty"`
}

type SslInfo struct {
	Issuer                  string   `json:"issuer"`
	ValidFrom               int64    `json:"validFrom"`
	ValidTo                 int64    `json:"validTo"`
	Protocol                string   `json:"protocol"`
	SubjectName             string   `json:"subjectName"`
	SubjectAlternativeNames []string `json:"subjectAlternativeNames"`
}

type ReportPayload struct {
	Checks       []CheckResult `json:"checks"`
	ScreenshotID string        `json:"screenshotId,omitempty"`
	SSL          *SslInfo      `json:"ssl,omitempty"`
	About        string        `json:"about,omitempty"`
	Country      string        `json:"country,omitempty"`
}

type TaskState struct {
	ReqID        string                   `json:"req-id"`
	URL          string                   `json:"url"`
	Type         string                   `json:"type"`
	Status       string                   `json:"status"`
	Worker       string                   `json:"worker,omitempty"`
	Progress     int                      `json:"progress"`
	Results      []CheckResult            `json:"results"`
	ScreenshotID string                   `json:"screenshotId,omitempty"`
	SSL          *SslInfo                 `json:"ssl,omitempty"`
	About        string                   `json:"about,omitempty"`
	Country      string                   `json:"country,omitempty"`
	Errors       []string                 `json:"errors"`
	ScanProfile  entitlements.ScanProfile `json:"scan_profile"`
}

type CheckResult struct {
	ID     string   `json:"id"`
	Result string   `json:"result"`
	Pages  []string `json:"pages,omitempty"`
	About  string   `json:"about,omitempty"`
	Images []string `json:"images,omitempty"`
	Data   any      `json:"data,omitempty"`
}

var ErrorCodes = map[string]string{
	"ERR_OK":                  "ok",
	"ERR_INTERNAL":            "internal error",
	"ERR_INVALID_URL":         "invalid URL",
	"ERR_INVALID_TYPE":        "invalid check type",
	"ERR_UNAUTHORIZED":        "unauthorized",
	"ERR_FORBIDDEN":           "forbidden",
	"ERR_GUEST_LIMIT":         "guest check limit reached",
	"ERR_SCAN_LIMIT":          "free scan limit reached",
	"ERR_INVALID_CREDENTIALS": "invalid credentials",
	"ERR_EMAIL_EXISTS":        "email already exists",
	"ERR_WEAK_PASSWORD":       "password is too weak",
	"ERR_PAGE_OPEN_TIMEOUT":   "page open timeout",
	"ERR_AI_FAILED":           "AI check failed",
	"ERR_CONCURRENCY_LIMIT":   "max concurrency reached",
	"ERR_PAGE_TOO_LARGE":      "page too large",
	"ERR_WORKER_UNAVAILABLE":  "no workers available",
}
