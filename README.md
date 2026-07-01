# Supfy MVP

Protótipo frontend demonstrativo criado para o desafio prático de estágio em Desenvolvimento da Supfy.

A proposta do MVP é mostrar, de forma visual e operacional, como uma distribuidora de alimentos pode reduzir retrabalho manual ao transformar pedidos recebidos por WhatsApp em pedidos estruturados, validados por um catálogo central de produtos, preços, unidades e disponibilidade.

Mensagem central do protótipo:

> A IA interpreta a linguagem. O catálogo central valida preço e disponibilidade.

## Contexto do desafio

A distribuidora apresentada no desafio possui alto volume operacional:

- 180 clientes ativos;
- 700 produtos cadastrados;
- 12 vendedores externos;
- cerca de 400 pedidos por dia;
- operação baseada em planilhas, ligações e WhatsApp.

O principal problema escolhido para este MVP foi o fluxo de recebimento e validação de pedidos por WhatsApp, porque ele concentra três dores importantes:

- leitura e redigitação manual de pedidos;
- divergência de preços entre planilhas, vendedores, clientes e financeiro;
- venda de produtos sem disponibilidade em estoque.

## O que este protótipo demonstra

Este projeto não é um sistema completo. Ele é um MVP visual e funcional para apresentar uma hipótese de solução.

O fluxo demonstrado é:

1. Um cliente envia um pedido em texto livre, como faria pelo WhatsApp.
2. Uma IA simulada interpreta os itens, quantidades e unidades.
3. O sistema consulta um catálogo central mockado.
4. O catálogo valida produto, preço, unidade e estoque disponível.
5. Itens válidos podem ser confirmados.
6. Itens inválidos, ambíguos ou sem estoque seguem para revisão humana.
7. Ao confirmar, o estoque disponível é atualizado em memória.

## Como rodar o projeto

Pré-requisitos:

- Node.js instalado;
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

## Como usar o protótipo

### 1. Simular um pedido recebido

Na área `Pedido recebido`, digite uma mensagem de pedido ou use um dos botões de exemplo.

Exemplo de pedido válido:

```text
Me manda 5 caixas de leite integral, 10 refrigerantes cola 2L e 10 kg de arroz tipo 1.
```

Depois clique em:

```text
Interpretar pedido
```

O protótipo exibe uma simulação de processamento com as etapas:

- IA interpretando a mensagem;
- identificando itens e quantidades;
- consultando catálogo central.

### 2. Ver a validação do pedido

Após a interpretação, o painel `Validação do pedido` mostra:

- quantidade de itens identificados;
- quantidade de itens válidos;
- quantidade de exceções;
- produto encontrado no catálogo;
- quantidade solicitada;
- unidade;
- preço unitário;
- subtotal;
- estoque disponível;
- status de validação.

Os status possíveis são:

- `Validado`;
- `Estoque insuficiente`;
- `Produto não encontrado`;
- `Revisão humana`.

### 3. Confirmar itens válidos

Quando houver itens válidos, clique em:

```text
Confirmar itens válidos
```

Ao confirmar:

- o estoque dos itens válidos é reduzido em memória;
- o horário de última sincronização é atualizado;
- um feedback visual confirma a atualização da disponibilidade.

Itens inválidos não são confirmados e não entram no total do pedido.

### 4. Testar exceções

Use o exemplo:

```text
Preciso de 20 caixas de leite sem lactose e 5 fardos de água mineral.
```

Resultado esperado:

- `Leite sem lactose` vira `Produto não encontrado`;
- `Água Mineral 500ml` é validada se houver estoque suficiente.

Use também:

```text
Quero 200 unidades de refrigerante cola 2L.
```

Resultado esperado:

- o item vira `Estoque insuficiente`, porque o estoque inicial do Refrigerante Cola 2L é 120.

### 5. Editar preço no catálogo

Na seção `Catálogo central de produtos`, clique em:

```text
Editar preço
```

Ao salvar um novo preço:

- o preço é atualizado em memória;
- os indicadores de sincronização mudam visualmente;
- vendedores, clientes e financeiro são representados como sincronizados.

