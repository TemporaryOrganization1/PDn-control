package email

import (
	"fmt"
	"net/smtp"
	"strings"
)

// Config holds SMTP configuration for sending emails.
// Currently reserved for future use — email sending is not active yet.
type Config struct {
	SMTPHost string
	SMTPPort string
	Username string
	Password string
	From     string
}

// Sender handles sending emails via SMTP.
type Sender struct {
	config Config
}

// NewSender creates a new email sender.
func NewSender(cfg Config) *Sender {
	return &Sender{config: cfg}
}

// SendVerificationEmail sends a verification email to the user.
// NOTE: This function is implemented but not yet called.
// It will be activated when SMTP is configured.
func (s *Sender) SendVerificationEmail(to, name, verificationURL string) error {
	subject := "Verify your email - PDn-control"

	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h2>Welcome to PDn-control!</h2>
	<p>Hi %s,</p>
	<p>Thank you for registering. Please click the button below to verify your email:</p>
	<a href="%s"
		style="display: inline-block; padding: 12px 24px; background-color: #4CAF50;
			   color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
		Verify Email
	</a>
	<p style="margin-top: 20px;">Or copy this link into your browser:</p>
	<p style="word-break: break-all; color: #666;">%s</p>
	<hr>
	<p style="color: #999; font-size: 12px;">
		This link expires in 24 hours. If you did not create this account, please ignore this email.
	</p>
</body>
</html>`, name, verificationURL, verificationURL)

	return s.send(to, subject, body)
}

func (s *Sender) send(to, subject, htmlBody string) error {
	headers := make(map[string]string)
	headers["From"] = s.config.From
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	addr := fmt.Sprintf("%s:%s", s.config.SMTPHost, s.config.SMTPPort)

	var auth smtp.Auth
	if s.config.Username != "" {
		auth = smtp.PlainAuth("", s.config.Username, s.config.Password, s.config.SMTPHost)
	}

	return smtp.SendMail(addr, auth, s.config.From, []string{to}, []byte(msg.String()))
}