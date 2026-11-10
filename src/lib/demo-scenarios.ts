import { demoWhatsAppPayload } from "./whatsapp-inbound";

export type DemoScenario = {
  id: string;
  label: string;
  description: string;
  message: string;
  source: "texto" | "whatsapp-demo";
  whatsappPayload?: unknown;
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "valido",
    label: "Pedido válido",
    description: "Itens conhecidos, unidades aceitas e estoque suficiente no catálogo sintético.",
    message: "Me manda 5 caixas de leite integral, 10 refrigerantes cola 2L e 10 kg de arroz tipo 1.",
    source: "texto",
  },
  {
    id: "excecoes",
    label: "Exceções mistas",
    description: "Um produto fora do catálogo e outro válido, para exercitar a fila de revisão.",
    message: "Preciso de 20 caixas de leite sem lactose e 5 fardos de água mineral.",
    source: "texto",
  },
  {
    id: "estoque",
    label: "Estoque insuficiente",
    description: "Quantidade acima da disponibilidade sintética do refrigerante.",
    message: "Quero 200 unidades de refrigerante cola 2L.",
    source: "texto",
  },
  {
    id: "unidade",
    label: "Unidade divergente",
    description: "Produto conhecido, mas unidade fora das variações comerciais do catálogo.",
    message: "Separa 3 kg de leite integral.",
    source: "texto",
  },
  {
    id: "whatsapp",
    label: "Payload WhatsApp demo",
    description: "Envelope sintético no formato da Cloud API. Nenhum provedor externo é chamado.",
    message: "Bom dia, me manda 5 caixas de leite integral e 10 kg de arroz tipo 1.",
    source: "whatsapp-demo",
    whatsappPayload: demoWhatsAppPayload,
  },
];
