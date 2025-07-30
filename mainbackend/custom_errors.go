package main

// CustomErrors represents custom error types for the application
type CustomErrors int

const (
	jsonCheckerStringError CustomErrors = iota
	jsonCheckerFloat64Error
	jsonCheckerBoolenError
	userNotFound
)

// String returns the error message for each custom error type
func (n CustomErrors) String() string {
	switch n {
	case jsonCheckerStringError:
		return "String Json Search Error"
	case jsonCheckerFloat64Error:
		return "Float or Integer Json Search Error"
	case jsonCheckerBoolenError:
		return "Boolean Json Search Error"
	case userNotFound:
		return "User Not Found"
	default:
		return ""
	}
}
