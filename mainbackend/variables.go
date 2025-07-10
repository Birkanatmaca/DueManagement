package main

import (
	"database/sql"
	"sync"
)

var (
	err error
	ok  bool
	DB  *sql.DB

	tokenMap = make(map[string]bool)

	userTokenMap  = make(map[string]User)
	adminTokenMap = make(map[string]User)

	tokenMutex sync.RWMutex
)
