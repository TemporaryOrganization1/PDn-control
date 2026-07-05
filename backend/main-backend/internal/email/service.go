package email

import (
	"context"
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net"
	"net/smtp"
	"os"
	"strings"
	"time"
)

const smtpSendTimeout = 15 * time.Second

type Service struct {
	host       string
	port       string
	serverName string
	network    string
	username   string
	password   string
	from       string
}

// encodeRFC2047 encodes a string for use in an email header field
// according to RFC 2047, for non-ASCII characters (like Russian).
func encodeRFC2047(s string) string {
	for _, r := range s {
		if r > 127 {
			return "=?UTF-8?B?" + base64.StdEncoding.EncodeToString([]byte(s)) + "?="
		}
	}
	return s
}

func NewService() (*Service, error) {
	host := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	port := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	serverName := strings.TrimSpace(os.Getenv("SMTP_SERVER_NAME"))
	network := strings.TrimSpace(os.Getenv("SMTP_NETWORK"))
	username := strings.TrimSpace(os.Getenv("SMTP_USER"))
	password := os.Getenv("SMTP_PASSWORD")
	from := strings.TrimSpace(os.Getenv("SMTP_FROM"))

	if serverName == "" {
		serverName = host
	}
	if network == "" {
		network = "tcp"
	}

	log.Printf("[Email] Initializing email service with SMTP_HOST=%s, SMTP_PORT=%s, SMTP_SERVER_NAME=%s, SMTP_NETWORK=%s, SMTP_USER=%s, SMTP_PASSWORD_SET=%t", host, port, serverName, network, username, password != "")

	if host == "" || port == "" {
		return nil, fmt.Errorf("SMTP configuration is incomplete. Please set SMTP_HOST and SMTP_PORT")
	}
	if network != "tcp" && network != "tcp4" && network != "tcp6" {
		return nil, fmt.Errorf("SMTP_NETWORK must be tcp, tcp4, or tcp6")
	}
	if (username == "") != (password == "") {
		return nil, fmt.Errorf("SMTP authentication configuration is incomplete. Set both SMTP_USER and SMTP_PASSWORD, or leave both blank for an unauthenticated relay")
	}

	if from == "" && username != "" {
		from = username
	}
	if from == "" {
		from = "no-reply@pdn-control.local"
	} else if !strings.Contains(from, "@") {
		from = from + "@" + host
	}

	log.Printf("[Email] Service initialized successfully. From address: %s", from)
	log.Printf("[Email] NOTE: SMTP send uses an explicit %s timeout and stage-by-stage diagnostics", smtpSendTimeout)

	return &Service{
		host:       host,
		port:       port,
		serverName: serverName,
		network:    network,
		username:   username,
		password:   password,
		from:       from,
	}, nil
}

func (s *Service) SendVerificationEmail(toEmail, token string) error {
	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost"
	}
	verificationLink := fmt.Sprintf("%s/verify-email?token=%s", baseURL, token)

	subject := "Подтверждение почты в PDnControl"
	body := fmt.Sprintf(`Здравствуйте!

Вы зарегистрировались в сервисе PDnControl. Для подтверждения email адреса и активации аккаунта, пожалуйста, перейдите по ссылке:

%s

Ссылка действительна в течение 15 минут.

Если вы не регистрировались в нашем сервисе, проигнорируйте это письмо.

С уважением,
Команда поддержки
`, verificationLink)

	return s.sendEmail(toEmail, subject, body)
}

func (s *Service) sendEmail(to, subject, body string) error {
	addr := net.JoinHostPort(s.host, s.port)
	log.Printf("[Email] Attempting to send email to %s via %s", to, addr)
	log.Printf("[Email] From: %s, Subject: %s", s.from, subject)

	encodedSubject := encodeRFC2047(subject)
	headers := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-version: 1.0\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n\r\n",
		s.from, to, encodedSubject)
	message := headers + body

	ctx, cancel := context.WithTimeout(context.Background(), smtpSendTimeout)
	defer cancel()

	if err := s.sendSMTP(ctx, addr, to, message); err != nil {
		log.Printf("[Email] Failed to send email to %s: %v", to, err)
		return fmt.Errorf("send email: %w", err)
	}

	log.Printf("[Email] Successfully sent email to %s", to)
	return nil
}

