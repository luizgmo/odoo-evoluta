from odoo import api, fields, models
from odoo.exceptions import ValidationError


class EvolutaRaci(models.Model):
    _name = "evoluta.raci"
    _description = "RACI"

    active = fields.Boolean(default=True)
    name = fields.Char(required=True, default="Matriz RACI")
    task_id = fields.Many2one("project.task", required=True, ondelete="cascade")
    responsible_id = fields.Many2one("res.users", string="Responsible", required=True)
    accountable_id = fields.Many2one("res.users", string="Accountable", required=True)
    consulted_ids = fields.Many2many(
        "res.users", relation="evoluta_raci_consulted_rel", string="Consulted"
    )
    informed_ids = fields.Many2many(
        "res.users", relation="evoluta_raci_informed_rel", string="Informed"
    )

    @api.constrains("responsible_id", "accountable_id")
    def _check_different_ra(self):
        for rec in self:
            if rec.responsible_id and rec.accountable_id and rec.responsible_id == rec.accountable_id:
                raise ValidationError("Responsible e Accountable devem ser pessoas diferentes.")
