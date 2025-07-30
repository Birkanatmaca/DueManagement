package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func initDB() error {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
		return err
	}

	host := os.Getenv("POSTGRESHOST")
	dbname := os.Getenv("POSTGRESDBNAME")
	user := os.Getenv("POSTGRESUSER")
	password := os.Getenv("POSTGRESPASSWORD")
	port := os.Getenv("POSTGRESPORT")
	sslmode := os.Getenv("POSTRESSSLMODE")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s", host, port, user, password, dbname, sslmode)

	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}
	return nil
}

func main() {
	// Komut satırı parametreleri
	var (
		action = flag.String("action", "up", "Migration action: up, down, version, force")
		steps  = flag.Int("steps", 0, "Number of steps to migrate (for up/down)")
		force  = flag.Int("force", 0, "Force migration version")
	)
	flag.Parse()

	// Veritabanı bağlantısını başlat
	if err := initDB(); err != nil {
		log.Fatalf("Database connection error: %v", err)
	}

	// Migration manager oluştur
	driver, err := postgres.WithInstance(DB, &postgres.Config{})
	if err != nil {
		log.Fatalf("Failed to create postgres driver: %v", err)
	}

	migrationsPath := "file://migrations"
	m, err := migrate.NewWithDatabaseInstance(migrationsPath, "postgres", driver)
	if err != nil {
		log.Fatalf("Failed to create migration instance: %v", err)
	}
	defer m.Close()

	// İşlemi gerçekleştir
	switch *action {
	case "up":
		if *steps > 0 {
			if err := m.Steps(*steps); err != nil {
				log.Fatalf("Migration error: %v", err)
			}
		} else {
			if err := m.Up(); err != nil && err != migrate.ErrNoChange {
				log.Fatalf("Migration error: %v", err)
			}
		}
		fmt.Println("Migration completed successfully!")

	case "down":
		if *steps > 0 {
			if err := m.Steps(-*steps); err != nil {
				log.Fatalf("Rollback error: %v", err)
			}
		} else {
			if err := m.Steps(-1); err != nil {
				log.Fatalf("Rollback error: %v", err)
			}
		}
		fmt.Println("Rollback completed successfully!")

	case "version":
		version, dirty, err := m.Version()
		if err != nil {
			log.Fatalf("Failed to get version: %v", err)
		}
		fmt.Printf("Current migration version: %d, Dirty: %t\n", version, dirty)

	case "force":
		if *force < 0 {
			log.Fatal("Valid version number required for force")
		}
		if err := m.Force(*force); err != nil {
			log.Fatalf("Force migration error: %v", err)
		}
		fmt.Printf("Migration version forced to %d!\n", *force)

	default:
		fmt.Println("Kullanım:")
		fmt.Println("  ./migrate -action=up                    # Tüm migration'ları çalıştır")
		fmt.Println("  ./migrate -action=up -steps=2           # 2 adım ileri git")
		fmt.Println("  ./migrate -action=down -steps=1         # 1 adım geri git")
		fmt.Println("  ./migrate -action=down                  # Son migration'ı geri al")
		fmt.Println("  ./migrate -action=version               # Mevcut versiyonu göster")
		fmt.Println("  ./migrate -action=force -force=5        # Versiyonu 5'e zorla ayarla")
		os.Exit(1)
	}
}
