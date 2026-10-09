from odoo import fields, models
from odoo.exceptions import UserError


class EvolutaTemplate(models.Model):
    _name = "evoluta.template"
    _description = "Template de projeto"

    name = fields.Char(required=True)
    descricao = fields.Text(string="Descrição")
    task_ids = fields.One2many("evoluta.template.task", "template_id", string="Tasks modelo")
    active = fields.Boolean(default=True)

    def action_gerar_projeto(self):
        self.ensure_one()
        municipio_id = self.env.context.get("evoluta_municipio_id")
        secretaria_id = self.env.context.get("evoluta_secretaria_id") or False
        departamento_id = self.env.context.get("evoluta_departamento_id") or False
        if not municipio_id:
            raise UserError("O município de destino é obrigatório para gerar um projeto.")
        job = self.with_delay(
            description=f"Gerar projeto do template {self.name}"
        )._gerar_projeto_job(municipio_id, secretaria_id, departamento_id)
        return {
            "type": "ir.actions.client",
            "tag": "display_notification",
            "job_id": job.uuid,
            "params": {
                "title": "Projeto na fila",
                "message": "Geração em background, confira em Projetos em instantes.",
                "type": "success",
                "sticky": False,
            },
        }

    def _gerar_projeto_job(self, municipio_id, secretaria_id=False, departamento_id=False):
        project = self.env["project.project"].create(
            {
                "name": self.name,
                "municipio_id": municipio_id,
                "secretaria_id": secretaria_id or False,
                "departamento_id": departamento_id or False,
            }
        )
        for line in self.task_ids:
            responsaveis = line.responsavel_id.filtered(
                lambda user: user.municipio_id.id == municipio_id
            )
            self.env["project.task"].create(
                {
                    "name": line.name,
                    "project_id": project.id,
                    "description": line.descricao or "",
                    "user_ids": [(6, 0, responsaveis.ids)],
                }
            )
        return {
            "project_id": project.id,
            "project_name": project.name,
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
