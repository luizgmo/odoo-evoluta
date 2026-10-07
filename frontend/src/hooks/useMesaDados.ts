/** Consultas reais da Mesa ao Odoo. O servidor é a fonte da verdade; não há fallback local. */
import { useCallback, useEffect, useState } from "react";
import type { Process } from "@/types/process";

import { apiGet } from "@/services/api/client";

interface ProjetoApi {
  id: number;
  name: unknown;
  total_tasks: number;
  orcamento?: number;
}

interface TaskApi {
  id: number;
  name: unknown;
  stage_id: number | false;
  date_deadline?: string | false;
}

interface StageApi {
  id: number;
  name: unknown;
  fold: boolean;
}

interface ProjetoDetalheApi {
  id: number;
  name: unknown;
  orcamento?: number;
  stages: StageApi[];
  tasks: TaskApi[];
}

const texto = (v: unknown): string => (typeof v === "string" ? v : "");

const paraProcesso = (r: ProjetoApi): Process => ({
  id: r.id,
  code: `EVG-${String(r.id).padStart(5, "0")}`,
  description: "",
  modality: { id: 0, name: "", description: "" },
  object: texto(r.name),
  estimated_value: String(Number(r.orcamento ?? 0).toFixed(2)),
  publication_date: "",
  responsible: "",
  opening_date: null,
  opening_time: null,
  status: r.total_tasks > 0 ? "EM_ANDAMENTO" : "ABERTO",
  author: 1,
  company: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const paraProcessoDetalhe = (r: ProjetoDetalheApi): Process => {
  const porEtapa = new Map<number, number>();
  for (const t of r.tasks) {
    if (typeof t.stage_id === "number") porEtapa.set(t.stage_id, (porEtapa.get(t.stage_id) ?? 0) + 1);
  }
  const prazos = r.tasks
    .map((t) => (typeof t.date_deadline === "string" ? t.date_deadline.slice(0, 10) : ""))
    .filter(Boolean)
    .sort();
  const todasFeitas = r.tasks.length > 0 && r.tasks.every((t) => {
    const st = r.stages.find((s) => s.id === t.stage_id);
    return st ? st.fold : false;
  });
  return {
    id: r.id,
    code: `EVG-${String(r.id).padStart(5, "0")}`,
    description: "",
    modality: { id: 0, name: "", description: "" },
    object: texto(r.name),
    estimated_value: String(Number(r.orcamento ?? 0).toFixed(2)),
    publication_date: "",
    responsible: "",
    opening_date: prazos.length > 0 ? prazos[0] : null,
    opening_time: null,
    status: todasFeitas ? "CONCLUIDO" : r.tasks.length > 0 ? "EM_ANDAMENTO" : "ABERTO",
    author: 1,
    company: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};


export function useProcessosDaMesa() {
  const [processos, setProcessos] = useState<Process[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const buscar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    apiGet<{ records: ProjetoApi[] }>("/api/projetos")
      .then((d) => setProcessos(d.records.map(paraProcesso)))
      .catch((e) => setErro(e))
      .finally(() => setCarregando(false));
  }, []);
  useEffect(() => {
    buscar();
  }, [buscar]);
  return { processos, data: processos, isLoading: carregando, isError: !!erro, refetch: buscar };
}

export function useProcessoDaMesa(id: string | undefined) {
  const [carregando, setCarregando] = useState(true);
  const [data, setData] = useState<Process | undefined>(undefined);
  const [error, setError] = useState<{ status: number } | null>(null);
  const buscar = useCallback(() => {
    if (!id) {
      setData(undefined);
      setError({ status: 404 });
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setError(null);
    apiGet<{ record?: ProjetoDetalheApi; error?: string }>(`/api/projetos/${id}`)
      .then((d) => {
        if (d.record) setData(paraProcessoDetalhe(d.record));
        else setError({ status: 404 });
      })
      .catch(() => setError({ status: 500 }))
      .finally(() => setCarregando(false));
  }, [id]);
  useEffect(() => {
    buscar();
  }, [buscar]);
  return { data, isLoading: carregando, error, refetch: buscar };
}
