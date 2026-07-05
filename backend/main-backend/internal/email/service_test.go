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
	if svc.serverName != "mailpit" || svc.network != "tcp" {
		t.Fatalf("service server/network = %s/%s, want mailpit/tcp", svc.serverName, svc.network)
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

func TestNewServiceAllowsProxyServerNameAndNetwork(t *testing.T) {
	t.Setenv("SMTP_HOST", "172.18.0.1")
	t.Setenv("SMTP_PORT", "1587")
	t.Setenv("SMTP_SERVER_NAME", "smtp.yandex.ru")
	t.Setenv("SMTP_NETWORK", "tcp4")
	t.Setenv("SMTP_USER", "sender@yandex.ru")
	t.Setenv("SMTP_PASSWORD", "secret")
	t.Setenv("SMTP_FROM", "sender@yandex.ru")

	svc, err := NewService()
	if err != nil {
		t.Fatalf("NewService() error = %v, want nil", err)
	}
	if svc.host != "172.18.0.1" || svc.serverName != "smtp.yandex.ru" || svc.network != "tcp4" {
		t.Fatalf("service host/server/network = %s/%s/%s, want proxy/yandex/tcp4", svc.host, svc.serverName, svc.network)
	}
}

func TestNewServiceRejectsInvalidNetwork(t *testing.T) {
	t.Setenv("SMTP_HOST", "smtp.example.com")
	t.Setenv("SMTP_PORT", "587")
	t.Setenv("SMTP_NETWORK", "udp")
	t.Setenv("SMTP_USER", "")
	t.Setenv("SMTP_PASSWORD", "")

	if _, err := NewService(); err == nil {
		t.Fatal("NewService() error = nil, want invalid network error")
	}
}