Isso demonstra o conceito de fonte única de verdade para preço.

## Regras de negócio implementadas

- O catálogo central é a única fonte de preço e estoque.
- A interpretação simulada identifica apenas item, quantidade e unidade.
- Produto não encontrado vira exceção.
- Estoque insuficiente vira exceção.
- Itens ambíguos seguem para revisão humana.
- O sistema não permite estoque negativo.
- Apenas itens validados entram no total.
- Apenas itens validados podem ser confirmados.
- A confirmação reduz estoque apenas em memória.
- Alterações de preço ou estoque atualizam a última sincronização.

## Decisões técnicas

- Next.js com App Router.
- React com TypeScript.
- Tailwind CSS para estilização.
- `lucide-react` para ícones.
- Dados mockados em memória.
- Parser local simples para simular interpretação de pedidos.
- Sem banco de dados.
- Sem autenticação.
- Sem integração real com WhatsApp.
- Sem chamada real para API de IA nesta versão.

## Estrutura do projeto

```text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    app-header.tsx
    metric-card.tsx
    order-simulator.tsx
    order-validation-panel.tsx
    product-catalog.tsx
    price-editor.tsx
    result-section.tsx
    ui/
      badge.tsx
      toast.tsx
  lib/
    catalog-data.ts
    formatters.ts
    order-parser.ts
    order-validation.ts
    types.ts
```

## Arquivos principais

- `src/app/page.tsx`: controla o estado principal do MVP e conecta os componentes.
- `src/lib/catalog-data.ts`: contém os produtos mockados.
- `src/lib/order-parser.ts`: simula a interpretação do texto livre.
- `src/lib/order-validation.ts`: valida produto, unidade, preço e estoque.
- `src/components/order-simulator.tsx`: interface do pedido recebido.
- `src/components/order-validation-panel.tsx`: painel de validação do pedido.
- `src/components/product-catalog.tsx`: tabela do catálogo central.
- `src/components/price-editor.tsx`: modal de edição de preço.

## Identidade visual

A interface foi adaptada para se aproximar da identidade visual da Nola:

- logo oficial em SVG;
- fonte Inter;
- fundo claro com grid sutil;
- texto principal em azul-marinho escuro;
- cor de destaque coral/vermelha;
- cards claros com borda suave;
- botões arredondados;
- layout limpo, operacional e adequado para apresentação em vídeo.

## Como este MVP se conecta ao desafio

O desafio pede diagnóstico, priorização, proposta de transformação, arquitetura, escolha de MVP, usos de IA e próximos passos.

Este protótipo representa a escolha de MVP:

> Transformar pedidos recebidos por WhatsApp em pedidos estruturados e validados por um catálogo central.

Essa escolha foi feita porque:

- afeta diretamente os 400 pedidos diários;
- reduz redigitação manual;
- diminui erro de preço;
- evita confirmação de itens indisponíveis;
- cria uma base para integrações futuras com WhatsApp, ERP, financeiro e estoque.

## Limitações do protótipo

- O estoque e os preços são mantidos apenas em memória.
- Ao recarregar a página, os dados voltam ao estado inicial.
- A interpretação do pedido é simulada com regras locais.
- Não existe persistência de pedidos.
- Não existe fila real de revisão humana.
- Não há integração com WhatsApp Business API.
- Não há integração com ERP ou sistema financeiro.
- Não há OCR para comprovantes.
- Não há API real de IA.

## Evolução futura

Possíveis próximos passos:

- integração com WhatsApp Business API;
- banco central para produtos, pedidos, preços e estoque;
- API real de IA para interpretar mensagens com mais variação;
- fila operacional para revisão humana;
- integração com ERP;
- auditoria de alterações de preço e estoque;
- OCR para leitura de comprovantes de pagamento;
- painel de atendimento para perguntas recorrentes;
- alertas de recompra e previsão de demanda;
- dashboards gerenciais com indicadores de operação.

## Scripts disponíveis

Executar em modo desenvolvimento:

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

## Status de validação

Última validação realizada:

- `npm run lint`: passou;
- `npm run build`: passou.
