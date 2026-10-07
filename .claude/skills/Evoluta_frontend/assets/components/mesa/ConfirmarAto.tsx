/**
 * Confirmação antes de cada ato que muda o registro:
 * de onde vem o ato, a pergunta, o carimbo com que ele fica no Histórico, a
 * consequência escrita, o motivo e um par de botões que dizem exatamente o que
 * acontece ("Dispensar etapa") e o contrário ("Voltar").
 */
import React, { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GEN, MARCA } from "@/config/marca";
import { Carimbo, type Tinta } from "./Mesa";

export type ExigenciaDeMotivo = "obrigatorio" | "opcional" | "nenhum";

export interface ConfirmarAtoProps {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  /** De onde vem o ato: "Linha do tempo · etapa 3". */
  origem: string;
  /** A pergunta, como título: "Dispensar a etapa Mapa de riscos?" */
  pergunta: string;
  /** Carimbo com que o ato fica no Histórico ("Dispensa"). Sem ele, o ato não deixa registro. */
  carimbo?: string;
  tinta?: Tinta;
  /** O que acontece, em português comum. */
  consequencia: React.ReactNode;
  motivo?: ExigenciaDeMotivo;
  /** Dica do campo de motivo. */
  dicaDoMotivo?: string;
  /** Botão que faz o ato: diz o que acontece. */
  rotuloConfirmar: string;
  /** Botão que desiste: diz o contrário. */
  rotuloVoltar?: string;
  /** Ato que não se desfaz (publicar, excluir): o botão fica vermelho. */
  irreversivel?: boolean;
  onConfirmar: (motivo: string) => Promise<void> | void;
}

export const ConfirmarAto: React.FC<ConfirmarAtoProps> = ({
  aberto,
  onAbertoChange,
  origem,
  pergunta,
  carimbo,
  tinta = "azul",
  consequencia,
  motivo = "obrigatorio",
  dicaDoMotivo = "Escreva em uma frase por que este ato é necessário.",
  rotuloConfirmar,
  rotuloVoltar = "Voltar",
  irreversivel,
  onConfirmar,
}) => {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const idMotivo = useId();

  // Cada abertura começa limpa
  useEffect(() => {
    if (!aberto) {
      setTexto("");
      setEnviando(false);
      setErro(null);
    }
  }, [aberto]);

  const faltaMotivo = motivo === "obrigatorio" && texto.trim().length === 0;

  const confirmar = async () => {
    if (faltaMotivo || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar(texto.trim());
      onAbertoChange(false);
    } catch {
      // A janela continua aberta, com o motivo escrito: nada se perde
      setErro("Não deu certo, e nada foi alterado. Confira a conexão e tente de novo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AlertDialog open={aberto} onOpenChange={(a) => !enviando && onAbertoChange(a)}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{origem}</p>
          <AlertDialogTitle className="text-2xl font-semibold leading-tight">{pergunta}</AlertDialogTitle>
          {carimbo && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Fica no Histórico com o carimbo
              <Carimbo tinta={tinta}>{carimbo}</Carimbo>
            </p>
          )}
          <AlertDialogDescription asChild>
            <div className="text-sm leading-relaxed text-foreground">{consequencia}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {motivo !== "nenhum" && (
          <div className="space-y-1.5">
            <label htmlFor={idMotivo} className="text-sm font-semibold">
              Motivo {motivo === "opcional" && <span className="font-normal text-muted-foreground">· opcional</span>}
            </label>
            <Textarea
              id={idMotivo}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={dicaDoMotivo}
              rows={3}
              disabled={enviando}
              aria-required={motivo === "obrigatorio"}
            />
            {motivo === "obrigatorio" && (
              <p className="text-xs text-muted-foreground">O motivo fica registrado no Histórico {GEN.do} {MARCA.objeto.singular}.</p>
            )}
          </div>
        )}

        {erro && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {erro}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={enviando}>{rotuloVoltar}</AlertDialogCancel>
          <Button
            onClick={confirmar}
            disabled={faltaMotivo || enviando}
            variant={irreversivel ? "destructive" : "default"}
          >
            {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {rotuloConfirmar}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
