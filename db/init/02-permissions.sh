#!/bin/bash
set -euo pipefail
# Generated passwords must be alphanumeric: avoid interpolating arbitrary SQL.
[[ "$MYSQL_EXPORTER_PASSWORD" =~ ^[A-Za-z0-9]+$ ]] || { echo 'Exporter password must be alphanumeric'; exit 1; }
MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot <<SQL
CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY '${MYSQL_EXPORTER_PASSWORD}';
ALTER USER 'exporter'@'%' IDENTIFIED BY '${MYSQL_EXPORTER_PASSWORD}';
GRANT PROCESS, REPLICATION CLIENT ON *.* TO 'exporter'@'%';
GRANT SELECT ON performance_schema.* TO 'exporter'@'%';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM '${MYSQL_USER}'@'%';
GRANT SELECT, INSERT, UPDATE ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
SQL
