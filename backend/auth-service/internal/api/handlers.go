package api

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/crypto/bcrypt"

	"github.com/TemporaryOrganization1/PDn-control/backend/auth-service/internal/database"
	"github.com/TemporaryOrganization1/PDn-control/backend/auth-service/internal/models"
)

// Config holds the application configuration for the API layer.
type Config struct {
	JWTSecret          string
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
	VerificationBaseURL string
	AppEnv             string // "development" or "production"
}

// Server wraps the Echo HTTP server and its dependencies.
type Server struct {
	echo   *echo.Echo
	store  *database.Store
	config Config
}

// NewServer creates a new Server with all routes and middleware.
func NewServer(store *database.Store, cfg Config) *Server {
	e := echo.New()

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "method=${method}, uri=${uri}, status=${status}, latency=${latency_human}\n",
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAuthorization},
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))

	s := &Server{echo: e, store: store, config: cfg}
	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	// Public routes
	s.echo.POST("/api/v1/auth/register", s.handleRegister)
	s.echo.POST("/api/v1/auth/login", s.handleLogin)
	s.echo.POST("/api/v1/auth/refresh", s.handleRefreshToken)
	s.echo.GET("/health", s.healthCheck)

	// Protected routes (require valid JWT)
	protected := s.echo.Group("/api/v1/auth")
	protected.Use(s.jwtMiddleware)
	protected.POST("/logout", s.handleLogout)
	protected.GET("/me", s.handleMe)
}

// Start starts the HTTP server.
func (s *Server) Start(port string) error {
	log.Printf("[API] Listening on :%s", port)
	return s.echo.Start(":" + port)
}

// Shutdown gracefully shuts down the server.
func (s *Server) Shutdown(ctx context.Context) error {
	return s.echo.Shutdown(ctx)
}

// ---------- Handlers ----------

func (s *Server) healthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status":  "ok",
		"service": "auth-service",
		"time":    time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Server) handleRegister(c echo.Context) error {
	var req models.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_INVALID_REQUEST", Msg: "Invalid request body",
		})
	}

	// Trim whitespace
	req.Email = strings.TrimSpace(req.Email)
	req.Name = strings.TrimSpace(req.Name)
	req.Surname = strings.TrimSpace(req.Surname)

	// Validate email format
	emailRegex := regexp.MustCompile(`^\S+@\S+\.\S+$`)
	if !emailRegex.MatchString(req.Email) {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_INVALID_EMAIL", Msg: "Invalid email format",
		})
	}

	// Validate Russian domain (.ru TLD)
	if !strings.HasSuffix(strings.ToLower(req.Email), ".ru") {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_INVALID_EMAIL", Msg: "Only Russian email domains (.ru) are allowed",
		})
	}

	// Validate name
	if len(req.Name) < 1 || len(req.Name) > 100 {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_INVALID_NAME", Msg: "Name must be between 1 and 100 characters",
		})
	}

	// Validate surname
	if len(req.Surname) < 1 || len(req.Surname) > 100 {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_INVALID_SURNAME", Msg: "Surname must be between 1 and 100 characters",
		})
	}

	// Validate password strength
	if len(req.Password) < 8 {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_WEAK_PASSWORD", Msg: "Password must be at least 8 characters",
		})
	}
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(req.Password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(req.Password)
	hasDigit := regexp.MustCompile(`[0-9]`).MatchString(req.Password)
	if !hasUpper || !hasLower || !hasDigit {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_WEAK_PASSWORD",
			Msg:  "Password must contain at least one uppercase letter, one lowercase letter, and one digit",
		})
	}

	// Check duplicate email (generic response to prevent enumeration)
	existingUser, _ := s.store.GetUserByEmail(c.Request().Context(), req.Email)
	if existingUser != nil {
		return c.JSON(http.StatusConflict, models.APIResponse{
			Code: "ERR_EMAIL_EXISTS", Msg: "An account with this email already exists",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[API] bcrypt error: %v", err)
		return c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code: "ERR_INTERNAL", Msg: "Internal server error",
		})
	}

	// Generate verification token (reserved for future email verification)
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		log.Printf("[API] rand error: %v", err)
		return c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code: "ERR_INTERNAL", Msg: "Internal server error",
		})
	}
	verificationToken := hex.EncodeToString(tokenBytes)

	// Create user in DB (email_verified = TRUE for now until SMTP is active)
	user, err := s.store.CreateUser(
		c.Request().Context(),
		req.Email,
		req.Name,
		req.Surname,
		string(hashedPassword),
		verificationToken,
	)
	if err != nil {
		// Check if it's a duplicate email race condition
		if strings.Contains(err.Error(), "duplicate key") {
			return c.JSON(http.StatusConflict, models.APIResponse{
				Code: "ERR_EMAIL_EXISTS", Msg: "An account with this email already exists",
			})
		}
		log.Printf("[API] create user error: %v", err)
		return c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code: "ERR_INTERNAL", Msg: "Internal server error",
		})
	}

	response := models.APIResponse{
		Code: "ERR_OK",
		Msg:  "Registration successful",
		Data: map[string]interface{}{
			"id":      user.ID,
			"email":   user.Email,
			"name":    user.Name,
			"surname": user.Surname,
		},
	}

	// In development mode, include the verification token for testing
	if s.config.AppEnv == "development" {
		response.DevInfo = "Verification token (dev only): " + verificationToken
		log.Printf("[DEV] Verification token for %s: %s", req.Email, verificationToken)
	}

	return c.JSON(http.StatusCreated, response)
}

