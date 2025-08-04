package main

import (
	"net/http"
	"time"

	"github.com/Jeffail/gabs/v2"
)

func loginHandler(jsonParsed *gabs.Container, r *http.Request) string {
	email, err := jsonCheckerString(jsonParsed, "data.request.phone")
	if err != nil {
		return clearerrorreturn("Phone required")
	}

	password, err := jsonCheckerString(jsonParsed, "data.request.password")
	if err != nil {
		return clearerrorreturn("Password required")
	}

	hashPasswordValue := hashPassword(password)

	// First, check if user exists in users table (approved users)
	var user User
	err = DB.QueryRow(`
        SELECT id, name, last_name, phone, role, email 
        FROM users 
        WHERE email = $1 AND password = $2`,
		email, hashPasswordValue).Scan(
		&user.ID, &user.Name, &user.LastName,
		&user.Phone, &user.Role, &user.Email,
	)

	if err == nil {
		// User found in users table - proceed with normal login
		ipAddr := getIP(r)
		token := generateToken()
		validUntil := time.Now().Add(1 * time.Hour)

		_, err = DB.Exec(`
			INSERT INTO tokens (token, user_id, validity_date, ip_address) 
			VALUES ($1, $2, $3, $4)`,
			token, user.ID, validUntil, ipAddr)

		if err != nil {
			return clearerrorreturn("Token creation failed")
		}

		tokenMutex.Lock()
		defer tokenMutex.Unlock()

		switch user.Role {
		case "user":
			userTokenMap[token] = user
		case "admin":
			adminTokenMap[token] = user
		}

		HTTPResponse := gabs.New()
		HTTPResponse.Set("OK", "data", "status")
		HTTPResponse.Set("LoginSuccess", "data", "type")
		HTTPResponse.Set(token, "data", "response", "token")
		HTTPResponse.Set(user.Role, "data", "response", "role")
		return HTTPResponse.String()
	}

	// If not found in users table, check pending_users table
	var pendingUser struct {
		ID         int    `json:"id"`
		Name       string `json:"name"`
		LastName   string `json:"last_name"`
		Email      string `json:"email"`
		Phone      string `json:"phone"`
		IsVerified bool   `json:"is_verified"`
	}

	err = DB.QueryRow(`
        SELECT id, name, last_name, email, phone, is_verified
        FROM pending_users 
        WHERE email = $1 AND password = $2`,
		email, hashPasswordValue).Scan(
		&pendingUser.ID, &pendingUser.Name, &pendingUser.LastName,
		&pendingUser.Email, &pendingUser.Phone, &pendingUser.IsVerified,
	)

	if err == nil {
		// User found in pending_users table
		HTTPResponse := gabs.New()
		HTTPResponse.Set("ERROR", "data", "status")
		HTTPResponse.Set("AccountPending", "data", "type")
		HTTPResponse.Set("Your account is pending admin approval. Please wait for approval before logging in.", "data", "message")
		return HTTPResponse.String()
	}

	// User not found in either table
	return clearerrorreturn("Invalid credentials")
}
