# 10 · Estados e microcopy (os textos exatos do LicitarsAI)

Toda tela tem quatro estados: **carregando, erro, vazio, resultado**. O texto de cada
um é parte do design: é curto, em português comum, diz **o que aconteceu e o que não
aconteceu** ("nada foi apagado") e nunca culpa a pessoa. Use as frases abaixo
literalmente em sistemas novos, trocando só o substantivo.

Voz geral: "você" implícito; verbos no infinitivo nos botões ("Tentar de novo"),
passado nos avisos ("Ficha salva."); reticências `…` (um caractere) em estados de
espera; sem exclamação, exceto "Senha redefinida com sucesso!" (legado). Nunca
"Oops", "Algo deu errado", "Sucesso", "Operação concluída".

## 1. Carregando

Componente: `MesaCarregando` (`texto` opcional; padrão "Buscando as pastas…").
Frase = gerúndio + o objeto, com reticências:

| Tela | Texto |
|---|---|
| Lista de processos (padrão) | Buscando as pastas… |
| Documentos do processo | Buscando os documentos… |
| Prazos / Agenda | Contando os prazos… |
| Autos para imprimir | Separando as peças… |
| Ficha / Pasta | Buscando o processo… |
| Histórico | Abrindo o livro de registro… |
| Painéis | Montando os painéis… (`MARCA.campos.paineisMontando`) |
| Arquivo | Abrindo o arquivo… |
| Pasta (capa) | Abrindo a pasta… |
| Documento pronto | Abrindo o documento… |
| Contagens soltas | Contando… |

Botões em andamento (o botão fica desabilitado, com `Loader2` girando):
"Entrando…" · "Enviando…" · "Redefinindo…" · "Excluindo…" (sempre o caractere
único `…`, nunca três pontos). Nos botões de formulário o texto vem do chamador
(`Salvando…`, `Criando…` etc.: gerúndio + o objeto); a skill só fixa o padrão.

## 2. Erro de busca

Componente: `MesaErroBusca` (título + texto + botão **"Tentar de novo"**). O título
sempre começa com **"Não deu para …"**; o texto diz o que está a salvo.

| Tela | Título | Texto |
|---|---|---|
| Início ({MARCA.inicio}) | Não deu para carregar a tela inicial (sem artigo de `MARCA.inicio`: o nome da tela não tem gênero garantido) | Tente novamente em alguns instantes. Se continuar, avise {MARCA.equipeDeSuporte}. |
| Documentos | Não deu para buscar os documentos | A conexão ou o servidor falhou. Nada foi apagado; tente de novo em instantes. |
| Processos | Não deu para buscar {GEN.os} {MARCA.objeto.plural} (`Lista.tsx`) | (sem texto próprio: vale o padrão do `MesaErroBusca`, "Tente de novo em instantes. Se continuar, avise {MARCA.equipeDeSuporte}.") |
| Processo | Não deu para buscar {GEN.o} {MARCA.objeto.singular} (`ProcessoNaMesa.tsx`) | Não foi possível carregar agora. {GEN.O} {singular} não foi apagad{GEN.fim}; tente de novo em instantes. |
| Histórico | Não deu para abrir o histórico | (mesmo padrão: "Nada foi alterado…") |
| Documento | Não deu para abrir o documento | Pode ser a conexão, ou o documento não existe mais. Nada foi alterado. |
| Texto do documento | Não deu para buscar o texto do documento | A conexão ou o servidor falhou. O documento continua lá; nada foi alterado. |
| Painéis | Não deu para montar {MARCA.campos.paineisTrilha em minúsculas} (padrão: "Não deu para montar painéis"; o título sai do nome da tela, sem artigo) | Não foi possível carregar agora. Nada foi perdido; tente de novo em instantes. |
| Arquivo | Não deu para abrir o arquivo | |
| Biblioteca | Não deu para buscar os exemplares | |
| Modelos | Não deu para buscar os modelos | |

Texto padrão do `MesaErroBusca` quando você não passa um: **"Tente de novo em
instantes. Se continuar, avise {MARCA.equipeDeSuporte}."** (no LicitarsAI:
"a equipe do Licitars"; em sistema novo edite só `MARCA.equipeDeSuporte`).

Já havia dados e a atualização falhou → `AvisoAtualizacaoFalhou`: **"A última
atualização falhou; mostrando o que já tinha chegado."** (nunca apague a tela pronta).

