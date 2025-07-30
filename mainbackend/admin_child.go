package main

import (
	"fmt"
	"strings"

	"strconv"

	"github.com/Jeffail/gabs/v2"
)

// Admin router for child operations
func adminChildRouter(jsonParsed *gabs.Container) string {
	requestType, _ := jsonCheckerString(jsonParsed, "data.request.type")

	switch requestType {
	case "addChild":
		return addChild(jsonParsed)
	case "updateChild":
		return updateChild(jsonParsed)
	case "deleteChild":
		return deleteChild(jsonParsed)
	case "listChildren":
		return listChildren(jsonParsed)
	case "assignChildToParent":
		return assignChildToParent(jsonParsed)
	case "matchChildToParentAdmin":
		return matchChildToParentAdmin(jsonParsed)
	case "unmatchChildFromParentAdmin":
		return unmatchChildFromParentAdmin(jsonParsed)
	default:
		return clearerrorreturn("Unknown request type for admin child operations")
	}
}

// Add new child with automatic athlete number and dues
func addChild(jsonParsed *gabs.Container) string {
	name, err := jsonCheckerString(jsonParsed, "data.request.name")
	if err != nil {
		return clearerrorreturn("Child name is required")
	}
	surname, err := jsonCheckerString(jsonParsed, "data.request.surname")
	if err != nil {
		return clearerrorreturn("Child surname is required")
	}
	birthDate, err := jsonCheckerString(jsonParsed, "data.request.birth_date")
	if err != nil {
		return clearerrorreturn("Birth date is required")
	}

	var childID int
	err = DB.QueryRow(
		"INSERT INTO children (name, surname, birth_date, parent_id) VALUES ($1, $2, $3, NULL) RETURNING id",
		name, surname, birthDate,
	).Scan(&childID)

	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to add child: %v", err))
	}

	athleteNumber := fmt.Sprintf("ATA-%04d", childID)
	_, err = DB.Exec("UPDATE children SET athlete_number = $1 WHERE id = $2", athleteNumber, childID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to set athlete number: %v", err))
	}

	// Add dues records for all months of 2025
	months := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}
	for _, month := range months {
		dueDate := fmt.Sprintf("2025-%02d-01", month)
		_, err = DB.Exec(
			"INSERT INTO dues (child_id, month, year, amount, is_paid, due_date) VALUES ($1, $2, $3, $4, $5, $6)",
			childID, month, 2025, 0, false, dueDate,
		)
		if err != nil {
			return clearerrorreturn(fmt.Sprintf("Failed to add due for month %d: %v", month, err))
		}
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("ChildAdded", "data", "type")
	resp.Set(fmt.Sprintf("Child with ID %d successfully added with 2025 payment plan.", childID), "data", "message")
	resp.Set(childID, "data", "response", "child_id")
	resp.Set(athleteNumber, "data", "response", "athlete_number")
	return resp.String()
}

// Update child information
func updateChild(jsonParsed *gabs.Container) string {
	childID, err := jsonCheckerString(jsonParsed, "data.request.child_id")
	if err != nil {
		return clearerrorreturn("Child ID is required")
	}

	// Build dynamic query
	query := "UPDATE children SET"
	args := []interface{}{}
	argId := 1

	if name, err := jsonCheckerString(jsonParsed, "data.request.name"); err == nil {
		query += fmt.Sprintf(" name = $%d,", argId)
		args = append(args, name)
		argId++
	}

	if birthDate, err := jsonCheckerString(jsonParsed, "data.request.birth_date"); err == nil {
		query += fmt.Sprintf(" birth_date = $%d,", argId)
		args = append(args, birthDate)
		argId++
	}

	if len(args) == 0 {
		return clearerrorreturn("No fields to update")
	}

	query = strings.TrimSuffix(query, ",")
	query += fmt.Sprintf(" WHERE id = $%d", argId)
	args = append(args, childID)

	_, err = DB.Exec(query, args...)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to update child: %v", err))
	}

	return clearokreturn("Child successfully updated")
}

func deleteChild(jsonParsed *gabs.Container) string {
	childID, err := jsonCheckerString(jsonParsed, "data.request.child_id")
	if err != nil {
		return clearerrorreturn("Child ID is required")
	}

	// Önce çocuğun hangi parent'a bağlı olduğunu kontrol et
	var parentID *int
	err = DB.QueryRow("SELECT parent_id FROM children WHERE id = $1", childID).Scan(&parentID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Child not found: %v", err))
	}

	// Çocuğun dues tablosundaki tüm verilerini sil
	_, err = DB.Exec("DELETE FROM dues WHERE child_id = $1", childID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to delete child's dues: %v", err))
	}

	// Çocuğu sil
	_, err = DB.Exec("DELETE FROM children WHERE id = $1", childID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to delete child: %v", err))
	}

	// Eğer çocuk bir parent'a bağlıysa, parent'ın match_child_count'unu azalt
	if parentID != nil {
		_, err = DB.Exec("UPDATE users SET matched_child_count = matched_child_count - 1 WHERE id = $1 AND matched_child_count > 0", *parentID)
		if err != nil {
			return clearerrorreturn(fmt.Sprintf("Failed to update parent's matched_child_count: %v", err))
		}
	}

	return clearokreturn("Child and all associated dues successfully deleted")
}

