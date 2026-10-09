#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=${1:?uso: render-config.sh staging|prod}
ENV_FILE="$ROOT_DIR/.env.$ENVIRONMENT"
load_env "$ENV_FILE"
render_odoo_config "$ENVIRONMENT"

if [ "${2:-}" != "" ]; then
  render_nginx_config "$ENVIRONMENT" "$2"
fi
