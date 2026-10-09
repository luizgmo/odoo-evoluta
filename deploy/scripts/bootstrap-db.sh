#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=${1:?uso: bootstrap-db.sh staging|prod}
ENV_FILE="$ROOT_DIR/.env.$ENVIRONMENT"
COMPOSE_FILE="$ROOT_DIR/docker-compose.$ENVIRONMENT.yml"
load_env "$ENV_FILE"
render_odoo_config "$ENVIRONMENT"

log "iniciando somente o PostgreSQL de $ENVIRONMENT"
compose up -d db
sleep 5

if ! compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname = '$ODOO_DB'" | grep -q 1; then
  compose exec -T db createdb -U "$POSTGRES_USER" "$ODOO_DB"
fi

log "instalando os módulos no banco $ODOO_DB sem dados de demonstração"
compose run --rm web odoo -c /etc/odoo/odoo.conf -d "$ODOO_DB" -i "$MODULES" --without-demo=all --stop-after-init
compose up -d web
wait_for_odoo
log "banco $ODOO_DB inicializado; revise o log antes de criar o superadmin"