func (s *Service) sendSMTP(ctx context.Context, addr, to, message string) error {
	conn, err := s.dialSMTP(ctx, addr)
	if err != nil {
		return err
	}
	closedBySMTP := false
	defer func() {
		if closedBySMTP {
			return
		}
		if err := conn.Close(); err != nil {
			log.Printf("[Email][SMTP] close warning: %v", err)
		}
	}()

	if deadline, ok := ctx.Deadline(); ok {
		if err := conn.SetDeadline(deadline); err != nil {
			return fmt.Errorf("smtp deadline: %w", err)
		}
	}

	log.Printf("[Email][SMTP] client: creating SMTP client")
	client, err := smtp.NewClient(conn, s.serverName)
	if err != nil {
		return fmt.Errorf("smtp client: %w", err)
	}

	defer func() {
		if closedBySMTP {
			return
		}
		if err := client.Close(); err != nil {
			log.Printf("[Email][SMTP] client close warning: %v", err)
		}
		closedBySMTP = true
	}()

	log.Printf("[Email][SMTP] EHLO: start")
	if err := client.Hello("pdn-control"); err != nil {
		return fmt.Errorf("smtp ehlo: %w", err)
	}
	log.Printf("[Email][SMTP] EHLO: ok")

	if err := s.startTLSIfNeeded(client); err != nil {
		return err
	}

	if s.username != "" {
		log.Printf("[Email][SMTP] AUTH: start for SMTP_USER=%s", s.username)
		if err := client.Auth(smtp.PlainAuth("", s.username, s.password, s.serverName)); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
		log.Printf("[Email][SMTP] AUTH: ok")
	} else {
		log.Printf("[Email][SMTP] AUTH: skipped because SMTP_USER is empty")
	}

	log.Printf("[Email][SMTP] MAIL FROM: %s", s.from)
	if err := client.Mail(s.from); err != nil {
		return fmt.Errorf("smtp mail from: %w", err)
	}

	log.Printf("[Email][SMTP] RCPT TO: %s", to)
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("smtp rcpt to: %w", err)
	}

	log.Printf("[Email][SMTP] DATA: start")
	data, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp data: %w", err)
	}
	if _, err := io.WriteString(data, message); err != nil {
		_ = data.Close()
		return fmt.Errorf("smtp data write: %w", err)
	}
	if err := data.Close(); err != nil {
		return fmt.Errorf("smtp data close: %w", err)
	}
	log.Printf("[Email][SMTP] DATA: accepted")

	log.Printf("[Email][SMTP] QUIT: start")
	if err := client.Quit(); err != nil {
		return fmt.Errorf("smtp quit: %w", err)
	}
	closedBySMTP = true
	log.Printf("[Email][SMTP] QUIT: ok")
	return nil
}

func (s *Service) dialSMTP(ctx context.Context, addr string) (net.Conn, error) {
	dialer := &net.Dialer{
		Timeout:   smtpSendTimeout,
		KeepAlive: 30 * time.Second,
	}

	if s.port == "465" {
		log.Printf("[Email][SMTP] dial: opening implicit TLS connection to %s over %s", addr, s.network)
		conn, err := (&tls.Dialer{
			NetDialer: dialer,
			Config:    smtpTLSConfig(s.serverName),
		}).DialContext(ctx, s.network, addr)
		if err != nil {
			return nil, fmt.Errorf("smtp dial: %w", err)
		}
		log.Printf("[Email][SMTP] dial: ok")
		return conn, nil
	}

	log.Printf("[Email][SMTP] dial: opening TCP connection to %s over %s", addr, s.network)
	conn, err := dialer.DialContext(ctx, s.network, addr)
	if err != nil {
		return nil, fmt.Errorf("smtp dial: %w", err)
	}
	log.Printf("[Email][SMTP] dial: ok")
	return conn, nil
}

func (s *Service) startTLSIfNeeded(client *smtp.Client) error {
	if s.port == "465" {
		log.Printf("[Email][SMTP] STARTTLS: skipped because port 465 already uses implicit TLS")
		return nil
	}

	hasSTARTTLS, _ := client.Extension("STARTTLS")
	if !hasSTARTTLS {
		if s.port == "587" || s.username != "" {
			return fmt.Errorf("smtp starttls: server does not advertise STARTTLS")
		}
		log.Printf("[Email][SMTP] STARTTLS: skipped because server does not advertise STARTTLS")
		return nil
	}

	log.Printf("[Email][SMTP] STARTTLS: start")
	if err := client.StartTLS(smtpTLSConfig(s.serverName)); err != nil {
		return fmt.Errorf("smtp starttls: %w", err)
	}
	log.Printf("[Email][SMTP] STARTTLS: ok; EHLO repeated over TLS")
	return nil
}

func smtpTLSConfig(host string) *tls.Config {
	return &tls.Config{
		ServerName: host,
		MinVersion: tls.VersionTLS12,
	}
}
