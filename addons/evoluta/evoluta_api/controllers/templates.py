import ast
import json

from odoo import http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request

from .audit_helpers import registrar_auditoria
from .scope import ROLE_ADMIN, ROLE_PLATFORM, ROLE_SECRETARY, is_platform_admin, user_role


class EvolutaTemplatesApi(http.Controller):
    def _json(self, payload, status=200):
        return Response(json.dumps(payload, ensure_ascii=False), status=status, content_type="application/json; charset=utf-8")

    def _error(self, error):
        if isinstance(error, AccessError):
            return self._json({"error": "Você não tem permissão para executar este ato.", "code": "PERMISSION_DENIED"}, status=403)
        return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @staticmethod
    def _template_vals(record):
        return {"id": record.id, "name": record.name, "descricao": record.descricao or "", "task_count": len(record.task_ids)}

    @http.route("/api/templates", auth="user", type="http", methods=["GET"])
    def list_templates(self):
        if user_role(request.env.user) not in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY}:
            return self._json({"error": "Seu perfil não pode consultar templates.", "code": "PERMISSION_DENIED"}, status=403)
        try:
            records = request.env["evoluta.template"].sudo().search([("active", "=", True)], order="id")
            return self._json({"records": [self._template_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar templates."}, status=403)

    def _target_scope(self, data):
        user = request.env.user
        if user_role(user) not in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY}:
            raise AccessError("Seu perfil não pode gerar projetos a partir de templates.")
        municipio_id = int(data.get("municipio_id") or 0) if str(data.get("municipio_id") or "0").isdigit() else 0
        secretaria_id = int(data.get("secretaria_id") or 0) if str(data.get("secretaria_id") or "0").isdigit() else 0
        departamento_id = int(data.get("departamento_id") or 0) if str(data.get("departamento_id") or "0").isdigit() else 0
        if not is_platform_admin(user):
            if not user.municipio_id:
                raise ValidationError("Usuário sem município configurado.")
            if municipio_id and municipio_id != user.municipio_id.id:
                raise AccessError("O projeto precisa pertencer ao município do usuário.")
            municipio_id = user.municipio_id.id
            if user_role(user) == ROLE_SECRETARY:
                if secretaria_id and secretaria_id != user.secretaria_id.id:
                    raise AccessError("O secretário só pode gerar projetos na própria secretaria.")
                secretaria_id = user.secretaria_id.id
        if not municipio_id:
            raise ValidationError("Selecione o município que receberá o projeto.")
        municipio = request.env["evoluta.municipio"].sudo().browse(municipio_id).exists()
        secretaria = request.env["evoluta.secretaria"].sudo().browse(secretaria_id).exists() if secretaria_id else request.env["evoluta.secretaria"]
        departamento = request.env["evoluta.departamento"].sudo().browse(departamento_id).exists() if departamento_id else request.env["evoluta.departamento"]
        if not municipio:
            raise ValidationError("Município não encontrado.")
        if secretaria and secretaria.municipio_id != municipio:
            raise ValidationError("A secretaria não pertence ao município selecionado.")
        if departamento and (not secretaria or departamento.secretaria_id != secretaria):
            raise ValidationError("O departamento não pertence à secretaria selecionada.")
        return municipio.id, secretaria.id if secretaria else False, departamento.id if departamento else False

    @http.route("/api/templates/<int:template_id>/gerar", auth="user", type="http", methods=["POST"])
    def generate_template(self, template_id):
        template = request.env["evoluta.template"].sudo().browse(template_id).exists()
        if not template:
            return self._json({"error": "Template não encontrado."}, status=404)
        try:
            data = request.get_json_data() or {}
            municipio_id, secretaria_id, departamento_id = self._target_scope(data)
            action = template.with_context(evoluta_municipio_id=municipio_id, evoluta_secretaria_id=secretaria_id, evoluta_departamento_id=departamento_id).action_gerar_projeto()
            job_id = action.get("job_id")
            if not job_id:
                return self._json({"error": "O Odoo não retornou o identificador da geração."}, status=500)
            registrar_auditoria("workflow", "evoluta.template", template, details=f"Geração de projeto iniciada: {job_id}")
            return self._json({"job": {"id": job_id, "state": "pending"}}, status=202)
        except (AccessError, UserError, ValidationError, ValueError) as error:
            return self._error(error)

    @staticmethod
    def _project_id_from_result(result):
        if not result:
            return False
        try:
            data = ast.literal_eval(result)
        except (SyntaxError, ValueError):
            return False
        return data.get("project_id", False) if isinstance(data, dict) else False

    @staticmethod
    def _job_state(record):
        if record.state in {"wait_dependencies", "enqueued"}:
            return "pending"
        if record.state == "cancelled":
            return "failed"
        return record.state

    def _job_vals(self, record):
        state = self._job_state(record)
        values = {"id": record.uuid, "state": state}
        if state == "done":
            project_id = self._project_id_from_result(record.result)
            project = request.env["project.project"].browse(project_id).exists() if project_id else request.env["project.project"]
            if project and (is_platform_admin(request.env.user) or project.municipio_id == request.env.user.municipio_id):
                values["project_id"] = project.id
            else:
                values["state"] = "failed"
                values["error"] = "O projeto gerado não está disponível no escopo da sua conta."
        if state == "failed" and "error" not in values:
            values["error"] = "A geração do projeto falhou. Tente novamente."
        return values

    @http.route("/api/jobs/<string:job_id>", auth="user", type="http", methods=["GET"])
    def get_job(self, job_id):
        try:
            record = request.env["queue.job"].sudo().search([("uuid", "=", job_id)], limit=1)
            if not record:
                return self._json({"error": "Job não encontrado."}, status=404)
            return self._json({"job": self._job_vals(record)})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar este job."}, status=403)
