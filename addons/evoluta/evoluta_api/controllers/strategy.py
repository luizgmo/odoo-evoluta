import json

from odoo import http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request


class EvolutaStrategyApi(http.Controller):
    def _json(self, payload, status=200):
        return Response(
            json.dumps(payload, ensure_ascii=False),
            status=status,
            content_type="application/json; charset=utf-8",
        )

    @staticmethod
    def _int(value):
        try:
            return int(value or 0)
        except (TypeError, ValueError):
            return 0

    @staticmethod
    def _text(value):
        return value.strip() if isinstance(value, str) else ""

    def _project(self, project_id):
        project = request.env["project.project"].browse(self._int(project_id)).exists()
        return project[:1]

    def _error(self, error):
        if isinstance(error, AccessError):
            return self._json({"error": "Você não tem permissão para executar este ato."}, status=403)
        return self._json({"error": str(error)}, status=400)

    @staticmethod
    def _triangulo_vals(record):
        return {
            "id": record.id,
            "project_id": record.project_id.id,
            "name": record.name,
            "valor_publico": record.valor_publico or "",
            "legitimidade": record.legitimidade or "",
            "capacidade": record.capacidade or "",
        }

    @http.route("/api/estrategia/triangulo", auth="user", type="http", methods=["GET"])
    def list_triangulos(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            records = request.env["evoluta.triangulo"].search(
                [("project_id", "=", project.id)], order="id desc"
            )
            return self._json({"records": [self._triangulo_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar o triângulo estratégico."}, status=403)

    @http.route("/api/estrategia/triangulo", auth="user", type="http", methods=["POST"], csrf=False)
    def create_triangulo(self):
        data = request.get_json_data() or {}
        project = self._project(data.get("project_id"))
        campos = {
            "valor_publico": self._text(data.get("valor_publico")),
            "legitimidade": self._text(data.get("legitimidade")),
            "capacidade": self._text(data.get("capacidade")),
        }
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        faltantes = [campo for campo, valor in campos.items() if not valor]
        if faltantes:
            return self._json({"error": "Preencha valor público, legitimidade e capacidade operacional."}, status=400)
        try:
            record = request.env["evoluta.triangulo"].create(
                {
                    "name": self._text(data.get("name")) or "Triângulo Estratégico",
                    "project_id": project.id,
                    **campos,
                }
            )
            return self._json({"record": self._triangulo_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @staticmethod
    def _arvore_vals(record):
        objetivo = record.env["evoluta.arvore.objetivos"].search(
            [("origem_id", "=", record.id)], limit=1
        )
        return {
            "id": record.id,
            "project_id": record.project_id.id,
            "name": record.name,
            "causas": record.causas or "",
            "problema_central": record.problema_central or "",
            "efeitos": record.efeitos or "",
            "objetivo": {
                "id": objetivo.id,
                "name": objetivo.name,
                "objetivo_central": objetivo.objetivo_central or "",
                "task_id": objetivo.task_id.id if objetivo.task_id else False,
            } if objetivo else None,
        }

    @http.route("/api/estrategia/arvores-problemas", auth="user", type="http", methods=["GET"])
    def list_arvores_problemas(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            records = request.env["evoluta.arvore.problemas"].search(
                [("project_id", "=", project.id)], order="id desc"
            )
            return self._json({"records": [self._arvore_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar árvores de problemas."}, status=403)

    @http.route("/api/estrategia/arvores-problemas", auth="user", type="http", methods=["POST"], csrf=False)
    def create_arvore_problemas(self):
        data = request.get_json_data() or {}
        project = self._project(data.get("project_id"))
        problema = self._text(data.get("problema_central"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        if not problema:
            return self._json({"error": "Informe o problema central antes de salvar."}, status=400)
        try:
            record = request.env["evoluta.arvore.problemas"].create(
                {
                    "name": self._text(data.get("name")) or "Árvore de Problemas",
                    "project_id": project.id,
                    "causas": self._text(data.get("causas")),
                    "problema_central": problema,
                    "efeitos": self._text(data.get("efeitos")),
                }
            )
            return self._json({"record": self._arvore_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/estrategia/arvores-problemas/<int:record_id>/converter", auth="user", type="http", methods=["POST"], csrf=False)
    def convert_arvore_problemas(self, record_id):
        record = request.env["evoluta.arvore.problemas"].browse(record_id).exists()
        if not record:
            return self._json({"error": "Árvore de problemas não encontrada."}, status=404)
        try:
            action = record.action_converter_objetivos()
            objetivo = request.env["evoluta.arvore.objetivos"].browse(action.get("res_id")).exists()
            return self._json({"record": self._arvore_vals(record), "objetivo_id": objetivo.id}, status=200)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @staticmethod
    def _teoria_vals(record):
        return {
            "id": record.id,
            "project_id": record.project_id.id,
            "name": record.name,
            "contexto": record.contexto or "",
            "insumos": record.insumos or "",
            "atividades": record.atividades or "",
            "produtos": record.produtos or "",
            "resultados": record.resultados or "",
        }

    @http.route("/api/teoria", auth="user", type="http", methods=["GET"])
    def list_teorias(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            records = request.env["evoluta.teoria"].search(
                [("project_id", "=", project.id)], order="id desc"
            )
            return self._json({"records": [self._teoria_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar teorias da mudança."}, status=403)

    @http.route("/api/teoria", auth="user", type="http", methods=["POST"], csrf=False)
    def create_teoria(self):
        data = request.get_json_data() or {}
        project = self._project(data.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            record = request.env["evoluta.teoria"].create(
                {
                    "name": self._text(data.get("name")) or "Nova teoria da mudança",
                    "project_id": project.id,
                    "contexto": self._text(data.get("contexto")),
                    "insumos": self._text(data.get("insumos")),
                    "atividades": self._text(data.get("atividades")),
                    "produtos": self._text(data.get("produtos")),
                    "resultados": self._text(data.get("resultados")),
                }
            )
            return self._json({"record": self._teoria_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)
