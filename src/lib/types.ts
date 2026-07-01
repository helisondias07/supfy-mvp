import type { LucideIcon } from "lucide-react";

export type ProductStatus = "Ativo" | "Baixo estoque";

export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  aliases: string[];
  status: ProductStatus;
};

export type ParsedOrderItem = {
  id: string;
  originalName: string;
  quantity: number;
  unit: string;
  rawText: string;
};

export type OrderStatus =
  | "Validado"
  | "Estoque insuficiente"
  | "Produto não encontrado"
  | "Revisão humana";

export type ValidatedOrderItem = ParsedOrderItem & {
  product?: Product;
  unitPrice: number;
  subtotal: number;
  availableStock: number;
  status: OrderStatus;
  note: string;
};

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type: "success" | "info";
};

export type RecentOrder = {
  id: string;
  customer: string;
  source: "WhatsApp";
  createdAt: string;
  total: number;
  validItems: number;
  exceptionItems: number;
  status: "Confirmado" | "Confirmado com exceções";
  summary: string;
};

export type Metric = {
  title: string;
  description: string;
  icon: LucideIcon;
};
