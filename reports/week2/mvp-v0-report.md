# MVP v0 Report

## 1. Purpose and Description of the MVP v0 Foundation

The purpose of MVP v0 is to establish the foundational architecture, core communication pathways, and deployment infrastructure for our automated website vulnerability assessment platform. This version is not intended for end-user security testing; rather, it validates that all three microservice types — Main Backend, Crawler Worker, and GeoIP — can be built, containerized, deployed, and can successfully communicate with one another.

**What MVP v0 demonstrates:**
- The Main Backend microservice starts successfully and exposes a REST API with Swagger documentation.
- The Crawler Worker microservice can receive a scan request, execute a "fast" check (a simplified, rule-based website analysis without AI), and return a result.
- The GeoIP microservice can accept an IP address and return a country code.
- Inter-service communication works: a request from Main Backend flows to a Crawler Worker, which calls GeoIP, and the result propagates back.
- Real-time progress updates are transmitted from the Crawler Worker to the Main Backend

This foundation directly supports the prototype by proving the core architecture is viable. It paves the way for MVP v1 stories, user authentication, scan history persistence, and the payment/account system.

---

## 2. Deployment / Runnable Artifact

The entire system is containerized and can be run locally or on any Docker-compatible environment.

**Runnable Artifact:**  
Docker Compose configuration available in the project repository.

**Repository Link:**  
`https://github.com/TemporaryOrganization1/PDn-control/`

**Container Images (built locally):**
- `main-backend`
- `crawler-worker`
- `geoip-service`

**Deployment URL (staging environment):**  
`https://deploy.com`

---

## 3. Public Video Demonstration

A video walkthrough of MVP v0 is available at the following link:

**Video Link:**  
https://disk.yandex.ru/i/YQJS24cyq4vlFg

The video covers:
- Starting all services with Docker Compose
- Accessing the microservices using CLI
- Running the smoke-check scenario

---

## 4. Relationship to Prototype and Proposed MVP v1 Stories

| Aspect | Prototype | MVP v0 (current) | MVP v1 (planned) |
|---|---|---|---|
| **Main Backend** | Mock server with hardcoded responses | Functional REST API; no auth | Full auth, websocket, history API, account/payment API |
| **Crawler Worker** | Script run manually on developer machine | Dockerized service; "fast" check only | "Detail" check with AI agent; worker pool auto-scaling |
| **GeoIP** | Static JSON lookup file | Live MaxMind GeoIP2 database in Docker container | Clustered GeoIP for high availability |
| **Frontend** | Figma mockups only | No frontend included (not ready) | Make Frontend working |
| **Deployment** | Local only | Docker Compose (local + staging) | Fix bugs |

MVP v0 bridges the gap between the non-functional prototype and the feature-complete MVP v1. It proves the architecture works end-to-end and provides a stable foundation for adding user-facing features in the next iteration.

---

## 5. Current Limitations, Placeholders, and Mocks

### Limitations

- **No authentication:** All API endpoints are currently open. The auth API is stubbed but not enforced.
- **No persistent storage:** Scan results are held in memory and lost on service restart. PostgreSQL integration is planned for MVP v1.
- **No frontend working:** The system is API-only at this stage. Swagger UI serves as the primary interface for testing.
- **Single-instance deployment:** All services run as single instances. Horizontal scaling with a load balancer is planned for future versions.
- **Limited error handling:** Graceful degradation when a worker or GeoIP service is unavailable is minimal.

### Placeholders & Mocks

- **Account/Payment API endpoints:** No mocks.

---

## 6. Local Setup Instructions

**Quick Start Summary:**

**Prerequisites:**
- Docker Engine 29.4+
- Docker Compose v2.20+
- Git

**Steps:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TemporaryOrganization1/PDn-control
   cd PDn-control
   ```

2. **Set up environment variables (.env):**
   OPENROUTER_API_KEY=key

3. **Build and start all services:**
   ```bash
   docker compose up --build
   ```

5. **Verify services are running:**
   ```bash
   docker compose ps
   ```
   All three services should show status `Up`.

6. **Access Swagger UI:**
   Download https://github.com/TemporaryOrganization1/PDn-control/blob/main/frontend/swagger.html and open it in browser.

7. **Stop services:**
   ```bash
   docker compose down
   ```

---

## 7. Repeatable Smoke-Check Scenario

This scenario demonstrates that MVP v0 is accessible and usable for its core purpose: performing an automated website scan and receiving a result with geographic context.

### Scenario: Submit a "fast" scan request and observe the results

**Preconditions:**
- All services are running via `docker compose up`
- You have access to a terminal with `curl` installed.

**Access Instructions:**

All interactions happen through the Main Backend at `http://localhost:4000`.

### Steps

#### Step 1: Verify Health Endpoints

Confirm that all services are healthy.

```bash
# Check Main Backend health
curl http://localhost:4000/api/health
```

**Expected result:**
```json
{
  "status": "ok"
}
```

---

#### Step 2: Access Swagger UI

Download https://github.com/TemporaryOrganization1/PDn-control/blob/main/frontend/swagger.html and open it in browser.
**Expected result:** The Swagger UI page loads, displaying all available API endpoints.

---

#### Step 3: Make a request

Using 3. POST /api/check:

One of the possible secret key: top-secret-key
Target URL: https://example.com for example
Request-Id: req-id for example
Check Type: fast

The result is 

```json
Content-Type: application/json

{
  "code": "ERR_OK",
  "req-id": "req-id",
  "data": {
    "req-id": "req-id",
    "status": "accepted"
  }
}
```


---

#### Step 4: Check progress with HTTP request (only in V0)

Using 4. GET /api/progress/{req-id}:

```json
{
  "req-id": "req-id",
  "url": "https://example.com",
  "type": "fast",
  "status": "completed",
  "worker": "http://crawler-worker-1:3000",
  "progress": 100,
  "results": [
    {
      "id": "https",
      "result": "ok",
      "data": {
        "endpoints": []
      }
    },
    {
      "id": "cookie-ads",
      "result": "ok",
      "data": {
        "endpoints": []
      }
    },
    {
      "id": "ssl/tls",
      "result": "ok",
      "data": {
        "endpoints": {}
      }
    },
    {
      "id": "ips",
      "result": "fail",
      "data": {
        "services": [
          {
            "country": [
              "unknown"
            ],
            "domain": "example.com",
            "ip": [
              "8.6.112.6"
            ]
          }
        ]
      }
    }
  ],
  "errors": [],
  "created_at": "2026-06-14T15:15:34.883413601Z"
}
```

---

### Smoke-Check Summary Table

| # | Step | Action | Expected Outcome |
|---|------|--------|------------------|
| 1 | Health Check | `curl http://localhost:4000/api/health` | Returns `{"status": "ok"}` |
| 2 | Swagger UI | Open `swagger.html` in browser | API endpoints are listed and documented |
| 3 | Submit Check | `POST /api/check` with secret key, target URL, Request-Id, and check type | Returns `{"code": "ERR_OK", "req-id": "req-id", "data": {"status": "accepted"}}` |
| 4 | Check Progress | `GET /api/progress/{req-id}` | Returns completed scan with results, progress 100, and findings including HTTPS, cookies, SSL/TLS, and IPs checks |

---

### Smoke-Check Pass Criteria

All steps must produce the expected results described above. If any step fails, the smoke check is considered failed, and the system is not ready for further testing or demonstration. A passing smoke check confirms that:

- The system deploys correctly.
- All microservices start and communicate.
- The API is accessible and documented via Swagger.
- An interactive data flow (scan submission → progress → result) completes end-to-end.
- GeoIP enrichment is functional.
