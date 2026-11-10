import { NextResponse } from "next/server";
import { extractWhatsAppTextMessage } from "@/lib/whatsapp-inbound";

const demoVerifyToken = "supfy-demo-verify-token";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim() || demoVerifyToken;

  if (mode === "subscribe" && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: "Verificação WhatsApp recusada. Use o token de demonstração local." },
    { status: 403 },
  );
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const extracted = extractWhatsAppTextMessage(payload);
  if ("error" in extracted) {
    return NextResponse.json({ error: extracted.error }, { status: 400 });
  }

  return NextResponse.json({
    source: "whatsapp-demo",
    outbound: false,
    interpreterHint: "deterministic-rules",
    customerName: extracted.customerName,
    waId: extracted.waId,
    messageId: extracted.messageId,
    message: extracted.message,
    note: "Payload sintético aceito. Nenhuma mensagem foi enviada e a Graph API não foi chamada.",
  });
}
