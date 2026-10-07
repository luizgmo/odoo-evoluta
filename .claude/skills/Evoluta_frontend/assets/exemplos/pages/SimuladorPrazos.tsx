// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Simulador de prazos — o servidor escolhe a data de publicação (e, se quiser,
 * a da sessão) e vê todos os prazos legais recalculados em dias úteis.
 * Nada é gravado: é uma conta feita na tela.
 */
import React, { useMemo, useState } from "react";
import { AlertTriangle, Minus, Plus, X } from "lucide-react";
import type { Process } from "@/types/process";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Carimbo, Folhinha } from "@/components/mesa/Mesa";
import { ProcessoNaMesa } from "@/components/mesa/ProcessoNaMesa";
import { CitacaoDaLei } from "@/features/lei/CitacaoDaLei";
import {
  CALENDARIO_PADRAO,
  HIPOTESES_PRAZO,
  calcularCronograma,
  formatarData,
  formatarDataExtenso,
  lerData,
  paraISO,
  somarDiasUteis,
  subtrairDiasUteis,
} from "@/utils/prazosLicitacao";

const hoje = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const PainelSimulador: React.FC<{ processo: Process }> = ({ processo }) => {
  const [publicacaoISO, setPublicacaoISO] = useState(
    () => (lerData(processo.publication_date) ? processo.publication_date.slice(0, 10) : paraISO(hoje())),
  );
  const [hipoteseId, setHipoteseId] = useState(HIPOTESES_PRAZO[0].id);
  const [sessaoISO, setSessaoISO] = useState(() => (lerData(processo.opening_date) ? processo.opening_date!.slice(0, 10) : ""));
  const [facultativos, setFacultativos] = useState(CALENDARIO_PADRAO.facultativosSemExpediente);
  const [datasExtras, setDatasExtras] = useState<string[]>([]);
  const [novaDataExtra, setNovaDataExtra] = useState("");

  const calendario = useMemo(
    () => ({ facultativosSemExpediente: facultativos, datasExtras }),
    [facultativos, datasExtras],
  );
  const cronograma = useMemo(() => {
    const publicacao = lerData(publicacaoISO);
    return publicacao
      ? calcularCronograma({ publicacao, hipoteseId, sessaoPretendida: lerData(sessaoISO), calendario })
      : null;
  }, [publicacaoISO, hipoteseId, sessaoISO, calendario]);

  const moverPublicacao = (passo: 1 | -1) => {
    const publicacao = lerData(publicacaoISO);
    if (!publicacao) return;
    const nova = passo > 0 ? somarDiasUteis(publicacao, 1, calendario) : subtrairDiasUteis(publicacao, 1, calendario);
    setPublicacaoISO(paraISO(nova));
  };

  const adicionarDataExtra = () => {
    if (lerData(novaDataExtra) && !datasExtras.includes(novaDataExtra)) {
      setDatasExtras([...datasExtras, novaDataExtra].sort());
    }
    setNovaDataExtra("");
  };

  const sessaoMarco = cronograma?.marcos.find((m) => m.id === "sessao");

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section aria-labelledby="titulo-marcos" className="folha folha-furada p-5 md:p-6">
        {/* A resposta primeiro: quando pode ser a sessão, e se a data escolhida respeita o mínimo */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="titulo-marcos" className="mesa-secao">
              Datas do processo
            </h2>
            {sessaoMarco && (
              <p className="mt-1 text-sm">
                Sessão pública: <strong>{formatarDataExtenso(sessaoMarco.data)}</strong>
              </p>
            )}
          </div>
          {sessaoMarco && (
            <Carimbo
              tinta={cronograma!.alertas.length ? "carmim" : "verde"}
              grande
              giro={-4}
              bateQuando={cronograma!.alertas.length > 0}
            >
              {cronograma!.alertas.length ? "Rever data" : "Prazo mínimo cumprido"}
            </Carimbo>
          )}
        </div>

        {!cronograma ? (
          <p className="mt-6 text-sm mesa-apoio">Informe a data de publicação para ver os prazos.</p>
        ) : (
          <>
            {cronograma.alertas.length > 0 && (
              <div role="alert" className="mt-4 space-y-2 rounded-md border border-dashed borda-tinta-carmim p-3 text-sm tinta-carmim">
                {cronograma.alertas.map((a) => (
                  <p key={a} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {a}
                  </p>
                ))}
              </div>
            )}
            <ol className="mt-2">
              {cronograma.marcos.map((m) => (
                <li
                  key={m.id}
                  data-marco={m.id}
                  className="flex items-center gap-4 border-t mesa-linha py-2.5 first:border-t-0"
                >
                  <Folhinha data={m.data} />
                  <div className="min-w-0 flex-1">
                    <p className={m.id === "sessao" ? "text-base font-bold" : "text-[15px] font-semibold"}>{m.titulo}</p>
                    <p className="text-sm mesa-apoio">{m.explicacao}</p>
                    <p className="mt-1 text-sm">
                      <span className="sr-only">Data: </span>
                      {formatarDataExtenso(m.data)}
                    </p>
                    {/* No celular o artigo de lei vem embaixo; não some */}
                    <p className="mt-0.5 text-xs mesa-apoio sm:hidden">
                      <CitacaoDaLei noSeuCaso={`${m.titulo}: ${formatarDataExtenso(m.data)}.`}>{m.fundamento}</CitacaoDaLei>
                    </p>
                  </div>
                  <span className="hidden shrink-0 self-center text-xs mesa-apoio sm:block">
                    <CitacaoDaLei noSeuCaso={`${m.titulo}: ${formatarDataExtenso(m.data)}.`}>{m.fundamento}</CitacaoDaLei>
                  </span>
                </li>
              ))}
            </ol>
            {cronograma.feriadosNoPeriodo.length > 0 && (
              <p className="mt-2 border-t mesa-linha pt-4 text-sm mesa-apoio">
                <strong className="text-foreground">Dias sem expediente no caminho: </strong>
                {cronograma.feriadosNoPeriodo.map((f) => `${formatarData(f.data)} (${f.nome})`).join("; ")}.
              </p>
            )}
          </>
        )}
      </section>

      <aside className="order-first space-y-4 xl:order-none xl:sticky xl:top-4 xl:self-start">
        <section aria-labelledby="titulo-regua" className="folha-simples space-y-5 p-5">
          <h2 id="titulo-regua" className="mesa-secao">
            Mexa nas datas
          </h2>
          <div className="space-y-2">
            <Label htmlFor="publicacao">Publicação do edital</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => moverPublicacao(-1)} aria-label="Um dia útil antes">
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="publicacao"
                type="date"
                value={publicacaoISO}
                onChange={(e) => setPublicacaoISO(e.target.value)}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => moverPublicacao(1)} aria-label="Um dia útil depois">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hipotese">Tipo de contratação</Label>
            <select
              id="hipotese"
              value={hipoteseId}
              onChange={(e) => setHipoteseId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {HIPOTESES_PRAZO.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.rotulo}: {h.diasUteis} dias úteis
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessao">Sessão pública (opcional)</Label>
            <div className="flex gap-2">
              <Input id="sessao" type="date" value={sessaoISO} onChange={(e) => setSessaoISO(e.target.value)} />
              {sessaoISO && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setSessaoISO("")} aria-label="Usar a primeira data possível">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs mesa-apoio">
              {sessaoISO ? "Conferindo a data que você escolheu." : "Em branco: o Licitars sugere a primeira data possível."}
            </p>
          </div>
        </section>

        <section aria-labelledby="titulo-calendario" className="folha-simples space-y-4 p-5">
          <h2 id="titulo-calendario" className="mesa-secao">
            Calendário do órgão
          </h2>
          <div className="flex items-start justify-between gap-3">
            <Label htmlFor="facultativos" className="text-sm font-normal leading-snug">
              Carnaval e Corpus Christi sem expediente
            </Label>
            <Switch id="facultativos" checked={facultativos} onCheckedChange={setFacultativos} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data-extra">Feriado estadual, municipal ou recesso</Label>
            <p className="text-xs mesa-apoio">
              Os feriados nacionais já contam. Inclua os do estado (em São Paulo, 9 de julho) e os do município.
            </p>
            <div className="flex gap-2">
              <Input id="data-extra" type="date" value={novaDataExtra} onChange={(e) => setNovaDataExtra(e.target.value)} />
              <Button type="button" variant="outline" onClick={adicionarDataExtra} disabled={!lerData(novaDataExtra)}>
                Incluir
              </Button>
            </div>
            {datasExtras.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {datasExtras.map((d) => (
                  <li key={d} className="etiqueta-pasta flex items-center gap-1">
                    {formatarData(lerData(d))}
                    <button
                      type="button"
                      onClick={() => setDatasExtras(datasExtras.filter((x) => x !== d))}
                      aria-label={`Tirar ${formatarData(lerData(d))}`}
                      className="-my-1 inline-flex h-6 w-6 items-center justify-center rounded-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs mesa-apoio">
            Estas datas valem só nesta simulação e não ficam guardadas.
          </p>
        </section>

        <p className="rounded-md border border-dashed borda-tinta-ocre p-3 text-xs tinta-ocre">
          Simulação. A contagem segue a leitura mais conservadora da Lei 14.133 e ainda precisa ser confirmada pela
          assessoria jurídica. Confira sempre antes de publicar.
        </p>
      </aside>
    </div>
  );
};

const SimuladorPrazos: React.FC = () => (
  <ProcessoNaMesa>{(processo) => <PainelSimulador processo={processo} />}</ProcessoNaMesa>
);

export default SimuladorPrazos;
