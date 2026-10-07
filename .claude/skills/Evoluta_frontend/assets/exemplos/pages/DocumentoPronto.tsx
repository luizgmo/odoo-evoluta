// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Documento pronto (proposta 7, tela 7): o texto que a IA escreveu, na folha,
 * para ler antes de usar. À margem, o que fazer com ele: abrir no editor,
 * baixar o .docx, pedir um ajuste à IA e seguir para a próxima etapa.
 * Usa as mesmas consultas da tela do documento (documento e versões).
 */
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { documentApi, documentRevisionApi } from "@/services/api/endpoints";
import { Trilha } from "@/components/mesa/Trilha";
import {
  AvisoAtualizacaoFalhou,
  Carimbo,
  MesaErroBusca,
} from "@/components/mesa/Mesa";
import { TextoDoDocumento } from "@/components/mesa/TextoDoDocumento";
import { origemDaVersao, versaoEmUso } from "@/features/documento/versoes";
import { baixarDocx } from "@/utils/baixarDocx";

const LINK = "font-semibold text-primary hover:underline dark:text-accent";

const DocumentoPronto: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [baixando, setBaixando] = useState(false);
  const [erroAoBaixar, setErroAoBaixar] = useState(false);

  const doc = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => documentApi.get(documentId!),
    enabled: !!documentId,
  });
  const versoes = useQuery({
    queryKey: ["document-revisions", documentId],
    queryFn: () => documentRevisionApi.listByDocument(documentId!),
    enabled: !!documentId,
  });

  if (doc.isLoading || versoes.isLoading) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 text-muted-foreground"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Abrindo
        o documento…
      </p>
    );
  }
  // Erro só vira página quando não há nada para mostrar; com o texto já em mãos,
  // uma atualização que falha só ganha o aviso acima da folha
  if (!doc.data) {
    return (
      <MesaErroBusca
        titulo="Não deu para abrir o documento"
        texto="Pode ser a conexão, ou o documento não existe mais. Nada foi alterado."
        onTentarDeNovo={() => doc.refetch()}
      />
    );
  }

  if (versoes.isError && !versoes.data) {
    return (
      <MesaErroBusca
        titulo="Não deu para buscar o texto do documento"
        texto="A conexão ou o servidor falhou. O documento continua lá; nada foi alterado."
        onTentarDeNovo={() => versoes.refetch()}
      />
    );
  }

  const d = doc.data;
  const emUso = versaoEmUso(versoes.data ?? []);
  const processo = d.process;
  const origem = emUso ? origemDaVersao(emUso) : null;

  const baixar = async () => {
    if (!d.completed_generated_doc_id) return;
    setBaixando(true);
    setErroAoBaixar(false);
    try {
      await baixarDocx(d.completed_generated_doc_id, d.name || "documento");
    } catch {
      setErroAoBaixar(true);
    } finally {
      setBaixando(false);
    }
  };

  const atualizacaoFalhou = doc.isError || versoes.isError;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {atualizacaoFalhou && (
        <AvisoAtualizacaoFalhou
          onTentarDeNovo={() => {
            if (doc.isError) void doc.refetch();
            if (versoes.isError) void versoes.refetch();
          }}
        />
      )}
      <Trilha
        passos={[
          { rotulo: "Mesa", para: "/dashboard" },
          { rotulo: "Processos", para: "/processes" },
          ...(processo
            ? [
                {
                  rotulo: processo.code || "Processo",
                  para: `/processes/${processo.id}`,
                  numero: true,
                },
              ]
            : []),
          { rotulo: d.name, para: `/documents/${d.id}` },
          { rotulo: "Documento pronto" },
        ]}
      />
      <header>
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Documento pronto
        </p>
        <h1 className="text-4xl font-semibold [overflow-wrap:anywhere]">{d.name}</h1>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article
          aria-label={`Texto de ${d.name}`}
          className="folha p-6 sm:p-10"
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-border pb-4">
            <div className="space-y-2">
              {processo && (
                <p className="text-sm text-muted-foreground">
                  Processo nº{" "}
                  <span className="font-mono text-foreground">
                    {processo.code || "sem número"}
                  </span>
                </p>
              )}
              {emUso && origem && (
                <Carimbo
                  tinta={origem.tinta}
                >{`Versão ${emUso.revision_number} · ${origem.texto.split(" · ")[0]}`}</Carimbo>
              )}
            </div>
          </div>
          {emUso?.content?.trim() ? (
            <TextoDoDocumento markdown={emUso.content} />
          ) : emUso ? (
            // Versão salva com o texto apagado
            <p className="text-muted-foreground">
              A versão nº {emUso.revision_number} está sem texto.
              {d.completed_generated_doc_id &&
                " Para ler o que a IA escreveu, use o botão Baixar o .docx gerado pela IA."}
            </p>
          ) : d.completed_generated_doc_id ? (
            // Gerado antes de existirem as versões: o texto está só no .docx
            <p className="text-muted-foreground">
              O texto desta geração não está guardado como versão. Para lê-lo,
              use o botão Baixar o .docx gerado pela IA.
            </p>
          ) : (
            <p className="text-muted-foreground">
              A IA ainda não escreveu este documento.{" "}
              <Link to={`/chat8/${d.id}`} className={LINK}>
                Gerar com a IA ›
              </Link>
            </p>
          )}
        </article>

        <aside
          aria-label="O que fazer com o documento"
          className="space-y-4 lg:sticky lg:top-0"
        >
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">Leia antes de usar</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A IA escreve; quem decide e assina é você.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild>
                <Link to={`/documents/${d.id}`}>Abrir no editor ›</Link>
              </Button>
              {d.completed_generated_doc_id && (
                <Button variant="outline" onClick={baixar} disabled={baixando}>
                  {baixando ? (
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  Baixar o .docx gerado pela IA
                </Button>
              )}
              {d.completed_generated_doc_id &&
                emUso &&
                emUso.source !== "AI_GENERATED" && (
                  <p className="text-xs text-muted-foreground">
                    O .docx é o da geração pela IA: não traz as edições da
                    versão nº {emUso.revision_number} mostrada aqui.
                  </p>
                )}
              {erroAoBaixar && (
                <p role="alert" className="text-sm text-destructive">
                  Não deu para baixar agora. Tente de novo em instantes.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[hsl(var(--tinta-violeta)/0.45)] bg-card p-5">
            <h2 className="text-xl font-semibold tinta-violeta">
              Pedir um ajuste à IA
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Diga na conversa o que mudar. Cada ajuste vira uma versão nova, e
              esta continua guardada.
            </p>
            <Link
              to={`/chat8/${d.id}`}
              className={`mt-3 inline-block text-sm ${LINK}`}
            >
              Conversar com a IA ›
            </Link>
          </section>

          {processo && (
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-xl font-semibold">Próximo passo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Na linha do tempo do processo, siga para a etapa seguinte.
              </p>
              <Link
                to={`/processes/${processo.id}`}
                className={`mt-3 inline-block text-sm ${LINK}`}
              >
                Voltar à linha do tempo ›
              </Link>
            </section>
          )}

        </aside>
      </div>
    </div>
  );
};

export default DocumentoPronto;
