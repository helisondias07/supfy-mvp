import { isParsedOrderItem, isProductCatalog } from "./order-contract";
import { parseOrderMessage } from "./order-parser";
import type { ParsedOrderItem, Product } from "./types";

export type ProcessingMode = "local" | "n8n";

export type ProcessOrderInput = {
  message: unknown;
  catalog: unknown;
  requestId?: unknown;
};

export type ProcessOrderEnv = {
  N8N_WEBHOOK_URL?: string;
  N8N_WEBHOOK_SECRET?: string;
  N8N_DISABLE_FALLBACK?: string;
};

export type ProcessOrderSuccess = {
  ok: true;
  items: ParsedOrderItem[];
  catalog: Product[];
  mode: ProcessingMode;
  interpreter: "deterministic-rules";
  fallbackReason?: string;
  requestId: string;
};

export type ProcessOrderFailure = {
  ok: false;
  error: string;
  status: number;
};

export type ProcessOrderResult = ProcessOrderSuccess | ProcessOrderFailure;

const DEFAULT_TIMEOUT_MS = 15_000;

function newRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `req-${Date.now()}`;
}

function resolveRequestId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : newRequestId();
}

function localSuccess(
  message: string,
  catalog: Product[],
  requestId: string,
  fallbackReason?: string,
): ProcessOrderSuccess {
  return {
    ok: true,
    items: parseOrderMessage(message),
    catalog,
    mode: "local",
    interpreter: "deterministic-rules",
    fallbackReason,
    requestId,
  };
}

function shouldDisableFallback(env: ProcessOrderEnv) {
  return env.N8N_DISABLE_FALLBACK === "true";
}

function readEnv(env: ProcessOrderEnv | NodeJS.ProcessEnv): ProcessOrderEnv {
  return {
    N8N_WEBHOOK_URL: env.N8N_WEBHOOK_URL,
    N8N_WEBHOOK_SECRET: env.N8N_WEBHOOK_SECRET,
    N8N_DISABLE_FALLBACK: env.N8N_DISABLE_FALLBACK,
  };
}

export async function processOrder(
  input: ProcessOrderInput,
  options: {
    env?: ProcessOrderEnv | NodeJS.ProcessEnv;
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
  } = {},
): Promise<ProcessOrderResult> {
  const env = readEnv(options.env ?? process.env);
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const requestId = resolveRequestId(input.requestId);

  if (typeof input.message !== "string" || !input.message.trim()) {
    return { ok: false, status: 400, error: "Informe uma mensagem de pedido." };
  }
  if (!isProductCatalog(input.catalog)) {
    return { ok: false, status: 400, error: "Catálogo inválido." };
  }

  const message = input.message.trim();
  const catalog = input.catalog;
  const webhookUrl = env.N8N_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return localSuccess(message, catalog, requestId);
  }

  try {
    const n8nResponse = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": requestId,
        ...(env.N8N_WEBHOOK_SECRET
          ? { "X-Supfy-Webhook-Secret": env.N8N_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({
        message,
        catalog,
        requestId,
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!n8nResponse.ok) {
      const fallbackReason = `n8n respondeu HTTP ${n8nResponse.status}`;
      if (shouldDisableFallback(env)) {
        return { ok: false, status: 502, error: fallbackReason };
      }
      return localSuccess(message, catalog, requestId, fallbackReason);
    }

    const result = (await n8nResponse.json()) as { items?: unknown; retryable?: unknown };

    if (!Array.isArray(result.items) || !result.items.every(isParsedOrderItem)) {
      const fallbackReason = "Resposta do n8n fora do contrato de itens.";
      if (shouldDisableFallback(env)) {
        return { ok: false, status: 502, error: fallbackReason };
      }
      return localSuccess(message, catalog, requestId, fallbackReason);
    }

    return {
      ok: true,
      items: result.items,
      catalog,
      mode: "n8n",
      interpreter: "deterministic-rules",
      requestId,
    };
  } catch (error) {
    const fallbackReason =
      error instanceof Error && error.name === "TimeoutError"
        ? "Timeout de 15s ao chamar o n8n."
        : "Falha de rede ou n8n indisponível.";

    if (shouldDisableFallback(env)) {
      return { ok: false, status: 503, error: fallbackReason };
    }

    return localSuccess(message, catalog, requestId, fallbackReason);
  }
}