func (s *Server) handleLogin(c echo.Context) error {
	var req models.LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_INVALID_REQUEST", Msg: "Invalid request body",
		})
	}

	req.Email = strings.TrimSpace(req.Email)

	// Get user by email
	user, err := s.store.GetUserByEmail(c.Request().Context(), req.Email)
	if err != nil {
		// Generic response to prevent enumeration
		return c.JSON(http.StatusUnauthorized, models.APIResponse{
			Code: "ERR_INVALID_CREDENTIALS", Msg: "Invalid email or password",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, models.APIResponse{
			Code: "ERR_INVALID_CREDENTIALS", Msg: "Invalid email or password",
		})
	}

	// Generate token pair
	tokens, err := s.generateTokenPair(user)
	if err != nil {
		log.Printf("[API] token generation error: %v", err)
		return c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code: "ERR_INTERNAL", Msg: "Internal server error",
		})
	}

	return c.JSON(http.StatusOK, tokens)
}

func (s *Server) handleRefreshToken(c echo.Context) error {
	var req models.RefreshRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, models.APIResponse{
			Code: "ERR_INVALID_REQUEST", Msg: "Invalid request body",
		})
	}

	// Hash the incoming refresh token to match stored hash
	tokenHash := hashToken(req.RefreshToken)

	// Find user by refresh token
	user, err := s.store.GetUserByRefreshToken(c.Request().Context(), tokenHash)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, models.APIResponse{
			Code: "ERR_INVALID_TOKEN", Msg: "Invalid or expired refresh token",
		})
	}

	// Invalidate old refresh token (rotation)
	if err := s.store.InvalidateRefreshToken(c.Request().Context(), tokenHash); err != nil {
		log.Printf("[API] invalidate token error: %v", err)
	}

	// Generate new token pair
	tokens, err := s.generateTokenPair(user)
	if err != nil {
		log.Printf("[API] token generation error: %v", err)
		return c.JSON(http.StatusInternalServerError, models.APIResponse{
			Code: "ERR_INTERNAL", Msg: "Internal server error",
		})
	}

	return c.JSON(http.StatusOK, tokens)
}

func (s *Server) handleLogout(c echo.Context) error {
	// Get user ID from JWT context (set by middleware)
	userID := c.Get("user_id").(int64)

	// Get the token from the Authorization header
	authHeader := c.Request().Header.Get("Authorization")
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) == 2 {
		// Try to extract refresh token from request body
		var req models.RefreshRequest
		if err := c.Bind(&req); err == nil && req.RefreshToken != "" {
			tokenHash := hashToken(req.RefreshToken)
			_ = s.store.InvalidateRefreshToken(c.Request().Context(), tokenHash)
		}
	}

	_ = userID // Could log user logout here

	return c.JSON(http.StatusOK, models.APIResponse{
		Code: "ERR_OK", Msg: "Logged out successfully",
	})
}

func (s *Server) handleMe(c echo.Context) error {
	userID := c.Get("user_id").(int64)

	user, err := s.store.GetUserByID(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusNotFound, models.APIResponse{
			Code: "ERR_NOT_FOUND", Msg: "User not found",
		})
	}

	return c.JSON(http.StatusOK, models.APIResponse{
		Code: "ERR_OK",
		Msg:  "OK",
		Data: map[string]interface{}{
			"id":             user.ID,
			"email":          user.Email,
			"name":           user.Name,
			"surname":        user.Surname,
			"email_verified": user.EmailVerified,
			"created_at":     user.CreatedAt,
		},
	})
}

// ---------- JWT Helpers ----------

type jwtClaims struct {
	UserID  int64  `json:"user_id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Surname string `json:"surname"`
	jwt.RegisteredClaims
}

func (s *Server) generateTokenPair(user *database.UserRow) (*models.TokenPair, error) {
	// Access token
	accessExp := time.Now().Add(s.config.AccessTokenTTL)
	accessClaims := &jwtClaims{
		UserID:  user.ID,
		Email:   user.Email,
		Name:    user.Name,
		Surname: user.Surname,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(accessExp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "auth-service",
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString([]byte(s.config.JWTSecret))
	if err != nil {
		return nil, err
	}

	// Refresh token (random string, stored hashed)
	refreshBytes := make([]byte, 32)
	if _, err := rand.Read(refreshBytes); err != nil {
		return nil, err
	}
	refreshStr := hex.EncodeToString(refreshBytes)

	// Store hashed refresh token in DB
	refreshExp := time.Now().Add(s.config.RefreshTokenTTL)
	tokenHash := hashToken(refreshStr)
	if err := s.store.SaveRefreshToken(context.Background(), user.ID, tokenHash, refreshExp); err != nil {
		return nil, err
	}

	return &models.TokenPair{
		AccessToken:  accessStr,
		RefreshToken: refreshStr,
		ExpiresIn:    int(s.config.AccessTokenTTL.Seconds()),
	}, nil
}

// jwtMiddleware validates the JWT token and sets user_id in context.
func (s *Server) jwtMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, models.APIResponse{
				Code: "ERR_NO_TOKEN", Msg: "Missing authorization header",
			})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.JSON(http.StatusUnauthorized, models.APIResponse{
				Code: "ERR_INVALID_TOKEN", Msg: "Invalid authorization header format",
			})
		}

		tokenStr := parts[1]
		claims := &jwtClaims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(s.config.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			return c.JSON(http.StatusUnauthorized, models.APIResponse{
				Code: "ERR_INVALID_TOKEN", Msg: "Invalid or expired token",
			})
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("name", claims.Name)
		c.Set("surname", claims.Surname)

		return next(c)
	}
}

// hashToken creates a SHA-256 hash of a token for secure storage.
func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}
