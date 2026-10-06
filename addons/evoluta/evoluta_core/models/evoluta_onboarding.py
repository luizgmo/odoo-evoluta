from odoo import fields, models


class EvolutaOnboarding(models.Model):
    _name = "evoluta.onboarding"
    _description = "Onboarding passo"

    name = fields.Char(required=True)
    sequence = fields.Integer(default=10)
    description = fields.Text(string="O que fazer")
    done = fields.Boolean(string="Concluído", default=False)
