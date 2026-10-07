/**
 * Acessibilidade e preferências — "Do seu jeito".
 * Tudo vale na hora e fica guardado neste computador.
 */
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trilha } from "@/components/mesa/Trilha";
import { Carimbo } from "@/components/mesa/Mesa";
import {
  ATALHOS,
  PADRAO,
  aplicarPreferencias,
  gravarPreferencias,
  lerPreferencias,
  type Preferencias,
} from "@/features/preferencias/preferencias";
import { esquecerEscolhaDoMenu } from "@/components/layout/useMenuLateral";
import { GEN, MARCA } from "@/config/marca";

const TAMANHOS: {
  valor: Preferencias["tamanho"];
  rotulo: string;
  nome: string;
}[] = [
  { valor: -1, rotulo: "A−", nome: "Menor" },
  { valor: 0, rotulo: "A", nome: "Padrão" },
  { valor: 1, rotulo: "A+", nome: "Maior" },
  { valor: 2, rotulo: "A++", nome: "Bem maior" },
];

const Chave: React.FC<{
  id: string;
  rotulo: string;
  explica: string;
  valor: boolean;
  onChange: (v: boolean) => void;
}> = ({ id, rotulo, explica, valor, onChange }) => (
  <div className="flex items-start justify-between gap-4 border-t border-border py-3 first:border-t-0">
    <div>
      <Label htmlFor={id} className="font-semibold">
        {rotulo}
      </Label>
      <p className="text-sm text-muted-foreground">{explica}</p>
    </div>
    <Switch id={id} checked={valor} onCheckedChange={onChange} />
  </div>
);

const Acessibilidade: React.FC = () => {
  const [prefs, setPrefs] = useState<Preferencias>(lerPreferencias);

  // Vale na hora e fica guardado
  useEffect(() => {
    aplicarPreferencias(prefs);
    gravarPreferencias(prefs);
  }, [prefs]);

  const muda = <K extends keyof Preferencias>(
    chave: K,
    valor: Preferencias[K],
  ) => setPrefs((p) => ({ ...p, [chave]: valor }));

  return (
    <div className="max-w-5xl space-y-6">
      <Trilha
        passos={[
          { rotulo: MARCA.inicio, para: MARCA.rotaInicial },
          { rotulo: "Acessibilidade e preferências" },
        ]}
      />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Do seu jeito</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Texto maior, mais contraste, menos movimento e atalhos de teclado.
            Vale na hora e fica guardado neste computador.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            // grava antes: a batida da prévia já não toca o som que acabou de ser desligado
            gravarPreferencias({ ...PADRAO });
            setPrefs({ ...PADRAO });
          }}
        >
          Voltar ao padrão
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="ler-melhor" className="folha space-y-4 p-5">
          <h2 id="ler-melhor" className="text-2xl font-semibold">
            Para ler melhor
          </h2>
          <div>
            <p className="mb-2 text-sm font-semibold" id="rotulo-tamanho">
              Tamanho do texto
            </p>
            <div
              role="group"
              aria-labelledby="rotulo-tamanho"
              className="flex flex-wrap gap-2"
            >
              {TAMANHOS.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  aria-pressed={prefs.tamanho === t.valor}
                  aria-label={`${t.rotulo}, texto ${t.nome.toLowerCase()}`}
                  onClick={() => muda("tamanho", t.valor)}
                  className={cn(
                    "h-11 min-w-[3.5rem] rounded-lg border px-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    prefs.tamanho === t.valor
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card hover:border-primary/50",
                  )}
                >
                  {t.rotulo}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Chave
              id="pref-contraste"
              rotulo="Alto contraste"
              explica="Texto de apoio e fios mais fortes; carimbos sem falhas de tinta."
              valor={prefs.altoContraste}
              onChange={(v) => muda("altoContraste", v)}
            />
            <Chave
              id="pref-links"
              rotulo="Sublinhar todos os links"
              explica="Ajuda a ver o que é clicável sem depender da cor."
              valor={prefs.sublinharLinks}
              onChange={(v) => muda("sublinharLinks", v)}
            />
            <Chave
              id="pref-entrelinha"
              rotulo="Mais espaço entre as linhas"
              explica="Textos longos ficam mais arejados."
              valor={prefs.maisEntrelinha}
              onChange={(v) => muda("maisEntrelinha", v)}
            />
            <Chave
              id="pref-movimento"
              rotulo="Diminuir animações"
              explica="O carimbo aparece sem o movimento de bater."
              valor={prefs.semMovimento}
              onChange={(v) => muda("semMovimento", v)}
            />
          </div>
        </section>

        <section aria-labelledby="usar-melhor" className="folha space-y-4 p-5">
          <h2 id="usar-melhor" className="text-2xl font-semibold">
            Para usar melhor
          </h2>
          <div>
            <Chave
              id="pref-menu"
              rotulo="Começar com o menu recolhido"
              explica="Mais espaço para a folha; o menu abre pelo botão ao lado do logo."
              valor={prefs.menuRecolhido}
              onChange={(v) => {
                esquecerEscolhaDoMenu();
                muda("menuRecolhido", v);
              }}
            />
            <Chave
              id="pref-som"
              rotulo="Som discreto ao carimbar"
              explica="Um baque curto quando um carimbo é batido na tela."
              valor={prefs.somAoCarimbar}
              onChange={(v) => {
                muda("somAoCarimbar", v);
                // grava já: a prévia abaixo bate com a mudança e a amostra do som é essa batida
                gravarPreferencias({ ...prefs, somAoCarimbar: v });
              }}
            />
          </div>
          <div>
            <h3 className="mb-2 font-sans text-sm font-semibold">
              Atalhos de teclado
            </h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {ATALHOS.map((a) => (
                <React.Fragment key={a.tecla}>
                  <dt>
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {a.tecla}
                    </kbd>
                  </dt>
                  <dd>{a.rotulo}</dd>
                </React.Fragment>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Tudo também funciona só com o teclado: Tab avança, Shift+Tab
              volta, Enter abre.
            </p>
          </div>
        </section>
      </div>

      <section aria-labelledby="previa" className="folha p-5">
        <h2 id="previa" className="font-sans text-sm font-semibold">
          Como fica
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Carimbo tinta="azul" grande bateQuando={prefs}>
            Prévia
          </Carimbo>
          <p className="max-w-md text-muted-foreground">
            Atualização registrada em 21/09,{" "}
            <a href="#previa">ver {GEN.no} {MARCA.objeto.singular}</a>. Retorno
            até quinta-feira.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Acessibilidade;
