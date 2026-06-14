FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /build

ENV GONOSUMCHECK=* GONOSUMDB=* GOFLAGS=-mod=mod

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /main-backend ./cmd/main-backend

FROM alpine:3.19

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /main-backend .
COPY config.json .

EXPOSE 4000

ENTRYPOINT ["./main-backend"]