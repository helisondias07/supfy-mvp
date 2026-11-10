import { initialCatalog } from "./catalog-data";
import { demoScenarios } from "./demo-scenarios";
import { parseOrderMessage } from "./order-parser";
import { validateOrderItems } from "./order-validation";
import { extractWhatsAppTextMessage } from "./whatsapp-inbound";

export function buildDemoTranscript() {
  return demoScenarios.map((scenario) => {
    const extracted =
      scenario.source === "whatsapp-demo"
        ? extractWhatsAppTextMessage(scenario.whatsappPayload)
        : { message: scenario.message, customerName: "Cliente Demo" };

    if ("error" in extracted) {
      return {
        scenario: scenario.id,
        error: extracted.error,
      };
    }

    const items = parseOrderMessage(extracted.message);
    const validated = validateOrderItems(items, initialCatalog);

    return {
      scenario: scenario.id,
      label: scenario.label,
      source: scenario.source,
      catalog: "synthetic-demo",
      interpreter: "deterministic-rules",
      customerName: "customerName" in extracted ? extracted.customerName : "Cliente Demo",
      message: extracted.message,
      items: validated.map((item) => ({
        originalName: item.originalName,
        quantity: item.quantity,
        unit: item.unit,
        catalogProduct: item.product?.name ?? null,
        status: item.status,
        subtotal: item.subtotal,
      })),
    };
  });
}

export function formatDemoTranscript() {
  const lines = [
    "Supfy MVP — transcrição de demonstração (dados sintéticos)",
    "Interpretador: regras determinísticas. Nenhuma chamada a LLM ou n8n real.",
    "",
  ];

  for (const block of buildDemoTranscript()) {
    if ("error" in block) {
      lines.push(`# ${block.scenario}: ${block.error}`, "");
      continue;
    }
    lines.push(`# ${block.label} (${block.source})`);
    lines.push(`Mensagem: ${block.message}`);
    for (const item of block.items) {
      lines.push(
        `- ${item.quantity} ${item.unit} “${item.originalName}” → ${item.catalogProduct ?? "não encontrado"} [${item.status}]`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
