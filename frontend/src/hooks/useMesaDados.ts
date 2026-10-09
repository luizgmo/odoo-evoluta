/** Consultas reais da Mesa ao Odoo. O servidor é a fonte da verdade; não há fallback local. */
import { useCallback, useEffect, useState } from "react";
import type { Process } from "@/types/process";

import { apiGet } from "@/services/api/client";

interface ProjetoApi {
  id: number;
  active?: boolean;
  name: unknown;
  created_at?: string | false;
  updated_at?: string | false;
  total_tasks: number;
  orcamento?: number;
  date_deadline?: string | false;
  municipio: { id: number; name: string } | null;
  secretaria: { id: number; name: string } | null;
  departamento: { id: number; name: string } | null;
  responsavel: { id: number; name: string } | null;
  etapa: { id: number; name: string } | null;
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
  active?: boolean;
  name: unknown;
  created_at?: string | false;
  updated_at?: string | false;
  orcamento?: number;
  date_deadline?: string | false;
  municipio: { id: number; name: string } | null;
  secretaria: { id: number; name: string } | null;
  departamento: { id: number; name: string } | null;
  responsavel: { id: number; name: string } | null;
  etapa: { id: number; name: string } | null;
  stages: StageApi[];
  tasks: TaskApi[];
}

const texto = (v: unknown): string => (typeof v === "string" ? v : "");

const paraProcesso = (r: ProjetoApi): Process => ({
  id: r.id,
  code: `EVG-${String(r.id).padStart(5, "0")}`,
  description: "",
  object: texto(r.name),
  estimated_value: String(Number(r.orcamento ?? 0).toFixed(2)),
  responsible: r.responsavel?.name ?? "",
  status: r.total_tasks > 0 ? "EM_ANDAMENTO" : "ABERTO",
  projectInfo: {
    municipio: r.municipio,
    secretaria: r.secretaria,
    departamento: r.departamento,
    responsavel: r.responsavel,
    etapa: r.etapa,
    date_deadline: typeof r.date_deadline === "string" ? r.date_deadline : null,
  },
  author: "",
  company: null,
  created_at: typeof r.created_at === "string" ? r.created_at : "",
  updated_at: typeof r.updated_at === "string" ? r.updated_at : "",
  active: r.active !== false,
});

const paraProcessoDetalhe = (r: ProjetoDetalheApi): Process => {
  const todasFeitas = r.tasks.length > 0 && r.tasks.every((t) => {
    const st = r.stages.find((s) => s.id === t.stage_id);
    return st ? st.fold : false;
  });
  return {
    id: r.id,
    code: `EVG-${String(r.id).padStart(5, "0")}`,
    description: "",
      object: texto(r.name),
    estimated_value: String(Number(r.orcamento ?? 0).toFixed(2)),
    responsible: r.responsavel?.name ?? "",
    status: todasFeitas ? "CONCLUIDO" : r.tasks.length > 0 ? "EM_ANDAMENTO" : "ABERTO",
    projectInfo: {
      municipio: r.municipio,
      secretaria: r.secretaria,
      departamento: r.departamento,
      responsavel: r.responsavel,
      etapa: r.etapa,
      date_deadline: typeof r.date_deadline === "string" ? r.date_deadline : null,
    },
    author: "",
    company: null,
    created_at: typeof r.created_at === "string" ? r.created_at : "",
    updated_at: typeof r.updated_at === "string" ? r.updated_at : "",
    active: r.active !== false,
  };
};


export function useProcessosDaMesa(arquivados = false) {
  const [processos, setProcessos] = useState<Process[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<unknown>(null);
  const buscar = useCallback(() => {
    setCarregando(true);
    setErro(null);
    apiGet<{ records: ProjetoApi[] }>(`/api/projetos${arquivados ? "?arquivados=1" : ""}`)
      .then((d) => setProcessos(d.records.map(paraProcesso)))
      .catch((e) => setErro(e))
      .finally(() => setCarregando(false));
  }, [arquivados]);
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
