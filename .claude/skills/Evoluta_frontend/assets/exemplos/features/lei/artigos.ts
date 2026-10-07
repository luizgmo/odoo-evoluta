// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo
// A base traz um artigos.ts NEUTRO (ARTIGOS vazio). Este é o resumo da Lei nº 14.133/2021 que o LicitarsAI usa (não o texto integral); copie-o por cima
// da versão neutra só se o seu sistema for de licitação (e então ligue MARCA.leiAoLado).
/**
 * EXEMPLO DE DOMÍNIO (licitações): conteúdo de apoio de licitação; em outro sistema,
 * troque pelos textos de referência do seu domínio ou remova junto de LeiAoLado.
 *
 * Lei ao lado: os artigos da Lei nº 14.133/2021 que o
 * sistema usa nos cálculos e cita nas telas. NÃO é o texto da lei: é um
 * resumo em linguagem comum, sempre com o caminho para o texto oficial no
 * Planalto — quem decide pelo texto é o servidor. Os prazos do art. 55 saem
 * da tabela HIPOTESES_PRAZO (daqui mesmo), a mesma que o simulador usa, para
 * não haver dois números.
 *
 * Este arquivo é a ÚNICA fonte da lei: outros arquivos importam daqui, e este
 * não importa nada do domínio.
 */
export interface HipotesePrazo {
  id: string;
  rotulo: string;
  diasUteis: number;
  fundamento: string;
}

/** Prazos mínimos para apresentação de propostas (art. 55). */
export const HIPOTESES_PRAZO: HipotesePrazo[] = [
  { id: "bens-menor-preco", rotulo: "Bens — menor preço ou maior desconto", diasUteis: 8, fundamento: "art. 55, I, a" },
  { id: "bens-outros", rotulo: "Bens — demais critérios", diasUteis: 15, fundamento: "art. 55, I, b" },
  { id: "servicos-comuns", rotulo: "Serviços comuns e obras/serviços comuns de engenharia — menor preço ou maior desconto", diasUteis: 10, fundamento: "art. 55, II, a" },
  { id: "servicos-especiais", rotulo: "Serviços especiais e obras/serviços especiais de engenharia — menor preço ou maior desconto", diasUteis: 25, fundamento: "art. 55, II, b" },
  { id: "contratacao-integrada", rotulo: "Contratação integrada", diasUteis: 60, fundamento: "art. 55, II, c" },
  { id: "semi-integrada", rotulo: "Contratação semi-integrada ou demais serviços e obras", diasUteis: 35, fundamento: "art. 55, II, d" },
  { id: "maior-lance", rotulo: "Maior lance (leilão)", diasUteis: 15, fundamento: "art. 55, III" },
  { id: "tecnica", rotulo: "Técnica e preço, melhor técnica ou conteúdo artístico", diasUteis: 35, fundamento: "art. 55, IV" },
];

export const LEI_14133_OFICIAL = "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm";

/** Como a gaveta cita a lei; é o único lugar com o nome dela (LeiAoLado.tsx só lê daqui). */
export const LEI_NOME = "Lei nº 14.133/2021";

/** Rota de uma tela que lista todos os artigos; "" se o sistema não tiver (o link some da gaveta). */
export const LEI_ROTA_DA_LISTA = "";

export interface ArtigoDaLei {
  numero: string;
  titulo: string;
  /** Parágrafos do resumo, em linguagem comum. */
  resumo: string[];
  /** Onde o sistema usa este artigo. */
  noSistema: string;
}

const prazosDoArt55 = HIPOTESES_PRAZO.map((p) => `${p.rotulo}: ${p.diasUteis} dias úteis (${p.fundamento}).`);

