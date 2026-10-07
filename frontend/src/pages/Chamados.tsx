/**
 * Chamados (mock G3c): lista simples do helpdesk. Em G4 lê os tickets reais.
 */
import React from "react";
import { Link } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { Button } from "@/components/ui/button";

const CHAMADOS = [
  { id: "HT0001", titulo: "Trocar lâmpadas do bairro Centro", situacao: "Aberto" },
  { id: "HT0002", titulo: "Buraco na Rua das Flores", situacao: "Em andamento" },
  { id: "HT0003", titulo: "Poda de árvore na praça", situacao: "Concluído" },
];

const Chamados: React.FC = () => (
  <FolhaDaTela
    trilha={[{ rotulo: "Chamados" }]}
    titulo="Chamados"
    subtitulo="Pedidos das secretarias com prazo acompanhado."
    acao={
      <Button type="button" size="sm">
        Novo chamado
      </Button>
    }
  >
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] rounded-lg border border-border">
        <caption className="sr-only">Chamados de demonstração</caption>
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Código
            </th>
            <th scope="col" className="px-3 py-2 text-left font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Título
            </th>
            <th scope="col" className="px-3 py-2 text-left font-ui text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Situação
            </th>
          </tr>
        </thead>
        <tbody>
          {CHAMADOS.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="px-3 py-2 font-mono text-sm">{c.id}</td>
              <td className="px-3 py-2 text-sm">{c.titulo}</td>
              <td className="px-3 py-2 text-sm">{c.situacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="mt-3 text-sm text-muted-foreground">
      <Link to="/projetos" className="font-semibold text-primary hover:underline dark:text-accent">
        Ver projetos ›
      </Link>
    </p>
  </FolhaDaTela>
);

export default Chamados;