Erro ao confirmar um ato (`ConfirmarAto`): **"Não deu certo, e nada foi alterado.
Confira a conexão e tente de novo."** (o diálogo continua aberto).

Falha ao desfazer: **"Não deu para desfazer. Tente de novo."**

## 3. Vazio

Componente: `AvisoDeEstado` (rótulo + título + texto) ou, em tabela/lista, uma frase
única. O vazio **explica por que está vazio e o que fazer**, nunca só "Nenhum item".

| Tela | Texto |
|---|---|
| Arquivo | **Nenhum processo encerrado ainda** · com busca sem resultado: **Nada encontrado com esse texto** |
| Documentos do processo | "Nenhum documento ainda. Os documentos de etapa nascem na linha do tempo." · filtro por etapa: "Nenhuma etapa com esse nome." · por nome: "Nenhum documento com esse nome." |
| Histórico | "Nada registrado ainda neste processo." · filtro: "Nenhum registro deste tipo." |
| Biblioteca | "Ainda não há exemplares. Quando um administrador marcar um documento como exemplar, ele aparece aqui para todos os órgãos." · busca: `Nenhum exemplar com “…”.` |
| Processos do período | **Nenhum processo no período** · "Ainda não há processos com data de publicação ou de criação no sistema." |
| Quem está com o quê | "Nenhuma pasta em andamento. N processos estão concluídos ou arquivados: ligue “Mostrar também os concluídos e arquivados”" · sem nada: "Ainda não há processos no sistema. Eles aparecem aqui, na mesa do responsável, assim que forem criados." |
| Agenda | "Nenhum prazo nos próximos 7 dias." · "Nenhum prazo neste período." |
| Prévia do Diário | "Nenhuma lacuna a preencher." |
| Modelos | "Ainda não há modelos. Os .docx saem só com o conteúdo escrito pela IA, no papel timbrado do órgão." · "Nenhum ainda. …" |
| Minha Mesa (aberturas) | **Nenhuma abertura marcada** |
| Rosca | Nenhum processo cadastrado · Barras: Sem dados |
| Versões do documento | "Ainda não há versões deste documento." · "Nenhuma diferença de texto entre as duas versões." |

Rótulos de lacuna (campo que falta num cartão/tabela): **Sem número · "Processo sem
objeto descrito" (o título da pasta sem descrição) · Sem modalidade · Sem data de
abertura · Sem dono** — o primeiro, o segundo e o terceiro vêm de `MARCA.objeto.semNumero`,
`.semDescricao` e `.semAgrupamento`, e "Sem data de abertura" de `MARCA.campos.semData`; em
frase corrida, "sem data". Célula de **valor em dinheiro** sem valor: "—" (`formatBRL*` em
`features/dashboard/formatos.ts`); célula de **data** sem data: "sem data" (`dataDeAbertura` e
`quandoAbre`, no mesmo arquivo). Nunca "N/A", "null", "undefined", "Não informado", "Não definida".

**Concordância pelo gênero do objeto.** Frases com o objeto principal usam `GEN`
(`config/marca.ts`, ver 08): `${GEN.Nenhum} ${MARCA.objeto.singular} encontrad${GEN.fim}`,
`${GEN.Este} ${MARCA.objeto.singular}`, `Excluir ${GEN.o}`, `Buscando ${GEN.o}`. As tabelas
abaixo mostram o texto no masculino ("processo"); para objeto feminino ("ordem de serviço")
leia "Nenhuma ordem de serviço encontrada", "Esta ordem de serviço"… Frase nova escrita
com "o"/"este" fixos é defeito.

## 4. Botões e rótulos recorrentes

| Uso | Texto |
|---|---|
| Repetir busca | Tentar de novo |
| Voltar uma tela | Voltar (com `ChevronLeft`, como em `MesaPagina`) |
| Abrir item na linha | Abrir › |
| Baixar | **Baixar .docx** (padrão de `BaixarDocumento`); com mais contexto, passe `rotulo`: "Baixar o documento (.docx)", "Baixar a ficha (.docx)" |
| Imprimir | Imprimir |
| Criar | `{MARCA.acaoPrincipal.rotulo}` (LicitarsAI: "Nova contratação") |
| Lista | "Ver {MARCA.objeto.plural}" (LicitarsAI: "Ver processos") |
| Sair do diálogo | Cancelar (exclusão) · Voltar (`ConfirmarAto`) |
| Salvar | Salvar alterações |
| Reverter | Desfazer · Voltar ao padrão |
| Fechar aviso | `aria-label="Fechar o aviso"` |
| Copiar | rótulo próprio do contexto (`BotaoCopiar rotulo=…`); por 2,5 s vira "Copiado" |

