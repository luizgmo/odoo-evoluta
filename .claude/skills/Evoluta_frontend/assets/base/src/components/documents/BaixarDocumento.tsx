/**
 * Botão de baixar o .docx de um documento. Só aparece quando o arquivo já existe
 * (`idDoArquivo`); o clique não abre o cartão em que estiver. Não sai na impressão.
 */
import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { baixarDocx, type BlocoDocx } from "@/utils/baixarDocx";

interface Props {
  /** Nome do arquivo baixado (sem extensão) e rótulo acessível do botão. */
  nome: string;
  /** Título impresso na primeira linha do .docx. Sem ele vale `nome`. */
  titulo?: string;
  idDoArquivo?: string | null;
  /** Conteúdo do .docx gerado no navegador (parágrafos e subtítulos). Sem ele, sai só o título e uma linha neutra. */
  blocos?: BlocoDocx[];
  variant?: ButtonProps["variant"];
  rotulo?: string;
  /** Onde o botão está, para distinguir botões do mesmo documento na mesma tela (leitor de tela). */
  contexto?: string;
}

export const BaixarDocumento: React.FC<Props> = ({
  nome,
  titulo,
  idDoArquivo,
  blocos,
  variant = "default",
  rotulo = "Baixar .docx",
  contexto,
}) => {
  const [baixando, setBaixando] = useState(false);
  const [falhou, setFalhou] = useState(false);
  if (!idDoArquivo) return null;

  const baixar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBaixando(true);
    setFalhou(false);
    try {
      await baixarDocx(idDoArquivo, nome || "documento", blocos, titulo);
    } catch {
      setFalhou(true);
    } finally {
      setBaixando(false);
    }
  };

  return (
    <span className="nao-imprimir inline-flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        variant={variant}
        size="sm"
        onClick={baixar}
        disabled={baixando}
        aria-label={`${rotulo} — ${nome || "documento"}${contexto ? ` (${contexto})` : ""}`}
        title="Baixar o arquivo .docx deste documento."
      >
        {baixando ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
        )}
        {baixando ? "Baixando…" : rotulo}
      </Button>
      {falhou && (
        <span role="alert" className="text-xs text-destructive">
          Não baixou. Tente de novo.
        </span>
      )}
    </span>
  );
};
