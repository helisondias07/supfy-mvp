import { describe, expect, it } from "vitest";
import { parseOrderMessage, quickExamples } from "../order-parser";
import {
  loadN8nCode,
  loadSupfyWorkflow,
  runSupfyN8nInterpretation,
} from "../n8n-runner";

describe("workflow n8n importável", () => {
  it("mantém os nodes Code sincronizados com n8n/code/*.js", () => {
    const workflow = loadSupfyWorkflow();
    const byName = Object.fromEntries(workflow.nodes.map((node) => [node.name, node]));
    expect(byName["Validar entrada"]?.parameters?.jsCode).toBe(loadN8nCode("validate-input.js"));
    expect(byName["Interpretar pedido"]?.parameters?.jsCode).toBe(loadN8nCode("interpret-order.js"));
    expect(workflow.active).toBe(false);
  });

  it("não lança erro em entrada inválida: responde 400 não-reprocessável", () => {
    const result = runSupfyN8nInterpretation("   ");
    expect(result).toMatchObject({ ok: false, retryable: false, statusCode: 400 });
  });

  it("rejeita segredo divergente sem retry", () => {
    const result = runSupfyN8nInterpretation("5 caixas de leite", {
      secret: "esperado",
      receivedSecret: "outro",
    });
    expect(result).toMatchObject({ ok: false, retryable: false, statusCode: 401 });
  });

  it("produz o mesmo contrato de itens do parser TypeScript", () => {
    const fixtures = [
      ...quickExamples,
      "Quero 1,5 kg de arroz tipo 1 e 2,25 quilos de feijão",
      "Preciso de 1.200 unidades de refrigerante cola 2L",
    ];

    for (const message of fixtures) {
      const n8n = runSupfyN8nInterpretation(message, { requestId: "demo-1" });
      expect(n8n.ok).toBe(true);
      expect(n8n.retryable).toBe(false);
      expect(n8n.items).toEqual(parseOrderMessage(message));
    }
  });
});
