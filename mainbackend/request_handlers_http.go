package main

import (
	"fmt"
	"net/http"
)

// HTTP handler for user login
func loginHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, loginHandler(request, r))
}

// HTTP handler for user registration
func registerHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, registerHandler(request, r))
}

// HTTP handler for verification code
func verifyCodeHandlerHttp(w http.ResponseWriter, r *http.Request) {
	jsonParsed, err := middlew(w, r)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	response := verifyCodeHandler(jsonParsed, r)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(response))
}

// HTTP handler for password reset request
func requestPasswordResetHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, requestPasswordResetHandler(request))
}

// HTTP handler for password reset with token
func resetPasswordWithTokenHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, resetPasswordWithTokenHandler(request))
}

// HTTP handler for user operations
func userHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, userHandler(request))
}

// HTTP handler for admin operations
func adminHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, adminHandler(request))
}

// HTTP handler for resending verification code
func resendCodeHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, resendCodeHandler(request))
}

// HTTP handler for password change code request
func requestPasswordChangeCodeHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, requestPasswordChangeCodeHandler(request))
}

// HTTP handler for password change confirmation
func confirmPasswordChangeHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, confirmPasswordChangeHandler(request))
}
