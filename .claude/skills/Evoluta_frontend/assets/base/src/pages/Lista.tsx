/**
 * Lista de exemplo (receita 09 §2): cada item é uma pasta na gaveta. Divisórias de filtro
 * (a escolhida vive no endereço, ?aba=) + régua de busca/ordem + 4 estados (carregando, erro,
 * vazio, conteúdo). Troque os dados e os campos da pasta; mantenha a estrutura.
 * Para excluir, passe `onExcluir` à PastaNaGaveta (sem ela o botão não aparece) e use ConfirmarAto.
 */
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowDownUp, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { DivisoriasDeFiltro } from "@/components/mesa/DivisoriasDeFiltro";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { PastaNaGaveta } from "@/components/mesa/PastaNaGaveta";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { daAba, listaVazia, ordenar, type AbaDaLista, type Ordem } from "@/features/processos/listaDeProcessos";
import { dataDeAbertura, formatBRL } from "@/features/dashboard/formatos";
import { GEN, MARCA } from "@/config/marca";

const plural = MARCA.objeto.plural.charAt(0).toUpperCase() + MARCA.objeto.plural.slice(1);
const ABAS: AbaDaLista[] = ["ativos", "sem-data", "todos"];

const Lista: React.FC = () => {
  const { processos, isLoading, isError, refetch } = useProcessosDaMesa();
  const [params, setParams] = useSearchParams();
  const pedida = params.get("aba") as AbaDaLista | null;
  const aba: AbaDaLista = pedida && ABAS.includes(pedida) ? pedida : "ativos";
  const setAba = (a: AbaDaLista) => setParams(a === "ativos" ? {} : { aba: a }, { replace: true });
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("proxima-abertura");

  const termo = busca.trim().toLowerCase();
  const filtrando = termo !== "";
  const visiveis = ordenar(
    daAba(processos, aba).filter((p) => !termo || `${p.code} ${p.object} ${p.description}`.toLowerCase().includes(termo)),
    ordem,
  );

  return (
    <FolhaDaTela
      trilha={[{ rotulo: MARCA.inicio, para: MARCA.rotaInicial }, { rotulo: plural }]}
      titulo={plural}
      subtitulo={`Tudo o que está em andamento, uma pasta para cada item. O que terminou fica em "${MARCA.campos.arquivo}".`}
      acao={
        <Button asChild>
          <Link to={MARCA.acaoPrincipal.caminho}>
            <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
            {MARCA.acaoPrincipal.rotulo}
          </Link>
        </Button>
      }
    >
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <DivisoriasDeFiltro<AbaDaLista>
            rotulo={`Mostrar ${MARCA.objeto.plural}`}
            className="min-w-0 flex-1 basis-full sm:basis-auto"
            valor={aba}
            onChange={setAba}
            opcoes={[
              { id: "ativos", rotulo: `Ativ${GEN.fim}s`, total: daAba(processos, "ativos").length },
              { id: "sem-data", rotulo: MARCA.campos.semData, total: daAba(processos, "sem-data").length },
              { id: "todos", rotulo: GEN.Todos, total: processos.length },
            ]}
          />
          <Link to="/arquivo" className="pb-2 text-sm font-semibold text-primary hover:underline dark:text-accent">
            Encerrad{GEN.fim}s ficam em {MARCA.campos.arquivo} ›
          </Link>
        </div>

        <div className="rounded-b-lg border border-t-0 border-border bg-[hsl(var(--mesa-papel2))] p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                aria-label={`Buscar ${MARCA.objeto.plural}`}
                placeholder={`Número ou ${MARCA.campos.objeto.toLowerCase()}…`}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="border-border bg-card pl-10 text-foreground text-ellipsis placeholder:text-muted-foreground"
              />
            </div>
            <Select value={ordem} onValueChange={(v) => setOrdem(v as Ordem)}>
              <SelectTrigger className="border-border bg-card text-foreground" aria-label="Ordenar por">
                <ArrowDownUp className="mr-2 h-4 w-4" aria-hidden="true" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proxima-abertura">{MARCA.campos.ordemPorData}</SelectItem>
                <SelectItem value="recentes">Mais recentes</SelectItem>
                <SelectItem value="maior-valor">{MARCA.campos.ordemPorValor}</SelectItem>
                <SelectItem value="numero">Número</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {visiveis.length} {MARCA.objeto.singular}(s) encontrad{GEN.fim}(s)
            </span>
            {filtrando && (
              <button type="button" onClick={() => setBusca("")} className="font-semibold text-primary hover:underline dark:text-accent">
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <MesaCarregando texto="Buscando as pastas…" />
      ) : isError ? (
        <MesaErroBusca titulo={`Não deu para buscar ${GEN.os} ${MARCA.objeto.plural}`} onTentarDeNovo={refetch} />
      ) : visiveis.length === 0 ? (
        (() => {
          const vazia = listaVazia({ filtrando, aba, totalGeral: processos.length });
          return (
            <div className="rounded-lg border border-dashed border-border bg-[hsl(var(--mesa-papel))] px-4 py-12 text-center">
              <p className="font-display text-2xl font-semibold">{vazia.titulo}</p>
              {vazia.texto && <p className="mt-1 text-muted-foreground">{vazia.texto}</p>}
            </div>
          );
        })()
      ) : (
        <ul className="gaveta">
          {visiveis.map((p, i) => (
            <li key={p.id}>
              <PastaNaGaveta
                processo={p}
                posicao={i}
                dados={[
                  { rotulo: MARCA.campos.valor, valor: formatBRL(p.estimated_value) },
                  { rotulo: MARCA.campos.responsavel, valor: p.responsible || "Sem dono" },
                  { rotulo: MARCA.campos.data, valor: dataDeAbertura(p.opening_date) },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </FolhaDaTela>
  );
};

export default Lista;
