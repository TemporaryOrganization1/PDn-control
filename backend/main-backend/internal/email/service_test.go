package email

import "testing"

func TestNewServiceAllowsLocalSMTPWithoutAuth(t *testing.T) {
	t.Setenv("SMTP_HOST", "mailpit")
	t.Setenv("SMTP_PORT", "1025")
	t.Setenv("SMTP_USER", "")
	t.Setenv("SMTP_PASSWORD", "")
	t.Setenv("SMTP_FROM", "")

	svc, err := NewService()
	if err != nil {
		t.Fatalf("NewService() error = %v, want nil", err)
	}
	if svc.host != "mailpit" || svc.port != "1025" {
		t.Fatalf("service address = %s:%s, want mailpit:1025", svc.host, svc.port)
	}
	if svc.username != "" || svc.password != "" {
		t.Fatalf("local SMTP auth = %q/%q, want blank", svc.username, svc.password)
	}
	if svc.from != "no-reply@pdn-control.local" {
		t.Fatalf("from = %q, want local default", svc.from)
	}
}

func TestNewServiceUsesAuthenticatedEmailAsDefaultFrom(t *testing.T) {
	t.Setenv("SMTP_HOST", "smtp.example.com")
	t.Setenv("SMTP_PORT", "587")
	t.Setenv("SMTP_USER", "sender@example.com")
	t.Setenv("SMTP_PASSWORD", "secret")
	t.Setenv("SMTP_FROM", "")

	svc, err := NewService()
	if err != nil {
		t.Fatalf("NewService() error = %v, want nil", err)
	}
	if svc.from != "sender@example.com" {
		t.Fatalf("from = %q, want SMTP_USER", svc.from)
	}
}

func TestNewServiceRejectsPartialAuth(t *testing.T) {
	t.Setenv("SMTP_HOST", "smtp.example.com")
	t.Setenv("SMTP_PORT", "587")
	t.Setenv("SMTP_USER", "sender@example.com")
	t.Setenv("SMTP_PASSWORD", "")

	if _, err := NewService(); err == nil {
		t.Fatal("NewService() error = nil, want partial auth error")
	}
}
