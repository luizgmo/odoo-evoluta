/**
 * Peças da "mesa de trabalho": página com cabeçalho da ferramenta (faixa marfim no
 * tema claro, ardósia no escuro) e folhas subindo sobre ele, carimbos, folhinhas e os
 * avisos de carregando/erro/vazio. Estilos em src/index.css (bloco MESA DE TRABALHO).
 */
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Copy, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProcessStatusConfig } from "@/constants/process-status";
import { GEN, MARCA } from "@/config/marca";
import { aindaNaoBateu, dataDeCarimbo, giroDoTexto, marcarComoBatido } from "./tinta";
import { tocarBatida } from "@/features/preferencias/som";

/**
 * Tintas com sentido fixo: carmim exige ação, ocre pede atenção, verde é em curso
 * ou feito, violeta é concluído, azul é neutro, grafite é arquivado.
 */
export type Tinta = "azul" | "verde" | "carmim" | "ocre" | "violeta" | "grafite";

interface CarimboProps {
  children: React.ReactNode;
  tinta?: Tinta;
  grande?: boolean;
  /** Inclinação em graus. Sem ela, cada carimbo tem a sua, tirada do texto. */
  giro?: number;
  className?: string;
  /** Bate ao aparecer (use quando ele surge por causa de uma ação da pessoa). */
  bate?: boolean;
  /** Bate de novo sempre que este valor mudar (não na primeira exibição). */
  bateQuando?: unknown;
  /**
   * Bate na primeira vez que aparece nesta visita (a chave identifica o carimbo:
   * "capa-41-EM_ANDAMENTO"). Voltando à tela, ele já está lá, parado.
   */
  bateAoAbrir?: string;
}

/**
 * Tinta de carimbo: borda que "come" o papel e manchas onde faltou tinta.
 * Um filtro por carimbo grande (poucos por tela), com id próprio.
 */
const FiltroDeTinta: React.FC<{ id: string }> = ({ id }) => (
  <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
    <filter id={id} x="-5%" y="-10%" width="110%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="grao" />
      <feDisplacementMap in="SourceGraphic" in2="grao" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="borda" />
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" seed="8" result="manchas" />
      <feColorMatrix in="manchas" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.7" result="mascara" />
      <feComposite in="borda" in2="mascara" operator="in" />
    </filter>
  </svg>
);

const textoDe = (no: React.ReactNode): string =>
  typeof no === "string" || typeof no === "number"
    ? String(no)
    : Array.isArray(no)
      ? no.map(textoDe).join(" ")
      : React.isValidElement<{ children?: React.ReactNode }>(no)
        ? textoDe(no.props.children)
        : "";

export const Carimbo: React.FC<CarimboProps> = ({ children, tinta = "azul", grande, giro, className, bate, bateQuando, bateAoAbrir }) => {
  // Compara com o valor anterior, e não com "primeira vez": no modo estrito do React
  // (usado no desenvolvimento) o efeito roda duas vezes ao montar e bateria sem motivo.
  const anterior = useRef(bateQuando);
  const [batidas, setBatidas] = useState(0);
  // Decidido uma vez, ao montar: bate se ainda não bateu nesta visita
  const [bateAgora] = useState(() => !!bateAoAbrir && aindaNaoBateu(bateAoAbrir));
  const idDoFiltro = `tinta${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  useEffect(() => {
    if (bateAoAbrir) marcarComoBatido(bateAoAbrir);
  }, [bateAoAbrir]);
  // Som discreto (se a pessoa ligou nas preferências): só quando o carimbo bate por um ato
  useEffect(() => {
    if (bate || batidas > 0) tocarBatida();
  }, [bate, batidas]);
  // Antes da pintura: o texto novo já aparece batendo, sem um quadro parado antes
  useLayoutEffect(() => {
    if (Object.is(anterior.current, bateQuando)) return;
    anterior.current = bateQuando;
    setBatidas((n) => n + 1);
  }, [bateQuando]);
  const inclinacao = giro ?? giroDoTexto(textoDe(children));
  return (
    <span
      // chave nova a cada mudança: o navegador reinicia a animação
      key={batidas}
      className={cn(
        "carimbo",
        `tinta-${tinta}`,
        grande && "carimbo-grande",
        (bate || bateAgora || batidas > 0) && "carimbo-bate",
        className,
      )}
      style={
        {
          "--giro": `${inclinacao}deg`,
          ...(grande ? { "--filtro-tinta": `url(#${idDoFiltro})` } : {}),
        } as React.CSSProperties
      }
    >
      {grande && <FiltroDeTinta id={idDoFiltro} />}
      {children}
    </span>
  );
};

