package mailer

import (
	"encoding/json"
	"fmt"
	"net/smtp"
	"strings"
)

// SMTPMailer sends emails through an SMTP server without authentication,
// such as Mailcatcher in development.
type SMTPMailer struct {
	addr string
}

// NewSMTPMailer creates an SMTPMailer that talks to the server at addr ("host:port").
func NewSMTPMailer(addr string) *SMTPMailer {
	return &SMTPMailer{addr: addr}
}

// SendSimpleEmail sends a plain-text email.
func (m *SMTPMailer) SendSimpleEmail(toEmail, fromEmail, title, body string) error {
	msg := strings.Join([]string{
		"From: " + fromEmail,
		"To: " + toEmail,
		"Subject: " + title,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}, "\r\n")
	if err := smtp.SendMail(m.addr, nil, fromEmail, []string{toEmail}, []byte(msg)); err != nil {
		return fmt.Errorf("send email to %s: %w", toEmail, err)
	}
	return nil
}

// SendTemplatedEmail has no template engine to render with: it sends the
// template id as the subject and the template data as an indented JSON body.
func (m *SMTPMailer) SendTemplatedEmail(toEmail, fromEmail, templateId string, templateData map[string]any) error {
	data, err := json.MarshalIndent(templateData, "", "  ")
	if err != nil {
		return fmt.Errorf("encode template data of %s: %w", templateId, err)
	}
	return m.SendSimpleEmail(toEmail, fromEmail, templateId, string(data))
}
