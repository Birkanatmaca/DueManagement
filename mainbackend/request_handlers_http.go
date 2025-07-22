package main

import (
	"fmt"
	"net/http"
)

func loginHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, loginHandler(request, r))
}

func registerHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, registerHandler(request, r))
}

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

func requestPasswordResetHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, requestPasswordResetHandler(request))
}

func resetPasswordWithTokenHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, resetPasswordWithTokenHandler(request))
}

func userHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, userHandler(request))
}

func adminHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, adminHandler(request))
}

func resendCodeHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, resendCodeHandler(request))
}

func requestPasswordChangeCodeHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, requestPasswordChangeCodeHandler(request))
}

func confirmPasswordChangeHandlerHttp(w http.ResponseWriter, r *http.Request) {
	request, err := middlew(w, r)
	if err != nil {
		fmt.Fprintf(w, clearerrorreturn("Invalid request format"))
		return
	}
	fmt.Fprintf(w, confirmPasswordChangeHandler(request))
}
