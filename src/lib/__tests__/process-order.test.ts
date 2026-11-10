import { describe, expect, it, vi } from "vitest";
import { initialCatalog } from "../catalog-data";
import { processOrder } from "../process-order";

const message = "5 caixas de leite integral";

describe("processOrder", () => {
  it("rejeita mensagem vazia com 400", async () => {
    const result = await processOrder({ message: "  ", catalog: initialCatalog });
    expect(result).toMatchObject({ ok: false, status: 400 });
  });

  it("rejeita catálogo incompleto com 400", async () => {
    const result = await processOrder({ message, catalog: [{ id: "x" }] });
    expect(result).toMatchObject({ ok: false, status: 400, error: "Catálogo inválido." });
  });

  it("usa parser local determinístico quando n8n não está configurado", async () => {
    const result = await processOrder(
      { message, catalog: initialCatalog, requestId: "req-local" },
      { env: {} },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mode).toBe("local");
    expect(result.interpreter).toBe("deterministic-rules");
    expect(result.items[0]).toMatchObject({ quantity: 5, unit: "caixa" });
    expect(result.requestId).toBe("req-local");
  });

  it("aceita itens válidos do n8n sem fallback", async () => {
    const items = [
      {
        id: "item-0",
        originalName: "leite integral",
        quantity: 5,
        unit: "caixa",
        rawText: "5 caixas de leite integral",
      },
    ];
    let capturedHeaders: HeadersInit | undefined;
    const fetchImpl: typeof fetch = async (_url, init) => {
      capturedHeaders = init?.headers;
      return new Response(JSON.stringify({ items, retryable: false }), { status: 200 });
    };

    const result = await processOrder(
      { message, catalog: initialCatalog, requestId: "req-n8n" },
      { env: { N8N_WEBHOOK_URL: "https://n8n.example/webhook/supfy-process-order", N8N_WEBHOOK_SECRET: "s3cret" }, fetchImpl },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mode).toBe("n8n");
    expect(capturedHeaders).toMatchObject({
      "X-Supfy-Webhook-Secret": "s3cret",
      "X-Idempotency-Key": "req-n8n",
    });
  });

  it("faz fallback visível quando o n8n falha", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 500 }));
    const result = await processOrder(
      { message, catalog: initialCatalog },
      { env: { N8N_WEBHOOK_URL: "https://n8n.example/webhook" }, fetchImpl },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mode).toBe("local");
    expect(result.fallbackReason).toContain("HTTP 500");
  });

  it("não faz fallback quando N8N_DISABLE_FALLBACK=true", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 500 }));
    const result = await processOrder(
      { message, catalog: initialCatalog },
      {
        env: { N8N_WEBHOOK_URL: "https://n8n.example/webhook", N8N_DISABLE_FALLBACK: "true" },
        fetchImpl,
      },
    );
    expect(result).toMatchObject({ ok: false, status: 502 });
  });

  it("não tenta o n8n de novo automaticamente após timeout: uma chamada, fallback local", async () => {
    const fetchImpl = vi.fn(async () => {
      const error = new Error("timeout");
      error.name = "TimeoutError";
      throw error;
    });
    const result = await processOrder(
      { message, catalog: initialCatalog },
      { env: { N8N_WEBHOOK_URL: "https://n8n.example/webhook" }, fetchImpl },
    );
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fallbackReason).toContain("Timeout");
  });
});
