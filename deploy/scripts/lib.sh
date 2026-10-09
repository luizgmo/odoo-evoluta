#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
MODULES="evoluta_core,evoluta_strategy,evoluta_management,evoluta_templates,evoluta_api"

fail() {
  printf '%s\n' "ERRO: $*" >&2
  exit 1
}

log() {
  printf '[evoluta] %s\n' "$*"
}

load_env() {
  ENV_FILE=${1:?informe o arquivo .env}
  [ -f "$ENV_FILE" ] || fail "arquivo de ambiente não encontrado: $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
  : "${POSTGRES_USER:?POSTGRES_USER não definido}"
  : "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD não definido}"
  : "${ODOO_DB:?ODOO_DB não definido}"
  : "${ODOO_ADMIN_PASSWORD:?ODOO_ADMIN_PASSWORD não definido}"
  : "${ODOO_HTTP_PORT:?ODOO_HTTP_PORT não definido}"
  : "${ODOO_LONGPOLLING_PORT:?ODOO_LONGPOLLING_PORT não definido}"
}

compose() {
  docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

render_odoo_config() {
  ENVIRONMENT=${1:?staging ou prod}
  TEMPLATE="$ROOT_DIR/config/odoo.$ENVIRONMENT.conf.template"
  OUTPUT="$ROOT_DIR/config/runtime/odoo.$ENVIRONMENT.conf"
  [ -f "$TEMPLATE" ] || fail "template Odoo não encontrado: $TEMPLATE"
  mkdir -p "$(dirname "$OUTPUT")"
  python3 - "$TEMPLATE" "$OUTPUT" <<'PY'
import os
import pathlib
import sys

template = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
values = {
    "__POSTGRES_USER__": os.environ["POSTGRES_USER"],
    "__POSTGRES_PASSWORD__": os.environ["POSTGRES_PASSWORD"],
    "__ODOO_DB__": os.environ["ODOO_DB"],
    "__ODOO_ADMIN_PASSWORD__": os.environ["ODOO_ADMIN_PASSWORD"],
}
for key, value in values.items():
    template = template.replace(key, value)
pathlib.Path(sys.argv[2]).write_text(template, encoding="utf-8")
PY
  chmod 600 "$OUTPUT"
  log "configuração Odoo renderizada em $OUTPUT"
}

render_nginx_config() {
  ENVIRONMENT=${1:?staging ou prod}
  SERVER_NAME=${2:?informe o domínio}
  TEMPLATE="$ROOT_DIR/deploy/nginx/evoluta-$ENVIRONMENT.conf.template"
  OUTPUT="$ROOT_DIR/deploy/nginx/evoluta-$ENVIRONMENT.conf"
  [ -f "$TEMPLATE" ] || fail "template Nginx não encontrado: $TEMPLATE"
  FRONTEND_ROOT=${FRONTEND_ROOT:-$ROOT_DIR/frontend/dist}
  python3 - "$TEMPLATE" "$OUTPUT" "$SERVER_NAME" "$FRONTEND_ROOT" "$ODOO_HTTP_PORT" "$ODOO_LONGPOLLING_PORT" <<'PY'
import pathlib
import sys

template = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
values = {
    "__SERVER_NAME__": sys.argv[3],
    "__FRONTEND_ROOT__": sys.argv[4],
    "__ODOO_HTTP_PORT__": sys.argv[5],
    "__ODOO_LONGPOLLING_PORT__": sys.argv[6],
}
for key, value in values.items():
    template = template.replace(key, value)
pathlib.Path(sys.argv[2]).write_text(template, encoding="utf-8")
PY
  log "configuração Nginx renderizada em $OUTPUT"
}

build_frontend() {
  : "${ODOO_DB:?ODOO_DB não definido}"
  cd "$ROOT_DIR/frontend"
  npm ci
  VITE_ODOO_DB="$ODOO_DB" npm run build
  log "frontend compilado para o banco $ODOO_DB"
}

wait_for_odoo() {
  tries=0
  until curl --fail --silent --show-error "http://127.0.0.1:$ODOO_HTTP_PORT/web/login" >/dev/null; do
    tries=$((tries + 1))
    [ "$tries" -lt 60 ] || fail "Odoo não respondeu na porta $ODOO_HTTP_PORT"
    sleep 2
  done
  log "Odoo respondeu na porta $ODOO_HTTP_PORT"
}

update_modules() {
  compose exec -T web odoo -c /etc/odoo/odoo.conf -d "$ODOO_DB" -u "$MODULES" --stop-after-init
  compose restart web
  wait_for_odoo
}
