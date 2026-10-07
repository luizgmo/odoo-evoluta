/**
 * SUBSTITUÍVEL: dados de demonstração para a busca rápida e a pasta do
 * processo. São INVENTADOS e ficam na memória, sem servidor. Em um sistema
 * real, troque o corpo destes dois hooks por consultas ao servidor (react-query,
 * SWR, fetch…), mantendo o que cada um devolve:
 *   useProcessosDaMesa() → { processos, data, isLoading, isError, refetch }
 *   useProcessoDaMesa(id) → { data, isLoading, error, refetch }
 * `adicionarProcesso` (só da demonstração) é o que o Formulario chama ao salvar; no sistema
 * real vira o POST ao servidor, seguido de invalidar a consulta da lista.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Process } from "@/types/process";
import { MARCA } from "@/config/marca";

// EXEMPLO DE DOMÍNIO — troque: agrupamentos inventados (hoje: modalidades de licitação).
const PREGAO = { id: 1, name: "Pregão Eletrônico", description: "" };
const DISPENSA = { id: 2, name: "Dispensa de Licitação", description: "" };

/** Data ISO (AAAA-MM-DD) daqui a n dias: a demonstração sempre tem prazos no mês corrente. */
const emDias = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const base = (n: number, o: Partial<Process>): Process => ({
  id: n,
  code: `${MARCA.campos.prefixoDoCodigo}${String(n).padStart(5, "0")}`,
  description: "",
  modality: PREGAO,
  object: "",
  estimated_value: "0.00",
  publication_date: emDias(-10),
  responsible: MARCA.campos.responsavelPadrao,
  opening_date: null,
  opening_time: null,
  status: "EM_ANDAMENTO",
  author: 1,
  company: null,
  created_at: "2026-08-01T10:00:00Z",
  updated_at: "2026-08-20T10:00:00Z",
  ...o,
});

export const PROCESSOS_DE_EXEMPLO: Process[] = [
  base(1, {
    object: "Aquisição de material de escritório",
    estimated_value: "48500.00",
    opening_date: emDias(12),
    opening_time: "10:00:00",
  }),
  base(2, {
    object: "Contratação de serviço de limpeza predial",
    estimated_value: "312000.00",
    opening_date: emDias(20),
    opening_time: "14:00:00",
  }),
  base(3, { object: "Compra de equipamentos de informática", estimated_value: "129900.00", status: "ABERTO", opening_date: emDias(7), opening_time: "09:30:00" }),
  base(4, { object: "Manutenção de veículos da frota", modality: DISPENSA, estimated_value: "17800.00", status: "CONCLUIDO" }),
  base(5, { object: "Registro de preços de material de limpeza", estimated_value: "86400.00", status: "ABERTO" }),
];

/**
 * Armazém em memória da demonstração (useSyncExternalStore): o que o Formulario cria aparece na
 * Lista, na busca e na agenda, e abre no Item — até recarregar a página, quando volta ao exemplo.
 * Em um sistema real isto some: o servidor é a fonte e o cache da consulta faz este papel.
 */
let armazem: Process[] = [...PROCESSOS_DE_EXEMPLO];
const ouvintes = new Set<() => void>();
const assinar = (avisar: () => void) => {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
};
const lerArmazem = () => armazem;

/**
 * Acrescenta um item ao armazém da demonstração e devolve o criado (com id e código novos).
 * O item novo nasce sem agrupamento e sem datas (o formulário só pede o essencial): cai na
 * primeira fase e na aba "sem data", em vez de herdar o agrupamento e as datas do exemplo.
 */
export function adicionarProcesso(dados: Partial<Process>): Process {
  const n = armazem.reduce((maior, p) => Math.max(maior, Number(p.id) || 0), 0) + 1;
  const agora = new Date().toISOString(); // o carimbo "criado em" da capa mostra a data de hoje, não a do exemplo
  const novo = base(n, { status: "ABERTO", modality: { id: 0, name: "", description: "" }, publication_date: "", created_at: agora, updated_at: agora, ...dados });
  armazem = [...armazem, novo];
  ouvintes.forEach((avisar) => avisar());
  return novo;
}

export function useProcessosDaMesa() {
  const processos = useSyncExternalStore(assinar, lerArmazem);
  return { processos, data: processos, isLoading: false, isError: false, refetch: () => {} };
}

export function useProcessoDaMesa(id: string | undefined) {
  const processos = useSyncExternalStore(assinar, lerArmazem);
  const [carregando, setCarregando] = useState(true);
  const buscar = useCallback(() => setCarregando(false), []);
  useEffect(() => {
    setCarregando(true);
    const t = setTimeout(buscar, 200);
    return () => clearTimeout(t);
  }, [id, buscar]);
  const data = carregando ? undefined : processos.find((p) => String(p.id) === String(id));
  const error = !carregando && !data ? { status: 404 } : null;
  return { data, isLoading: carregando, error, refetch: buscar };
}
