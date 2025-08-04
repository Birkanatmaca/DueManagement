package main

import (
	"fmt"
	"sync"
	"time"
)

// RateLimitEntry represents a rate limit entry for an IP
type RateLimitEntry struct {
	Count     int
	FirstTry  time.Time
	LastTry   time.Time
	Banned    bool
	BanUntil  time.Time
	BanReason string
}

// RateLimiter manages rate limiting for different actions
type RateLimiter struct {
	entries map[string]*RateLimitEntry
	mutex   sync.RWMutex
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter() *RateLimiter {
	return &RateLimiter{
		entries: make(map[string]*RateLimitEntry),
	}
}

// CheckRateLimit checks if an IP is allowed to perform an action
func (rl *RateLimiter) CheckRateLimit(ip, action string, maxAttempts int, windowMinutes int, banHours int) (bool, string) {
	rl.mutex.Lock()
	defer rl.mutex.Unlock()

	key := fmt.Sprintf("%s:%s", ip, action)
	now := time.Now()

	entry, exists := rl.entries[key]
	if !exists {
		// First attempt
		rl.entries[key] = &RateLimitEntry{
			Count:    1,
			FirstTry: now,
			LastTry:  now,
			Banned:   false,
		}
		return true, ""
	}

	// Check if currently banned
	if entry.Banned {
		if now.Before(entry.BanUntil) {
			remaining := entry.BanUntil.Sub(now)
			return false, fmt.Sprintf("IP banned until %s. Remaining time: %s",
				entry.BanUntil.Format("2006-01-02 15:04:05"),
				remaining.Round(time.Minute))
		}
		// Ban expired, reset
		entry.Banned = false
		entry.Count = 0
		entry.FirstTry = now
	}

	// Check if within time window
	windowDuration := time.Duration(windowMinutes) * time.Minute
	if now.Sub(entry.FirstTry) > windowDuration {
		// Reset window
		entry.Count = 1
		entry.FirstTry = now
		entry.LastTry = now
		return true, ""
	}

	// Increment count
	entry.Count++
	entry.LastTry = now

	// Check if limit exceeded
	if entry.Count > maxAttempts {
		// Ban the IP
		entry.Banned = true
		entry.BanUntil = now.Add(time.Duration(banHours) * time.Hour)
		entry.BanReason = fmt.Sprintf("Too many %s attempts", action)

		return false, fmt.Sprintf("Too many attempts. IP banned for %d hours until %s",
			banHours, entry.BanUntil.Format("2006-01-02 15:04:05"))
	}

	remaining := maxAttempts - entry.Count
	return true, fmt.Sprintf("Attempts remaining: %d", remaining)
}

// GetRateLimitInfo returns current rate limit info for an IP
func (rl *RateLimiter) GetRateLimitInfo(ip, action string) map[string]interface{} {
	rl.mutex.RLock()
	defer rl.mutex.RUnlock()

	key := fmt.Sprintf("%s:%s", ip, action)
	entry, exists := rl.entries[key]

	if !exists {
		return map[string]interface{}{
			"banned":     false,
			"count":      0,
			"remaining":  3,
			"ban_until":  nil,
			"ban_reason": "",
		}
	}

	now := time.Now()
	remaining := 3 - entry.Count
	if remaining < 0 {
		remaining = 0
	}

	var banUntil interface{} = nil
	if entry.Banned && now.Before(entry.BanUntil) {
		banUntil = entry.BanUntil.Format("2006-01-02 15:04:05")
	}

	return map[string]interface{}{
		"banned":     entry.Banned && now.Before(entry.BanUntil),
		"count":      entry.Count,
		"remaining":  remaining,
		"ban_until":  banUntil,
		"ban_reason": entry.BanReason,
	}
}

// Global rate limiter instance
var GlobalRateLimiter = NewRateLimiter()
