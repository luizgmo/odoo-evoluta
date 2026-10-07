// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Prévia no Diário Oficial — monta o aviso de licitação com os dados do
 * processo, deixa o servidor ajustar o texto e mostra como sai na coluna do
 * diário, com a contagem de caracteres. Nada é enviado nem gravado.
 */
import React, { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Process } from "@/types/process";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BotaoCopiar, Carimbo } from "@/components/mesa/Mesa";
import { ProcessoNaMesa } from "@/components/mesa/ProcessoNaMesa";
import { CitacaoDaLei } from "@/features/lei/CitacaoDaLei";
import { contarTexto, montarExtrato } from "@/utils/ferramentasMesa";

/** Pinta as [lacunas] em carmim para saltarem aos olhos na prévia. */
const TextoComLacunas: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    {texto.split(/(\[[^\]\n]+\])/g).map((trecho, i) =>
      /^\[[^\]\n]+\]$/.test(trecho) ? (
        <mark key={i} className="rounded-sm bg-transparent font-semibold tinta-carmim underline decoration-dotted">
          {trecho}
        </mark>
      ) : (
        <React.Fragment key={i}>{trecho}</React.Fragment>
      ),
    )}
  </>
);

export const PainelDiario: React.FC<{ processo: Process }> = ({ processo }) => {
  const original = useMemo(() => montarExtrato(processo), [processo]);
  const [texto, setTexto] = useState(original);
  const contagem = contarTexto(texto);
  const [titulo, ...corpo] = texto.split("\n");

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <section aria-labelledby="titulo-texto" className="folha folha-furada space-y-4 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-texto" className="mesa-secao">
            Texto do aviso
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setTexto(original)} disabled={texto === original}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Voltar ao texto original
            </Button>
            <BotaoCopiar texto={texto} rotulo="Copiar texto" variante="default" />
          </div>
        </div>
        <Label htmlFor="texto-aviso" className="sr-only">
          Texto do aviso de licitação
        </Label>
        <Textarea
          id="texto-aviso"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={14}
          className="text-sm leading-relaxed"
        />
        {/* Anuncia só as lacunas (mudam pouco); os contadores mudariam a cada tecla */}
        <p className="sr-only" aria-live="polite">
          {contagem.lacunas === 0
            ? "Nenhuma lacuna a preencher."
            : `${contagem.lacunas} ${contagem.lacunas === 1 ? "lacuna" : "lacunas"} a preencher.`}
        </p>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Caracteres", contagem.caracteresComEspacos],
            ["Sem espaços", contagem.caracteresSemEspacos],
            ["Palavras", contagem.palavras],
            ["A preencher", contagem.lacunas],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded-md border mesa-linha p-3">
              <dt className="mesa-rotulo mesa-apoio">{rotulo}</dt>
              <dd
                className={`mt-1 text-2xl font-light ${rotulo === "A preencher" && Number(valor) > 0 ? "tinta-carmim" : ""}`}
              >
                {valor}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs mesa-apoio">
          O que está entre colchetes o sistema não sabe (número da licitação, valor, local, endereço, cidade, cargo):
          preencha antes de mandar ao diário. Se o orçamento for sigiloso (<CitacaoDaLei>art. 24</CitacaoDaLei> da Lei 14.133), tire a frase do valor. O custo da publicação não aparece aqui porque cada diário cobra de um jeito.
        </p>
      </section>

      <section aria-labelledby="titulo-previa" className="space-y-3 xl:sticky xl:top-4 xl:self-start">
        <h2 id="titulo-previa" className="mesa-secao">
          Como sai no diário
        </h2>
        <div className="folha-simples p-4">
          <div className="flex items-center justify-between border-b-2 border-double border-current pb-2">
            <span className="mesa-rotulo">Diário Oficial</span>
            <span className="text-xs mesa-apoio">prévia</span>
          </div>
          <div className="mx-auto mt-4 max-w-[320px] font-display text-base leading-normal">
            <p className="text-center font-bold uppercase tracking-wide">
              <TextoComLacunas texto={titulo || ""} />
            </p>
            {corpo
              .join("\n")
              .split(/\n{2,}/)
              .map((paragrafo, i) => (
                <p key={i} className="mt-3 whitespace-pre-line text-justify [hyphens:auto]" lang="pt-BR">
                  <TextoComLacunas texto={paragrafo.replace(/^\n+|\n+$/g, "")} />
                </p>
              ))}
          </div>
          <div className="mt-6 flex justify-end">
            {/* Bate quando a última lacuna é preenchida (ou quando alguma volta) */}
            <Carimbo tinta={contagem.lacunas > 0 ? "carmim" : "verde"} grande giro={-5} bateQuando={contagem.lacunas === 0}>
              {contagem.lacunas > 0
                ? `${contagem.lacunas} ${contagem.lacunas === 1 ? "lacuna" : "lacunas"} a preencher`
                : "Sem lacunas"}
            </Carimbo>
          </div>
        </div>
      </section>
    </div>
  );
};

const PreviaDiario: React.FC = () => (
  <ProcessoNaMesa>{(processo) => <PainelDiario processo={processo} />}</ProcessoNaMesa>
);

export default PreviaDiario;
