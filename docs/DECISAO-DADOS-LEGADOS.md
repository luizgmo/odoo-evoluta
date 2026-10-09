# Decisão sobre dados legados — fechamento P12

Data da decisão: 2026-10-08.

## Regra geral

Nenhum registro legado sem município é automaticamente atribuído a Município A ou Município B. Registros sem tenant permanecem fora das listas municipais; quando necessário, ficam visíveis somente à administração técnica do Odoo para saneamento.

## Inventário verificado

- `evoluta.5w2h`: 12 registros; 1 com `what` nulo.
- O registro afetado era o plano `#2`, chamado `sdasdsa`, ligado ao projeto legado `#1` (`Office Design`/`Decoração do escritório`), sem município.
- O conteúdo não permitia inferir com segurança o What, município ou intenção de negócio.

## Decisão aplicada

O plano legado `#2` foi colocado em quarentena:

1. `active = false`, portanto não aparece na lista municipal ativa;
2. `what = [LEGADO ARQUIVADO] Conteúdo What não informado na origem.` apenas como marcador técnico de preservação e rastreabilidade;
3. nenhum município, secretaria ou departamento foi atribuído;
4. `evoluta_5w2h.what` recebeu restrição `NOT NULL`;
5. a migração foi versionada em `addons/evoluta/evoluta_management/migrations/19.0.1.0.1/post-migrate.py`.

O marcador não representa conteúdo de negócio e não deve ser usado como exemplo de preenchimento. Caso a origem seja identificada futuramente, a equipe técnica poderá corrigir o registro em procedimento administrativo controlado.

## Demais classes

- projetos sem município: não migrar automaticamente; manter fora do escopo municipal até classificação;
- chamados sem município: não exibir para usuários municipais; classificar ou arquivar pelo Odoo;
- usuários sem município: não liberar como usuário municipal operacional;
- ferramentas arquivadas: permanecer fora das listas ativas;
- templates/jobs antigos: manter somente se o backend conseguir provar o tenant de destino; caso contrário, não executar;
- registros de teste: devem ser arquivados/removidos somente por prefixo identificável e procedimento controlado.

## Evidência

```text
SELECT COUNT(*) FROM evoluta_5w2h WHERE what IS NULL;
-- 0

SELECT id, active, what FROM evoluta_5w2h WHERE id = 2;
-- 2 | f | [LEGADO ARQUIVADO] Conteúdo What não informado na origem.
```
