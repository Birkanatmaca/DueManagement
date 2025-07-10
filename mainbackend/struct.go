package main

type User struct {
	ID       int
	Name     string
	LastName string
	Email    string
	Phone    string
	Role     string
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
