# Supfy MVP

Protótipo frontend criado para o desafio prático da Supfy. O projeto demonstra como uma distribuidora de alimentos pode transformar pedidos recebidos por WhatsApp em pedidos estruturados, validados por um catálogo central de produtos, preços, unidades e disponibilidade.

A ideia central do MVP é usar IA para interpretar a linguagem natural do cliente, enquanto o catálogo central continua sendo a fonte confiável para preço, estoque e validação operacional.

## Protótipo em produção

Acesse o protótipo publicado na Vercel:

[https://supfy-mvp.vercel.app](https://supfy-mvp.vercel.app)

## Documentação

O PDF com a proposta, diagnóstico, arquitetura e próximos passos está disponível em:

[Desafio Prático Supfy - Helison Dias](docs/desafio-pratico-supfy-helison-dias.pdf)

## O que o MVP demonstra

- Recebimento de uma mensagem de pedido em texto livre.
- Interpretação simulada por IA para identificar item, quantidade e unidade.
- Validação dos itens por catálogo central.
- Identificação de produtos válidos, ambiguidades e exceções.
- Bloqueio de itens com estoque insuficiente ou produto não encontrado.
- Confirmação de itens válidos.
- Atualização de estoque em memória.
- Histórico temporário de pedidos recentes.
- Edição de preço no catálogo central.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- lucide-react

## Como rodar localmente

Pré-requisitos:

- Node.js instalado.
- npm instalado.

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse no navegador:

```text
http://localhost:3000
```

## Variáveis de ambiente

Este MVP não exige variáveis de ambiente para rodar localmente. Os dados usados no protótipo são mockados em memória e não há integração real com banco de dados, WhatsApp, ERP ou API de IA nesta versão.

## Scripts disponíveis

Executar o projeto em desenvolvimento:

```bash
npm run dev
```

Executar validação de lint:

```bash
npm run lint
```

Gerar build de produção:

```bash
npm run build
```

Executar a build de produção localmente:

```bash
npm run start
```

## Estrutura principal

```text
docs/
  desafio-pratico-supfy-helison-dias.pdf

src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
  lib/
```
