package main

import (
	"database/sql"
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"os"
	"time"
)

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

	//bağlantıyı başlatma
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
}
func DBLoop() {
start:
	time.Sleep(3 * time.Minute)
	GetAllDB()
	goto start
}

func GetAllDB() {

}
