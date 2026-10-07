/**
 * Moldura das telas de entrada (login e recuperação de senha), no estilo
 * Workspace Evoluta: painel azul com os logos e o que o sistema faz, e a
 * folha marfim com o formulário.
 */
import React from "react";
import { AssinaturaEvoluta } from "@/components/layout/AssinaturaEvoluta";
import { MARCA } from "@/config/marca";

/** Campo das telas de entrada (com ícone à esquerda). */
export const CAMPO_DE_ENTRADA = [
  "h-11 pl-11 bg-background border-border text-foreground placeholder:text-muted-foreground",
  "focus:border-ring focus:ring-2 focus:ring-ring/20",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const DIREITOS = `${MARCA.nome} © ${new Date().getFullYear()} - Todos os direitos reservados`;

interface Props {
  /** Linha pequena acima do título (vem de `MARCA.entrada.rotulo`). */
  rotulo?: string;
  titulo: string;
  subtitulo: string;
  /** Carimbo no canto da folha. */
  carimbo?: React.ReactNode;
  children: React.ReactNode;
}

export const MolduraDeEntrada: React.FC<Props> = ({ rotulo, titulo, subtitulo, carimbo, children }) => (
  // Folga das áreas seguras do iPhone: vale 0 sem viewport-fit=cover (o navegador já afasta a tela do recorte)
  <div className="flex min-h-screen w-full flex-col bg-background pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] pt-[env(safe-area-inset-top,0px)] lg:flex-row">
    <aside className="flex flex-col bg-moldura px-6 py-6 text-moldura-foreground lg:w-[46%] lg:px-14 lg:py-12">
      {/* O logo encolhe (min-w-0 + object-contain) antes de espremer a assinatura, que não encolhe (shrink-0) */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        <img src={MARCA.logo} alt={MARCA.nome} className="h-12 w-auto min-w-0 shrink object-contain object-left lg:h-16" />
        <span className="h-10 w-px shrink-0 bg-moldura-foreground/20" aria-hidden="true" />
        <AssinaturaEvoluta className="w-24 shrink-0 text-moldura-foreground/70 lg:w-28" />
      </div>
      <div className="hidden flex-1 flex-col justify-center lg:flex">
        <p className="max-w-md font-display text-5xl font-semibold leading-[1.05]">{MARCA.frase}</p>
        <p className="mt-5 max-w-md text-moldura-foreground/80">{MARCA.apoio}</p>
        <ul className="mt-8 max-w-md space-y-4 text-moldura-foreground/85">
          {MARCA.marcadores.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="hidden text-xs text-moldura-foreground/60 lg:block">
        {MARCA.rodape ? `${MARCA.rodape} · ` : ""}{DIREITOS}
      </p>
    </aside>

    <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md animate-fade-in rounded-xl border border-border bg-card p-6 shadow-[0_24px_48px_-32px_rgb(0_0_0/0.45)] sm:p-8">
        <div className="mb-8 space-y-2">
          {/* flex-wrap: com "texto maior" a 400px o carimbo (≈ 209px) passa para baixo do título em vez de estourar a folha */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              {rotulo && (
                <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{rotulo}</p>
              )}
              <h1 className="text-4xl font-semibold text-foreground">{titulo}</h1>
            </div>
            {carimbo && <div className="max-w-full shrink-0">{carimbo}</div>}
          </div>
          <p className="text-muted-foreground">{subtitulo}</p>
        </div>
        <div className="space-y-6">{children}</div>
      </div>
    </main>
    <p className="pb-4 text-center text-xs text-muted-foreground lg:hidden">{DIREITOS}</p>
  </div>
);
