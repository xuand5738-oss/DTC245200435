#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose config --quiet
docker compose ps
curl --fail --silent http://127.0.0.1:8280/health
printf '\n'
curl --fail --silent http://127.0.0.1:8280/ | grep -q 'Hệ thống đặt vé'
curl --fail --silent --output /dev/null http://127.0.0.1:8281/
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u "$MYSQL_USER" "$MYSQL_DATABASE" -e "SHOW TABLES; SELECT COUNT(*) AS showtimes FROM showtimes; SELECT COUNT(*) AS seats FROM seats; SELECT COUNT(*) AS bookings FROM bookings;"'
printf 'Application, DB and phpMyAdmin checks passed. No business data was inserted.\n'
