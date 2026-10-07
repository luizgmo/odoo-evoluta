/**
 * Ponto de chegada de `/documents/:id` — os links do resumo da pasta (ResumoDaPasta), o botão
 * "Abrir como documento" da pasta (Item.tsx) e as telas de exemplo apontam para cá. Troque o miolo
 * pela leitura/edição do documento; mantenha a moldura FolhaDaTela, a trilha e o botão de baixar
 * (a ação mais importante).
 *
 * Aqui não há servidor: o id só é conferido no formato (somente dígitos). Se for o id de um item
 * (useProcessoDaMesa), o documento é o relatório montado dos dados dele (blocosDoItem); senão vale
 * o conteúdo de demonstração (BLOCOS). Nos dois casos o que está na folha é o que vai ao .docx,
 * e o título da tela é o título do arquivo.
 * Na tela real, cubra os quatro estados — carregando, erro com "Tentar de novo", documento que
 * não existe (o ramo "não encontrado" abaixo) e conteúdo — e esconda o botão de baixar quando
 * não houver documento. Para texto em markdown, use TextoDoDocumento (puxa markdown + DOMPurify,
 * ≈ 70 kB a mais no JS) com `blocosParaMarkdown(blocos)` (utils/baixarDocx.ts).
 */
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { AvisoDeEstado } from "@/components/mesa/AvisoDeEstado";
import { MesaCarregando } from "@/components/mesa/Mesa";
import { BaixarDocumento } from "@/components/documents/BaixarDocumento";
import { useProcessoDaMesa } from "@/hooks/useMesaDados";
import { MARCA } from "@/config/marca";
import type { BlocoDocx } from "@/utils/baixarDocx";
import { blocosDoItem, nomeDoDocumentoDoItem } from "@/utils/blocosDoItem";

/** Conteúdo de demonstração (id que não é de item): parágrafos e { titulo }. Troque pelo documento real. */
const TITULO_DA_DEMONSTRACAO = "Documento";
const BLOCOS: BlocoDocx[] = [
  { titulo: "Texto do documento" },
  "Este é o conteúdo de demonstração do documento.",
  { titulo: "Observações" },
  "O arquivo baixado leva exatamente o que está nesta folha.",
];

const Documento: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const idValido = /^\d{1,12}$/.test(id);
  const { data: item, isLoading } = useProcessoDaMesa(idValido ? id : undefined);
  const titulo = item ? nomeDoDocumentoDoItem(item) : TITULO_DA_DEMONSTRACAO;
  const blocos = item ? blocosDoItem(item) : BLOCOS;
  const voltar = (
    <Button asChild className="nao-imprimir">
      <Link to={MARCA.rotaInicial}>Voltar para {MARCA.inicio} ›</Link>
    </Button>
  );
  return (
    // .area-impressao: no Ctrl+P sai só a folha (sem faixa, menu, trilha nem botões)
    <div className="area-impressao">
      <FolhaDaTela
        trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: "Documento" }]}
        titulo={titulo}
        acao={
          idValido && !isLoading ? (
            <BaixarDocumento variant="outline" nome={titulo} idDoArquivo={id} rotulo="Baixar o documento (.docx)" blocos={blocos} />
          ) : undefined
        }
      >
        {!idValido ? (
          <AvisoDeEstado rotulo="Não encontrado" titulo="Este documento não existe" nivel={2} acoes={voltar}>
            O link pode ter sido copiado pela metade, ou o documento foi removido.
          </AvisoDeEstado>
        ) : isLoading ? (
          <MesaCarregando texto="Abrindo o documento…" />
        ) : (
          <article className="folha texto-do-documento p-5 md:p-8" aria-label="Texto do documento">
            {blocos.map((b, i) => (typeof b === "string" ? <p key={i}>{b}</p> : <h2 key={i}>{b.titulo}</h2>))}
          </article>
        )}
      </FolhaDaTela>
    </div>
  );
};

export default Documento;
