#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export TEST_DB_NAME=$(python3 scripts/test-db-setup.py)
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot' < tmp/integration-setup.sql
cleanup() {
 docker compose -f compose.yaml -f compose.integration.yaml rm -sf app-test
 docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot' < tmp/integration-cleanup.sql
}
trap cleanup EXIT
docker compose -f compose.yaml -f compose.integration.yaml up -d app-test
docker compose -f compose.yaml -f compose.integration.yaml exec -T app-test node < scripts/test-cinema.js
