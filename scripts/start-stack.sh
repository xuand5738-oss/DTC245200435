#!/usr/bin/env bash
# Start existing services only; do not seed, migrate or remove data.
set -euo pipefail
cd "$(dirname "$0")/.."
if ! docker info >/dev/null 2>&1; then
 echo 'Docker Engine is not ready in Ubuntu. Check: sudo systemctl status docker'
 exit 1
fi
docker compose up -d --wait --wait-timeout 120
# Nginx may retain an old app IP after a previous container recreation.
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload
echo 'Checking website and database connection...'
curl --fail --silent --show-error --retry 8 --retry-delay 2 --retry-connrefused http://127.0.0.1:8280/health
printf '\nWebsite: http://127.0.0.1:8280/\nphpMyAdmin: http://127.0.0.1:8281/\nGrafana: http://127.0.0.1:8300/\nKeep this Ubuntu session open while using the system.\n'
