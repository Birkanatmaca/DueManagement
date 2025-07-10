package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Jeffail/gabs/v2"
)

func registerHandler(jsonParsed *gabs.Container, r *http.Request) string {
	name, err := jsonCheckerString(jsonParsed, "data.request.name")
	if err != nil {
		return clearerrorreturn("Name required")
	}

	lastName, err := jsonCheckerString(jsonParsed, "data.request.last_name")
	if err != nil {
		return clearerrorreturn("Last name required")
	}

	email, err := jsonCheckerString(jsonParsed, "data.request.email")
	if err != nil {
		return clearerrorreturn("Email required")
	}

	phone, err := jsonCheckerString(jsonParsed, "data.request.phone")
	if err != nil {
		return clearerrorreturn("Phone required")
	}

	password, err := jsonCheckerString(jsonParsed, "data.request.password")
	if err != nil {
		return clearerrorreturn("Password required")
	}

	// Check if user already exists in users or pending_users
	var userID int
	err = DB.QueryRow("SELECT id FROM users WHERE email = $1 OR phone = $2", email, phone).Scan(&userID)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Error checking for existing user in users:", err)
		return clearerrorreturn("Internal server error")
	}
	if userID > 0 {
		return clearerrorreturn("User with this email or phone already exists")
	}
	var pendingID int
	err = DB.QueryRow("SELECT id FROM pending_users WHERE email = $1 OR phone = $2", email, phone).Scan(&pendingID)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Error checking for existing user in pending_users:", err)
		return clearerrorreturn("Internal server error")
	}
	if pendingID > 0 {
		return clearerrorreturn("A registration with this email or phone is already pending verification")
	}

	hashedPassword := hashPassword(password)

	// Start a transaction
	tx, err := DB.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return clearerrorreturn("Internal server error")
	}

	var newPendingID int
	err = tx.QueryRow(
		"INSERT INTO pending_users (name, last_name, email, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		name, lastName, email, phone, hashedPassword,
	).Scan(&newPendingID)

	if err != nil {
		tx.Rollback()
		log.Println("Error inserting new pending user:", err)
		return clearerrorreturn("Could not create user")
	}

	verificationCode := generateVerificationCode()
	expiresAt := time.Now().Add(15 * time.Minute)

	_, err = tx.Exec(
		"INSERT INTO verification_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
		newPendingID, verificationCode, expiresAt,
	)
	if err != nil {
		tx.Rollback()
		log.Println("Error inserting verification code:", err)
		return clearerrorreturn("Could not create verification code")
	}

	subject := "Email Verification"
	body := fmt.Sprintf("Your verification code is: %s", verificationCode)
	err = sendEmail(email, subject, body)
	if err != nil {
		tx.Rollback()
		log.Println("Error sending verification email:", err)
		return clearerrorreturn("Could not send verification email")
	}

	// If everything is successful, commit the transaction
	if err := tx.Commit(); err != nil {
		log.Println("Error committing transaction:", err)
		return clearerrorreturn("Internal server error")
	}

	HTTPResponse := gabs.New()
	HTTPResponse.Set("OK", "data", "status")
	HTTPResponse.Set("RegistrationSuccess", "data", "type")
	HTTPResponse.Set("Please check your email for verification code.", "data", "message")
	return HTTPResponse.String()
}
