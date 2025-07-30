package main

import (
	"github.com/Jeffail/gabs/v2"
)

// Handle user operations with different request types
func userHandler(jsonParsed *gabs.Container) string {
	token, err := jsonCheckerString(jsonParsed, "data.request.token")
	if err != nil {
		return clearerrorreturn("Json Parse Error :: token")
	}
	user, exists := userTokenMap[token]
	if !exists {
		return clearerrorreturn("Unauthorized Access: Invalid token")
	}

	requestType, ok := jsonParsed.Path("data.request.type").Data().(string)
	if !ok {
		return clearerrorreturn("Json Parse Error :: request type")
	}

	switch requestType {
	case "child":
		if user.Role != "user" {
			return clearerrorreturn("Unauthorized Access: User only")
		}
		return viewChild(user.ID)
	case "dues":
		if user.Role != "user" {
			return clearerrorreturn("Unauthorized Access: User only")
		}
		return viewDues(user.ID)
	case "matchChildToParent":
		if user.Role != "user" {
			return clearerrorreturn("Unauthorized Access: User only")
		}
		return matchChildToParent(jsonParsed)
	case "parentinformation":
		if user.Role != "user" {
			return clearerrorreturn("Unauthorized Access: User only")
		}
		return getParentHandler(jsonParsed)
	default:
		return clearerrorreturn("Unknown request type")
	}
}

// Get parent information
func getParentHandler(jsonParsed *gabs.Container) string {
	token, err := jsonCheckerString(jsonParsed, "data.request.token")
	if err != nil {
		return clearerrorreturn("Json Parse Error :: token")
	}

	user, exists := userTokenMap[token]
	if !exists || user.Role != "user" {
		return clearerrorreturn("Unauthorized Access: User only")
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("UserInfo", "data", "type")

	parentMap := map[string]interface{}{
		"id":                  user.ID,
		"name":                user.Name,
		"last_name":           user.LastName,
		"phone":               user.Phone,
		"created_at":          user.CreatedAt,
		"role":                user.Role,
		"email":               user.Email,
		"is_verified":         user.IsVerified,
		"matched_child_count": user.MatchedChildCount,
	}

	resp.Set(parentMap, "data", "response", "parent")

	return resp.String()
}

// Match child to parent using birth date and athlete number
func matchChildToParent(jsonParsed *gabs.Container) string {
	token, err := jsonCheckerString(jsonParsed, "data.request.token")
	if err != nil {
		return clearerrorreturn("Token is required")
	}
	user, exists := userTokenMap[token]
	if !exists || user.Role != "user" {
		return clearerrorreturn("Unauthorized Access: Customer only")
	}

	birthDate, _ := jsonCheckerString(jsonParsed, "data.request.birth_date")
	athleteNumber, _ := jsonCheckerString(jsonParsed, "data.request.athlete_number")

	var childID int
	err = DB.QueryRow(
		"SELECT id FROM children WHERE birth_date = $1 AND athlete_number = $2 AND parent_id IS NULL",
		birthDate, athleteNumber,
	).Scan(&childID)
	if err != nil {
		return clearerrorreturn("No matching child found or already assigned")
	}

	_, err = DB.Exec("UPDATE children SET parent_id = $1 WHERE id = $2", user.ID, childID)
	if err != nil {
		return clearerrorreturn("Failed to update parent_id in children table")
	}

	_, err = DB.Exec("UPDATE users SET matched_child_count = matched_child_count + 1 WHERE id = $1", user.ID)
	if err != nil {
		return clearerrorreturn("Failed to update matched_child_count in users table")
	}

	return clearokreturn("Child successfully assigned to parent, children.parent_id updated")
}

func viewChild(parentID int) string {
	rows, err := DB.Query("SELECT id, name, birth_date, athlete_number, created_at FROM children WHERE parent_id = $1", parentID)
	if err != nil {
		return clearerrorreturn("DB error (children)")
	}
	defer rows.Close()
	children := make([]map[string]interface{}, 0)
	for rows.Next() {
		var child Child
		err := rows.Scan(&child.ID, &child.Name, &child.BirthDate, &child.AthleteNumber, &child.CreatedAt)
		if err != nil {
			continue
		}
		children = append(children, map[string]interface{}{
			"id":             child.ID,
			"name":           child.Name,
			"birth_date":     child.BirthDate,
			"athlete_number": child.AthleteNumber,
			"created_at":     child.CreatedAt,
		})
	}
	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("ChildList", "data", "type")
	resp.Set(children, "data", "response", "children")
	return resp.String()
}

func viewDues(parentID int) string {
	rows, err := DB.Query(`
        SELECT d.id, d.child_id, d.month, d.year, d.amount, d.is_paid, d.due_date, d.paid_at
        FROM dues d
        JOIN children c ON d.child_id = c.id
        WHERE c.parent_id = $1
    `, parentID)
	if err != nil {
		return clearerrorreturn("DB error (dues)")
	}
	defer rows.Close()
	dues := make([]map[string]interface{}, 0)
	for rows.Next() {
		var due Due
		err := rows.Scan(&due.ID, &due.ChildID, &due.Month, &due.Year, &due.Amount, &due.IsPaid, &due.DueDate, &due.PaidAt)
		if err != nil {
			continue
		}
		dueMap := map[string]interface{}{
			"id":       due.ID,
			"child_id": due.ChildID,
			"month":    due.Month,
			"year":     due.Year,
			"amount":   due.Amount,
			"is_paid":  due.IsPaid,
			"due_date": due.DueDate,
			"paid_at":  due.PaidAt,
		}
		dues = append(dues, dueMap)
	}
	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("DuesList", "data", "type")
	resp.Set(dues, "data", "response", "dues")
	return resp.String()
}
