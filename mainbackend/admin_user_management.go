package main

import (
	"fmt"
	"time"

	"github.com/Jeffail/gabs/v2"
)

// Admin router for user management operations
func adminUserManagementRouter(jsonParsed *gabs.Container) string {
	action, err := jsonCheckerString(jsonParsed, "data.request.action")
	if err != nil {
		return clearerrorreturn("Action required")
	}

	switch action {
	case "list_pending_users":
		return listPendingUsers(jsonParsed)
	case "approve_user":
		return approveUser(jsonParsed)
	case "reject_user":
		return rejectUser(jsonParsed)
	case "get_pending_user_details":
		return getPendingUserDetails(jsonParsed)
	default:
		return clearerrorreturn("Invalid action")
	}
}

// List all pending users waiting for approval
func listPendingUsers(jsonParsed *gabs.Container) string {
	// Get optional filters
	emailVerifiedOnly := false
	if verified, err := jsonCheckerString(jsonParsed, "data.request.email_verified_only"); err == nil {
		emailVerifiedOnly = verified == "true"
	}

	var query string
	if emailVerifiedOnly {
		query = `
			SELECT id, name, last_name, email, phone, created_at, is_verified
			FROM pending_users 
			WHERE is_verified = false
			ORDER BY created_at DESC
		`
	} else {
		query = `
			SELECT id, name, last_name, email, phone, created_at, is_verified
			FROM pending_users 
			ORDER BY created_at DESC
		`
	}

	rows, err := DB.Query(query)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Database error: %v", err))
	}
	defer rows.Close()

	var pendingUsers []map[string]interface{}
	for rows.Next() {
		var id int
		var name, lastName, email, phone, createdAt string
		var isVerified bool

		err := rows.Scan(&id, &name, &lastName, &email, &phone, &createdAt, &isVerified)
		if err != nil {
			continue
		}

		status := "Email Not Verified"
		if !isVerified {
			status = "Email Verified - Pending Admin Approval"
		} else {
			status = "Admin Approved - User Created"
		}

		pendingUsers = append(pendingUsers, map[string]interface{}{
			"id":          id,
			"name":        name,
			"last_name":   lastName,
			"full_name":   name + " " + lastName,
			"email":       email,
			"phone":       phone,
			"created_at":  createdAt,
			"is_verified": isVerified,
			"status":      status,
		})
	}

	response := gabs.New()
	response.Set("OK", "data", "status")
	response.Set("PendingUsersList", "data", "type")
	response.Set(pendingUsers, "data", "response")

	return response.String()
}

// Approve a pending user
func approveUser(jsonParsed *gabs.Container) string {
	userID, err := jsonCheckerString(jsonParsed, "data.request.user_id")
	if err != nil {
		return clearerrorreturn("User ID required")
	}

	// adminID, err := jsonCheckerString(jsonParsed, "data.request.admin_id")
	// if err != nil {
	// 	return clearerrorreturn("Admin ID required")
	// }

	// Get pending user details
	var pendingUser User
	err = DB.QueryRow(`
		SELECT id, name, last_name, email, phone, password, created_at, is_verified
		FROM pending_users 
		WHERE id = $1
	`, userID).Scan(&pendingUser.ID, &pendingUser.Name, &pendingUser.LastName, &pendingUser.Email,
		&pendingUser.Phone, &pendingUser.Password, &pendingUser.CreatedAt, &pendingUser.IsVerified)

	if err != nil {
		return clearerrorreturn("Pending user not found")
	}

	if pendingUser.IsVerified {
		return clearerrorreturn("User is already approved")
	}

	// Start transaction
	tx, err := DB.Begin()
	if err != nil {
		return clearerrorreturn("Transaction error")
	}
	defer tx.Rollback()

	// Insert into users table
	var newUserID int
	err = tx.QueryRow(`
		INSERT INTO users (name, last_name, email, phone, password, created_at, role, is_verified, matched_child_count)
		VALUES ($1, $2, $3, $4, $5, $6, 'user', true, 0) RETURNING id
	`, pendingUser.Name, pendingUser.LastName, pendingUser.Email, pendingUser.Phone,
		pendingUser.Password, pendingUser.CreatedAt).Scan(&newUserID)

	if err != nil {
		return clearerrorreturn("Error creating user account")
	}

	// Delete from pending_users after successful user creation
	_, err = tx.Exec(`DELETE FROM pending_users WHERE id = $1`, userID)
	if err != nil {
		return clearerrorreturn("Error removing pending user")
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return clearerrorreturn("Transaction commit error")
	}

	// TODO: Send approval notification email to user
	// sendApprovalEmail(pendingUser.Email, pendingUser.Name)

	return clearokreturn(fmt.Sprintf("User %s %s approved successfully! User ID: %d",
		pendingUser.Name, pendingUser.LastName, newUserID))
}

