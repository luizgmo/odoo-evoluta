from datetime import date

from odoo import api, fields, models
from odoo.exceptions import ValidationError

DEFAULT_STAGES = [
    ("NÃO INICIADO", 1, False),
    ("PLANEJADO", 2, False),
    ("EM EXECUÇÃO", 3, False),
    ("AGUARDANDO TERCEIRO", 4, False),
    ("VALIDAÇÃO", 5, False),
    ("CONCLUÍDO", 6, True),
]


class ProjectProject(models.Model):
    _inherit = "project.project"

    evoluta_total_tasks = fields.Integer(
        string="Total tasks", compute="_compute_evoluta_indicadores"
    )
    evoluta_done_tasks = fields.Integer(
        string="Concluídas", compute="_compute_evoluta_indicadores"
    )
    evoluta_overdue_tasks = fields.Integer(
        string="Atrasadas", compute="_compute_evoluta_indicadores"
    )
    evoluta_orcamento = fields.Float(string="Orçamento (R$)")
    municipio_id = fields.Many2one(
        "evoluta.municipio", string="Município Evoluta", ondelete="restrict", index=True
    )
    secretaria_id = fields.Many2one(
        "evoluta.secretaria", string="Secretaria Evoluta", ondelete="restrict", index=True
    )
    departamento_id = fields.Many2one(
        "evoluta.departamento", string="Departamento Evoluta", ondelete="restrict", index=True
    )

    @api.constrains("municipio_id", "secretaria_id", "departamento_id")
    def _check_evoluta_scope(self):
        for project in self:
            if project.secretaria_id and project.municipio_id != project.secretaria_id.municipio_id:
                raise ValidationError("A secretaria precisa pertencer ao município do projeto.")
            if project.departamento_id and project.secretaria_id != project.departamento_id.secretaria_id:
                raise ValidationError("O departamento precisa pertencer à secretaria do projeto.")

    @api.depends()
    def _compute_evoluta_indicadores(self):
        today = date.today()
        for project in self:
            tasks = self.env["project.task"].search([("project_id", "=", project.id)])
            done = tasks.filtered(lambda t: t.stage_id.fold)
            overdue = tasks.filtered(
                lambda t: t.date_deadline
                and t.date_deadline.date() < today
                and not t.stage_id.fold
            )
            project.evoluta_total_tasks = len(tasks)
            project.evoluta_done_tasks = len(done)
            project.evoluta_overdue_tasks = len(overdue)

    @api.model_create_multi
    def create(self, vals_list):
        projects = super().create(vals_list)
        stage_obj = self.env["project.task.type"]
        for project in projects:
            existing = stage_obj.search([("project_ids", "in", project.id)], limit=1)
            if existing:
                continue
            for name, seq, fold in DEFAULT_STAGES:
                stage_obj.create(
                    {
                        "name": name,
                        "sequence": seq,
                        "fold": fold,
                        "project_ids": [(6, 0, project.ids)],
                    }
                )
        return projects
