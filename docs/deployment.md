# Deployment Notes

The project is intended to run on a server with Docker Compose:

```bash
docker compose up -d --build
```

## Required Environment

Create a server-side `.env` file from the sanitized root [`.env.example`](../.env.example), then replace placeholders or provide equivalent environment variables before running Compose:

- `OPENROUTER_API_KEY`: required for AI-assisted crawler checks.
- `OPENROUTER_BASE_URL`: optional OpenRouter-compatible reverse proxy URL. Leave blank for direct OpenRouter access; set to `https://manapi.ru:37777/api/v1` on the production server when using the nginx proxy.
- `WORKER_SECRET`: shared secret used by crawler workers when reporting progress to the main backend.
- `APP_BASE_URL`: public site URL used in generated links, for example `https://pdn.example.com`.
- `SERVER_NAME`: domain handled by the frontend nginx container. Use `_` for local runs.
- `ENABLE_HTTPS`: set to `true` only when valid TLS certificates are mounted into the frontend container.
- `COOKIE_SECURE`: set to `true` when the public site is served through HTTPS. Set to `false` for plain HTTP/local deployments.
- `CORS_ALLOWED_ORIGINS`: comma-separated list of allowed frontend origins for direct backend access during development or custom deployments.
- `DATABASE_URL`: optional override for the main backend PostgreSQL connection. The default Compose value points to the bundled `postgres` service.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`: optional SMTP settings used by email verification. For Yandex STARTTLS use `SMTP_HOST=smtp.yandex.ru`, `SMTP_PORT=587`, `SMTP_USER`/`SMTP_FROM` as the mailbox address, and an app password in `SMTP_PASSWORD`.
- `SMTP_SERVER_NAME`: optional TLS/AUTH server name. Leave blank for direct SMTP. Set to `smtp.yandex.ru` when `SMTP_HOST` points to a local proxy.
- `SMTP_NETWORK`: optional dial network: `tcp`, `tcp4`, or `tcp6`. Leave blank for `tcp`.

## Local HTTP Run

For local development with the production Docker stack:

```env
APP_BASE_URL=http://localhost
SERVER_NAME=_
ENABLE_HTTPS=false
COOKIE_SECURE=false
LETSENCRYPT_DIR=pdn-letsencrypt
```

Then run:

```bash
docker compose up -d --build
```

The frontend nginx container serves the exported Next.js app on `http://localhost` and proxies `/api/` to `main-backend` over the internal Docker network.

## OpenRouter Nginx Proxy

AI-assisted detail checks are executed by `crawler-worker-*`. If the application server cannot reach OpenRouter directly, deploy a separate nginx reverse proxy on a host that can reach `https://openrouter.ai`.

Use [ops/nginx/openrouter-proxy.conf](../ops/nginx/openrouter-proxy.conf) as the proxy-host config:

1. Copy it to the proxy host, for example `/etc/nginx/conf.d/openrouter-proxy.conf`.
2. Replace `203.0.113.10` with the public IP address of the production application server.
3. Make sure the certificate paths match the proxy hostname, for example `manapi.ru`.
4. Validate and reload nginx:

```bash
nginx -t
systemctl reload nginx
```

The proxy listens on `37777`, accepts only `/api/v1/`, forwards requests to `https://openrouter.ai/api/v1/`, preserves the worker-provided `Authorization` header, and keeps buffering disabled for streaming-compatible OpenRouter responses. The committed allowlist uses a documentation IP so the proxy stays closed until the real application server IP is configured.

On the application server, put the proxy URL into `.env` and recreate the crawler workers:

```env
OPENROUTER_BASE_URL=https://manapi.ru:37777/api/v1
```

```bash
docker compose up -d --build crawler-worker-1 crawler-worker-2 crawler-worker-3
```

Basic checks from the application server:

```bash
curl -i https://manapi.ru:37777/
curl -i -X POST https://manapi.ru:37777/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemma-4-31b-it","messages":[{"role":"user","content":"ping"}],"stream":false}'
```

The root path should not proxy OpenRouter. The `/api/v1/chat/completions` path should reach the OpenRouter-compatible route when called from the allowlisted application server.

## SMTP Verification Diagnostics

Email verification is sent by `main-backend`, so SMTP connectivity must be tested from inside that container. A successful host-level command such as `openssl s_client -starttls smtp -connect smtp.yandex.ru:587 -crlf` only proves that the server host can reach SMTP; it does not prove that Docker NAT, container DNS, forwarding, UFW/firewalld rules, or IPv6 routing are correct for the container.

After rebuilding the stack, run:

```bash
sh scripts/diagnose-main-backend-network.sh
```

Or run the checks manually:

```bash
docker compose exec main-backend sh -lc '
ip route
ip -4 route get 1.1.1.1
ip -4 route get smtp.yandex.ru
cat /etc/resolv.conf
getent hosts smtp.yandex.ru
nc -4 -vz -w 10 1.1.1.1 443
nc -4 -vz -w 10 smtp.yandex.ru 587
nc -4 -vz -w 10 smtp.yandex.ru 465
'
```

