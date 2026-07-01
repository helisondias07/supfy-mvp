import { Clock3, History, MessageCircle, ReceiptText } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { RecentOrder } from "@/lib/types";
import { Badge } from "./ui/badge";

type RecentOrdersProps = {
  orders: RecentOrder[];
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section className="nola-card mt-10 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
            <History className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="text-2xl font-black text-[#101828]">Pedidos recentes</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Histórico temporário dos pedidos confirmados nesta sessão do navegador.
          </p>
        </div>
        <Badge tone="neutral">{orders.length} nesta sessão</Badge>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/55 p-6 text-sm text-slate-600">
          Nenhum pedido confirmado ainda. Confirme os itens válidos para registrar o pedido aqui.
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3 md:hidden">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-[var(--nola-border)] bg-white/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#101828]">{order.id}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{order.customer}</p>
                  </div>
                  <Badge tone={order.exceptionItems > 0 ? "warning" : "success"}>{order.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{order.summary}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <MobileFact label="Valor" value={formatCurrency(order.total)} />
                  <MobileFact label="Horário" value={order.createdAt} />
                  <MobileFact label="Origem" value={order.source} />
                  <MobileFact
                    label="Itens"
                    value={`${order.validItems} válidos · ${order.exceptionItems} exceções`}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <th className="border-b border-slate-200 px-3 py-3">Pedido</th>
                  <th className="border-b border-slate-200 px-3 py-3">Cliente</th>
                  <th className="border-b border-slate-200 px-3 py-3">Resumo</th>
                  <th className="border-b border-slate-200 px-3 py-3">Valor</th>
                  <th className="border-b border-slate-200 px-3 py-3">Status</th>
                  <th className="border-b border-slate-200 px-3 py-3">Origem</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="align-top transition hover:bg-white/55">
                    <td className="border-b border-slate-100 px-3 py-4">
                      <p className="font-black text-[#101828]">{order.id}</p>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden />
                        {order.createdAt}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-700">
                      {order.customer}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-4">
                      <p className="max-w-xs text-slate-700">{order.summary}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.validItems} válidos · {order.exceptionItems} exceções
                      </p>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-4">
                      <span className="inline-flex items-center gap-1.5 font-black text-[#101828]">
                        <ReceiptText className="h-4 w-4 text-coral-500" aria-hidden />
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-4">
                      <Badge tone={order.exceptionItems > 0 ? "warning" : "success"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-4">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                        <MessageCircle className="h-4 w-4 text-coral-500" aria-hidden />
                        {order.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function MobileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/75 p-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-[#101828]">{value}</p>
    </div>
  );
}
