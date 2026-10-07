// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * F-18 — Página de detalhes + editor + histórico de revisões de Document.
 *
 * - Tab **Conteúdo**: carrega a revisão ativa (última) do documento e oferece
 *   textarea markdown; ao salvar, cria uma nova revisão USER_EDIT.
 * - Tab **Histórico**: lista append-only com data, autor, source e notas;
 *   botão Restaurar cria uma nova revisão RESTORED copiando o conteúdo da alvo.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  History,
  Save,
  Loader2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  documentApi,
  documentRevisionApi,
  documentTemplateApi,
  type DocumentRevision,
} from "@/services/api/endpoints";
import { Button } from "@/components/ui/button";
import { Trilha } from "@/components/mesa/Trilha";
import { BaixarDocumento } from "@/components/documents/BaixarDocumento";
import { VersoesDoDocumento } from "@/features/documento/VersoesDoDocumento";
import { versaoEmUso } from "@/features/documento/versoes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MarkdownEditor,
  MarkdownEditorBoundary,
} from "@/components/MarkdownEditor";
import { useFeature } from "@/hooks/useFeature";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const sourceLabel = (s: DocumentRevision["source"]) =>
  s === "AI_GENERATED" ? "IA" : s === "USER_EDIT" ? "Edição manual" : "Restauração";

