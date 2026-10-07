// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta; só cole em MARCA.campos se o seu sistema também for de licitação.
/**
 * Marcos da agenda de uma licitação (Lei 14.133/2021) e as legendas do calendário, como o sistema
 * de origem os usa. A base da skill traz textos NEUTROS em `MARCA.campos.eventos`; para um sistema
 * de licitação, substitua `eventos` por este objeto, `prazo` por "Prazo legal" e `evento` por
 * "Sessão" (a regra de data de cada marco mora em montarAgenda.ts, na base).
 */
export const EVENTOS_DE_LICITACAO = {
  publicacao: { titulo: "Publicação do edital", fundamento: "art. 54" },
  impugnacao: { titulo: "Último dia para impugnar o edital", fundamento: "art. 164" },
  resposta: { titulo: "Último dia para responder impugnações e esclarecimentos", fundamento: "art. 164, parágrafo único" },
  sessao: { titulo: "Sessão pública", fundamento: "art. 17, III" },
  recurso: { titulo: "Fim do prazo de recurso (se houver)", fundamento: "art. 165, I" },
  contrarrazoes: { titulo: "Fim do prazo de contrarrazões (se houver recurso)", fundamento: "art. 165, § 4º" },
} as const;

export const LEGENDAS_DE_LICITACAO = { prazo: "Prazo legal", evento: "Sessão" } as const;
