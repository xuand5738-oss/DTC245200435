#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p tmp
docker compose up -d --wait db
if [ ! -f tmp/before-cinema-extension.sql ]; then
  docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -uroot --single-transaction --no-tablespaces "$MYSQL_DATABASE"' > tmp/before-cinema-extension.sql
fi
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot "$MYSQL_DATABASE"' < db/init/04-cinema.sql
docker compose up -d --build --wait app
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload
