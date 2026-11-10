import { Inbox } from "lucide-react";
import type { ReviewTicket } from "@/lib/types";
import { Badge } from "./ui/badge";

type ReviewQueueProps = {
  tickets: ReviewTicket[];
  onResolve: (ticketId: string) => void;
};

export function ReviewQueue({ tickets, onResolve }: ReviewQueueProps) {
  const openTickets = tickets.filter((ticket) => ticket.status === "Aberta");

  return (
    <section className="app-card mt-10 p-4 sm:p-6" aria-labelledby="review-queue-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
            <Inbox className="h-5 w-5" aria-hidden />
          </div>
          <h2 id="review-queue-title" className="text-2xl font-black text-[#101828]">
            Fila de revisão humana
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Exceções não são confirmadas automaticamente. O operador registra a fila nesta sessão;
            nada é enviado a e-mail, Slack ou WhatsApp.
          </p>
        </div>
        <Badge tone={openTickets.length ? "warning" : "neutral"}>
          {openTickets.length} em aberto
        </Badge>
      </div>

      {tickets.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/55 p-6 text-sm text-slate-600">
          Nenhuma exceção encaminhada ainda. Use “Enviar exceções para revisão” após interpretar um
          pedido com itens inválidos.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="rounded-2xl border border-[var(--app-border)] bg-white/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-black text-[#101828]">{ticket.id}</p>
                  <p className="mt-1 text-sm text-slate-500">{ticket.createdAt}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{ticket.sourceMessage}</p>
                  <ul className="mt-3 space-y-1 text-sm text-slate-600">
                    {ticket.items.map((item) => (
                      <li key={item.id}>
                        {item.originalName} — {item.status}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <Badge tone={ticket.status === "Aberta" ? "warning" : "success"}>{ticket.status}</Badge>
                  {ticket.status === "Aberta" ? (
                    <button
                      type="button"
                      onClick={() => onResolve(ticket.id)}
                      className="app-button-secondary px-3 py-2 text-xs font-bold"
                    >
                      Marcar como resolvida
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
