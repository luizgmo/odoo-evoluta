import json

from odoo import fields, http
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.http import Response, request


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
            return self._json({"error": "Você não tem permissão para executar este ato."}, status=403)
        return self._json({"error": str(error)}, status=400)

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
    def _ticket_vals(record):
        situacao, situacao_key = EvolutaTicketsApi._situacao(record)
        return {
            "id": record.id,
            "codigo": record.number or f"HT{record.id:05d}",
            "titulo": record.name,
            "descricao": record.description or "",
            "situacao": situacao,
            "situacao_key": situacao_key,
            "prioridade": {"0": "baixa", "1": "normal", "2": "alta", "3": "muito_alta"}.get(record.priority, "normal"),
            "prioridade_label": {"0": "Baixa", "1": "Normal", "2": "Alta", "3": "Muito alta"}.get(record.priority, "Normal"),
            "prazo": fields.Datetime.to_string(record.sla_deadline) if record.sla_deadline else False,
            "sla_status": EvolutaTicketsApi._sla_status(record),
            "equipe_id": record.team_id.id if record.team_id else False,
            "equipe_nome": record.team_id.name if record.team_id else "",
            "estagio_nome": record.stage_id.name if record.stage_id else "",
        }

    @http.route("/api/chamados", auth="user", type="http", methods=["GET"])
    def list_tickets(self):
        try:
            records = request.env["helpdesk.ticket"].search([], order="id desc")
            return self._json({"records": [self._ticket_vals(record) for record in records]})
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar chamados."}, status=403)

    @http.route("/api/chamados/equipes", auth="user", type="http", methods=["GET"])
    def list_ticket_teams(self):
        try:
            records = request.env["helpdesk.ticket.team"].search(
                [("active", "=", True)], order="sequence, name"
            )
            return self._json({
                "records": [
                    {"id": record.id, "name": record.name, "use_sla": record.use_sla}
                    for record in records
                ]
            })
        except AccessError:
            return self._json({"error": "Você não tem permissão para consultar equipes de chamados."}, status=403)

    @http.route("/api/chamados", auth="user", type="http", methods=["POST"], csrf=False)
    def create_ticket(self):
        data = request.get_json_data() or {}
        titulo = self._text(data.get("titulo"))
        descricao = self._text(data.get("descricao"))
        if not titulo:
            return self._json({"error": "Informe o título do chamado."}, status=400)
        if not descricao:
            return self._json({"error": "Informe a descrição do chamado."}, status=400)
        valores: dict[str, object] = {"name": titulo, "description": descricao}
        team_id = self._int(data.get("team_id"))
        if team_id:
            valores["team_id"] = team_id
        try:
            record = request.env["helpdesk.ticket"].create(valores)
            return self._json({"record": self._ticket_vals(record)}, status=201)
        except (AccessError, UserError, ValidationError) as error:
            return self._error(error)
