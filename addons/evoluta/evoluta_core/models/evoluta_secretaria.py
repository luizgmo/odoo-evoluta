from odoo import fields, models


class EvolutaSecretaria(models.Model):
    _name = "evoluta.secretaria"
    _description = "Secretaria"

    name = fields.Char(required=True)
    municipio_id = fields.Many2one(
        "evoluta.municipio", required=True, ondelete="cascade"
    )
    active = fields.Boolean(default=True)
