"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/lib/types";

type PriceEditorProps = {
  product: Product | null;
  onClose: () => void;
  onSave: (productId: string, price: number) => void;
};

export function PriceEditor({ product, onClose, onSave }: PriceEditorProps) {
  if (!product) return null;

  return <PriceEditorDialog key={product.id} product={product} onClose={onClose} onSave={onSave} />;
}

function PriceEditorDialog({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (productId: string, price: number) => void;
}) {
  const [value, setValue] = useState(String(product.price).replace(".", ","));
  const numericValue = Number(value.replace(",", "."));
  const isValid = Number.isFinite(numericValue) && numericValue > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[22px] border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-950/25">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-[#101828]">Editar preço</h3>
            <p className="mt-1 text-sm text-slate-500">{product.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar editor de preço"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-5">
          <label htmlFor="product-price" className="text-sm font-semibold text-[#101828]">
            Novo valor unitário
          </label>
          <input
            id="product-price"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            inputMode="decimal"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-coral-500 focus:bg-white focus:ring-4 focus:ring-coral-100"
          />
          <p className="mt-2 text-sm text-slate-500">
            Valor atual: {formatCurrency(product.price)}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="nola-button-secondary px-4 py-2.5 text-sm font-bold"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={() => onSave(product.id, numericValue)}
            className="nola-button-primary px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Salvar preço
          </button>
        </div>
      </div>
    </div>
  );
}
