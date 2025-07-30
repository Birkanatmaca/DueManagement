package main

import (
	"fmt"
	"strconv"

	"github.com/Jeffail/gabs/v2"
)

// Admin router for due operations
func adminDueRouter(jsonParsed *gabs.Container) string {
	requestType, _ := jsonCheckerString(jsonParsed, "data.request.type")

	switch requestType {
	case "addDue":
		return addDue(jsonParsed)
	case "updateDue":
		return updateDue(jsonParsed)
	case "deleteDue":
		return deleteDue(jsonParsed)
	case "getDue":
		return getDue(jsonParsed)
	case "listDues":
		return listDues(jsonParsed)
	case "createMonthlyDues":
		return createMonthlyDuesForAllChildren(jsonParsed)
	default:
		return clearerrorreturn("Unknown request type for admin due operations")
	}
}

// Add new due for a child
func addDue(jsonParsed *gabs.Container) string {
	childID, err := jsonCheckerString(jsonParsed, "data.request.child_id")
	if err != nil {
		return clearerrorreturn("Child ID is required")
	}
	month, err := jsonCheckerString(jsonParsed, "data.request.month")
	if err != nil {
		return clearerrorreturn("Month is required")
	}
	year, err := jsonCheckerString(jsonParsed, "data.request.year")
	if err != nil {
		return clearerrorreturn("Year is required")
	}
	amount, err := jsonCheckerString(jsonParsed, "data.request.amount")
	if err != nil {
		return clearerrorreturn("Amount is required")
	}
	dueDate, err := jsonCheckerString(jsonParsed, "data.request.due_date")
	if err != nil {
		return clearerrorreturn("Due date is required")
	}

	// Check if due already exists for same child, month and year
	var existingID int
	err = DB.QueryRow("SELECT id FROM dues WHERE child_id = $1 AND month = $2 AND year = $3", childID, month, year).Scan(&existingID)
	if err == nil {
		return clearerrorreturn("Due already exists for this child and month/year")
	}

	var dueID int
	err = DB.QueryRow(
		"INSERT INTO dues (child_id, month, year, amount, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		childID, month, year, amount, dueDate,
	).Scan(&dueID)

	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to add due: %v", err))
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("DueAdded", "data", "type")
	resp.Set(fmt.Sprintf("Due with ID %d successfully added.", dueID), "data", "message")
	resp.Set(dueID, "data", "response", "due_id")
	return resp.String()
}

// Update due information
func updateDue(jsonParsed *gabs.Container) string {
	dueID, err := jsonCheckerString(jsonParsed, "data.request.due_id")
	if err != nil {
		return clearerrorreturn("Due ID is required")
	}

	query := "UPDATE dues SET"
	args := []interface{}{}
	argId := 1

	if amount, err := jsonCheckerString(jsonParsed, "data.request.amount"); err == nil {
		query += fmt.Sprintf(" amount = $%d,", argId)
		args = append(args, amount)
		argId++
	}
	if dueDate, err := jsonCheckerString(jsonParsed, "data.request.due_date"); err == nil {
		query += fmt.Sprintf(" due_date = $%d,", argId)
		args = append(args, dueDate)
		argId++
	}
	if isPaid, err := jsonCheckerString(jsonParsed, "data.request.is_paid"); err == nil {
		query += fmt.Sprintf(" is_paid = $%d,", argId)
		args = append(args, isPaid)
		argId++
		if isPaid == "true" {
			query += fmt.Sprintf(" paid_at = NOW(),")
		} else if isPaid == "false" {
			query += fmt.Sprintf(" paid_at = NULL,")
		}
	}

	if len(args) == 0 {
		return clearerrorreturn("No fields to update")
	}

	query = query[:len(query)-1] // Sondaki virgülü kaldır
	query += fmt.Sprintf(" WHERE id = $%d", argId)
	args = append(args, dueID)

	_, err = DB.Exec(query, args...)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to update due: %v", err))
	}

	return clearokreturn("Due successfully updated")
}

