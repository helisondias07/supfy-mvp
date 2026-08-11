import { NextResponse } from "next/server";
import { parseOrderMessage } from "@/lib/order-parser";
import type { ParsedOrderItem, Product } from "@/lib/types";

type OrderRequest = { message?: unknown; catalog?: unknown };
type N8nResponse = { items?: unknown };

function localOrderResponse(message: string) {
  return NextResponse.json({ items: parseOrderMessage(message), mode: "local" });
}

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
    return localOrderResponse(body.message);
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
      return localOrderResponse(body.message);
    }

    const result = (await n8nResponse.json()) as N8nResponse;
    if (!Array.isArray(result.items) || !result.items.every(isParsedOrderItem)) {
      return localOrderResponse(body.message);
    }

    return NextResponse.json({ items: result.items, mode: "n8n" });
  } catch {
    return localOrderResponse(body.message);
  }
}
