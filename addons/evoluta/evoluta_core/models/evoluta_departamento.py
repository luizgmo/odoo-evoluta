from odoo import fields, models


class EvolutaDepartamento(models.Model):
    _name = "evoluta.departamento"
    _description = "Departamento"

    name = fields.Char(required=True)
    secretaria_id = fields.Many2one(
        "evoluta.secretaria", required=True, ondelete="cascade"
    )
    active = fields.Boolean(default=True)
