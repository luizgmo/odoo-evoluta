// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Nova contratação em três perguntas (proposta 7, tela 16). As respostas
 * montam a capa em preparo; "Continuar para a ficha" abre a ficha completa já
 * preenchida (número e valor se confirmam lá). Vindo de "Repetir contratação"
 * ou das três perguntas, a mesma rota mostra direto a ficha.
 */
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/api";
import type { Modality } from "@/types/process";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import { Trilha } from "@/components/mesa/Trilha";
import { formatarData } from "@/utils/prazosLicitacao";
import { descricaoDaFicha, naoDaTempo, processosParecidos, publicarAte } from "@/features/processos/novaContratacao";
import { ehAtivo } from "@/features/processos/listaDeProcessos";
import { CitacaoDaLei } from "@/features/lei/CitacaoDaLei";
import NewProcessV3 from "./NewProcessV3";
import { ehContratacaoDireta } from "@/components/mesa/fasesDaLicitacao";

const useModalidades = () =>
  useQuery<Modality[]>({
    queryKey: ["modalities"],
    queryFn: async () => {
      const r = await apiClient.get("/modalities/");
      return Array.isArray(r.data) ? r.data : r.data.results || [];
    },
  });

const Esfera: React.FC<{ feita: boolean; atual: boolean; rotulo: string }> = ({ feita, atual, rotulo }) => (
  <li className="flex items-center gap-2 text-sm">
    <span
      aria-hidden="true"
      className={cn(
        "inline-block rounded-full",
        feita ? "h-2.5 w-2.5 bg-muted-foreground/50" : atual ? "h-3 w-3 bg-foreground ring-2 ring-muted-foreground/40" : "h-2.5 w-2.5 border border-muted-foreground/60",
      )}
    />
    <span className={cn(atual && "font-semibold")}>
      {rotulo}
      <span className="sr-only">{feita ? ", respondida" : ", por responder"}</span>
    </span>
  </li>
);

interface Rascunho {
  objeto: string;
  setor: string;
  prazo: string;
  modalidadeId: string;
}

