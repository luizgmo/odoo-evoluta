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
