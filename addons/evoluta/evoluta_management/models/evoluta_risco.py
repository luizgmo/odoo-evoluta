from odoo import fields, models
from odoo.exceptions import UserError


class EvolutaRisco(models.Model):
    _name = "evoluta.risco"
    _description = "Risco"

    name = fields.Char(required=True)
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    task_id = fields.Many2one("project.task", readonly=True, ondelete="set null")
    probabilidade = fields.Selection(
        [("baixa", "Baixa"), ("media", "Média"), ("alta", "Alta")],
        required=True,
        default="media",
    )
    impacto = fields.Selection(
        [("baixo", "Baixo"), ("medio", "Médio"), ("alto", "Alto")],
        required=True,
        default="medio",
    )
    mitigacao = fields.Text(string="Mitigação")
    responsavel_id = fields.Many2one("res.users", string="Responsável")

    def _task_vals(self):
        return {
            "name": self.name,
            "project_id": self.project_id.id,
            "user_ids": (
                [(6, 0, self.responsavel_id.ids)] if self.responsavel_id else [(6, 0, [])]
            ),
            "description": "<br/>".join(
                filter(
                    None,
                    [
                        f"<b>Probabilidade:</b> {dict(self._fields['probabilidade'].selection).get(self.probabilidade, '')}",
                        f"<b>Impacto:</b> {dict(self._fields['impacto'].selection).get(self.impacto, '')}",
                        f"<b>Mitigação:</b> {self.mitigacao or ''}",
                    ],
                )
            ),
        }

    def action_create_task(self):
        self.ensure_one()
        if not self.mitigacao:
            raise UserError("Preencha a mitigação antes de gerar a ação.")
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
        sync_fields = {"name", "probabilidade", "impacto", "mitigacao", "responsavel_id"}
        if sync_fields.intersection(vals.keys()):
            for rec in self:
                if rec.task_id and rec.mitigacao:
                    rec.task_id.with_context(skip_5w2h_sync=True).write(rec._task_vals())
        return res
