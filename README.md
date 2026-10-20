# Supfy MVP

[![CI](https://github.com/helisondias07/supfy-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/helisondias07/supfy-mvp/actions/workflows/ci.yml) ![License: MIT](https://img.shields.io/badge/license-MIT-green)

## Sobre

Restaurantes e distribuidores recebem pedidos por WhatsApp em texto livre. O Supfy transforma essas mensagens em pedidos estruturados, validando produto, unidade, preço e estoque contra um catálogo central, o que reduz erro manual e retrabalho.

## Demo

🔗 **[supfy-mvp.vercel.app](https://supfy-mvp.vercel.app)**

<div align="center">
  <img src="./docs/demo.gif" alt="Demonstração" width="800" />
</div>

<!-- Print estático: ./docs/screenshot.png -->

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

## Testes e qualidade

- `npm run lint`: ESLint (config Next.js)
- `npm run build`: build de produção com checagem de tipos
- CI no GitHub Actions roda lint, testes e build a cada push/PR

- `npm test`: Vitest com testes do parser e da validação de pedidos (`src/lib/__tests__`)

## Aprendizados

- Aprendi a quebrar texto livre de WhatsApp em itens estruturados com regex e normalização: separar por vírgula e por "e" antes de número, padronizar a unidade no singular e limpar saudações e verbos do nome do produto (`order-parser.ts`).
- Vi que casar o produto pelo alias **mais longo** primeiro evita confusões como "leite" vs "leite integral", e que alguns casos precisam de regra explícita, como "sem lactose" (`order-validation.ts`).
- Separei a validação em estados claros (Validado, Estoque insuficiente, Produto não encontrado, Revisão humana) para que a automação nunca confirme sozinha um pedido duvidoso. Os casos ambíguos vão para um operador.
- Integrei o fluxo com o n8n por uma rota de API do Next.js (`/api/orders`) e um workflow exportado em `n8n/`.
- Cobri o parser e a validação com testes no Vitest, rodando no CI.

## Licença

MIT © Helison Dias
