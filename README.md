# PDn-control

A website compliance checker for Federal Law No. 152 (FL-152) and related Russian regulations.  
Crawls a target site, runs security and legal checks, and displays violations with evidence from real crawler data.

## Architecture

```
┌──────────┐    ┌─────────────┐    ┌───────────────────┐
│ Frontend │───→│ Main Backend│───→│ Crawler Workers   │
│  (React) │    │   (Go/Echo) │    │ (Puppeteer/Node)  │
└──────────┘    └──────┬──────┘    └───────────────────┘
                       │
              ┌────────┴────────┐
              │   Auth Service  │
              │   (Go/Echo)     │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              │   PostgreSQL    │
              │   + GeoIP       │
              └─────────────────┘
```

## Local Setup

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) 20+ (for frontend dev server only)
- [OpenRouter API key](https://openrouter.ai/keys)

### 1. Clone & prepare environment

```bash
git clone https://github.com/TemporaryOrganization1/PDn-control
cd PDn-control

# Create .env with your keys
cat > .env << 'EOF'
OPENROUTER_API_KEY=sk-or-v1-your-key-here
JWT_SECRET=generate-a-random-64-char-string-here
VITE_API_SECRET=top-secret-key
EOF
```

### 2. Start all services (Docker)

```bash
docker-compose up --build
```

This starts:

| Service          | Container name     | Port                |
|------------------|--------------------|---------------------|
| PostgreSQL       | postgres           | 5432                |
| GeoIP service    | geoip-service      | 8080                |
| Main backend API | main-backend       | 4000                |
| Crawler worker 1 | crawler-worker-1   | 3001                |
| Crawler worker 2 | crawler-worker-2   | 3002                |
| Crawler worker 3 | crawler-worker-3   | 3003                |
| Auth service     | auth-service       | 8081                |
| Frontend         | frontend           | 80                  |

The frontend is served at [http://localhost](http://localhost).

### 3. (Alternative) Run frontend in dev mode

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at [http://localhost:5173](http://localhost:5173) with hot reload.

## API

| Service       | Base URL              | Docs                          |
|---------------|-----------------------|-------------------------------|
| Main API      | `http://localhost:4000/api` | [`api/openapi.yaml`](api/openapi.yaml) |
| Auth API      | `http://localhost:8081/api/v1/auth` | — |
| GeoIP API     | `http://localhost:8080/api/v1` | — |

A Swagger UI is available at [http://localhost/swagger.html](http://localhost/swagger.html).

## Reports

- [Week 2 Report](reports/week2/README.md)
- [MVP v0 Report](reports/week2/mvp-v0-report.md)
