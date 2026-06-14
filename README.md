# PDn-control

A website compliance checker for Federal Law No. 152 (FL-152).

## Local Setup

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) 20+
- [OpenRouter API key](https://openrouter.ai/keys)

### 1. Clone & prepare environment

```bash
git clone https://github.com/TemporaryOrganization1/PDn-control
cd PDn-control

# Create .env with your OpenRouter API key
echo "OPENROUTER_API_KEY=sk-or-v1-your-key-here" > .env
```

### 2. Start backend services (Docker)

```bash
docker-compose up --build
```

This starts:
| Service          | Container name     | Port  |
|------------------|--------------------|-------|
| PostgreSQL       | postgres           | 5432  |
| GeoIP service    | geoip-service      | 8080  |
| Main backend API | main-backend       | 4000  |
| Crawler worker 1 | crawler-worker-1   | 3001  |
| Crawler worker 2 | crawler-worker-2   | 3002  |
| Crawler worker 3 | crawler-worker-3   | 3003  |

### 3. Start frontend (TODO: add frontend to Docker Compose)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at [http://localhost:5173](http://localhost:5173).

### 4. Using the API

The OpenAPI specification is available at [`api/openapi.yaml`](api/openapi.yaml) and a Postman collection at [`api/postman_collection.json`](api/postman_collection.json).

A Swagger UI is also running at [http://localhost:5173/swagger.html](http://localhost:5173/swagger.html) when the frontend dev server is running.

## Reports

- [Week 2 Report](reports/week2/README.md)
- [MVP v0 Report](reports/week2/mvp-v0-report.md)