const TresPerguntas: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Voltando da ficha (botão Voltar do navegador), as respostas voltam com a pessoa
  const rascunho = (location.state as { rascunho?: Rascunho } | null)?.rascunho;
  const { data: modalidades = [] } = useModalidades();
  const { processos } = useProcessosDaMesa();
  const [objeto, setObjeto] = useState(rascunho?.objeto ?? "");
  const [setor, setSetor] = useState(rascunho?.setor ?? "");
  const [prazo, setPrazo] = useState(rascunho?.prazo ?? "");
  const [modalidadeId, setModalidadeId] = useState<string>(rascunho?.modalidadeId ?? "");

  const selecionaveis = modalidades.filter((m) => m.is_selectable !== false);
  const modalidade = selecionaveis.find((m) => String(m.id) === modalidadeId);
  const parecidos = useMemo(() => processosParecidos(objeto, processos.filter(ehAtivo)), [objeto, processos]);
  // Dispensa e inexigibilidade não têm edital: sem prazo mínimo de publicação
  const direta = ehContratacaoDireta(modalidade?.name);
  const limite = direta ? null : publicarAte(prazo);
  const respondidas = [objeto.trim().length > 0, setor.trim().length > 0, prazo.length > 0];
  const atual = respondidas.findIndex((r) => !r);

  const continuar = () => {
    // Guarda as respostas nesta entrada do histórico antes de seguir para a ficha
    navigate(location.pathname, { replace: true, state: { rascunho: { objeto, setor, prazo, modalidadeId } } });
    navigate("/processes/new", {
      state: {
        preenchido: {
          object: objeto.trim(),
          description: descricaoDaFicha(setor, prazo),
          modality_id: modalidade ? modalidade.id : undefined,
        },
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Trilha passos={[{ rotulo: "Mesa", para: "/dashboard" }, { rotulo: "Nova contratação" }]} />
      <header>
        <h1 className="text-4xl font-semibold">Três perguntas, e a pasta está pronta para abrir</h1>
        <ol className="mt-3 flex flex-wrap gap-5" aria-label="Andamento das perguntas">
          {["O quê", "Quem pediu", "Para quando"].map((r, i) => (
            <Esfera key={r} rotulo={r} feita={respondidas[i]} atual={i === atual} />
          ))}
        </ol>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          className="folha space-y-6 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (objeto.trim()) continuar();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="nova-objeto" className="text-base font-semibold">
              1. O que você precisa contratar?
            </Label>
            <Textarea
              id="nova-objeto"
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              rows={3}
              placeholder="Ex.: conjuntos de mesa e cadeira para as salas de aula do ensino fundamental"
            />
            <p className="text-xs text-muted-foreground">Quanto mais detalhado, melhores os documentos que a IA escreve.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova-setor" className="text-base font-semibold">
              2. Qual setor pediu?
            </Label>
            <Input id="nova-setor" value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Ex.: Secretaria de Educação" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova-prazo" className="text-base font-semibold">
              3. Para quando precisa estar disponível?
            </Label>
            <Input id="nova-prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className="w-56" />
            {direta && prazo ? (
              <p className="text-sm text-muted-foreground">
                Contratação direta: não há edital nem prazo mínimo de publicação.
              </p>
            ) : limite && naoDaTempo(prazo) ? (
              <p role="alert" className="text-sm font-semibold text-destructive">
                Não dá tempo: para a sessão acontecer até {formatarData(new Date(`${prazo}T12:00:00`))}, o edital já deveria ter
                saído em {formatarData(limite)} — o mínimo de 8 dias úteis para compra comum pelo menor preço (
                <CitacaoDaLei>art. 55, I, a</CitacaoDaLei>). Escolha uma data mais adiante.
              </p>
            ) : limite && (
              <p className="text-sm text-muted-foreground">
                Para a sessão acontecer até {formatarData(new Date(`${prazo}T12:00:00`))}, o edital precisa sair até{" "}
                <b className="text-foreground">{formatarData(limite)}</b> — o mínimo de 8 dias úteis para compra comum pelo menor
                preço (<CitacaoDaLei>art. 55, I, a</CitacaoDaLei>). Some o tempo de julgamento, recursos e entrega.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
            <Button type="submit" disabled={!objeto.trim()}>
              Continuar para a ficha ›
            </Button>
            <Link to="/dashboard" className="text-sm font-semibold text-primary hover:underline dark:text-accent">
              Voltar à mesa
            </Link>
          </div>
        </form>

        <aside aria-labelledby="capa-em-preparo" className="space-y-4">
          <div className="rounded-xl border border-dashed border-border bg-card/70 p-4">
            <p id="capa-em-preparo" className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Capa em preparo · pasta nova, ainda sem número
            </p>
            <p className="mt-2 font-display text-xl leading-snug">{objeto.trim() || "O objeto aparece aqui"}</p>
            {setor.trim() && <p className="mt-1 text-sm text-muted-foreground">Pedido por {setor.trim()}</p>}
          </div>

          {parecidos.length > 0 && (
            <div role="status" className="rounded-xl border border-[color:var(--color-status-warning)] bg-gold/10 p-4 text-sm">
              <p className="font-semibold">Já existe um processo parecido</p>
              <ul className="mt-1 space-y-1">
                {parecidos.map((p) => (
                  <li key={p.id}>
                    <Link to={`/processes/${p.id}`} className="font-semibold text-primary hover:underline dark:text-accent">
                      <span className="font-mono">{p.code}</span> · {p.object}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-muted-foreground">Se for a mesma compra, abra a pasta existente; se for outra, siga.</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <Label htmlFor="nova-modalidade" className="font-semibold">
              Modalidade
            </Label>
            <select
              id="nova-modalidade"
              value={modalidadeId}
              onChange={(e) => setModalidadeId(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Escolha a modalidade…</option>
              {selecionaveis.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.name}
                </option>
              ))}
            </select>
            {modalidade?.stages && modalidade.stages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold">Documentos que vão para a pasta</p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-muted-foreground">
                  {[...modalidade.stages].sort((a, b) => a.order - b.order).map((s) => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const NovaContratacao: React.FC = () => {
  const estado = useLocation().state as { repetir?: unknown; preenchido?: unknown } | null;
  // Com dados (repetição ou as três perguntas), a ficha completa já preenchida
  if (estado?.repetir || estado?.preenchido) return <NewProcessV3 />;
  return <TresPerguntas />;
};

export default NovaContratacao;
