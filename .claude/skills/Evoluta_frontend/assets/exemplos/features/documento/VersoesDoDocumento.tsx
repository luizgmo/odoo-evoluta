// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Versões do documento (proposta 7, tela 9): nada se apaga; restaurar cria uma
 * versão nova. Cada versão diz de onde veio, e dá para comparar com a anterior.
 */
import React, { useState } from "react";
import { GitCompare, Loader2, RotateCcw } from "lucide-react";
import type { DocumentRevision } from "@/services/api/endpoints/document-revisions";
import { Button } from "@/components/ui/button";
import { Carimbo } from "@/components/mesa/Mesa";
import { ConfirmarAto } from "@/components/mesa/ConfirmarAto";
import { cn } from "@/lib/utils";
import { diffDeLinhas, soAsMudancas } from "./diffDeLinhas";
import { origemDaVersao } from "./versoes";

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    // registro de autoria de documento oficial: o ano faz falta na virada do ano
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface Props {
  versoes: DocumentRevision[];
  emUsoId?: string;
  restaurandoId: string | null;
  onRestaurar: (v: DocumentRevision) => Promise<void> | void;
  /** Há texto escrito na aba Conteúdo que não foi salvo: restaurar o substitui. */
  rascunhoNaoSalvo?: boolean;
}

export const VersoesDoDocumento: React.FC<Props> = ({
  versoes,
  emUsoId,
  restaurandoId,
  onRestaurar,
  rascunhoNaoSalvo,
}) => {
  const [comparandoId, setComparandoId] = useState<string | null>(null);
  const [aRestaurar, setARestaurar] = useState<DocumentRevision | null>(null);
  const ordenadas = [...versoes].sort(
    (a, b) => b.revision_number - a.revision_number,
  );
  const ultima = ordenadas[0]?.revision_number ?? 0;

  if (ordenadas.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não há versões deste documento.
      </p>
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {ordenadas.length === 1 ? "1 versão" : `${ordenadas.length} versões`}.
        Nada se apaga: restaurar cria uma versão nova.
      </p>
      <ol className="space-y-3">
        {ordenadas.map((v) => {
          const origem = origemDaVersao(v);
          const anterior = ordenadas.find(
            (x) => x.revision_number < v.revision_number,
          );
          const comparando = comparandoId === v.id && anterior;
          const emUso = v.id === emUsoId;
          return (
            <li
              key={v.id}
              data-testid={`revision-${v.revision_number}`}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-xl font-semibold">
                      nº {v.revision_number}
                    </span>
                    {emUso && <Carimbo tinta="verde">Em uso</Carimbo>}
                  </div>
                  <p className="mt-1 text-sm">
                    <span
                      className={cn("font-semibold", `tinta-${origem.tinta}`)}
                    >
                      {origem.texto}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {quando(v.created_at)}
                    </span>
                  </p>
                  {v.notes && (
                    <p className="mt-1 text-sm italic text-muted-foreground">
                      “{v.notes}”
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {anterior && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-expanded={!!comparando}
                      onClick={() => setComparandoId(comparando ? null : v.id)}
                    >
                      <GitCompare
                        className="mr-1 h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      {comparando
                        ? "Fechar comparação"
                        : `Comparar com a nº ${anterior.revision_number}`}
                    </Button>
                  )}
                  {!emUso && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setARestaurar(v)}
                      disabled={restaurandoId === v.id}
                    >
                      {restaurandoId === v.id ? (
                        <Loader2
                          className="mr-1 h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <RotateCcw
                          className="mr-1 h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      )}
                      Restaurar
                    </Button>
                  )}
                </div>
              </div>

              {comparando && anterior && (
                <div
                  className="mt-3 rounded-md border border-border bg-background/60 p-3"
                  aria-label={`O que mudou da nº ${anterior.revision_number} para a nº ${v.revision_number}`}
                >
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">
                    O que mudou da nº {anterior.revision_number} para a nº{" "}
                    {v.revision_number} ·{" "}
                    <span className="tinta-verde">+ entrou</span> ·{" "}
                    <span className="tinta-carmim">− saiu</span>
                  </p>
                  {(anterior.content ?? "") === (v.content ?? "") ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma diferença de texto entre as duas versões.
                    </p>
                  ) : (
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
                      {soAsMudancas(
                        diffDeLinhas(anterior.content ?? "", v.content ?? ""),
                      ).map((l, k) =>
                        l.tipo === "pulo" ? (
                          <span key={k} className="block text-muted-foreground">
                            ⋯
                          </span>
                        ) : (
                          <span
                            key={k}
                            className={cn(
                              "block",
                              l.tipo === "entrou" && "tinta-verde",
                              l.tipo === "saiu" && "tinta-carmim line-through",
                              l.tipo === "igual" && "text-muted-foreground",
                            )}
                          >
                            {l.tipo === "entrou"
                              ? "+ "
                              : l.tipo === "saiu"
                                ? "− "
                                : "  "}
                            {l.texto}
                          </span>
                        ),
                      )}
                    </pre>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <ConfirmarAto
        aberto={!!aRestaurar}
        onAbertoChange={(a) => !a && setARestaurar(null)}
        origem="Versões do documento"
        pergunta={`Restaurar a versão nº ${aRestaurar?.revision_number ?? ""}?`}
        carimbo="Restauração"
        tinta="ocre"
        motivo="nenhum"
        consequencia={
          <>
            Nada se apaga: o texto da nº {aRestaurar?.revision_number} vira a
            versão nº {ultima + 1}, e a atual continua guardada.
            {rascunhoNaoSalvo && (
              <strong className="mt-2 block text-destructive">
                O que você escreveu na aba Conteúdo e ainda não salvou se perde.
              </strong>
            )}
          </>
        }
        rotuloConfirmar={`Restaurar a nº ${aRestaurar?.revision_number ?? ""}`}
        rotuloVoltar="Não restaurar"
        onConfirmar={async () => {
          if (aRestaurar) await onRestaurar(aRestaurar);
        }}
      />
    </div>
  );
};
