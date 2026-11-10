# Arquitetura do Supfy MVP

## Problema

Distribuidores e restaurantes recebem pedidos em texto livre (WhatsApp, no cenário de negócio). A digitação manual no ERP gera erro de produto, unidade, preço e estoque. Este repositório demonstra um recorte operacional: estruturar a mensagem, validar contra um catálogo e deixar exceções com um operador.

## O que é e o que não é

| Camada | Implementado | Não implementado |
| --- | --- | --- |
| Interpretação da mensagem | Parser determinístico (TypeScript e node Code do n8n) | LLM, agentes, RAG, embeddings |
| n8n | Workflow JSON importável, validação de entrada, resposta 4xx sem throw | Execução contra instância real neste ambiente |
| WhatsApp | Envelope sintético no formato da Cloud API + handshake `hub.verify_token` | Graph API, envio de mensagens, assinatura `X-Hub-Signature-256` |
| Catálogo / estoque | Memória do navegador, dados sintéticos | Postgres, Prisma, Redis, ERP |
| Confirmação | Baixa estoque só na sessão | Persistência, financeiro, NF-e |

## Fluxo

```
UI (Next.js)
  → POST /api/inbound/whatsapp   (opcional, payload sintético)
  → POST /api/orders
       → se N8N_WEBHOOK_URL: POST webhook n8n (timeout 15s, header de segredo, X-Idempotency-Key)
       → senão ou fallback: parseOrderMessage local
  → validateOrderItems(catalog) na UI
  → operador confirma itens válidos ou envia exceções à fila local
```

O frontend **nunca** chama o n8n. URL e segredo ficam no servidor.

## Decisões e trade-offs

1. **Parser de regras em vez de LLM.** O volume de mensagens de pedido neste domínio é repetitivo (quantidade + unidade + produto). Regras são testáveis, baratas e reproduzíveis. Um node de modelo no n8n é um ponto de extensão, não o caminho atual.
2. **Preço e estoque na aplicação.** Mesmo que o n8n interprete nomes, a autoridade comercial permanece no catálogo visível ao operador. O workflow é parse-only: retries não baixam estoque duas vezes.
3. **Fallback local visível.** Sem n8n (ou com n8n fora do contrato), a demo continua utilizável. `N8N_DISABLE_FALLBACK=true` força falha 502/503, útil para um ambiente que não queira mascarar a integração.
4. **Validação 4xx no n8n sem `throw`.** Throw no node Code marca a execução como falha e pode gerar reprocessamento. Entrada inválida responde `retryable: false`.
5. **Catálogo via request.** O operador pode alterar preço na UI; a API valida o array na hora. Em produção o catálogo viveria no servidor; aqui o objetivo é demonstrar a conferência com o que está na tela.

## Contrato do webhook n8n

Pedido:

```json
{
  "message": "5 caixas de leite integral",
  "catalog": [],
  "requestId": "uuid"
}
```

Sucesso: `{ "items": [ { "id", "originalName", "quantity", "unit", "rawText" } ], "requestId", "interpreter": "deterministic-rules", "retryable": false }`

Erro de validação: HTTP 4xx, `{ "error": "...", "retryable": false }`.

## O que foi executado versus validado estaticamente

Ver o README, seção “Provas e limitações”.
