package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

// Initialize database connection
func initDB() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
		os.Exit(1)
	}

	host := os.Getenv("POSTGRESHOST")
	dbname := os.Getenv("POSTGRESDBNAME")
	user := os.Getenv("POSTGRESUSER")
	password := os.Getenv("POSTGRESPASSWORD")
	port := os.Getenv("POSTGRESPORT")
	sslmode := os.Getenv("POSTRESSSLMODE")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s", host, port, user, password, dbname, sslmode)

	// Initialize database connection
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
}

// Database maintenance loop - runs every 3 minutes
func DBLoop() {
start:
	time.Sleep(3 * time.Minute)
	GetAllDB()
	goto start
}

// Get all database data (placeholder function)
func GetAllDB() {

}
