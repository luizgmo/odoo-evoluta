from odoo import api, fields, models
from odoo.exceptions import UserError


class EvolutaMatriz(models.Model):
    _name = "evoluta.matriz"
    _description = "Matriz de Decisão"

    active = fields.Boolean(default=True)
    name = fields.Char(required=True, default="Nova matriz de decisão")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    criterio_ids = fields.One2many("evoluta.matriz.criterio", "matriz_id")
    alternativa_ids = fields.One2many("evoluta.matriz.alternativa", "matriz_id")
    five_w2h_id = fields.Many2one("evoluta.5w2h", string="Plano 5W2H", readonly=True, ondelete="set null")
    vencedor_id = fields.Many2one(
        "evoluta.matriz.alternativa", string="Vencedora", compute="_compute_vencedor", store=True
    )

    @api.depends("alternativa_ids.total")
    def _compute_vencedor(self):
        for rec in self:
            scored = rec.alternativa_ids.filtered("total")
            rec.vencedor_id = max(scored, key=lambda a: a.total) if scored else False

    def action_gerar_5w2h(self):
        self.ensure_one()
        if not self.vencedor_id:
            raise UserError("Preencha notas para definir a vencedora antes.")
        plan = self.five_w2h_id
        if not plan:
            plan = self.env["evoluta.5w2h"].create(
                {
                    "name": f"5W2H - {self.vencedor_id.name}",
                    "project_id": self.project_id.id,
                    "what": self.vencedor_id.name,
                }
            )
            self.five_w2h_id = plan.id
        return {
            "type": "ir.actions.act_window",
            "res_model": "evoluta.5w2h",
            "res_id": plan.id,
            "view_mode": "form",
            "target": "current",
        }


class EvolutaMatrizCriterio(models.Model):
    _name = "evoluta.matriz.criterio"
    _description = "Critério da Matriz"

    matriz_id = fields.Many2one("evoluta.matriz", required=True, ondelete="cascade")
    name = fields.Char(required=True)
    peso = fields.Float(default=1.0)


class EvolutaMatrizAlternativa(models.Model):
    _name = "evoluta.matriz.alternativa"
    _description = "Alternativa da Matriz"

    matriz_id = fields.Many2one("evoluta.matriz", required=True, ondelete="cascade")
    name = fields.Char(required=True)
    nota_ids = fields.One2many("evoluta.matriz.nota", "alternativa_id")
    total = fields.Float(compute="_compute_total", store=True)

    @api.depends("nota_ids.nota", "nota_ids.criterio_id.peso")
    def _compute_total(self):
        for rec in self:
            rec.total = sum(n.nota * (n.criterio_id.peso or 0.0) for n in rec.nota_ids)


class EvolutaMatrizNota(models.Model):
    _name = "evoluta.matriz.nota"
    _description = "Nota da Matriz"

    matriz_id = fields.Many2one(
        "evoluta.matriz", related="alternativa_id.matriz_id", store=True, readonly=True
    )
    alternativa_id = fields.Many2one(
        "evoluta.matriz.alternativa", required=True, ondelete="cascade"
    )
    criterio_id = fields.Many2one(
        "evoluta.matriz.criterio", required=True, ondelete="cascade"
    )
    nota = fields.Float(default=0.0)
