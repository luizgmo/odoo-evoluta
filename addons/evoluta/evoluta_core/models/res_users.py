from odoo import api, fields, models
from odoo.exceptions import ValidationError


class ResUsers(models.Model):
    _inherit = "res.users"

    municipio_id = fields.Many2one(
        "evoluta.municipio",
        string="Município Evoluta",
        ondelete="restrict",
        index=True,
    )
    secretaria_id = fields.Many2one(
        "evoluta.secretaria",
        string="Secretaria Evoluta",
        ondelete="restrict",
        index=True,
    )
    departamento_id = fields.Many2one(
        "evoluta.departamento",
        string="Departamento Evoluta",
        ondelete="restrict",
        index=True,
    )

    @api.constrains("municipio_id", "secretaria_id", "departamento_id")
    def _check_evoluta_scope(self):
        for user in self:
            if user.secretaria_id and user.municipio_id != user.secretaria_id.municipio_id:
                raise ValidationError("A secretaria precisa pertencer ao município do usuário.")
            if user.departamento_id and user.secretaria_id != user.departamento_id.secretaria_id:
                raise ValidationError("O departamento precisa pertencer à secretaria do usuário.")
