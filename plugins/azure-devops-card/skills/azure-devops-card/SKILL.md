---
name: azure-devops-card
description: >-
  Use esta skill sempre que o usuário quiser criar, redigir ou formatar o TÍTULO
  e/ou a DESCRIÇÃO (em markdown) de um card / tarefa / work item do Azure DevOps —
  inclusive quando ele só descrever a tarefa, colar um plano, ou pedir "monta o
  card", "título e descrição da tarefa", "cria a task no board", "ADO work item",
  "card da sprint", sem citar a skill pelo nome. Gera saída enxuta em português do
  Brasil, com título no padrão `[<categoria>][<FRONTEND|BACKEND>] <título>`. NÃO use
  para escrever código, PRs, mensagens de commit ou documentação que não seja o
  conteúdo de um card.
---

# Azure DevOps — Título e Descrição de Card

Transforme o que o usuário descreve (tarefa, contexto, plano) em um **título** e uma
**descrição em markdown** prontos para colar no Azure DevOps. O alvo é o leitor humano:
texto curto, direto e em português do Brasil. Mais palavras não é mais valor — quem abre
o card precisa entender em segundos o que será feito e como saber que terminou.

Se a skill for invocada como comando, `$ARGUMENTS` traz a descrição inicial da tarefa.

## Fluxo

1. **Entenda a tarefa** com o que o usuário já deu. Não repita perguntas cuja resposta
   já está no que ele escreveu ou no contexto da conversa.
2. **Defina a categoria** (área/módulo do sistema) — ver *Inferir a categoria*.
3. **Defina a camada** FRONTEND ou BACKEND — ver *Escolher a camada*.
4. **Pergunte só o que falta** dos campos essenciais — ver *Perguntar antes*.
5. **Gere** título + descrição seguindo as regras abaixo.
6. **Autoverifique** antes de entregar — ver *Autoverificação*.
7. **Apresente** para cópia — ver *Formato de saída*.

## Regras do título

Padrão **exato**, sem variações: `[<categoria>][<FRONTEND|BACKEND>] <título da tarefa>`

- `FRONTEND` ou `BACKEND` em CAIXA ALTA, e **exatamente um** dos dois — o da camada
  predominante da tarefa. Nunca os dois, nunca `FULLSTACK`.
- `<categoria>` é a **área/módulo do sistema** (ex.: `Faturamento`, `Auth`, `Relatórios`,
  `Integração`), capitalizada, sem espaços supérfluos dentro dos colchetes.
- `<título da tarefa>` curto (mire ≤ 80 caracteres), em pt-BR, começando por verbo no
  infinitivo ou substantivo de ação (ex.: "Implementar…", "Corrigir…", "Adicionar…"),
  **sem ponto final**.
- Mantenha termos técnicos já consagrados em inglês quando soa natural (API, deploy,
  endpoint, frontend, cache). Não traduza à força.

## Inferir a categoria (área/módulo)

A categoria é livre, mas você a **sugere a partir do projeto** onde a sessão roda — não
peça do zero se dá para deduzir.

1. Se o projeto já tiver uma lista de categorias (em `CLAUDE.md`, `AGENTS.md`, ou um
   arquivo tipo `.azure-devops-categories`), **use essa lista**.
2. Senão, faça uma leitura rápida e **read-only** da estrutura para levantar candidatos:
   pastas de topo, `src/*`, pacotes de monorepo (`packages/*`, `apps/*`), projetos de
   solução (`*.csproj`), namespaces ou domínios de negócio. Não faça varredura profunda —
   o objetivo é só achar 3–6 nomes de área plausíveis.
3. Cruze esses candidatos com o que a tarefa toca e **proponha a categoria** ao usuário
   via `AskUserQuestion`, sempre permitindo que ele digite outra. Se a tarefa indicar
   claramente a área, sugira-a como primeira opção (recomendada).
4. Se o usuário já informou a categoria, respeite-a e não infira.

## Escolher a camada (FRONTEND | BACKEND)

Escolha a **camada principal** da tarefa, não todas as que ela encosta.

- Mexe sobretudo em UI, componentes, telas, estilos, comportamento de cliente → `FRONTEND`.
- Mexe sobretudo em API, regras de negócio, banco, jobs, integrações, serviços → `BACKEND`.
- Se a tarefa for genuinamente das duas e não houver uma predominante óbvia, **pergunte**
  qual é a principal em vez de chutar.

