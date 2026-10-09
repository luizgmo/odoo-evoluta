import base64
import binascii
import html
import json

from odoo import fields, http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request

from .audit_helpers import registrar_auditoria
from .scope import (
    ROLE_ADMIN,
    ROLE_ATTENDANT,
    ROLE_PLATFORM,
    ROLE_SECRETARY,
    is_platform_admin,
    user_role,
)


class EvolutaTicketsApi(http.Controller):
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

    def _error(self, error):
        if isinstance(error, AccessError):
            return self._json({"error": "Você não tem permissão para executar este ato.", "code": "PERMISSION_DENIED"}, status=403)
        return self._json({"error": str(error), "code": "VALIDATION_ERROR"}, status=400)

    @staticmethod
    def _situacao(record):
        if not record.stage_id:
            return "Aberto", "open"
        nome = record.stage_id.name or "Aberto"
        normalizado = nome.casefold()
        if record.stage_id.closed:
            return nome, "done" if normalizado in {"done", "concluído", "concluido", "closed", "fechado"} else "closed"
        if normalizado in {"new", "novo", "aberto", "open"}:
            return nome, "open"
        if normalizado in {"in progress", "em andamento", "andamento"}:
            return nome, "in_progress"
        return nome, "open"

    @staticmethod
    def _sla_status(record):
        if record.sla_expired:
            return "atrasado"
        if not record.sla_deadline:
            return "sem_prazo"
        return "no_prazo" if record.sla_fits else "atrasado"

    @staticmethod
    def _relation(record):
        return {"id": record.id, "name": record.name} if record else None

    def _ticket_vals(self, record, include_chatter=False):
        situacao, situacao_key = self._situacao(record)
        valores = {
            "id": record.id,
            "codigo": record.number or f"HT{record.id:05d}",
            "titulo": record.name,
            "descricao": record.description or "",
            "situacao": situacao,
            "situacao_key": situacao_key,
            "prioridade": {"0": "baixa", "1": "normal", "2": "alta", "3": "muito_alta"}.get(record.priority, "normal"),
            "prioridade_label": {"0": "Baixa", "1": "Normal", "2": "Alta", "3": "Muito alta"}.get(record.priority, "Normal"),
            "prazo": fields.Datetime.to_string(record.sla_deadline) if record.sla_deadline else False,
            "sla_status": self._sla_status(record),
            "equipe_id": record.team_id.id if record.team_id else False,
            "equipe_nome": record.team_id.name if record.team_id else "",
            "estagio_id": record.stage_id.id if record.stage_id else False,
            "estagio_nome": record.stage_id.name if record.stage_id else "",
            "responsavel": self._relation(record.user_id),
            "municipio": self._relation(record.municipio_id),
            "secretaria": self._relation(record.secretaria_id),
            "departamento": self._relation(record.departamento_id),
            "anexos": [self._attachment_vals(attachment) for attachment in record.attachment_ids],
        }
        if include_chatter:
            valores["comentarios"] = [self._message_vals(message) for message in record.message_ids.sorted(key=lambda item: item.date or fields.Datetime.now()) if message.message_type == "comment"]
        return valores

    @staticmethod
    def _attachment_vals(attachment):
        return {
            "id": attachment.id,
            "name": attachment.name,
            "mimetype": attachment.mimetype or "application/octet-stream",
            "size": attachment.file_size or 0,
            "url": f"/api/chamados/anexos/{attachment.id}/download",
        }

    @staticmethod
    def _message_vals(message):
        return {
            "id": message.id,
            "author": message.author_id.name if message.author_id else "Sistema",
            "date": fields.Datetime.to_string(message.date) if message.date else False,
            "body": message.body or "",
            "anexos": [EvolutaTicketsApi._attachment_vals(attachment) for attachment in message.attachment_ids],
        }

    def _ticket_in_scope(self, ticket):
        user = request.env.user
        if is_platform_admin(user):
            return True
        if not user.municipio_id or ticket.municipio_id != user.municipio_id:
            return False
        role = user_role(user)
        if role in {ROLE_SECRETARY, ROLE_ATTENDANT}:
            if not user.secretaria_id or (ticket.secretaria_id and ticket.secretaria_id != user.secretaria_id):
                return False
        if role == ROLE_ATTENDANT:
            if not user.departamento_id or (ticket.departamento_id and ticket.departamento_id != user.departamento_id):
                return False
        return True

    def _ticket(self, ticket_id):
        ticket = request.env["helpdesk.ticket"].sudo().browse(ticket_id).exists()
        if not ticket or not self._ticket_in_scope(ticket):
            return None, self._json({"error": "Chamado não encontrado."}, status=404)
        return ticket, None

    def _organization(self, data, current_user, existing=None):
        municipio_id = self._int(data.get("municipio_id")) if "municipio_id" in data else (existing.municipio_id.id if existing else 0)
        secretaria_id = self._int(data.get("secretaria_id")) if "secretaria_id" in data else (existing.secretaria_id.id if existing else 0)
        departamento_id = self._int(data.get("departamento_id")) if "departamento_id" in data else (existing.departamento_id.id if existing else 0)
        if not is_platform_admin(current_user):
            if not current_user.municipio_id:
                raise ValidationError("Usuário sem município configurado.")
            if municipio_id and municipio_id != current_user.municipio_id.id:
                raise AccessError("O chamado precisa pertencer ao município do usuário.")
            municipio_id = current_user.municipio_id.id
            if user_role(current_user) in {ROLE_SECRETARY, ROLE_ATTENDANT}:
                if secretaria_id and secretaria_id != current_user.secretaria_id.id:
                    raise AccessError("Seu perfil só pode operar chamados da própria secretaria.")
                secretaria_id = current_user.secretaria_id.id
            if user_role(current_user) == ROLE_ATTENDANT:
                if departamento_id and departamento_id != current_user.departamento_id.id:
                    raise AccessError("Seu perfil só pode operar chamados do próprio departamento.")
                departamento_id = current_user.departamento_id.id
        municipio = request.env["evoluta.municipio"].sudo().browse(municipio_id).exists() if municipio_id else request.env["evoluta.municipio"]
        secretaria = request.env["evoluta.secretaria"].sudo().browse(secretaria_id).exists() if secretaria_id else request.env["evoluta.secretaria"]
        departamento = request.env["evoluta.departamento"].sudo().browse(departamento_id).exists() if departamento_id else request.env["evoluta.departamento"]
        if secretaria and (not municipio or secretaria.municipio_id != municipio):
            raise ValidationError("A secretaria não pertence ao município do chamado.")
        if departamento and (not secretaria or departamento.secretaria_id != secretaria):
            raise ValidationError("O departamento não pertence à secretaria do chamado.")
        return municipio, secretaria, departamento

    def _validate_assignee(self, data, team_id, municipio):
        if "responsavel_id" not in data:
            return None
        responsavel_id = self._int(data.get("responsavel_id"))
        responsavel = request.env["res.users"].sudo().browse(responsavel_id).exists() if responsavel_id else request.env["res.users"]
        if responsavel_id and (not responsavel or (municipio and responsavel.municipio_id != municipio)):
            raise ValidationError("O responsável precisa pertencer ao mesmo município do chamado.")
        if responsavel and team_id and responsavel not in request.env["helpdesk.ticket.team"].sudo().browse(team_id).user_ids:
            raise ValidationError("O responsável precisa fazer parte da equipe selecionada.")
        return responsavel

    @http.route("/api/chamados", auth="user", type="http", methods=["GET"])
    def list_tickets(self):
        try:
            records = request.env["helpdesk.ticket"].sudo().search([("active", "=", True)], order="id desc")
            return self._json({"records": [self._ticket_vals(record) for record in records if self._ticket_in_scope(record)]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar chamados."}, status=403)

    @http.route("/api/chamados/equipes", auth="user", type="http", methods=["GET"])
    def list_ticket_teams(self):
        try:
            records = request.env["helpdesk.ticket.team"].sudo().search([("active", "=", True)], order="sequence, name")
            return self._json({"records": [{"id": record.id, "name": record.name, "use_sla": record.use_sla} for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar equipes de chamados."}, status=403)

    @http.route("/api/chamados/estagios", auth="user", type="http", methods=["GET"])
    def list_ticket_stages(self, team_id=None):
        domain = [("active", "=", True)]
        team_id = self._int(team_id or request.httprequest.args.get("team_id"))
        if team_id:
            domain += ["|", ("team_ids", "=", False), ("team_ids", "=", team_id)]
        stages = request.env["helpdesk.ticket.stage"].sudo().search(domain, order="sequence, id")
        return self._json({"records": [{"id": stage.id, "name": stage.name, "closed": stage.closed, "fold": stage.fold} for stage in stages]})

    @http.route("/api/chamados", auth="user", type="http", methods=["POST"])
    def create_ticket(self):
        data = request.get_json_data() or {}
        titulo = self._text(data.get("titulo"))
        descricao = self._text(data.get("descricao"))
        if not titulo:
            return self._json({"error": "Informe o título do chamado."}, status=400)
        if not descricao:
            return self._json({"error": "Informe a descrição do chamado."}, status=400)
        try:
            municipio, secretaria, departamento = self._organization(data, request.env.user)
            team_id = self._int(data.get("team_id"))
            team = request.env["helpdesk.ticket.team"].sudo().browse(team_id).exists() if team_id else request.env["helpdesk.ticket.team"]
            if team_id and not team:
                raise ValidationError("Equipe de chamados não encontrada.")
            responsavel = self._validate_assignee(data, team.id if team else 0, municipio)
            valores = {"name": titulo, "description": html.escape(descricao).replace("\n", "<br/>"), "municipio_id": municipio.id if municipio else False, "secretaria_id": secretaria.id if secretaria else False, "departamento_id": departamento.id if departamento else False}
            if team:
                valores["team_id"] = team.id
            if "prioridade" in data:
                prioridade = str(data.get("prioridade"))
                if prioridade not in {"0", "1", "2", "3"}:
                    raise ValidationError("Prioridade inválida.")
                valores["priority"] = prioridade
            if responsavel:
                valores["user_id"] = responsavel.id
            record = request.env["helpdesk.ticket"].sudo().create(valores)
            registrar_auditoria("create", "helpdesk.ticket", record)
            return self._json({"record": self._ticket_vals(record, include_chatter=True)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/chamados/<int:ticket_id>", auth="user", type="http", methods=["GET"])
    def get_ticket(self, ticket_id):
        ticket, response = self._ticket(ticket_id)
        if response:
            return response
        return self._json({"record": self._ticket_vals(ticket, include_chatter=True)})

    @http.route("/api/chamados/<int:ticket_id>", auth="user", type="http", methods=["PATCH"])
    def update_ticket(self, ticket_id):
        ticket, response = self._ticket(ticket_id)
        if response:
            return response
        if user_role(request.env.user) == ROLE_ATTENDANT:
            return self._json({"error": "Seu perfil não pode editar chamados.", "code": "PERMISSION_DENIED"}, status=403)
        data = request.get_json_data() or {}
        try:
            municipio, secretaria, departamento = self._organization(data, request.env.user, existing=ticket)
            team_id = self._int(data.get("team_id")) if "team_id" in data else (ticket.team_id.id if ticket.team_id else 0)
            team = request.env["helpdesk.ticket.team"].sudo().browse(team_id).exists() if team_id else request.env["helpdesk.ticket.team"]
            if "team_id" in data and team_id and not team:
                raise ValidationError("Equipe de chamados não encontrada.")
            responsavel = self._validate_assignee(data, team.id if team else 0, municipio)
            valores = {"municipio_id": municipio.id if municipio else False, "secretaria_id": secretaria.id if secretaria else False, "departamento_id": departamento.id if departamento else False}
            if "titulo" in data:
                titulo = self._text(data.get("titulo"))
                if not titulo:
                    raise ValidationError("Informe o título do chamado.")
                valores["name"] = titulo
            if "descricao" in data:
                descricao = self._text(data.get("descricao"))
                if not descricao:
                    raise ValidationError("Informe a descrição do chamado.")
                valores["description"] = html.escape(descricao).replace("\n", "<br/>")
            if "prioridade" in data:
                prioridade = str(data.get("prioridade"))
                if prioridade not in {"0", "1", "2", "3"}:
                    raise ValidationError("Prioridade inválida.")
                valores["priority"] = prioridade
            if "team_id" in data:
                valores["team_id"] = team.id if team else False
            if "responsavel_id" in data:
                valores["user_id"] = responsavel.id if responsavel else False
            ticket.write(valores)
            registrar_auditoria("update", "helpdesk.ticket", ticket)
            return self._json({"record": self._ticket_vals(ticket, include_chatter=True)})
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/chamados/<int:ticket_id>/atribuir", auth="user", type="http", methods=["POST"])
    def assign_ticket(self, ticket_id):
        ticket, response = self._ticket(ticket_id)
        if response:
            return response
        if user_role(request.env.user) == ROLE_ATTENDANT:
            return self._json({"error": "Seu perfil não pode atribuir chamados.", "code": "PERMISSION_DENIED"}, status=403)
        data = request.get_json_data() or {}
        try:
            team_id = self._int(data.get("team_id")) if "team_id" in data else (ticket.team_id.id if ticket.team_id else 0)
            team = request.env["helpdesk.ticket.team"].sudo().browse(team_id).exists() if team_id else request.env["helpdesk.ticket.team"]
            if team_id and not team:
                raise ValidationError("Equipe de chamados não encontrada.")
            responsavel = self._validate_assignee(data, team.id if team else 0, ticket.municipio_id)
            responsavel_atual_id = ticket.user_id.id if ticket.user_id else False
            equipe_atual_id = ticket.team_id.id if ticket.team_id else False
            equipe_solicitada_id = team.id if team else False
            valores = {}
            equipe_mudou = "team_id" in data and equipe_solicitada_id != equipe_atual_id
            if equipe_mudou:
                valores["team_id"] = equipe_solicitada_id
            if "responsavel_id" in data:
                valores["user_id"] = responsavel.id if responsavel else False
            elif equipe_mudou:
                valores["user_id"] = responsavel_atual_id if responsavel_atual_id and responsavel_atual_id in team.user_ids.ids else False
            if valores:
                ticket.write(valores)
            registrar_auditoria("update", "helpdesk.ticket", ticket, details="Equipe ou responsável atualizado")
            return self._json({"record": self._ticket_vals(ticket, include_chatter=True)})
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/chamados/<int:ticket_id>/mover", auth="user", type="http", methods=["POST"])
    def move_ticket(self, ticket_id):
        ticket, response = self._ticket(ticket_id)
        if response:
            return response
        if user_role(request.env.user) == ROLE_ATTENDANT:
            return self._json({"error": "Seu perfil não pode mover chamados.", "code": "PERMISSION_DENIED"}, status=403)
        stage_id = self._int((request.get_json_data() or {}).get("stage_id"))
        stage = request.env["helpdesk.ticket.stage"].sudo().browse(stage_id).exists()
        if not stage or (ticket.team_id and stage.team_ids and ticket.team_id not in stage.team_ids):
            return self._json({"error": "O estágio não está disponível para este chamado."}, status=400)
        try:
            ticket.write({"stage_id": stage.id})
            registrar_auditoria("workflow", "helpdesk.ticket", ticket, details=f"Chamado movido para {stage.name}")
            return self._json({"record": self._ticket_vals(ticket, include_chatter=True)})
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/chamados/<int:ticket_id>/concluir", auth="user", type="http", methods=["POST"])
    def complete_ticket(self, ticket_id):
        ticket, response = self._ticket(ticket_id)
        if response:
            return response
        if user_role(request.env.user) == ROLE_ATTENDANT:
            return self._json({"error": "Seu perfil não pode concluir chamados.", "code": "PERMISSION_DENIED"}, status=403)
        stage = request.env["helpdesk.ticket.stage"].sudo().search([("active", "=", True), ("closed", "=", True), "|", ("team_ids", "=", False), ("team_ids", "=", ticket.team_id.id if ticket.team_id else 0)], order="sequence desc, id desc", limit=1)
        if not stage:
            return self._json({"error": "Nenhum estágio de conclusão está configurado."}, status=400)
        try:
            ticket.write({"stage_id": stage.id})
            registrar_auditoria("workflow", "helpdesk.ticket", ticket, details="Chamado concluído")
            return self._json({"record": self._ticket_vals(ticket, include_chatter=True)})
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/chamados/<int:ticket_id>/comentarios", auth="user", type="http", methods=["POST"])
    def add_comment(self, ticket_id):
        ticket, response = self._ticket(ticket_id)
        if response:
            return response
        body = self._text((request.get_json_data() or {}).get("body"))
        if not body:
            return self._json({"error": "Informe o comentário."}, status=400)
        try:
            ticket.message_post(body=html.escape(body).replace("\n", "<br/>"), message_type="comment", subtype_xmlid="mail.mt_comment")
            registrar_auditoria("update", "helpdesk.ticket", ticket, details="Comentário adicionado")
            return self._json({"record": self._ticket_vals(ticket, include_chatter=True)})
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/chamados/<int:ticket_id>/anexos", auth="user", type="http", methods=["POST"])
    def add_attachment(self, ticket_id):
        ticket, response = self._ticket(ticket_id)
        if response:
            return response
        data = request.get_json_data() or {}
        name = self._text(data.get("name"))
        encoded = data.get("data")
        if not name or not isinstance(encoded, str):
            return self._json({"error": "Nome e conteúdo do anexo são obrigatórios."}, status=400)
        try:
            raw = base64.b64decode(encoded, validate=True)
        except (ValueError, binascii.Error):
            return self._json({"error": "O conteúdo do anexo não é um Base64 válido."}, status=400)
        if len(raw) > 10 * 1024 * 1024:
            return self._json({"error": "O anexo não pode ultrapassar 10 MB."}, status=400)
        try:
            attachment = request.env["ir.attachment"].sudo().create({"name": name, "datas": encoded, "mimetype": self._text(data.get("mimetype")) or "application/octet-stream", "res_model": "helpdesk.ticket", "res_id": ticket.id})
            registrar_auditoria("update", "helpdesk.ticket", ticket, details=f"Anexo adicionado: {name}")
            return self._json({"record": self._ticket_vals(ticket, include_chatter=True), "attachment": self._attachment_vals(attachment)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)

    @http.route("/api/chamados/anexos/<int:attachment_id>/download", auth="user", type="http", methods=["GET"])
    def download_attachment(self, attachment_id):
        attachment = request.env["ir.attachment"].sudo().browse(attachment_id).exists()
        ticket = request.env["helpdesk.ticket"].sudo().browse(attachment.res_id).exists() if attachment and attachment.res_model == "helpdesk.ticket" else request.env["helpdesk.ticket"]
        if not attachment or not ticket or not self._ticket_in_scope(ticket):
            return self._json({"error": "Anexo não encontrado."}, status=404)
        try:
            content = base64.b64decode(attachment.datas or b"")
            return request.make_response(content, headers=[("Content-Type", attachment.mimetype or "application/octet-stream"), ("Content-Disposition", f"attachment; filename*=UTF-8''{attachment.name}")])
        except (ValueError, binascii.Error):
            return self._json({"error": "Não foi possível ler o anexo."}, status=500)
