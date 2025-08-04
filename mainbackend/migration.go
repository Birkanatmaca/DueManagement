package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// MigrationManager veritabanı migration'larını yönetir
type MigrationManager struct {
	migrate *migrate.Migrate
}

// NewMigrationManager yeni bir migration manager oluşturur
func NewMigrationManager(db *sql.DB) (*MigrationManager, error) {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return nil, fmt.Errorf("postgres driver oluşturulamadı: %v", err)
	}

	// Migration dosyalarının bulunduğu dizin
	migrationsPath := "file://migrations"

	m, err := migrate.NewWithDatabaseInstance(migrationsPath, "postgres", driver)
	if err != nil {
		return nil, fmt.Errorf("migration instance oluşturulamadı: %v", err)
	}

	return &MigrationManager{migrate: m}, nil
}

// RunMigrations tüm migration'ları çalıştırır
func (mm *MigrationManager) RunMigrations() error {
	log.Println("Migrations are running...")

	if err := mm.migrate.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("migration error: %v", err)
	}

	log.Println("Migrations completed successfully!")
	return nil
}

// RollbackMigration son migration'ı geri alır
func (mm *MigrationManager) RollbackMigration() error {
	log.Println("Rolling back last migration...")

	if err := mm.migrate.Steps(-1); err != nil {
		return fmt.Errorf("rollback error: %v", err)
	}

	log.Println("Rollback completed successfully!")
	return nil
}

// GetMigrationVersion mevcut migration versiyonunu döndürür
func (mm *MigrationManager) GetMigrationVersion() (uint, bool, error) {
	version, dirty, err := mm.migrate.Version()
	if err != nil {
		if err == migrate.ErrNilVersion {
			return 0, false, nil
		}
		return 0, false, err
	}
	return version, dirty, nil
}

// ForceMigrationVersion migration versiyonunu zorla ayarlar
func (mm *MigrationManager) ForceMigrationVersion(version int) error {
	log.Printf("Forcing migration version to %d...", version)

	if err := mm.migrate.Force(version); err != nil {
		return fmt.Errorf("force migration error: %v", err)
	}

	log.Println("Migration version set successfully!")
	return nil
}

// Close migration manager'ı kapatır
func (mm *MigrationManager) Close() error {
	if mm.migrate != nil {
		sourceErr, dbErr := mm.migrate.Close()
		if sourceErr != nil {
			return fmt.Errorf("source close error: %v", sourceErr)
		}
		if dbErr != nil {
			return fmt.Errorf("database close error: %v", dbErr)
		}
	}
	return nil
}

// InitMigrations migration sistemini başlatır
func InitMigrations() error {
	if DB == nil {
		return fmt.Errorf("database connection not found")
	}

	manager, err := NewMigrationManager(DB)
	if err != nil {
		return fmt.Errorf("failed to create migration manager: %v", err)
	}
	// defer manager.Close() // Bu satırı kaldırdık çünkü veritabanı bağlantısını kapatıyor

	// Migration'ları çalıştır
	if err := manager.RunMigrations(); err != nil {
		return fmt.Errorf("migration execution error: %v", err)
	}

	// Mevcut versiyonu göster
	version, dirty, err := manager.GetMigrationVersion()
	if err != nil {
		return fmt.Errorf("failed to get migration version: %v", err)
	}

	log.Printf("Current migration version: %d, Dirty: %t", version, dirty)
	return nil
}
