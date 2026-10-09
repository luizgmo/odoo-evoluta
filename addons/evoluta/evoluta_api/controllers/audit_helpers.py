from odoo.http import request


def registrar_auditoria(action, model, record, project=None, details=""):
    """Registra uma operação sem tornar a operação principal dependente da auditoria."""
    try:
        municipio = project.municipio_id if project else getattr(record, "municipio_id", False)
        if not municipio and getattr(record, "secretaria_id", False):
            municipio = record.secretaria_id.municipio_id
        project_record = project or getattr(record, "project_id", False)
        request.env["evoluta.auditoria"].sudo().create(
            {
                "name": f"{action}: {record.display_name}",
                "action": action,
                "model": model,
                "res_id": record.id,
                "res_name": record.display_name,
                "details": details,
                "user_id": request.env.user.id,
                "municipio_id": municipio.id if municipio else False,
                "project_id": project_record.id if project_record else False,
            }
        )
    except Exception:
        return None
    return None
