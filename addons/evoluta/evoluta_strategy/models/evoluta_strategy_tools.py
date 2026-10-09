from odoo import fields, models
from odoo.exceptions import UserError


class EvolutaTriangulo(models.Model):
    _name = "evoluta.triangulo"
    _description = "Triângulo Estratégico"

    active = fields.Boolean(default=True)
    name = fields.Char(required=True, default="Triângulo Estratégico")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    valor_publico = fields.Text(string="Valor Público", required=True)
    legitimidade = fields.Text(string="Legitimidade/Apoio", required=True)
    capacidade = fields.Text(string="Capacidade Operacional", required=True)


class EvolutaArvoreProblemas(models.Model):
    _name = "evoluta.arvore.problemas"
    _description = "Árvore de Problemas"

    active = fields.Boolean(default=True)
    name = fields.Char(required=True, default="Árvore de Problemas")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    causas = fields.Text(string="Causas")
    problema_central = fields.Text(string="Problema Central", required=True)
    efeitos = fields.Text(string="Efeitos")

    def action_converter_objetivos(self):
        self.ensure_one()
        existing = self.env["evoluta.arvore.objetivos"].search(
            [("origem_id", "=", self.id)], limit=1
        )
        if existing:
            target = existing
        else:
            target = self.env["evoluta.arvore.objetivos"].create(
                {
                    "name": f"Objetivos - {self.name}",
                    "project_id": self.project_id.id,
                    "origem_id": self.id,
                    "acoes": self.causas,
                    "objetivo_central": self.problema_central,
                    "resultados": self.efeitos,
                }
            )
        return {
            "type": "ir.actions.act_window",
            "res_model": "evoluta.arvore.objetivos",
            "res_id": target.id,
            "view_mode": "form",
            "target": "current",
        }


class EvolutaArvoreObjetivos(models.Model):
    _name = "evoluta.arvore.objetivos"
    _description = "Árvore de Objetivos"

    active = fields.Boolean(default=True)
    name = fields.Char(required=True, default="Árvore de Objetivos")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    origem_id = fields.Many2one("evoluta.arvore.problemas", string="Árvore de origem")
    task_id = fields.Many2one("project.task", readonly=True, ondelete="set null")
    five_w2h_id = fields.Many2one("evoluta.5w2h", readonly=True, ondelete="set null")
    acoes = fields.Text(string="Ações (ex-causas)")
    objetivo_central = fields.Text(string="Objetivo Central", required=True)
    resultados = fields.Text(string="Resultados (ex-efeitos)")

    def action_create_task(self):
        self.ensure_one()
        if not self.objetivo_central:
            raise UserError("Preencha o objetivo central antes de gerar a ação.")
        vals = {
            "name": self.objetivo_central[:80],
            "project_id": self.project_id.id,
            "description": f"<b>Ações:</b> {self.acoes or ''}<br/><b>Resultados:</b> {self.resultados or ''}",
        }
        if self.task_id:
            self.task_id.with_context(skip_5w2h_sync=True).write(vals)
            task = self.task_id
        else:
            task = self.env["project.task"].create(vals)
            self.with_context(skip_task_sync=True).task_id = task.id
        return {
            "type": "ir.actions.act_window",
            "res_model": "project.task",
            "res_id": task.id,
            "view_mode": "form",
            "target": "current",
        }
