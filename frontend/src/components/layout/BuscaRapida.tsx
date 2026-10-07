/**
 * Busca rápida (Ctrl+K ou o campo da faixa): ir a uma tela ou abrir um
 * processo pelo número ou objeto. Os processos vêm da mesma consulta das
 * telas da mesa (chave ["processes"]), só enquanto a janela está aberta.
 * Os artigos da lei que o sistema usa abrem na gaveta "Lei ao lado" (só quando
 * MARCA.leiAoLado é true, ou seja, em sistema de licitação).
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus, Scale, Search } from "lucide-react";
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
import { ARTIGOS } from "@/features/lei/artigos";
import { useLeiAoLado } from "@/features/lei/contextoDaLei";
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
  const leiDoContexto = useLeiAoLado();
  const lei = MARCA.leiAoLado && ARTIGOS.length > 0 ? leiDoContexto : null;

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
  const abrirArtigo = (numero: string) => {
    setAberta(false);
    // Depois de a busca fechar e devolver o foco, a gaveta abre e o toma
    setTimeout(() => lei?.abrir(numero), 0);
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
        <DialogDescription className="sr-only">Digite para achar {GEN.um} {MARCA.objeto.singular}, ir a uma tela{lei ? " ou abrir um artigo da lei" : ""}.</DialogDescription>
        <CommandInput placeholder={`Número ${GEN.do} ${MARCA.objeto.singular}, título${lei ? ", tela ou artigo da lei" : " ou tela"}…`} />
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
          {lei && (
            <CommandGroup heading="Na lei">
              {ARTIGOS.map((a) => (
                <CommandItem key={a.numero} value={`lei art ${a.numero} artigo ${a.numero} ${a.titulo}`} onSelect={() => abrirArtigo(a.numero)}>
                  <Scale className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="mr-2 whitespace-nowrap font-mono text-sm">Art. {a.numero}</span>
                  <span className="truncate text-muted-foreground group-data-[selected=true]:text-accent-foreground" title={a.titulo}>{a.titulo}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
