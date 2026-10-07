import json

from odoo import http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request


class EvolutaApi(http.Controller):
    def _json(self, payload, status=200):
        return Response(
            json.dumps(payload, ensure_ascii=False),
            status=status,
            content_type="application/json; charset=utf-8",
        )

    @staticmethod
    def _inteiro(valor):
        try:
            return int(valor or 0)
        except (TypeError, ValueError):
            return 0

    @staticmethod
    def _texto(valor):
        return valor.strip() if isinstance(valor, str) else ""

    def _stakeholder_vals(self, stakeholder):
        selecoes = {
            "poder": {
                "baixo": "Baixo",
                "medio": "Médio",
                "alto": "Alto",
            },
            "interesse": {
                "baixo": "Baixo",
                "medio": "Médio",
                "alto": "Alto",
            },
            "posicao": {
                "apoiador": "Apoiador",
                "neutro": "Neutro",
                "opositor": "Opositor",
            },
            "influencia": {
                "baixa": "Baixa",
                "media": "Média",
                "alta": "Alta",
            },
        }
        return {
            "id": stakeholder.id,
            "project_id": stakeholder.project_id.id,
            "project_name": stakeholder.project_id.name,
            "name": stakeholder.name,
            "organizacao": stakeholder.organizacao or "",
            "poder": stakeholder.poder,
            "poder_label": selecoes["poder"].get(stakeholder.poder, stakeholder.poder),
            "interesse": stakeholder.interesse,
            "interesse_label": selecoes["interesse"].get(
                stakeholder.interesse, stakeholder.interesse
            ),
            "posicao": stakeholder.posicao,
            "posicao_label": selecoes["posicao"].get(stakeholder.posicao, stakeholder.posicao),
            "influencia": stakeholder.influencia,
            "influencia_label": selecoes["influencia"].get(
                stakeholder.influencia, stakeholder.influencia
            ),
            "estrategia": stakeholder.estrategia or "",
        }

    @http.route("/api/stakeholders", auth="user", type="http", methods=["GET"])
    def list_stakeholders(self, project_id=None):
        project_id = self._inteiro(project_id or request.httprequest.args.get("project_id"))
        if not project_id:
            return self._json({"error": "Informe o projeto para buscar os stakeholders."}, status=400)
        project = request.env["project.project"].browse(project_id).exists()
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        stakeholders = request.env["evoluta.stakeholder"].search(
            [("project_id", "=", project.id), ("active", "=", True)], order="id desc"
        )
        try:
            records = [self._stakeholder_vals(stakeholder) for stakeholder in stakeholders]
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar stakeholders."}, status=403)
        return self._json({"records": records})

    @http.route("/api/stakeholders", auth="user", type="http", methods=["POST"], csrf=False)
    def create_stakeholder(self):
        dados = request.get_json_data() or {}
        project_id = self._inteiro(dados.get("project_id"))
        nome = self._texto(dados.get("name"))
        obrigatorios = {
            "poder": self._texto(dados.get("poder")),
            "interesse": self._texto(dados.get("interesse")),
            "posicao": self._texto(dados.get("posicao")),
            "influencia": self._texto(dados.get("influencia")),
        }
        if not project_id or not nome or any(not valor for valor in obrigatorios.values()):
            return self._json(
                {"error": "Projeto, nome, poder, interesse, posição e influência são obrigatórios."},
                status=400,
            )
        project = request.env["project.project"].browse(project_id).exists()
        if not project:
            return self._json({"error": "Projeto não encontrado."}, status=404)
        valores = {
            "name": nome,
            "project_id": project.id,
            "organizacao": self._texto(dados.get("organizacao")),
            **obrigatorios,
            "estrategia": self._texto(dados.get("estrategia")),
        }
        try:
            stakeholder = request.env["evoluta.stakeholder"].create(valores)
            return self._json({"record": self._stakeholder_vals(stakeholder)}, status=201)
        except (AccessError, UserError) as err:
            return self._json({"error": str(err)}, status=403 if isinstance(err, AccessError) else 400)
        except ValidationError as err:
            return self._json({"error": str(err)}, status=400)

    def _project_vals(self, project):
        tasks = request.env["project.task"].search([("project_id", "=", project.id)])
        stages = request.env["project.task.type"].search(
            [("project_ids", "in", project.id)], order="sequence"
        )
        return {
            "id": project.id,
            "name": project.name,
            "orcamento": project.evoluta_orcamento,
            "stages": [{"id": s.id, "name": s.name, "fold": s.fold} for s in stages],
            "tasks": [
                {
                    "id": t.id,
                    "name": t.name,
                    "stage_id": t.stage_id.id if t.stage_id else False,
                    "date_deadline": t.date_deadline.isoformat() if t.date_deadline else False,
                }
                for t in tasks
            ],
        }

    @http.route("/api/projetos", auth="user", type="http", methods=["GET"])
    def list_projects(self):
        projects = request.env["project.project"].search([])
        return self._json(
            {
                "records": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "total_tasks": request.env["project.task"].search_count(
                            [("project_id", "=", p.id)]
                        ),
                        "orcamento": p.evoluta_orcamento,
                    }
                    for p in projects
                ]
            }
        )

    @http.route(
        "/api/projetos/<int:project_id>", auth="user", type="http", methods=["GET"]
    )
    def get_project(self, project_id):
        project = request.env["project.project"].browse(project_id)
        if not project.exists():
            return self._json({"error": "Projeto não encontrado."}, status=404)
        return self._json({"record": self._project_vals(project)})

    @http.route("/api/planos", auth="user", type="http", methods=["GET"])
    def list_plans(self, project_id=None):
        domain = []
        if project_id:
            domain.append(("project_id", "=", int(project_id)))
        plans = request.env["evoluta.5w2h"].search(domain)
        return self._json(
            {
                "records": [
                    {
                        "id": pl.id,
                        "name": pl.name,
                        "project_id": pl.project_id.id if pl.project_id else False,
                        "what": pl.what,
                        "task_id": pl.task_id.id if pl.task_id else False,
                    }
                    for pl in plans
                ]
            }
        )

    @http.route("/api/projetos", auth="user", type="http", methods=["POST"], csrf=False)
    def create_project(self):
        dados = request.get_json_data() or {}
        nome = (dados.get("name") or "").strip()
        if not nome:
            return self._json({"error": "Informe o nome do projeto."}, status=400)
        project = request.env["project.project"].create(
            {"name": nome, "evoluta_orcamento": float(dados.get("orcamento") or 0.0)}
        )
        return self._json(
            {"record": {"id": project.id, "name": project.name}}
        )

    @http.route("/api/5w2h", auth="user", type="http", methods=["POST"], csrf=False)
    def create_plan(self):
        from odoo.exceptions import ValidationError

        dados = request.get_json_data() or {}
        try:
            project_id = int(dados.get("project_id") or 0)
        except (TypeError, ValueError):
            project_id = 0
        if not project_id or not (dados.get("what") or "").strip():
            return self._json({"error": "Projeto e What são obrigatórios."}, status=400)
        try:
            plan = (
                request.env["evoluta.5w2h"]
                .with_context(skip_task_sync=True)
                .create(
                    {
                        "name": dados.get("name") or dados["what"],
                        "project_id": project_id,
                        "what": dados["what"].strip(),
                        "why": dados.get("why") or "",
                        "where": dados.get("where") or "",
                        "date_deadline": dados.get("date_deadline") or False,
                        "how": dados.get("how") or "",
                        "how_much": dados.get("how_much") or 0.0,
                    }
                )
            )
        except ValidationError as err:
            return self._json({"error": str(err)}, status=400)
        return self._json({"record": {"id": plan.id, "name": plan.name}}, status=201)

    @http.route(
        "/api/tasks/<int:task_id>/mover",
        auth="user",
        type="http",
        methods=["POST"],
        csrf=False,
    )
    def move_task(self, task_id):
        dados = request.get_json_data() or {}
        try:
            stage_id = int(dados.get("stage_id") or 0)
        except (TypeError, ValueError):
            stage_id = 0
        task = request.env["project.task"].browse(task_id)
        stage = request.env["project.task.type"].browse(stage_id)
        if not task.exists() or not stage.exists():
            return self._json({"error": "Task ou etapa inexistente."}, status=404)
        task.with_context(skip_5w2h_sync=True).write({"stage_id": stage.id})
        return self._json({"record": {"id": task.id, "stage_id": stage.id}})
