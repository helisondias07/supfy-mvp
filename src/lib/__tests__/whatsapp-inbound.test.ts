import { describe, expect, it } from "vitest";
import { demoWhatsAppPayload, extractWhatsAppTextMessage } from "../whatsapp-inbound";

describe("extractWhatsAppTextMessage", () => {
  it("lê o envelope sintético da Cloud API", () => {
    const result = extractWhatsAppTextMessage(demoWhatsAppPayload);
    expect(result).toMatchObject({
      customerName: "Cliente Demo A",
      waId: "5500000000001",
      messageId: "wamid.DEMO_PEDIDO_001",
    });
    if ("error" in result) return;
    expect(result.message).toContain("leite integral");
  });

  it("rejeita payload sem texto", () => {
    expect(extractWhatsAppTextMessage({ object: "whatsapp_business_account", entry: [] })).toMatchObject({
      error: expect.stringContaining("entry"),
    });
  });
});
