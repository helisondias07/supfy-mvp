"use client";

import { Boxes, CheckCircle2, ClipboardCheck, SendToBack } from "lucide-react";
import { formatCurrency, formatQuantityUnit } from "@/lib/formatters";
import type { ValidatedOrderItem } from "@/lib/types";
import { Badge } from "./ui/badge";

type OrderValidationPanelProps = {
  items: ValidatedOrderItem[];
  processedOnce: boolean;
  confirmationFeedback: string;
  onConfirm: () => void;
  onSendReview: () => void;
};

const statusTone = {
  Validado: "success",
  "Estoque insuficiente": "warning",
  "Produto não encontrado": "danger",
  "Revisão humana": "info",
} as const;

export function OrderValidationPanel({
  items,
  processedOnce,
  confirmationFeedback,
  onConfirm,
  onSendReview,
}: OrderValidationPanelProps) {
  const validItems = items.filter((item) => item.status === "Validado");
  const exceptionItems = items.filter((item) => item.status !== "Validado");
  const total = validItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (!processedOnce) {
    return (
      <section className="nola-card flex min-h-[560px] items-center justify-center border-dashed p-8 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-50 text-coral-500">
            <ClipboardCheck className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="mt-5 text-xl font-black text-[#101828]">Aguardando um pedido</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
            Envie uma mensagem para visualizar a validação pelo catálogo central.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="nola-card p-5">
      <div className="flex flex-col gap-4 border-b border-[var(--nola-border)] pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#101828]">Validação do pedido</h2>
          <p className="mt-1 text-sm text-slate-500">
            A IA interpreta a linguagem. O catálogo central valida preço e disponibilidade.
          </p>
        </div>
        <div className="rounded-xl bg-coral-50 p-2 text-coral-500">
          <Boxes className="h-5 w-5" aria-hidden />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <SummaryCard label="Itens" value={items.length} />
        <SummaryCard label="Válidos" value={validItems.length} tone="text-teal-700" />
        <SummaryCard label="Exceções" value={exceptionItems.length} tone="text-coral-700" />
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--nola-border)] bg-white/55 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Informado pelo cliente
                </p>
                <h3 className="mt-1 break-words text-base font-bold text-[#101828]">
                  {item.originalName || item.rawText}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Catálogo: {item.product?.name ?? "não identificado"}
                </p>
              </div>
              <Badge tone={statusTone[item.status]}>{item.status}</Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <ItemFact
                label="Quantidade"
                value={item.quantity ? formatQuantityUnit(item.quantity, item.unit) : "-"}
              />
              <ItemFact label="Preço unitário" value={formatCurrency(item.unitPrice)} />
              <ItemFact label="Subtotal válido" value={formatCurrency(item.subtotal)} />
              <ItemFact
                label="Estoque disponível"
                value={
                  item.product
                    ? formatQuantityUnit(item.availableStock, item.product.unit)
                    : String(item.availableStock)
                }
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{item.note}</p>
          </article>
        ))}
      </div>

      {confirmationFeedback ? (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="font-semibold">{confirmationFeedback}</p>
        </div>
      ) : null}

      <footer className="mt-5 flex flex-col gap-4 border-t border-[var(--nola-border)] pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-500">Total dos itens válidos</p>
          <p className="text-2xl font-black text-[#101828]">{formatCurrency(total)}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSendReview}
            disabled={exceptionItems.length === 0}
            className="nola-button-secondary inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <SendToBack className="h-4 w-4" aria-hidden />
            Enviar exceções para revisão
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={validItems.length === 0}
            className="nola-button-primary inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Confirmar itens válidos
          </button>
        </div>
      </footer>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  tone = "text-[#101828]",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="nola-surface p-3">
      <p className={`text-2xl font-black ${tone}`}>{value}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  );
}

function ItemFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/65 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 break-words font-bold text-slate-800">{value}</p>
    </div>
  );
}
