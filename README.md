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

- [Self-hosted documentation site](docs-site/README.md)
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

### Run Documentation Only

On a separate lightweight server, clone the repository and start only the documentation viewer:

```bash
python3 docs-site/server.py --host 0.0.0.0 --port 8088
```

This serves the maintained files from `docs/` as a browsable site and does not start the product frontend, backend, workers, PostgreSQL, or Docker Compose stack. See [docs-site/README.md](docs-site/README.md) for details.

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

For a server deployment with a real domain, set these values in `.env` before starting Compose:

```env
APP_BASE_URL=https://your-domain.example
SERVER_NAME=your-domain.example
ENABLE_HTTPS=true
COOKIE_SECURE=true
IMAGE_SECRET=replace-with-a-private-image-upload-secret
LETSENCRYPT_DIR=/etc/letsencrypt
```

The frontend nginx container will serve the exported Next.js app, redirect HTTP to HTTPS, and proxy `/api/` to `main-backend`.

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

## Evidence Images and Flags

Crawler evidence images are uploaded to the backend with `X-Image-Secret` and served back through `/api/img/{id}`. Country flags are bundled locally from the open-source `flag-icons` SVG set under `frontend/public/flags`, so runtime pages use URLs such as `/flags/ru.svg` without an external CDN.

## Reports

- [Week 2 Report](reports/week2/README.md)
- [MVP v0 Report](reports/week2/mvp-v0-report.md)
