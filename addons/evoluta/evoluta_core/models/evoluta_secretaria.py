from odoo import fields, models


class EvolutaSecretaria(models.Model):
    _name = "evoluta.secretaria"
    _description = "Secretaria"

    name = fields.Char(required=True)
    active = fields.Boolean(default=True)
