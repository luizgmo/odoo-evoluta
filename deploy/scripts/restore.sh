#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=${1:?uso: restore.sh staging|prod DB_DUMP FILESTORE_TAR}
DB_DUMP=${2:?informe o dump PostgreSQL}
FILESTORE_TAR=${3:?informe o tar do filestore}
ENV_FILE="$ROOT_DIR/.env.$ENVIRONMENT"
COMPOSE_FILE="$ROOT_DIR/docker-compose.$ENVIRONMENT.yml"
load_env "$ENV_FILE"

[ -f "$DB_DUMP" ] || fail "dump não encontrado"
[ -f "$FILESTORE_TAR" ] || fail "filestore não encontrado"
[ "$ENVIRONMENT" != "prod" ] || [ "${CONFIRM_PROD_RESTORE:-}" = "YES" ] || fail "defina CONFIRM_PROD_RESTORE=YES para restaurar produção"

log "parando Odoo antes da restauração"
compose stop web
compose up -d db
sleep 5
compose exec -T db dropdb -U "$POSTGRES_USER" --if-exists "$ODOO_DB"
compose exec -T db createdb -U "$POSTGRES_USER" "$ODOO_DB"
cat "$DB_DUMP" | compose exec -T db pg_restore -U "$POSTGRES_USER" -d "$ODOO_DB" --clean --if-exists --no-owner --no-privileges
compose run --rm web sh -c "rm -rf /var/lib/odoo/filestore/$ODOO_DB"
cat "$FILESTORE_TAR" | compose run --rm web tar -C /var/lib/odoo -xzf -
compose up -d web
wait_for_odoo
log "restauração concluída; execute healthcheck e aceite funcional antes de liberar o ambiente"
