#!/bin/sh
set -eu

SERVER_NAME="${SERVER_NAME:-_}"
BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-http://main-backend:4000}"
CLIENT_MAX_BODY_SIZE="${CLIENT_MAX_BODY_SIZE:-25m}"
ENABLE_HTTPS="${ENABLE_HTTPS:-false}"

if [ -z "${SSL_CERTIFICATE:-}" ] && [ "$SERVER_NAME" != "_" ]; then
  SSL_CERTIFICATE="/etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem"
fi

if [ -z "${SSL_CERTIFICATE_KEY:-}" ] && [ "$SERVER_NAME" != "_" ]; then
  SSL_CERTIFICATE_KEY="/etc/letsencrypt/live/${SERVER_NAME}/privkey.pem"
fi

write_common_locations() {
  cat <<EOF
    root /usr/share/nginx/html;
    index index.html;
    client_max_body_size ${CLIENT_MAX_BODY_SIZE};

    location = /healthz {
        default_type text/plain;
        return 200 "ok\n";
    }

    location /_next/static/ {
        try_files \$uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass ${BACKEND_UPSTREAM};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_next_upstream error timeout invalid_header http_502 http_503;
        proxy_next_upstream_tries 3;
        proxy_connect_timeout 5s;
    }

    location / {
        try_files \$uri \$uri.html \$uri/ /index.html;
    }
EOF
}

if [ "$ENABLE_HTTPS" = "true" ] || [ "$ENABLE_HTTPS" = "1" ]; then
  if [ -z "${SSL_CERTIFICATE:-}" ] || [ -z "${SSL_CERTIFICATE_KEY:-}" ] || [ ! -f "$SSL_CERTIFICATE" ] || [ ! -f "$SSL_CERTIFICATE_KEY" ]; then
    echo "ENABLE_HTTPS=true but SSL certificate files were not found." >&2
    echo "SSL_CERTIFICATE=${SSL_CERTIFICATE:-<empty>}" >&2
    echo "SSL_CERTIFICATE_KEY=${SSL_CERTIFICATE_KEY:-<empty>}" >&2
    exit 1
  fi

  {
    cat <<EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name ${SERVER_NAME};

    ssl_certificate ${SSL_CERTIFICATE};
    ssl_certificate_key ${SSL_CERTIFICATE_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

EOF
    write_common_locations
    cat <<EOF
}
EOF
  } > /etc/nginx/conf.d/default.conf
else
  {
    cat <<EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

EOF
    write_common_locations
    cat <<EOF
}
EOF
  } > /etc/nginx/conf.d/default.conf
fi
