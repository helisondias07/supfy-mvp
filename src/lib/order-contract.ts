import type { ParsedOrderItem, Product } from "./types";

export function isParsedOrderItem(value: unknown): value is ParsedOrderItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.originalName === "string" &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    typeof item.unit === "string" &&
    typeof item.rawText === "string"
  );
}

export function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Record<string, unknown>;
  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.category === "string" &&
    typeof product.unit === "string" &&
    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    typeof product.stock === "number" &&
    Number.isFinite(product.stock) &&
    Array.isArray(product.aliases) &&
    product.aliases.every((alias) => typeof alias === "string")
  );
}

export function isProductCatalog(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every(isProduct);
}
