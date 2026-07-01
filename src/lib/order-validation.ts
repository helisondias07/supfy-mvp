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

  return catalog
    .flatMap((product) =>
      product.aliases.map((alias) => ({
        product,
        normalizedAlias: normalize(alias),
      })),
    )
    .sort((a, b) => b.normalizedAlias.length - a.normalizedAlias.length)
    .find(({ normalizedAlias }) => normalizedName.includes(normalizedAlias))?.product;
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
      const unitNote =
        item.quantity > 0 && item.unit
          ? `O cliente pediu em ${item.unit}, mas o catálogo trabalha em ${product.unit}.`
          : "Quantidade ou unidade não foi identificada com segurança.";

      return {
        ...item,
        product,
        unitPrice: product.price,
        subtotal: 0,
        availableStock: product.stock,
        status: "Revisão humana",
        note: `${unitNote} Um operador precisa confirmar antes de seguir.`,
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
