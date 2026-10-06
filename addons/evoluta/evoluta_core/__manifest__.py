{
    "name": "Evoluta Core",
    "version": "19.0.1.0.0",
    "summary": "Base: municipio, secretaria, permissoes",
    "author": "AlphaMec + Evoluta",
    "license": "LGPL-3",
    "depends": ["base", "project"],
    "data": [
        "security/groups.xml",
        "security/ir.model.access.csv",
        "views/evoluta_geo_views.xml",
        "views/evoluta_plano_views.xml",
        "views/menus.xml",
        "data/project_stages.xml",
        "data/onboarding.xml",
    ],
    "installable": True,
    "application": False,
}