Regra: botão = **verbo + objeto** ("Arquivar processo", "Dispensar etapa"). Proibido:
"OK", "Sim", "Confirmar" sozinho, "Enviar" sem objeto, "Clique aqui".

## 5. Saudação da Minha Mesa

`h1` serifado: **"{Bom dia|Boa tarde|Boa noite}, {Primeiro nome}."** com a regra
`5–11h` bom dia · `12–17h` boa tarde · resto boa noite (função `saudacao(hora)` em
`assets/base/src/features/dashboard/formatos.ts`). Sem nome: só "Bom dia." Abaixo, em
`text-muted-foreground`, a data por extenso ("Segunda-feira, 5 de outubro.", com a
primeira letra em maiúscula) seguida de **uma frase-resumo do dia** (`resumo`). Botões do cabeçalho:
**Ver {MARCA.objeto.plural}** (outline; LicitarsAI: "Ver processos") e
**{MARCA.acaoPrincipal.rotulo}** (primário, ícone `Plus`; LicitarsAI: "Nova contratação").

## 6. Divisórias e ferramentas da pasta

Rótulo curto (na aba) / rótulo longo (título da tela), de `ferramentas.ts`:

| Divisória | Curto | Longo |
|---|---|---|
| (capa) | Linha do tempo | Linha do tempo |
| documentos | Documentos | Documentos do processo |
| autos | Autos | Autos para imprimir |
| prazos | Prazos | Simular prazos |
| historico | Histórico | Histórico do processo |
| edit | Ficha | Ficha do processo |

Ferramentas (borda direita): **Diário** ("Prévia no Diário") · **Repetir**
("Repetir contratação").

## 7. Atos de situação (ficha do item)

Família fixa; cada ato tem pergunta, consequência, botão de confirmar, botão de voltar
e aviso de resultado. O código do processo (`PE 7/2026`) entra na frase; sem código,
"este processo".

| Ato | Botão | Pergunta | Confirmar / Voltar | Aviso depois |
|---|---|---|---|---|
| Em andamento | Marcar em andamento | Marcar o processo X como em andamento? | Marcar em andamento / Manter como está | X está em andamento. |
| Voltar a aberto | Voltar para aberto | Voltar o processo X para aberto? | Voltar para aberto / Manter em andamento | X voltou para aberto. |
| Concluir | Concluir o processo | Concluir o processo X? | Concluir processo / Manter aberto | X foi concluído e está no Arquivo. |
| Arquivar | Arquivar o processo | Arquivar o processo X? | Arquivar processo / Manter aberto | X foi para o Arquivo. |
| Reabrir | Reabrir o processo | Reabrir o processo X? | Reabrir processo / Manter no Arquivo | X foi reaberto e voltou para Processos. |

