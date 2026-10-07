// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
import React from "react";
import { Link } from "react-router-dom";
import { FileText, FolderPlus, Library, MessageSquare, LucideIcon } from "lucide-react";

interface Action {
  label: string;
  hint: string;
  to: string;
  icon: LucideIcon;
}

const ACTIONS: Action[] = [
  { label: "Nova contratação", hint: "três perguntas abrem a pasta", to: "/processes/new", icon: FolderPlus },
  { label: "Gerar documento", hint: "TR, ETP, edital", to: "/documents", icon: FileText },
  { label: "Biblioteca", hint: "documentos exemplares", to: "/library", icon: Library },
  { label: "Conversar com a IA", hint: "assistente de licitações", to: "/chat8", icon: MessageSquare },
];

export const QuickActionsRow: React.FC = () => (
  <nav aria-label="Acesso rápido" className="flex flex-wrap items-center gap-3">
    <span className="mr-2 font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      Acesso rápido
    </span>
    {ACTIONS.map(({ label, hint, to, icon: Icon }) => (
      <Link
        key={to}
        to={to}
        className="mesa-un flex items-center gap-3 px-3 py-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">{label}</span>
          <span className="block text-xs text-muted-foreground">{hint}</span>
        </span>
      </Link>
    ))}
  </nav>
);
