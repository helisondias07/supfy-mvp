# Ativação do workflow n8n

O arquivo `n8n/supfy-process-order.workflow.json` é um workflow inicial importável. Ele recebe o pedido do aplicativo, interpreta quantidades e unidades e devolve os itens no contrato esperado pela aplicação. A validação de preço e estoque permanece no Supfy.

## 1. Importar o workflow

1. Acesse a sua instância n8n e entre em **Workflows**.
2. Escolha **Import from File**.
3. Selecione `n8n/supfy-process-order.workflow.json` deste projeto.
4. Abra o node **Receber pedido** e confirme o caminho `supfy-process-order`.
5. Salve o workflow.

O fluxo possui três nodes: Webhook → Code → Respond to Webhook. O node final é necessário para que a aplicação receba os itens processados na mesma requisição.

## 2. Proteger o webhook (recomendado)

1. Abra o node **Receber pedido** e, em **Authentication**, escolha **Header Auth**.
2. Crie uma credencial com o nome do header `X-Supfy-Webhook-Secret` e um valor longo e aleatório.
3. Na raiz do projeto, copie `.env.example` para `.env.local`.
4. Use o mesmo valor em `N8N_WEBHOOK_SECRET`.

O projeto envia esse header somente a partir da rota de servidor, sem expor o segredo ao navegador.

## 3. Ativar e conectar o aplicativo

1. Ative o workflow pelo toggle no canto superior direito do n8n.
2. Copie a **Production URL** do node **Receber pedido**. Não use a Test URL na aplicação.
3. Em `.env.local`, defina:

```env
N8N_WEBHOOK_URL=https://seu-dominio-n8n/webhook/supfy-process-order
N8N_WEBHOOK_SECRET=exatamente-o-mesmo-valor-da-variavel-no-n8n
```

4. Reinicie `npm run dev` depois de alterar `.env.local`.

## 4. Testar

1. No Supfy, preencha uma mensagem, por exemplo: `Me manda 5 caixas de leite integral e 10 kg de arroz tipo 1.`
2. Clique em **Interpretar pedido**.
3. A etiqueta abaixo do formulário deve mostrar **Processado pelo workflow n8n**.
4. Em n8n, confira a execução em **Executions**. O node final deve retornar um objeto com a chave `items`.

## Próximo passo: interpretação por IA

O workflow importado reproduz a interpretação baseada em regras que já existia localmente. Para usar IA, substitua o node **Interpretar pedido** por um node de modelo/agent que preserve o contrato de resposta documentado no README. Mantenha os campos `id`, `originalName`, `quantity`, `unit` e `rawText` em cada item retornado.
