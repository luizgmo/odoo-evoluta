import json

from odoo import http
from odoo.http import Response, request


class EvolutaApi(http.Controller):
    def _json(self, payload):
        return Response(json.dumps(payload), content_type="application/json")

    def _project_vals(self, project):
        tasks = request.env["project.task"].search([("project_id", "=", project.id)])
        stages = request.env["project.task.type"].search(
            [("project_ids", "in", project.id)], order="sequence"
        )
        return {
            "id": project.id,
            "name": project.name,
            "stages": [{"id": s.id, "name": s.name, "fold": s.fold} for s in stages],
            "tasks": [
                {
                    "id": t.id,
                    "name": t.name,
                    "stage_id": t.stage_id.id if t.stage_id else False,
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
            return self._json({"error": "not_found"})
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
            return self._json({"error": "Informe o nome do projeto."})
        project = request.env["project.project"].create({"name": nome})
        return self._json({"record": {"id": project.id, "name": project.name}})

    @http.route("/api/5w2h", auth="user", type="http", methods=["POST"], csrf=False)
    def create_plan(self):
        from odoo.exceptions import ValidationError

        dados = request.get_json_data() or {}
        try:
            project_id = int(dados.get("project_id") or 0)
        except (TypeError, ValueError):
            project_id = 0
        if not project_id or not (dados.get("what") or "").strip():
            return self._json({"error": "Projeto e What são obrigatórios."})
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
            return self._json({"error": str(err)})
        return self._json({"record": {"id": plan.id, "name": plan.name}})

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
            return self._json({"error": "Task ou etapa inexistente."})
        task.with_context(skip_5w2h_sync=True).write({"stage_id": stage.id})
        return self._json({"record": {"id": task.id, "stage_id": stage.id}})
