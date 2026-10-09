from odoo import http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request

from .audit_helpers import registrar_auditoria
from .scope import ROLE_ADMIN, ROLE_ATTENDANT, ROLE_PLATFORM, ROLE_SECRETARY, is_platform_admin, user_role


class EvolutaOrganizationApi(http.Controller):
    def _json(self, payload, status=200):
        import json

        return Response(
            json.dumps(payload, ensure_ascii=False),
            status=status,
            content_type="application/json; charset=utf-8",
        )

    @staticmethod
    def _text(value):
        return value.strip() if isinstance(value, str) else ""

    @staticmethod
    def _int(value):
        try:
            return int(value or 0)
        except (TypeError, ValueError):
            return 0

    def _forbidden(self, message="Você não tem permissão para executar este ato."):
        return self._json({"error": message, "code": "PERMISSION_DENIED"}, status=403)

    def _not_found(self, message="Registro não encontrado."):
        return self._json({"error": message, "code": "NOT_FOUND"}, status=404)

    def _admin_required(self):
        return user_role(request.env.user) in {ROLE_PLATFORM, ROLE_ADMIN}

    def _municipio(self, municipio_id):
        municipio = request.env["evoluta.municipio"].browse(self._int(municipio_id)).exists()
        if not municipio:
            return municipio
        user = request.env.user
        if not is_platform_admin(user) and municipio != user.municipio_id:
            return municipio.browse()
        return municipio

    @staticmethod
    def _municipio_vals(record):
        return {"id": record.id, "name": record.name, "codigo_ibge": record.codigo_ibge or "", "active": record.active}

    @staticmethod
    def _secretaria_vals(record):
        return {
            "id": record.id,
            "name": record.name,
            "municipio_id": record.municipio_id.id,
            "municipio_name": record.municipio_id.name,
            "active": record.active,
        }

    @staticmethod
    def _departamento_vals(record):
        return {
            "id": record.id,
            "name": record.name,
            "secretaria_id": record.secretaria_id.id,
            "secretaria_name": record.secretaria_id.name,
            "municipio_id": record.secretaria_id.municipio_id.id,
            "municipio_name": record.secretaria_id.municipio_id.name,
            "active": record.active,
        }

    @http.route("/api/municipios", auth="user", type="http", methods=["GET"])
    def list_municipios(self):
        user = request.env.user
        domain = [("active", "=", True)] if is_platform_admin(user) else [("id", "=", user.municipio_id.id if user.municipio_id else 0), ("active", "=", True)]
        records = request.env["evoluta.municipio"].search(domain, order="name")
        return self._json({"records": [self._municipio_vals(record) for record in records]})

    @http.route("/api/municipios", auth="user", type="http", methods=["POST"])
    def create_municipio(self):
        if not self._admin_required():
            return self._forbidden()
        data = request.get_json_data() or {}
        name = self._text(data.get("name"))
        if not name:
            return self._json({"error": "Informe o nome do município.", "code": "VALIDATION_ERROR"}, status=400)
        if not is_platform_admin(request.env.user):
            return self._forbidden("A criação de municípios é exclusiva da administração da Evoluta.")
        try:
            record = request.env["evoluta.municipio"].create(
                {"name": name, "codigo_ibge": self._text(data.get("codigo_ibge"))}
            )
            registrar_auditoria("create", "evoluta.municipio", record)
            return self._json({"record": self._municipio_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/municipios/<int:municipio_id>", auth="user", type="http", methods=["PATCH"])
    def update_municipio(self, municipio_id):
        if not self._admin_required():
            return self._forbidden()
        record = self._municipio(municipio_id)
        if not record:
            return self._not_found("Município não encontrado.")
        data = request.get_json_data() or {}
        values = {}
        if "name" in data:
            name = self._text(data.get("name"))
            if not name:
                return self._json({"error": "Informe o nome do município.", "code": "VALIDATION_ERROR"}, status=400)
            values["name"] = name
        if "codigo_ibge" in data:
            values["codigo_ibge"] = self._text(data.get("codigo_ibge"))
        if "active" in data:
            values["active"] = bool(data.get("active"))
        try:
            record.write(values)
            registrar_auditoria("archive" if values.get("active") is False else "update", "evoluta.municipio", record)
            return self._json({"record": self._municipio_vals(record)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/secretarias", auth="user", type="http", methods=["GET"])
    def list_secretarias(self, municipio_id=None):
        municipio = self._municipio(municipio_id or request.httprequest.args.get("municipio_id"))
        if not municipio:
            return self._not_found("Município não encontrado.")
        records = request.env["evoluta.secretaria"].search(
            [("municipio_id", "=", municipio.id), ("active", "=", True)], order="name"
        )
        return self._json({"records": [self._secretaria_vals(record) for record in records]})

    @http.route("/api/secretarias", auth="user", type="http", methods=["POST"])
    def create_secretaria(self):
        if not self._admin_required():
            return self._forbidden()
        data = request.get_json_data() or {}
        municipio = self._municipio(data.get("municipio_id"))
        name = self._text(data.get("name"))
        if not municipio:
            return self._not_found("Município não encontrado.")
        if not name:
            return self._json({"error": "Informe o nome da secretaria.", "code": "VALIDATION_ERROR"}, status=400)
        try:
            record = request.env["evoluta.secretaria"].create({"name": name, "municipio_id": municipio.id})
            registrar_auditoria("create", "evoluta.secretaria", record)
            return self._json({"record": self._secretaria_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/departamentos", auth="user", type="http", methods=["GET"])
    def list_departamentos(self, secretaria_id=None):
        secretaria = request.env["evoluta.secretaria"].browse(
            self._int(secretaria_id or request.httprequest.args.get("secretaria_id"))
        ).exists()
        if not secretaria or not self._municipio(secretaria.municipio_id.id):
            return self._not_found("Secretaria não encontrada.")
        records = request.env["evoluta.departamento"].search(
            [("secretaria_id", "=", secretaria.id), ("active", "=", True)], order="name"
        )
        return self._json({"records": [self._departamento_vals(record) for record in records]})

    @http.route("/api/secretarias/<int:secretaria_id>", auth="user", type="http", methods=["PATCH"])
    def update_secretaria(self, secretaria_id):
        if not self._admin_required():
            return self._forbidden()
        record = request.env["evoluta.secretaria"].browse(secretaria_id).exists()
        if not record or not self._municipio(record.municipio_id.id):
            return self._not_found("Secretaria não encontrada.")
        data = request.get_json_data() or {}
        values = {}
        if "name" in data:
            name = self._text(data.get("name"))
            if not name:
                return self._json({"error": "Informe o nome da secretaria.", "code": "VALIDATION_ERROR"}, status=400)
            values["name"] = name
        if "active" in data:
            values["active"] = bool(data.get("active"))
        try:
            record.write(values)
            registrar_auditoria("archive" if values.get("active") is False else "update", "evoluta.secretaria", record)
            return self._json({"record": self._secretaria_vals(record)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/departamentos", auth="user", type="http", methods=["POST"])
    def create_departamento(self):
        if not self._admin_required():
            return self._forbidden()
        data = request.get_json_data() or {}
        secretaria = request.env["evoluta.secretaria"].browse(self._int(data.get("secretaria_id"))).exists()
        name = self._text(data.get("name"))
        if not secretaria or not self._municipio(secretaria.municipio_id.id):
            return self._not_found("Secretaria não encontrada.")
        if not name:
            return self._json({"error": "Informe o nome do departamento.", "code": "VALIDATION_ERROR"}, status=400)
        try:
            record = request.env["evoluta.departamento"].create({"name": name, "secretaria_id": secretaria.id})
            registrar_auditoria("create", "evoluta.departamento", record)
            return self._json({"record": self._departamento_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/departamentos/<int:departamento_id>", auth="user", type="http", methods=["PATCH"])
    def update_departamento(self, departamento_id):
        if not self._admin_required():
            return self._forbidden()
        record = request.env["evoluta.departamento"].browse(departamento_id).exists()
        if not record or not self._municipio(record.secretaria_id.municipio_id.id):
            return self._not_found("Departamento não encontrado.")
        data = request.get_json_data() or {}
        values = {}
        if "name" in data:
            name = self._text(data.get("name"))
            if not name:
                return self._json({"error": "Informe o nome do departamento.", "code": "VALIDATION_ERROR"}, status=400)
            values["name"] = name
        if "active" in data:
            values["active"] = bool(data.get("active"))
        try:
            record.write(values)
            registrar_auditoria("archive" if values.get("active") is False else "update", "evoluta.departamento", record)
            return self._json({"record": self._departamento_vals(record)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @staticmethod
    def _user_vals(user):
        return {
            "id": user.id,
            "name": user.name,
            "login": user.login,
            "email": user.email or "",
            "active": user.active,
            "role": user_role(user),
            "municipio": {"id": user.municipio_id.id, "name": user.municipio_id.name} if user.municipio_id else None,
            "secretaria": {"id": user.secretaria_id.id, "name": user.secretaria_id.name} if user.secretaria_id else None,
            "departamento": {"id": user.departamento_id.id, "name": user.departamento_id.name} if user.departamento_id else None,
        }

    @http.route("/api/usuarios", auth="user", type="http", methods=["GET"])
    def list_users(self):
        user = request.env.user
        domain = [("share", "=", False), ("active", "=", True)]
        if not is_platform_admin(user):
            domain.append(("municipio_id", "=", user.municipio_id.id if user.municipio_id else 0))
        records = request.env["res.users"].sudo().search(domain, order="name")
        return self._json({"records": [self._user_vals(record) for record in records]})

    def _user_scope_values(self, data, role):
        user = request.env.user
        municipio_id = self._int(data.get("municipio_id"))
        secretaria_id = self._int(data.get("secretaria_id"))
        departamento_id = self._int(data.get("departamento_id"))
        if not is_platform_admin(user):
            if not user.municipio_id:
                raise ValidationError("O administrador atual não possui município configurado.")
            municipio_id = user.municipio_id.id
        municipio = self._municipio(municipio_id)
        secretaria = request.env["evoluta.secretaria"].browse(secretaria_id).exists() if secretaria_id else request.env["evoluta.secretaria"]
        departamento = request.env["evoluta.departamento"].browse(departamento_id).exists() if departamento_id else request.env["evoluta.departamento"]
        if not municipio:
            raise ValidationError("Município não encontrado.")
        if secretaria and secretaria.municipio_id != municipio:
            raise ValidationError("A secretaria não pertence ao município selecionado.")
        if role in {ROLE_SECRETARY, ROLE_ATTENDANT} and not secretaria:
            raise ValidationError("Secretário e atendente precisam de secretaria.")
        if departamento and (not secretaria or departamento.secretaria_id != secretaria):
            raise ValidationError("O departamento não pertence à secretaria selecionada.")
        if role == ROLE_ATTENDANT and not departamento:
            raise ValidationError("Atendente precisa de departamento.")
        return {
            "municipio_id": municipio.id,
            "secretaria_id": secretaria.id,
            "departamento_id": departamento.id if departamento else False,
        }

    def _role_group_ids(self, role):
        xml_id = {
            ROLE_ADMIN: "evoluta_core.evoluta_group_admin",
            ROLE_SECRETARY: "evoluta_core.evoluta_group_secretario",
            ROLE_ATTENDANT: "evoluta_core.evoluta_group_atendente",
        }.get(role)
        if not xml_id:
            raise ValidationError("Perfil municipal inválido.")
        return [
            request.env.ref("base.group_user").id,
            request.env.ref(xml_id).id,
        ]

    @http.route("/api/usuarios", auth="user", type="http", methods=["POST"])
    def create_user(self):
        if not self._admin_required():
            return self._forbidden()
        data = request.get_json_data() or {}
        name = self._text(data.get("name"))
        login = self._text(data.get("login"))
        password = data.get("password") if isinstance(data.get("password"), str) else ""
        role = self._text(data.get("role")) or ROLE_ATTENDANT
        if not name or not login or not password:
            return self._json({"error": "Nome, login e senha temporária são obrigatórios.", "code": "VALIDATION_ERROR"}, status=400)
        if role == ROLE_ADMIN and not is_platform_admin(request.env.user):
            return self._forbidden("Somente o super administrador da Evoluta pode criar Admin Municipal.")
        if len(password) < 8:
            return self._json({"error": "A senha temporária deve ter pelo menos 8 caracteres.", "code": "VALIDATION_ERROR"}, status=400)
        try:
            values = self._user_scope_values(data, role)
            values.update({
                "name": name,
                "login": login,
                "email": self._text(data.get("email")) or login,
                "password": password,
                "group_ids": [(6, 0, self._role_group_ids(role))],
            })
            record = request.env["res.users"].sudo().create(values)
            registrar_auditoria("create", "res.users", record)
            return self._json({"record": self._user_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/usuarios/<int:user_id>", auth="user", type="http", methods=["PATCH"])
    def update_user(self, user_id):
        if not self._admin_required():
            return self._forbidden()
        target = request.env["res.users"].sudo().browse(user_id).exists()
        if not target:
            return self._not_found("Usuário não encontrado.")
        if not is_platform_admin(request.env.user) and target.municipio_id != request.env.user.municipio_id:
            return self._not_found("Usuário não encontrado.")
        data = request.get_json_data() or {}
        values = {}
        if "name" in data:
            name = self._text(data.get("name"))
            if not name:
                return self._json({"error": "Informe o nome do usuário.", "code": "VALIDATION_ERROR"}, status=400)
            values["name"] = name
        if "email" in data:
            values["email"] = self._text(data.get("email"))
        if "active" in data:
            values["active"] = bool(data.get("active"))
        if "password" in data:
            password = data.get("password") if isinstance(data.get("password"), str) else ""
            if len(password) < 8:
                return self._json({"error": "A senha temporária deve ter pelo menos 8 caracteres.", "code": "VALIDATION_ERROR"}, status=400)
            values["password"] = password
        try:
            role = self._text(data.get("role"))
            if role:
                if role == ROLE_ADMIN and not is_platform_admin(request.env.user):
                    return self._forbidden("Somente o super administrador da Evoluta pode atribuir Admin Municipal.")
                values["group_ids"] = [(6, 0, self._role_group_ids(role))]
                values.update(self._user_scope_values(data, role))
            target.write(values)
            registrar_auditoria("archive" if values.get("active") is False else "update", "res.users", target)
            return self._json({"record": self._user_vals(target)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/onboarding", auth="user", type="http", methods=["GET"])
    def list_onboarding(self):
        records = request.env["evoluta.onboarding"].search([], order="sequence, id")
        return self._json({"records": [{"id": item.id, "name": item.name, "description": item.description or "", "done": item.done} for item in records]})

    @http.route("/api/onboarding/<int:step_id>", auth="user", type="http", methods=["PATCH"])
    def update_onboarding(self, step_id):
        if not self._admin_required():
            return self._forbidden()
        record = request.env["evoluta.onboarding"].browse(step_id).exists()
        if not record:
            return self._not_found("Passo de onboarding não encontrado.")
        data = request.get_json_data() or {}
        if "done" not in data:
            return self._json({"error": "Informe o estado de conclusão.", "code": "VALIDATION_ERROR"}, status=400)
        record.write({"done": bool(data.get("done"))})
        return self._json({"record": {"id": record.id, "name": record.name, "description": record.description or "", "done": record.done}})
