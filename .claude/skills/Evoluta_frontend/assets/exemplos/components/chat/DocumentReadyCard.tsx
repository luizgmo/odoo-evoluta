// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Download, Edit3, ArrowRight, Loader2, Flag, FileText, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { documentApi } from "@/services/api/endpoints";
import { baixarDocx } from "@/utils/baixarDocx";
import { useAppDispatch } from "@/store/hooks";
import { upsertDocument, type GeneratedDocInfo } from "@/store/slices/documentsSlice";

interface DocumentReadyCardProps {
  info: GeneratedDocInfo;
  documentName?: string;
  onDismiss?: () => void;
}

/**
 * F-19 — Card exibido no chat após o documento ser gerado (evento WS
 * `document_generated` com status `completed`). Oferece três ações:
 *   1. Baixar (.docx)
 *   2. Editar (abre DocumentDetail; editor rico virá com F-18)
 *   3. Próxima etapa (cria Document para a próxima ModalityStage e
 *      navega para o novo chat). Se `is_final_stage`, mostra
 *      "Processo concluído" e leva para a página do processo.
 */
export const DocumentReadyCard: React.FC<DocumentReadyCardProps> = ({
  info,
  documentName,
  onDismiss,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCreatingNext, setIsCreatingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = documentName || "documento";

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      await baixarDocx(info.generated_doc_id, displayName);
    } catch (err) {
      console.error("[DocumentReadyCard] Download error:", err);
      setError("Erro ao baixar documento");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = () => {
    if (!info.document_id) return;
    navigate(`/documents/${info.document_id}`);
  };

  const handleNextStage = async () => {
    if (info.is_final_stage || !info.next_stage) {
      if (info.process?.id) navigate(`/processes/${info.process.id}`);
      return;
    }
    if (!info.process?.id) {
      setError("Processo não identificado");
      return;
    }
    try {
      setIsCreatingNext(true);
      setError(null);
      const newDoc = await documentApi.create({
        name: `${info.next_stage.document_type.name} - ${info.process.code}`,
        description: "",
        document_type: info.next_stage.document_type.id,
        process: info.process.id,
      });
      // 2026-05-11: insere o doc novo no Redux ANTES do navigate. Sem
      // isso, o Chat8HeaderV3 abre com "Nenhum documento selecionado"
      // porque `documents.find(d => d.id === newDoc.id)` retorna
      // undefined até o fetchDocuments async repopular a lista.
      dispatch(upsertDocument(newDoc));
      onDismiss?.();
      navigate(`/chat8/${newDoc.id}`);
    } catch (err) {
      console.error("[DocumentReadyCard] Create next stage error:", err);
      setError("Erro ao criar próxima etapa");
    } finally {
      setIsCreatingNext(false);
    }
  };

  // `is_partial` vem do payload WS `document_generated`. Sem distinguir,

  // um trecho revisado se anunciaria como documento pronto — a correção

  // de backend ficaria invisível justamente onde o usuário decide.

  const isPartial = !!info.is_partial;


  return (
    <div
      data-testid="document-ready-card"
      className="rounded-lg border border-[hsl(var(--tinta-verde)/0.45)] bg-card p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        {isPartial ? (
          <FileText className="w-6 h-6 tinta-ocre shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-6 h-6 tinta-verde shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div className="flex-1">
          <h3
            className={
              isPartial
                ? "text-sm font-semibold tinta-ocre"
                : "text-sm font-semibold tinta-verde"
            }
          >
            {isPartial ? "Trecho revisado" : "Documento pronto"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPartial
              ? "A IA devolveu apenas um trecho, não o documento inteiro. O documento completo continua valendo — abra o editor para conferir antes de seguir."
              : info.is_final_stage
              ? "Esta é a última etapa da modalidade — o processo está completo."
              : info.next_stage
              ? `Próxima etapa: ${info.next_stage.document_type.name}`
              : "Documento gerado. Você pode baixar ou editar."}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Ler o texto inteiro na folha antes de seguir (proposta 7, tela 7) */}
        {!isPartial && info.document_id && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/documents/${info.document_id}/pronto`)}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <BookOpenText className="w-3.5 h-3.5" aria-hidden="true" />
            Ler o documento pronto
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={isDownloading}
          className="h-8 text-xs flex items-center gap-1.5"
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Baixar .docx
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleEdit}
          disabled={!info.document_id}
          className="h-8 text-xs flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Editar
        </Button>

        {/* Com um trecho na mão, "Próxima etapa" é o pior caminho possível:
            levaria o usuário a seguir com o documento fragmentado. O botão
            some; o editor continua acessível. (Feedback Aguaí §2.34/§2.39.) */}
        {isPartial ? null : info.is_final_stage ? (
          <Button
            size="sm"
            variant="default"
            onClick={handleNextStage}
            disabled={!info.process?.id}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5" />
            Processo concluído
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={handleNextStage}
            disabled={isCreatingNext || !info.next_stage || !info.process?.id}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            {isCreatingNext ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            Próxima etapa
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentReadyCard;
