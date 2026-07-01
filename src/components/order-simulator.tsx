"use client";

import { Loader2, MessageSquareText, Play, Sparkles } from "lucide-react";
import { quickExamples } from "@/lib/order-parser";
import { Badge } from "./ui/badge";

type OrderSimulatorProps = {
  message: string;
  isProcessing: boolean;
  progressMessage: string;
  processedOnce: boolean;
  onMessageChange: (message: string) => void;
  onInterpret: () => void;
};

export function OrderSimulator({
  message,
  isProcessing,
  progressMessage,
  processedOnce,
  onMessageChange,
  onInterpret,
}: OrderSimulatorProps) {
  return (
    <section className="nola-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black leading-tight text-[#101828] sm:text-2xl">
            Pedido recebido
          </h2>
          <p className="mt-1 text-sm text-slate-500">Simulador de mensagem do cliente</p>
        </div>
        <div className="hidden rounded-xl bg-coral-50 p-2 text-coral-500 sm:block">
          <MessageSquareText className="h-5 w-5" aria-hidden />
        </div>
      </div>

      <div className="nola-surface mt-6 p-3 sm:p-4">
        <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-white/90 p-4 text-sm leading-6 text-slate-700 shadow-sm">
          Bom dia! Pode separar este pedido para entrega ainda hoje?
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="order-message" className="text-sm font-semibold text-[#101828]">
          Mensagem do cliente
        </label>
        <textarea
          id="order-message"
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          className="mt-2 min-h-36 w-full resize-y rounded-2xl border border-[var(--nola-border)] bg-white/80 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-coral-500 focus:ring-4 focus:ring-coral-100"
          placeholder="Ex.: Me manda 5 caixas de leite integral..."
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickExamples.map((example, index) => (
          <button
            key={example}
            type="button"
            onClick={() => onMessageChange(example)}
            className="nola-button-secondary px-3 py-2 text-xs font-semibold"
          >
            Exemplo {index + 1}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onInterpret}
          disabled={isProcessing || !message.trim()}
          className="nola-button-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
          Interpretar pedido
        </button>

        {isProcessing ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-coral-700">
            <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
            {progressMessage}
          </span>
        ) : null}
      </div>

      {processedOnce && !isProcessing ? (
        <div className="mt-4">
          <Badge tone="neutral">Modo demonstração: interpretação simulada</Badge>
        </div>
      ) : null}
    </section>
  );
}