Consequência: sempre diz **para onde a pasta vai** e se dá para desfazer ("Logo depois
aparece “Desfazer”, e ela pode ser reaberta aqui na ficha."). Se o sistema ainda não
registra o ato no histórico, **diga isso na própria frase** ("A mudança não aparece no
Histórico do processo."); não finja que registrou. O que cada situação permite:
aberto → andamento/concluir/arquivar · em andamento → concluir/voltar a aberto/arquivar
· concluído ou arquivado → reabrir.

Exclusão (`DeleteConfirmDialog`): "Excluir processo?" · "O processo "X" será marcado
como excluído. Você pode restaurá-lo pelo painel administrativo." · "Motivo
(opcional)" · placeholder "Ex.: criado por engano, duplicidade, etc." · Cancelar /
Excluir.

## 8. Avisos de resultado (faixa azul-noite)

Frase completa, no passado, com o nome do que mudou:
"Etapa "X" dispensada no PROC." · "Processo atualizado com sucesso!" (legado) ·
"Ficha salva." · "Modelo salvo e desligado…" · "Versão do órgão criada a partir do
padrão. Ajuste o texto e salve." · "Processo excluído". Erro de ação em formulário:
"Erro ao atualizar processo" (legado; prefira a forma "Não deu para … Nada foi
alterado.").

## 9. IA

Aviso fixo onde houver texto gerado: **"A IA escreve; quem decide e assina é você."**
Carimbo violeta "IA" para trecho gerado. Nunca apresente texto da IA como decisão ou
parecer jurídico; o rodapé de documento oficial leva rubrica e campo de assinatura em
branco.

## 10. Login e recuperação de senha

- Erro de login: o `Login` mostra primeiro a mensagem do erro vindo do login
  (`err.message`; na base de demonstração, `AuthContext` lança **"Usuário ou senha
  incorretos."**). Só quando o erro não traz mensagem aparece o texto de reserva:
  **"Credenciais inválidas. Certifique-se de que seu usuário e senha estão corretos."**
  Com um servidor real, devolva uma mensagem sem culpar a pessoa; a de reserva serve de modelo.
- Links: "Esqueceu sua senha?" · "← Voltar ao login".
- Primeiro acesso: "Primeiro acesso? Fale com {MARCA.quemConvida} para receber o
  convite." (é a frase de `Login` e `ResetPassword` da base; edite só `MARCA.quemConvida`.
  O texto do LicitarsAI, "Peça o convite ao administrador do Licitars no seu órgão.",
  é o valor de exemplo dessa frase.)
- Pedido de recuperação, resposta **neutra** (nunca revela se o e-mail existe): "Se o
  email estiver cadastrado, enviaremos um link para redefinir a senha. Verifique a caixa
  de entrada e o spam."
- Falha no pedido: "Não foi possível processar a solicitação. Tente novamente em alguns
  minutos."
- Regras de senha (nesta ordem): "Senha deve ter pelo menos 8 caracteres." · "Senha deve
  conter pelo menos um número." · "Senha deve conter pelo menos uma letra." · "Senha não
  pode ser apenas números." · "As senhas não conferem."
- Sucesso: "Senha redefinida com sucesso! Redirecionando para o login…"
- Token: "Token inválido. Solicite um novo link." · "Link expirado. Solicite um novo link."
  · "Este link já foi utilizado. Solicite um novo." · "Senha muito fraca. Use no mínimo 8
  caracteres." · "Não foi possível redefinir a senha."

## 11. Legenda das tintas (tela Ajuda)

Esta é a legenda do **ato / etiqueta** (segunda coluna da tabela de tintas em
`05-componentes-da-mesa.md`); a tinta de **situação do item** (selo da lista) tem outra
leitura, também em 05. Na tela Ajuda mostre as duas, em tabelas separadas.

| Tinta | Rótulo | Significa |
|---|---|---|
| azul | Registro | ato registrado, em andamento |
| verde | Aprovado | concluído, aprovado |
| carmim | Prazo legal | prazo da lei, urgente, irreversível |
| ocre | Pendente | falta algo; dispensado; atenção |
| violeta | IA | escrito ou sugerido pela IA |
| grafite | (neutro) | a fazer, sem significado de estado |

## 12. Atalhos

Ctrl K "Buscar processo ou tela" · Alt M "Minha Mesa" (/dashboard) · Alt P "Processos" · Alt A "Prazos e agenda" (/agenda) · Alt N "Nova
contratação" (textos do LicitarsAI; no sistema novo vêm de `MARCA.inicio`, `MARCA.objeto.plural` e `MARCA.acaoPrincipal.rotulo/.atalho`) · Esc "Fechar janela, busca ou lei ao lado" (a base mostra só "Fechar janela ou busca" quando `MARCA.leiAoLado` é `false`). Lista em `ATALHOS` (`features/preferencias/preferencias.ts`); aparecem na tela "Como fazer"; não disparam enquanto se escreve em campo.

## 13. Checklist de microcopy

1. Estado de espera tem frase com `…`; erro começa com "Não deu para"; vazio explica
   o porquê e o próximo passo.
2. Erro diz o que está a salvo ("Nada foi apagado").
3. Botão = verbo + objeto; nunca "OK/Sim".
4. Data `dd/mm/aaaa`, hora `HH:mm`, moeda `R$ 1.234,56`, ambos em `font-mono`.
5. Dado de exemplo inventado; CPF `000.000.000-00`, CNPJ `11.111.111/1111-11`.
6. Nada de inglês em texto visível ao usuário, exceto nomes próprios.
