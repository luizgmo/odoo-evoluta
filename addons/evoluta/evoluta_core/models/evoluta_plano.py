from odoo import fields, models


class EvolutaPlano(models.Model):
    _name = "evoluta.plano"
    _description = "Plano contratado (informativo Fase 1)"

    name = fields.Char(required=True)
    max_users = fields.Integer(string="Máx. usuários", default=10)
    max_projects = fields.Integer(string="Máx. projetos", default=5)
    active = fields.Boolean(default=True)
