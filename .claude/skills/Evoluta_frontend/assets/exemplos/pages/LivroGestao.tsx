// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Processos do período — um volume, pronto para imprimir, com os processos de um
 * período: capa, resumo por modalidade e situação, e um registro por processo.
 * Pensado para a transição de mandato. Só organiza o que o sistema já tem.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Process } from "@/types/process";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AvisoAtualizacaoFalhou,
  Carimbo,
  CarimboSituacao,
  Folhinha,
  MesaAviso,
  MesaCarregando,
  MesaPagina,
  MesaErroBusca,
} from "@/components/mesa/Mesa";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import {
  dataDeReferencia,
  filtrarPorPeriodo,
  formatarMoeda,
  LACUNA,
  resumirLivro,
  valorEmReais,
  type LinhaResumo,
} from "@/utils/ferramentasMesa";
import { formatarData, lerData } from "@/utils/prazosLicitacao";

const TabelaResumo: React.FC<{ titulo: string; linhas: LinhaResumo[] }> = ({ titulo, linhas }) => (
  <div className="min-w-0">
    <h3 className="mesa-secao text-base">{titulo}</h3>
    <table className="mt-2 w-full text-sm">
      <tbody>
        {linhas.map((l) => (
          <tr key={l.rotulo} className="border-t mesa-linha">
            <td className="py-2 pr-2">{l.rotulo}</td>
            <td className="py-2 pr-2 text-right tabular-nums">{l.quantidade}</td>
            <td className="py-2 text-right tabular-nums whitespace-nowrap">{formatarMoeda(l.valor)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Livro: React.FC<{
  processos: Process[];
  de: Date | null;
  ate: Date | null;
  /** Quantos processos o sistema tem; se for maior que a lista recebida, o livro é parcial. */
  totalNoSistema?: number;
}> = ({ processos, de, ate, totalNoSistema }) => {
  const parcial = totalNoSistema !== undefined && totalNoSistema > processos.length;
  const doPeriodo = useMemo(() => filtrarPorPeriodo(processos, de, ate), [processos, de, ate]);
  const resumo = useMemo(() => resumirLivro(doPeriodo), [doPeriodo]);
  const periodo =
    de && ate
      ? `de ${formatarData(de)} a ${formatarData(ate)}`
      : de
        ? `de ${formatarData(de)} em diante`
        : ate
          ? `até ${formatarData(ate)}`
          : "de todo o período";

  if (de && ate && de > ate) {
    return (
      <MesaAviso titulo="As datas estão trocadas" tinta="ocre">
        A data “De” ({formatarData(de)}) é depois da data “Até” ({formatarData(ate)}). Troque uma das duas para ver o
        período.
      </MesaAviso>
    );
  }

  if (doPeriodo.length === 0) {
    return (
      <MesaAviso titulo="Nenhum processo no período">
        {parcial
          ? `Entre os ${processos.length} processos trazidos, nenhum cai no período escolhido. O sistema tem ${totalNoSistema}: os que não vieram podem estar neste período, então este livro não pode ser impresso como completo.`
          : de || ate
            ? `Não há processos publicados (ou criados, quando ainda não publicados) ${periodo}. Mude as datas acima.`
            : "Ainda não há processos com data de publicação ou de criação no sistema."}
      </MesaAviso>
    );
  }

  return (
    <div className="space-y-6 print:space-y-10">
      <article aria-labelledby="livro-capa" className="folha sem-quebra p-6 text-center md:p-8 print:p-12">
        <p className="mesa-rotulo mesa-apoio">{LACUNA("Nome do órgão")}</p>
        <h2 id="livro-capa" className="mesa-titulo mt-4 text-3xl leading-tight print:mt-6 print:text-4xl">
          Processos do período
        </h2>
        <p className="mt-2 mesa-apoio">Contratações {periodo}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <Carimbo tinta="azul" grande giro={-4}>
            {resumo.total} {resumo.total === 1 ? "processo" : "processos"}
          </Carimbo>
          <p className="mesa-secao">{formatarMoeda(resumo.valorTotal)} estimados</p>
        </div>
        {parcial && (
          <p className="mx-auto mt-6 max-w-md rounded-md border border-dashed borda-tinta-carmim p-3 text-sm tinta-carmim">
            Relação parcial: a consulta trouxe {processos.length} dos {totalNoSistema} processos do sistema. Os totais
            acima valem só para os processos trazidos.
          </p>
        )}
        <p className="mx-auto mt-8 max-w-md text-sm mesa-apoio">
          Emitido em {formatarData(new Date())}, para consulta da equipe que assume. Os valores são os estimados em cada
          processo, não os contratados.
        </p>
      </article>

      <article aria-labelledby="livro-resumo" className="folha quebra-pagina p-5 md:p-6 print:p-10">
        <h2 id="livro-resumo" className="mesa-secao">
          Resumo
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
          <TabelaResumo titulo="Por modalidade" linhas={resumo.porModalidade} />
          <TabelaResumo titulo="Por situação" linhas={resumo.porSituacao} />
        </div>
      </article>

      <article aria-labelledby="livro-registros" className="folha quebra-pagina p-5 md:p-6 print:p-10">
        <h2 id="livro-registros" className="mesa-secao">
          Registro dos processos
        </h2>
        <ol className="margem-registro mt-4 pl-4">
          {doPeriodo.map((p) => {
            const data = dataDeReferencia(p);
            const valor = valorEmReais(p.estimated_value);
            return (
              <li key={p.id} className="sem-quebra flex gap-4 border-t mesa-linha py-4 first:border-t-0">
                {data && <Folhinha data={data} />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to={`/processes/${p.id}`} className="etiqueta-pasta hover:underline">
                      {p.code || "Sem número"}
                    </Link>
                    <span className="mesa-rotulo mesa-apoio">{p.modality?.name || "Sem modalidade"}</span>
                  </div>
                  <p className="mt-2 font-semibold">{p.object || p.description || "Sem objeto informado"}</p>
                  <p className="mt-1 text-sm mesa-apoio">
                    Responsável: {p.responsible || "não informado"}.
                    {valor > 0 ? ` Valor estimado: ${formatarMoeda(valor)}.` : ""}
                    {lerData(p.publication_date)
                      ? ` Publicado em ${formatarData(lerData(p.publication_date))}.`
                      : data
                        ? ` Não publicado (criado em ${formatarData(data)}).`
                        : " Não publicado."}
                  </p>
                </div>
                <div className="shrink-0 self-center">
                  <CarimboSituacao status={p.status} />
                </div>
              </li>
            );
          })}
        </ol>
      </article>
    </div>
  );
};

const inicioDoAno = () => `${new Date().getFullYear()}-01-01`;
const fimDoAno = () => `${new Date().getFullYear()}-12-31`;

const LivroGestao: React.FC = () => {
  const { processos, total, isLoading, error, data, refetch } = useProcessosDaMesa();
  const [deISO, setDeISO] = useState(inicioDoAno);
  const [ateISO, setAteISO] = useState(fimDoAno);
  const de = useMemo(() => lerData(deISO), [deISO]);
  const ate = useMemo(() => lerData(ateISO), [ateISO]);

  return (
    <MesaPagina
      titulo="Processos do período"
      subtitulo="Os processos de um período, em ordem, prontos para imprimir e passar à próxima gestão."
      imprimivel={!!data}
    >
      <div className="nao-imprimir folha-simples mb-6 flex flex-wrap items-end gap-4 p-4">
        <div className="space-y-1">
          <Label htmlFor="livro-de">De</Label>
          <Input id="livro-de" type="date" value={deISO} onChange={(e) => setDeISO(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="livro-ate">Até</Label>
          <Input id="livro-ate" type="date" value={ateISO} onChange={(e) => setAteISO(e.target.value)} />
        </div>
        <p className="max-w-sm text-xs mesa-apoio">
          Vale a data de publicação; processo ainda não publicado entra pela data em que foi criado.
        </p>
      </div>
      {isLoading ? (
        <MesaCarregando />
      ) : !data ? (
        <MesaErroBusca titulo="Não deu para buscar os processos" onTentarDeNovo={() => refetch()} />
      ) : (
        <>
          {/* Uma nova busca que falhou não apaga o que já está na tela (nem o que foi digitado) */}
          {error && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
          <Livro processos={processos} de={de} ate={ate} totalNoSistema={total} />
        </>
      )}
    </MesaPagina>
  );
};

export default LivroGestao;
