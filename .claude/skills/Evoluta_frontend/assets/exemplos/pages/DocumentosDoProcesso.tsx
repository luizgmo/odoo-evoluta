// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Divisória "Documentos" da pasta (proposta 7, tela 10): as etapas da
 * modalidade, cada uma com a situação do seu documento, e os demais
 * documentos do processo. Documento de etapa se cria pela Linha do tempo,
 * para contar no progresso.
 */
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import type { Process } from "@/types/process";
import type { Document } from "@/types/document";
import { documentRevisionApi } from "@/services/api/endpoints";
import { useDocumentosDoProcesso } from "@/hooks/useMesaDados";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Carimbo,
  MesaCarregando,
  MesaErroBusca,
  AvisoAtualizacaoFalhou,
  type Tinta,
} from "@/components/mesa/Mesa";
import { ProcessoNaMesa } from "@/components/mesa/ProcessoNaMesa";
import {
  etapaDispensada,
  etapasDoProcesso,
  type EstadoEtapa,
} from "@/components/documents/etapasDoProcesso";
import { BaixarDocumento } from "@/components/documents/BaixarDocumento";

const SITUACAO: Record<EstadoEtapa, { texto: string; tinta: Tinta }> = {
  concluida: { texto: "Concluído", tinta: "verde" },
  atual: { texto: "Em andamento", tinta: "azul" },
  pendente: { texto: "A fazer", tinta: "grafite" },
  dispensada: { texto: "Dispensado", tinta: "ocre" },
};

const dataCurta = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

interface Linha {
  chave: string;
  numero?: number;
  nome: string;
  obrigatoria?: boolean;
  estado?: EstadoEtapa;
  doc?: Document;
}

