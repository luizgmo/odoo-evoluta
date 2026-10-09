#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=${1:?uso: backup.sh staging|prod}
ENV_FILE="$ROOT_DIR/.env.$ENVIRONMENT"
COMPOSE_FILE="$ROOT_DIR/docker-compose.$ENVIRONMENT.yml"
load_env "$ENV_FILE"

BACKUP_DIR=${BACKUP_DIR:-$ROOT_DIR/deploy/backups/$ENVIRONMENT}
mkdir -p "$BACKUP_DIR"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
DB_FILE="$BACKUP_DIR/${ODOO_DB}_${STAMP}.dump"
FILESTORE_FILE="$BACKUP_DIR/${ODOO_DB}_${STAMP}.filestore.tar.gz"

compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$ODOO_DB" -Fc > "$DB_FILE"
compose exec -T web tar -C /var/lib/odoo -czf - "filestore/$ODOO_DB" > "$FILESTORE_FILE"
[ -s "$DB_FILE" ] || fail "backup PostgreSQL vazio"
[ -s "$FILESTORE_FILE" ] || fail "backup filestore vazio"
sha256sum "$DB_FILE" "$FILESTORE_FILE" > "$DB_FILE.sha256"
log "backup criado: $DB_FILE e $FILESTORE_FILE"
