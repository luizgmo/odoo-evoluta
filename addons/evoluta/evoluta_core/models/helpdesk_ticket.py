from odoo import api, fields, models
from odoo.exceptions import ValidationError


class HelpdeskTicket(models.Model):
    _inherit = "helpdesk.ticket"

    municipio_id = fields.Many2one(
        "evoluta.municipio", string="Município Evoluta", index=True, ondelete="restrict"
    )
    secretaria_id = fields.Many2one(
        "evoluta.secretaria", string="Secretaria Evoluta", index=True, ondelete="restrict"
    )
    departamento_id = fields.Many2one(
        "evoluta.departamento", string="Departamento Evoluta", index=True, ondelete="restrict"
    )

    @api.constrains("municipio_id", "secretaria_id", "departamento_id")
    def _check_evoluta_scope(self):
        for ticket in self:
            if ticket.secretaria_id and ticket.municipio_id != ticket.secretaria_id.municipio_id:
                raise ValidationError("A secretaria precisa pertencer ao município do chamado.")
            if ticket.departamento_id and ticket.secretaria_id != ticket.departamento_id.secretaria_id:
                raise ValidationError("O departamento precisa pertencer à secretaria do chamado.")
