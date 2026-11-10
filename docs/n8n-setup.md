# Ativação do workflow n8n

O arquivo `n8n/supfy-process-order.workflow.json` é importável. Ele recebe o pedido, **valida a entrada sem lançar exceção**, interpreta quantidades/unidades com as **mesmas regras** do parser TypeScript e responde no contrato da aplicação. Preço e estoque **não** são alterados no n8n.

Os nodes Code são a cópia versionada de `n8n/code/validate-input.js` e `n8n/code/interpret-order.js`. Testes falham se o JSON e esses arquivos divergirem.

## 1. Importar o workflow

1. Na instância n8n, **Workflows → Import from File**.
2. Selecione `n8n/supfy-process-order.workflow.json`.
3. Confirme o caminho do webhook `supfy-process-order`.
4. Salve. Deixe **inactive** até configurar autenticação.

Nodes: Webhook → Validar entrada → IF → Interpretar pedido → Responder sucesso. O ramo falso do IF vai para **Responder erro**.

## 2. Proteger o webhook

1. No node **Receber pedido**, Authentication = **Header Auth**.
2. Header `X-Supfy-Webhook-Secret` e um valor longo.
3. Opcional e redundante: variável `SUPFY_WEBHOOK_SECRET` no n8n; o node **Validar entrada** compara o mesmo header. Divergência responde **401** com `retryable: false` (não use throw: throw pode reprocessar).
4. Copie `.env.example` para `.env.local` e use o mesmo valor em `N8N_WEBHOOK_SECRET`.

A aplicação só envia o header a partir da rota de servidor.

## 3. Conectar o aplicativo

1. Ative o workflow.
2. Copie a **Production URL** do webhook. Não use a Test URL na aplicação.
3. Em `.env.local`:

```env
N8N_WEBHOOK_URL=https://seu-dominio-n8n/webhook/supfy-process-order
N8N_WEBHOOK_SECRET=exatamente-o-mesmo-valor-da-variavel-no-n8n
```

`N8N_DISABLE_FALLBACK=true` faz a API responder 502/503 em vez de cair no parser local.

4. Reinicie `npm run dev`.

## 4. Testar (na sua instância; não faz parte do CI deste repo)

1. No Supfy: cenário **Pedido válido** → **Interpretar pedido**.
2. A etiqueta deve mostrar **Workflow n8n (regras)** se a resposta respeitar o contrato.
3. Em Executions, o node de sucesso devolve `items`.
4. Envie `{}` ou mensagem vazia: HTTP 400, `retryable: false`, execução **não** deve ficar em erro por throw.

## Repetição / retry

O workflow é idempotente no sentido operacional: só devolve itens parseados. Não grava pedido e não baixa estoque. A aplicação chama o webhook **uma vez** por clique; timeout ou 5xx disparam fallback local, não um segundo POST automático.

## Ponto de extensão para IA

Para usar um modelo, substitua o node **Interpretar pedido** e preserve `id`, `originalName`, `quantity`, `unit` e `rawText`. A validação comercial permanece no Next.js. Isso **não** está ligado neste repositório.
