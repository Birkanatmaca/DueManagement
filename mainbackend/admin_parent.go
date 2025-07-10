package main

import (
	"fmt"
	"strings"

	"github.com/Jeffail/gabs/v2"
)

func adminParentRouter(jsonParsed *gabs.Container) string {
	token, err := jsonCheckerString(jsonParsed, "data.request.token")
	if err != nil {
		return clearerrorreturn("Json Parse Error :: token")
	}
	admin, exists := adminTokenMap[token]
	if !exists || admin.Role != "admin" {
		return clearerrorreturn("Unauthorized Access: Admin only")
	}

	requestType, _ := jsonCheckerString(jsonParsed, "data.request.type")

	switch requestType {
	case "addParent":
		return addParent(jsonParsed)
	case "updateParent":
		return updateParent(jsonParsed)
	case "deleteParent":
		return deleteParent(jsonParsed)
	case "listParents":
		return listParents(jsonParsed)
	case "getParentDetails":
		return getParentDetails(jsonParsed)
	default:
		return clearerrorreturn("Unknown request type for admin parent operations")
	}
}

// Veli ekleme
func addParent(jsonParsed *gabs.Container) string {
	name, err := jsonCheckerString(jsonParsed, "data.request.name")
	if err != nil {
		return clearerrorreturn("Name is required")
	}
	lastName, err := jsonCheckerString(jsonParsed, "data.request.last_name")
	if err != nil {
		return clearerrorreturn("Last name is required")
	}
	email, err := jsonCheckerString(jsonParsed, "data.request.email")
	if err != nil {
		return clearerrorreturn("Email is required")
	}
	phone, err := jsonCheckerString(jsonParsed, "data.request.phone")
	if err != nil {
		return clearerrorreturn("Phone is required")
	}
	password, err := jsonCheckerString(jsonParsed, "data.request.password")
	if err != nil {
		return clearerrorreturn("Password is required")
	}

	var existingID int
	err = DB.QueryRow("SELECT id FROM users WHERE email = $1", email).Scan(&existingID)
	if err == nil {
		return clearerrorreturn("User with this email already exists")
	}

	hashedPassword := hashPassword(password)

	var userID int
	err = DB.QueryRow(
		"INSERT INTO users (name, last_name, email, phone, role, password, matched_child_count) VALUES ($1, $2, $3, $4, 'user', $5, 0) RETURNING id",
		name, lastName, email, phone, hashedPassword,
	).Scan(&userID)

	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to add parent: %v", err))
	}

	response := gabs.New()
	response.Set("OK", "data", "status")
	response.Set("ParentAdded", "data", "type")
	response.Set(fmt.Sprintf("Parent with ID %d successfully added.", userID), "data", "message")
	response.Set(userID, "data", "response", "parent_id")
	return response.String()
}

// Veli güncelleme
func updateParent(jsonParsed *gabs.Container) string {
	parentID, err := jsonCheckerString(jsonParsed, "data.request.parent_id")
	if err != nil {
		return clearerrorreturn("Parent ID is required")
	}

	query := "UPDATE users SET"
	args := []interface{}{}
	argId := 1

	if name, err := jsonCheckerString(jsonParsed, "data.request.name"); err == nil {
		query += fmt.Sprintf(" name = $%d,", argId)
		args = append(args, name)
		argId++
	}
	if lastName, err := jsonCheckerString(jsonParsed, "data.request.last_name"); err == nil {
		query += fmt.Sprintf(" last_name = $%d,", argId)
		args = append(args, lastName)
		argId++
	}
	if email, err := jsonCheckerString(jsonParsed, "data.request.email"); err == nil {
		query += fmt.Sprintf(" email = $%d,", argId)
		args = append(args, email)
		argId++
	}
	if phone, err := jsonCheckerString(jsonParsed, "data.request.phone"); err == nil {
		query += fmt.Sprintf(" phone = $%d,", argId)
		args = append(args, phone)
		argId++
	}
	if password, err := jsonCheckerString(jsonParsed, "data.request.password"); err == nil {
		hashedPassword := hashPassword(password)
		query += fmt.Sprintf(" password = $%d,", argId)
		args = append(args, hashedPassword)
		argId++
	}

	if len(args) == 0 {
		return clearerrorreturn("No fields to update")
	}

	query = strings.TrimSuffix(query, ",")
	query += fmt.Sprintf(" WHERE id = $%d AND role = 'user'", argId)
	args = append(args, parentID)

	result, err := DB.Exec(query, args...)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to update parent: %v", err))
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return clearerrorreturn("Failed to check affected rows")
	}

	if rowsAffected == 0 {
		return clearerrorreturn("Parent not found or no changes made")
	}

	return clearokreturn("Parent successfully updated")
}

