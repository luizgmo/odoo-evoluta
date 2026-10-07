// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Prazos e agenda — o que vence e quando, em todos os processos (proposta 7,
 * tela 17). Prazos legais contados em dias úteis pelo calendário de feriados
 * do sistema. À esquerda, o calendário de mesa; à direita, o bloco de notas
 * com o que vem pela frente, por semana; cada linha leva ao processo.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProcessosDaMesa } from "@/hooks/useMesaDados";
import {
  Carimbo,
  Folhinha,
  MesaCarregando,
  AvisoAtualizacaoFalhou,
  MesaErroBusca,
  type Tinta,
} from "@/components/mesa/Mesa";
import { FolhaDaTela } from "@/components/mesa/FolhaDaTela";
import { BlocoEspiral } from "@/components/mesa/BlocoEspiral";
import { CalendarioDeMesa } from "@/components/mesa/CalendarioDeMesa";
import { DivisoriasDeFiltro } from "@/components/mesa/DivisoriasDeFiltro";
import { CitacaoDaLei } from "@/features/lei/CitacaoDaLei";
import { agruparPorSemana } from "@/features/agenda/calendarioDoMes";
import {
  diasAte,
  montarAgenda,
  naJanela,
  paraIcs,
  type Compromisso,
  type Janela,
} from "@/features/agenda/montarAgenda";

const JANELAS: { id: Janela; rotulo: string }[] = [
  { id: "semana", rotulo: "Próximos 7 dias" },
  { id: "trinta", rotulo: "Próximos 30 dias" },
  { id: "tudo", rotulo: "Tudo à frente" },
];

/** O carimbo diz que tipo de compromisso é, e quanto falta quando é prazo legal. */
const carimboDo = (
  c: Compromisso,
  hoje: Date,
): { texto: string; tinta: Tinta } => {
  if (c.tipo === "sessao") return { texto: "Sessão pública", tinta: "azul" };
  if (c.tipo === "publicacao") return { texto: "Publicação", tinta: "verde" };
  const dias = diasAte(c.data, hoje);
  const quando =
    dias === 0 ? "vence hoje" : dias === 1 ? "vence amanhã" : `em ${dias} dias`;
  return {
    texto: `Prazo legal · ${quando}`,
    tinta: dias <= 3 ? "carmim" : "ocre",
  };
};

