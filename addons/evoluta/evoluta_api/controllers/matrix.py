import json

from odoo import http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request


class EvolutaMatrixApi(http.Controller):
    def _json(self, payload, status=200):
        return Response(json.dumps(payload, ensure_ascii=False), status=status, content_type="application/json; charset=utf-8")

    def _project(self, value):
        try:
            project_id = int(value or 0)
        except (TypeError, ValueError):
            project_id = 0
        return request.env["project.project"].browse(project_id).exists()[:1]

    @staticmethod
    def _text(value):
        return value.strip() if isinstance(value, str) else ""

    def _values(self, record):
        return {
            "id": record.id,
            "project_id": record.project_id.id,
            "name": record.name,
            "criterios": [{"id": item.id, "name": item.name, "peso": item.peso} for item in record.criterio_ids],
            "alternativas": [{
                "id": item.id,
                "name": item.name,
                "total": item.total,
                "notas": [{"criterio_id": nota.criterio_id.id, "nota": nota.nota} for nota in item.nota_ids],
            } for item in record.alternativa_ids],
            "vencedor_id": record.vencedor_id.id if record.vencedor_id else False,
            "vencedor_name": record.vencedor_id.name if record.vencedor_id else "",
        }

    @http.route("/api/matriz", auth="user", type="http", methods=["GET"])
    def list_matrix(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            records = request.env["evoluta.matriz"].search([("project_id", "=", project.id)], order="id desc")
            return self._json({"records": [self._values(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar matrizes."}, status=403)

    @http.route("/api/matriz", auth="user", type="http", methods=["POST"], csrf=False)
    def create_matrix(self):
        data = request.get_json_data() or {}
        project = self._project(data.get("project_id"))
        criterios = data.get("criterios") if isinstance(data.get("criterios"), list) else []
        alternativas = data.get("alternativas") if isinstance(data.get("alternativas"), list) else []
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        if not criterios or not alternativas:
            return self._json({"error": "Informe pelo menos um critério e uma alternativa."}, status=400)
        try:
            matrix = request.env["evoluta.matriz"].create({"name": self._text(data.get("name")) or "Nova matriz de decisão", "project_id": project.id})
            criteria_by_index = {}
            for index, item in enumerate(criterios):
                name = self._text(item.get("name")) if isinstance(item, dict) else ""
                if not name:
                    raise ValidationError("Todo critério precisa de um nome.")
                criteria_by_index[index] = request.env["evoluta.matriz.criterio"].create({"matriz_id": matrix.id, "name": name, "peso": float(item.get("peso") or 1)})
            for alternative in alternativas:
                if not isinstance(alternative, dict) or not self._text(alternative.get("name")):
                    raise ValidationError("Toda alternativa precisa de um nome.")
                alt = request.env["evoluta.matriz.alternativa"].create({"matriz_id": matrix.id, "name": self._text(alternative["name"])})
                notas = alternative.get("notas") or []
                if not isinstance(notas, list):
                    notas = []
                for index, nota in enumerate(notas):
                    criterio = criteria_by_index.get(index)
                    if criterio:
                        request.env["evoluta.matriz.nota"].create({"alternativa_id": alt.id, "criterio_id": criterio.id, "nota": float(nota or 0)})
            matrix.invalidate_recordset()
            return self._json({"record": self._values(matrix)}, status=201)
        except (AccessError, UserError, ValidationError, ValueError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/matriz/<int:record_id>/gerar-5w2h", auth="user", type="http", methods=["POST"], csrf=False)
    def generate_matrix_plan(self, record_id):
        matrix = request.env["evoluta.matriz"].browse(record_id).exists()
        if not matrix:
            return self._json({"error": "Matriz não encontrada."}, status=404)
        try:
            action = matrix.action_gerar_5w2h()
            plan = request.env["evoluta.5w2h"].browse(action.get("res_id")).exists()
            return self._json({"record": {"id": plan.id, "name": plan.name, "project_id": plan.project_id.id}}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)
