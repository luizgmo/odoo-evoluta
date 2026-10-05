from odoo import fields, models


class EvolutaMunicipio(models.Model):
    _name = "evoluta.municipio"
    _description = "Município"

    name = fields.Char(required=True)
    codigo_ibge = fields.Char(string="Código IBGE")
    active = fields.Boolean(default=True)
