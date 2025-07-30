package main

import (
	"database/sql"
	"sync"
)

// Global variables for the application
var (
	err error
	ok  bool
	DB  *sql.DB // Database connection

	tokenMap = make(map[string]bool) // Map to track valid tokens

	userTokenMap  = make(map[string]User) // Map to store user tokens
	adminTokenMap = make(map[string]User) // Map to store admin tokens

	tokenMutex sync.RWMutex // Mutex for thread-safe token operations
)
