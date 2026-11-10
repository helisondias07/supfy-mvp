import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    catalog: "synthetic-demo",
    interpreter: "deterministic-rules",
    n8nConfigured: Boolean(process.env.N8N_WEBHOOK_URL?.trim()),
    note: "n8nConfigured só indica variável de ambiente. Esta rota não dispara o workflow.",
  });
}
