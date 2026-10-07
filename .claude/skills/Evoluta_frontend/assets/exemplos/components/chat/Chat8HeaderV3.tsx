// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Cabeçalho da conversa com a IA (proposta 7, telas 5 e 6): a trilha até o
 * processo, o documento em que a IA está trabalhando e o caminho de volta à
 * linha do tempo. O estado da conexão fica no painel de perguntas, logo abaixo. A troca de documento é feita na pasta
 * do processo; aqui só se mostra qual é.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentInfoModal } from "@/components/DocumentInfoModal";
import { Trilha } from "@/components/mesa/Trilha";

interface Chat8HeaderV3Props {
  documents: any[];
  selectedDocumentId: string | null;
  loadingDocuments: boolean;
  loadingSession: boolean;
  /**
   * @deprecated 2026-05-11: o dropdown de troca de documento foi removido —
   * a seleção é feita na página `/documents`. Prop mantida só por
   * compatibilidade do callsite atual (Chat8V3). Pode ser excluída na
   * próxima limpeza junto com a passagem da prop no Chat8V3.tsx.
   */
  onDocumentSelect?: (docId: string) => void;
}

export const Chat8HeaderV3: React.FC<Chat8HeaderV3Props> = ({ documents, selectedDocumentId, loadingDocuments, loadingSession }) => {
  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId);
  const processo = selectedDocument?.process as { id: number | string; code?: string } | null | undefined;
  const LINK = "text-sm font-semibold text-primary hover:underline dark:text-accent";

  return (
    <header id="chat8-header" className="chat8-header space-y-3" role="banner" aria-label="Cabeçalho do Chat" data-testid="chat8-header">
      <Trilha
        passos={[
          { rotulo: "Mesa", para: "/dashboard" },
          { rotulo: "Processos", para: "/processes" },
          ...(processo ? [{ rotulo: processo.code || "Processo", para: `/processes/${processo.id}`, numero: true }] : []),
          ...(selectedDocument ? [{ rotulo: selectedDocument.name as string, para: `/documents/${selectedDocument.id}` }] : []),
          { rotulo: "Gerar por IA" },
        ]}
      />
      <nav
        id="chat8-nav"
        aria-label="Controles de navegação e seleção de documento"
        className="chat8-nav flex flex-wrap items-end justify-between gap-x-6 gap-y-3"
        role="navigation"
        data-testid="chat8-nav"
      >
        <section
          id="document-select-section"
          className="document-select-section min-w-0"
          aria-labelledby="document-select-label"
          role="region"
          data-testid="document-select-section"
        >
          <h2 id="document-select-label" className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Gerar por IA · <span className="tinta-violeta">a IA pergunta, você responde</span>
          </h2>
          <div
            id="document-select-wrapper"
            className="document-select-container flex items-center gap-3"
            role="region"
            aria-label="Informações do documento selecionado"
            data-testid="document-select-wrapper"
          >
            <div className="min-w-0" data-testid="document-info">
              {selectedDocument ? (
                <>
                  {/* Título principal da tela (leitor de tela: "ir ao título") */}
                  <h1 className="truncate font-display text-3xl font-semibold leading-tight" title={selectedDocument.document_type?.name} data-testid="document-type-name">
                    {selectedDocument.document_type?.name ?? "Documento sem tipo"}
                  </h1>
                  {selectedDocument.process?.code && (
                    <p className="truncate text-sm text-muted-foreground" title={selectedDocument.process.code} data-testid="document-process-code">
                      Processo nº <span className="font-mono">{selectedDocument.process.code}</span>
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* Sem o documento na lista (ou ainda carregando), a tela ainda tem título principal */}
                  <h1 className="font-display text-3xl font-semibold leading-tight">Conversa com a IA</h1>
                  <p className="text-sm text-muted-foreground">Nenhum documento selecionado</p>
                </>
              )}
            </div>
            {(loadingDocuments || loadingSession) && (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" data-testid="document-loading-spinner" aria-label="Carregando" />
            )}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {selectedDocument && (
            <DocumentInfoModal
              document={selectedDocument}
              triggerButton={
                <Button variant="ghost" size="sm">
                  Sobre este documento
                </Button>
              }
            />
          )}
          {selectedDocument?.has_completed_generated_doc && (
            <Link to={`/documents/${selectedDocument.id}/pronto`} className={LINK}>
              Ler o documento pronto ›
            </Link>
          )}
          {processo && (
            <Link to={`/processes/${processo.id}`} className={LINK}>
              ‹ Voltar à linha do tempo
            </Link>
          )}
        </div>
      </nav>
      <p className="text-xs text-muted-foreground">A IA escreve; quem decide e assina é você.</p>
    </header>
  );
};

export default Chat8HeaderV3;
