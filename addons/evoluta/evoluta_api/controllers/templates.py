import ast
import json

from odoo import http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request


class EvolutaTemplatesApi(http.Controller):
    def _json(self, payload, status=200):
        return Response(
            json.dumps(payload, ensure_ascii=False),
            status=status,
            content_type="application/json; charset=utf-8",
        )

    def _error(self, error):
        if isinstance(error, AccessError):
            return self._json({"error": "Você não tem permissão para executar este ato."}, status=403)
        return self._json({"error": str(error)}, status=400)

    @staticmethod
    def _template_vals(record):
        return {
            "id": record.id,
            "name": record.name,
            "descricao": record.descricao or "",
            "task_count": len(record.task_ids),
        }

    @http.route("/api/templates", auth="user", type="http", methods=["GET"])
    def list_templates(self):
        try:
            records = request.env["evoluta.template"].search(
                [("active", "=", True)], order="id"
            )
            return self._json({"records": [self._template_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar templates."}, status=403)

    @http.route("/api/templates/<int:template_id>/gerar", auth="user", type="http", methods=["POST"], csrf=False)
    def generate_template(self, template_id):
        template = request.env["evoluta.template"].browse(template_id).exists()
        if not template:
            return self._json({"error": "Template não encontrado."}, status=404)
        try:
            action = template.action_gerar_projeto()
            job_id = action.get("job_id")
            if not job_id:
                return self._json({"error": "O Odoo não retornou o identificador da geração."}, status=500)
            return self._json({"job": {"id": job_id, "state": "pending"}}, status=202)
        except (AccessError, UserError, ValidationError) as error:
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
            if project_id:
                values["project_id"] = project_id
        if state == "failed":
            values["error"] = "A geração do projeto falhou. Tente novamente."
        return values

    @http.route("/api/jobs/<string:job_id>", auth="user", type="http", methods=["GET"])
    def get_job(self, job_id):
        try:
            record = request.env["queue.job"].search([("uuid", "=", job_id)], limit=1)
            if not record:
                return self._json({"error": "Job não encontrado."}, status=404)
            return self._json({"job": self._job_vals(record)})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar este job."}, status=403)
