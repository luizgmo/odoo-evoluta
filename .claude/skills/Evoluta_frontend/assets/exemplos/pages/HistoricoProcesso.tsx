// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Divisória "Histórico" da pasta: o livro de registro do processo (proposta 7,
 * tela 13). Folha furada com margem de livro, dias com folhinha e cada ato
 * com o seu carimbo, do mais recente ao mais antigo.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import type { Process } from "@/types/process";
import { documentRevisionApi } from "@/services/api/endpoints";
import type { DocumentRevision } from "@/services/api/endpoints/document-revisions";
import { useDocumentosDoProcesso } from "@/hooks/useMesaDados";
import { cn } from "@/lib/utils";
import { DivisoriasDeFiltro } from "@/components/mesa/DivisoriasDeFiltro";
import { AvisoAtualizacaoFalhou, Carimbo, Folhinha, MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { ProcessoNaMesa } from "@/components/mesa/ProcessoNaMesa";
import { FILTROS_DO_HISTORICO, filtrar, montarHistorico, porDia, type IdDoFiltro } from "@/components/mesa/historico";

const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const LivroDeRegistro: React.FC<{ processo: Process }> = ({ processo }) => {
  const { documentos, data, isLoading, isError, refetch } = useDocumentosDoProcesso(String(processo.id));
  const versoes = useQueries({
    queries: documentos.map((d) => ({
      queryKey: ["document-revisions", String(d.id)],
      queryFn: () => documentRevisionApi.listByDocument(String(d.id)),
      staleTime: 60_000,
    })),
  });
  const carregandoVersoes = versoes.some((v) => v.isLoading);
  // Versões que não vieram: o livro ficaria incompleto parecendo completo
  const falharam = versoes.filter((v) => v.isError);
  // Em erro, a nova tentativa não volta a "carregando": só isFetching diz que está tentando
  const tentando = falharam.some((v) => v.isFetching);
  const [filtro, setFiltro] = useState<IdDoFiltro>("tudo");

  const registros = useMemo(() => {
    const porDocumento: Record<string, DocumentRevision[]> = {};
    documentos.forEach((d, i) => {
      porDocumento[String(d.id)] = versoes[i]?.data ?? [];
    });
    return montarHistorico(processo, documentos, porDocumento);
  }, [processo, documentos, versoes]);

  if (isLoading) return <MesaCarregando texto="Abrindo o livro de registro…" />;
  // Erro vira página só sem nada carregado; com o livro em mãos, aviso acima dele
  if (isError && !data)
    return (
      <MesaErroBusca
        titulo="Não deu para abrir o histórico"
        texto="A conexão ou o servidor falhou. Nada foi perdido; tente de novo em instantes."
        onTentarDeNovo={() => refetch()}
      />
    );

  const visiveis = filtrar(registros, filtro);
  const dias = porDia(visiveis);
  const contar = (id: IdDoFiltro) => filtrar(registros, id).length;

  return (
    <div className="space-y-5">
      {isError && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Livro de registro</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            A abertura do processo, as versões dos documentos e as dispensas de etapa, do mais recente ao mais antigo.
          </p>
        </div>
        {/* No celular, um dado por linha: lado a lado, o número do processo não cabe */}
        <dl className="grid grid-cols-1 divide-y divide-border rounded border border-border text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { r: "Processo", v: processo.code || "—", mono: true },
            { r: "Registros", v: String(registros.length), mono: true },
            { r: "Aberto em", v: processo.created_at ? new Date(processo.created_at).toLocaleDateString("pt-BR") : "—", mono: true },
          ].map(({ r, v, mono }) => (
            <div key={r} className="flex items-baseline justify-between gap-3 px-3 py-1.5 sm:block">
              <dt className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{r}</dt>
              {/* No celular o número (texto livre, pode ser longo) quebra em vez de estourar a folha */}
              <dd className={cn("text-right [overflow-wrap:anywhere] sm:whitespace-nowrap sm:text-left", mono && "font-mono")}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <DivisoriasDeFiltro<IdDoFiltro>
        rotulo="Filtrar o histórico"
        opcoes={FILTROS_DO_HISTORICO.map((f) => ({ id: f.id, rotulo: f.rotulo, total: contar(f.id) }))}
        valor={filtro}
        onChange={setFiltro}
      />

      <div className="folha folha-furada margem-registro p-5">
        {carregandoVersoes && <p className="mb-3 text-sm text-muted-foreground">Buscando as versões dos documentos…</p>}
        {falharam.length > 0 && (
          <p role="alert" className="mb-3 text-sm font-semibold tinta-carmim">
            {falharam.length === 1
              ? "As versões de 1 documento não puderam ser buscadas: este histórico está incompleto."
              : `As versões de ${falharam.length} documentos não puderam ser buscadas: este histórico está incompleto.`}{" "}
            <button
              type="button"
              onClick={() => falharam.forEach((v) => void v.refetch())}
              disabled={tentando}
              className="nao-imprimir font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60 dark:text-accent"
            >
              {tentando ? "Tentando…" : "Tentar de novo"}
            </button>
          </p>
        )}
        {dias.length === 0 ? (
          <p className="text-muted-foreground">
            {filtro === "tudo" ? "Nada registrado ainda neste processo." : "Nenhum registro deste tipo."}
          </p>
        ) : (
          <ol className="space-y-6">
            {dias.map(({ dia, chave, registros: doDia }) => (
              <li key={chave} className="flex gap-4">
                <Folhinha data={dia} />
                <span className="sr-only">{dia.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                <ol className="min-w-0 flex-1 divide-y divide-border/70">
                  {doDia.map((r) => (
                    <li
                      key={r.id}
                      // No celular: hora e carimbo em cima, a frase e o "Ver" embaixo (lado a lado a frase ficava sem largura)
                      className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1 py-2.5 sm:grid-cols-[3.5rem_auto_minmax(0,1fr)_auto] sm:gap-y-3"
                    >
                      <span className="pt-0.5 font-mono text-sm text-muted-foreground">{hora(r.ts)}</span>
                      <span className="justify-self-start">
                        <Carimbo tinta={r.tinta}>{r.carimbo}</Carimbo>
                      </span>
                      <span className="col-start-2 min-w-0 text-sm sm:col-start-auto">
                        {r.frase}
                        {r.nota && <span className="mt-0.5 block italic text-muted-foreground">“{r.nota}”</span>}
                      </span>
                      {r.para && (
                        <Link to={r.para} className="col-start-2 whitespace-nowrap text-sm font-semibold text-primary hover:underline dark:text-accent sm:col-start-auto">
                          Ver ›
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        O livro mostra a abertura do processo, as versões dos documentos e as dispensas de etapa.
      </p>
    </div>
  );
};

const HistoricoProcesso: React.FC = () => (
  <ProcessoNaMesa imprimivel>{(processo) => <LivroDeRegistro processo={processo} />}</ProcessoNaMesa>
);

export default HistoricoProcesso;