const baixarIcs = (compromissos: Compromisso[]) => {
  const blob = new Blob([paraIcs(compromissos)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prazos-licitars.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const SeparadorDeSemana: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="linha-de-caderno pb-1.5 pt-4 font-ui text-sm font-semibold text-muted-foreground">{children}</h3>
);

const PrazosEAgenda: React.FC = () => {
  const {
    processos,
    isLoading,
    isError,
    refetch,
    data: jaCarregado,
  } = useProcessosDaMesa();
  const [janela, setJanela] = useState<Janela>("semana");
  const hoje = useMemo(() => new Date(), []);
  const { compromissos, semData } = useMemo(
    () => montarAgenda(processos),
    [processos],
  );
  const visiveis = naJanela(compromissos, janela, hoje);
  // O calendário leva só o que ainda vai acontecer; sem nada à frente, não há o que exportar
  const aFrente = naJanela(compromissos, "tudo", hoje);
  const semanas = agruparPorSemana(visiveis, hoje);

  return (
    <FolhaDaTela
      trilha={[
        { rotulo: "Mesa", para: "/dashboard" },
        { rotulo: "Prazos e agenda" },
      ]}
      titulo="O que vence e quando"
      subtitulo="Prazos legais contados em dias úteis, com os feriados, a partir das datas gravadas em cada processo. Cada linha leva ao processo."
      acao={
        <Button
          variant="outline"
          onClick={() => baixarIcs(aFrente)}
          disabled={aFrente.length === 0}
          // Com o texto aumentado, o rótulo quebra em vez de passar da largura do celular
          className="h-auto min-h-10 whitespace-normal text-left"
        >
          <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          Exportar para o calendário do e-mail
        </Button>
      }
    >
      <DivisoriasDeFiltro<Janela>
        rotulo="Período"
        opcoes={JANELAS.map((j) => ({
          ...j,
          total: naJanela(compromissos, j.id, hoje).length,
        }))}
        valor={janela}
        onChange={setJanela}
      />

      {isLoading ? (
        <MesaCarregando texto="Contando os prazos…" />
      ) : isError && !jaCarregado ? (
        <MesaErroBusca
          titulo="Não deu para buscar os processos"
          texto="A conexão ou o servidor falhou. Nada foi perdido; tente de novo em instantes."
          onTentarDeNovo={() => refetch()}
        />
      ) : (
        <>
          {/* Com a lista de antes: ela fica, com aviso de que não atualizou */}
          {isError && (
            <AvisoAtualizacaoFalhou onTentarDeNovo={() => refetch()} />
          )}
          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
            <CalendarioDeMesa compromissos={compromissos} hoje={hoje} />

            <BlocoEspiral argolas={7} className="bloco-notas">
              <h2 className="bloco-notas-titulo font-display text-2xl font-medium sm:text-3xl text-foreground">
                O que vem pela frente
              </h2>
              {semanas.length === 0 ? (
                <p className="py-4 text-muted-foreground">
                  {janela === "semana"
                    ? "Nenhum prazo nos próximos 7 dias."
                    : "Nenhum prazo neste período."}{" "}
                  {janela !== "tudo" && (
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline dark:text-accent"
                      onClick={() => setJanela("tudo")}
                    >
                      Ver tudo à frente
                    </button>
                  )}
                </p>
              ) : (
                <ol>
                  {semanas.map(({ chave, rotulo, itens }) => (
                    <li key={chave}>
                      <SeparadorDeSemana>{rotulo}</SeparadorDeSemana>
                      <ol>
                        {itens.map((c) => {
                          const carimbo = carimboDo(c, hoje);
                          return (
                            <li
                              key={c.id}
                              className="linha-de-caderno grid items-center gap-x-3.5 gap-y-2 py-3 grid-cols-[3.25rem_minmax(0,1fr)]"
                            >
                              <Folhinha data={c.data} />
                              <span className="min-w-0">
                                <span className="block font-semibold">
                                  <span className="sr-only">
                                    {c.data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}:{" "}
                                  </span>
                                  {c.titulo}
                                  {c.hora && (
                                    <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
                                      {c.hora}
                                    </span>
                                  )}
                                </span>
                                <span className="block break-words text-sm text-muted-foreground">
                                  <span className="font-mono">
                                    {c.processo.code}
                                  </span>{" "}
                                  · {c.processo.objeto} ·{" "}
                                  <CitacaoDaLei
                                    noSeuCaso={`${c.titulo} do ${c.processo.code}: ${c.data.toLocaleDateString("pt-BR")}.`}
                                  >
                                    {c.fundamento}
                                  </CitacaoDaLei>
                                </span>
                              </span>
                              <span className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <Carimbo tinta={carimbo.tinta}>
                                  {carimbo.texto}
                                </Carimbo>
                                <Link
                                  to={`/processes/${c.processo.id}`}
                                  className="whitespace-nowrap text-sm font-semibold text-primary hover:underline dark:text-accent"
                                >
                                  Abrir o processo ›
                                </Link>
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </li>
                  ))}
                </ol>
              )}

              {semData.length > 0 && (
                <section aria-labelledby="sem-data">
                  <SeparadorDeSemana>
                    <span id="sem-data">
                      {semData.length === 1
                        ? "1 processo sem data de abertura"
                        : `${semData.length} processos sem data de abertura`}
                    </span>
                  </SeparadorDeSemana>
                  <p className="linha-de-caderno py-2 text-sm text-muted-foreground">
                    Sem a data da sessão, os prazos deles não podem ser contados.
                  </p>
                  <ul>
                    {semData.map(({ processo }) => (
                      <li key={processo.id} className="linha-de-caderno flex flex-wrap items-center justify-between gap-2 py-3">
                        <span className="min-w-0 text-sm">
                          <span className="font-mono">{processo.code}</span>
                          <span className="text-muted-foreground"> · {processo.objeto}</span>
                        </span>
                        <Link
                          to={`/processes/${processo.id}/edit`}
                          className="whitespace-nowrap text-sm font-semibold text-primary hover:underline dark:text-accent"
                        >
                          Preencher a data ›
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </BlocoEspiral>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Leitura conservadora da Lei 14.133/2021: confirme com a assessoria
        jurídica antes de publicar. O fim do prazo de propostas depende da
        hipótese do art. 55 e fica no simulador de prazos de cada processo.
      </p>
    </FolhaDaTela>
  );
};

export default PrazosEAgenda;
