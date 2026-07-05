#!/usr/bin/env sh
set -eu

project_dir=${COMPOSE_PROJECT_DIR:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}
cd "$project_dir"

container_name=${SMTP_IPV6_PROXY_CONTAINER:-smtp-ipv6-proxy}
listen_port=${SMTP_IPV6_PROXY_PORT:-1587}
target_host=${SMTP_IPV6_PROXY_TARGET_HOST:-smtp.yandex.ru}
target_port=${SMTP_IPV6_PROXY_TARGET_PORT:-587}
image=${SMTP_IPV6_PROXY_IMAGE:-pdn-control-main-backend:latest}

gateway=${SMTP_IPV6_PROXY_BIND:-}
if [ -z "$gateway" ]; then
  gateway=$(docker compose exec -T main-backend sh -lc "ip -4 route show default | awk '{print \$3; exit}'")
fi

if [ -z "$gateway" ]; then
  echo "Cannot detect Docker gateway. Set SMTP_IPV6_PROXY_BIND manually." >&2
  exit 1
fi

echo "Starting $container_name: $gateway:$listen_port -> [$target_host]:$target_port over IPv6"

docker rm -f "$container_name" >/dev/null 2>&1 || true
docker run -d \
  --name "$container_name" \
  --restart unless-stopped \
  --network host \
  --entrypoint sh \
  "$image" \
  -lc "exec socat -d -d TCP4-LISTEN:${listen_port},bind=${gateway},reuseaddr,fork TCP6:${target_host}:${target_port}"

echo
echo "Set these values for main-backend SMTP:"
echo "SMTP_HOST=$gateway"
echo "SMTP_PORT=$listen_port"
echo "SMTP_SERVER_NAME=$target_host"
echo "SMTP_NETWORK=tcp4"
