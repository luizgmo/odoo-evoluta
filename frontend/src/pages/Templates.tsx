import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { MesaCarregando, MesaErroBusca } from "@/components/mesa/Mesa";
import { Button } from "@/components/ui/button";
import { useAvisoDeResultado } from "@/components/mesa/avisoDeResultado";
import { MARCA } from "@/config/marca";
import { consultarJob, gerarProjetoTemplate, listarTemplates, type JobStatus, type TemplateProjeto } from "@/services/api/templates";

interface JobView extends JobStatus {
  timedOut?: boolean;
}

type JobsPorTemplate = Record<number, JobView | undefined>;

const erroDa = (error: unknown, padrao: string) => error instanceof Error ? error.message : padrao;

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { avisar } = useAvisoDeResultado();
  const [templates, setTemplates] = useState<TemplateProjeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroBusca, setErroBusca] = useState(false);
  const [jobs, setJobs] = useState<JobsPorTemplate>({});
  const timers = useRef<Record<string, number>>({});

  const carregar = useCallback(() => {
    setLoading(true);
    setErroBusca(false);
    return listarTemplates().then((resposta) => setTemplates(resposta.records)).catch(() => setErroBusca(true)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => () => { Object.values(timers.current).forEach((timer) => window.clearTimeout(timer)); }, []);

  const limparTimer = (jobId: string) => {
    const timer = timers.current[jobId];
    if (timer) {
      window.clearTimeout(timer);
      delete timers.current[jobId];
    }
  };

  const polling = useCallback(async (templateId: number, jobId: string, iniciouEm: number) => {
    limparTimer(jobId);
    try {
      const resposta = await consultarJob(jobId);
      const job = resposta.job;
      setJobs((anteriores) => ({ ...anteriores, [templateId]: job }));
      if (job.state === "done") {
        if (job.project_id) {
          avisar({ texto: "Projeto gerado com as tasks do template." });
          navigate(`${MARCA.rotaDaLista}/${job.project_id}`);
        } else {
          setJobs((anteriores) => ({ ...anteriores, [templateId]: { ...job, state: "failed", error: "O job terminou sem informar o projeto criado." } }));
        }
        return;
      }
      if (job.state === "failed") return;
      if (Date.now() - iniciouEm >= 30000) {
        setJobs((anteriores) => ({ ...anteriores, [templateId]: { ...job, timedOut: true, error: "A geração ainda não terminou após 30 segundos. Você pode tentar novamente." } }));
        return;
      }
      timers.current[jobId] = window.setTimeout(() => { void polling(templateId, jobId, iniciouEm); }, 1000);
    } catch (error) {
      setJobs((anteriores) => ({ ...anteriores, [templateId]: { id: jobId, state: "failed", error: erroDa(error, "Não foi possível consultar o andamento da geração.") } }));
    }
  }, [avisar, navigate]);

  const gerar = async (template: TemplateProjeto) => {
    const atual = jobs[template.id];
    if (atual && (atual.state === "pending" || atual.state === "started") && !atual.timedOut) return;
    if (atual) limparTimer(atual.id);
    setJobs((anteriores) => ({ ...anteriores, [template.id]: { id: `template-${template.id}`, state: "pending" } }));
    try {
      const resposta = await gerarProjetoTemplate(template.id);
      const job = resposta.job;
      setJobs((anteriores) => ({ ...anteriores, [template.id]: job }));
      void polling(template.id, job.id, Date.now());
    } catch (error) {
      setJobs((anteriores) => ({ ...anteriores, [template.id]: { id: `template-${template.id}`, state: "failed", error: erroDa(error, "Não foi possível iniciar a geração do projeto.") } }));
    }
  };

  return (
    <FolhaDaTela trilha={[{ rotulo: "Templates" }]} titulo="Biblioteca de templates" subtitulo="Método pronto que vira projeto com um clique.">
      {loading ? <MesaCarregando texto="Buscando templates cadastrados…" /> : erroBusca ? <MesaErroBusca titulo="Não deu para buscar os templates" onTentarDeNovo={() => void carregar()} /> : templates.length === 0 ? (
        <div className="folha-simples border border-dashed border-border p-5"><p className="mesa-secao tinta-ocre">Nenhum template cadastrado</p><p className="mt-1 text-sm text-muted-foreground">Cadastre templates no Odoo para disponibilizá-los aqui.</p></div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Templates de projeto">
          {templates.map((template) => {
            const job = jobs[template.id];
            const ocupado = !!job && (job.state === "pending" || job.state === "started") && !job.timedOut;
            return <li key={template.id} className="folha-simples space-y-3 border border-border p-4 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="font-display text-2xl font-semibold">{template.name}</h2><span className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">{template.task_count} {template.task_count === 1 ? "task modelo" : "tasks modelo"}</span></div><p className="text-sm text-muted-foreground">{template.descricao || "Sem descrição cadastrada."}</p><Button type="button" onClick={() => void gerar(template)} disabled={ocupado}>{ocupado ? "Gerando projeto…" : job?.state === "done" ? "Projeto gerado" : job?.state === "failed" || job?.timedOut ? "Tentar novamente" : "Gerar projeto"}</Button>{ocupado && <p role="status" className="text-sm text-muted-foreground">A geração está em andamento. Esta tela consulta o Odoo a cada segundo por até 30 segundos.</p>}{job?.state === "failed" && <p role="alert" className="text-sm text-destructive">{job.error || "A geração falhou."}</p>}</li>;
          })}
        </ul>
      )}
    </FolhaDaTela>
  );
};

export default Templates;
