"use client";

import { Edit3, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/lib/types";
import { Badge } from "./ui/badge";

type ProductCatalogProps = {
  products: Product[];
  syncPulse: boolean;
  onEditPrice: (product: Product) => void;
};

const integrationLabels = [
  "Vendedores sincronizados",
  "Clientes sincronizados",
  "Financeiro sincronizado",
];

export function ProductCatalog({ products, syncPulse, onEditPrice }: ProductCatalogProps) {
  return (
    <section className="nola-card mt-10 p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#101828]">Catálogo central de produtos</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Esta é a fonte única de verdade para produto, preço, unidade e disponibilidade.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {integrationLabels.map((label) => (
            <div
              key={label}
              className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                syncPulse
                  ? "border-coral-500 bg-coral-50 text-coral-700 ring-4 ring-coral-100"
                  : "border-[var(--nola-border)] bg-white/55 text-slate-600"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw className={`h-3.5 w-3.5 ${syncPulse ? "animate-spin" : ""}`} aria-hidden />
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <th className="border-b border-slate-200 px-3 py-3">Produto</th>
              <th className="border-b border-slate-200 px-3 py-3">Categoria</th>
              <th className="border-b border-slate-200 px-3 py-3">Unidade</th>
              <th className="border-b border-slate-200 px-3 py-3">Preço</th>
              <th className="border-b border-slate-200 px-3 py-3">Estoque disponível</th>
              <th className="border-b border-slate-200 px-3 py-3">Status</th>
              <th className="border-b border-slate-200 px-3 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="align-top transition hover:bg-white/55">
                <td className="border-b border-slate-100 px-3 py-4">
                  <p className="font-bold text-[#101828]">{product.name}</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                    Aliases: {product.aliases.join(", ")}
                  </p>
                </td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-700">
                  {product.category}
                </td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-700">
                  {product.unit}
                </td>
                <td className="border-b border-slate-100 px-3 py-4 font-bold text-slate-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-700">
                  {product.stock}
                </td>
                <td className="border-b border-slate-100 px-3 py-4">
                  <Badge tone={product.status === "Ativo" ? "success" : "warning"}>
                    {product.status}
                  </Badge>
                </td>
                <td className="border-b border-slate-100 px-3 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEditPrice(product)}
                    className="nola-button-secondary inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold"
                    aria-label={`Editar preço de ${product.name}`}
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden />
                    Editar preço
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
