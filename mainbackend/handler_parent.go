package main

import (
	"github.com/Jeffail/gabs/v2"
)

func userHandler(jsonParsed *gabs.Container) string {
	token, err := jsonCheckerString(jsonParsed, "data.request.token")
	if err != nil {
		return clearerrorreturn("Json Parse Error :: token")
	}
	user, exists := userTokenMap[token]
	if !exists || user.Role != "user" {
		return clearerrorreturn("Unauthorized Access: Customer only")
	}

	requestType, ok := jsonParsed.Path("data.request.type").Data().(string)
	if !ok {
		return clearerrorreturn("Json Parse Error :: request type")
	}

	switch requestType {
	case "child":
		return viewChild(user.ID)
	case "dues":
		return viewDues(user.ID)
	case "receipt":
		return viewReceipt(user.ID)
	case "matchChildToParent":
		return matchChildToParent(jsonParsed)
	default:
		return clearerrorreturn("Unknown request type")
	}
}

func matchChildToParent(jsonParsed *gabs.Container) string {
	token, err := jsonCheckerString(jsonParsed, "data.request.token")
	if err != nil {
		return clearerrorreturn("Token is required")
	}
	user, exists := userTokenMap[token]
	if !exists || user.Role != "user" {
		return clearerrorreturn("Unauthorized Access: Customer only")
	}

	name, _ := jsonCheckerString(jsonParsed, "data.request.name")
	surname, _ := jsonCheckerString(jsonParsed, "data.request.surname")
	birthDate, _ := jsonCheckerString(jsonParsed, "data.request.birth_date")
	athleteNumber, _ := jsonCheckerString(jsonParsed, "data.request.athlete_number")

	var childID int
	err = DB.QueryRow(
		"SELECT id FROM children WHERE name = $1 AND surname = $2 AND birth_date = $3 AND athlete_number = $4 AND parent_id IS NULL",
		name, surname, birthDate, athleteNumber,
	).Scan(&childID)
	if err != nil {
		return clearerrorreturn("No matching child found or already assigned")
	}

	// parents tablosuna ekle ve yeni parent id'sini al
	var parentID int
	err = DB.QueryRow(
		"INSERT INTO parents (parent_name, parent_last_name, child_id, child_name, child_surname) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		user.Name, user.LastName, childID, name, surname,
	).Scan(&parentID)
	if err != nil {
		return clearerrorreturn("Failed to insert into parents table")
	}

	// children tablosunda parent_id'yi güncelle
	_, err = DB.Exec("UPDATE children SET parent_id = $1 WHERE id = $2", parentID, childID)
	if err != nil {
		return clearerrorreturn("Failed to update parent_id in children table")
	}

	// users tablosundan sil
	_, err = DB.Exec("DELETE FROM users WHERE id = $1", user.ID)
	if err != nil {
		return clearerrorreturn("Failed to delete user from users table")
	}

	return clearokreturn("Child successfully assigned to parent, parent moved to parents table, children.parent_id updated")
}

func viewChild(userID int) string {
	rows, err := DB.Query("SELECT id, name, birth_date, created_at FROM children WHERE user_id = $1", userID)
	if err != nil {
		return clearerrorreturn("DB error (children)")
	}
	defer rows.Close()
	children := make([]map[string]interface{}, 0)
	for rows.Next() {
		var child Child
		err := rows.Scan(&child.ID, &child.Name, &child.BirthDate, &child.CreatedAt)
		if err != nil {
			continue
		}
		children = append(children, map[string]interface{}{
			"id":         child.ID,
			"name":       child.Name,
			"birth_date": child.BirthDate,
			"created_at": child.CreatedAt,
		})
	}
	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("ChildList", "data", "type")
	resp.Set(children, "data", "response", "children")
	return resp.String()
}

func viewDues(userID int) string {
	rows, err := DB.Query(`SELECT due.id, due.child_id, due.month, due.year, due.amount, due.is_paid, due.due_date, due.paid_at, child.name FROM dues due JOIN children child ON due.child_id = child.id WHERE child.user_id = $1`, userID)
	if err != nil {
		return clearerrorreturn("DB error (dues)")
	}
	defer rows.Close()
	dues := make([]map[string]interface{}, 0)
	for rows.Next() {
		var due Due
		var childName string
		err := rows.Scan(&due.ID, &due.ChildID, &due.Month, &due.Year, &due.Amount, &due.IsPaid, &due.DueDate, &due.PaidAt, &childName)
		if err != nil {
			continue
		}
		dueMap := map[string]interface{}{
			"id":         due.ID,
			"child_id":   due.ChildID,
			"child_name": childName,
			"month":      due.Month,
			"year":       due.Year,
			"amount":     due.Amount,
			"is_paid":    due.IsPaid,
			"due_date":   due.DueDate,
			"paid_at":    due.PaidAt,
		}
		dues = append(dues, dueMap)
	}
	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("DuesList", "data", "type")
	resp.Set(dues, "data", "response", "dues")
	return resp.String()
}

func viewReceipt(userID int) string {
	rows, err := DB.Query(`SELECT r.id, r.due_id, r.file_url, r.uploaded_at, d.child_id, c.name FROM receipts r JOIN dues d ON r.due_id = d.id JOIN children c ON d.child_id = c.id WHERE c.user_id = $1`, userID)
	if err != nil {
		return clearerrorreturn("DB error (receipts)")
	}
	defer rows.Close()
	receipts := make([]map[string]interface{}, 0)
	for rows.Next() {
		var receipt Receipt
		var childID int
		var childName string
		err := rows.Scan(&receipt.ID, &receipt.DueID, &receipt.FileURL, &receipt.UploadedAt, &childID, &childName)
		if err != nil {
			continue
		}
		receiptMap := map[string]interface{}{
			"id":          receipt.ID,
			"due_id":      receipt.DueID,
			"file_url":    receipt.FileURL,
			"uploaded_at": receipt.UploadedAt,
			"child_id":    childID,
			"child_name":  childName,
		}
		receipts = append(receipts, receiptMap)
	}
	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("ReceiptList", "data", "type")
	resp.Set(receipts, "data", "response", "receipts")
	return resp.String()
}
