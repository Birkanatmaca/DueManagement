package main

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
	"strings"

	"github.com/Jeffail/gabs/v2"
)

func middlew(w http.ResponseWriter, r *http.Request) (jsonParsed *gabs.Container, err error) {
	requestbody, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, err
	}
	jsonParsed, err = gabs.ParseJSON(requestbody)
	if err != nil {
		return nil, err
	}
	r.Body.Close()
	return jsonParsed, nil
}

func clearerrorreturn(message string) string {
	HTTPResponse := gabs.New()
	HTTPResponse.Set("OK", "data", "type")
	HTTPResponse.Set(message, "data", "message")
	HTTPResponse.Set("ERROR", "data", "status")
	return HTTPResponse.String()
}

func clearokreturn(message string) string {
	HTTPResponse := gabs.New()
	HTTPResponse.Set("OK", "data", "type")
	HTTPResponse.Set(message, "data", "message")
	HTTPResponse.Set("OK", "data", "status")
	HTTPResponse.Set(message, "data", "response")
	return HTTPResponse.String()
}

func jsonCheckerString(jsonParsed *gabs.Container, searchPath string) (string, error) {
	var returnString string

	if ok := jsonParsed.ExistsP(searchPath); !ok {
		return "", errors.New(jsonCheckerStringError.String())
	} else {
		temp := jsonParsed.Path(searchPath).Data()
		switch temp.(type) {
		case string:
			returnString = temp.(string)
		case float64:
			returnString = strconv.FormatFloat(temp.(float64), 'f', -1, 64)
		case bool:
			returnString = strconv.FormatBool(temp.(bool))
		default:
			return "", errors.New(jsonCheckerStringError.String())
		}
	}
	return returnString, nil
}

func hashPassword(password string) string {
	bytes := []byte(password)
	hash := sha256.New()
	hash.Write(bytes)
	hashBytes := hash.Sum(nil)
	return hex.EncodeToString(hashBytes)
}

func generateToken() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 32)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func generateVerificationCode() string {
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

func sendEmail(to, subject, body string) error {
	from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASS")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	addr := fmt.Sprintf("%s:%s", host, port)

	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n\n" +
		body

	auth := smtp.PlainAuth("", from, password, host)
	err := smtp.SendMail(addr, auth, from, []string{to}, []byte(msg))
	if err != nil {
		return err
	}
	return nil
}

func getIP(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	if strings.Contains(ip, ":") {
		ip, _, _ = net.SplitHostPort(ip)
	}
	return ip
}
