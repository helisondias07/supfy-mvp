# Supfy MVP

Aplicação para transformar mensagens de pedidos em itens estruturados e validados por um catálogo central de produtos, preços, unidades e disponibilidade.

## Recursos atuais

- Recebimento de pedidos em texto livre.
- Validação de produto, unidade, preço e estoque pelo catálogo exibido na aplicação.
- Atualização do estoque em memória após a confirmação.
- Histórico temporário de pedidos no navegador.
- Integração opcional com n8n para interpretar a mensagem do pedido.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- n8n via webhook HTTP opcional

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Integração com n8n

O frontend nunca chama o n8n diretamente. Ele envia o pedido para `POST /api/orders`, e a rota do Next.js encaminha a requisição ao webhook configurado. Isso mantém a URL e o segredo do webhook no servidor.

1. Copie `.env.example` para `.env.local`.
2. Preencha `N8N_WEBHOOK_URL` com a URL de produção do seu node **Webhook** no n8n.
3. Defina `N8N_WEBHOOK_SECRET`; o projeto o envia ao n8n no header `X-Supfy-Webhook-Secret`. No node Webhook, configure **Header Auth** com esse mesmo header e valor.
4. No n8n, processe `message` e responda pelo node **Respond to Webhook** com o formato abaixo.

```json
{
  "items": [
    {
      "id": "item-0",
      "originalName": "leite integral",
      "quantity": 5,
      "unit": "caixa",
      "rawText": "5 caixas de leite integral"
    }
  ]
}
```

O campo `catalog` também é enviado ao workflow, caso a interpretação precise usar aliases e unidades comerciais. A validação de preço e estoque continua no aplicativo, usando o catálogo que está visível ao operador.

Sem `N8N_WEBHOOK_URL`, a aplicação usa o interpretador local existente, adequado para demonstração e desenvolvimento.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```
