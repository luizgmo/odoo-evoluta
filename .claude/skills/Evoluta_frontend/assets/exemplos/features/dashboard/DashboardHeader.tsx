// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saudacao } from "./formatos";

interface Props {
  /**
   * Nome de exibição já resolvido pelo caller (via `getFullName`) — nome real
   * do usuário, com `username` apenas como último fallback. Passar o login
   * cru aqui faz a saudação virar "Bom dia, jsilva".
   */
  displayName: string;
  /** Uma frase sobre a semana, debaixo da saudação. */
  resumo?: string;
}

export const DashboardHeader: React.FC<Props> = ({ displayName, resumo }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const primeiroNome = displayName?.split(" ")[0];
  const data = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl font-semibold leading-none md:text-5xl">
          {saudacao(now.getHours())}
          {primeiroNome ? `, ${primeiroNome}.` : "."}
        </h1>
        <p className="mt-2 text-muted-foreground">
          <span className="first-letter:uppercase inline-block">{data}.</span>
          {resumo && <> {resumo}</>}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to="/processes">Ver processos</Link>
        </Button>
        <Button asChild>
          <Link to="/processes/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nova contratação
          </Link>
        </Button>
      </div>
    </header>
  );
};
