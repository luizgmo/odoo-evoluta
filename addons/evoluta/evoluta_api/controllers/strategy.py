import json

from odoo import http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request

from .audit_helpers import registrar_auditoria
from .scope import project_in_scope


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
        return project[:1] if project and project_in_scope(request.env.user, project) else project.browse()

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
                [("project_id", "=", project.id), ("active", "=", True)], order="id desc"
            )
            return self._json({"records": [self._triangulo_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar o triângulo estratégico."}, status=403)

    @http.route("/api/estrategia/triangulo", auth="user", type="http", methods=["POST"])
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
            registrar_auditoria("create", "evoluta.triangulo", record, project=project)
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
                "five_w2h_id": objetivo.five_w2h_id.id if hasattr(objetivo, "five_w2h_id") and objetivo.five_w2h_id else False,
            } if objetivo else None,
        }

    @http.route("/api/estrategia/arvores-problemas", auth="user", type="http", methods=["GET"])
    def list_arvores_problemas(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            records = request.env["evoluta.arvore.problemas"].search(
                [("project_id", "=", project.id), ("active", "=", True)], order="id desc"
            )
            return self._json({"records": [self._arvore_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar árvores de problemas."}, status=403)

    @http.route("/api/estrategia/arvores-problemas", auth="user", type="http", methods=["POST"])
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
            registrar_auditoria("create", "evoluta.arvore.problemas", record, project=project)
            return self._json({"record": self._arvore_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/estrategia/arvores-problemas/<int:record_id>/converter", auth="user", type="http", methods=["POST"])
    def convert_arvore_problemas(self, record_id):
        record = request.env["evoluta.arvore.problemas"].browse(record_id).exists()
        if not record or not project_in_scope(request.env.user, record.project_id):
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
                [("project_id", "=", project.id), ("active", "=", True)], order="id desc"
            )
            return self._json({"records": [self._teoria_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar teorias da mudança."}, status=403)

    @http.route("/api/teoria", auth="user", type="http", methods=["POST"])
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
            registrar_auditoria("create", "evoluta.teoria", record, project=project)
            return self._json({"record": self._teoria_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    def _strategy_record(self, model_name, record_id):
        record = request.env[model_name].browse(record_id).exists()
        if not record or not project_in_scope(request.env.user, record.project_id):
            return None, self._json({"error": "Registro estratégico não encontrado."}, status=404)
        return record, None

    def _update_strategy(self, model_name, record_id, values, serializer):
        record, response = self._strategy_record(model_name, record_id)
        if response:
            return response
        try:
            record.write(values)
            registrar_auditoria("archive" if values.get("active") is False else "update", model_name, record, project=record.project_id)
            return self._json({"record": serializer(record)})
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/estrategia/triangulo/<int:record_id>", auth="user", type="http", methods=["PATCH"])
    def update_triangulo(self, record_id):
        data = request.get_json_data() or {}
        return self._update_strategy("evoluta.triangulo", record_id, {field: self._text(data[field]) for field in ("name", "valor_publico", "legitimidade", "capacidade") if field in data}, self._triangulo_vals)

    @http.route("/api/estrategia/triangulo/<int:record_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_triangulo(self, record_id):
        return self._update_strategy("evoluta.triangulo", record_id, {"active": False}, self._triangulo_vals)

    @http.route("/api/estrategia/arvores-problemas/<int:record_id>", auth="user", type="http", methods=["PATCH"])
    def update_arvore_problemas(self, record_id):
        data = request.get_json_data() or {}
        values = {field: self._text(data[field]) for field in ("name", "causas", "problema_central", "efeitos") if field in data}
        if "problema_central" in values and not values["problema_central"]:
            return self._json({"error": "O problema central é obrigatório."}, status=400)
        return self._update_strategy("evoluta.arvore.problemas", record_id, values, self._arvore_vals)

    @http.route("/api/estrategia/arvores-problemas/<int:record_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_arvore_problemas(self, record_id):
        return self._update_strategy("evoluta.arvore.problemas", record_id, {"active": False}, self._arvore_vals)

    @staticmethod
    def _objetivo_vals(record):
        return {"id": record.id, "project_id": record.project_id.id, "name": record.name, "acoes": record.acoes or "", "objetivo_central": record.objetivo_central or "", "resultados": record.resultados or "", "task_id": record.task_id.id if record.task_id else False, "five_w2h_id": record.five_w2h_id.id if hasattr(record, "five_w2h_id") and record.five_w2h_id else False}

    @http.route("/api/estrategia/arvores-objetivos", auth="user", type="http", methods=["GET"])
    def list_arvores_objetivos(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        records = request.env["evoluta.arvore.objetivos"].search([("project_id", "=", project.id), ("active", "=", True)], order="id desc")
        return self._json({"records": [self._objetivo_vals(record) for record in records]})

    @http.route("/api/estrategia/arvores-objetivos/<int:record_id>/gerar-5w2h", auth="user", type="http", methods=["POST"])
    def generate_objective_plan(self, record_id):
        record, response = self._strategy_record("evoluta.arvore.objetivos", record_id)
        if response:
            return response
        try:
            plan = record.five_w2h_id or request.env["evoluta.5w2h"].create({"name": f"5W2H - {record.name}", "project_id": record.project_id.id, "what": record.objetivo_central, "why": record.resultados or ""})
            if not record.five_w2h_id:
                record.write({"five_w2h_id": plan.id})
                registrar_auditoria("create", "evoluta.5w2h", plan, project=record.project_id, details="Plano gerado a partir da árvore de objetivos")
            return self._json({"record": {"id": plan.id, "name": plan.name, "project_id": plan.project_id.id}}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/estrategia/arvores-objetivos/<int:record_id>/criar-acao", auth="user", type="http", methods=["POST"])
    def create_objective_action(self, record_id):
        record, response = self._strategy_record("evoluta.arvore.objetivos", record_id)
        if response:
            return response
        try:
            action = record.action_create_task()
            return self._json({"record": {"id": record.id, "task_id": action.get("res_id")}})
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/teoria/<int:record_id>", auth="user", type="http", methods=["PATCH"])
    def update_teoria(self, record_id):
        data = request.get_json_data() or {}
        return self._update_strategy("evoluta.teoria", record_id, {field: self._text(data[field]) for field in ("name", "contexto", "insumos", "atividades", "produtos", "resultados") if field in data}, self._teoria_vals)

    @http.route("/api/teoria/<int:record_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_teoria(self, record_id):
        return self._update_strategy("evoluta.teoria", record_id, {"active": False}, self._teoria_vals)
