from odoo import fields, models


class Evoluta5W2H(models.Model):
    _name = "evoluta.5w2h"
    _description = "5W2H"

    name = fields.Char(required=True, default="Novo plano 5W2H")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    task_id = fields.Many2one("project.task", readonly=True, ondelete="set null")
    what = fields.Char(string="What (O que)")
    why = fields.Text(string="Why (Por que)")
    where = fields.Char(string="Where (Onde)")
    date_deadline = fields.Date(string="When (Quando)")
    who_id = fields.Many2one("res.users", string="Who (Quem)")
    how = fields.Text(string="How (Como)")
    how_much = fields.Float(string="How Much (Quanto)")

    def action_create_task(self):
        self.ensure_one()
        task_vals = {
            "name": self.what or self.name,
            "project_id": self.project_id.id,
            "user_ids": [(6, 0, self.who_id.ids)] if self.who_id else False,
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
        task = self.env["project.task"].create(task_vals)
        self.task_id = task.id
        return {
            "type": "ir.actions.act_window",
            "res_model": "project.task",
            "res_id": task.id,
            "view_mode": "form",
            "target": "current",
        }