## Estrutura da descrição (markdown)

Use o esqueleto **detalhado** abaixo, porém **enxuto**: cada seção só existe se acrescenta
informação real. Encha de filler é pior que omitir.

```markdown
## Contexto
1–2 linhas: por que esta tarefa existe / qual problema resolve.

## Objetivo
O que será entregue, de forma objetiva.

## Escopo
**Dentro:** o que entra.
**Fora:** o que explicitamente não entra (quando ajudar a evitar ambiguidade).

## Plano
1. Passo
2. Passo

## Critérios de aceitação
- [ ] Critério testável 1
- [ ] Critério testável 2

## Observações técnicas
Notas, riscos, dependências, links. Só quando houver algo relevante.
```

Regras de minimalismo:

- **Sempre mantenha** `## Objetivo` e `## Critérios de aceitação` — são o coração do card.
- `## Contexto`, `## Escopo`, `## Plano` e `## Observações técnicas` entram **só quando
  agregam**. Se uma seção ficaria vazia ou genérica, **remova-a inteira** (não deixe
  cabeçalho órfão nem "N/A").
- Critérios de aceitação são **verificáveis**: descrevem um resultado observável que diz
  "terminou", não a lista de passos. Use checkboxes `- [ ]`.
- Frases curtas, bullets em vez de parágrafos longos, voz ativa. Sem linguagem de
  marketing ("robusto", "poderoso", "de forma eficiente").

## Perguntar antes (quando faltar info)

Quando faltar algo essencial para um card honesto, **pergunte antes de gerar** — usando
`AskUserQuestion`, com perguntas curtas e específicas, e só sobre o que está faltando.
Priorize, nesta ordem: **objetivo claro**, **critérios de aceitação**, **o que fica fora
do escopo**, **riscos/dependências**. Não pergunte o que já dá para inferir do que o
usuário disse — perguntas óbvias cansam e atrasam.

## Idioma e tom

Tudo em **português do Brasil**, claro e direto, escrito para um colega de time ler rápido.
Termos técnicos consagrados podem ficar em inglês.

## Autoverificação (antes de entregar)

Confira de fato, não presuma:

- [ ] Título casa **exatamente** com `[<categoria>][<FRONTEND|BACKEND>] <título>`.
- [ ] Exatamente **uma** camada, em CAIXA ALTA.
- [ ] Categoria coerente com a área/módulo da tarefa.
- [ ] Descrição em pt-BR, sem seções vazias ou de filler.
- [ ] `## Objetivo` e `## Critérios de aceitação` presentes; critérios testáveis.

## Formato de saída

Entregue pronto para copiar: o título como **texto puro** numa linha, e a descrição num
bloco de código markdown (` ```markdown `) para o usuário copiar inteiro. Depois,
ofereça ajustar.

## Exemplos

**Exemplo 1 — backend**

Título:
`[Faturamento][BACKEND] Implementar geração de boletos via API do banco`

```markdown
## Contexto
Hoje os boletos são gerados manualmente, o que atrasa o fechamento mensal.

## Objetivo
Gerar boletos automaticamente ao fechar a fatura, integrando com a API do banco.

## Escopo
**Fora:** baixa/conciliação de pagamento (fica para tarefa separada).

## Plano
1. Criar cliente da API de boletos do banco.
2. Disparar a geração no fechamento da fatura.
3. Persistir nosso-número e linha digitável na fatura.

## Critérios de aceitação
- [ ] Fatura fechada gera boleto e salva linha digitável.
- [ ] Falha na API é registrada em log e não quebra o fechamento.
```

**Exemplo 2 — frontend**

Título:
`[Relatórios][FRONTEND] Adicionar filtro de período no dashboard de vendas`

```markdown
## Objetivo
Permitir filtrar o dashboard de vendas por período (data inicial e final).

## Plano
1. Adicionar seletor de período no topo do dashboard.
2. Refazer as consultas dos gráficos com o período selecionado.

## Critérios de aceitação
- [ ] Selecionar um período atualiza todos os gráficos do dashboard.
- [ ] Período padrão é o mês atual ao abrir a tela.
```
