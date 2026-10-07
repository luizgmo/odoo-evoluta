from odoo import fields, models
from odoo.exceptions import UserError


class Evoluta5W2H(models.Model):
    _name = "evoluta.5w2h"
    _description = "5W2H"
    _inherit = ["tier.validation"]

    name = fields.Char(required=True, default="Novo plano 5W2H")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    task_id = fields.Many2one("project.task", readonly=True, ondelete="set null")
    what = fields.Char(string="What (O que)", required=True)
    why = fields.Text(string="Why (Por que)")
    where = fields.Char(string="Where (Onde)")
    date_deadline = fields.Date(string="When (Quando)")
    who_id = fields.Many2one("res.users", string="Who (Quem)")
    how = fields.Text(string="How (Como)")
    how_much = fields.Float(string="How Much (Quanto)")
    state = fields.Selection(
        [
            ("draft", "Rascunho"),
            ("confirmed", "Em validação"),
            ("approved", "Aprovado"),
            ("cancel", "Cancelado"),
        ],
        default="draft",
    )

    def _get_under_validation_exceptions(self):
        res = super()._get_under_validation_exceptions()
        res.append("task_id")
        return res

    def _get_after_validation_exceptions(self):
        res = super()._get_after_validation_exceptions()
        res.append("task_id")
        return res

    def _task_vals(self):
        return {
            "name": self.what or self.name,
            "project_id": self.project_id.id,
            "user_ids": [(6, 0, self.who_id.ids)] if self.who_id else [(6, 0, [])],
            "date_deadline": self.date_deadline,
            "description": "<br/>".join(
                filter(
                    None,
                    [
                        f"<b>Why:</b> {self.why or ''}",
                        f"<b>Where:</b> {self.where or ''}",
                        f"<b>How:</b> {self.how or ''}",
                        f"<b>How Much:</b> {self.how_much or 0}",
                    ],
                )
            ),
        }

    def action_create_task(self):
        self.ensure_one()
        if self.review_ids and self.validation_status != "validated":
            raise UserError("Plano precisa estar Aprovado (2 níveis) para gerar a task.")
        if self.task_id:
            self.task_id.with_context(skip_5w2h_sync=True).write(self._task_vals())
            task = self.task_id
        else:
            task = self.env["project.task"].create(self._task_vals())
            self.with_context(skip_task_sync=True).task_id = task.id
        return {
            "type": "ir.actions.act_window",
            "res_model": "project.task",
            "res_id": task.id,
            "view_mode": "form",
            "target": "current",
        }

    def write(self, vals):
        res = super().write(vals)
        if self.env.context.get("skip_task_sync"):
            return res
        sync_fields = {"what", "date_deadline", "who_id", "why", "where", "how", "how_much"}
        if sync_fields.intersection(vals.keys()):
            for rec in self:
                if rec.task_id:
                    rec.task_id.with_context(skip_5w2h_sync=True).write(rec._task_vals())
        return res
