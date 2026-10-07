// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Gaveta "Lei ao lado" (proposta 7, tela 26): abre à direita sobre a tela,
 * sem tirar a pessoa do que está fazendo. Resumo do artigo, a conta "no seu
 * caso" quando a tela a conhece, o texto oficial e ‹ anterior / seguinte ›.
 * Fecha com × ou Esc.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Carimbo, BotaoCopiar } from "@/components/mesa/Mesa";
import { artigo, linkOficial, vizinhos } from "./artigos";
import { ContextoLeiAoLado } from "./contextoDaLei";

interface Aberto {
  numero: string;
  noSeuCaso?: string;
}

export const GavetaDaLei: React.FC<{ aberto: Aberto | null; onFechar: () => void; onIr: (numero: string) => void }> = ({
  aberto,
  onFechar,
  onIr,
}) => {
  const a = aberto ? artigo(aberto.numero) : undefined;
  const { anterior, seguinte } = aberto ? vizinhos(aberto.numero) : {};
  const titulo = useRef<HTMLHeadingElement>(null);
  // Ao trocar de artigo (‹ ›), o leitor de tela e o teclado recomeçam do título
  useEffect(() => {
    titulo.current?.focus();
  }, [aberto?.numero]);
  return (
    <Sheet open={!!a} onOpenChange={(v) => !v && onFechar()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-5 overflow-y-auto sm:max-w-md"
        onOpenAutoFocus={(e) => {
          // Começa no título do artigo, não no primeiro botão
          e.preventDefault();
          titulo.current?.focus();
        }}
      >
        {a && (
          <>
            <SheetHeader className="space-y-1 text-left">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Lei nº 14.133/2021 · aberta ao lado
              </p>
              <SheetTitle ref={titulo} tabIndex={-1} className="font-display text-3xl font-semibold leading-tight focus:outline-none">Art. {a.numero}</SheetTitle>
              <SheetDescription className="text-base text-foreground">{a.titulo}</SheetDescription>
            </SheetHeader>

            {aberto?.noSeuCaso && (
              <div className="rounded-md border border-border bg-card p-4">
                <Carimbo tinta="carmim">No seu caso</Carimbo>
                <p className="mt-2 text-sm">{aberto.noSeuCaso}</p>
              </div>
            )}

            <section aria-labelledby="lei-resumo" className="space-y-2">
              <h3 id="lei-resumo" className="font-sans text-sm font-semibold">
                Em linguagem comum
              </h3>
              <div className="documento-oficial space-y-2 text-base">
                {a.resumo.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Resumo para orientar; não substitui o texto da lei. Antes de citar num documento, confira o texto oficial.
              </p>
            </section>

            <section aria-labelledby="lei-no-sistema" className="space-y-1">
              <h3 id="lei-no-sistema" className="font-sans text-sm font-semibold">
                Onde o sistema usa
              </h3>
              <p className="text-sm text-muted-foreground">{a.noSistema}</p>
            </section>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={linkOficial(a.numero)} target="_blank" rel="noopener noreferrer">
                  Ler o texto oficial
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only"> (abre o site do Planalto em outra aba)</span>
                </a>
              </Button>
              <BotaoCopiar texto={`art. ${a.numero} da Lei nº 14.133/2021`} rotulo="Copiar a referência" />
            </div>

            <nav aria-label="Outros artigos" className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4 text-sm">
              {anterior ? (
                <Button variant="ghost" size="sm" onClick={() => onIr(anterior.numero)}>
                  ‹ Art. {anterior.numero}
                </Button>
              ) : (
                <span />
              )}
              <Link to="/library#lei" onClick={onFechar} className="font-semibold text-primary hover:underline dark:text-accent">
                Todos na Biblioteca
              </Link>
              {seguinte ? (
                <Button variant="ghost" size="sm" onClick={() => onIr(seguinte.numero)}>
                  Art. {seguinte.numero} ›
                </Button>
              ) : (
                <span />
              )}
            </nav>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export const LeiAoLadoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aberto, setAberto] = useState<Aberto | null>(null);
  const abrir = useCallback((numero: string, noSeuCaso?: string) => setAberto({ numero, noSeuCaso }), []);
  const api = useMemo(() => ({ abrir }), [abrir]);
  return (
    <ContextoLeiAoLado.Provider value={api}>
      {children}
      <GavetaDaLei aberto={aberto} onFechar={() => setAberto(null)} onIr={(numero) => setAberto({ numero })} />
    </ContextoLeiAoLado.Provider>
  );
};
