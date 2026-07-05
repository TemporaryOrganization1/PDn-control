#!/usr/bin/env sh
set -eu

project_dir=${COMPOSE_PROJECT_DIR:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}
cd "$project_dir"

docker compose exec main-backend sh -lc '
set -eu

echo "== ip route =="
ip route

echo
echo "== /etc/resolv.conf =="
cat /etc/resolv.conf

echo
echo "== getent hosts smtp.yandex.ru =="
getent hosts smtp.yandex.ru || nslookup smtp.yandex.ru

echo
echo "== nc -4 -vz -w 10 smtp.yandex.ru 587 =="
nc -4 -vz -w 10 smtp.yandex.ru 587

echo
echo "== nc -4 -vz -w 10 1.1.1.1 443 =="
nc -4 -vz -w 10 1.1.1.1 443
'
