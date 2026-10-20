import { describe, expect, it } from "vitest";
import { parseOrderMessage, quickExamples } from "../order-parser";

describe("parseOrderMessage", () => {
  it("separa itens por vírgula e por 'e' antes de número", () => {
    const items = parseOrderMessage(quickExamples[0]);
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.quantity)).toEqual([5, 10, 10]);
  });

  it("normaliza a unidade para o singular", () => {
    const [leite, , arroz] = parseOrderMessage(quickExamples[0]);
    expect(leite.unit).toBe("caixa");
    expect(arroz.unit).toBe("kg");
  });

  it("usa 'unidade' quando a mensagem não informa a unidade", () => {
    const [, refri] = parseOrderMessage(quickExamples[0]);
    expect(refri.unit).toBe("unidade");
    expect(refri.originalName).toContain("refrigerantes cola 2l");
  });

  it("remove saudações e verbos de pedido do nome do item", () => {
    const [item] = parseOrderMessage("Bom dia, me manda 3 fardos de água mineral");
    expect(item).toMatchObject({ quantity: 3, unit: "fardo", originalName: "água mineral" });
  });

  it("ignora trechos sem número", () => {
    expect(parseOrderMessage("Oi, tudo bem? Obrigado!")).toEqual([]);
  });

  it("gera ids sequenciais e mantém o texto original", () => {
    const items = parseOrderMessage(quickExamples[1]);
    expect(items[0].id).toBe("item-0");
    expect(items[0].rawText).toMatch(/20 caixas/);
  });
});
