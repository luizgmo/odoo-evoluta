/**
 * Ponto de chegada de `/documents/:id` — os links do resumo da pasta (ResumoDaPasta), o botão
 * "Abrir como documento" da pasta (Item.tsx) e as telas de exemplo apontam para cá. Troque o miolo
 * pela leitura/edição do documento; mantenha a moldura FolhaDaTela, a trilha e o botão de baixar
 * (a ação mais importante).
 *
 * O documento é montado somente a partir do projeto retornado pelo Odoo. Não existe conteúdo
 * demonstrativo nem fallback local: id inválido, projeto inexistente ou projeto fora do escopo
 * municipal resultam em "não encontrado".
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
import { blocosDoItem, nomeDoDocumentoDoItem } from "@/utils/blocosDoItem";

const Documento: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const idValido = /^\d{1,12}$/.test(id);
  const { data: item, isLoading, error } = useProcessoDaMesa(idValido ? id : undefined);
  const titulo = item ? nomeDoDocumentoDoItem(item) : "Documento do projeto";
  const blocos = item ? blocosDoItem(item) : [];
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
          idValido && !isLoading && item ? (
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
        ) : !item || error ? (
          <AvisoDeEstado rotulo="Não encontrado" titulo="Este projeto não está disponível" nivel={2} acoes={voltar}>
            O projeto pode ter sido arquivado, removido ou estar fora do município da sua conta.
          </AvisoDeEstado>
        ) : (
          <article className="folha texto-do-documento p-5 md:p-8" aria-label="Ficha do projeto">
            {blocos.map((b, i) => (typeof b === "string" ? <p key={i}>{b}</p> : <h2 key={i}>{b.titulo}</h2>))}
          </article>
        )}
      </FolhaDaTela>
    </div>
  );
};

export default Documento;
