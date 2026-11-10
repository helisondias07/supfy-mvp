# Supfy MVP

[![CI](https://github.com/helisondias07/supfy-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/helisondias07/supfy-mvp/actions/workflows/ci.yml) ![License: MIT](https://img.shields.io/badge/license-MIT-green)

MVP demonstrativo: mensagens de pedido em texto livre viram itens estruturados e são validadas por um **catálogo sintético** (produto, unidade, preço e estoque). A interpretação é **determinística**. Integração **opcional** com n8n via webhook autenticado.

Não há dados pessoais, resultados de piloto nem métricas de negócio reais neste repositório.

## Problema de negócio

Pedidos chegam por mensagem, com quantidade, apelido de produto e unidade informal. Conferir isso na mão gera retrabalho. O recorte deste case é: estruturar a mensagem, recusar o que o catálogo não confirma e deixar exceção com operador.

## Demo local

```bash
npm install
npm test
npm run demo
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

1. Use **Pedido válido** → Interpretar → Confirmar itens válidos (estoque da sessão cai).
2. Use **Exceções mistas** → Enviar exceções para revisão (fila local, sem mensagem externa).
3. Use **Payload WhatsApp demo** para exercitar `POST /api/inbound/whatsapp` (envelope sintético).
4. `GET /api/health` mostra se `N8N_WEBHOOK_URL` está definida. Isso **não** dispara o workflow.

Há um GIF antigo em `docs/demo.gif`. A fonte de verdade do comportamento atual é a UI + `npm run demo`.

Arquitetura detalhada: [`docs/architecture.md`](docs/architecture.md). n8n: [`docs/n8n-setup.md`](docs/n8n-setup.md).

## Como o sistema decide

```
Browser → POST /api/orders
        → n8n (opcional, 15s, header de segredo, X-Idempotency-Key)
        → ou parser local
        → UI valida preço/unidade/estoque
        → confirmação em memória ou fila de revisão
```

- **Não é LLM.** Parser TypeScript e o node Code do n8n usam as mesmas regras (contrato coberto por teste).
- **n8n não confirma pedido.** Retry do webhook não baixa estoque.
- Fallback para o parser local é **explícito** na UI (`fallbackReason`). `N8N_DISABLE_FALLBACK=true` desliga o fallback.

## Recursos

- Simulador de mensagem com cenários sintéticos.
- Validação: Validado, Estoque insuficiente, Produto não encontrado, Revisão humana, Confirmado.
- Fila de revisão humana na sessão (sessionStorage).
- Histórico temporário de pedidos confirmados.
- Edição de preço no catálogo sintético.
- `POST /api/inbound/whatsapp` e verificação `hub.challenge` com token de demo.
- Workflow n8n versionado: validação de entrada, ramo de erro 4xx sem `throw`, interpretação alinhada ao parser.

## Tecnologias neste repositório

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Vitest e GitHub Actions
- n8n via JSON importável + HTTP opcional

Não fazem parte deste projeto (embora apareçam em outros contextos): Postgres, Prisma, Redis, FastAPI, RAG, Playwright, deploy em produção.

## Variáveis de ambiente

Veja `.env.example`. Nunca commite `.env.local` nem segredos reais.

## Scripts

| Comando | Função |
| --- | --- |
| `npm run dev` | App local |
| `npm test` | Vitest (parser, validação, API, n8n, WhatsApp demo, transcrição) |
| `npm run demo` | Reexecuta a transcrição dos cenários sintéticos |
| `npm run lint` | ESLint |
| `npm run build` | Build de produção |

## Competências demonstradas por código

| Competência | Onde está |
| --- | --- |
| Next.js / React / TypeScript / Tailwind | `src/app`, `src/components` |
| Rota REST, validação 400, timeout 15s, type guards, fallback | `src/lib/process-order.ts`, `src/app/api/orders/route.ts` |
| Automação n8n versionável, contrato, retry seguro | `n8n/`, `src/lib/n8n-runner.ts`, `src/lib/__tests__/n8n-workflow.test.ts` |
| Formato de entrada WhatsApp Cloud API (simulado) | `src/lib/whatsapp-inbound.ts`, `src/app/api/inbound/whatsapp/route.ts` |
| Testes e CI | `src/lib/__tests__`, `.github/workflows/ci.yml` |
| UX operacional de e-commerce (catálogo, exceção, confirmação) | `src/app/page.tsx`, fila de revisão |

## Provas e limitações

**Executado neste ambiente de desenvolvimento**

- `npm test`, `npm run lint`, `npm run demo` e `npm run build` (quando relatados no PR).
- Parser e workflow n8n rodados **em processo Node**, sem instância n8n.
- App local para conferir o fluxo da UI, se o ambiente permitir.

**Não executado de propósito**

- Publicação/deploy, Vercel de produção, Docker Compose de n8n.
- Disparo de webhook em n8n real.
- Envio de WhatsApp, e-mail ou Slack.
- Qualquer conta, credencial ou `.env` real.

**Limitações honestas**

- Estoque e pedidos morrem com a aba.
- Catálogo e clientes são sintéticos (`Cliente Demo A`).
- O parser erra em linguagem muito fora dos padrões cobertos pelos testes.
- Handshake WhatsApp usa token de demonstração, sem validação de assinatura Meta.
