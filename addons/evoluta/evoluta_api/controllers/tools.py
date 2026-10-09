import json

from odoo import http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request

from .audit_helpers import registrar_auditoria
from .scope import is_platform_admin, project_in_scope


class EvolutaToolsApi(http.Controller):
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

    def _error_from_exception(self, error):
        if isinstance(error, AccessError):
            return self._json({"error": "Você não tem permissão para executar este ato."}, status=403)
        return self._json({"error": str(error)}, status=400)

    def _porques_vals(self, record):
        return {
            "id": record.id,
            "project_id": record.project_id.id,
            "name": record.name,
            "problema": record.problema or "",
            "pq1": record.pq1 or "",
            "pq2": record.pq2 or "",
            "pq3": record.pq3 or "",
            "pq4": record.pq4 or "",
            "pq5": record.pq5 or "",
            "causa_raiz": record.causa_raiz or "",
            "task_id": record.task_id.id if record.task_id else False,
            "task_name": record.task_id.name if record.task_id else "",
        }

    @http.route("/api/porques", auth="user", type="http", methods=["GET"])
    def list_porques(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            records = request.env["evoluta.cinco_porques"].search(
                [("project_id", "=", project.id), ("active", "=", True)], order="id desc"
            )
            return self._json({"records": [self._porques_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar 5 Porquês."}, status=403)

    @http.route("/api/porques", auth="user", type="http", methods=["POST"])
    def create_porques(self):
        dados = request.get_json_data() or {}
        project = self._project(dados.get("project_id"))
        obrigatorios = self._text(dados.get("name")) or "Nova análise 5 Porquês"
        problema = self._text(dados.get("problema"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        if not problema:
            return self._json({"error": "Informe o problema antes de salvar."}, status=400)
        valores = {
            "name": obrigatorios,
            "project_id": project.id,
            "problema": problema,
            "pq1": self._text(dados.get("pq1")),
            "pq2": self._text(dados.get("pq2")),
            "pq3": self._text(dados.get("pq3")),
            "pq4": self._text(dados.get("pq4")),
            "pq5": self._text(dados.get("pq5")),
            "causa_raiz": self._text(dados.get("causa_raiz")),
        }
        try:
            record = request.env["evoluta.cinco_porques"].create(valores)
            registrar_auditoria("create", "evoluta.cinco_porques", record, project=project)
            return self._json({"record": self._porques_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    @http.route("/api/porques/<int:record_id>/criar-acao", auth="user", type="http", methods=["POST"])
    def create_porques_action(self, record_id):
        record = request.env["evoluta.cinco_porques"].browse(record_id).exists()
        if not record or not project_in_scope(request.env.user, record.project_id):
            return self._json({"error": "Análise 5 Porquês não encontrada."}, status=404)
        try:
            action = record.action_create_task()
            task = request.env["project.task"].browse(action.get("res_id")).exists()
            return self._json(
                {"record": {"id": record.id, "task_id": task.id, "task_name": task.name}},
                status=200,
            )
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    def _risco_vals(self, record):
        selecoes = {
            "probabilidade": {"baixa": "Baixa", "media": "Média", "alta": "Alta"},
            "impacto": {"baixo": "Baixo", "medio": "Médio", "alto": "Alto"},
        }
        return {
            "id": record.id,
            "project_id": record.project_id.id,
            "name": record.name,
            "probabilidade": record.probabilidade,
            "probabilidade_label": selecoes["probabilidade"].get(record.probabilidade, record.probabilidade),
            "impacto": record.impacto,
            "impacto_label": selecoes["impacto"].get(record.impacto, record.impacto),
            "mitigacao": record.mitigacao or "",
            "responsavel_id": record.responsavel_id.id if record.responsavel_id else False,
            "responsavel_name": record.responsavel_id.name if record.responsavel_id else "",
            "task_id": record.task_id.id if record.task_id else False,
            "task_name": record.task_id.name if record.task_id else "",
        }

    @http.route("/api/riscos", auth="user", type="http", methods=["GET"])
    def list_riscos(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            records = request.env["evoluta.risco"].search(
                [("project_id", "=", project.id), ("active", "=", True)], order="id desc"
            )
            return self._json({"records": [self._risco_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar riscos."}, status=403)

    @http.route("/api/riscos", auth="user", type="http", methods=["POST"])
    def create_risco(self):
        dados = request.get_json_data() or {}
        project = self._project(dados.get("project_id"))
        nome = self._text(dados.get("name"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        if not nome:
            return self._json({"error": "Informe o risco antes de salvar."}, status=400)
        try:
            record = request.env["evoluta.risco"].create(
                {
                    "name": nome,
                    "project_id": project.id,
                    "probabilidade": self._text(dados.get("probabilidade")) or "media",
                    "impacto": self._text(dados.get("impacto")) or "medio",
                    "mitigacao": self._text(dados.get("mitigacao")),
                    "responsavel_id": self._int(dados.get("responsavel_id")) or False,
                }
            )
            registrar_auditoria("create", "evoluta.risco", record, project=project)
            return self._json({"record": self._risco_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    @http.route("/api/riscos/<int:record_id>/criar-acao", auth="user", type="http", methods=["POST"])
    def create_risco_action(self, record_id):
        record = request.env["evoluta.risco"].browse(record_id).exists()
        if not record or not project_in_scope(request.env.user, record.project_id):
            return self._json({"error": "Risco não encontrado."}, status=404)
        try:
            action = record.action_create_task()
            task = request.env["project.task"].browse(action.get("res_id")).exists()
            return self._json(
                {"record": {"id": record.id, "task_id": task.id, "task_name": task.name}},
                status=200,
            )
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    def _ishikawa_vals(self, record):
        categorias = dict(record.env["evoluta.ishikawa.causa"]._fields["categoria"].selection)
        return {
            "id": record.id,
            "project_id": record.project_id.id,
            "name": record.name,
            "problema": record.problema or "",
            "causa_raiz": record.causa_raiz or "",
            "task_id": record.task_id.id if record.task_id else False,
            "task_name": record.task_id.name if record.task_id else "",
            "causas": [
                {
                    "id": causa.id,
                    "categoria": causa.categoria,
                    "categoria_label": categorias.get(causa.categoria, causa.categoria),
                    "descricao": causa.descricao,
                    "eh_principal": causa.eh_principal,
                }
                for causa in record.causa_ids
            ],
        }

    @http.route("/api/ishikawa", auth="user", type="http", methods=["GET"])
    def list_ishikawa(self, project_id=None):
        project = self._project(project_id or request.httprequest.args.get("project_id"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            records = request.env["evoluta.ishikawa"].search(
                [("project_id", "=", project.id), ("active", "=", True)], order="id desc"
            )
            return self._json({"records": [self._ishikawa_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar Ishikawa."}, status=403)

    @http.route("/api/ishikawa", auth="user", type="http", methods=["POST"])
    def create_ishikawa(self):
        dados = request.get_json_data() or {}
        project = self._project(dados.get("project_id"))
        problema = self._text(dados.get("problema"))
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        if not problema:
            return self._json({"error": "Informe o problema antes de salvar."}, status=400)
        causas = dados.get("causas") if isinstance(dados.get("causas"), list) else []
        comandos = []
        for causa in causas:
            if not isinstance(causa, dict):
                continue
            categoria = self._text(causa.get("categoria"))
            descricao = self._text(causa.get("descricao"))
            if categoria and descricao:
                comandos.append(
                    (0, 0, {
                        "categoria": categoria,
                        "descricao": descricao,
                        "eh_principal": bool(causa.get("eh_principal")),
                    })
                )
        try:
            record = request.env["evoluta.ishikawa"].create(
                {
                    "name": self._text(dados.get("name")) or "Nova análise Ishikawa",
                    "project_id": project.id,
                    "problema": problema,
                    "causa_ids": comandos,
                }
            )
            registrar_auditoria("create", "evoluta.ishikawa", record, project=project)
            return self._json({"record": self._ishikawa_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    @http.route("/api/ishikawa/<int:record_id>/definir-causa-raiz", auth="user", type="http", methods=["POST"])
    def define_ishikawa_root(self, record_id):
        record = request.env["evoluta.ishikawa"].browse(record_id).exists()
        if not record or not project_in_scope(request.env.user, record.project_id):
            return self._json({"error": "Análise Ishikawa não encontrada."}, status=404)
        try:
            record.action_define_causa_raiz()
            return self._json({"record": self._ishikawa_vals(record)})
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    @http.route("/api/ishikawa/<int:record_id>/criar-acao", auth="user", type="http", methods=["POST"])
    def create_ishikawa_action(self, record_id):
        record = request.env["evoluta.ishikawa"].browse(record_id).exists()
        if not record or not project_in_scope(request.env.user, record.project_id):
            return self._json({"error": "Análise Ishikawa não encontrada."}, status=404)
        try:
            action = record.action_create_task()
            task = request.env["project.task"].browse(action.get("res_id")).exists()
            return self._json(
                {"record": {"id": record.id, "task_id": task.id, "task_name": task.name}},
                status=200,
            )
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    @http.route("/api/usuarios", auth="user", type="http", methods=["GET"])
    def list_users(self):
        try:
            domain = [("active", "=", True), ("share", "=", False)]
            if not is_platform_admin(request.env.user):
                if not request.env.user.municipio_id:
                    return self._json({"records": []})
                domain.append(("municipio_id", "=", request.env.user.municipio_id.id))
            users = request.env["res.users"].search(domain, order="name")
            return self._json(
                {
                    "records": [
                        {"id": user.id, "name": user.name, "email": user.email or ""}
                        for user in users
                    ]
                }
            )
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar usuários."}, status=403)

    def _raci_vals(self, record):
        return {
            "id": record.id,
            "name": record.name,
            "task_id": record.task_id.id,
            "task_name": record.task_id.name,
            "responsible_id": record.responsible_id.id,
            "responsible_name": record.responsible_id.name,
            "accountable_id": record.accountable_id.id,
            "accountable_name": record.accountable_id.name,
            "consulted": [{"id": user.id, "name": user.name} for user in record.consulted_ids],
            "informed": [{"id": user.id, "name": user.name} for user in record.informed_ids],
        }

    @http.route("/api/raci", auth="user", type="http", methods=["GET"])
    def list_raci(self, task=None):
        task_id = self._int(task or request.httprequest.args.get("task"))
        task_record = request.env["project.task"].browse(task_id).exists()
        if not task_record or not project_in_scope(request.env.user, task_record.project_id):
            return self._json({"error": "Task não encontrada."}, status=404)
        try:
            records = request.env["evoluta.raci"].search(
                [("task_id", "=", task_record.id), ("active", "=", True)], order="id desc"
            )
            return self._json({"records": [self._raci_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar RACI."}, status=403)

    @http.route("/api/raci", auth="user", type="http", methods=["POST"])
    def create_raci(self):
        dados = request.get_json_data() or {}
        task = request.env["project.task"].browse(self._int(dados.get("task_id"))).exists()
        responsible_id = self._int(dados.get("responsible_id"))
        accountable_id = self._int(dados.get("accountable_id"))
        if not task or not project_in_scope(request.env.user, task.project_id):
            return self._json({"error": "Task não encontrada."}, status=404)
        if not responsible_id or not accountable_id:
            return self._json({"error": "Responsible e Accountable são obrigatórios."}, status=400)
        user_ids = {responsible_id, accountable_id}
        user_ids.update(self._int(value) for value in dados.get("consulted_ids", []))
        user_ids.update(self._int(value) for value in dados.get("informed_ids", []))
        users = request.env["res.users"].sudo().browse(list(user_ids)).exists()
        if len(users) != len(user_ids) or any(user.municipio_id != task.project_id.municipio_id for user in users):
            return self._json({"error": "Todas as pessoas do RACI precisam pertencer ao município da task."}, status=400)
        try:
            record = request.env["evoluta.raci"].create(
                {
                    "name": self._text(dados.get("name")) or f"RACI — {task.name}",
                    "task_id": task.id,
                    "responsible_id": responsible_id,
                    "accountable_id": accountable_id,
                    "consulted_ids": [(6, 0, [self._int(value) for value in dados.get("consulted_ids", [])])],
                    "informed_ids": [(6, 0, [self._int(value) for value in dados.get("informed_ids", [])])],
                }
            )
            registrar_auditoria("create", "evoluta.raci", record, project=task.project_id)
            return self._json({"record": self._raci_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    def _tool_record(self, model_name, record_id):
        record = request.env[model_name].browse(record_id).exists()
        project = record.project_id if record and hasattr(record, "project_id") else (record.task_id.project_id if record and record.task_id else request.env["project.project"])
        if not record or not project or not project_in_scope(request.env.user, project):
            return None, self._json({"error": "Registro não encontrado."}, status=404)
        return record, None

    def _write_tool(self, model_name, record_id, values, serializer):
        record, response = self._tool_record(model_name, record_id)
        if response:
            return response
        try:
            record.write(values)
            project = record.project_id if hasattr(record, "project_id") else record.task_id.project_id
            registrar_auditoria("archive" if values.get("active") is False else "update", model_name, record, project=project)
            return self._json({"record": serializer(record)})
        except (AccessError, UserError, ValidationError) as error:
            return self._error_from_exception(error)

    @http.route("/api/porques/<int:record_id>", auth="user", type="http", methods=["PATCH"])
    def update_porques(self, record_id):
        data = request.get_json_data() or {}
        values = {field: self._text(data[field]) for field in ("name", "problema", "pq1", "pq2", "pq3", "pq4", "pq5", "causa_raiz") if field in data}
        if "problema" in values and not values["problema"]:
            return self._json({"error": "O problema é obrigatório."}, status=400)
        return self._write_tool("evoluta.cinco_porques", record_id, values, self._porques_vals)

    @http.route("/api/porques/<int:record_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_porques(self, record_id):
        return self._write_tool("evoluta.cinco_porques", record_id, {"active": False}, self._porques_vals)

    @http.route("/api/riscos/<int:record_id>", auth="user", type="http", methods=["PATCH"])
    def update_risco(self, record_id):
        data = request.get_json_data() or {}
        values = {field: self._text(data[field]) for field in ("name", "probabilidade", "impacto", "mitigacao") if field in data}
        if "responsavel_id" in data:
            responsavel = request.env["res.users"].sudo().browse(self._int(data.get("responsavel_id"))).exists()
            record = request.env["evoluta.risco"].browse(record_id).exists()
            if not responsavel or not record or responsavel.municipio_id != record.project_id.municipio_id:
                return self._json({"error": "O responsável precisa pertencer ao município do projeto."}, status=400)
            values["responsavel_id"] = responsavel.id
        return self._write_tool("evoluta.risco", record_id, values, self._risco_vals)

    @http.route("/api/riscos/<int:record_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_risco(self, record_id):
        return self._write_tool("evoluta.risco", record_id, {"active": False}, self._risco_vals)

    @http.route("/api/ishikawa/<int:record_id>", auth="user", type="http", methods=["PATCH"])
    def update_ishikawa(self, record_id):
        data = request.get_json_data() or {}
        values = {field: self._text(data[field]) for field in ("name", "problema") if field in data}
        if "problema" in values and not values["problema"]:
            return self._json({"error": "O problema é obrigatório."}, status=400)
        if "causas" in data and isinstance(data["causas"], list):
            values["causa_ids"] = [(5, 0, 0)] + [(0, 0, {"categoria": self._text(item.get("categoria")), "descricao": self._text(item.get("descricao")), "eh_principal": bool(item.get("eh_principal"))}) for item in data["causas"] if isinstance(item, dict) and self._text(item.get("categoria")) and self._text(item.get("descricao"))]
        return self._write_tool("evoluta.ishikawa", record_id, values, self._ishikawa_vals)

    @http.route("/api/ishikawa/<int:record_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_ishikawa(self, record_id):
        return self._write_tool("evoluta.ishikawa", record_id, {"active": False}, self._ishikawa_vals)

    @http.route("/api/raci/<int:record_id>", auth="user", type="http", methods=["PATCH"])
    def update_raci(self, record_id):
        data = request.get_json_data() or {}
        record, response = self._tool_record("evoluta.raci", record_id)
        if response:
            return response
        ids = {self._int(data.get("responsible_id")) or record.responsible_id.id, self._int(data.get("accountable_id")) or record.accountable_id.id}
        consulted = [self._int(value) for value in data.get("consulted_ids", [user.id for user in record.consulted_ids])]
        informed = [self._int(value) for value in data.get("informed_ids", [user.id for user in record.informed_ids])]
        ids.update(consulted + informed)
        users = request.env["res.users"].sudo().browse(list(ids)).exists()
        if len(users) != len(ids) or any(user.municipio_id != record.task_id.project_id.municipio_id for user in users):
            return self._json({"error": "Todas as pessoas do RACI precisam pertencer ao município da task."}, status=400)
        values = {"responsible_id": self._int(data.get("responsible_id")) or record.responsible_id.id, "accountable_id": self._int(data.get("accountable_id")) or record.accountable_id.id, "consulted_ids": [(6, 0, consulted)], "informed_ids": [(6, 0, informed)]}
        if "name" in data:
            values["name"] = self._text(data.get("name"))
        return self._write_tool("evoluta.raci", record_id, values, self._raci_vals)

    @http.route("/api/raci/<int:record_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_raci(self, record_id):
        return self._write_tool("evoluta.raci", record_id, {"active": False}, self._raci_vals)
