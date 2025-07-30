package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// Initialize application on startup
func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using environment variables")
	}

	initDB()

	// Run database migrations
	if err := InitMigrations(); err != nil {
		log.Printf("Migration error: %v", err)
	}

	GetAllDB()
	go DBLoop()
}

// Main function - starts the HTTP server
func main() {
	fmt.Println("Starting Server...")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://yourdomain.com"},           // Specify allowed origins
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},                   // Allowed HTTP methods
		AllowedHeaders:   []string{"Accept", "Content-Type", "Content-Length", "Authorization"}, // Allowed headers
		AllowCredentials: true,                                                                  // Allow cookies
	})

	http.HandleFunc("/login", loginHandlerHttp)
	http.HandleFunc("/register", registerHandlerHttp)
	http.HandleFunc("/verify-code", verifyCodeHandlerHttp)
	http.HandleFunc("/resend-code", resendCodeHandlerHttp)

	http.HandleFunc("/request-password-reset", requestPasswordResetHandlerHttp)
	http.HandleFunc("/reset-password", resetPasswordWithTokenHandlerHttp)
	http.HandleFunc("/user", userHandlerHttp)
	http.HandleFunc("/admin", adminHandlerHttp)
	http.HandleFunc("/request-password-change", requestPasswordChangeCodeHandlerHttp)
	http.HandleFunc("/confirm-password-change", confirmPasswordChangeHandlerHttp)

	handler := c.Handler(http.DefaultServeMux)
	err := http.ListenAndServe(":8080", handler)
	if err != nil {
		log.Fatal("Error starting server: ", err)
		return
	}
}
