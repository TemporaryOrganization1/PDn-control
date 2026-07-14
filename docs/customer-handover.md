# Customer Handover

This document describes the current public handover state of PDn-control. It is practical operating guidance, not a private credential packet. Secrets, limited-permission credentials, private recording links, exact private timecodes, and customer-identifying private evidence must be shared only through the approved private submission channel.

## Current Handover State

| Item | Current state |
|---|---|
| Product access artifact | Public deployment at [https://pdn2.neurolife.tech/](https://pdn2.neurolife.tech/). |
| Hosted documentation | Public documentation viewer at [http://194.87.95.22:8088/](http://194.87.95.22:8088/). |
| Repository | Public GitHub repository: [TemporaryOrganization1/PDn-control](https://github.com/TemporaryOrganization1/PDn-control). |
| Handover level | `Ready for independent use` based on the public deployment, repository, and maintained run/handover documentation. `Independently used by customer` and `Deployed or operated on customer side` are not yet evidenced in the public repository. |
| Customer-confirmation status | `Not yet accepted` in public repository evidence until Week 6/Week 7 confirmation is recorded. |
| Current support expectation | The team still operates the public deployment and must support configuration, secrets, deployment recovery, and final transition questions until those responsibilities are explicitly transferred or retained. |

## Transition Scope

### Made available publicly

- Source code, Docker Compose topology, API contract, tests, and maintained documentation in the public repository.
- Product deployment for customer, TA, and reviewer access.
- Hosted documentation site for browsing the maintained docs without reading raw Markdown in GitHub.
- Current setup, deployment, testing, architecture, development-process, and handover guidance.

### Retained by the team unless private evidence says otherwise

- Production server shell access and hosting account ownership.
- DNS, TLS certificate management, and reverse-proxy or firewall configuration for `pdn2.neurolife.tech`.
- Production `.env` values and private secrets.
- OpenRouter account/API key ownership.
- SMTP mailbox/app-password ownership.
- Private recordings, private access instructions, and Moodle-only submission evidence.

### Pending explicit transition decision

- Whether the customer will operate the product on the current team-managed server, deploy their own Docker Compose instance, or only use the public deployment during course evaluation.
- Whether any production credentials or limited-permission operational credentials will be transferred privately.
- Whether customer-side deployment or independent customer operation has been achieved.

## What The Product Provides

PDn-control lets a user submit a public website URL, runs crawler-based checks, evaluates technical and content evidence related to personal-data risk, and presents a structured report. Guest and Free users receive three summary scans in a rolling 30-day window without PDF or screenshots. Paid-origin scans receive the full evidence view, screenshots, and PDF output. The product remains an initial compliance-risk checker; it does not replace a legal opinion.

Main user-facing flow:

1. Open [https://pdn2.neurolife.tech/](https://pdn2.neurolife.tech/).
2. Enter a public website URL.
3. Start the check.
4. Wait for progress to complete.
5. Review the result page and PDF report where available.

## Configuration And Secrets

Use the sanitized [.env.example](../.env.example) as the public checklist of required and optional configuration values. Actual values must remain private.

| Configuration | Purpose | Handover note |
|---|---|---|
| `OPENROUTER_API_KEY` | Enables AI-assisted crawler checks. | Required for production-like AI checks; never commit the key. |
| `OPENROUTER_BASE_URL` | Optional OpenRouter-compatible reverse proxy. | Used when direct OpenRouter access is unavailable from the application server. |
| `WORKER_SECRET` | Authenticates crawler progress callbacks to main-backend. | Must match backend and worker expectations; rotate if exposed. |
| `IMAGE_SECRET` | Protects evidence-image upload path. | Required for crawler evidence image upload. |
| `APP_BASE_URL` | Public base URL used in generated links. | Use `https://pdn2.neurolife.tech` for the current public deployment. |
| `SERVER_NAME`, `ENABLE_HTTPS`, `COOKIE_SECURE`, `LETSENCRYPT_DIR` | Domain, TLS, and cookie security settings. | Must match the deployment and certificate arrangement. |
| `DATABASE_URL` | PostgreSQL connection override. | Defaults to the bundled Compose `postgres` service unless overridden. |
| `SMTP_*` | Optional email verification delivery. | Required only when registration email verification must send real mail. |
| `FREE_SCAN_LIMIT`, `FREE_SCAN_WINDOW_DAYS` | Free/guest rolling launch quota. | Production defaults are 3 accepted scans in 30 days; `GUEST_LIMIT` is only a deprecated fallback. |
| `FREE_AI_ITERATIONS`, `PAID_AI_ITERATIONS` | Worker exploration budgets captured in each scan profile. | Defaults are 3 and 10; keep values within the worker's supported 1–10 range. |

## Setup Or Redeployment Steps

For a fresh Docker Compose run:

```bash
git clone https://github.com/TemporaryOrganization1/PDn-control.git
cd PDn-control
cp .env.example .env
docker compose up -d --build
```

Then open [http://localhost](http://localhost) for a local deployment, or configure the production domain and TLS values described in [deployment.md](deployment.md) before exposing the service publicly.

For the documentation-only site:

```bash
python3 docs-site/server.py --host 0.0.0.0 --port 8088
```

The documentation viewer serves files from `docs/` and does not start the product stack.

## Verification Steps

Use these checks after deployment, redeployment, or handover:

1. Open the product URL and confirm the landing page loads.
2. Open `https://pdn2.neurolife.tech/api/health` and expect `{"status":"ok"}`.
3. Run one sanitized public test scan, for example against `https://example.com`.
4. Confirm the progress page reaches a final status and the result page shows findings or passed checks.
5. Confirm a Free scan has no PDF or image artifacts and reports incomplete categories as `unknown`.
6. From an authenticated profile, activate Paid for 30 days and confirm a new Paid scan provides its PDF and evidence images. This self-service transition is temporary until payment-provider integration.
7. Open the hosted documentation site and confirm deployment, architecture, testing, and handover pages are readable.
8. If SMTP is enabled, run the diagnostics in [deployment.md](deployment.md#smtp-verification-diagnostics) from inside `main-backend`.
9. If OpenRouter is proxied, run the proxy checks in [deployment.md](deployment.md#openrouter-nginx-proxy).

## Recovery Notes

- Restart the full product stack with `docker compose up -d --build`.
- Inspect service status with `docker compose ps`.
- Inspect logs with `docker compose logs --tail=100 <service>`.
- If the frontend fails with HTTPS enabled, verify certificate paths and `LETSENCRYPT_DIR`.
- If scans do not start, check crawler worker logs, `WORKER_SECRET`, `OPENROUTER_API_KEY`, and target-site network access.
- If progress or reports are missing, check `main-backend`, PostgreSQL, `backend-reports`, and `backend-images` volumes.
- If email verification fails, use the SMTP diagnostics and optional IPv6 SMTP proxy notes in [deployment.md](deployment.md).

## Documentation Entry Points

- First-time product/repository overview: [README.md](../README.md)
- Contributor workflow: [CONTRIBUTING.md](../CONTRIBUTING.md)
- AI-agent workflow: [AGENTS.md](../AGENTS.md)
- Deployment and operations: [deployment.md](deployment.md)
- Architecture and ADRs: [architecture/README.md](architecture/README.md)
- Testing and CI status: [testing.md](testing.md)
- Development process and configuration management: [development-process.md](development-process.md)
- User acceptance tests: [user-acceptance-tests.md](user-acceptance-tests.md)
- Roadmap: [roadmap.md](roadmap.md)

## Known Limitations And Support Still Needed

- The current public repository does not contain private customer acceptance evidence, private access instructions, or production credentials.
- The current public handover state does not prove customer-side deployment or operation. That requires Week 6/Week 7 transition evidence.
- The hosted documentation site is reachable, but it must be refreshed from the repository state that includes this file before `docs/customer-handover.md` is browsable there.
- The team must still confirm with the customer whether this document is sufficient for the reached handover level.
- If the customer wants to operate the product independently, the team must privately transfer or help recreate server access, DNS/TLS ownership, production `.env` values, OpenRouter access, SMTP access, and any backup/recovery expectations.
- Public deployment availability can be affected by server maintenance; smoke-check the product before grading, Sprint Review, or handover meetings.

## Assignment 6 Follow-Up TODOs

- Record the Week 6 documentation review result in `reports/week6/README.md`.
- After the customer trial, update this document with the confirmed handover level.
- After Week 7 transition confirmation, update customer-confirmation status as `Accepted`, `Accepted with follow-up items`, or `Not yet accepted`.
- Add public summaries of transferred, delegated, retained, or blocked transition responsibilities without exposing private credentials or customer-identifying evidence.