func listChildren(jsonParsed *gabs.Container) string {
	// Ana sorgu - parent_id kullanarak
	rows, err := DB.Query(`SELECT id, name, surname, birth_date, parent_id, athlete_number FROM children`)
	if err != nil {
		return clearerrorreturn("DB error (list children)")
	}
	defer rows.Close()

	children := make([]map[string]interface{}, 0)
	rowCount := 0
	errorCount := 0

	for rows.Next() {
		rowCount++
		var c Child
		var parentID *int
		err := rows.Scan(&c.ID, &c.Name, &c.Surname, &c.BirthDate, &parentID, &c.AthleteNumber)
		if err != nil {
			errorCount++
			continue
		}

		// parent_id NULL ise 0 olarak göster
		parentIDValue := 0
		if parentID != nil {
			parentIDValue = *parentID
		}

		childMap := map[string]interface{}{
			"id":             c.ID,
			"name":           c.Name,
			"surname":        c.Surname,
			"birth_date":     c.BirthDate,
			"parent_id":      parentIDValue,
			"athlete_number": c.AthleteNumber,
		}
		children = append(children, childMap)
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("ChildrenList", "data", "type")
	resp.Set(children, "data", "response", "children")
	resp.Set(rowCount, "data", "response", "total_count")
	resp.Set(errorCount, "data", "response", "error_count")
	return resp.String()
}

func assignChildToParent(jsonParsed *gabs.Container) string {
	childID, err := jsonCheckerString(jsonParsed, "data.request.child_id")
	if err != nil {
		return clearerrorreturn("Child ID is required")
	}
	parentID, err := jsonCheckerString(jsonParsed, "data.request.parent_id")
	if err != nil {
		return clearerrorreturn("Parent ID is required")
	}

	_, err = DB.Exec("UPDATE children SET parent_id = $1 WHERE id = $2", parentID, childID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to assign child to parent: %v", err))
	}

	// matched_child_count'u artır
	_, err = DB.Exec("UPDATE users SET matched_child_count = matched_child_count + 1 WHERE id = $1", parentID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to update matched_child_count: %v", err))
	}

	return clearokreturn("Child successfully assigned to parent")
}

func matchChildToParentAdmin(jsonParsed *gabs.Container) string {
	childID, err := jsonCheckerString(jsonParsed, "data.request.child_id")
	if err != nil {
		return clearerrorreturn("Child ID is required")
	}
	parentID, err := jsonCheckerString(jsonParsed, "data.request.parent_id")
	if err != nil {
		return clearerrorreturn("Parent ID is required")
	}

	// 1. Parent gerçekten var mı ve user rolünde mi?
	var parentRole string
	err = DB.QueryRow("SELECT role FROM users WHERE id = $1", parentID).Scan(&parentRole)
	if err != nil {
		return clearerrorreturn("Parent not found")
	}
	if parentRole != "user" {
		return clearerrorreturn("Selected parent is not a valid parent user")
	}

	// 2. Child gerçekten var mı ve zaten bir veliye bağlı mı?
	var existingParentID *int
	err = DB.QueryRow("SELECT parent_id FROM children WHERE id = $1", childID).Scan(&existingParentID)
	if err != nil {
		return clearerrorreturn("Child not found")
	}
	if existingParentID != nil {
		return clearerrorreturn("Child is already assigned to a parent")
	}

	// 3. Eşleştir
	_, err = DB.Exec("UPDATE children SET parent_id = $1 WHERE id = $2", parentID, childID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to assign child to parent: %v", err))
	}

	// matched_child_count'u artır
	_, err = DB.Exec("UPDATE users SET matched_child_count = matched_child_count + 1 WHERE id = $1", parentID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to update matched_child_count: %v", err))
	}

	return clearokreturn("Child successfully assigned to parent")
}

func unmatchChildFromParentAdmin(jsonParsed *gabs.Container) string {
	childID, err := jsonCheckerString(jsonParsed, "data.request.child_id")
	if err != nil {
		return clearerrorreturn("Child ID is required")
	}
	parentID, err := jsonCheckerString(jsonParsed, "data.request.parent_id")
	if err != nil {
		return clearerrorreturn("Parent ID is required")
	}

	// 1. Parent gerçekten var mı ve user rolünde mi?
	var parentRole string
	err = DB.QueryRow("SELECT role FROM users WHERE id = $1", parentID).Scan(&parentRole)
	if err != nil {
		return clearerrorreturn("Parent not found")
	}
	if parentRole != "user" {
		return clearerrorreturn("Selected parent is not a valid parent user")
	}

	// 2. Child gerçekten var mı ve bu parent'a mı bağlı?
	var existingParentID *int
	err = DB.QueryRow("SELECT parent_id FROM children WHERE id = $1", childID).Scan(&existingParentID)
	if err != nil {
		return clearerrorreturn("Child not found")
	}
	parentIDInt, err := strconv.Atoi(parentID)
	if err != nil {
		return clearerrorreturn("Invalid parent ID")
	}
	if existingParentID == nil || *existingParentID != parentIDInt {
		return clearerrorreturn("This child is not assigned to the selected parent")
	}

	// 3. Ayır
	_, err = DB.Exec("UPDATE children SET parent_id = NULL WHERE id = $1", childID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to unassign child from parent: %v", err))
	}

	// matched_child_count'u azalt
	_, err = DB.Exec("UPDATE users SET matched_child_count = matched_child_count - 1 WHERE id = $1 AND matched_child_count > 0", parentID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to decrease matched_child_count: %v", err))
	}

	return clearokreturn("Child successfully unassigned from parent")
}
