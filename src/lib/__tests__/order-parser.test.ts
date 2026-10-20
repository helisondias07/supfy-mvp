import { describe, expect, it } from "vitest";
import { parseOrderMessage, parseQuantity, quickExamples } from "../order-parser";

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

describe("quantidades decimais e milhar", () => {
  it("aceita decimal com ponto", () => {
    const [item] = parseOrderMessage("Me manda 1.5 kg de arroz tipo 1");
    expect(item).toMatchObject({ quantity: 1.5, unit: "kg" });
  });

  it("aceita decimal com vírgula sem quebrar o item", () => {
    const items = parseOrderMessage("Quero 1,5 kg de arroz tipo 1 e 2,25 quilos de feijão");
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.quantity)).toEqual([1.5, 2.25]);
    expect(items[0].originalName).toBe("arroz tipo 1");
  });

  it("mistura decimais com a separação por vírgula entre itens", () => {
    const items = parseOrderMessage("2,5 kg de arroz, 3 caixas de leite integral. 0.75 kg de feijão");
    expect(items.map((i) => i.quantity)).toEqual([2.5, 3, 0.75]);
  });

  it("interpreta milhar no padrão pt-BR", () => {
    expect(parseQuantity("1.000")).toBe(1000);
    expect(parseQuantity("1.000,5")).toBe(1000.5);
    const [item] = parseOrderMessage("Preciso de 1.200 unidades de refrigerante cola 2L");
    expect(item.quantity).toBe(1200);
  });

  it("mantém inteiros simples", () => {
    expect(parseQuantity("10")).toBe(10);
  });
});
