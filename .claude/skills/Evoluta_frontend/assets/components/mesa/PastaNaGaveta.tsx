/**
 * Um processo como pasta na gaveta de arquivo: orelha com o número, lombada,
 * clipe, carimbo da situação e os dados principais. O título é o link para o
 * processo e cobre a pasta inteira; o botão de excluir fica por cima dele.
 *
 * Padrões de DOMÍNIO (licitação): o aviso "Falta a data de abertura", o marcador
 * FasesEmBolinhas e a espessura por fase. Em outro sistema, passe `aviso={null}`,
 * `progresso={null}` (ou o seu) e `espessura={1}` em TODA chamada (Lista.tsx) — assim o
 * marcador deixa de aparecer. NÃO apague fasesDaLicitacao.ts: os imports estáticos daqui
 * (e os de PastaDoProcesso, listaDeProcessos.ts e montarAgenda.ts) continuam, e o tsc quebra;
 * neutralize o conteúdo mantendo a assinatura. Só FasesEmBolinhas.tsx (importada apenas por
 * este arquivo) pode sair, junto com o import e o padrão do `progresso`.
 */
import React from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Process } from "@/types/process";
import { daAba } from "@/features/processos/listaDeProcessos";
import { CarimboSituacao } from "./Mesa";
import { FasesEmBolinhas } from "./FasesEmBolinhas";
import { espessuraDaPasta } from "./fasesDaLicitacao";
import { GEN, MARCA } from "@/config/marca";

interface Dado {
  rotulo: string;
  valor: string;
}

interface Props {
  processo: Process;
  /** Posição da orelha (0, 1, 2…): as orelhas se escalonam para não ficarem uma sobre a outra. */
  posicao: number;
  dados: Dado[];
  /** Sem esta função, o botão de excluir não aparece. */
  onExcluir?: () => void;
  /**
   * Faixa de aviso ao lado do rótulo (nota amarela). Padrão do exemplo: "Falta a data de
   * abertura" quando o processo não tem a data. Passe `null` para não mostrar nenhuma.
   */
  aviso?: React.ReactNode;
  /** Marcador de progresso sob o título. Padrão: as fases da licitação (FasesEmBolinhas); `null` esconde. */
  progresso?: React.ReactNode;
  /** Espessura da pasta (1 a 3). Padrão: calculada pelas fases da licitação. */
  espessura?: 1 | 2 | 3;
  /** Rota do item; o id é acrescentado. Padrão MARCA.rotaDaLista. */
  rotaBase?: string;
  /** Como o sistema chama a pasta, para os rótulos de acessibilidade. Padrão MARCA.objeto.singular. */
  nomeDoObjeto?: string;
}

/**
 * Com entidade própria (sem processo licitatório), troque `Process` por ela e passe
 * `aviso`, `progresso` e `espessura` — assim a pasta não depende de nada da licitação.
 */
export const PastaNaGaveta: React.FC<Props> = ({
  processo,
  posicao,
  dados,
  onExcluir,
  aviso,
  progresso,
  espessura,
  rotaBase = MARCA.rotaDaLista,
  nomeDoObjeto = MARCA.objeto.singular,
}) => {
  const semAbertura = daAba([processo], "sem-data").length > 0;
  const textoDeAviso = aviso !== undefined ? aviso : semAbertura ? MARCA.campos.faltaData : null;
  return (
    <article className="pasta-gaveta" style={{ "--pos": posicao % 3 } as React.CSSProperties}>
      <span className="pasta-orelha">
        {/* A orelha tem altura fixa: número longo termina em reticências, inteiro no title */}
        {processo.code && (
          <span className="etiqueta-pasta min-w-0 max-w-full truncate text-foreground" title={processo.code}>
            {processo.code}
          </span>
        )}
      </span>
      <div className="pasta-corpo group" style={{ "--espessura": espessura ?? espessuraDaPasta(processo) } as React.CSSProperties}>
        <i className="pasta-lombada" aria-hidden="true" />
        <i className="clipe-de-papel" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {processo.modality?.name && <span className="mesa-rotulo mesa-apoio">{processo.modality.name}</span>}
          {textoDeAviso && (
            <span className="rounded-[3px] border border-[hsl(var(--gold)/0.45)] bg-[hsl(var(--gold)/0.14)] px-2.5 py-1 text-xs [transform:rotate(1.2deg)]">
              {textoDeAviso}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1">
            <CarimboSituacao status={processo.status} />
            {onExcluir && (
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Excluir ${GEN.o} ${nomeDoObjeto} ${processo.code || processo.object || processo.id}`}
                data-testid={`delete-process-${processo.id}`}
                className="relative z-10 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onExcluir}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold leading-snug text-foreground">
          <Link
            to={`${rotaBase}/${processo.id}`}
            className={cn(
              "transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-primary dark:group-hover:text-accent",
              "focus-visible:outline-none focus-visible:after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-ring",
            )}
          >
            {processo.object || MARCA.objeto.semDescricao}
          </Link>
        </h2>
        {processo.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{processo.description}</p>}
        {progresso !== undefined ? progresso : <FasesEmBolinhas processo={processo} />}
        {dados.length > 0 && (
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">
            {dados.map(({ rotulo, valor }) => (
              <div key={rotulo} className="min-w-0">
                <dt className="mesa-rotulo mesa-apoio">{rotulo}</dt>
                <dd className="break-words text-sm font-semibold text-foreground">{valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
};
