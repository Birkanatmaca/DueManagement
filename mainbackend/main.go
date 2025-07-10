package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using environment variables")
	}

	initDB()
	GetAllDB()
	go DBLoop()
}

func main() {
	fmt.Println("Starting Server...")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},                                                         // Tüm kaynaklara izin ver (Geliştirme için)
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},                   // İzin verilen HTTP metotları
		AllowedHeaders:   []string{"Accept", "Content-Type", "Content-Length", "Authorization"}, // İzin verilen başlıklar
		AllowCredentials: true,                                                                  // Çerezlere izin ver
	})

	http.HandleFunc("/login", loginHandlerHttp)
	http.HandleFunc("/register", registerHandlerHttp)
	http.HandleFunc("/verify-code", verifyCodeHandlerHttp)

	http.HandleFunc("/request-password-reset", requestPasswordResetHandlerHttp)
	http.HandleFunc("/reset-password", resetPasswordWithTokenHandlerHttp)
	http.HandleFunc("/user", userHandlerHttp)
	http.HandleFunc("/admin", adminHandlerHttp)

	handler := c.Handler(http.DefaultServeMux)
	err := http.ListenAndServe(":8080", handler)
	if err != nil {
		log.Fatal("Error not start server : ", err)
		return
	}
}
