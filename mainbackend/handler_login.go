package main

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/Jeffail/gabs/v2"
)

// Handle user login with email and password
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

	var user User

	err = DB.QueryRow(`
        SELECT id, name, last_name, phone, role, email 
        FROM users 
        WHERE email = $1 AND password = $2`,
		email, hashPasswordValue).Scan(
		&user.ID, &user.Name, &user.LastName,
		&user.Phone, &user.Role, &user.Email,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return clearerrorreturn("Invalid credentials")
		}
		return clearerrorreturn("Internal server error")
	}

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
