# Build stage
FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /build

ENV GONOSUMCHECK=* GONOSUMDB=* GOFLAGS=-mod=mod
COPY go.mod ./
RUN go mod tidy
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /auth-service ./cmd/auth-service

# Runtime stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /auth-service .

EXPOSE 8081

ENTRYPOINT ["./auth-service"]