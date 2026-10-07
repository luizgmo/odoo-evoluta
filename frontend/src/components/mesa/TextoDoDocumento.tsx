/**
 * Texto de documento (markdown) como sai no papel: serifa, títulos, listas e
 * tabelas. O HTML passa pelo sanitizador do projeto antes de entrar na tela.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { markdownDocumentoToSafeHtml } from "@/utils/markdown";

export const TextoDoDocumento: React.FC<{ markdown: string; className?: string; rotulo?: string }> = ({
  markdown,
  className,
  rotulo,
}) => (
  <div
    className={cn("texto-do-documento", className)}
    aria-label={rotulo}
    // markdownDocumentoToSafeHtml sanitiza com DOMPurify (com linha, citação e h5/h6, que o chat não usa)
    dangerouslySetInnerHTML={{ __html: markdownDocumentoToSafeHtml(markdown) }}
  />
);
