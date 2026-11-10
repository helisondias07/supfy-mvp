import { describe, expect, it } from "vitest";
import { buildDemoTranscript, formatDemoTranscript } from "../demo-transcript";

describe("demonstração reproduzível", () => {
  it("percorre os cenários sintéticos sem inventar métricas de negócio", () => {
    const transcript = buildDemoTranscript();
    expect(transcript).toHaveLength(5);
    expect(transcript.every((block) => !("error" in block))).toBe(true);

    const statuses = new Set(
      transcript.flatMap((block) =>
        "items" in block && Array.isArray(block.items) ? block.items.map((item) => item.status) : [],
      ),
    );
    expect(statuses.has("Validado")).toBe(true);
    expect(statuses.has("Produto não encontrado")).toBe(true);
    expect(statuses.has("Estoque insuficiente")).toBe(true);
    expect(statuses.has("Revisão humana")).toBe(true);
  });

  it("gera transcrição textual identificada como demo", () => {
    const text = formatDemoTranscript();
    expect(text).toContain("dados sintéticos");
    expect(text).toContain("regras determinísticas");
    expect(text).not.toMatch(/400 pedidos/);
    if (process.env.SUPFY_PRINT_DEMO === "1") {
      process.stdout.write(`\n${text}\n`);
    }
  });
});
