from odoo import fields, models


class EvolutaAuditoria(models.Model):
    _name = "evoluta.auditoria"
    _description = "Auditoria Evoluta"
    _order = "create_date desc, id desc"

    name = fields.Char(required=True, string="Ação")
    action = fields.Selection(
        [(key, label) for key, label in [("create", "Criado"), ("update", "Atualizado"), ("archive", "Arquivado"), ("workflow", "Workflow")]],
        required=True,
        default="update",
    )
    model = fields.Char(required=True)
    res_id = fields.Integer(required=True)
    res_name = fields.Char()
    details = fields.Text()
    user_id = fields.Many2one("res.users", required=True, default=lambda self: self.env.user)
    municipio_id = fields.Many2one("evoluta.municipio", index=True, ondelete="restrict")
    project_id = fields.Many2one("project.project", index=True, ondelete="set null")
