// LEGADO — exemplo de referência do sistema de licitações de origem: não é peça pronta, depende dos dados dele; use só como modelo visual
/**
 * Ajuda (proposta 7: "Biblioteca · ajuda"): os caminhos do dia a dia,
 * o que cada tinta de carimbo quer dizer e os atalhos. Tudo descreve o que o
 * sistema faz hoje; o que depende da equipe está dito como tal.
 */
import React from "react";
import { Link } from "react-router-dom";
import { Trilha } from "@/components/mesa/Trilha";
import { Carimbo, type Tinta } from "@/components/mesa/Mesa";
import { ATALHOS } from "@/features/preferencias/preferencias";

interface Passo {
  texto: string;
  para?: string;
}

const CAMINHOS: { titulo: string; quando: string; passos: Passo[] }[] = [
  {
    titulo: "Responder no prazo",
    quando: "Chegou um pedido de esclarecimento ou impugnação.",
    passos: [
      {
        texto:
          "Em Prazos e agenda, veja o último dia para responder de cada processo.",
        para: "/agenda",
      },
      {
        texto:
          "Clique no artigo citado para abrir a lei ao lado, com a conta feita para o seu caso.",
      },
      {
        texto:
          "Abra o processo e, em Documentos, escreva a resposta ou peça à IA para redigir.",
      },
      {
        texto:
          "Confira, salve a versão e publique pelo caminho de sempre do órgão.",
      },
    ],
  },
  {
    titulo: "Começar uma contratação",
    quando: "Um setor pediu uma compra ou um serviço.",
    passos: [
      {
        texto:
          "Clique em Nova contratação e responda às três perguntas: o quê, quem pediu, para quando.",
        para: "/processes/new",
      },
      { texto: "Confira a ficha já preenchida e abra a pasta." },
      {
        texto:
          "Na linha do tempo, gere cada documento com a IA, etapa por etapa, respondendo ao que ela perguntar.",
      },
      {
        texto:
          "Revise cada documento pronto. A IA escreve; quem decide e assina é você.",
      },
    ],
  },
];

const TINTAS: { tinta: Tinta; carimbo: string; significa: string }[] = [
  {
    tinta: "azul",
    carimbo: "Registro",
    significa: "Algo aconteceu e ficou registrado: autuação, versão, dispensa de etapa.",
  },
  {
    tinta: "verde",
    carimbo: "Aprovado",
    significa: "Feito, aprovado ou concluído.",
  },
  {
    tinta: "carmim",
    carimbo: "Prazo legal",
    significa: "Prazo da lei ou urgência. Não deixe passar.",
  },
  {
    tinta: "ocre",
    carimbo: "Pendente",
    significa: "Aguardando alguém ou alguma coisa.",
  },
  {
    tinta: "violeta",
    carimbo: "IA",
    significa: "Veio da IA. Só vale depois que você confere.",
  },
];

const Help: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Trilha
        passos={[{ rotulo: "Mesa", para: "/dashboard" }, { rotulo: "Ajuda" }]}
      />
      <header>
        <h1 className="text-4xl font-semibold">Como fazer</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Os caminhos do dia a dia, o que cada cor de carimbo quer dizer e os
          atalhos de teclado.
        </p>
      </header>

      <section aria-labelledby="caminhos" className="space-y-4">
        <h2 id="caminhos" className="sr-only">
          Os caminhos do dia a dia
        </h2>
        <div
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {CAMINHOS.map((c) => (
            <article key={c.titulo} className="folha p-5">
              <h3 className="text-2xl font-semibold">{c.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.quando}</p>
              <ol className="mt-4 space-y-3">
                {c.passos.map((p, i) => (
                  <li key={p.texto} className="flex gap-3 text-sm">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs"
                    >
                      {i + 1}
                    </span>
                    <span>
                      {p.texto}
                      {p.para && (
                        <>
                          {" "}
                          <Link
                            to={p.para}
                            className="font-semibold text-primary hover:underline dark:text-accent"
                          >
                            Ir ›
                          </Link>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="tintas" className="folha p-5">
          <h2 id="tintas" className="text-2xl font-semibold">
            O que cada tinta quer dizer
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada cor de carimbo tem um significado só, em todas as telas.
          </p>
          <dl className="mt-4 space-y-3">
            {TINTAS.map((t) => (
              <div
                key={t.tinta}
                className="grid grid-cols-[8rem_1fr] items-center gap-3"
              >
                <dt>
                  <Carimbo tinta={t.tinta}>{t.carimbo}</Carimbo>
                </dt>
                <dd className="text-sm">{t.significa}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="atalhos" className="folha p-5">
          <h2 id="atalhos" className="text-2xl font-semibold">
            Atalhos de teclado
          </h2>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {ATALHOS.map((a) => (
              <React.Fragment key={a.tecla}>
                <dt>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {a.tecla}
                  </kbd>
                </dt>
                <dd>{a.rotulo}</dd>
              </React.Fragment>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            Texto maior, mais contraste e menos movimento ficam em{" "}
            <Link
              to="/acessibilidade"
              className="font-semibold text-primary hover:underline dark:text-accent"
            >
              Acessibilidade
            </Link>
            .
          </p>
        </section>
      </div>

      <section
        aria-labelledby="duvida"
        className="rounded-xl border border-border bg-card p-5"
      >
        <h2 id="duvida" className="text-xl font-semibold">
          Ficou alguma dúvida?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sobre a lei, consulte a{" "}
          <Link
            to="/library#lei"
            className="font-semibold text-primary hover:underline dark:text-accent"
          >
            Biblioteca
          </Link>
          . Sobre o sistema, fale com a equipe do LicitarsAI pelo canal
          combinado com o seu órgão.
        </p>
      </section>
    </div>
  );
};

export default Help;
