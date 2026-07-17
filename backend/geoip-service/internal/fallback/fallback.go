package fallback

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type ipwhoisResponse struct {
	Status      string `json:"status"`
	CountryCode string `json:"country_code"`
}

type ipAPIResponse struct {
	Status      string `json:"status"`
	CountryCode string `json:"countryCode"`
}

const httpTimeout = 5 * time.Second

// LookupIPWhois looks up a country code via ipwhois.io.
// Returns the ISO country code or empty string if not found.
func LookupIPWhois(ip string) (string, error) {
	url := fmt.Sprintf("https://ipwhois.io/json/%s", ip)
	log.Printf("[Fallback] Calling ipwhois.io for %s", ip)

	client := &http.Client{Timeout: httpTimeout}
	resp, err := client.Get(url)
	if err != nil {
		return "", fmt.Errorf("ipwhois.io request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("ipwhois.io read body: %w", err)
	}

	var result ipwhoisResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("ipwhois.io parse response: %w", err)
	}

	if result.Status != "success" {
		return "", fmt.Errorf("ipwhois.io returned status: %s", result.Status)
	}

	log.Printf("[Fallback] ipwhois.io returned country_code=%q for %s", result.CountryCode, ip)
	return result.CountryCode, nil
}

// LookupIPAPI looks up a country code via ip-api.com.
// Returns the ISO country code or empty string if not found.
func LookupIPAPI(ip string) (string, error) {
	url := fmt.Sprintf("http://ip-api.com/json/%s", ip)
	log.Printf("[Fallback] Calling ip-api.com for %s", ip)

	client := &http.Client{Timeout: httpTimeout}
	resp, err := client.Get(url)
	if err != nil {
		return "", fmt.Errorf("ip-api.com request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("ip-api.com read body: %w", err)
	}

	var result ipAPIResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("ip-api.com parse response: %w", err)
	}

	if result.Status != "success" {
		return "", fmt.Errorf("ip-api.com returned status: %s", result.Status)
	}

	log.Printf("[Fallback] ip-api.com returned country_code=%q for %s", result.CountryCode, ip)
	return result.CountryCode, nil
}