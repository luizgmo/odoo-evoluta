/**
 * TROCAR por sistema: tudo o que muda de um sistema Evoluta para outro mora aqui —
 * nome, logo, frases, ação principal, destinos do celular, palavras do objeto de
 * trabalho e chaves de armazenamento. A faixa do alto, o menu, a barra do celular,
 * a busca, os atalhos, a tela de entrada e a agenda leem daqui.
 * A assinatura Evoluta (AssinaturaEvoluta) NÃO entra aqui: ela é fixa.
 */
/** Rota da tela inicial: um só lugar, lido por `rotaInicial` e por `destinosDoCelular`. */
const ROTA_INICIAL = "/dashboard";
/** Rota da lista do objeto principal: App.tsx a registra; o menu, a busca, os atalhos e as pastas a leem daqui. A rota do item é `${ROTA_DA_LISTA}/:id`. */
export const ROTA_DA_LISTA = "/projetos";

export const MARCA = {
  /** Nome curto do produto: "Meu Sistema", "Contratos"… */
  nome: "Evoluta Gestão",
  /**
   * Logo do produto, em public/: PNG com fundo transparente, pensado para o azul-noite
   * (texto claro), com proporção entre 2:1 e 4:1 de largura por altura (o logo-produto-modelo.svg é 4:1; o PNG de exemplo, 857x435, é ≈2:1; o da Evoluta, 480x120).
   * Aparece com altura h-9 (celular), h-12 (sm) e h-14 (md+); a largura segue a proporção.
   * O modelo genérico abaixo é trocado pelo logo do produto.
   */
  logo: "/logo-gestao.svg",
  /** Nome da tela inicial, usado no texto alternativo do logo. */
  inicio: "Minha Mesa",
  /** Nome da tela inicial na barra do celular e no menu recolhido (cabe em ~90px). */
  inicioCurto: "Mesa",
  /** Rota da tela inicial: App.tsx a registra, o menu e a barra do celular a leem daqui. */
  rotaInicial: ROTA_INICIAL,
  /** Rota da lista do objeto principal (ex.: "/reservas"): troque junto com `atalhoDaLista` se a letra P não fizer sentido. */
  rotaDaLista: ROTA_DA_LISTA,
  /** Alt + esta letra abre a lista. Evite colidir com `acaoPrincipal.atalho` (preferencias.ts avisa no console em dev). */
  atalhoDaLista: "P",
  /** Frase grande do painel azul da tela de entrada. */
  frase: "A mesa de trabalho da gestão municipal.",
  /** Parágrafo abaixo da frase. */
  apoio: "Projetos, planos e prazos da prefeitura num só lugar, cada coisa na sua pasta.",
  /** Três marcadores do painel azul. */
  marcadores: [
    "Cada projeto em uma pasta",
    "5W2H e aprovações no fluxo",
    "Indicadores sempre à vista",
  ],
  /** Linha pequena no pé do painel azul (antes dos direitos). */
  rodape: "",
  /** Texto do pé da tela de entrada: quem dá o convite. */
  quemConvida: "o administrador do município",
  /** Endereços dos documentos citados no pé da entrada. Vazios = a frase "Ao entrar, você concorda…" não aparece. */
  links: { termos: "" as string, privacidade: "" as string },
  /** Cartão marfim da tela de entrada. */
  entrada: {
    /** Linha pequena acima do título. EXEMPLO DE DOMÍNIO — troque ("servidor" = servidor público; ex.: "Acesso da equipe"). */
    rotulo: "Acesso da equipe",
    subtitulo: "Use o usuário e a senha que a sua prefeitura cadastrou.",
    /** Carimbo no canto do cartão: ato em cima, quem pode embaixo. */
    carimbo: "Uso restrito",
    carimboRodape: "pessoas autorizadas",
  },

  /**
   * Gaveta "Lei ao lado" e grupo "Na lei" da busca rápida: só fazem sentido em sistema
   * de licitação (exemplo de domínio). `false` = a gaveta não é montada e a busca não
   * mostra o grupo. Padrão da base neutra: `false`. Para ligar, ponha `true`, preencha
   * `ARTIGOS`/`LEI_NOME` em features/lei/artigos.ts e, se houver tela de lista, `LEI_ROTA_DA_LISTA`.
   */
  leiAoLado: false,

  /** Quem o usuário avisa quando algo falha: "avise {equipeDeSuporte}". */
  equipeDeSuporte: "a equipe Evoluta",

  /** Como o sistema chama o objeto principal do trabalho (a pasta). */
  objeto: {
    singular: "projeto",
    plural: "projetos",
    /** Gênero gramatical do singular: "m" (o processo) ou "f" (a ordem de serviço). Os textos concordam por ele (veja `GEN`). */
    genero: "m",
    /** Linha pequena acima do número, na capa completa da pasta ("Processo licitatório", "Contrato", "Chamado"…). */
    rotuloDaCapa: "Projeto",
    /** Título da pasta quando o item não tem objeto/descrição preenchido. */
    semDescricao: "Projeto sem objeto descrito",
    /** Quando o item não tem número/código. */
    semNumero: "Sem número",
    /** Quando a pasta não traz o agrupamento principal (modalidade, categoria, tipo…). */
    semAgrupamento: "Sem secretaria",
  },

  /**
   * Rótulos dos campos do objeto, nas pastas, listas, formulário e agenda.
   * EXEMPLO DE DOMÍNIO — troque todos pelos do seu sistema (os valores abaixo são de licitação).
   * Quem usa: PastaDoProcesso (`fases` = aria-label da lista de fases), PastaNaGaveta, FasesEmBolinhas,
   * ResumoDaPasta, Lista e listaDeProcessos (`arquivo`), Inicio (`resumoDoDia`), Item, Formulario, Agenda,
   * Paineis (`paineisTrilha`, `paineisMontando`, `paineisSituacao`, `paineisPorSituacao`, `paineisTitulo`,
   * `paineisApoio`), PecasDosAutos (`rubrica`), CalendarioDeMesa (`feriadoNota`, `prazo`, `evento`),
   * navegacao.ts (`arquivo`, `paineisTrilha`, `agenda`), AuthContext (`paineisTrilha`), useMesaDados
   * (`prefixoDoCodigo`, `responsavelPadrao`) e montarAgenda.ts (PRODID, e os seis marcos em `eventos`).
   */
  campos: {
    /** Rótulo do texto do objeto (a descrição que o usuário digita): formulário, ficha e busca da lista. */
    objeto: "Objeto",
    /** Agrupamento principal do item (modalidade, categoria, tipo…). */
    agrupamento: "Secretaria",
    /** Data principal do item. */
    data: "Prazo final",
    /** Item sem a data principal (aba da lista, painel, agenda). */
    semData: "Sem prazo",
    /** Aviso amarelo na pasta da gaveta. */
    faltaData: "Falta o prazo",
    /** Valor do item. */
    valor: "Orçamento",
    responsavel: "Responsável",
    /** Etapa em que o item está. */
    fase: "Etapa",
    /** Nome da etapa no marcador de progresso: "Fase 3 de 7: Julgamento" (FasesEmBolinhas). */
    faseRotulo: "Etapa",
    /** Frase abaixo das fases na capa; segue "do/da {singular}. {explicação}". */
    faseEstimada: "Fase estimada pelas datas",
    /** Quando o item não passa pelas fases (caso especial do fluxo) e a nota que explica. */
    contratacaoDireta: "Acompanhamento direto",
    contratacaoDiretaNota: "não passa pelas etapas. As fases estão na linha do tempo, abaixo.",
    /** Título do quadro dos documentos concluídos, na capa. */
    documentos: "Documentos principais",
    /** Carimbo datado da capa (quando o item foi criado). */
    criadoEm: "Aberto",
    /** Ordenações da lista. */
    ordemPorData: "Prazo mais próximo",
    ordemPorValor: "Maior orçamento",
    /** Legenda dos compromissos da agenda: o que tem consequência e o que só marca o dia. */
    prazo: "Prazo",
    evento: "Evento",
    /** Valor de `tipo` do compromisso que ganha a moldura dupla azul no calendário (o que `evento` rotula). */
    tipoDoEvento: "sessao",
    /** Nome da tela de agenda. */
    agenda: "Prazos e agenda",
    /** Legenda do dia de folga no calendário ("12" em carmim). */
    feriadoNota: "feriado: não conta como dia útil",
    /** Nome da tela de painéis, na trilha e no apoio do perfil. */
    paineisTrilha: "Painéis",
    paineisMontando: "Montando os painéis…",
    /** Títulos das duas páginas do livro de painéis. */
    paineisSituacao: "Situação geral",
    paineisPorSituacao: "Por situação",
    /** Título e apoio da tela de painéis (Paineis.tsx). */
    paineisTitulo: "Onde os trabalhos estão",
    paineisApoio: "O que está em andamento e o que vence nos próximos dias.",
    /** Bloco azul da Minha Mesa. */
    resumoDoDia: "Resumo do dia",
    /** Nome da tela dos itens encerrados ("Arquivo"). */
    arquivo: "Arquivo",
    /** Rótulo acessível do marcador de fases (aria-label da lista de fases da pasta). */
    fases: "Fases",
    /** Prefixo do código dos itens de demonstração e responsável padrão (useMesaDados.ts). */
    prefixoDoCodigo: "EVG-2026-",
    responsavelPadrao: "Equipe gestora",
    /** Linha de assinatura sob os documentos (Rubrica, em components/mesa/PecasDosAutos.tsx). */
    rubrica: "Nome e matrícula",
    /**
     * Os seis marcos que montarAgenda cria para cada item (título que o usuário lê e a regra
     * que o justifica, que vai também para o .ics). As chaves são os `tipo` dos compromissos;
     * troque os textos. Os de LICITAÇÃO (edital, impugnação, sessão, art. 164…) estão em
     * exemplos/features/agenda/eventosDeLicitacao.ts, para colar aqui se o sistema for de licitação.
     */
    eventos: {
      publicacao: { titulo: "Abertura do prazo", fundamento: "regra do exemplo" },
      impugnacao: { titulo: "Último dia para contestar", fundamento: "regra do exemplo" },
      resposta: { titulo: "Último dia para responder", fundamento: "regra do exemplo" },
      sessao: { titulo: "Evento principal", fundamento: "regra do exemplo" },
      recurso: { titulo: "Fim do prazo de recurso (se houver)", fundamento: "regra do exemplo" },
      contrarrazoes: { titulo: "Fim do prazo de resposta ao recurso (se houver)", fundamento: "regra do exemplo" },
    },
  },

  /**
   * Ação principal: botão azul no alto do menu, 4º atalho do celular, item da busca e
   * atalho Alt+letra. `caminho` é a rota do formulário de criação: App.tsx registra
   * o Formulario nesse caminho (troque aqui e a rota acompanha). Evite uma letra de
   * `atalho` que colida com M, P ou A (início, lista, agenda): ver preferencias.ts.
   */
  acaoPrincipal: {
    rotulo: "Novo plano",
    /** Rótulo curto da barra do celular (cabe em ~90px). */
    curto: "Novo",
    caminho: `${ROTA_DA_LISTA}/new`,
    /** Alt + esta letra. */
    atalho: "N",
    /** Palavras extras para a busca rápida achar a ação. */
    sinonimos: "criar novo cadastrar",
  },

  /** Os três primeiros destinos da barra do celular, na ordem em que aparecem (a ação principal é o quarto). Cada caminho precisa existir em navegacao.ts. */
  destinosDoCelular: [ROTA_INICIAL, ROTA_DA_LISTA, "/agenda"] as readonly string[],

  /**
   * Prefixo das chaves guardadas no navegador (preferências, menu recolhido, carimbos
   * que já bateram). Troque por sistema para que dois sistemas na mesma máquina e no
   * mesmo endereço não pisem nas escolhas um do outro.
   */
  prefixoDeArmazenamento: "evoluta-gestao",

  /** Agenda exportada (.ics). */
  agenda: {
    /** Domínio do UID de cada evento. */
    dominio: "evoluta-gestao.exemplo",
    /** Aparece em PRODID e na descrição dos eventos. */
    produto: "Evoluta Gestão",
  },
} as const;

