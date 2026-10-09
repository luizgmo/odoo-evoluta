from odoo import fields, models


class EvolutaTeoria(models.Model):
    _name = "evoluta.teoria"
    _description = "Teoria da Mudança"

    active = fields.Boolean(default=True)
    name = fields.Char(required=True, default="Nova teoria da mudança")
    project_id = fields.Many2one("project.project", required=True, ondelete="cascade")
    contexto = fields.Text(string="Contexto")
    insumos = fields.Text(string="Insumos")
    atividades = fields.Text(string="Atividades")
    produtos = fields.Text(string="Produtos")
    resultados = fields.Text(string="Resultados")
