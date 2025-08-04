package main

import (
	"github.com/Jeffail/gabs/v2"
)

// Handle admin operations with different categories
func adminHandler(jsonParsed *gabs.Container) string {
	token, err := jsonCheckerString(jsonParsed, "data.request.token")
	if err != nil {
		return clearerrorreturn("Json Parse Error :: token")
	}
	admin, exists := adminTokenMap[token]
	if !exists || admin.Role != "admin" {
		return clearerrorreturn("Unauthorized Access: Admin only")
	}

	category, err := jsonCheckerString(jsonParsed, "data.request.category")
	if err != nil {
		return clearerrorreturn("Request category is required (e.g., 'child', 'due', 'receipt', 'user', 'manager', 'statistics', 'settings', 'logs', 'coach')")
	}

	switch category {
	case "child":
		return adminChildRouter(jsonParsed)
	case "due":
		return adminDueRouter(jsonParsed)
	case "parent":
		return adminParentRouter(jsonParsed)
	// case "ban":
	// 	return adminBanRouter(jsonParsed)
	case "user_management":
		return adminUserManagementRouter(jsonParsed)

	default:
		return clearerrorreturn("Unknown admin category")
	}
}
