import type { ParsedOrderItem, Product, ValidatedOrderItem } from "./types";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const unitsMatch = (requested: string, catalogUnit: string) => {
  if (!requested) return false;
  return normalize(requested) === normalize(catalogUnit);
};

export function findProduct(itemName: string, catalog: Product[]) {
  const normalizedName = normalize(itemName);

  if (normalizedName.includes("sem lactose")) {
    return undefined;
  }

  return catalog.find((product) =>
    product.aliases.some((alias) => normalizedName.includes(normalize(alias))),
  );
}

export function validateOrderItems(
  parsedItems: ParsedOrderItem[],
  catalog: Product[],
): ValidatedOrderItem[] {
  return parsedItems.map((item) => {
    const product = findProduct(item.originalName, catalog);

    if (!product) {
      return {
        ...item,
        unitPrice: 0,
        subtotal: 0,
        availableStock: 0,
        status: "Produto não encontrado",
        note: "Não há produto correspondente no catálogo central.",
      };
    }

    if (!item.quantity || item.quantity <= 0 || !unitsMatch(item.unit, product.unit)) {
      return {
        ...item,
        product,
        unitPrice: product.price,
        subtotal: 0,
        availableStock: product.stock,
        status: "Revisão humana",
        note: "Quantidade ou unidade precisa ser confirmada por um operador.",
      };
    }

    if (item.quantity > product.stock) {
      return {
        ...item,
        product,
        unitPrice: product.price,
        subtotal: 0,
        availableStock: product.stock,
        status: "Estoque insuficiente",
        note: "A solicitação excede a disponibilidade atual.",
      };
    }

    return {
      ...item,
      product,
      unitPrice: product.price,
      subtotal: item.quantity * product.price,
      availableStock: product.stock,
      status: "Validado",
      note: "Produto, preço, unidade e estoque validados pelo catálogo.",
    };
  });
}