// Reject a pending user
func rejectUser(jsonParsed *gabs.Container) string {
	userID, err := jsonCheckerString(jsonParsed, "data.request.user_id")
	if err != nil {
		return clearerrorreturn("User ID required")
	}

	rejectionReason, err := jsonCheckerString(jsonParsed, "data.request.rejection_reason")
	if err != nil {
		rejectionReason = "Application rejected by admin"
	}

	// Get pending user details before deletion
	var pendingUser User
	err = DB.QueryRow(`
		SELECT id, name, last_name, email, phone, created_at
		FROM pending_users 
		WHERE id = $1
	`, userID).Scan(&pendingUser.ID, &pendingUser.Name, &pendingUser.LastName,
		&pendingUser.Email, &pendingUser.Phone, &pendingUser.CreatedAt)

	if err != nil {
		return clearerrorreturn("Pending user not found")
	}

	// Start transaction
	tx, err := DB.Begin()
	if err != nil {
		return clearerrorreturn("Transaction error")
	}
	defer tx.Rollback()

	// Delete verification codes if any
	_, err = tx.Exec(`DELETE FROM verification_codes WHERE user_id = $1`, userID)
	if err != nil {
		// Continue even if no verification codes found
	}

	// Delete from pending_users (rejection)
	_, err = tx.Exec(`DELETE FROM pending_users WHERE id = $1`, userID)
	if err != nil {
		return clearerrorreturn("Error removing pending user")
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return clearerrorreturn("Transaction commit error")
	}

	// TODO: Send rejection notification email to user
	// sendRejectionEmail(pendingUser.Email, pendingUser.Name, rejectionReason)

	return clearokreturn(fmt.Sprintf("User %s %s rejected successfully. Reason: %s",
		pendingUser.Name, pendingUser.LastName, rejectionReason))
}

// Get detailed information about a pending user
func getPendingUserDetails(jsonParsed *gabs.Container) string {
	userID, err := jsonCheckerString(jsonParsed, "data.request.user_id")
	if err != nil {
		return clearerrorreturn("User ID required")
	}

	// Get pending user details
	var pendingUser User
	err = DB.QueryRow(`
		SELECT id, name, last_name, email, phone, created_at, is_verified
		FROM pending_users 
		WHERE id = $1
	`, userID).Scan(&pendingUser.ID, &pendingUser.Name, &pendingUser.LastName,
		&pendingUser.Email, &pendingUser.Phone, &pendingUser.CreatedAt, &pendingUser.IsVerified)

	if err != nil {
		return clearerrorreturn("Pending user not found")
	}

	// Calculate time since registration
	createdTime, _ := time.Parse("2006-01-02 15:04:05", pendingUser.CreatedAt)
	timeSince := time.Since(createdTime)

	status := "Pending Verification"
	if pendingUser.IsVerified {
		status = "Pending Approval"
	}

	userDetails := map[string]interface{}{
		"id":             pendingUser.ID,
		"name":           pendingUser.Name,
		"last_name":      pendingUser.LastName,
		"full_name":      pendingUser.Name + " " + pendingUser.LastName,
		"email":          pendingUser.Email,
		"phone":          pendingUser.Phone,
		"created_at":     pendingUser.CreatedAt,
		"is_verified":    pendingUser.IsVerified,
		"status":         status,
		"time_since_reg": timeSince.Round(time.Hour).String(),
		"days_since_reg": int(timeSince.Hours() / 24),
	}

	response := gabs.New()
	response.Set("OK", "data", "status")
	response.Set("PendingUserDetails", "data", "type")
	response.Set(userDetails, "data", "response")

	return response.String()
}
