from odoo import fields, models
from odoo.exceptions import UserError

CATEGORIAS = [
    ("pessoas", "Pessoas"),
    ("processos", "Processos"),
    ("tecnologia", "Tecnologia"),
    ("recursos", "Recursos"),
    ("ambiente", "Ambiente"),
    ("gestao", "Gestão"),
]


class EvolutaIshikawa(models.Model):
    _name = "evoluta.ishikawa"
    _description = "Ishikawa"

    name = fields.Char(required=True, default="Nova análise Ishikawa")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    task_id = fields.Many2one("project.task", readonly=True, ondelete="set null")
    problema = fields.Text(string="Problema (efeito)", required=True)
    causa_raiz = fields.Text(string="Causa raiz")
    causa_ids = fields.One2many("evoluta.ishikawa.causa", "ishikawa_id", string="Causas")

    def action_define_causa_raiz(self):
        self.ensure_one()
        principal = self.causa_ids.filtered("eh_principal")
        if not principal:
            raise UserError("Marque uma causa como principal antes.")
        self.causa_raiz = principal[0].descricao

    def _task_vals(self):
        return {
            "name": (self.causa_raiz or self.name)[:80],
            "project_id": self.project_id.id,
            "description": f"<b>Problema:</b> {self.problema or ''}<br/><b>Causa raiz:</b> {self.causa_raiz or ''}",
        }

    def action_create_task(self):
        self.ensure_one()
        if not self.causa_raiz:
            raise UserError("Defina a causa raiz antes de gerar a ação.")
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


class EvolutaIshikawaCausa(models.Model):
    _name = "evoluta.ishikawa.causa"
    _description = "Causa Ishikawa"

    ishikawa_id = fields.Many2one(
        "evoluta.ishikawa", required=True, ondelete="cascade"
    )
    categoria = fields.Selection(CATEGORIAS, required=True)
    descricao = fields.Text(string="Descrição", required=True)
    eh_principal = fields.Boolean(string="Causa principal")
