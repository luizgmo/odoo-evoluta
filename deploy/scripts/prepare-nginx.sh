#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=${1:?uso: prepare-nginx.sh staging|prod DOMAIN}
DOMAIN=${2:?informe o domínio}
ENV_FILE="$ROOT_DIR/.env.$ENVIRONMENT"
load_env "$ENV_FILE"
render_nginx_config "$ENVIRONMENT" "$DOMAIN"

TARGET="/etc/nginx/sites-available/evoluta-$ENVIRONMENT.conf"
sudo install -o root -g root -m 0644 "$ROOT_DIR/deploy/nginx/evoluta-$ENVIRONMENT.conf" "$TARGET"
sudo ln -sfn "$TARGET" "/etc/nginx/sites-enabled/evoluta-$ENVIRONMENT.conf"
sudo nginx -t
sudo systemctl reload nginx
log "Nginx preparado para $DOMAIN; emita o certificado com Certbot e valide HTTPS"
