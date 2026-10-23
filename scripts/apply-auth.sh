#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/prepare-web-users.py
docker compose up -d --wait db
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot "$MYSQL_DATABASE"' < db/init/03-auth.sql
docker compose up -d --build --wait app
docker compose exec -T app node seed-users.js < tmp/web-users.json
python3 -c 'from pathlib import Path; Path("tmp/web-users.json").unlink(missing_ok=True)'
# Refresh Nginx upstream after app container replacement.
docker compose exec -T nginx nginx -s reload