Expected result: DNS resolves `smtp.yandex.ru`, TCP to `smtp.yandex.ru:587` succeeds, and TCP to `1.1.1.1:443` succeeds. If these checks fail inside `main-backend` but the same target works from the host, investigate Docker bridge/NAT rules, `net.ipv4.ip_forward`, UFW/firewalld forwarding policy, provider egress filtering, and broken IPv6 preference/routing. Keep testing inside `main-backend` after each network change.

Interpretation:

- If `1.1.1.1:443` also fails, debug general container outbound networking: Docker bridge, NAT masquerade, `FORWARD` chain, UFW/firewalld forwarding policy, or provider-level routing.
- If `1.1.1.1:443` works but `smtp.yandex.ru:587` fails, the container has outbound internet but SMTP submission is blocked or filtered. Check host firewall rules such as `DOCKER-USER`, UFW `route` rules, nftables/iptables output policy, and provider egress filtering for ports `587` and `465`.
- If `getent hosts smtp.yandex.ru` returns only IPv6 while IPv6 is not routed from containers, keep using IPv4 checks (`nc -4`). The backend SMTP dial failure on IPv4 still means Docker/NAT/firewall/provider egress must be fixed; changing the SMTP password will not help.

The `main-backend` image includes diagnostic tools (`ip`, `nc`, `nslookup`, `openssl`) so these checks do not depend on packages installed on the host.

### Emergency IPv6 SMTP Proxy

Some VPS providers block outbound SMTP over IPv4 while IPv6 SMTP still works. If the host succeeds with `nc -6 -vz -w 10 smtp.yandex.ru 587` but IPv4 `465/587` time out, start a host-network proxy that listens only on the Docker bridge gateway and forwards to Yandex SMTP over IPv6:

```bash
sh scripts/start-smtp-ipv6-proxy.sh
```

Or enable the compose profile directly:

```bash
COMPOSE_PROFILES=smtp-ipv6 docker compose up -d --build smtp-ipv6-proxy
```

The proxy listens on the Docker bridge gateway. Put the matching values into `.env`, for example:

```env
COMPOSE_PROFILES=smtp-ipv6
SMTP_HOST=172.18.0.1
SMTP_PORT=1587
SMTP_SERVER_NAME=smtp.yandex.ru
SMTP_NETWORK=tcp4
```

Keep the existing Yandex mailbox values in `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`, then recreate `main-backend`:

```bash
docker compose up -d --build main-backend
```

Check that the proxy is actually listening before testing registration:

```bash
docker compose ps smtp-ipv6-proxy
docker logs --tail=50 smtp-ipv6-proxy
docker compose exec main-backend sh -lc 'nc -4 -vz -w 10 172.18.0.1 1587'
```

If `nc` returns `Connection refused` and `docker logs smtp-ipv6-proxy` says there is no such container, the backend is configured for the proxy but the proxy has not been started.

This proxy does not terminate TLS or read SMTP credentials. It only forwards bytes from the Docker bridge to `smtp.yandex.ru:587` over IPv6, so STARTTLS, certificate validation, and SMTP authentication still happen between `main-backend` and Yandex.

## Production Domain Run

Point the domain DNS `A`/`AAAA` record to the server, place certificates on the host, then set:

```env
APP_BASE_URL=https://your-domain.example
SERVER_NAME=your-domain.example
ENABLE_HTTPS=true
COOKIE_SECURE=true
LETSENCRYPT_DIR=/etc/letsencrypt
```

By default the frontend container expects:

```text
/etc/letsencrypt/live/your-domain.example/fullchain.pem
/etc/letsencrypt/live/your-domain.example/privkey.pem
```

Use `SSL_CERTIFICATE` and `SSL_CERTIFICATE_KEY` if your certificate files live elsewhere inside the mounted `/etc/letsencrypt` directory. With HTTPS enabled, nginx redirects port `80` traffic to `443`.

## Services

- `frontend`: public nginx reverse proxy on ports `80` and `443`; serves the exported Next.js frontend and proxies `/api/` to `main-backend`.
- `main-backend`: Go API for authentication, guest limits, scan orchestration, and progress/results.
- `crawler-worker-1..3`: Node/Chromium workers that perform website checks.
- `geoip-service`: GeoIP data updater and lookup service.
- `postgres`: persistent database for auth, guest usage, and GeoIP data.

## Current Deployment Caveats

- If another reverse proxy terminates HTTPS before this compose stack, keep `ENABLE_HTTPS=false`, forward traffic to frontend port `80`, and still set `COOKIE_SECURE=true` because browsers access the site over HTTPS.
- If `ENABLE_HTTPS=true` but certificate files are missing, the frontend container exits instead of silently serving broken TLS.
- The current public product URL is `https://pdn2.neurolife.tech/`. It is excluded from automated Lychee checks because maintenance windows can make it temporarily unavailable, so smoke-check it manually before submission.
- Query history is persisted for authenticated users and returned through `GET /api/reports`.
- Go module sums are tracked in `go.sum`, so local Go checks and Docker builds use the same dependency integrity data.
