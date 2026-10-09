import json
import math
from typing import Any

from odoo import fields, http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request

from .scope import (
    ROLE_ADMIN,
    ROLE_ATTENDANT,
    ROLE_PLATFORM,
    ROLE_SECRETARY,
    is_platform_admin,
    permissions_for,
    project_in_scope,
    project_scope_domain,
    user_role,
)


class EvolutaApi(http.Controller):
    def _json(self, payload, status=200):
        return Response(
            json.dumps(payload, ensure_ascii=False),
            status=status,
            content_type="application/json; charset=utf-8",
        )

    @http.route("/api/csrf", auth="user", type="http", methods=["GET"])
    def csrf_token(self):
        return self._json({"token": request.csrf_token()})

    @http.route("/api/me", auth="user", type="http", methods=["GET"])
    def current_user(self):
        user = request.env.user
        role = user_role(user)
        municipio = user.municipio_id
        secretaria = user.secretaria_id
        departamento = user.departamento_id
        return self._json(
            {
                "record": {
                    "id": user.id,
                    "name": user.name,
                    "login": user.login,
                    "email": user.email or "",
                    "role": role,
                    "groups": [
                        xml_id
                        for xml_id in user.group_ids.get_external_id().values()
                        if xml_id and xml_id.startswith("evoluta_core.")
                    ],
                    "is_admin": role in {ROLE_PLATFORM, ROLE_ADMIN},
                    "is_system": is_platform_admin(user),
                    "is_internal_user": not user.share,
                    "scope_ready": bool(is_platform_admin(user) or municipio),
                    "municipio": {"id": municipio.id, "name": municipio.name} if municipio else None,
                    "secretaria": {"id": secretaria.id, "name": secretaria.name} if secretaria else None,
                    "departamento": {"id": departamento.id, "name": departamento.name} if departamento else None,
                    "permissions": permissions_for(user),
                }
            }
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
        if not project or not project_in_scope(request.env.user, project):
            return self._json({"error": "Projeto não encontrado."}, status=404)
        stakeholders = request.env["evoluta.stakeholder"].search(
            [("project_id", "=", project.id), ("active", "=", True)], order="id desc"
        )
        try:
            records = [self._stakeholder_vals(stakeholder) for stakeholder in stakeholders]
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar stakeholders."}, status=403)
        return self._json({"records": records})

    @http.route("/api/stakeholders", auth="user", type="http", methods=["POST"])
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
        if not project or not project_in_scope(request.env.user, project):
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
            self._audit("create", "evoluta.stakeholder", stakeholder, project=project)
            return self._json({"record": self._stakeholder_vals(stakeholder)}, status=201)
        except (AccessError, UserError) as err:
            return self._json({"error": str(err)}, status=403 if isinstance(err, AccessError) else 400)
        except ValidationError as err:
            return self._json({"error": str(err)}, status=400)

    @http.route("/api/stakeholders/<int:stakeholder_id>", auth="user", type="http", methods=["PATCH"])
    def update_stakeholder(self, stakeholder_id):
        stakeholder = request.env["evoluta.stakeholder"].browse(stakeholder_id).exists()
        if not stakeholder or not project_in_scope(request.env.user, stakeholder.project_id):
            return self._json({"error": "Stakeholder não encontrado."}, status=404)
        data = request.get_json_data() or {}
        values = {field: self._texto(data[field]) for field in ("name", "organizacao", "poder", "interesse", "posicao", "influencia", "estrategia") if field in data}
        if "name" in values and not values["name"]:
            return self._json({"error": "Informe o nome do stakeholder."}, status=400)
        try:
            stakeholder.write(values)
            self._audit("update", "evoluta.stakeholder", stakeholder, project=stakeholder.project_id)
            return self._json({"record": self._stakeholder_vals(stakeholder)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/stakeholders/<int:stakeholder_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_stakeholder(self, stakeholder_id):
        stakeholder = request.env["evoluta.stakeholder"].browse(stakeholder_id).exists()
        if not stakeholder or not project_in_scope(request.env.user, stakeholder.project_id):
            return self._json({"error": "Stakeholder não encontrado."}, status=404)
        stakeholder.write({"active": False})
        self._audit("archive", "evoluta.stakeholder", stakeholder, project=stakeholder.project_id)
        return self._json({"record": {"id": stakeholder.id, "active": False}})

    def _auditoria_vals(self, record):
        return {"id": record.id, "action": record.action, "action_label": dict(record._fields["action"].selection).get(record.action, record.action), "name": record.name, "model": record.model, "res_id": record.res_id, "res_name": record.res_name or "", "details": record.details or "", "user": self._relation_vals(record.user_id), "municipio": self._relation_vals(record.municipio_id), "project_id": record.project_id.id if record.project_id else False, "created_at": record.create_date.isoformat() if record.create_date else False}

    @http.route("/api/auditoria", auth="user", type="http", methods=["GET"])
    def list_auditoria(self):
        if user_role(request.env.user) not in {ROLE_PLATFORM, ROLE_ADMIN}:
            return self._json({"error": "Seu perfil não pode consultar a auditoria.", "code": "PERMISSION_DENIED"}, status=403)
        domain = [] if is_platform_admin(request.env.user) else [("municipio_id", "=", request.env.user.municipio_id.id if request.env.user.municipio_id else 0)]
        project_id = self._inteiro(request.httprequest.args.get("project_id"))
        if project_id:
            domain.append(("project_id", "=", project_id))
        inicio = request.httprequest.args.get("from")
        fim = request.httprequest.args.get("to")
        if inicio:
            domain.append(("create_date", ">=", inicio))
        if fim:
            domain.append(("create_date", "<=", f"{fim} 23:59:59"))
        records = request.env["evoluta.auditoria"].sudo().search(domain, order="create_date desc, id desc", limit=500)
        return self._json({"records": [self._auditoria_vals(record) for record in records]})

    def _indicadores_vals(self, project):
        tasks = request.env["project.task"].search([("project_id", "=", project.id)])
        stages = request.env["project.task.type"].search(
            [("project_ids", "in", project.id)], order="sequence"
        )
        counts = {stage.id: 0 for stage in stages}
        sem_etapa = 0
        for task in tasks:
            if task.stage_id:
                counts[task.stage_id.id] = counts.get(task.stage_id.id, 0) + 1
            else:
                sem_etapa += 1
        by_stage = [
            {"stage_id": stage.id, "stage_name": stage.name, "total": counts.get(stage.id, 0)}
            for stage in stages
            if counts.get(stage.id, 0)
        ]
        if sem_etapa:
            by_stage.append({"stage_id": False, "stage_name": "Sem etapa", "total": sem_etapa})
        return {
            "project_id": project.id,
            "total_tasks": project.evoluta_total_tasks,
            "done_tasks": project.evoluta_done_tasks,
            "overdue_tasks": project.evoluta_overdue_tasks,
            "open_tasks": max(project.evoluta_total_tasks - project.evoluta_done_tasks, 0),
            "by_stage": by_stage,
        }

    @staticmethod
    def _relation_vals(record):
        return {"id": record.id, "name": record.name} if record else None

    def _audit(self, action, model, record, project=None, details=""):
        try:
            municipio = project.municipio_id if project else getattr(record, "municipio_id", False)
            request.env["evoluta.auditoria"].sudo().create({"name": f"{action}: {record.display_name}", "action": action, "model": model, "res_id": record.id, "res_name": record.display_name, "details": details, "user_id": request.env.user.id, "municipio_id": municipio.id if municipio else False, "project_id": project.id if project else (record.project_id.id if getattr(record, "project_id", False) else False)})
        except Exception:
            return None

    def _task_vals(self, task):
        return {
            "id": task.id,
            "name": task.name,
            "project_id": task.project_id.id,
            "project_name": task.project_id.name,
            "stage_id": task.stage_id.id if task.stage_id else False,
            "stage_name": task.stage_id.name if task.stage_id else "Sem etapa",
            "date_deadline": task.date_deadline.isoformat() if task.date_deadline else False,
            "active": bool(task.active),
            "responsaveis": [{"id": user.id, "name": user.name} for user in task.user_ids],
        }

    def _project_vals(self, project):
        tasks = request.env["project.task"].search([("project_id", "=", project.id), ("active", "=", True)])
        if user_role(request.env.user) == ROLE_ATTENDANT:
            tasks = tasks.filtered(lambda task: request.env.user in task.user_ids)
        stages = request.env["project.task.type"].search(
            [("project_ids", "in", project.id)], order="sequence"
        )
        return {
            "id": project.id,
            "name": project.name,
            "active": bool(project.active),
            "created_at": project.create_date.isoformat() if project.create_date else False,
            "updated_at": project.write_date.isoformat() if project.write_date else False,
            "orcamento": project.evoluta_orcamento,
            "date_deadline": project.date.isoformat() if project.date else False,
            "municipio": self._relation_vals(project.municipio_id),
            "secretaria": self._relation_vals(project.secretaria_id),
            "departamento": self._relation_vals(project.departamento_id),
            "responsavel": self._relation_vals(project.user_id),
            "etapa": self._relation_vals(project.sudo().stage_id),
            "stages": [{"id": s.id, "name": s.name, "fold": s.fold} for s in stages],
            "tasks": [self._task_vals(task) for task in tasks],
        }

    @http.route("/api/projetos", auth="user", type="http", methods=["GET"])
    def list_projects(self):
        arquivados = request.httprequest.args.get("arquivados", "").lower() in {"1", "true", "sim"}
        env = request.env["project.project"].with_context(active_test=False)
        domain = project_scope_domain(request.env.user) + [("active", "=", not arquivados)]
        projects = env.search(domain)
        return self._json(
            {
                "records": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "active": bool(p.active),
                        "created_at": p.create_date.isoformat() if p.create_date else False,
                        "updated_at": p.write_date.isoformat() if p.write_date else False,
                        "total_tasks": p.evoluta_total_tasks,
                        "done_tasks": p.evoluta_done_tasks,
                        "overdue_tasks": p.evoluta_overdue_tasks,
                        "orcamento": p.evoluta_orcamento,
                        "date_deadline": p.date.isoformat() if p.date else False,
                        "municipio": self._relation_vals(p.municipio_id),
                        "secretaria": self._relation_vals(p.secretaria_id),
                        "departamento": self._relation_vals(p.departamento_id),
                        "responsavel": self._relation_vals(p.user_id),
                        "etapa": self._relation_vals(p.sudo().stage_id),
                    }
                    for p in projects
                ]
            }
        )

    @http.route(
        "/api/projetos/<int:project_id>", auth="user", type="http", methods=["GET"]
    )
    def get_project(self, project_id):
        project = request.env["project.project"].with_context(active_test=False).browse(project_id)
        if not project.exists() or not project_in_scope(request.env.user, project):
            return self._json({"error": "Projeto não encontrado."}, status=404)
        return self._json({"record": self._project_vals(project)})

    @http.route("/api/projetos/<int:project_id>", auth="user", type="http", methods=["PATCH"])
    def update_project(self, project_id):
        user = request.env.user
        if user_role(user) not in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY}:
            return self._json({"error": "Seu perfil não pode editar projetos.", "code": "PERMISSION_DENIED"}, status=403)
        project = request.env["project.project"].with_context(active_test=False).browse(project_id)
        if not project.exists() or not project_in_scope(user, project):
            return self._json({"error": "Projeto não encontrado."}, status=404)
        dados = request.get_json_data() or {}
        valores = {}
        if "name" in dados:
            nome = self._texto(dados.get("name"))
            if not nome:
                return self._json({"error": "Informe o nome do projeto.", "field_errors": {"name": "Obrigatório."}}, status=400)
            valores["name"] = nome
        if "orcamento" in dados:
            try:
                orcamento = float(dados.get("orcamento") or 0.0)
            except (TypeError, ValueError):
                return self._json({"error": "Informe um orçamento válido.", "field_errors": {"orcamento": "Número inválido."}}, status=400)
            if not math.isfinite(orcamento) or orcamento < 0:
                return self._json({"error": "O orçamento não pode ser negativo.", "field_errors": {"orcamento": "Informe zero ou um valor positivo."}}, status=400)
            valores["evoluta_orcamento"] = orcamento
        if "date_deadline" in dados:
            valores["date"] = dados.get("date_deadline") or False
        if "active" in dados:
            valores["active"] = bool(dados.get("active"))

        ids = {}
        for campo in ("municipio_id", "secretaria_id", "departamento_id", "responsavel_id", "etapa_id"):
            if campo in dados:
                try:
                    ids[campo] = int(dados.get(campo) or 0)
                except (TypeError, ValueError):
                    return self._json({"error": "Os vínculos organizacionais informados são inválidos."}, status=400)

        municipio_id = ids.get("municipio_id", project.municipio_id.id)
        if not is_platform_admin(user):
            if not user.municipio_id:
                return self._json({"error": "Usuário sem município configurado."}, status=403)
            if municipio_id != user.municipio_id.id:
                return self._json({"error": "O projeto precisa pertencer ao município do usuário."}, status=403)
        municipio = request.env["evoluta.municipio"].browse(municipio_id).exists() if municipio_id else request.env["evoluta.municipio"]
        secretaria_id = ids.get("secretaria_id", project.secretaria_id.id)
        departamento_id = ids.get("departamento_id", project.departamento_id.id)
        responsavel_id = ids.get("responsavel_id", project.user_id.id)
        etapa_id = ids.get("etapa_id", project.sudo().stage_id.id)
        secretaria = request.env["evoluta.secretaria"].browse(secretaria_id).exists() if secretaria_id else request.env["evoluta.secretaria"]
        departamento = request.env["evoluta.departamento"].browse(departamento_id).exists() if departamento_id else request.env["evoluta.departamento"]
        if secretaria and (not municipio or secretaria.municipio_id != municipio):
            return self._json({"error": "A secretaria não pertence ao município do projeto."}, status=400)
        if departamento and (not secretaria or departamento.secretaria_id != secretaria):
            return self._json({"error": "O departamento não pertence à secretaria do projeto."}, status=400)
        if user_role(user) in {ROLE_SECRETARY, ROLE_ATTENDANT} and secretaria != user.secretaria_id:
            return self._json({"error": "Seu perfil só pode editar projetos da própria secretaria."}, status=403)
        responsavel = request.env["res.users"].sudo().browse(responsavel_id).exists() if responsavel_id else request.env["res.users"]
        if responsavel_id and (not responsavel or (municipio and responsavel.municipio_id != municipio)):
            return self._json({"error": "O responsável precisa pertencer ao município do projeto."}, status=400)
        etapa = request.env["project.project.stage"].sudo().browse(etapa_id).exists() if etapa_id else request.env["project.project.stage"]
        if "etapa_id" in ids and etapa_id and not etapa:
            return self._json({"error": "Etapa de projeto não encontrada."}, status=400)
        if "municipio_id" in ids:
            valores["municipio_id"] = municipio.id if municipio else False
        if "secretaria_id" in ids:
            valores["secretaria_id"] = secretaria.id if secretaria else False
        if "departamento_id" in ids:
            valores["departamento_id"] = departamento.id if departamento else False
        if "responsavel_id" in ids:
            valores["user_id"] = responsavel.id if responsavel else False
        try:
            if valores:
                project.write(valores)
            if "etapa_id" in ids:
                project.sudo().write({"stage_id": etapa.id if etapa else False})
            self._audit("update", "project.project", project, project=project)
            return self._json({"record": self._project_vals(project)})
        except AccessError as error:
            return self._json({"error": str(error), "code": "PERMISSION_DENIED"}, status=403)
        except (UserError, ValidationError, ValueError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/projetos/<int:project_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_project(self, project_id):
        user = request.env.user
        if user_role(user) not in {ROLE_PLATFORM, ROLE_ADMIN}:
            return self._json({"error": "Somente o administrador pode arquivar projetos.", "code": "PERMISSION_DENIED"}, status=403)
        project = request.env["project.project"].with_context(active_test=False).browse(project_id)
        if not project.exists() or not project_in_scope(user, project):
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            project.write({"active": False})
            self._audit("archive", "project.project", project, project=project)
            return self._json({"record": {"id": project.id, "active": False}})
        except AccessError as error:
            return self._json({"error": str(error), "code": "PERMISSION_DENIED"}, status=403)

    def _indicadores_municipais_vals(self):
        user = request.env.user
        projects = request.env["project.project"].search(project_scope_domain(user) + [("active", "=", True)])
        tasks = request.env["project.task"].search([("project_id", "in", projects.ids), ("active", "=", True)]) if projects else request.env["project.task"]
        done = tasks.filtered(lambda task: task.stage_id.fold)
        today = fields.Datetime.now()
        overdue = tasks.filtered(lambda task: task.date_deadline and task.date_deadline < today and not task.stage_id.fold)
        by_secretaria = {}
        for project in projects:
            key = project.secretaria_id.id if project.secretaria_id else 0
            item = by_secretaria.setdefault(key, {"secretaria_id": key or False, "secretaria_name": project.secretaria_id.name if project.secretaria_id else "Sem secretaria", "projetos": 0, "tasks": 0, "concluidas": 0, "atrasadas": 0})
            project_tasks = tasks.filtered(lambda task: task.project_id == project)
            item["projetos"] += 1
            item["tasks"] += len(project_tasks)
            item["concluidas"] += len(project_tasks.filtered(lambda task: task.stage_id.fold))
            item["atrasadas"] += len(project_tasks.filtered(lambda task: task.date_deadline and task.date_deadline < today and not task.stage_id.fold))
        chamado_total = chamado_aberto = 0
        try:
            chamados = request.env["helpdesk.ticket"].sudo().search([])
            chamados = chamados.filtered(lambda chamado: hasattr(chamado, "municipio_id") and (is_platform_admin(user) or chamado.municipio_id == user.municipio_id))
            chamado_total = len(chamados)
            chamado_aberto = len(chamados.filtered(lambda chamado: not chamado.closed))
        except KeyError:
            pass
        return {"municipio": {"id": user.municipio_id.id if user.municipio_id else False, "name": user.municipio_id.name if user.municipio_id else "Todos os municípios"}, "projetos": len(projects), "total_tasks": len(tasks), "done_tasks": len(done), "open_tasks": len(tasks) - len(done), "overdue_tasks": len(overdue), "taxa_conclusao": round((len(done) / len(tasks)) * 100, 2) if tasks else 0, "chamados": chamado_total, "chamados_abertos": chamado_aberto, "por_secretaria": list(by_secretaria.values())}

    @http.route("/api/indicadores", auth="user", type="http", methods=["GET"])
    def get_indicadores(self, project_id=None):
        project_id = self._inteiro(project_id or request.httprequest.args.get("project_id"))
        try:
            if not project_id:
                return self._json({"record": self._indicadores_municipais_vals()})
            project = request.env["project.project"].browse(project_id).exists()
            if not project or not project_in_scope(request.env.user, project):
                return self._json({"error": "Projeto não encontrado."}, status=404)
            return self._json({"record": self._indicadores_vals(project)})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar os indicadores."}, status=403)

    def _plan_vals(self, plan):
        return {
            "id": plan.id,
            "name": plan.name,
            "project_id": plan.project_id.id if plan.project_id else False,
            "what": plan.what,
            "why": plan.why or "",
            "where": plan.where or "",
            "date_deadline": plan.date_deadline.isoformat() if plan.date_deadline else False,
            "who_id": plan.who_id.id if plan.who_id else False,
            "who_name": plan.who_id.name if plan.who_id else "",
            "how": plan.how or "",
            "how_much": plan.how_much,
            "state": plan.state,
            "validation_status": plan.validation_status,
            "can_request_validation": bool(plan.state == "draft" and plan.need_validation and not plan.review_ids),
            "can_validate": bool(plan.state == "draft" and plan.can_review),
            "can_restart_validation": bool(plan.state == "draft" and plan.review_ids),
            "task_id": plan.task_id.id if plan.task_id else False,
            "reviews": [
                {"id": review.id, "name": review.name, "status": review.status, "can_review": review.can_review}
                for review in plan.review_ids
            ],
        }

    @http.route("/api/planos", auth="user", type="http", methods=["GET"])
    def list_plans(self, project_id=None):
        project_id = self._inteiro(project_id or request.httprequest.args.get("project_id"))
        if not project_id:
            return self._json({"error": "Informe o projeto para buscar os planos 5W2H."}, status=400)
        project = request.env["project.project"].browse(project_id).exists()
        if not project or not project_in_scope(request.env.user, project):
            return self._json({"error": "Projeto não encontrado."}, status=404)
        domain = [("project_id", "=", project_id), ("active", "=", True)]
        try:
            plans = request.env["evoluta.5w2h"].search(domain, order="id desc")
            return self._json({"records": [self._plan_vals(plan) for plan in plans]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar planos 5W2H."}, status=403)

    @http.route("/api/projeto-etapas", auth="user", type="http", methods=["GET"])
    def list_project_stages(self):
        stages = request.env["project.project.stage"].sudo().search([("active", "=", True)], order="sequence")
        return self._json({"records": [{"id": stage.id, "name": stage.name, "fold": stage.fold} for stage in stages]})

    @http.route("/api/projetos", auth="user", type="http", methods=["POST"])
    def create_project(self):
        dados = request.get_json_data() or {}
        nome = (dados.get("name") or "").strip()
        if not nome:
            return self._json({"error": "Informe o nome do projeto."}, status=400)
        user = request.env.user
        if user_role(user) not in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY}:
            return self._json({"error": "Seu perfil não pode criar projetos.", "code": "PERMISSION_DENIED"}, status=403)
        try:
            municipio_id = int(dados.get("municipio_id") or 0)
            secretaria_id = int(dados.get("secretaria_id") or 0)
            departamento_id = int(dados.get("departamento_id") or 0)
            responsavel_id = int(dados.get("responsavel_id") or 0)
            etapa_id = int(dados.get("etapa_id") or 0)
        except (TypeError, ValueError):
            return self._json({"error": "Os vínculos organizacionais informados são inválidos."}, status=400)

        if not is_platform_admin(user):
            if not user.municipio_id:
                return self._json({"error": "Usuário sem município configurado."}, status=403)
            if municipio_id and municipio_id != user.municipio_id.id:
                return self._json({"error": "O projeto precisa pertencer ao município do usuário."}, status=403)
            municipio_id = user.municipio_id.id
        municipio = request.env["evoluta.municipio"].browse(municipio_id).exists() if municipio_id else request.env["evoluta.municipio"]
        secretaria = request.env["evoluta.secretaria"].browse(secretaria_id).exists() if secretaria_id else request.env["evoluta.secretaria"]
        departamento = request.env["evoluta.departamento"].browse(departamento_id).exists() if departamento_id else request.env["evoluta.departamento"]
        if secretaria and (not municipio or secretaria.municipio_id != municipio):
            return self._json({"error": "A secretaria não pertence ao município do projeto."}, status=400)
        if departamento and (not secretaria or departamento.secretaria_id != secretaria):
            return self._json({"error": "O departamento não pertence à secretaria do projeto."}, status=400)
        if user_role(user) in {ROLE_SECRETARY, ROLE_ATTENDANT} and (not user.secretaria_id or secretaria != user.secretaria_id):
            return self._json({"error": "Seu perfil só pode criar projetos na própria secretaria."}, status=403)
        responsavel = request.env["res.users"].sudo().browse(responsavel_id).exists() if responsavel_id else request.env["res.users"]
        if responsavel_id and (not responsavel or (municipio and responsavel.municipio_id != municipio)):
            return self._json({"error": "O responsável precisa pertencer ao município do projeto."}, status=400)
        etapa = request.env["project.project.stage"].sudo().browse(etapa_id).exists() if etapa_id else request.env["project.project.stage"]
        if etapa_id and not etapa:
            return self._json({"error": "Etapa de projeto não encontrada."}, status=400)

        try:
            orcamento = float(dados.get("orcamento") or 0.0)
        except (TypeError, ValueError):
            return self._json({"error": "Informe um orçamento válido.", "field_errors": {"orcamento": "Número inválido."}}, status=400)
        if not math.isfinite(orcamento) or orcamento < 0:
            return self._json({"error": "O orçamento não pode ser negativo.", "field_errors": {"orcamento": "Informe zero ou um valor positivo."}}, status=400)

        valores = {
            "name": nome,
            "evoluta_orcamento": orcamento,
            "municipio_id": municipio.id if municipio else False,
            "secretaria_id": secretaria.id if secretaria else (user.secretaria_id.id if user.secretaria_id else False),
            "departamento_id": departamento.id if departamento else (user.departamento_id.id if user.departamento_id else False),
            "date": dados.get("date_deadline") or False,
        }
        if responsavel:
            valores["user_id"] = responsavel.id
        try:
            project = request.env["project.project"].create(valores)
            if etapa:
                project.sudo().write({"stage_id": etapa.id})
            self._audit("create", "project.project", project, project=project)
            return self._json({"record": {"id": project.id, "name": project.name}}, status=201)
        except AccessError as error:
            return self._json({"error": str(error), "code": "PERMISSION_DENIED"}, status=403)
        except (UserError, ValidationError, ValueError) as error:
            return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @http.route("/api/5w2h", auth="user", type="http", methods=["GET", "POST"])
    def create_plan(self, project_id=None):
        if request.httprequest.method == "GET":
            return self.list_plans(project_id=project_id or request.httprequest.args.get("project_id"))
        if user_role(request.env.user) not in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY}:
            return self._json({"error": "Seu perfil não pode criar planos 5W2H.", "code": "PERMISSION_DENIED"}, status=403)
        from odoo.exceptions import ValidationError

        dados = request.get_json_data() or {}
        try:
            project_id = int(dados.get("project_id") or 0)
        except (TypeError, ValueError):
            project_id = 0
        if not project_id or not (dados.get("what") or "").strip():
            return self._json({"error": "Projeto e What são obrigatórios."}, status=400)
        project = request.env["project.project"].browse(project_id).exists()
        if not project or not project_in_scope(request.env.user, project):
            return self._json({"error": "Projeto não encontrado."}, status=404)
        try:
            who_id = int(dados.get("who_id") or 0)
        except (TypeError, ValueError):
            who_id = 0
        who = request.env["res.users"].sudo().browse(who_id).exists() if who_id else request.env["res.users"]
        if who_id and not who:
            return self._json({"error": "Responsável não encontrado."}, status=400)
        if who_id and project.municipio_id and who.municipio_id != project.municipio_id:
            return self._json({"error": "O responsável precisa pertencer ao mesmo município do projeto."}, status=400)
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
                        "who_id": who.id if who else False,
                        "how": dados.get("how") or "",
                        "how_much": dados.get("how_much") or 0.0,
                    }
                )
            )
        except ValidationError as err:
            return self._json({"error": str(err)}, status=400)
        self._audit("create", "evoluta.5w2h", plan, project=project)
        return self._json({"record": self._plan_vals(plan)}, status=201)

    @http.route("/api/5w2h/<int:plan_id>", auth="user", type="http", methods=["PATCH"])
    def update_plan(self, plan_id):
        plan, response = self._plan_for_action(plan_id)
        if response:
            return response
        if plan.state != "draft":
            return self._json({"error": "Somente planos em rascunho podem ser editados."}, status=400)
        dados = request.get_json_data() or {}
        valores = {}
        if "name" in dados:
            valores["name"] = self._texto(dados.get("name")) or "Novo plano 5W2H"
        if "what" in dados:
            what = self._texto(dados.get("what"))
            if not what:
                return self._json({"error": "O campo What é obrigatório."}, status=400)
            valores["what"] = what
        for campo in ("why", "where", "how"):
            if campo in dados:
                valores[campo] = dados.get(campo) or ""
        if "date_deadline" in dados:
            valores["date_deadline"] = dados.get("date_deadline") or False
        if "how_much" in dados:
            try:
                valores["how_much"] = float(dados.get("how_much") or 0.0)
            except (TypeError, ValueError):
                return self._json({"error": "Informe um valor válido para How much."}, status=400)
        if "who_id" in dados:
            who_id = self._inteiro(dados.get("who_id"))
            who = request.env["res.users"].sudo().browse(who_id).exists() if who_id else request.env["res.users"]
            if who_id and (not who or (plan.project_id.municipio_id and who.municipio_id != plan.project_id.municipio_id)):
                return self._json({"error": "O responsável precisa pertencer ao mesmo município do projeto."}, status=400)
            valores["who_id"] = who.id if who else False
        try:
            if valores:
                plan.write(valores)
            self._audit("update", "evoluta.5w2h", plan, project=plan.project_id)
            return self._json({"record": self._plan_vals(plan)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/5w2h/<int:plan_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_plan(self, plan_id):
        plan, response = self._plan_for_action(plan_id)
        if response:
            return response
        try:
            plan.write({"active": False})
            self._audit("archive", "evoluta.5w2h", plan, project=plan.project_id)
            return self._json({"record": {"id": plan.id, "active": False}})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    def _plan_for_action(self, plan_id: int) -> tuple[Any, Response | None]:
        plan = request.env["evoluta.5w2h"].browse(plan_id).exists()
        if not plan or not project_in_scope(request.env.user, plan.project_id):
            return None, self._json({"error": "Plano 5W2H não encontrado."}, status=404)
        return plan, None

    @http.route("/api/5w2h/<int:plan_id>/solicitar-validacao", auth="user", type="http", methods=["POST"])
    def request_plan_validation(self, plan_id):
        plan, response = self._plan_for_action(plan_id)
        if response:
            return response
        try:
            plan.request_validation()
            self._audit("workflow", "evoluta.5w2h", plan, project=plan.project_id, details="Validação solicitada")
            return self._json({"record": self._plan_vals(plan)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/5w2h/<int:plan_id>/aprovar", auth="user", type="http", methods=["POST"])
    def approve_plan(self, plan_id):
        plan, response = self._plan_for_action(plan_id)
        if response:
            return response
        try:
            action = plan.validate_tier()
            self._audit("workflow", "evoluta.5w2h", plan, project=plan.project_id, details="Validação aprovada")
            if isinstance(action, dict) and action.get("res_model") == "comment.wizard":
                return self._json({"error": "Odoo exige um comentário para concluir esta aprovação."}, status=400)
            return self._json({"record": self._plan_vals(plan)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/5w2h/<int:plan_id>/reiniciar-validacao", auth="user", type="http", methods=["POST"])
    def restart_plan_validation(self, plan_id):
        plan, response = self._plan_for_action(plan_id)
        if response:
            return response
        try:
            plan.restart_validation()
            return self._json({"record": self._plan_vals(plan)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/5w2h/<int:plan_id>/gerar-task", auth="user", type="http", methods=["POST"])
    def generate_plan_task(self, plan_id):
        plan, response = self._plan_for_action(plan_id)
        if response:
            return response
        try:
            plan.action_create_task()
            return self._json({"record": self._plan_vals(plan)})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    def _task_for_action(self, task_id):
        task = request.env["project.task"].browse(task_id).exists()
        if not task or not project_in_scope(request.env.user, task.project_id):
            return None, self._json({"error": "Task não encontrada."}, status=404)
        if user_role(request.env.user) == ROLE_ATTENDANT and request.env.user not in task.user_ids:
            return None, self._json({"error": "Você só pode operar tasks atribuídas a você.", "code": "PERMISSION_DENIED"}, status=403)
        return task, None

    def _stage_for_project(self, project, stage_id):
        stage = request.env["project.task.type"].browse(stage_id).exists()
        if not stage or project not in stage.project_ids:
            return None
        return stage

    @http.route("/api/projetos/<int:project_id>/tasks", auth="user", type="http", methods=["GET"])
    def list_project_tasks(self, project_id):
        project = request.env["project.project"].browse(project_id).exists()
        if not project or not project_in_scope(request.env.user, project):
            return self._json({"error": "Projeto não encontrado."}, status=404)
        tasks = request.env["project.task"].search([("project_id", "=", project.id), ("active", "=", True)], order="priority desc, sequence, id")
        if user_role(request.env.user) == ROLE_ATTENDANT:
            tasks = tasks.filtered(lambda task: request.env.user in task.user_ids)
        return self._json({"records": [self._task_vals(task) for task in tasks]})

    @http.route("/api/tasks", auth="user", type="http", methods=["POST"])
    def create_task(self):
        user = request.env.user
        if user_role(user) not in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY}:
            return self._json({"error": "Seu perfil não pode criar tasks.", "code": "PERMISSION_DENIED"}, status=403)
        dados = request.get_json_data() or {}
        name = self._texto(dados.get("name"))
        project_id = self._inteiro(dados.get("project_id"))
        if not name or not project_id:
            return self._json({"error": "Projeto e nome da task são obrigatórios."}, status=400)
        project = request.env["project.project"].browse(project_id).exists()
        if not project or not project_in_scope(user, project):
            return self._json({"error": "Projeto não encontrado."}, status=404)
        stage_id = self._inteiro(dados.get("stage_id"))
        stage = self._stage_for_project(project, stage_id) if stage_id else None
        if stage_id and not stage:
            return self._json({"error": "A etapa não pertence ao projeto."}, status=400)
        responsavel_id = self._inteiro(dados.get("responsavel_id"))
        responsavel = request.env["res.users"].sudo().browse(responsavel_id).exists() if responsavel_id else request.env["res.users"]
        if responsavel_id and (not responsavel or responsavel.municipio_id != project.municipio_id):
            return self._json({"error": "O responsável precisa pertencer ao município do projeto."}, status=400)
        valores = {"name": name, "project_id": project.id, "date_deadline": dados.get("date_deadline") or False}
        if stage:
            valores["stage_id"] = stage.id
        if responsavel:
            valores["user_ids"] = [(6, 0, [responsavel.id])]
        try:
            task = request.env["project.task"].create(valores)
            self._audit("create", "project.task", task, project=project)
            return self._json({"record": self._task_vals(task)}, status=201)
        except (AccessError, UserError, ValidationError, ValueError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/tasks/<int:task_id>", auth="user", type="http", methods=["GET"])
    def get_task(self, task_id):
        task, response = self._task_for_action(task_id)
        if response:
            return response
        return self._json({"record": self._task_vals(task)})

    @http.route("/api/tasks/<int:task_id>", auth="user", type="http", methods=["PATCH"])
    def update_task(self, task_id):
        task, response = self._task_for_action(task_id)
        if response:
            return response
        if user_role(request.env.user) not in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY}:
            return self._json({"error": "Seu perfil não pode editar tasks.", "code": "PERMISSION_DENIED"}, status=403)
        dados = request.get_json_data() or {}
        valores = {}
        if "name" in dados:
            name = self._texto(dados.get("name"))
            if not name:
                return self._json({"error": "Informe o nome da task."}, status=400)
            valores["name"] = name
        if "date_deadline" in dados:
            valores["date_deadline"] = dados.get("date_deadline") or False
        if "stage_id" in dados:
            stage = self._stage_for_project(task.project_id, self._inteiro(dados.get("stage_id")))
            if not stage:
                return self._json({"error": "A etapa não pertence ao projeto."}, status=400)
            valores["stage_id"] = stage.id
        if "responsavel_id" in dados:
            responsavel_id = self._inteiro(dados.get("responsavel_id"))
            responsavel = request.env["res.users"].sudo().browse(responsavel_id).exists() if responsavel_id else request.env["res.users"]
            if responsavel_id and (not responsavel or responsavel.municipio_id != task.project_id.municipio_id):
                return self._json({"error": "O responsável precisa pertencer ao município do projeto."}, status=400)
            valores["user_ids"] = [(6, 0, [responsavel.id] if responsavel else [])]
        try:
            if valores:
                task.write(valores)
            self._audit("update", "project.task", task, project=task.project_id)
            return self._json({"record": self._task_vals(task)})
        except (AccessError, UserError, ValidationError, ValueError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/tasks/<int:task_id>/concluir", auth="user", type="http", methods=["POST"])
    def complete_task(self, task_id):
        task, response = self._task_for_action(task_id)
        if response:
            return response
        if user_role(request.env.user) not in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY}:
            return self._json({"error": "Seu perfil não pode concluir tasks.", "code": "PERMISSION_DENIED"}, status=403)
        stage = request.env["project.task.type"].search([("project_ids", "in", task.project_id.id), ("fold", "=", True)], order="sequence desc", limit=1)
        if not stage:
            return self._json({"error": "O projeto não possui uma etapa concluída configurada."}, status=400)
        task.with_context(skip_5w2h_sync=True).write({"stage_id": stage.id})
        self._audit("workflow", "project.task", task, project=task.project_id, details="Task concluída")
        return self._json({"record": self._task_vals(task)})

    @http.route("/api/tasks/<int:task_id>/arquivar", auth="user", type="http", methods=["POST"])
    def archive_task(self, task_id):
        task, response = self._task_for_action(task_id)
        if response:
            return response
        if user_role(request.env.user) not in {ROLE_PLATFORM, ROLE_ADMIN}:
            return self._json({"error": "Somente o administrador pode arquivar tasks.", "code": "PERMISSION_DENIED"}, status=403)
        task.write({"active": False})
        self._audit("archive", "project.task", task, project=task.project_id)
        return self._json({"record": {"id": task.id, "active": False}})

    def _activity_vals(self, activity):
        return {
            "id": activity.id,
            "project_id": activity.res_id if activity.res_model == "project.project" else False,
            "summary": activity.summary or "",
            "note": activity.note or "",
            "date_deadline": activity.date_deadline.isoformat() if activity.date_deadline else False,
            "activity_type": self._relation_vals(activity.activity_type_id),
            "responsavel": self._relation_vals(activity.user_id),
            "done": False,
        }

    def _project_for_activity(self, project_id):
        project = request.env["project.project"].browse(project_id).exists()
        if not project or not project_in_scope(request.env.user, project):
            return None, self._json({"error": "Projeto não encontrado."}, status=404)
        return project, None

    @http.route("/api/atividades", auth="user", type="http", methods=["GET"])
    def list_activities(self, project_id=None):
        project_id = self._inteiro(project_id or request.httprequest.args.get("project_id"))
        if not project_id:
            return self._json({"error": "Informe o projeto para buscar as atividades."}, status=400)
        project, response = self._project_for_activity(project_id)
        if response:
            return response
        activities = request.env["mail.activity"].search([("res_model", "=", "project.project"), ("res_id", "=", project.id)], order="date_deadline, id")
        return self._json({"records": [self._activity_vals(activity) for activity in activities]})

    @http.route("/api/atividades", auth="user", type="http", methods=["POST"])
    def create_activity(self):
        dados = request.get_json_data() or {}
        project_id = self._inteiro(dados.get("project_id"))
        summary = self._texto(dados.get("summary"))
        if not project_id or not summary or not dados.get("date_deadline"):
            return self._json({"error": "Projeto, resumo e prazo da atividade são obrigatórios."}, status=400)
        project, response = self._project_for_activity(project_id)
        if response:
            return response
        activity_type_id = self._inteiro(dados.get("activity_type_id"))
        activity_type = request.env["mail.activity.type"].browse(activity_type_id).exists() if activity_type_id else request.env["mail.activity.type"].search([], limit=1)
        if not activity_type:
            return self._json({"error": "Nenhum tipo de atividade está configurado no Odoo."}, status=400)
        responsavel_id = self._inteiro(dados.get("responsavel_id")) or request.env.user.id
        responsavel = request.env["res.users"].sudo().browse(responsavel_id).exists()
        if not responsavel or (project.municipio_id and responsavel.municipio_id != project.municipio_id):
            return self._json({"error": "O responsável precisa pertencer ao município do projeto."}, status=400)
        try:
            activity = request.env["mail.activity"].create({
                "activity_type_id": activity_type.id,
                "res_model_id": request.env["ir.model"]._get_id("project.project"),
                "res_id": project.id,
                "summary": summary,
                "note": dados.get("note") or False,
                "date_deadline": dados.get("date_deadline"),
                "user_id": responsavel.id,
            })
            return self._json({"record": self._activity_vals(activity)}, status=201)
        except (AccessError, UserError, ValidationError, ValueError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/atividades/<int:activity_id>", auth="user", type="http", methods=["PATCH"])
    def update_activity(self, activity_id):
        activity = request.env["mail.activity"].browse(activity_id).exists()
        project_id = activity.res_id if activity and activity.res_model == "project.project" else 0
        project, response = self._project_for_activity(project_id)
        if response:
            return response
        dados = request.get_json_data() or {}
        valores = {}
        if "summary" in dados:
            summary = self._texto(dados.get("summary"))
            if not summary:
                return self._json({"error": "Informe o resumo da atividade."}, status=400)
            valores["summary"] = summary
        if "note" in dados:
            valores["note"] = dados.get("note") or False
        if "date_deadline" in dados:
            valores["date_deadline"] = dados.get("date_deadline") or False
        if "responsavel_id" in dados:
            responsavel = request.env["res.users"].sudo().browse(self._inteiro(dados.get("responsavel_id"))).exists()
            if not responsavel or (project.municipio_id and responsavel.municipio_id != project.municipio_id):
                return self._json({"error": "O responsável precisa pertencer ao município do projeto."}, status=400)
            valores["user_id"] = responsavel.id
        try:
            if valores:
                activity.write(valores)
            return self._json({"record": self._activity_vals(activity)})
        except (AccessError, UserError, ValidationError, ValueError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/atividades/<int:activity_id>/concluir", auth="user", type="http", methods=["POST"])
    def complete_activity(self, activity_id):
        activity = request.env["mail.activity"].browse(activity_id).exists()
        project_id = activity.res_id if activity and activity.res_model == "project.project" else 0
        _, response = self._project_for_activity(project_id)
        if response:
            return response
        try:
            activity.action_feedback()
            return self._json({"record": {"id": activity_id, "done": True}})
        except (AccessError, UserError, ValidationError) as error:
            return self._json({"error": str(error)}, status=403 if isinstance(error, AccessError) else 400)

    @http.route("/api/agenda", auth="user", type="http", methods=["GET"])
    def list_agenda(self):
        inicio = request.httprequest.args.get("from") or "0001-01-01"
        fim = request.httprequest.args.get("to") or "9999-12-31"
        projects = request.env["project.project"].search(project_scope_domain(request.env.user) + [("active", "=", True), ("date", ">=", inicio), ("date", "<=", fim)])
        records = [{"id": f"project-{project.id}", "kind": "project_deadline", "date": project.date.isoformat(), "title": "Prazo final do projeto", "project_id": project.id, "project_name": project.name} for project in projects if project.date]
        activities = request.env["mail.activity"].search([("res_model", "=", "project.project"), ("date_deadline", ">=", inicio), ("date_deadline", "<=", fim)], order="date_deadline, id")
        for activity in activities:
            project = request.env["project.project"].browse(activity.res_id).exists() if activity.res_id else request.env["project.project"]
            if project and project_in_scope(request.env.user, project):
                records.append({"id": f"activity-{activity.id}", "kind": "activity", "date": activity.date_deadline.isoformat(), "title": activity.summary or activity.activity_type_id.name, "project_id": project.id, "project_name": project.name})
        records.sort(key=lambda item: (item["date"], item["id"]))
        return self._json({"records": records})

    @http.route(
        "/api/tasks/<int:task_id>/mover",
        auth="user",
        type="http",
        methods=["POST"],
    )
    def move_task(self, task_id):
        dados = request.get_json_data() or {}
        try:
            stage_id = int(dados.get("stage_id") or 0)
        except (TypeError, ValueError):
            stage_id = 0
        task, response = self._task_for_action(task_id)
        if response:
            return response
        stage = self._stage_for_project(task.project_id, stage_id)
        if not stage:
            return self._json({"error": "A etapa não pertence ao projeto da task."}, status=400)
        task.with_context(skip_5w2h_sync=True).write({"stage_id": stage.id})
        self._audit("workflow", "project.task", task, project=task.project_id, details=f"Task movida para {stage.name}")
        return self._json({"record": {"id": task.id, "stage_id": stage.id}})
