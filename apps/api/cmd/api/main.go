package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"ddd-second-hand-marketplace/pkg/mailer"
)

func main() {
	mail := newMailer()
	_ = mail // inject it into the use cases that send emails

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	fmt.Println("Server starting on http://localhost:8080")
	fmt.Println("Health check available at http://localhost:8080/health")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// newMailer sends through the SMTP server at SMTP_ADDR (Mailcatcher in
// development), or falls back to the fake mailer that only logs.
func newMailer() mailer.Mailer {
	addr := os.Getenv("SMTP_ADDR")
	if addr == "" {
		fmt.Println("Mailer: SMTP_ADDR is not set, emails are logged only")
		return mailer.NewFakeMailer()
	}
	fmt.Printf("Mailer: sending emails through SMTP at %s\n", addr)
	return mailer.NewSMTPMailer(addr)
}