export const ListaDeDocumentos: React.FC<{ processo: Process }> = ({
  processo,
}) => {
  const navigate = useNavigate();
  const { documentos, data, isLoading, isError, refetch } = useDocumentosDoProcesso(
    String(processo.id),
  );
  const [busca, setBusca] = useState("");
  const versoes = useQueries({
    queries: documentos.map((d) => ({
      queryKey: ["document-revisions", String(d.id)],
      queryFn: () => documentRevisionApi.listByDocument(String(d.id)),
      staleTime: 60_000,
    })),
  });
  const nVersoes = (doc?: Document) => {
    if (!doc) return null;
    const i = documentos.findIndex((d) => d.id === doc.id);
    return versoes[i]?.data?.length ?? null;
  };

  const { etapas, outros, feitas } = useMemo(() => {
    const situacao = etapasDoProcesso(processo, documentos);
    const tiposDasEtapas = new Set(
      situacao.etapas.map((e) => String(e.etapa.id)),
    );
    const tipo = (d: Document) =>
      String(
        typeof d.document_type === "object"
          ? d.document_type?.id
          : d.document_type,
      );
    return {
      feitas: situacao.vencidas,
      etapas: situacao.etapas.map((e, i): Linha => ({
        chave: `e-${e.etapa.id}`,
        numero: i + 1,
        nome: e.etapa.name,
        obrigatoria: e.etapa.is_required,
        estado: e.estado,
        doc: e.documento,
      })),
      // Fora das etapas, e também o documento de etapa que não é o da linha dela
      // (um segundo documento do mesmo tipo não pode sumir da pasta)
      outros: documentos
        .filter(
          (d) =>
            !tiposDasEtapas.has(tipo(d)) ||
            !situacao.etapas.some((e) => e.documento?.id === d.id),
        )
        .map((d): Linha => ({
          chave: `d-${d.id}`,
          nome: d.name || d.document_type?.name || "Documento",
          doc: d,
        })),
    };
  }, [processo, documentos]);

  if (isLoading) return <MesaCarregando texto="Buscando os documentos…" />;
  // Erro vira página só sem nada carregado; com a lista em mãos, aviso acima dela
  if (isError && !data)
    return (
      <MesaErroBusca
        titulo="Não deu para buscar os documentos"
        texto="A conexão ou o servidor falhou. Nada foi apagado; tente de novo em instantes."
        onTentarDeNovo={() => refetch()}
      />
    );

  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const passa = (l: Linha) =>
    !termo || l.nome.toLocaleLowerCase("pt-BR").includes(termo);
  // Dispensa de etapa é registro, não documento escrito: conta à parte
  const dispensadas = documentos.filter((d) => etapaDispensada(d)).length;
  const existentes = documentos.length - dispensadas;
  const porFazer = etapas.filter((l) => !l.doc).length;

  const tabela = (linhas: Linha[], legenda: string) => (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[36rem] text-sm">
        <caption className="sr-only">{legenda}</caption>
        <thead className="bg-muted/50 text-left">
          <tr>
            <th
              scope="col"
              className="px-3 py-2 font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            >
              Documento
            </th>
            <th
              scope="col"
              className="px-3 py-2 font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            >
              Situação
            </th>
            <th
              scope="col"
              className="px-3 py-2 font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            >
              Versões
            </th>
            <th
              scope="col"
              className="px-3 py-2 font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            >
              Atualizado
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-right font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            >
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            // Dispensado vale também para o documento que caiu em "Outros" (sem linha de etapa)
            const dispensado =
              l.estado === "dispensada" || etapaDispensada(l.doc);
            const situacao = dispensado
              ? SITUACAO.dispensada
              : // etapa adiante com rascunho já aberto está em andamento, não "a fazer"
                l.estado === "pendente" && l.doc
                ? SITUACAO.atual
                : l.estado
                  ? SITUACAO[l.estado]
                  : l.doc?.has_completed_generated_doc
                    ? SITUACAO.concluida
                    : SITUACAO.atual;
            const versoesDoDoc = nVersoes(l.doc);
            return (
              <tr key={l.chave} className="border-t border-border align-middle">
                <td className="px-3 py-3">
                  <span className="font-semibold">
                    {l.numero !== undefined && (
                      <span className="mr-2 font-mono text-muted-foreground">
                        {String(l.numero).padStart(2, "0")}
                      </span>
                    )}
                    {l.nome}
                  </span>
                  {l.obrigatoria !== undefined && (
                    <span className="block text-xs text-muted-foreground">
                      {l.obrigatoria ? "obrigatório" : "recomendado"}
                    </span>
                  )}
                  {dispensado && l.doc?.dismiss_reason && (
                    <span className="block text-xs italic text-muted-foreground">
                      “{l.doc.dismiss_reason}”
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Carimbo tinta={situacao.tinta}>{situacao.texto}</Carimbo>
                </td>
                <td className="px-3 py-3 font-mono">{versoesDoDoc ?? "—"}</td>
                <td className="px-3 py-3 font-mono">
                  {dataCurta(l.doc?.updated_at)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {l.doc && !dispensado ? (
                      <>
                        {l.doc.has_completed_generated_doc && (
                          <BaixarDocumento
                            nome={l.doc.name}
                            idDoArquivo={l.doc.completed_generated_doc_id}
                            variant="outline"
                          />
                        )}
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/documents/${l.doc.id}`}>Abrir ›</Link>
                        </Button>
                      </>
                    ) : (
                      <Link
                        to={`/processes/${processo.id}`}
                        className="text-sm font-semibold text-primary hover:underline dark:text-accent"
                      >
                        Na linha do tempo ›
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const etapasFiltradas = etapas.filter(passa);
  const outrosFiltrados = outros.filter(passa);

  return (
    <div className="space-y-6">
      {isError && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Documentos do processo</h2>
          <p className="text-sm text-muted-foreground">
            {existentes === 0 && dispensadas === 0
              ? "Nenhum documento ainda. Os documentos de etapa nascem na linha do tempo."
              : `${existentes === 0 ? "Nenhum documento escrito ainda" : `${existentes} ${existentes === 1 ? "já existe" : "já existem"}`}${
                  dispensadas === 0
                    ? ""
                    : dispensadas === 1
                      ? "; 1 etapa dispensada"
                      : `; ${dispensadas} etapas dispensadas`
                }${
                  // só fala em etapas por fazer quando sobrou alguma sem documento
                  porFazer === 0
                    ? "."
                    : porFazer === 1
                      ? "; 1 etapa ainda por fazer."
                      : `; ${porFazer} etapas ainda por fazer.`
                }`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar documento…"
              aria-label="Buscar documento"
              className="w-56 pl-9"
            />
          </div>
          {/* O formulário de novo documento lê o processo do endereço (?process=) */}
          <Button
            variant="outline"
            onClick={() => navigate(`/documents/new?process=${processo.id}`)}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Adicionar documento
          </Button>
        </div>
      </div>

      {etapas.length > 0 && (
        <section aria-labelledby="docs-etapas" className="space-y-3">
          <h3 id="docs-etapas" className="font-sans text-base font-semibold">
            Etapas da modalidade · {feitas} de {etapas.length} feitas
          </h3>
          {etapasFiltradas.length > 0 ? (
            tabela(etapasFiltradas, "Documentos das etapas")
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma etapa com esse nome.
            </p>
          )}
        </section>
      )}

      {outros.length > 0 && (
        <section aria-labelledby="docs-outros" className="space-y-3">
          <h3 id="docs-outros" className="font-sans text-base font-semibold">
            Outros documentos
          </h3>
          {outrosFiltrados.length > 0 ? (
            tabela(outrosFiltrados, "Outros documentos do processo")
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum documento com esse nome.
            </p>
          )}
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        Documento de etapa se cria pela linha do tempo: assim ele conta no
        progresso.
      </p>
    </div>
  );
};

const DocumentosDoProcesso: React.FC = () => (
  <ProcessoNaMesa>
    {(processo) => <ListaDeDocumentos processo={processo} />}
  </ProcessoNaMesa>
);

export default DocumentosDoProcesso;
