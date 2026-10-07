// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * LICITARS 3.0 - Process List V3
 * Os processos como pastas numa gaveta de arquivo, sobre a folha da tela.
 */

import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, FileText, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvisoAtualizacaoFalhou, MesaErroBusca } from "@/components/mesa/Mesa";
import { DivisoriasDeFiltro } from "@/components/mesa/DivisoriasDeFiltro";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { PastaNaGaveta } from "@/components/mesa/PastaNaGaveta";
import { combinarAbaESituacao, daAba, daSituacao, listaVazia, ordenar, type AbaDaLista, type Ordem } from "@/features/processos/listaDeProcessos";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { dataDeAbertura } from "@/features/dashboard/formatos";
import { processApi } from "@/services/api";
import { Process } from "@/types/process";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProcessListV3() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  // A divisória vive no endereço (?aba=sem-data): os links da Minha Mesa e dos Painéis
  // abrem direto nela, o menu "Processos" (sem ?aba) volta a Ativos e o Voltar a mantém
  const [parametros, setParametros] = useSearchParams();
  const pedida = parametros.get("aba");
  const aba: AbaDaLista = pedida === "sem-data" || pedida === "todos" ? pedida : "ativos";
  const setAba = (nova: AbaDaLista) => setParametros(nova === "ativos" ? {} : { aba: nova }, { replace: true });
  const [ordem, setOrdem] = useState<Ordem>("proxima-abertura");
  const [modalityFilter, setModalityFilter] = useState("all");
  // Situação (aberto, em andamento…): o filtro que a lista da base tinha
  const [situacaoEscolhida, setSituacao] = useState("all");
  // A divisória também muda pelo endereço (menu, trilha): a regra vale a cada desenho,
  // não só no clique — Ativos + Concluído voltaria a dar lista vazia sem motivo
  const situacao = combinarAbaESituacao(aba, situacaoEscolhida, "aba").situacao;
  // F-17 — estado do dialog de soft-delete
  const [deleteTarget, setDeleteTarget] = useState<Process | null>(null);

  const handleConfirmDelete = async (reason: string) => {
    if (!deleteTarget) return;
    await processApi.delete(String(deleteTarget.id), reason);
    queryClient.invalidateQueries({ queryKey: ["processes"] });
    toast({ title: "Processo excluído", description: deleteTarget.code || "" });
  };

  // Todas as páginas: a lista, as divisórias e as contagens valem para o órgão inteiro
  const { processos: allProcesses, isLoading, isError, refetch, data: jaCarregado } = useProcessosDaMesa();

  // Divisória escolhida, busca e modalidade; depois a ordem
  const filteredProcesses = ordenar(daSituacao(daAba(allProcesses, aba), situacao), ordem).filter((process) => {
    const matchesSearch =
      !searchTerm ||
      process.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.object?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModality =
      modalityFilter === "all" ||
      process.modality?.name?.toLowerCase() === modalityFilter.toLowerCase();

    return matchesSearch && matchesModality;
  });

  // Get unique modalities for filter
  const modalities = Array.from(
    new Set(allProcesses.map((p) => p.modality?.name).filter(Boolean))
  );

  const formatCurrency = (value: string | number) => {
    if (!value) return "R$ 0,00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  // dataDeAbertura monta "AAAA-MM-DD" à mão: new Date() lia meia-noite UTC e,
  // em Brasília, a lista mostrava o dia anterior
  const formatDate = (dateString: string) => (dateString ? dataDeAbertura(dateString) : "-");

  if (!user) {
    return (
      <div className="min-h-screen bg-navy-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const filtrando = !!searchTerm || modalityFilter !== "all" || situacao !== "all";

  return (
    <div>
      <FolhaDaTela
        trilha={[{ rotulo: "Mesa", para: "/dashboard" }, { rotulo: "Processos" }]}
        titulo="Processos"
        subtitulo="Tudo o que está em andamento, com a fase de cada pasta. O que terminou fica no Arquivo."
        acao={
          <Button onClick={() => navigate("/processes/new")}>
            <Plus className="w-5 h-5 mr-2" />
            Nova contratação
          </Button>
        }
      >
        {/* Divisórias: o que está em andamento; o que terminou fica no Arquivo */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <DivisoriasDeFiltro<AbaDaLista>
              rotulo="Mostrar processos"
              className="min-w-0 flex-1 basis-full sm:basis-auto"
              opcoes={[
                { id: "ativos", rotulo: "Ativos", total: daAba(allProcesses, "ativos").length },
                { id: "sem-data", rotulo: "Sem data de abertura", total: daAba(allProcesses, "sem-data").length },
                { id: "todos", rotulo: "Todos", total: allProcesses.length },
              ]}
              valor={aba}
              onChange={(nova) => {
                const par = combinarAbaESituacao(nova, situacao, "aba");
                setSituacao(par.situacao);
                setAba(par.aba);
              }}
            />
            <Link to="/arquivo" className="pb-2 text-sm font-semibold text-primary hover:underline dark:text-accent">
              Encerrados ficam no Arquivo ›
            </Link>
          </div>

          {/* Régua de busca */}
          <div className="rounded-b-lg border border-t-0 border-border bg-[hsl(var(--mesa-papel2))] p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="process-search"
                  name="search"
                  type="search"
                  aria-label="Buscar processos"
                  placeholder="Buscar por número, objeto ou descrição…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Ordem */}
              <Select value={ordem} onValueChange={(v) => setOrdem(v as Ordem)}>
                <SelectTrigger className="bg-card border-border text-foreground" aria-label="Ordenar por">
                  <ArrowDownUp className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proxima-abertura">Próxima abertura</SelectItem>
                  <SelectItem value="recentes">Mais recentes</SelectItem>
                  <SelectItem value="maior-valor">Maior valor</SelectItem>
                  <SelectItem value="numero">Número</SelectItem>
                </SelectContent>
              </Select>

              {/* Situação */}
              <Select
                value={situacao}
                onValueChange={(nova) => {
                  const par = combinarAbaESituacao(aba, nova, "situacao");
                  setSituacao(par.situacao);
                  if (par.aba !== aba) setAba(par.aba);
                }}
              >
                <SelectTrigger className="bg-card border-border text-foreground" aria-label="Situação">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as situações</SelectItem>
                  <SelectItem value="ABERTO">Aberto</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  <SelectItem value="ARQUIVADO">Arquivado</SelectItem>
                </SelectContent>
              </Select>

              {/* Modality Filter */}
              <Select value={modalityFilter} onValueChange={setModalityFilter}>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Modalidades</SelectItem>
                  {modalities.map((modality) => (
                    <SelectItem key={modality} value={modality.toLowerCase()}>
                      {modality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProcesses.length} {filteredProcesses.length === 1 ? "processo encontrado" : "processos encontrados"}
              </p>
              {filtrando && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setModalityFilter("all");
                    setSituacao("all");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        )}

        {/* Sem nada carregado: erro. Com a lista de antes: ela fica, com aviso de que não atualizou */}
        {!isLoading && isError && !jaCarregado && (
          <MesaErroBusca titulo="Não deu para buscar os processos" onTentarDeNovo={() => refetch()} />
        )}
        {!isLoading && isError && jaCarregado && <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />}

        {!isLoading && !(isError && !jaCarregado) && filteredProcesses.length === 0 && (() => {
          const vazia = listaVazia({ filtrando, aba, totalGeral: allProcesses.length });
          return (
            <div className="rounded-lg border border-dashed border-border bg-[hsl(var(--mesa-papel))] py-12 px-4 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{vazia.titulo}</h3>
              {vazia.texto && <p className="text-muted-foreground mb-4">{vazia.texto}</p>}
              {vazia.oferecerCriar && (
                <Button onClick={() => navigate("/processes/new")}>
                  <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                  Nova contratação
                </Button>
              )}
            </div>
          );
        })()}

        {/* Cada processo é uma pasta na gaveta: orelha com o número, carimbo da situação e os dados */}
        {!isLoading && filteredProcesses.length > 0 && (
          <ul className="gaveta">
            {filteredProcesses.map((process, i) => {
              const dados = [
                { rotulo: "Valor estimado", valor: process.estimated_value ? formatCurrency(process.estimated_value) : null },
                { rotulo: "Responsável", valor: process.responsible || null },
                { rotulo: "Publicação", valor: process.publication_date ? formatDate(process.publication_date) : null },
                {
                  rotulo: "Abertura",
                  valor: process.opening_date
                    ? `${formatDate(process.opening_date)}${process.opening_time ? ` às ${process.opening_time.slice(0, 5)}` : ""}`
                    : null,
                },
              ].filter((d): d is { rotulo: string; valor: string } => !!d.valor);
              return (
                <li key={process.id}>
                  <PastaNaGaveta processo={process} posicao={i} dados={dados} onExcluir={() => setDeleteTarget(process)} />
                </li>
              );
            })}
          </ul>
        )}
      </FolhaDaTela>
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir processo?"
        description={
          deleteTarget
            ? `O processo "${deleteTarget.code ?? deleteTarget.id}" será marcado como excluído. Você pode restaurá-lo pelo painel administrativo.`
            : ""
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
