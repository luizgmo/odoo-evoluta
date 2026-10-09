/**
 * Busca rápida (Ctrl+K ou o campo da faixa): ir a uma tela ou abrir um
 * projeto pelo código ou nome. Os projetos vêm da mesma consulta das telas da Mesa.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { cn } from "@/lib/utils";

import { GEN, MARCA } from "@/config/marca";
import { itensDoPerfil } from "./navegacao";

/** Não rouba o Ctrl+K de quem está escrevendo (editor de documento, chat). */
const escrevendo = (alvo: EventTarget | null) => {
  const el = alvo as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || el.tagName === "TEXTAREA";
};

const ResultadosDeProcessos: React.FC<{ ir: (para: string) => void }> = ({ ir }) => {
  const { processos, data, isLoading, isError } = useProcessosDaMesa();
  if (isLoading) return <p className="px-4 py-3 text-sm text-muted-foreground">Buscando na lista…</p>;
  // Com a lista de antes em mãos, busca nela mesmo
  if (isError && !data) return <p className="px-4 py-3 text-sm text-muted-foreground">Não deu para buscar a lista agora.</p>;
  if (processos.length === 0) return null;
  return (
    <CommandGroup heading={MARCA.objeto.plural.charAt(0).toUpperCase() + MARCA.objeto.plural.slice(1)}>
      {processos.map((p) => (
        <CommandItem
          key={p.id}
          // o texto de busca junta número e objeto
          value={`${p.code ?? ""} ${p.object ?? ""} ${p.id}`}
          onSelect={() => ir(`${MARCA.rotaDaLista}/${p.id}`)}
        >
          <FolderOpen className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="mr-2 font-semibold">{p.code || MARCA.objeto.semNumero}</span>
          <span className="truncate text-muted-foreground group-data-[selected=true]:text-accent-foreground" title={p.object}>{p.object}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export const BuscaRapida: React.FC<{ perfil?: string; className?: string }> = ({ perfil, className }) => {
  const [aberta, setAberta] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && !escrevendo(e.target)) {
        e.preventDefault();
        setAberta((a) => !a);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  const ir = (para: string) => {
    setAberta(false);
    navigate(para);
  };

  const telas = itensDoPerfil(perfil);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        title={`Buscar ${MARCA.objeto.singular} ou tela (Ctrl K)`}
        className={cn(
          "flex h-10 items-center gap-2 rounded-lg border border-moldura-foreground/15 bg-moldura-foreground/5 px-3 text-sm text-moldura-foreground/70 transition-colors",
          "hover:bg-moldura-foreground/10 hover:text-moldura-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          className,
        )}
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden truncate lg:inline">Buscar {MARCA.objeto.singular} ou tela…</span>
        <span className="sr-only lg:hidden">Buscar {MARCA.objeto.singular} ou tela</span>
        <kbd className="ml-auto hidden rounded border border-moldura-foreground/25 px-1.5 font-mono text-[11px] lg:inline">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={aberta} onOpenChange={setAberta}>
        {/* Nome da janela para leitor de tela */}
        <DialogTitle className="sr-only">Busca rápida</DialogTitle>
        <DialogDescription className="sr-only">Digite para achar {GEN.um} {MARCA.objeto.singular} ou ir a uma tela.</DialogDescription>
        <CommandInput placeholder={`Código ${GEN.do} ${MARCA.objeto.singular}, nome ou tela…`} />
        <CommandList>
          <CommandEmpty>Nada encontrado com esse texto.</CommandEmpty>
          <CommandGroup heading="Ações">
            <CommandItem value={`${MARCA.acaoPrincipal.rotulo} ${MARCA.acaoPrincipal.sinonimos}`} onSelect={() => ir(MARCA.acaoPrincipal.caminho)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              {MARCA.acaoPrincipal.rotulo}
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Ir para">
            {telas.map(({ caminho, rotulo, icone: Icone }) => (
              <CommandItem key={caminho} value={`tela ${rotulo}`} onSelect={() => ir(caminho)}>
                <Icone className="mr-2 h-4 w-4" aria-hidden="true" />
                {rotulo}
              </CommandItem>
            ))}
          </CommandGroup>
          {aberta && <ResultadosDeProcessos ir={ir} />}

        </CommandList>
      </CommandDialog>
    </>
  );
};
