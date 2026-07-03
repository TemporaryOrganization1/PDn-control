# PDn-control

A website compliance checker for Federal Law No. 152 (FL-152) and related Russian regulations.
Crawls a target site, runs security and legal checks, and displays violations with evidence from real crawler data.

Deployed product: [https://pdn2.neurolife.tech/](https://pdn2.neurolife.tech/)

## Architecture

```text
Frontend (exported Next.js + nginx proxy)
      |
      v
Main Backend (Go/Echo)
      |
      v
Crawler Workers (Puppeteer/Node)

GeoIP Service (Go) -> PostgreSQL + GeoIP data
```

The application includes built-in email/password accounts in the main backend. Anonymous guests can run 3 accepted checks per browser device; authenticated users are not limited by that guest quota.

For the maintained architecture views and ADRs, see [docs/architecture/README.md](docs/architecture/README.md).

## Documentation

- [Development process and configuration management](docs/development-process.md)
- [Architecture and ADRs](docs/architecture/README.md)
- [Deployment notes](docs/deployment.md)
- [Testing and QA status](docs/testing.md)
- [Quality requirements](docs/quality-requirements.md)
- [Quality requirement tests](docs/quality-requirement-tests.md)
- [Definition of Done](docs/definition-of-done.md)
- [User acceptance tests](docs/user-acceptance-tests.md)
- [Roadmap](docs/roadmap.md)
- [OpenAPI contract](api/openapi.yaml)

## Local Setup

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) 20+ for frontend dev server only
- [OpenRouter API key](https://openrouter.ai/keys)

### 1. Clone and prepare environment

```bash
git clone https://github.com/TemporaryOrganization1/PDn-control
cd PDn-control

# Create .env from the sanitized example and replace placeholders
cp .env.example .env
```

**Note:** The SMTP settings are optional. If not configured, the application will work without email verification. To enable email verification during user registration, configure the SMTP settings with your Yandex email credentials.

### 2. Start all services with Docker

```bash
docker-compose up --build
```

This starts:

| Service          | Container name     | Port |
|------------------|--------------------|------|
| Public frontend proxy | frontend       | 80 |
| Main backend API | main-backend       | internal |
| Crawler workers  | crawler-worker-*   | internal |
| GeoIP service    | geoip-service      | internal |
| PostgreSQL       | postgres           | internal |

The frontend is served at [http://localhost](http://localhost).

### 3. Run frontend in dev mode

```bash
cd frontend
npm install
BACKEND_ORIGIN=http://localhost:4000 npm run dev:docker
```

The dev server runs at [http://localhost:8080](http://localhost:8080) with hot reload when using the `dev:docker` script.

## API

| Service   | Base URL                    | Docs |
|-----------|-----------------------------|------|
| Main API  | `http://localhost/api` | [`api/openapi.yaml`](api/openapi.yaml) |
| GeoIP API | internal Docker network only | - |

The OpenAPI contract is maintained in [`api/openapi.yaml`](api/openapi.yaml).

## Reports

- [Week 2 Report](reports/week2/README.md)
- [MVP v0 Report](reports/week2/mvp-v0-report.md)
