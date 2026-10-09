#!/usr/bin/env sh
set -eu

[ "${CONFIRM_PROD_DEPLOY:-}" = "YES" ] || {
  printf '%s\n' "ERRO: defina CONFIRM_PROD_DEPLOY=YES para publicar produção" >&2
  exit 1
}

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=prod
ENV_FILE="$ROOT_DIR/.env.prod"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"
load_env "$ENV_FILE"

[ "$(git -C "$ROOT_DIR" status --porcelain)" = "" ] || fail "working tree contém alterações locais"

log "criando backup antes do deploy"
"$SCRIPT_DIR/backup.sh" prod
render_odoo_config "$ENVIRONMENT"
build_frontend
compose up -d db web
wait_for_odoo
update_modules

if [ "${PROD_DOMAIN:-}" != "" ]; then
  render_nginx_config "$ENVIRONMENT" "$PROD_DOMAIN"
fi

log "produção atualizada com sucesso; commit $(git -C "$ROOT_DIR" rev-parse --short HEAD)"
