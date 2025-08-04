package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Jeffail/gabs/v2"
)

// Handle email verification code
func verifyCodeHandler(jsonParsed *gabs.Container, r *http.Request) string {
	// Check if database connection is alive
	if err := DB.Ping(); err != nil {
		log.Println("Database connection error:", err)
		return clearerrorreturn("Database connection error")
	}

	email, err := jsonCheckerString(jsonParsed, "data.request.email")
	if err != nil {
		return clearerrorreturn("Email required")
	}

	code, err := jsonCheckerString(jsonParsed, "data.request.code")
	if err != nil {
		return clearerrorreturn("Verification code required")
	}

	// 1. Find user in pending_users table
	var pendingID int
	var name, lastName, phone, password string
	err = DB.QueryRow("SELECT id, name, last_name, phone, password FROM pending_users WHERE email = $1", email).Scan(&pendingID, &name, &lastName, &phone, &password)
	if err != nil {
		return clearerrorreturn("Pending user not found or already verified")
	}

	// 2. Check verification code
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

	// 3. Mark user as verified but keep is_verified as false for admin approval
	_, err = DB.Exec("UPDATE pending_users SET is_verified = false WHERE id = $1", pendingID)
	if err != nil {
		return clearerrorreturn("Failed to update verification status")
	}

	// Delete verification code
	_, err = DB.Exec("DELETE FROM verification_codes WHERE user_id = $1", pendingID)
	if err != nil {
		return clearerrorreturn("Failed to remove verification code")
	}

	HTTPResponse := gabs.New()
	HTTPResponse.Set("OK", "data", "status")
	HTTPResponse.Set("VerificationSuccess", "data", "type")
	HTTPResponse.Set("Email verified successfully! Your account is pending admin approval. You will be notified when approved.", "data", "message")
	return HTTPResponse.String()
}

func resendCodeHandler(jsonParsed *gabs.Container) string {
	email, err := jsonCheckerString(jsonParsed, "data.request.email")
	if err != nil {
		return clearerrorreturn("Email required")
	}

	// pending_users tablosunda kullanıcıyı bul
	var pendingID int
	err = DB.QueryRow("SELECT id FROM pending_users WHERE email = $1", email).Scan(&pendingID)
	if err != nil {
		return clearerrorreturn("Pending user not found or already verified")
	}

	// Yeni kod üret ve kaydet
	verificationCode := generateVerificationCode()
	expiresAt := time.Now().Add(15 * time.Minute)
	_, err = DB.Exec(
		"UPDATE verification_codes SET code = $1, expires_at = $2 WHERE user_id = $3",
		verificationCode, expiresAt, pendingID,
	)
	if err != nil {
		return clearerrorreturn("Could not update verification code")
	}

	// E-posta gönder
	subject := "Email Verification"
	body := fmt.Sprintf("Your new verification code is: %s", verificationCode)
	err = sendEmail(email, subject, body)
	if err != nil {
		return clearerrorreturn("Could not send verification email")
	}

	HTTPResponse := gabs.New()
	HTTPResponse.Set("OK", "data", "status")
	HTTPResponse.Set("ResendCodeSuccess", "data", "type")
	HTTPResponse.Set("A new verification code has been sent to your email.", "data", "message")
	return HTTPResponse.String()
}

func requestPasswordChangeCodeHandler(jsonParsed *gabs.Container) string {
	email, err := jsonCheckerString(jsonParsed, "data.request.email")
	if err != nil {
		return clearerrorreturn("Email required")
	}
	phone, err := jsonCheckerString(jsonParsed, "data.request.phone")
	if err != nil {
		return clearerrorreturn("Phone required")
	}
	newPassword, err := jsonCheckerString(jsonParsed, "data.request.new_password")
	if err != nil {
		return clearerrorreturn("New password required")
	}
	repeatPassword, err := jsonCheckerString(jsonParsed, "data.request.repeat_password")
	if err != nil {
		return clearerrorreturn("Repeat password required")
	}
	if newPassword != repeatPassword {
		return clearerrorreturn("Passwords do not match")
	}
	// Kullanıcıyı kontrol et
	var userID int
	err = DB.QueryRow("SELECT id FROM users WHERE email = $1 AND phone = $2", email, phone).Scan(&userID)
	if err != nil {
		return clearerrorreturn("User not found with given email and phone")
	}
	// Kod üret
	code := generateVerificationCode()
	expiresAt := time.Now().Add(15 * time.Minute)
	hashedPassword := hashPassword(newPassword)
	// Geçici tabloya kaydet (önce varsa eski kaydı sil)
	DB.Exec("DELETE FROM password_change_requests WHERE email = $1 AND phone = $2", email, phone)
	_, err = DB.Exec(
		"INSERT INTO password_change_requests (email, phone, code, new_password, expires_at) VALUES ($1, $2, $3, $4, $5)",
		email, phone, code, hashedPassword, expiresAt,
	)
	if err != nil {
		return clearerrorreturn("Could not create password change request")
	}
	// E-posta gönder
	subject := "Change Password Code"
	body := fmt.Sprintf("Your password change code is: %s", code)
	err = sendEmail(email, subject, body)
	if err != nil {
		return clearerrorreturn("Could not send verification email")
	}
	HTTPResponse := gabs.New()
	HTTPResponse.Set("OK", "data", "status")
	HTTPResponse.Set("PasswordChangeCodeSent", "data", "type")
	HTTPResponse.Set("A code has been sent to your email for password change.", "data", "message")
	return HTTPResponse.String()
}

func confirmPasswordChangeHandler(jsonParsed *gabs.Container) string {
	email, err := jsonCheckerString(jsonParsed, "data.request.email")
	if err != nil {
		return clearerrorreturn("Email required")
	}
	phone, err := jsonCheckerString(jsonParsed, "data.request.phone")
	if err != nil {
		return clearerrorreturn("Phone required")
	}
	code, err := jsonCheckerString(jsonParsed, "data.request.code")
	if err != nil {
		return clearerrorreturn("Code required")
	}
	// Geçici tablodan kodu ve yeni şifreyi bul
	var dbCode, newPassword string
	var expiresAt time.Time
	err = DB.QueryRow(
		"SELECT code, new_password, expires_at FROM password_change_requests WHERE email = $1 AND phone = $2",
		email, phone,
	).Scan(&dbCode, &newPassword, &expiresAt)
	if err != nil {
		return clearerrorreturn("No password change request found or invalid info")
	}
	if time.Now().After(expiresAt) {
		DB.Exec("DELETE FROM password_change_requests WHERE email = $1 AND phone = $2", email, phone)
		return clearerrorreturn("Code expired. Please request again.")
	}
	if code != dbCode {
		return clearerrorreturn("Incorrect code")
	}
	// Şifreyi güncelle
	_, err = DB.Exec("UPDATE users SET password = $1 WHERE email = $2 AND phone = $3", newPassword, email, phone)
	if err != nil {
		return clearerrorreturn("Failed to update password")
	}
	// Geçici kaydı sil
	DB.Exec("DELETE FROM password_change_requests WHERE email = $1 AND phone = $2", email, phone)
	HTTPResponse := gabs.New()
	HTTPResponse.Set("OK", "data", "status")
	HTTPResponse.Set("PasswordChanged", "data", "type")
	HTTPResponse.Set("Your password has been changed successfully.", "data", "message")
	return HTTPResponse.String()
}
