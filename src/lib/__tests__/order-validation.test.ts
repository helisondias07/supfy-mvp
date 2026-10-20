import { describe, expect, it } from "vitest";
import { initialCatalog } from "../catalog-data";
import { parseOrderMessage } from "../order-parser";
import { findProduct, validateOrderItems } from "../order-validation";

const validate = (msg: string) => validateOrderItems(parseOrderMessage(msg), initialCatalog);

describe("findProduct", () => {
  it("encontra produto pelo alias mais específico", () => {
    expect(findProduct("leite integral", initialCatalog)?.id).toBe("P-001");
  });

  it("não confunde 'leite sem lactose' com leite integral", () => {
    expect(findProduct("leite sem lactose", initialCatalog)).toBeUndefined();
  });
});

describe("validateOrderItems", () => {
  it("valida item conhecido e calcula subtotal pelo preço do catálogo", () => {
    const [item] = validate("5 caixas de leite integral");
    expect(item.status).toBe("Validado");
    expect(item.subtotal).toBeCloseTo(5 * 6.9);
  });

  it("marca produto inexistente", () => {
    const [item] = validate("2 caixas de leite sem lactose");
    expect(item.status).toBe("Produto não encontrado");
    expect(item.subtotal).toBe(0);
  });

  it("bloqueia quantidade acima do estoque", () => {
    const [item] = validate("200 unidades de refrigerante cola 2L");
    expect(item.status).toBe("Estoque insuficiente");
  });

  it("manda para revisão humana quando a unidade não é aceita", () => {
    const [item] = validate("3 kg de leite integral");
    expect(item.status).toBe("Revisão humana");
    expect(item.note).toContain("kg");
  });
});
