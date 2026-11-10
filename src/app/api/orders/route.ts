import { NextResponse } from "next/server";
import { processOrder } from "@/lib/process-order";

export async function POST(request: Request) {
  let body: { message?: unknown; catalog?: unknown; requestId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const headerRequestId = request.headers.get("x-idempotency-key");
  const result = await processOrder({
    message: body.message,
    catalog: body.catalog,
    requestId: body.requestId ?? headerRequestId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    items: result.items,
    mode: result.mode,
    interpreter: result.interpreter,
    fallbackReason: result.fallbackReason,
    requestId: result.requestId,
  });
}
