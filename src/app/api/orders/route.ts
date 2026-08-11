import { NextResponse } from "next/server";
import { parseOrderMessage } from "@/lib/order-parser";
import type { ParsedOrderItem, Product } from "@/lib/types";

type OrderRequest = { message?: unknown; catalog?: unknown };
type N8nResponse = { items?: unknown };

function isParsedOrderItem(value: unknown): value is ParsedOrderItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.originalName === "string" &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    typeof item.unit === "string" &&
    typeof item.rawText === "string"
  );
}

function isProductCatalog(value: unknown): value is Product[] {
  return Array.isArray(value);
}

export async function POST(request: Request) {
  let body: OrderRequest;
  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "Informe uma mensagem de pedido." }, { status: 400 });
  }
  if (!isProductCatalog(body.catalog)) {
    return NextResponse.json({ error: "Catálogo inválido." }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ items: parseOrderMessage(body.message), mode: "local" });
  }

  try {
    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET
          ? { "X-Supfy-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({ message: body.message, catalog: body.catalog }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });

    if (!n8nResponse.ok) {
      return NextResponse.json({ error: "O workflow n8n não processou o pedido." }, { status: 502 });
    }

    const result = (await n8nResponse.json()) as N8nResponse;
    if (!Array.isArray(result.items) || !result.items.every(isParsedOrderItem)) {
      return NextResponse.json(
        { error: "O workflow n8n retornou dados em formato inválido." },
        { status: 502 },
      );
    }

    return NextResponse.json({ items: result.items, mode: "n8n" });
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar ao workflow n8n." }, { status: 502 });
  }
}
