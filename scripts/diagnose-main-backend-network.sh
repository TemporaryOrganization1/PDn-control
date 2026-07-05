#!/usr/bin/env sh
set -eu

project_dir=${COMPOSE_PROJECT_DIR:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}
cd "$project_dir"

docker compose exec main-backend sh -lc '
set -u
failures=0

run_check() {
  name=$1
  shift
  echo
  echo "== $name =="
  if "$@"; then
    echo "[ok] $name"
  else
    code=$?
    failures=$((failures + 1))
    echo "[failed:$code] $name"
  fi
}

run_check "ip route" ip route
run_check "ip -4 route get 1.1.1.1" ip -4 route get 1.1.1.1
run_check "ip -4 route get smtp.yandex.ru" ip -4 route get smtp.yandex.ru
run_check "/etc/resolv.conf" cat /etc/resolv.conf
run_check "getent hosts smtp.yandex.ru" getent hosts smtp.yandex.ru
run_check "nslookup smtp.yandex.ru" nslookup smtp.yandex.ru
run_check "nc -4 -vz -w 10 1.1.1.1 443" nc -4 -vz -w 10 1.1.1.1 443
run_check "nc -4 -vz -w 10 smtp.yandex.ru 587" nc -4 -vz -w 10 smtp.yandex.ru 587
run_check "nc -4 -vz -w 10 smtp.yandex.ru 465" nc -4 -vz -w 10 smtp.yandex.ru 465

echo
if [ "$failures" -eq 0 ]; then
  echo "All network checks passed."
else
  echo "$failures network check(s) failed."
  exit 1
fi
'
