from odoo import fields, models


class ProjectTask(models.Model):
    _inherit = "project.task"

    five_w2h_ids = fields.One2many("evoluta.5w2h", "task_id", string="Planos 5W2H")

    def write(self, vals):
        res = super().write(vals)
        if self.env.context.get("skip_5w2h_sync"):
            return res
        if {"date_deadline", "user_ids", "name"}.intersection(vals.keys()):
            for task in self:
                plans = task.five_w2h_ids
                if not plans:
                    continue
                sync = {}
                if "date_deadline" in vals:
                    sync["date_deadline"] = task.date_deadline
                if "name" in vals:
                    sync["what"] = task.name
                if "user_ids" in vals:
                    sync["who_id"] = task.user_ids[0].id if task.user_ids else False
                if sync:
                    plans.with_context(skip_task_sync=True).write(sync)
        return res
