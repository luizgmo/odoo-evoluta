from odoo import fields, models
from odoo.exceptions import UserError


class EvolutaCincoPorques(models.Model):
    _name = "evoluta.cinco_porques"
    _description = "5 Porquês"

    name = fields.Char(required=True, default="Nova análise 5 Porquês")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    task_id = fields.Many2one("project.task", readonly=True, ondelete="set null")
    five_w2h_id = fields.Many2one("evoluta.5w2h", string="Plano 5W2H")
    problema = fields.Text(string="Problema", required=True)
    pq1 = fields.Text(string="Por quê 1?")
    pq2 = fields.Text(string="Por quê 2?")
    pq3 = fields.Text(string="Por quê 3?")
    pq4 = fields.Text(string="Por quê 4?")
    pq5 = fields.Text(string="Por quê 5?")
    causa_raiz = fields.Text(string="Causa raiz")

    def _task_vals(self):
        chain = "<br/>".join(
            filter(
                None,
                [
                    f"<b>Problema:</b> {self.problema or ''}",
                    f"<b>Por quê 1:</b> {self.pq1 or ''}",
                    f"<b>Por quê 2:</b> {self.pq2 or ''}",
                    f"<b>Por quê 3:</b> {self.pq3 or ''}",
                    f"<b>Por quê 4:</b> {self.pq4 or ''}",
                    f"<b>Por quê 5:</b> {self.pq5 or ''}",
                    f"<b>Causa raiz:</b> {self.causa_raiz or ''}",
                ],
            )
        )
        return {
            "name": (self.causa_raiz or self.name)[:80],
            "project_id": self.project_id.id,
            "description": chain,
        }

    def action_create_task(self):
        self.ensure_one()
        if not self.causa_raiz:
            raise UserError("Preencha a causa raiz antes de criar a ação.")
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
        sync_fields = {"problema", "pq1", "pq2", "pq3", "pq4", "pq5", "causa_raiz"}
        if sync_fields.intersection(vals.keys()):
            for rec in self:
                if rec.task_id and rec.causa_raiz:
                    rec.task_id.with_context(skip_5w2h_sync=True).write(rec._task_vals())
        return res