export const ARTIGOS: ArtigoDaLei[] = [
  {
    numero: "17",
    titulo: "Fases do processo de licitação",
    resumo: [
      "A licitação segue, em regra, estas fases, nesta ordem: preparatória; divulgação do edital; apresentação de propostas e lances, quando for o caso; julgamento; habilitação; recursal; e homologação.",
      "A habilitação pode vir antes do julgamento, por ato motivado, se o edital previr.",
    ],
    noSistema: "As sete fases da capa da pasta. O sistema estima a fase pelas datas e pela situação do processo.",
  },
  {
    numero: "18",
    titulo: "Fase preparatória e estudo técnico preliminar",
    resumo: [
      "A fase preparatória é o planejamento da contratação, compatível com o plano de contratações anual e com as leis orçamentárias.",
      "O § 1º lista os elementos do estudo técnico preliminar (ETP). O § 2º define os que não podem faltar; os demais, se ficarem de fora, precisam de justificativa.",
    ],
    noSistema: "As etapas da fase preparatória na linha do tempo e o ETP gerado pela IA.",
  },
  {
    numero: "23",
    titulo: "Valor estimado da contratação",
    resumo: [
      "O valor estimado deve ser compatível com os valores praticados pelo mercado.",
      "O § 1º traz os parâmetros para chegar a ele, como contratações similares, painéis oficiais de preços e pesquisa direta com fornecedores.",
    ],
    noSistema: "O campo Valor estimado da ficha de cada processo.",
  },
  {
    numero: "24",
    titulo: "Orçamento sigiloso",
    resumo: [
      "O orçamento estimado pode ficar em sigilo, desde que justificado, sem impedir a divulgação do detalhamento dos quantitativos. Os órgãos de controle continuam tendo acesso.",
    ],
    noSistema: "O aviso de licitação na prévia do diário: com orçamento sigiloso, tire a frase do valor.",
  },
  {
    numero: "54",
    titulo: "Publicidade do edital",
    resumo: [
      "O edital e seus anexos são divulgados no Portal Nacional de Contratações Públicas (PNCP). O extrato também é publicado no diário oficial do ente e em jornal diário de grande circulação.",
    ],
    noSistema: "A publicação do edital na agenda e a prévia do aviso para o diário.",
  },
  {
    numero: "55",
    titulo: "Prazos mínimos para propostas e lances",
    resumo: [
      "Os prazos contam da divulgação do edital e dependem do objeto e do critério de julgamento:",
      ...prazosDoArt55,
      "O § 1º diz que mudança no edital exige nova divulgação e reabertura dos prazos, a não ser que a mudança não afete a formulação das propostas.",
    ],
    noSistema: "O simulador de prazos e a data-limite para publicar na Nova contratação.",
  },
  {
    numero: "72",
    titulo: "Contratação direta: o que o processo precisa ter",
    resumo: [
      "Dispensa e inexigibilidade também são processos, instruídos com: a formalização da demanda (e, se for o caso, estudo técnico preliminar, análise de riscos, termo de referência ou projeto); a estimativa de despesa; os pareceres jurídico e técnicos, se for o caso; a compatibilidade com o orçamento; a comprovação de que o contratado preenche os requisitos de habilitação e qualificação mínima; a razão da escolha do contratado; a justificativa do preço; e a autorização da autoridade.",
      "O ato que autoriza a contratação direta, ou o extrato do contrato, é divulgado em sítio eletrônico oficial.",
    ],
    noSistema: "A capa da pasta: dispensa e inexigibilidade aparecem como contratação direta, sem as fases de disputa.",
  },
  {
    numero: "75",
    titulo: "Dispensa de licitação",
    resumo: [
      "Lista os casos em que se pode contratar sem licitar. Entre eles estão os de valor baixo (incisos I e II). O texto da lei traz os valores originais: eles são atualizados todo ano por decreto (art. 182), divulgado no PNCP.",
    ],
    noSistema:
      "O sistema ainda não confere o valor com os limites de dispensa: antes de enquadrar, confira o valor do ano no decreto de atualização, divulgado no PNCP.",
  },
  {
    numero: "164",
    titulo: "Impugnação e pedido de esclarecimento",
    resumo: [
      "Qualquer pessoa pode impugnar o edital por irregularidade, ou pedir esclarecimento sobre ele, até 3 dias úteis antes da data de abertura.",
      "Parágrafo único: a resposta sai em sítio eletrônico oficial em até 3 dias úteis, limitada ao último dia útil anterior à abertura.",
    ],
    noSistema: "Os dois prazos legais da agenda antes de cada sessão: o último dia para impugnar e o último dia para responder.",
  },
  {
    numero: "165",
    titulo: "Recursos e pedido de reconsideração",
    resumo: [
      "Cabe recurso em 3 dias úteis, contados da intimação ou da lavratura da ata, contra atos como o julgamento das propostas, a habilitação ou inabilitação e a anulação ou revogação.",
      "As contrarrazões têm o mesmo prazo, 3 dias úteis, contados da intimação ou da divulgação da interposição do recurso (§ 4º).",
    ],
    noSistema:
      "Os prazos de recurso e de contrarrazões depois da sessão, na agenda e no simulador. As contrarrazões aparecem no fim mais tardio possível, supondo o recurso interposto no último dia; conte da divulgação do recurso de fato.",
  },
  {
    numero: "183",
    titulo: "Contagem dos prazos",
    resumo: [
      "Exclui-se o dia do começo e inclui-se o do vencimento. Prazo em dias úteis só conta dia de expediente; se o começo ou o fim cair em dia sem expediente, passa para o dia útil seguinte.",
    ],
    noSistema: "Todas as contas de prazo do sistema seguem esta regra, com os feriados nacionais.",
  },
];

const POR_NUMERO = new Map(ARTIGOS.map((a) => [a.numero, a]));

export const artigo = (numero: string): ArtigoDaLei | undefined => POR_NUMERO.get(numero);

/** "art. 164, parágrafo único" → "164"; o primeiro artigo citado que o sistema conhece. */
export function artigoDaCitacao(citacao: string): string | undefined {
  for (const m of citacao.matchAll(/art\.?\s*(\d+)/gi)) {
    if (POR_NUMERO.has(m[1])) return m[1];
  }
  return undefined;
}

/** Vizinhos na lista, para navegar ‹ anterior / seguinte ›. */
export function vizinhos(numero: string): { anterior?: ArtigoDaLei; seguinte?: ArtigoDaLei } {
  const i = ARTIGOS.findIndex((a) => a.numero === numero);
  if (i < 0) return {};
  return { anterior: ARTIGOS[i - 1], seguinte: ARTIGOS[i + 1] };
}

export const linkOficial = (numero: string) => `${LEI_14133_OFICIAL}#art${numero}`;
