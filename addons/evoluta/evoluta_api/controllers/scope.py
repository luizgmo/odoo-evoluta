ROLE_PLATFORM = "super_admin"
ROLE_ADMIN = "admin_municipal"
ROLE_SECRETARY = "secretario"
ROLE_ATTENDANT = "atendente"


def is_platform_admin(user):
    """Administrador técnico do Odoo; pode operar sem vínculo municipal."""
    return user.has_group("base.group_system")


def user_role(user):
    """Traduz grupos Odoo em um papel estável para o frontend."""
    if is_platform_admin(user):
        return ROLE_PLATFORM
    if user.has_group("evoluta_core.evoluta_group_admin"):
        return ROLE_ADMIN
    if user.has_group("evoluta_core.evoluta_group_secretario"):
        return ROLE_SECRETARY
    if user.has_group("evoluta_core.evoluta_group_atendente"):
        return ROLE_ATTENDANT
    return ROLE_ATTENDANT


def permissions_for(user):
    role = user_role(user)
    return {
        "manage_municipios": role == ROLE_PLATFORM,
        "manage_organization": role in {ROLE_PLATFORM, ROLE_ADMIN},
        "manage_users": role in {ROLE_PLATFORM, ROLE_ADMIN},
        "manage_projects": role in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY},
        "archive_projects": role in {ROLE_PLATFORM, ROLE_ADMIN},
        "manage_templates": role in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY},
        "approve_5w2h": role in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY},
        "view_indicators": role in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY},
        "view_audit": role in {ROLE_PLATFORM, ROLE_ADMIN},
        "create_tickets": True,
        "manage_tickets": role in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY},
        "assign_tickets": role in {ROLE_PLATFORM, ROLE_ADMIN, ROLE_SECRETARY},
    }


def user_scope_domain(user, field="municipio_id"):
    """Domínio organizacional para modelos que têm municipio_id direto."""
    if is_platform_admin(user):
        return []
    if not user.municipio_id:
        return [("id", "=", 0)]
    domain = [(field, "=", user.municipio_id.id)]
    role = user_role(user)
    if field == "municipio_id" and role in {ROLE_SECRETARY, ROLE_ATTENDANT}:
        # Sem secretaria, o projeto é municipal e fica visível a todas as secretarias.
        if user.secretaria_id:
            domain = [
                "&",
                *domain,
                "|",
                ("secretaria_id", "=", False),
                ("secretaria_id", "=", user.secretaria_id.id),
            ]
        else:
            return [("id", "=", 0)]
    if field == "municipio_id" and role == ROLE_ATTENDANT:
        if user.departamento_id:
            domain = [
                "&",
                *domain,
                "|",
                ("departamento_id", "=", False),
                ("departamento_id", "=", user.departamento_id.id),
            ]
        else:
            return [("id", "=", 0)]
    return domain


def project_scope_domain(user):
    return user_scope_domain(user, "municipio_id")


def project_in_scope(user, project):
    if not project:
        return False
    if is_platform_admin(user):
        return True
    if not user.municipio_id or project.municipio_id != user.municipio_id:
        return False
    role = user_role(user)
    if role in {ROLE_SECRETARY, ROLE_ATTENDANT}:
        if not user.secretaria_id:
            return False
        if project.secretaria_id and project.secretaria_id != user.secretaria_id:
            return False
    if role == ROLE_ATTENDANT:
        if not user.departamento_id:
            return False
        if project.departamento_id and project.departamento_id != user.departamento_id:
            return False
    return True


def project_record_domain(user, project_field="project_id"):
    """Domínio para modelos cujo escopo vem de project_id."""
    if is_platform_admin(user):
        return []
    project_domain = project_scope_domain(user)
    if not project_domain:
        return []
    return [(f"{project_field}.{field}", operator, value) for field, operator, value in project_domain]
