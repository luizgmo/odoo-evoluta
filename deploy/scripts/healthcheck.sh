#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=${1:?uso: healthcheck.sh staging|prod}
ENV_FILE="$ROOT_DIR/.env.$ENVIRONMENT"
COMPOSE_FILE="$ROOT_DIR/docker-compose.$ENVIRONMENT.yml"
load_env "$ENV_FILE"

compose ps
curl --fail --silent --show-error "http://127.0.0.1:$ODOO_HTTP_PORT/web/login" >/dev/null
CSRF_STATUS=$(curl --silent --output /dev/null --write-out '%{http_code}' "http://127.0.0.1:$ODOO_HTTP_PORT/api/csrf")
[ "$CSRF_STATUS" = "303" ] || fail "endpoint CSRF sem sessão retornou HTTP $CSRF_STATUS; esperado 303"

if [ "${PUBLIC_URL:-}" != "" ]; then
  curl --fail --silent --show-error "$PUBLIC_URL/healthz" >/dev/null
fi

log "healthcheck $ENVIRONMENT aprovado"
