#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=staging
ENV_FILE="$ROOT_DIR/.env.staging"
COMPOSE_FILE="$ROOT_DIR/docker-compose.staging.yml"
load_env "$ENV_FILE"

[ "$(git -C "$ROOT_DIR" status --porcelain)" = "" ] || fail "working tree contém alterações locais"
render_odoo_config "$ENVIRONMENT"
build_odoo_image
build_frontend
compose up -d db web
wait_for_odoo
update_modules

if [ "${STAGING_DOMAIN:-}" != "" ]; then
  render_nginx_config "$ENVIRONMENT" "$STAGING_DOMAIN"
fi

log "staging atualizado com sucesso; commit $(git -C "$ROOT_DIR" rev-parse --short HEAD)"
