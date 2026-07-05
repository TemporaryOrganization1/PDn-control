FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /build

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /main-backend ./cmd/main-backend

FROM alpine:3.19

RUN apk add --no-cache ca-certificates bind-tools iproute2 netcat-openbsd openssl socat

WORKDIR /app
ENV PDF_FONT_DIR=/app

COPY --from=builder /main-backend .
COPY config.json .
COPY internal/pdfGen/DejaVuSans.ttf .
COPY internal/pdfGen/DejaVuSans-Bold.ttf .

RUN mkdir -p /app/backend/reports /tmp/pdn-disk

EXPOSE 4000

ENTRYPOINT ["./main-backend"]
