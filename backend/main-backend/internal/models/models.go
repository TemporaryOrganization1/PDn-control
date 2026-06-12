package models

type CheckRequest struct {
	URL      string `json:"url"`
	Type     string `json:"type"`
	Secret   string `json:"secret"`
	ReqID    string `json:"req-id"`
	Fallback string `json:"fallback"`
}

type CheckResponse struct {
	Code  string `json:"code"`
	ReqID string `json:"req-id"`
	Data  any    `json:"data,omitempty"`
	Msg   string `json:"msg,omitempty"`
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
}

type TaskState struct {
	ReqID     string            `json:"req-id"`
	URL       string            `json:"url"`
	Type      string            `json:"type"`
	Status    string            `json:"status"`
	Worker    string            `json:"worker,omitempty"`
	Progress  int               `json:"progress"`
	Results   []CheckResult     `json:"results"`
	Errors    []string          `json:"errors"`
}

type CheckResult struct {
	ID     string `json:"id"`
	Result string `json:"result"`
	Pages  []string `json:"pages,omitempty"`
	About  string `json:"about,omitempty"`
}

var ErrorCodes = map[string]string{
	"ERR_OK":                  "ok",
	"ERR_INTERNAL":            "internal error",
	"ERR_INVALID_URL":         "invalid URL",
	"ERR_INVALID_TYPE":        "invalid check type",
	"ERR_UNAUTHORIZED":        "invalid secret",
	"ERR_PAGE_OPEN_TIMEOUT":   "page open timeout",
	"ERR_AI_FAILED":           "AI check failed",
	"ERR_CONCURRENCY_LIMIT":   "max concurrency reached",
	"ERR_PAGE_TOO_LARGE":      "page too large",
	"ERR_WORKER_UNAVAILABLE":  "no workers available",
}