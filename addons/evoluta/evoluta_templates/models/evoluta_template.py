from odoo import fields, models


class EvolutaTemplate(models.Model):
    _name = "evoluta.template"
    _description = "Template de projeto"

    name = fields.Char(required=True)
    descricao = fields.Text(string="Descrição")
    task_ids = fields.One2many("evoluta.template.task", "template_id", string="Tasks modelo")
    active = fields.Boolean(default=True)

    def action_gerar_projeto(self):
        self.ensure_one()
        project = self.env["project.project"].create({"name": self.name})
        for line in self.task_ids:
            self.env["project.task"].create(
                {
                    "name": line.name,
                    "project_id": project.id,
                    "description": line.descricao or "",
                    "user_ids": (
                        [(6, 0, line.responsavel_id.ids)] if line.responsavel_id else [(6, 0, [])]
                    ),
                }
            )
        return {
            "type": "ir.actions.act_window",
            "name": project.name,
            "res_model": "project.task",
            "view_mode": "kanban,list,form",
            "domain": [("project_id", "=", project.id)],
            "target": "current",
        }


class EvolutaTemplateTask(models.Model):
    _name = "evoluta.template.task"
    _description = "Task modelo do template"

    template_id = fields.Many2one("evoluta.template", required=True, ondelete="cascade")
    name = fields.Char(required=True)
    descricao = fields.Text(string="Descrição")
    responsavel_id = fields.Many2one("res.users", string="Responsável padrão")
