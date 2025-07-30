package main

// User represents a user in the system
type User struct {
	ID                int    `db:"id"`
	Name              string `db:"name"`
	LastName          string `db:"last_name"`
	Email             string `db:"email"`
	Phone             string `db:"phone"`
	Password          string `db:"password"`
	CreatedAt         string `db:"created_at"`
	Role              string `db:"role"`
	IsVerified        bool   `db:"is_verified"`
	MatchedChildCount int    `db:"matched_child_count"`
}

// Child represents a child/athlete in the system
type Child struct {
	ID            int
	UserID        *int
	Name          string
	Surname       string
	AthleteNumber string
	BirthDate     string // ISO format (YYYY-MM-DD)
	CreatedAt     string
}

// Due represents a payment due for a child
type Due struct {
	ID      int
	ChildID int
	Month   int
	Year    int
	Amount  float64
	IsPaid  bool
	DueDate string
	PaidAt  *string // nullable
}

// Receipt represents a payment receipt
type Receipt struct {
	ID         int
	DueID      int
	FileURL    string
	UploadedAt string
}