func deleteDue(jsonParsed *gabs.Container) string {
	dueID, err := jsonCheckerString(jsonParsed, "data.request.due_id")
	if err != nil {
		return clearerrorreturn("Due ID is required")
	}

	_, err = DB.Exec("DELETE FROM dues WHERE id = $1", dueID)
	if err != nil {
		return clearerrorreturn(fmt.Sprintf("Failed to delete due: %v", err))
	}

	return clearokreturn("Due successfully deleted")
}

func getDue(jsonParsed *gabs.Container) string {
	dueID, err := jsonCheckerString(jsonParsed, "data.request.due_id")
	if err != nil {
		return clearerrorreturn("Due ID is required")
	}

	query := `
        SELECT d.id, d.child_id, d.month, d.year, d.amount, d.is_paid, d.due_date, d.paid_at,
        c.name, c.surname, c.athlete_number, u.id, u.name, u.last_name
        FROM dues d
        JOIN children c ON d.child_id = c.id
        LEFT JOIN users u ON c.parent_id = u.id
        WHERE d.id = $1`

	var (
		dueId, childId, month, year            int
		amount                                 float64
		isPaid                                 bool
		dueDate, paidAt                        *string
		childName, childSurname, athleteNumber string
		parentId                               *int
		parentName, parentSurname              *string
	)
	err = DB.QueryRow(query, dueID).Scan(
		&dueId, &childId, &month, &year, &amount, &isPaid, &dueDate, &paidAt,
		&childName, &childSurname, &athleteNumber, &parentId, &parentName, &parentSurname,
	)
	if err != nil {
		return clearerrorreturn("Due not found")
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("DueDetail", "data", "type")
	resp.Set(map[string]interface{}{
		"due_id":         dueId,
		"child_id":       childId,
		"month":          month,
		"year":           year,
		"amount":         amount,
		"is_paid":        isPaid,
		"due_date":       dueDate,
		"paid_at":        paidAt,
		"child_name":     childName,
		"child_surname":  childSurname,
		"athlete_number": athleteNumber,
		"parent_id":      parentId,
		"parent_name":    parentName,
		"parent_surname": parentSurname,
	}, "data", "response")
	return resp.String()
}

// ***** DÜZELTİLMİŞ FONKSİYON *****
func listDues(jsonParsed *gabs.Container) string {
	monthStr, _ := jsonCheckerString(jsonParsed, "data.request.month")
	yearStr, _ := jsonCheckerString(jsonParsed, "data.request.year")
	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	// Otomatik olarak tüm çocuklar için aidat kaydı oluşturma adımını başlat
	// Bu adım, aidatı olmayan çocuklar için veritabanında kayıt oluşturur.
	fakeJson := gabs.New()

	// >>> DÜZELTME: `createMonthlyDuesForAllChildren` fonksiyonu string beklediği için
	// integer olan month ve year değerlerini string'e çeviriyoruz.
	fakeJson.Set(strconv.Itoa(month), "data", "request", "month")
	fakeJson.Set(strconv.Itoa(year), "data", "request", "year")
	fakeJson.Set("500", "data", "request", "amount")          // Varsayılan tutar, string olmalı
	fakeJson.Set("2024-07-31", "data", "request", "due_date") // Varsayılan tarih, istersen değiştir

	// Aidat oluşturma fonksiyonunu çağır. Bu fonksiyonun içindeki hatalar
	// aidatların oluşmasını engelliyordu. Artık doğru tiplerle çağrıldığı için çalışacak.
	createMonthlyDuesForAllChildren(fakeJson)

	query := `
        SELECT
            c.id AS child_id,
            c.name AS child_name,
            c.surname AS child_surname,
            c.athlete_number,
            u.id AS parent_id,
            u.name AS parent_name,
            u.last_name AS parent_surname,
            d.id AS due_id,
            d.amount,
            d.is_paid,
            d.due_date,
            d.paid_at
        FROM
            children c
        LEFT JOIN users u ON c.parent_id = u.id
        LEFT JOIN dues d ON d.child_id = c.id AND d.month = $1 AND d.year = $2
        ORDER BY c.name, c.surname`

	rows, err := DB.Query(query, month, year)
	if err != nil {
		return clearerrorreturn("DB error (list dues)")
	}
	defer rows.Close()

	dues := make([]map[string]interface{}, 0)
	for rows.Next() {
		var childID int
		var childName, childSurname, athleteNumber string
		var parentID *int
		var parentName, parentSurname *string
		var dueID *int
		var amount *float64
		var isPaid *bool
		var dueDate, paidAt *string

		err := rows.Scan(&childID, &childName, &childSurname, &athleteNumber, &parentID, &parentName, &parentSurname, &dueID, &amount, &isPaid, &dueDate, &paidAt)
		if err != nil {
			continue
		}

		status := "Ödenmedi"
		if isPaid != nil && *isPaid {
			status = "Ödendi"
		}

		dues = append(dues, map[string]interface{}{
			"child_id":       childID,
			"child_name":     childName,
			"child_surname":  childSurname,
			"athlete_number": athleteNumber,
			"parent_id":      parentID,
			"parent_name":    parentName,
			"parent_surname": parentSurname,
			"due_id":         dueID,
			"amount":         amount,
			"status":         status,
			"due_date":       dueDate,
			"paid_at":        paidAt,
		})
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("DuesList", "data", "type")
	resp.Set(dues, "data", "response", "dues")
	return resp.String()
}

func createMonthlyDuesForAllChildren(jsonParsed *gabs.Container) string {
	month, err := jsonCheckerString(jsonParsed, "data.request.month")
	if err != nil {
		// Bu hatayı artık almayacaksınız çünkü listDues'tan string gönderiliyor.
		return clearerrorreturn("Month is required")
	}
	year, err := jsonCheckerString(jsonParsed, "data.request.year")
	if err != nil {
		// Bu hatayı artık almayacaksınız.
		return clearerrorreturn("Year is required")
	}
	amount, err := jsonCheckerString(jsonParsed, "data.request.amount")
	if err != nil {
		return clearerrorreturn("Amount is required")
	}
	dueDate, err := jsonCheckerString(jsonParsed, "data.request.due_date")
	if err != nil {
		return clearerrorreturn("Due date is required")
	}

	rows, err := DB.Query("SELECT id FROM children")
	if err != nil {
		return clearerrorreturn("DB error (children list)")
	}
	defer rows.Close()

	added := 0
	for rows.Next() {
		var childID int
		if err := rows.Scan(&childID); err != nil {
			continue
		}
		var exists int
		// Bu çocuk için belirtilen ay/yıl'da aidat var mı diye kontrol et
		err = DB.QueryRow("SELECT 1 FROM dues WHERE child_id = $1 AND month = $2 AND year = $3", childID, month, year).Scan(&exists)
		if err == nil {
			continue // Zaten var, ekleme yapma
		}
		// Aidat yoksa ekle
		_, err = DB.Exec("INSERT INTO dues (child_id, month, year, amount, due_date) VALUES ($1, $2, $3, $4, $5)", childID, month, year, amount, dueDate)
		if err == nil {
			added++
		}
	}

	resp := gabs.New()
	resp.Set("OK", "data", "status")
	resp.Set("MonthlyDuesCreated", "data", "type")
	resp.Set(fmt.Sprintf("%d dues created for month %s/%s", added, month, year), "data", "message")
	resp.Set(added, "data", "response", "created_count")
	// listDues içinde çağrıldığında bu response kullanılmaz ama yine de tutarlı olması iyidir.
	return resp.String()
}
