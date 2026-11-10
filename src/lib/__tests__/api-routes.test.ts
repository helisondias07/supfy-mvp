import { describe, expect, it } from "vitest";
import { GET as healthGet } from "@/app/api/health/route";
import { GET as whatsappGet, POST as whatsappPost } from "@/app/api/inbound/whatsapp/route";
import { POST as ordersPost } from "@/app/api/orders/route";
import { initialCatalog } from "../catalog-data";
import { demoWhatsAppPayload } from "../whatsapp-inbound";

describe("rotas HTTP", () => {
  it("GET /api/health não dispara n8n", async () => {
    const response = await healthGet();
    const body = (await response.json()) as { n8nConfigured: boolean; interpreter: string };
    expect(response.status).toBe(200);
    expect(body.interpreter).toBe("deterministic-rules");
    expect(body.n8nConfigured).toBe(false);
  });

  it("POST /api/orders valida 400 e processa localmente", async () => {
    const invalid = await ordersPost(
      new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify({ message: "", catalog: initialCatalog }),
      }),
    );
    expect(invalid.status).toBe(400);

    const valid = await ordersPost(
      new Request("http://localhost/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Idempotency-Key": "demo-key" },
        body: JSON.stringify({ message: "5 caixas de leite integral", catalog: initialCatalog }),
      }),
    );
    const payload = (await valid.json()) as { mode: string; interpreter: string; requestId: string };
    expect(valid.status).toBe(200);
    expect(payload.mode).toBe("local");
    expect(payload.interpreter).toBe("deterministic-rules");
    expect(payload.requestId).toBe("demo-key");
  });

  it("GET/POST WhatsApp demo não enviam mensagem", async () => {
    const verify = await whatsappGet(
      new Request(
        "http://localhost/api/inbound/whatsapp?hub.mode=subscribe&hub.verify_token=supfy-demo-verify-token&hub.challenge=abc123",
      ),
    );
    expect(verify.status).toBe(200);
    expect(await verify.text()).toBe("abc123");

    const inbound = await whatsappPost(
      new Request("http://localhost/api/inbound/whatsapp", {
        method: "POST",
        body: JSON.stringify(demoWhatsAppPayload),
      }),
    );
    const body = (await inbound.json()) as { outbound: boolean; message: string };
    expect(inbound.status).toBe(200);
    expect(body.outbound).toBe(false);
    expect(body.message).toContain("leite integral");
  });
});
