import { CheckCircle2, Info, X } from "lucide-react";
import type { ToastMessage } from "@/lib/types";

type ToastProps = {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
};

export function ToastStack({ messages, onDismiss }: ToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,380px)] flex-col gap-3">
      {messages.map((message) => {
        const Icon = message.type === "success" ? CheckCircle2 : Info;

        return (
          <div
            key={message.id}
            className="nola-card animate-slide-in p-4 text-slate-900 shadow-xl shadow-slate-900/10"
            role="status"
          >
            <div className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 text-coral-500" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{message.title}</p>
                {message.description ? (
                  <p className="mt-1 text-sm leading-5 text-slate-600">{message.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(message.id)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
