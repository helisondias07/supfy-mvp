export type WhatsAppInboundText = {
  message: string;
  customerName: string;
  waId: string;
  messageId: string;
};

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

/**
 * Extrai texto de um payload no formato da Cloud API do WhatsApp.
 * Não envia mensagens, não chama a Graph API e não valida assinatura X-Hub-Signature-256
 * (isso exigiria um app Meta real). Serve só para demonstrar o contrato de entrada.
 */
export function extractWhatsAppTextMessage(payload: unknown): WhatsAppInboundText | { error: string } {
  const root = readRecord(payload);
  if (!root) return { error: "Payload WhatsApp inválido." };

  const entry = Array.isArray(root.entry) ? readRecord(root.entry[0]) : null;
  const changes = entry && Array.isArray(entry.changes) ? readRecord(entry.changes[0]) : null;
  const value = changes ? readRecord(changes.value) : null;
  if (!value) return { error: "Payload WhatsApp sem entry/changes/value." };

  const messages = Array.isArray(value.messages) ? value.messages : [];
  const contacts = Array.isArray(value.contacts) ? value.contacts : [];
  const message = readRecord(messages[0]);
  const contact = readRecord(contacts[0]);

  if (!message) return { error: "Nenhuma mensagem no payload." };
  if (message.type !== "text") {
    return { error: "Apenas mensagens de texto são aceitas neste MVP." };
  }

  const text = readRecord(message.text);
  const body = text?.body;
  if (typeof body !== "string" || !body.trim()) {
    return { error: "Mensagem de texto vazia." };
  }

  const profile = contact ? readRecord(contact.profile) : null;
  const customerName =
    profile && typeof profile.name === "string" && profile.name.trim()
      ? profile.name.trim()
      : "Cliente demo";
  const waId =
    (typeof contact?.wa_id === "string" && contact.wa_id) ||
    (typeof message.from === "string" && message.from) ||
    "demo-wa-id";
  const messageId = typeof message.id === "string" ? message.id : "wamid.demo";

  return {
    message: body.trim(),
    customerName,
    waId,
    messageId,
  };
}

export const demoWhatsAppPayload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "WHATSAPP_BUSINESS_ACCOUNT_DEMO",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "5500000000000",
              phone_number_id: "PHONE_NUMBER_ID_DEMO",
            },
            contacts: [
              {
                profile: { name: "Cliente Demo A" },
                wa_id: "5500000000001",
              },
            ],
            messages: [
              {
                from: "5500000000001",
                id: "wamid.DEMO_PEDIDO_001",
                timestamp: "1730000000",
                type: "text",
                text: {
                  body: "Bom dia, me manda 5 caixas de leite integral e 10 kg de arroz tipo 1.",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};
