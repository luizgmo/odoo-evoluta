// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import {
  Archive,
  Edit3,
  XCircle,
  Download,
  AlertTriangle,
  ChevronLeft,
  Target,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PastaDoProcesso } from "@/components/mesa/PastaDoProcesso";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { processApi, documentApi, apiClient, chatApi } from "@/services/api";
import { Process } from "@/types/process";
import { VisualTimeline } from "@/components/documents/VisualTimeline";
import { FeatureInDevelopment } from "@/components/ui/feature-in-development";
import { ConfirmarAto } from "@/components/mesa/ConfirmarAto";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { ResumoDaPasta } from "@/components/mesa/ResumoDaPasta";
import { AvisoAtualizacaoFalhou } from "@/components/mesa/Mesa";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getFullName } from "@/utils/getFullName";
import { PROCESS_STATUS } from "@/constants/process-status";

interface Modality {
  id: number;
  name: string;
}

export default function ProcessTimelineV3() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // §2.17 do relatório de Aguaí: a IA anunciava documento concluído e a página
  // do processo continuava mostrando a etapa em aberto até um F5.
  //
  // A causa é que Redux e react-query são silos separados: o evento WS
  // `document_generated` só escreve em `state.documents.generatedDocs`, e nada
  // invalidava `["process-documents", id]`, que é o que a timeline lê. Observar
  // o slice e invalidar fecha a ponte sem duplicar fonte de verdade — a
  // timeline continua servida pela query, não pelo Redux.
  const generatedDocsVersion = useAppSelector(
    (state) => Object.keys(state.documents.generatedDocs).length,
  );
  useEffect(() => {
    if (!id) return;
    queryClient.invalidateQueries({ queryKey: ["process-documents", id] });
  }, [generatedDocsVersion, id, queryClient]);
  const { user } = useAuth();

  const { toast } = useToast();
  const { avisar } = useAvisoDeResultado();
  const podeReativar = user?.role === "admin" || user?.role === "master" || user?.role === "gestor";

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // F-16 — Dispensar stage
  const [stageToDismiss, setStageToDismiss] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Fetch process data
  // NOTE: Backend limitation - GET /processes/{id}/ does not include documents array
  // Documents must be fetched separately using GET /documents/?process={id}
  const {
    data: process,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["process", id],
    queryFn: () => processApi.get(id!),
    enabled: !!id,
  });

  // Fetch documents for this process
  const { data: documentsResponse } = useQuery({
    queryKey: ["process-documents", id],
    queryFn: async () => {
      const response = await documentApi.getByProcess(id!);
      const docs = Array.isArray(response) ? response : (response as any)?.results || [];
      return docs;
    },
    enabled: !!id,
  });


  // Fetch modalities from backend
  const { data: modalities = [] } = useQuery<Modality[]>({
    queryKey: ["modalities"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/modalities/");
        return Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
      } catch (error) {
        console.error("Error fetching modalities:", error);
        return [];
      }
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async () => {
      // TODO: Backend needs archive endpoint
      // await processApi.archive(id!);
      return processApi.update(id!, { status: PROCESS_STATUS.ARQUIVADO });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process", id] });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      setShowArchiveModal(false);
      navigate("/processes");
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      // TODO: Backend needs cancel endpoint with reason field
      // await processApi.cancel(id!, cancelReason);
      return processApi.update(id!, { status: PROCESS_STATUS.ARQUIVADO });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process", id] });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      setShowCancelModal(false);
      setCancelReason("");
      navigate("/processes");
    },
  });


  const getModalityLabel = (modalityId: number | undefined) => {
    if (!modalityId) return "Sem modalidade";
    const modality = modalities.find((m) => Number(m.id) === modalityId);
    return modality?.name || process.modality?.name || "Sem modalidade";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Com o processo em mãos, uma atualização que falha não esconde a pasta
  if (!process) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar o processo. Por favor, tente novamente.
          </AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          onClick={() => navigate("/processes")}
          className="mt-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para processos
        </Button>
      </div>
    );
  }

  // TODO: Calculate deadline and progress from backend data when ProcessStage is available
  // const daysUntilDeadline = process.deadline_date ? differenceInDays(new Date(process.deadline_date), new Date()) : null;
  // const completedStages = stages.filter(s => s.status === 'approved').length;
  // const totalStages = stages.length;
  // const progress = (completedStages / totalStages) * 100;

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        <PastaDoProcesso
          processo={process}
          modalidade={process.modality?.id ? getModalityLabel(Number(process.modality.id)) : "Sem modalidade"}
          acoes={
            <Button onClick={() => navigate(`/processes/${id}/edit`)}>
              <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
              Editar a ficha
            </Button>
          }
        >
        <div className="space-y-8">
        {error && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}
        <ResumoDaPasta documentos={documentsResponse || []} />

        {/* TODO: Credit and Legal Alerts - Backend needs CreditPricing and LegalParameters entities */}
        {/* Implement alert cards here when backend is ready */}

        {/* Progress Section - Integration with VisualTimeline */}
        <VisualTimeline
          process={process}
          documents={documentsResponse || []}
          onStageClick={(stage) => {
            const docIdOrObj = stage.id;
            const generatedDoc = (documentsResponse || []).find(d => {
              const tId = typeof d.document_type === 'object' ? d.document_type.id : d.document_type;
              return String(tId) === String(docIdOrObj);
            });

            if (generatedDoc) {
              navigate(`/documents/${generatedDoc.id}`);
            }
          }}
          onGenerateAI={async (stage) => {
            // F-15: criar documento imediatamente e abrir chat IA — pula tela manual.
            // F-22: pré-preencher responsable com nome completo do usuário atual.
            toast({
              title: "Criando sessão de chat…",
              description: `Preparando ${stage.name} para geração por IA.`,
            });
            try {
              const newDoc = await documentApi.create({
                name: stage.name,
                description: `Gerado por IA — ${stage.name}`,
                document_type: stage.id,
                process: process.id,
                responsible: getFullName(user),
              } as any);
              if (newDoc?.id) {
                navigate(`/chat8/${newDoc.id}`);
                return;
              }
            } catch (error) {
              console.error("F-15 onGenerateAI: falha ao criar documento, fallback para tela manual", error);
              toast({
                title: "Falha ao criar sessão",
                description: "Redirecionando para formulário manual.",
                variant: "destructive",
              });
            }
            navigate(`/documents/new?process=${process.id}&type=${stage.id}`);
          }}
          onCreateEdit={(stage, existingDoc) => {
            // F-18: se o documento já existe, vai direto para o editor (DocumentDetail)
            // com histórico de revisões. O chat continua acessível pelo botão
            // "Abrir chat IA" dentro do editor.
            if (existingDoc) {
              navigate(`/documents/${existingDoc.id}`);
              return;
            }
            navigate(`/documents/new?process=${process.id}&type=${stage.id}`);
          }}
          onDismiss={(stage) => {
            setStageToDismiss({ id: Number(stage.id), name: stage.name });
          }}
          canReactivate={podeReativar}
          onReactivate={async (stage) => {
            // BUG-028: reativar etapa dispensada. Backend tem o endpoint
            // /stages/<id>/undismiss/ desde F-16; frontend estava sem ligação.
            try {
              await processApi.undismissStage(process.id, Number(stage.id));
              toast({
                title: "Etapa reativada",
                description: `${stage.name} voltou para "Em Andamento".`,
              });
              queryClient.invalidateQueries({ queryKey: ["process", id] });
              queryClient.invalidateQueries({ queryKey: ["process-documents", id] });
              queryClient.invalidateQueries({ queryKey: ["processes"] });
            } catch (error) {
              console.error("Erro ao reativar etapa:", error);
              toast({
                title: "Falha ao reativar",
                description: "Tente novamente ou contate o suporte.",
                variant: "destructive",
              });
            }
          }}
        />

        {/* Process Details */}
        {(process.object || process.description) && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Objeto e observações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Object Summary */}
            {process.object && (
              <div>
                <h3 className="mb-3 font-sans text-base font-semibold text-foreground">
                  Objeto completo
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-background p-4 rounded-lg border border-border">
                  {process.object}
                </p>
              </div>
            )}

            {/* Description/Notes */}
            {process.description && (
              <div>
                <h3 className="mb-3 font-sans text-base font-semibold text-foreground">
                  Descrição adicional
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-background p-4 rounded-lg border border-border">
                  {process.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Os documentos do processo ficam na divisória Documentos da pasta */}

        </div>
        </PastaDoProcesso>

        {/* BUG-017: "Diagnóstico IA" feature stub só em dev. Remove ruído
            visual em produção — o card não é interativo. */}
        {import.meta.env.DEV ? (
          <FeatureInDevelopment
            title="Diagnóstico do Sistema IA"
            description="Sistema de verificação automática de pré-requisitos para geração de documentos via IA."
            features={[
              "Validação de agente PENSADOR, tabela de preços e saldo de créditos",
              "Verificação de mapeamentos de herança e dados do processo/etapa",
              "Sugestões automáticas de correção para problemas detectados",
              "Indicadores visuais (verde/amarelo/vermelho) com detalhes técnicos expandíveis",
            ]}
          />
        ) : null}


        {/* Archive Modal */}
        <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
          <DialogContent className="bg-navy-800 border-navy-500">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Arquivar Processo
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Tem certeza que deseja arquivar este processo? Ele não será
                excluído, apenas movido para o arquivo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowArchiveModal(false)}
                className="border-navy-500 hover:bg-navy-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => archiveMutation.mutate()}
                disabled={archiveMutation.isPending}
                className="gradient-primary"
              >
                {archiveMutation.isPending ? "Arquivando…" : "Arquivar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="bg-navy-800 border-navy-500">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Cancelar Processo
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Tem certeza que deseja cancelar este processo? Esta ação não pode
                ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Motivo do cancelamento (opcional)
              </label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Descreva o motivo do cancelamento…"
                className="bg-navy-900 border-navy-500 text-foreground"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="border-navy-500 hover:bg-navy-700"
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Cancelando…" : "Cancelar Processo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* F-16 — Dispensar etapa: motivo obrigatório; quem pode reativar ganha o Desfazer */}
        <ConfirmarAto
          aberto={!!stageToDismiss}
          onAbertoChange={(aberto) => {
            if (!aberto) setStageToDismiss(null);
          }}
          origem={`Linha do tempo · ${stageToDismiss?.name ?? "etapa"}`}
          pergunta={`Dispensar a etapa ${stageToDismiss?.name ?? ""}?`}
          carimbo="Dispensa"
          tinta="ocre"
          consequencia={
            <>
              A etapa passa a contar como feita no progresso, e o motivo fica registrado. Só gestor ou administrador
              pode reativá-la depois.
            </>
          }
          dicaDoMotivo="Por que esta etapa não é necessária neste processo?"
          rotuloConfirmar="Dispensar etapa"
          onConfirmar={async (motivo) => {
            if (!stageToDismiss || !process) return;
            const etapa = stageToDismiss;
            const atualizar = () => queryClient.invalidateQueries({ queryKey: ["process-documents", id] });
            await processApi.dismissStage(process.id, etapa.id, motivo);
            await atualizar();
            avisar({
              texto: `Etapa "${etapa.name}" dispensada${process.code ? ` no ${process.code}` : ""}.`,
              desfazer: podeReativar
                ? async () => {
                    await processApi.undismissStage(process.id, etapa.id);
                    await atualizar();
                  }
                : undefined,
            });
          }}
        />
      </div>
    </div>
  );
}
