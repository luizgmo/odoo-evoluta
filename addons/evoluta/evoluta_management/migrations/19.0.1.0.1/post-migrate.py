
def migrate(cr, version):
    """Quarentena explícita de 5W2H legado sem What antes do NOT NULL."""
    if not version:
        return
    cr.execute(
        """
        UPDATE evoluta_5w2h
           SET what = '[LEGADO ARQUIVADO] Conteúdo What não informado na origem.',
               active = FALSE
         WHERE what IS NULL OR btrim(what) = ''
        """
    )
    cr.execute("ALTER TABLE evoluta_5w2h ALTER COLUMN what SET NOT NULL")
