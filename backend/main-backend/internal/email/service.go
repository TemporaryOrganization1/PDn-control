package email

import (
	"encoding/base64"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"
	"time"
)

type Service struct {
	host     string
	port     string
	username string
	password string
	from     string
}

// encodeRFC2047 encodes a string for use in an email header field
// according to RFC 2047, for non-ASCII characters (like Russian).
func encodeRFC2047(s string) string {
	// Check if encoding is needed
	for _, r := range s {
		if r > 127 {
			return "=?UTF-8?B?" + base64.StdEncoding.EncodeToString([]byte(s)) + "?="
		}
	}
	return s
}

func NewService() (*Service, error) {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USER")
	password := os.Getenv("SMTP_PASSWORD")

	log.Printf("[Email] Initializing email service with SMTP_HOST=%s, SMTP_PORT=%s, SMTP_USER=%s", host, port, username)

	if host == "" || port == "" || username == "" || password == "" {
		return nil, fmt.Errorf("SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD")
	}

	// Use username as from address if it contains @, otherwise use as-is
	from := username
	if !strings.Contains(from, "@") {
		// If username doesn't have @, append domain from host
		from = username + "@" + host
	}

	log.Printf("[Email] Service initialized successfully. From address: %s", from)
	log.Printf("[Email] NOTE: If email sending times out, try using port 587 instead of 465, or check Docker network/firewall settings")

	return &Service{
		host:     host,
		port:     port,
		username: username,
		password: password,
		from:     from,
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
	addr := fmt.Sprintf("%s:%s", s.host, s.port)
	log.Printf("[Email] Attempting to send email to %s via %s", to, addr)
	log.Printf("[Email] From: %s, Subject: %s", s.from, subject)

	auth := smtp.PlainAuth("", s.username, s.password, s.host)

	// Encode subject with RFC 2047 for non-ASCII characters (Russian)
	encodedSubject := encodeRFC2047(subject)

	headers := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-version: 1.0\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n\r\n",
		s.from, to, encodedSubject)

	message := headers + body

	// Use a channel to handle timeout
	type result struct {
		err error
	}
	done := make(chan result, 1)

	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[Email] PANIC in sendEmail: %v", r)
				done <- result{err: fmt.Errorf("panic: %v", r)}
			}
		}()
		err := smtp.SendMail(addr, auth, s.from, []string{to}, []byte(message))
		done <- result{err: err}
	}()

	// Wait for completion or timeout after 15 seconds
	select {
	case res := <-done:
		if res.err != nil {
			log.Printf("[Email] Failed to send email to %s: %v", to, res.err)
			return fmt.Errorf("send email: %w", res.err)
		}
		log.Printf("[Email] Successfully sent email to %s", to)
		return nil
	case <-time.After(15 * time.Second):
		log.Printf("[Email] Timeout sending email to %s: operation took too long (possible network/firewall issue)", to)
		return fmt.Errorf("send email: timeout after 15 seconds - check SMTP connectivity and firewall settings")
	}
}