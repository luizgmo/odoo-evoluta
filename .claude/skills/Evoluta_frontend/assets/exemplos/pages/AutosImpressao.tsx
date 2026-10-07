// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Autos para imprimir — capa, índice das peças, termos de juntada e termo de
 * encerramento de UM processo, prontos para o papel (impressão do navegador).
 * O conteúdo de cada arquivo não entra: o sistema não o entrega em texto.
 */
import React from "react";
import { useParams } from "react-router-dom";
import type { Process } from "@/types/process";
import type { Document } from "@/types/document";
import { AvisoAtualizacaoFalhou, Carimbo, CarimboDatado, CarimboSituacao, MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { ProcessoNaMesa } from "@/components/mesa/ProcessoNaMesa";
import { useDocumentosDoProcesso } from "@/hooks/useMesaDados";
import { Linha, Rubrica } from "@/components/mesa/PecasDosAutos";
import { dataDoRegistro, formatarMoeda, LACUNA, separarPecas, valorEmReais } from "@/utils/ferramentasMesa";
import { formatarData, formatarDataExtenso, lerData } from "@/utils/prazosLicitacao";

export const Autos: React.FC<{ processo: Process; documentos: Document[]; total?: number }> = ({
  processo,
  documentos,
  total,
}) => {
  const { pecas, dispensadas, naoConcluidas } = separarPecas(documentos);
  // "Faltando" compara com o que chegou do servidor, antes de separar as dispensadas
  const faltando = total !== undefined && total > documentos.length ? total - documentos.length : 0;
  const foraDosAutos = [
    ...dispensadas.map((d) => ({ doc: d, motivo: d.dismiss_reason ? `etapa dispensada: ${d.dismiss_reason}` : "etapa dispensada" })),
    ...naoConcluidas.map((d) => ({ doc: d, motivo: "não concluído" })),
  ];
  const autuacao = dataDoRegistro(processo.created_at);
  const valor = valorEmReais(processo.estimated_value);

  return (
    <div className="space-y-6 print:space-y-10">
      {/* Uma nota só, colada à aba: o essencial numa linha, o detalhe a um clique */}
      <div className="nao-imprimir folha-simples space-y-2 p-4 text-sm">
        <p>Saem no papel a capa, o índice, os termos de juntada e o de encerramento; o conteúdo dos documentos, não.</p>
        <details className="mesa-apoio">
          <summary className="cursor-pointer text-foreground underline-offset-2 hover:underline">Como os autos são montados</summary>
          <p className="mt-1 max-w-prose">
            Baixe o conteúdo de cada documento na tela do processo. As peças são numeradas uma a uma, na ordem em que
            foram registradas no sistema, porque o sistema não sabe quantas páginas tem cada arquivo. A data de cada
            juntada fica em branco no termo: o sistema só guarda quando a etapa foi aberta, não quando o documento
            ficou pronto.
          </p>
        </details>

      {foraDosAutos.length > 0 && (
        <div className="tinta-ocre">
          <p>
            {foraDosAutos.length === 1 ? "Ficou fora dos autos 1 registro" : `Ficaram fora dos autos ${foraDosAutos.length} registros`}
            , porque não são peças juntadas:
          </p>
          <ul className="mt-1 list-disc pl-5">
            {foraDosAutos.map(({ doc, motivo }) => (
              <li key={doc.id}>
                {doc.title || doc.name} ({motivo})
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>

      {faltando > 0 && (
        <p role="alert" className="rounded-md border border-dashed borda-tinta-carmim p-3 text-sm tinta-carmim">
          Atenção: o sistema registra {total} documentos neste processo, mas só {documentos.length} puderam ser trazidos.
          Não use esta impressão como autos completos; avise a equipe do Licitars.
        </p>
      )}

      {/* Capa */}
      <article aria-labelledby="capa-titulo" className="folha folha-furada sem-quebra p-5 md:p-6 print:p-10">
        <p className="mesa-rotulo mesa-apoio">{LACUNA("Nome do órgão")}</p>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 id="capa-titulo" className="mesa-secao">
              Autos do processo
            </h2>
            {/* "PROC-2026-00001" não tem onde quebrar: menor no celular, e quebra se ainda não couber */}
            <p className="mt-1 break-all font-mono text-2xl sm:text-3xl">{processo.code || LACUNA("número")}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {autuacao ? (
              // Carimbo datador de protocolo, como o da capa dos autos em papel
              <CarimboDatado
                ato="Autuado"
                data={autuacao}
                rodape={processo.code || undefined}
                giro={-6}
                bateAoAbrir={`autos-${processo.id}`}
              />
            ) : (
              <Carimbo tinta="azul" grande giro={-6}>
                Autuado em {formatarData(autuacao)}
              </Carimbo>
            )}
            <CarimboSituacao status={processo.status} giro={3} />
          </div>
        </div>
        <dl className="mt-8">
          <Linha rotulo="Objeto">{processo.object || processo.description || LACUNA("objeto")}</Linha>
          <Linha rotulo="Modalidade">{processo.modality?.name || LACUNA("modalidade")}</Linha>
          <Linha rotulo="Valor estimado">{valor > 0 ? formatarMoeda(valor) : "—"}</Linha>
          <Linha rotulo="Responsável">{processo.responsible || "Sem dono"}</Linha>
          <Linha rotulo="Publicação">{formatarData(lerData(processo.publication_date))}</Linha>
          <Linha rotulo="Abertura">
            {formatarData(lerData(processo.opening_date))}
            {processo.opening_time ? `, às ${processo.opening_time.slice(0, 5)}` : ""}
          </Linha>
          <Linha rotulo="Peças">{pecas.length}</Linha>
        </dl>
      </article>

      {/* Índice */}
      <article aria-labelledby="indice-titulo" className="folha folha-furada quebra-pagina p-5 md:p-6 print:p-10">
        <h2 id="indice-titulo" className="mesa-secao">
          Índice das peças
        </h2>
        {pecas.length === 0 ? (
          <p className="mt-4 text-sm mesa-apoio">Este processo ainda não tem documentos juntados.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="mesa-rotulo mesa-apoio">
                  <th className="py-2 pr-4 font-semibold">Peça</th>
                  <th className="py-2 pr-4 font-semibold">Documento</th>
                  <th className="py-2 pr-4 font-semibold">Tipo</th>
                  <th className="py-2 font-semibold">Registrado no sistema em</th>
                </tr>
              </thead>
              <tbody>
                {pecas.map((doc, i) => (
                  <tr key={doc.id} className="border-t mesa-linha">
                    <td className="py-2 pr-4 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-2 pr-4">{doc.title || doc.name}</td>
                    <td className="py-2 pr-4 mesa-apoio">{doc.document_type?.name || doc.type || "—"}</td>
                    <td className="py-2 tabular-nums">{formatarData(dataDoRegistro(doc.created_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {/* Termos de juntada */}
      {pecas.length > 0 && (
        <article aria-labelledby="juntada-titulo" className="folha folha-furada quebra-pagina p-5 md:p-6 print:p-10">
          <h2 id="juntada-titulo" className="mesa-secao">
            Termos de juntada
          </h2>
          <ol className="margem-registro mt-4 space-y-6 pl-4">
            {pecas.map((doc, i) => (
              <li key={doc.id} className="sem-quebra">
                <p className="max-w-prose documento-oficial">
                  {/* O sistema só sabe quando o registro da etapa foi aberto, não quando o
                      documento ficou pronto: a data da juntada é preenchida à mão. */}
                  Em {LACUNA("data da juntada")}, junto a estes autos o documento “
                  {doc.title || doc.name}”{doc.document_type?.name ? ` (${doc.document_type.name})` : ""}, que recebe
                  o número de peça {String(i + 1).padStart(2, "0")}.
                </p>
                <p className="mt-1 text-xs mesa-apoio">
                  Registrado no sistema em {formatarData(dataDoRegistro(doc.created_at))}.
                </p>
                <Rubrica referencia={doc.user?.username ? `Documento enviado ao sistema por ${doc.user.username}` : undefined} />
              </li>
            ))}
          </ol>
        </article>
      )}

      {/* Encerramento */}
      <article aria-labelledby="encerramento-titulo" className="folha folha-furada sem-quebra p-5 md:p-6 print:p-10">
        <h2 id="encerramento-titulo" className="mesa-secao">
          Termo de encerramento
        </h2>
        <p className="mt-4 max-w-prose documento-oficial">
          Em {formatarDataExtenso(new Date())}, encerro a conferência destes autos, que contam com {pecas.length}{" "}
          {pecas.length === 1 ? "peça relacionada" : "peças relacionadas"} no índice
          {faltando > 0 ? `, de um total de ${total} documentos registrados no sistema` : ""}.
        </p>
        <Rubrica />
      </article>
    </div>
  );
};

type ConsultaDocumentos = ReturnType<typeof useDocumentosDoProcesso>;

const PainelAutos: React.FC<{ processo: Process; consulta: ConsultaDocumentos }> = ({ processo, consulta }) => {
  const { documentos, total, isLoading, error, data, refetch } = consulta;
  if (isLoading) return <MesaCarregando texto="Separando as peças…" />;
  if (!data)
    return (
      <MesaErroBusca titulo="Não deu para buscar os documentos" onTentarDeNovo={() => refetch()} />
    );
  return (
    <>
      {error && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
      <Autos processo={processo} documentos={documentos} total={total} />
    </>
  );
};

const AutosImpressao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const consulta = useDocumentosDoProcesso(id);
  // Só dá para imprimir depois que as peças chegaram: senão o papel sai com o aviso de espera.
  return (
    <ProcessoNaMesa imprimivel={!!consulta.data}>
      {(processo) => <PainelAutos processo={processo} consulta={consulta} />}
    </ProcessoNaMesa>
  );
};

export default AutosImpressao;
