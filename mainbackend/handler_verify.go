package main

import (
	"net/http"
	"time"

	"github.com/Jeffail/gabs/v2"
)

func verifyCodeHandler(jsonParsed *gabs.Container, r *http.Request) string {
	email, err := jsonCheckerString(jsonParsed, "data.request.email")
	if err != nil {
		return clearerrorreturn("Email required")
	}

	code, err := jsonCheckerString(jsonParsed, "data.request.code")
	if err != nil {
		return clearerrorreturn("Verification code required")
	}

	// 1. pending_users tablosunda kullanıcıyı bul
	var pendingID int
	var name, lastName, phone, password string
	err = DB.QueryRow("SELECT id, name, last_name, phone, password FROM pending_users WHERE email = $1", email).Scan(&pendingID, &name, &lastName, &phone, &password)
	if err != nil {
		return clearerrorreturn("Pending user not found or already verified")
	}

	// 2. Doğrulama kodunu kontrol et
	var dbCode string
	var expiresAt time.Time
	err = DB.QueryRow(
		`SELECT code, expires_at FROM verification_codes WHERE user_id = $1`,
		pendingID,
	).Scan(&dbCode, &expiresAt)

	if err != nil {
		return clearerrorreturn("Verification code not found")
	}

	if time.Now().After(expiresAt) {
		return clearerrorreturn("Verification code expired")
	}

	if code != dbCode {
		return clearerrorreturn("Incorrect verification code")
	}

	// 3. Transaction başlat: pending_users -> users aktar, pending_users ve kodu sil
	tx, err := DB.Begin()
	if err != nil {
		return clearerrorreturn("Internal server error")
	}

	var newUserID int
	err = tx.QueryRow(
		"INSERT INTO users (name, last_name, email, phone, password, is_verified) VALUES ($1, $2, $3, $4, $5, true) RETURNING id",
		name, lastName, email, phone, password,
	).Scan(&newUserID)
	if err != nil {
		tx.Rollback()
		return clearerrorreturn("Failed to create user")
	}

	_, err = tx.Exec("DELETE FROM pending_users WHERE id = $1", pendingID)
	if err != nil {
		tx.Rollback()
		return clearerrorreturn("Failed to remove pending user")
	}

	_, err = tx.Exec("DELETE FROM verification_codes WHERE user_id = $1", pendingID)
	if err != nil {
		tx.Rollback()
		return clearerrorreturn("Failed to remove verification code")
	}

	if err := tx.Commit(); err != nil {
		return clearerrorreturn("Internal server error")
	}

	HTTPResponse := gabs.New()
	HTTPResponse.Set("OK", "data", "status")
	HTTPResponse.Set("VerificationSuccess", "data", "type")
	HTTPResponse.Set("Your account has been successfully verified.", "data", "message")
	return HTTPResponse.String()
}
