// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual (para exclusão simples; para atos com carimbo prefira ConfirmarAto)
import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: (reason: string) => Promise<void> | void;
  confirmLabel?: string;
  confirmClassName?: string;
  submittingLabel?: string;
}

/**
 * F-17 — Dialog de confirmação para soft-delete. Pede motivo opcional
 * (texto livre), desabilita ação durante submit, fecha ao concluir.
 * Reutilizável entre listas de Processos e Documentos.
 */
export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Excluir",
  confirmClassName = "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  submittingLabel = "Excluindo…",
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirm(reason.trim());
      onOpenChange(false);
    } catch (err) {
      console.error("[DeleteConfirmDialog] delete error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label
            htmlFor="delete-reason"
            className="text-sm text-muted-foreground"
          >
            Motivo (opcional)
          </label>
          <Textarea
            id="delete-reason"
            data-testid="delete-reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: criado por engano, duplicidade, etc."
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={confirmClassName}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {submittingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