// Veli silme
func deleteParent(jsonParsed *gabs.Container) string {
	parentID, err := jsonCheckerString(jsonParsed, "data.request.parent_id")
	if err != nil {
		return clearerrorreturn("Parent ID is required")
	}

	var role string
	err = DB.QueryRow("SELECT role FROM users WHERE id = $1", parentID).Scan(&role)
	if err != nil {
		return clearerrorreturn("Parent not found")
	}
	if role != "user" {
		return clearerrorreturn("Cannot delete non-parent user with this function")
	}

	// Çocuğun parent_id'sini NULL yap
	_, err = DB.Exec("UPDATE children SET parent_id = NULL WHERE parent_id = $1", parentID)
	if err != nil {
		return clearerrorreturn("Failed to update children parent_id")
	}

	// Kullanıcıyı sil
	_, err = DB.Exec("DELETE FROM users WHERE id = $1", parentID)
	if err != nil {
		return clearerrorreturn("Failed to delete parent from users")
	}

	return clearokreturn("Parent successfully deleted from users table")
}

// Velileri listeleme
func listParents(jsonParsed *gabs.Container) string {
	rows, err := DB.Query(`
		SELECT u.id, u.name, u.last_name, u.email, u.phone, u.created_at, u.matched_child_count
		FROM users u
		WHERE u.role = 'user'
		ORDER BY u.created_at DESC
	`)
	if err != nil {
		return clearerrorreturn("DB error (list parents)")
	}
	defer rows.Close()

	parents := make([]map[string]interface{}, 0)
	for rows.Next() {
		var user User
		var createdAt string
		var matchedChildCount int
		err := rows.Scan(&user.ID, &user.Name, &user.LastName, &user.Email, &user.Phone, &createdAt, &matchedChildCount)
		if err != nil {
			continue
		}
		parents = append(parents, map[string]interface{}{
			"id":                  user.ID,
			"name":                user.Name,
			"last_name":           user.LastName,
			"email":               user.Email,
			"phone":               user.Phone,
			"created_at":          createdAt,
			"matched_child_count": matchedChildCount,
		})
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("ParentsList", "data", "type")
	resp.Set(parents, "data", "response", "parents")
	return resp.String()
}

// Veli detayları
func getParentDetails(jsonParsed *gabs.Container) string {
	parentID, err := jsonCheckerString(jsonParsed, "data.request.parent_id")
	if err != nil {
		return clearerrorreturn("Parent ID is required")
	}

	// Kullanıcı bilgileri
	var user User
	var createdAt string
	err = DB.QueryRow("SELECT id, name, last_name, email, phone, role, created_at FROM users WHERE id = $1 AND role = 'user'", parentID).Scan(&user.ID, &user.Name, &user.LastName, &user.Email, &user.Phone, &user.Role, &createdAt)
	if err != nil {
		return clearerrorreturn("Parent not found")
	}

	// Kullanıcının çocukları
	childrenRows, err := DB.Query("SELECT id, name, surname, birth_date, athlete_number, created_at FROM children WHERE parent_id = $1", parentID)
	if err != nil {
		return clearerrorreturn("DB error (get children)")
	}
	defer childrenRows.Close()

	children := make([]map[string]interface{}, 0)
	for childrenRows.Next() {
		var childID int
		var childName, childSurname, birthDate, athleteNumber, childCreatedAt string
		err := childrenRows.Scan(&childID, &childName, &childSurname, &birthDate, &athleteNumber, &childCreatedAt)
		if err != nil {
			continue
		}
		children = append(children, map[string]interface{}{
			"id":             childID,
			"name":           childName,
			"surname":        childSurname,
			"birth_date":     birthDate,
			"athlete_number": athleteNumber,
			"created_at":     childCreatedAt,
		})
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("ParentDetails", "data", "type")
	resp.Set(map[string]interface{}{
		"parent": map[string]interface{}{
			"id":         user.ID,
			"name":       user.Name,
			"last_name":  user.LastName,
			"email":      user.Email,
			"phone":      user.Phone,
			"role":       user.Role,
			"created_at": createdAt,
		},
		"children": children,
	}, "data", "response")
	return resp.String()
}
