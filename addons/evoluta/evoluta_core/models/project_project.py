from odoo import api, fields, models

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
