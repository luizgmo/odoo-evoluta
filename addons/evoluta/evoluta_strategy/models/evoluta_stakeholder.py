from odoo import fields, models


class EvolutaStakeholder(models.Model):
    _name = "evoluta.stakeholder"
    _description = "Stakeholder"

    name = fields.Char(required=True)
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    organizacao = fields.Char(string="Organização")
    poder = fields.Selection(
        [("baixo", "Baixo"), ("medio", "Médio"), ("alto", "Alto")],
        required=True,
        default="medio",
    )
    interesse = fields.Selection(
        [("baixo", "Baixo"), ("medio", "Médio"), ("alto", "Alto")],
        required=True,
        default="medio",
    )
    posicao = fields.Selection(
        [("apoiador", "Apoiador"), ("neutro", "Neutro"), ("opositor", "Opositor")],
        string="Posição",
        required=True,
        default="neutro",
    )
    influencia = fields.Selection(
        [("baixa", "Baixa"), ("media", "Média"), ("alta", "Alta")],
        string="Influência",
        required=True,
        default="media",
    )
    estrategia = fields.Text(string="Estratégia de relacionamento")
    active = fields.Boolean(default=True)