const DocumentDetail: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "master";

  const docQuery = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => documentApi.get(documentId!),
    enabled: !!documentId,
  });

  const revisionsQuery = useQuery({
    queryKey: ["document-revisions", documentId],
    queryFn: () => documentRevisionApi.listByDocument(documentId!),
    enabled: !!documentId,
  });

  const revisions: DocumentRevision[] = revisionsQuery.data ?? [];
  const activeRevision = useMemo(() => versaoEmUso(revisions), [revisions]);

  // Template envelope (texto_pre/texto_pos) que encapsula este documento na
  // geração do .docx. Preferência: empresa > global. Usamos só pra preview
  // read-only — edição continua em /templates.
  const templateQuery = useQuery({
    queryKey: ["document-envelope", docQuery.data?.document_type?.id],
    queryFn: () =>
      documentTemplateApi.list({
        documentTypeId: docQuery.data!.document_type!.id,
      }),
    enabled: !!docQuery.data?.document_type?.id,
  });
  const envelopeTemplate = useMemo(() => {
    const list = templateQuery.data ?? [];
    if (list.length === 0) return null;
    // Prefere o da empresa; global é fallback.
    const specific = list.find((t) => t.company !== null);
    return specific ?? list[0];
  }, [templateQuery.data]);
  const hasEnvelope =
    !!envelopeTemplate &&
    (envelopeTemplate.texto_pre.trim() !== "" ||
      envelopeTemplate.texto_pos.trim() !== "");

  // M2 item #3 — toggle is_exemplar (Library). Exibido apenas pra admin.
  const toggleExemplarMutation = useMutation({
    mutationFn: (id: string) => documentApi.toggleExemplar(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["library"] });
      toast({
        title: data.is_exemplar
          ? "Marcado como exemplar"
          : "Desmarcado como exemplar",
        description: data.is_exemplar
          ? "Documento agora aparece na Biblioteca."
          : undefined,
      });
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Erro ao alterar",
        description: "Verifique permissão (apenas admin/master).",
      }),
  });

  const [draft, setDraft] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (activeRevision) setDraft(activeRevision.content);
  }, [activeRevision?.id]);

  const dirty = activeRevision ? draft !== activeRevision.content : !!draft;

  // Hardening M2 Fase 4 — avisa se o usuário tentar fechar a aba com
  // alterações não salvas. beforeunload não permite mensagem custom em
  // browsers modernos; exibem um texto padrão. Handler só conecta quando
  // dirty pra evitar prompt em navegação normal.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // M2 — rich editor atrás de feature flag. Fallback textarea quando off
  // ou quando o useFeature ainda não carregou (undefined).
  const useRichEditor = useFeature("rich_editor") === true;
  const editorPlaceholder = activeRevision
    ? "Edite o conteúdo em markdown…"
    : "Este documento ainda não tem versões — comece escrevendo aqui.";

  const handleSave = async () => {
    if (!documentId) return;
    try {
      setIsSaving(true);
      await documentRevisionApi.create(documentId, draft, notes.trim() || undefined);
      setNotes("");
      await queryClient.invalidateQueries({
        queryKey: ["document-revisions", documentId],
      });
      toast({ title: "Versão salva", description: "A versão anterior continua guardada em Versões." });
    } catch (err) {
      console.error("[DocumentDetail] save error:", err);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar a nova versão.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async (rev: DocumentRevision) => {
    try {
      setRestoringId(rev.id);
      const newRev = await documentRevisionApi.restore(rev.id);
      await queryClient.invalidateQueries({
        queryKey: ["document-revisions", documentId],
      });
      toast({
        title: `Versão nº ${rev.revision_number} restaurada`,
        description: `Virou a versão nº ${newRev.revision_number}.`,
      });
    } catch (err) {
      console.error("[DocumentDetail] restore error:", err);
      toast({
        variant: "destructive",
        title: "Erro ao restaurar",
        description: "Tente novamente.",
      });
    } finally {
      setRestoringId(null);
    }
  };

  if (docQuery.isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando documento…
      </div>
    );
  }

  const doc = docQuery.data;
  if (!doc) {
    return (
      <div className="p-6">
        <p className="text-red-400">Documento não encontrado.</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto space-y-6">
        <Trilha
          passos={[
            { rotulo: "Mesa", para: "/dashboard" },
            { rotulo: "Processos", para: "/processes" },
            ...(doc.process?.code ? [{ rotulo: doc.process.code, para: `/processes/${doc.process.id}`, numero: true }] : []),
            { rotulo: doc.name },
          ]}
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground [overflow-wrap:anywhere]">{doc.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {doc.document_type?.name && (
                <Badge variant="outline">{doc.document_type.name}</Badge>
              )}
              {doc.process?.code && (
                <Link
                  to={`/processes/${doc.process.id}`}
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  {doc.process.code}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <BaixarDocumento
              nome={doc.name}
              idDoArquivo={doc.completed_generated_doc_id}
              rotulo="Baixar documento (.docx)"
            />
            {isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleExemplarMutation.mutate(doc.id)}
                disabled={toggleExemplarMutation.isPending}
                data-testid="toggle-exemplar"
                className={
                  doc.is_exemplar
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/50"
                    : ""
                }
              >
                {toggleExemplarMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4 mr-1" />
                )}
                {doc.is_exemplar ? "Exemplar" : "Marcar exemplar"}
              </Button>
            ) : null}
            {activeRevision &&
              // A folha mostra a versão salva; saindo daqui, o que não foi salvo se perderia
              (dirty ? (
                <Button variant="ghost" size="sm" disabled title="Salve como nova versão para ler como folha">
                  Ler como folha
                  <span className="sr-only"> (salve antes: há alterações não salvas)</span>
                </Button>
              ) : (
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/documents/${doc.id}/pronto`}>Ler como folha</Link>
                </Button>
              ))}
            <Button asChild variant="outline" size="sm">
              <Link to={`/chat8/${doc.id}`}>Conversar com a IA</Link>
            </Button>
          </div>
        </div>

        {!doc.completed_generated_doc_id ? (
          <p className="text-sm text-muted-foreground">
            Ainda não há arquivo .docx para baixar. Ele nasce quando a IA conclui o documento (use Conversar com a IA).
          </p>
        ) : activeRevision && activeRevision.source !== "AI_GENERATED" ? (
          <p className="text-sm text-muted-foreground">
            O .docx é o da geração pela IA: não traz as edições da versão nº {activeRevision.revision_number}.
          </p>
        ) : null}

        {hasEnvelope && envelopeTemplate ? (
          <details className="group bg-muted/30 border border-border rounded-md">
            <summary className="cursor-pointer px-4 py-2 text-sm text-muted-foreground flex items-center justify-between">
              <span>
                📎 Envelope do template{" "}
                <span className="text-foreground">
                  {envelopeTemplate.company_name}
                </span>{" "}
                — texto pré + pós que envolvem o conteúdo na geração do
                .docx.
              </span>
              <Link
                to="/templates"
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:underline text-xs ml-2"
              >
                Editar
              </Link>
            </summary>
            <div className="p-4 space-y-3 border-t border-border">
              {envelopeTemplate.texto_pre.trim() ? (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    Antes do conteúdo
                  </div>
                  <MarkdownEditorBoundary
                    fallback={() => (
                      <pre className="whitespace-pre-wrap text-sm font-mono p-2 border rounded">
                        {envelopeTemplate.texto_pre}
                      </pre>
                    )}
                  >
                    <MarkdownEditor
                      value={envelopeTemplate.texto_pre}
                      readOnly
                      ariaLabel="Texto pré do template"
                    />
                  </MarkdownEditorBoundary>
                </div>
              ) : null}
              {envelopeTemplate.texto_pos.trim() ? (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    Depois do conteúdo
                  </div>
                  <MarkdownEditorBoundary
                    fallback={() => (
                      <pre className="whitespace-pre-wrap text-sm font-mono p-2 border rounded">
                        {envelopeTemplate.texto_pos}
                      </pre>
                    )}
                  >
                    <MarkdownEditor
                      value={envelopeTemplate.texto_pos}
                      readOnly
                      ariaLabel="Texto pós do template"
                    />
                  </MarkdownEditorBoundary>
                </div>
              ) : null}
            </div>
          </details>
        ) : null}

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content" data-testid="tab-content">
              <FileText className="w-4 h-4 mr-2" /> Conteúdo
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              Versões{revisions.length ? ` (${revisions.length})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                <CardTitle className="text-base">
                  Versão em uso{" "}
                  {activeRevision && (
                    <span className="text-muted-foreground font-normal">
                      #{activeRevision.revision_number} ·{" "}
                      {sourceLabel(activeRevision.source)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {useRichEditor ? (
                  <MarkdownEditorBoundary
                    fallback={() => (
                      <Textarea
                        data-testid="editor-textarea"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={editorPlaceholder}
                        rows={18}
                        className="font-mono text-sm"
                      />
                    )}
                  >
                    <MarkdownEditor
                      value={draft}
                      onChange={setDraft}
                      placeholder={editorPlaceholder}
                      ariaLabel="Conteúdo do documento"
                    />
                  </MarkdownEditorBoundary>
                ) : (
                  <Textarea
                    data-testid="editor-textarea"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={editorPlaceholder}
                    rows={18}
                    className="font-mono text-sm"
                  />
                )}
                <Textarea
                  data-testid="editor-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anotação (opcional) — ex.: 'ajuste no valor estimado'"
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {dirty ? "Alterações não salvas" : "Sem alterações"}
                  </p>
                  <Button
                    onClick={handleSave}
                    disabled={!dirty || isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar como nova versão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-2">
            {revisionsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
              </p>
            ) : (
              <VersoesDoDocumento
                versoes={revisions}
                emUsoId={activeRevision?.id}
                restaurandoId={restoringId}
                onRestaurar={handleRestore}
                rascunhoNaoSalvo={dirty}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DocumentDetail;