/**
 * Carimbo datador de protocolo: o ato em cima, a data no meio e, se houver,
 * o setor ou o número embaixo — dentro de um segundo contorno.
 */
export const CarimboDatado: React.FC<{
  ato: string;
  data: Date | string;
  rodape?: string;
  tinta?: Tinta;
  giro?: number;
  bateAoAbrir?: string;
  className?: string;
}> = ({ ato, data, rodape, tinta = "azul", giro, bateAoAbrir, className }) => (
  <Carimbo tinta={tinta} grande giro={giro} bateAoAbrir={bateAoAbrir} className={cn("carimbo-datado", className)}>
    <span className="carimbo-datado-miolo">
      <span>{ato}</span>
      <span className="carimbo-datado-data">{dataDeCarimbo(data)}</span>
      {rodape && <span className="carimbo-datado-rodape">{rodape}</span>}
    </span>
  </Carimbo>
);

// A tinta de cada situação mora na tabela de situações (constants/process-status.ts, campo `tinta`):
// situação nova com tinta própria = uma linha lá, sem editar este componente.
export const CarimboSituacao: React.FC<{
  status: string;
  grande?: boolean;
  giro?: number;
  bateAoAbrir?: string;
  /** Mapa que sobrepõe a tinta da tabela, valor da situação → tinta (raro: use a tabela). */
  tintas?: Record<string, Tinta>;
}> = ({ status, grande, giro, bateAoAbrir, tintas }) => {
  const config = getProcessStatusConfig(status);
  return (
    <Carimbo tinta={tintas?.[config.value] ?? config.tinta} grande={grande} giro={giro} bateAoAbrir={bateAoAbrir}>
      {config.label}
    </Carimbo>
  );
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Folhinha de calendário: mês na faixa carmim, dia grande, dia da semana embaixo. */
export const Folhinha: React.FC<{ data: Date }> = ({ data }) => (
  <span className="folhinha" aria-hidden="true">
    <b>{MESES[data.getMonth()]}</b>
    <span>{String(data.getDate()).padStart(2, "0")}</span>
    <small>{DIAS_SEMANA[data.getDay()]}</small>
  </span>
);

interface MesaPaginaProps {
  /** Informação acima do título (ex.: número e categoria do item). Sem ela, nada aparece. */
  rotulo?: React.ReactNode;
  titulo: string;
  subtitulo?: React.ReactNode;
  /** Carimbo ao lado do rótulo (ex.: situação do item). */
  carimbo?: React.ReactNode;
  /** Para onde o botão Voltar leva; sem ele, não há botão. */
  voltarPara?: string;
  voltarRotulo?: string;
  /** Mostra o botão Imprimir e prepara a página para o papel. */
  imprimivel?: boolean;
  acoes?: React.ReactNode;
  /**
   * Cabeçalho baixo, para as telas de um processo: o título (objeto do processo,
   * que se repete nas 8 ferramentas) vira uma linha de contexto e a faixa encolhe.
   */
  compacto?: boolean;
  children: React.ReactNode;
}

/** Mesma largura e mesmo recuo na faixa e nas folhas, para título, abas e folha alinharem. */
const LARGURA = "mx-auto w-full max-w-[1400px]";
const RECUO = "px-4 md:px-8";

export const MesaPagina: React.FC<MesaPaginaProps> = ({
  rotulo,
  titulo,
  subtitulo,
  carimbo,
  voltarPara,
  voltarRotulo = "Voltar",
  imprimivel,
  acoes,
  compacto,
  children,
}) => {
  const navigate = useNavigate();
  return (
    // Encosta nas bordas da folha: o main tem p-4 no celular e p-6 do tablet para cima
    <div className={cn("mesa -m-4 min-h-[calc(100%+2rem)] md:-m-6 md:min-h-[calc(100%+3rem)]", imprimivel && "area-impressao")}>
      <div className={cn("mesa-faixa nao-imprimir", RECUO, compacto ? "pb-12 pt-4" : "pb-14 pt-5")}>
        <div className={cn(LARGURA, "flex flex-wrap items-end gap-x-4 gap-y-2")}>
          {voltarPara && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(voltarPara)}
              aria-label={voltarRotulo}
              className="shrink-0 self-start text-inherit hover:bg-[hsl(var(--mesa-noite-texto)/0.08)] hover:text-inherit"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            {(rotulo || carimbo) && (
              <div className="mb-2 flex flex-wrap items-center gap-3">
                {rotulo && <div className="flex flex-wrap items-center gap-3 text-sm mesa-faixa-apoio">{rotulo}</div>}
                {carimbo}
              </div>
            )}
            <h1
              className={cn(
                "mesa-titulo",
                // leading-* explícito: o text-* das utilities apagaria a altura de linha da classe
                compacto ? "line-clamp-1 text-lg leading-snug md:text-xl" : "line-clamp-2 text-2xl leading-tight md:text-3xl",
              )}
              title={titulo}
            >
              {titulo}
            </h1>
            {subtitulo && <div className="mt-1.5 max-w-3xl text-sm mesa-faixa-apoio">{subtitulo}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            {acoes}
            {imprimivel && (
              <Button onClick={() => window.print()} variant="secondary">
                <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                Imprimir
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className={cn(RECUO, "-mt-10 pb-12")}>
        <div className={LARGURA}>{children}</div>
      </div>
    </div>
  );
};

export const MesaCarregando: React.FC<{ texto?: string }> = ({ texto = "Buscando as pastas…" }) => (
  <div className="folha-simples flex items-center gap-3 p-5 mesa-apoio" role="status">
    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
    {texto}
  </div>
);

export const MesaAviso: React.FC<{ titulo: string; children?: React.ReactNode; tinta?: Tinta }> = ({
  titulo,
  children,
  tinta = "azul",
}) => (
  // Aviso é mensagem, não veredito: título na tinta do caso, alinhado à esquerda,
  // no lugar onde o conteúdo estaria (sem faixa larga e vazia).
  // Carmim é erro: o leitor de tela anuncia assim que aparece (o "carregando" some calado)
  <div className="folha-simples p-5" role={tinta === "carmim" ? "alert" : undefined}>
    <p className={cn("mesa-secao", `tinta-${tinta}`)}>{titulo}</p>
    {children && <div className="mt-1.5 max-w-prose text-sm mesa-apoio">{children}</div>}
  </div>
);

/** Falha ao buscar (rede, servidor): o mesmo aviso em todas as telas, com "Tentar de novo". */
export const MesaErroBusca: React.FC<{ titulo: string; texto?: string; onTentarDeNovo?: () => void }> = ({
  titulo,
  texto = `Tente de novo em instantes. Se continuar, avise ${MARCA.equipeDeSuporte}.`,
  onTentarDeNovo,
}) => (
  <MesaAviso titulo={titulo} tinta="carmim">
    <p>{texto}</p>
    {onTentarDeNovo && (
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onTentarDeNovo}>
        Tentar de novo
      </Button>
    )}
  </MesaAviso>
);

/** Uma atualização falhou, mas o que já estava na tela continua valendo. */
export const AvisoAtualizacaoFalhou: React.FC<{ onTentarDeNovo: () => void }> = ({ onTentarDeNovo }) => (
  <div role="status" className="nao-imprimir mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed borda-tinta-carmim bg-[hsl(var(--mesa-papel))] p-3 text-sm tinta-carmim">
    <span>A última atualização falhou; mostrando o que já tinha chegado.</span>
    <Button type="button" variant="outline" size="sm" onClick={onTentarDeNovo}>
      Tentar de novo
    </Button>
  </div>
);

/** Copia um texto e confirma por 2,5 s; se o navegador recusar, nada muda. */
export const BotaoCopiar: React.FC<{ texto: string; rotulo: string; variante?: "outline" | "default" }> = ({
  texto,
  rotulo,
  variante = "outline",
}) => {
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2500);
    return () => clearTimeout(t);
  }, [copiado]);
  const copiar = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(texto).then(
      () => setCopiado(true),
      () => setCopiado(false),
    );
  };
  return (
    <Button type="button" variant={variante} size="sm" onClick={copiar} disabled={!texto}>
      {copiado ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : <Copy className="mr-2 h-4 w-4" aria-hidden="true" />}
      {copiado ? "Copiado" : rotulo}
    </Button>
  );
};

/** Aviso honesto de que a lista mostra só parte dos itens. Para o desenvolvedor: o limite vem da busca ao servidor. */
export const AvisoListaParcial: React.FC<{ exibidos: number; total: number }> = ({ exibidos, total }) =>
  total > exibidos ? (
    <p className="nao-imprimir mb-6 rounded-md border border-dashed borda-tinta-ocre bg-[hsl(var(--mesa-papel))] p-3 text-sm tinta-ocre">
      Mostrando {exibidos} de {total} {MARCA.objeto.plural}, o mesmo limite da lista hoje. Para ver {GEN.os} demais, use a
      busca ou os filtros.
    </p>
  ) : null;
