package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/Jeffail/gabs/v2"
)

// Handle password reset request
func requestPasswordResetHandler(jsonParsed *gabs.Container) string {
	email, err := jsonCheckerString(jsonParsed, "data.request.email")
	if err != nil {
		return clearerrorreturn("Email required")
	}

	var userID int
	err = DB.QueryRow("SELECT id FROM users WHERE email = $1", email).Scan(&userID)
	if err == sql.ErrNoRows {
		// To prevent user enumeration, we don't reveal if the user was found.
		log.Println("Password reset requested for non-existent user:", email)
		return clearokreturn("If a user with that email exists, a password reset link has been sent.")
	} else if err != nil {
		log.Println("Error checking for user:", err)
		return clearerrorreturn("Internal server error")
	}

	token := generateToken()
	expiresAt := time.Now().Add(1 * time.Hour) // Token valid for 1 hour

	_, err = DB.Exec(
		"INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
		userID, token, expiresAt,
	)
	if err != nil {
		log.Println("Error inserting password reset token:", err)
		return clearerrorreturn("Could not start password reset process")
	}

	// In a real application, you would send a link like: https://your-frontend.com/reset-password?token=...
	resetLink := fmt.Sprintf("Your password reset token is: %s", token)
	subject := "Password Reset Request"
	body := fmt.Sprintf("To reset your password, use the following token: \n\n%s\n\nThis token is valid for 1 hour.", resetLink)

	err = sendEmail(email, subject, body)
	if err != nil {
		log.Println("Error sending password reset email:", err)
		return clearerrorreturn("Could not send password reset email")
	}

	return clearokreturn("If a user with that email exists, a password reset link has been sent.")
}

// Handle password reset with token
func resetPasswordWithTokenHandler(jsonParsed *gabs.Container) string {
	token, err := jsonCheckerString(jsonParsed, "data.request.token")
	if err != nil {
		return clearerrorreturn("Token required")
	}

	newPassword, err := jsonCheckerString(jsonParsed, "data.request.new_password")
	if err != nil {
		return clearerrorreturn("New password required")
	}

	var userID int
	var expiresAt time.Time
	err = DB.QueryRow(
		"SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1",
		token,
	).Scan(&userID, &expiresAt)

	if err == sql.ErrNoRows {
		return clearerrorreturn("Invalid or expired token")
	} else if err != nil {
		log.Println("Error retrieving token:", err)
		return clearerrorreturn("Internal server error")
	}

	if time.Now().After(expiresAt) {
		// Clean up expired token
		DB.Exec("DELETE FROM password_reset_tokens WHERE token = $1", token)
		return clearerrorreturn("Invalid or expired token")
	}

	hashedPassword := hashPassword(newPassword)

	_, err = DB.Exec("UPDATE users SET password = $1 WHERE id = $2", hashedPassword, userID)
	if err != nil {
		log.Println("Failed to update password:", err)
		return clearerrorreturn("Failed to update password")
	}

	// Invalidate the token after use
	_, err = DB.Exec("DELETE FROM password_reset_tokens WHERE token = $1", token)
	if err != nil {
		log.Println("Failed to delete used password reset token:", err)
		// This is not a critical error for the user, but should be logged.
	}

	return clearokreturn("Password successfully updated")
}