const feminino = (MARCA.objeto.genero as string) === "f";

/**
 * Concordância do objeto principal, pelo gênero de `MARCA.objeto.genero`. Use no lugar de
 * escrever "o"/"este"/"nenhum" fixo: `Nenhum ${...}` vira `${GEN.nenhum} ${singular}`,
 * "encontrado" vira `encontrad${GEN.fim}`. Os plurais usam `GEN.os` / `GEN.todos`.
 * Contrações: `GEN.do`/`dos` (de + o), `GEN.no`/`nos` (em + o), `GEN.pelo`/`pelos`, `GEN.ao`.
 * Nunca escreva "de ${GEN.o}" (sai "de a matrícula"): use `${GEN.do}`.
 */
export const GEN = {
  o: feminino ? "a" : "o",
  os: feminino ? "as" : "os",
  um: feminino ? "uma" : "um",
  do: feminino ? "da" : "do",
  dos: feminino ? "das" : "dos",
  no: feminino ? "na" : "no",
  nos: feminino ? "nas" : "nos",
  pelo: feminino ? "pela" : "pelo",
  pelos: feminino ? "pelas" : "pelos",
  ao: feminino ? "à" : "ao",
  deles: feminino ? "delas" : "deles",
  algum: feminino ? "alguma" : "algum",
  este: feminino ? "esta" : "este",
  deste: feminino ? "desta" : "deste",
  nenhum: feminino ? "nenhuma" : "nenhum",
  todos: feminino ? "todas" : "todos",
  /** Versões com inicial maiúscula, para começo de frase. */
  O: feminino ? "A" : "O",
  Este: feminino ? "Esta" : "Este",
  Nenhum: feminino ? "Nenhuma" : "Nenhum",
  Todos: feminino ? "Todas" : "Todos",
  /** Vogal final de adjetivos e particípios: `encontrad${GEN.fim}`, `ativ${GEN.fim}s`. */
  fim: feminino ? "a" : "o",
} as const;

/** Chave de armazenamento do sistema: `chave("menu-lateral")` → "evoluta-gestao.menu-lateral". */
export const chaveDoSistema = (nome: string) => `${MARCA.prefixoDeArmazenamento}.${nome}`;
