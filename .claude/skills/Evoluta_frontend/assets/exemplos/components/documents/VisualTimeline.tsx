// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import { Check, Clock, FileText, Zap, Pencil, Ban, ChevronDown, ChevronUp, Download, Undo2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Process, ModalityStage } from "@/types/process";
import { Document } from "@/types/document";
import GeneratedDocumentLink from "@/components/chat/GeneratedDocumentLink";
import { BaixarDocumento } from "./BaixarDocumento";
import { generatedDocApi } from "@/services/api/endpoints";
import { documentosPorEtapa, etapasDoProcesso } from "./etapasDoProcesso";

interface VisualTimelineProps {
    process: Process;
    documents: Document[];
    onStageClick?: (stage: ModalityStage) => void;
    onGenerateAI?: (stage: ModalityStage) => void;
    onCreateEdit?: (stage: ModalityStage, existingDoc?: Document) => void;
    onDismiss?: (stage: ModalityStage) => void;
    onReactivate?: (stage: ModalityStage) => void;
    canReactivate?: boolean;
    activeDocumentTypeId?: string;
}

export const VisualTimeline: React.FC<VisualTimelineProps> = ({
    process,
    documents,
    onStageClick,
    onGenerateAI,
    onCreateEdit,
    onDismiss,
    onReactivate,
    canReactivate = false,
    activeDocumentTypeId,
}) => {
    const [expandedStage, setExpandedStage] = React.useState<string | number | null>(null);

    if (!process || !process.modality || !process.modality.stages) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                Selecione um processo para visualizar a linha do tempo.
            </div>
        );
    }

    // Regra das etapas (feita, dispensada, atual) num lugar só: etapasDoProcesso.ts
    const situacao = etapasDoProcesso(process, documents);
    const stages = situacao.etapas.map((e) => e.etapa);
    const totalStages = situacao.total;
    const documentMap = documentosPorEtapa(documents);
    const currentStage = situacao.atual;

    // Auto-expandir a etapa atual
    React.useEffect(() => {
        if (currentStage && expandedStage === null) {
            setExpandedStage(currentStage.id);
        }
    }, [currentStage]);

    const getStageStatus = (_stage: ModalityStage, index: number) => {
        const estado = situacao.etapas[index].estado;
        return {
            isCompleted: estado === "concluida",
            isDismissed: estado === "dispensada",
            isCurrent: estado === "atual",
            isPending: estado === "pendente",
        };
    };

    return (
        <div className="w-full space-y-6">
            {/* ===== Título da Timeline ===== */}
            <h2 className="font-display text-2xl font-semibold text-foreground">Etapas do processo</h2>

            {/* ===== Lista Vertical de Estágios ===== */}
            <div className="space-y-3">
                {stages.map((stage, index) => {
                    const { isCompleted, isDismissed, isCurrent, isPending } = getStageStatus(stage, index);
                    const generatedDoc = documentMap.get(String(stage.id));
                    const isExpanded = expandedStage === stage.id || isCurrent;

                    // Cores e estilos por estado (Pendentes aparecem cinzentas)
                    let cardBg = "bg-[hsl(var(--mesa-papel))]";
                    let cardBorder = "border-[hsl(var(--mesa-linha))]";
                    let iconBg = "bg-[hsl(var(--mesa-papel2))]";
                    let iconColor = "text-muted-foreground";
                    let statusBadgeBg = "bg-muted text-muted-foreground";
                    let statusText = "Aguardando";

                    if (isDismissed) {
                        // F-16 — dispensada: tinta ocre discreta, visivelmente distinta de concluída.
                        cardBg = "bg-[hsl(var(--mesa-papel2))]";
                        cardBorder = "border-[hsl(var(--tinta-ocre)/0.45)]";
                        iconBg = "bg-[hsl(var(--tinta-ocre)/0.12)]";
                        iconColor = "text-[hsl(var(--tinta-ocre))]";
                        statusBadgeBg = "bg-[hsl(var(--tinta-ocre)/0.12)] text-[hsl(var(--tinta-ocre))] border-[hsl(var(--tinta-ocre)/0.4)]";
                        statusText = "Dispensado";
                    } else if (isCompleted) {
                        // Concluída: a folha segue igual às outras; só o fio e o carimbo ganham a tinta verde
                        cardBg = "bg-[hsl(var(--mesa-papel))]";
                        cardBorder = "border-[hsl(var(--tinta-verde)/0.45)]";
                        iconBg = "bg-[hsl(var(--tinta-verde)/0.12)]";
                        iconColor = "text-[hsl(var(--tinta-verde))]";
                        statusBadgeBg = "bg-[hsl(var(--tinta-verde)/0.12)] text-[hsl(var(--tinta-verde))] border-[hsl(var(--tinta-verde)/0.4)]";
                        statusText = "Concluído";
                    } else if (isCurrent) {
                        // Etapa da vez: folha em destaque (fio de ouro só no escuro, onde ele tem contraste)
                        cardBg = "bg-[hsl(var(--mesa-papel))] shadow-md";
                        cardBorder = "border-primary dark:border-gold";
                        iconBg = "bg-[hsl(var(--tinta-azul)/0.12)]";
                        iconColor = "text-[hsl(var(--tinta-azul))]";
                        statusBadgeBg = "bg-[hsl(var(--tinta-azul)/0.12)] text-[hsl(var(--tinta-azul))] border-[hsl(var(--tinta-azul)/0.4)]";
                        statusText = "Em Andamento";
                    }

                    return (
                        <Card
                            key={stage.id}
                            className={`${cardBg} ${cardBorder} rounded-md border shadow-[0_2px_0_hsl(var(--mesa-linha2))] transition-all duration-300 cursor-pointer hover:border-primary/40`}
                            onClick={() => {
                                setExpandedStage(expandedStage === stage.id ? null : stage.id);
                            }}
                        >
                            <CardContent className={`${isExpanded ? 'p-5' : 'p-4'}`}>
                                <div className="flex items-start gap-4">
                                    {/* Ícone de documento */}
                                    <div className={`${iconBg} w-14 h-14 rounded-xl flex items-center justify-center shrink-0`}>
                                        {isDismissed ? (
                                            <Ban className={`w-7 h-7 ${iconColor}`} />
                                        ) : isCompleted ? (
                                            <Check className={`w-7 h-7 ${iconColor}`} />
                                        ) : (
                                            <FileText className={`w-7 h-7 ${iconColor}`} />
                                        )}
                                    </div>

                                    {/* Conteúdo principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className={`font-bold ${isExpanded ? 'text-lg' : 'text-base'} ${isDismissed ? 'line-through text-[hsl(var(--tinta-ocre))]' : 'text-foreground'} truncate`}>
                                                {stage.name}
                                            </h3>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isExpanded ? (
                                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={`${statusBadgeBg} border text-xs px-2 py-0.5`}>
                                                {isCurrent && <Clock className="inline w-3 h-3 mr-1" />}
                                                {isCompleted && !isDismissed && <Check className="inline w-3 h-3 mr-1" />}
                                                {isDismissed && <Ban className="inline w-3 h-3 mr-1" />}
                                                {statusText}
                                            </Badge>
                                            {/* Step counter — índice dentro da modalidade, não stage.order absoluto */}
                                            <Badge className="border border-[hsl(var(--mesa-contorno))] bg-[hsl(var(--mesa-papel2))] text-[hsl(var(--mesa-texto2))] text-xs px-2 py-0.5">
                                                {index + 1}/{totalStages}
                                            </Badge>
                                            {stage.is_required && (
                                                <Badge className="border border-[hsl(var(--tinta-carmim)/0.4)] bg-[hsl(var(--tinta-carmim)/0.1)] text-[hsl(var(--tinta-carmim))] text-xs px-2 py-0.5">
                                                    Obrigatório
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Etapa fechada: o download não pode ficar escondido atrás do clique que abre o cartão */}
                                        {!isExpanded && !isDismissed && generatedDoc?.completed_generated_doc_id && (
                                            <div className="mb-1">
                                                <BaixarDocumento
                                                    nome={generatedDoc.name}
                                                    idDoArquivo={generatedDoc.completed_generated_doc_id}
                                                    contexto="na linha do tempo"
                                                    variant="outline"
                                                />
                                            </div>
                                        )}

                                        {/* Conteúdo expandido */}
                                        {isExpanded && (
                                            <div className="mt-3 space-y-3">
                                                {/* Barra de progresso da etapa */}
                                                <div>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                                        <span>Progresso da Etapa</span>
                                                        <span className={isCompleted ? 'text-[hsl(var(--tinta-verde))]' : 'text-muted-foreground'}>
                                                            {isCompleted ? '100%' : isCurrent ? '25%' : '0%'}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-[hsl(var(--mesa-linha2))] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: isCompleted ? '100%' : isCurrent ? '25%' : '0%',
                                                                background: isCompleted
                                                                    ? "hsl(var(--tinta-verde))"
                                                                    : isCurrent
                                                                        ? "hsl(var(--cta))"
                                                                        : "hsl(var(--mesa-linha))",
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Doc existente */}
                                                {generatedDoc && (
                                                    generatedDoc.completed_generated_doc_id ? (
                                                        <GeneratedDocumentLink
                                                            generatedDocId={generatedDoc.completed_generated_doc_id}
                                                            documentName={generatedDoc.name}
                                                            className="w-full text-[hsl(var(--tinta-verde))] bg-[hsl(var(--tinta-verde)/0.08)] px-3 py-2.5 rounded-md border border-[hsl(var(--tinta-verde)/0.25)] hover:bg-[hsl(var(--tinta-verde)/0.14)] transition-colors"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--tinta-verde))] bg-[hsl(var(--tinta-verde)/0.08)] p-2 rounded-md">
                                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate">{generatedDoc.name}</span>
                                                        </div>
                                                    )
                                                )}

                                                {/* Botões de ação */}
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {isDismissed ? (
                                                        <div className="flex items-start justify-between gap-3 w-full">
                                                            <div className="text-xs text-[hsl(var(--tinta-ocre))] italic">
                                                                Etapa dispensada{generatedDoc?.dismiss_reason ? `: ${generatedDoc.dismiss_reason}` : '.'}
                                                                {!canReactivate && ' Reversão disponível apenas para administradores.'}
                                                            </div>
                                                            {canReactivate && onReactivate ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-[hsl(var(--tinta-ocre)/0.5)] text-[hsl(var(--tinta-ocre))] hover:bg-[hsl(var(--tinta-ocre)/0.1)] text-xs px-3 py-1.5 h-auto rounded-md shrink-0"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onReactivate(stage);
                                                                    }}
                                                                >
                                                                    <Undo2 className="w-3.5 h-3.5 mr-1.5" />
                                                                    Reativar
                                                                </Button>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-[hsl(var(--cta))] hover:bg-[hsl(var(--cta)/0.9)] text-white text-xs px-4 py-2 h-auto rounded-md"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onGenerateAI?.(stage);
                                                                }}
                                                            >
                                                                <Zap className="w-3.5 h-3.5 mr-1.5" />
                                                                Gerar por IA
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-[hsl(var(--cta)/0.5)] text-primary hover:bg-[hsl(var(--cta)/0.08)] dark:text-accent text-xs px-4 py-2 h-auto rounded-md"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onCreateEdit?.(stage, generatedDoc);
                                                                }}
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                                                Criar/Editar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-[hsl(var(--tinta-carmim)/0.45)] text-[hsl(var(--tinta-carmim))] hover:bg-[hsl(var(--tinta-carmim)/0.08)] text-xs px-4 py-2 h-auto rounded-md"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDismiss?.(stage);
                                                                }}
                                                            >
                                                                <Ban className="w-3.5 h-3.5 mr-1.5" />
                                                                Dispensar
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
