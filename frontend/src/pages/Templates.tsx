/**
 * Biblioteca de templates (mock G3c): cartões com Gerar projeto simulado.
 * Em G4 a lista e a geração vêm do servidor.
 */
import React, { useState } from "react";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { Button } from "@/components/ui/button";

const MODELOS = [
  { nome: "Implantação LGPD", detalhe: "5 tasks: inventário, TI, jurídico, treino, auditoria." },
  { nome: "Plano Estratégico Municipal", detalhe: "Em breve: eixos, metas e responsáveis." },
  { nome: "Redução de despesas", detalhe: "Em breve: diagnóstico e plano de corte." },
];

const Cartao: React.FC<{ nome: string; detalhe: string }> = ({ nome, detalhe }) => {
  const [feito, setFeito] = useState(false);
  return (
    <div className="folha space-y-3 p-4 md:p-6">
      <h2 className="font-display text-2xl font-semibold">{nome}</h2>
      <p className="text-sm text-muted-foreground">{detalhe}</p>
      <div>
        <Button type="button" onClick={() => setFeito(true)}>
          Gerar projeto
        </Button>
      </div>
      {feito && (
        <p role="status" className="text-sm text-muted-foreground">
          Demonstração: o projeto apareceria na lista. Some ao recarregar.
        </p>
      )}
    </div>
  );
};

const Templates: React.FC = () => (
  <FolhaDaTela
    trilha={[{ rotulo: "Templates" }]}
    titulo="Biblioteca de templates"
    subtitulo="Método pronto que vira projeto com um clique."
  >
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {MODELOS.map((m) => (
        <Cartao key={m.nome} nome={m.nome} detalhe={m.detalhe} />
      ))}
    </div>
  </FolhaDaTela>
);

export default Templates;
