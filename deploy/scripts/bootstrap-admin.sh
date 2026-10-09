#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck disable=SC1091
. "$SCRIPT_DIR/lib.sh"

ENVIRONMENT=${1:?uso: bootstrap-admin.sh staging|prod}
ENV_FILE="$ROOT_DIR/.env.$ENVIRONMENT"
COMPOSE_FILE="$ROOT_DIR/docker-compose.$ENVIRONMENT.yml"
load_env "$ENV_FILE"
: "${BOOTSTRAP_ADMIN_LOGIN:?BOOTSTRAP_ADMIN_LOGIN não definido}"
: "${BOOTSTRAP_ADMIN_PASSWORD:?BOOTSTRAP_ADMIN_PASSWORD não definido}"
: "${BOOTSTRAP_ADMIN_NAME:?BOOTSTRAP_ADMIN_NAME não definido}"

build_odoo_image
compose up -d db web
wait_for_odoo
compose exec -T web odoo shell -c /etc/odoo/odoo.conf -d "$ODOO_DB" --no-http <<'PY'
import os

User = env["res.users"].sudo()
base_user = env.ref("base.group_user").id
base_system = env.ref("base.group_system").id
login = os.environ["BOOTSTRAP_ADMIN_LOGIN"]
values = {
    "name": os.environ["BOOTSTRAP_ADMIN_NAME"],
    "login": login,
    "email": login,
    "password": os.environ["BOOTSTRAP_ADMIN_PASSWORD"],
    "active": True,
    "share": False,
    "company_id": env.company.id,
    "company_ids": [(6, 0, [env.company.id])],
    "group_ids": [(6, 0, [base_user, base_system])],
    "municipio_id": False,
    "secretaria_id": False,
    "departamento_id": False,
}
user = User.search([("login", "=", login)], limit=1)
if user:
    user.write(values)
else:
    user = User.create(values)
env.cr.commit()
print("BOOTSTRAP_ADMIN_OK", user.login, user.id)
PY
log "superadmin criado/atualizado no ambiente $ENVIRONMENT"
