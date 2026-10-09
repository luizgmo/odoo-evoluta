#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=${1:?uso: rollback.sh staging|prod REF}
REF=${2:?informe o commit ou tag de rollback}
ENV_FILE="$ROOT_DIR/.env.$ENVIRONMENT"
COMPOSE_FILE="$ROOT_DIR/docker-compose.$ENVIRONMENT.yml"
load_env "$ENV_FILE"

[ "$ENVIRONMENT" != "prod" ] || [ "${CONFIRM_PROD_ROLLBACK:-}" = "YES" ] || fail "defina CONFIRM_PROD_ROLLBACK=YES para rollback de produção"
[ "$(git -C "$ROOT_DIR" status --porcelain)" = "" ] || fail "working tree contém alterações locais"

git -C "$ROOT_DIR" fetch --tags origin
git -C "$ROOT_DIR" checkout --detach "$REF"
render_odoo_config "$ENVIRONMENT"
build_frontend
compose up -d db web
wait_for_odoo
update_modules
log "rollback de código concluído para $REF; migrações de banco não foram desfeitas automaticamente"
