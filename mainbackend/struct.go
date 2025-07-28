package main

type User struct {
	ID                int       `db:"id"`
	Name              string    `db:"name"`
	LastName          string    `db:"last_name"`
	Email             string    `db:"email"`
	Phone             string    `db:"phone"`
	Password          string    `db:"password"`
	CreatedAt         string    `db:"created_at"`
	Role              string    `db:"role"`
	IsVerified        bool      `db:"is_verified"`
	MatchedChildCount int       `db:"matched_child_count"`
}

type Child struct {
	ID            int
	UserID        *int
	Name          string
	Surname       string
	AthleteNumber string
	BirthDate     string // ISO format (YYYY-MM-DD)
	CreatedAt     string
}

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

type Receipt struct {
	ID         int
	DueID      int
	FileURL    string
	UploadedAt string
}
