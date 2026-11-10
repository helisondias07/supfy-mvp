"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Database, Info, MessagesSquare, PackageCheck } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { ArchitecturePanel } from "@/components/architecture-panel";
import { MetricCard } from "@/components/metric-card";
import { OrderSimulator } from "@/components/order-simulator";
import { OrderValidationPanel } from "@/components/order-validation-panel";
import { PriceEditor } from "@/components/price-editor";
import { ProductCatalog } from "@/components/product-catalog";
import { RecentOrders } from "@/components/recent-orders";
import { ResultSection } from "@/components/result-section";
import { ReviewQueue } from "@/components/review-queue";
import { ToastStack } from "@/components/ui/toast";
import { catalogNotice, getProductStatus, initialCatalog } from "@/lib/catalog-data";
import { demoScenarios } from "@/lib/demo-scenarios";
import { formatQuantityUnit, formatSyncTime } from "@/lib/formatters";
import { parseOrderMessage } from "@/lib/order-parser";
import { validateOrderItems } from "@/lib/order-validation";
import type { Product, RecentOrder, ReviewTicket, ToastMessage, ValidatedOrderItem } from "@/lib/types";

const recentOrdersStorageKey = "supfy-mvp:recent-orders";
const reviewQueueStorageKey = "supfy-mvp:review-queue";

const metrics = [
  {
    title: "Parser determinístico",
    description: "Regex e normalização de unidades. Não há chamada a LLM neste MVP.",
    icon: MessagesSquare,
  },
  {
    title: "Catálogo sintético",
    description: "Preço, unidade e estoque só são decididos nesta aplicação.",
    icon: Database,
  },
  {
    title: "Revisão humana",
    description: "Exceções entram numa fila local. Nada é enviado para fora.",
    icon: Boxes,
  },
  {
    title: "Estoque em memória",
    description: "A confirmação atualiza disponibilidade só nesta sessão do navegador.",
    icon: PackageCheck,
  },
];

const progressMessages = [
  "Processando a mensagem...",
  "Identificando itens e quantidades...",
  "Consultando catálogo central...",
];

function readSessionJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    window.sessionStorage.removeItem(key);
    return fallback;
  }
}

export default function Home() {
  const [catalog, setCatalog] = useState<Product[]>(initialCatalog);
  const [message, setMessage] = useState("");
  const [validatedItems, setValidatedItems] = useState<ValidatedOrderItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [processedOnce, setProcessedOnce] = useState(false);
  const [processingMode, setProcessingMode] = useState<"local" | "n8n">("local");
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();
  const [inboundSource, setInboundSource] = useState<"texto" | "whatsapp-demo">("texto");
  const [customerName, setCustomerName] = useState("Cliente Demo A");
  const [syncDate, setSyncDate] = useState<Date | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [syncPulse, setSyncPulse] = useState(false);
  const [confirmationFeedback, setConfirmationFeedback] = useState("");
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(() =>
    readSessionJson(recentOrdersStorageKey, []),
  );
  const [reviewTickets, setReviewTickets] = useState<ReviewTicket[]>(() =>
    readSessionJson(reviewQueueStorageKey, []),
  );

  const syncLabel = useMemo(() => (syncDate ? formatSyncTime(syncDate) : "agora"), [syncDate]);

  useEffect(() => {
    window.sessionStorage.setItem(recentOrdersStorageKey, JSON.stringify(recentOrders));
  }, [recentOrders]);

  useEffect(() => {
    window.sessionStorage.setItem(reviewQueueStorageKey, JSON.stringify(reviewTickets));
  }, [reviewTickets]);

  function addToast(messageData: Omit<ToastMessage, "id">) {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...messageData, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function refreshSyncVisual() {
    setSyncDate(new Date());
    setSyncPulse(true);
    window.setTimeout(() => setSyncPulse(false), 1200);
  }

  function handleSelectScenario(scenarioId: string) {
    const scenario = demoScenarios.find((item) => item.id === scenarioId);
    if (!scenario) return;
    setMessage(scenario.message);
    setInboundSource(scenario.source);
    setCustomerName("Cliente Demo A");
  }

  function handleMessageChange(nextMessage: string) {
    setInboundSource("texto");
    setMessage(nextMessage);
  }

  function handleInterpret() {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    setConfirmationFeedback("");
    setFallbackReason(undefined);
    setProgressIndex(0);

    progressMessages.forEach((_, index) => {
      window.setTimeout(() => setProgressIndex(index), index * 330);
    });

    window.setTimeout(async () => {
      try {
        if (inboundSource === "whatsapp-demo") {
          const scenario = demoScenarios.find((item) => item.id === "whatsapp");
          const inbound = await fetch("/api/inbound/whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scenario?.whatsappPayload ?? { message }),
          });
          const inboundResult = (await inbound.json()) as { message?: string; error?: string };
          if (!inbound.ok || !inboundResult.message) {
            throw new Error(inboundResult.error ?? "Payload WhatsApp demo rejeitado.");
          }
        }

        const requestId = crypto.randomUUID();
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Idempotency-Key": requestId,
          },
          body: JSON.stringify({ message, catalog, requestId }),
        });
        const result = (await response.json()) as {
          items?: ReturnType<typeof parseOrderMessage>;
          mode?: "local" | "n8n";
          interpreter?: "deterministic-rules";
          fallbackReason?: string;
          error?: string;
        };
        if (!response.ok || !result.items) {
          throw new Error(result.error ?? "Não foi possível processar o pedido.");
        }
        setProcessingMode(result.mode === "n8n" ? "n8n" : "local");
        setFallbackReason(result.fallbackReason);
        setValidatedItems(validateOrderItems(result.items, catalog));
      } catch (error) {
        addToast({
          title: "Falha ao processar o pedido",
          description: error instanceof Error ? error.message : "Tente novamente.",
          type: "info",
        });
      } finally {
        setProcessedOnce(true);
        setIsProcessing(false);
      }
    }, 700);
  }

  function handleConfirmValidItems() {
    const validItems = validatedItems.filter((item) => item.status === "Validado" && item.product);
    const exceptionItems = validatedItems.filter(
      (item) => item.status !== "Validado" && item.status !== "Confirmado",
    );
    if (validItems.length === 0) return;
    const orderTotal = validItems.reduce((sum, item) => sum + item.subtotal, 0);
    const orderSummary = validItems
      .slice(0, 2)
      .map((item) => `${formatQuantityUnit(item.quantity, item.unit)} ${item.product?.name ?? item.originalName}`)
      .join(", ");
    const remainingItems = validItems.length - 2;

    setCatalog((currentCatalog) =>
      currentCatalog.map((product) => {
        const totalToDiscount = validItems
          .filter((item) => item.product?.id === product.id)
          .reduce((sum, item) => sum + item.quantity, 0);

        if (!totalToDiscount) return product;

        const nextStock = Math.max(0, product.stock - totalToDiscount);
        return {
          ...product,
          stock: nextStock,
          status: getProductStatus(nextStock),
        };
      }),
    );

    setValidatedItems((currentItems) =>
      currentItems.map((item) =>
        item.status === "Validado"
          ? {
              ...item,
              availableStock: Math.max(0, item.availableStock - item.quantity),
              status: "Confirmado",
              note: "Item confirmado nesta sessão. Novo pedido exige nova validação de estoque.",
            }
          : item,
      ),
    );
    const nextOrder: RecentOrder = {
      id: `#${String(Date.now()).slice(-5)}`,
      customer: customerName,
      source: inboundSource === "whatsapp-demo" ? "WhatsApp demo" : "Texto demo",
      createdAt: formatSyncTime(new Date()),
      total: orderTotal,
      validItems: validItems.length,
      exceptionItems: exceptionItems.length,
      status: exceptionItems.length > 0 ? "Confirmado com exceções" : "Confirmado",
      summary:
        remainingItems > 0
          ? `${orderSummary} e mais ${remainingItems} ${remainingItems === 1 ? "item" : "itens"}`
          : orderSummary,
    };
    setRecentOrders((currentOrders) => [nextOrder, ...currentOrders].slice(0, 6));
    refreshSyncVisual();
    setConfirmationFeedback(
      "Pedido confirmado nesta sessão. Disponibilidade do catálogo sintético foi atualizada em memória.",
    );
    addToast({
      title: "Pedido confirmado",
      description: "Estoque sintético atualizado apenas neste navegador.",
      type: "success",
    });
  }

  function handleSendReview() {
    const exceptionItems = validatedItems.filter(
      (item) => item.status !== "Validado" && item.status !== "Confirmado",
    );
    if (exceptionItems.length === 0) return;

    const ticket: ReviewTicket = {
      id: `REV-${String(Date.now()).slice(-5)}`,
      createdAt: formatSyncTime(new Date()),
      sourceMessage: message,
      status: "Aberta",
      items: exceptionItems,
    };
    setReviewTickets((current) => [ticket, ...current].slice(0, 8));
    addToast({
      title: "Exceções na fila de revisão",
      description: "Registro local desta sessão. Nenhuma mensagem externa foi disparada.",
      type: "info",
    });
  }

  function handleResolveTicket(ticketId: string) {
    setReviewTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: "Resolvida" } : ticket,
      ),
    );
  }

  function handleSavePrice(productId: string, price: number) {
    setCatalog((currentCatalog) =>
      currentCatalog.map((product) =>
        product.id === productId
          ? {
              ...product,
              price,
            }
          : product,
      ),
    );
    setEditingProduct(null);
    refreshSyncVisual();
    addToast({
      title: "Preço atualizado no catálogo sintético.",
      type: "success",
    });
  }

  return (
    <>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
      >
        Pular para o conteúdo
      </a>
      <AppHeader syncLabel={syncLabel} />
      <ToastStack
        messages={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
      <PriceEditor
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSavePrice}
      />

      <main id="conteudo-principal" className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
        <section className="pt-7 sm:pt-10">
          <div className="max-w-4xl">
            <p className="mb-5 text-sm font-extrabold text-coral-500">
              De pedidos por mensagem, para pedidos validados.
            </p>
            <h1 className="max-w-5xl text-4xl font-black leading-[1.04] text-[#101828] sm:text-6xl lg:text-7xl">
              Pedidos estruturados para uma operação{" "}
              <span className="text-coral-500">conferida.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Protótipo que transforma texto livre em itens de pedido, valida contra um catálogo
              sintético e deixa exceções com o operador. Parsing por regras, n8n opcional, sem LLM.
            </p>
          </div>

          <div className="app-card mt-6 flex items-start gap-3 p-4 text-[#101828]">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" aria-hidden />
            <p className="text-sm font-semibold leading-6">{catalogNotice}</p>
          </div>
        </section>

        <section className="app-section-band mt-10 p-4 sm:p-7 lg:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Capacidades do MVP">
            {metrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <OrderSimulator
              message={message}
              isProcessing={isProcessing}
              progressMessage={progressMessages[progressIndex]}
              processedOnce={processedOnce}
              processingMode={processingMode}
              interpreter="deterministic-rules"
              fallbackReason={fallbackReason}
              inboundSource={inboundSource}
              onSelectScenario={handleSelectScenario}
              onMessageChange={handleMessageChange}
              onInterpret={handleInterpret}
            />
            <OrderValidationPanel
              items={validatedItems}
              processedOnce={processedOnce}
              confirmationFeedback={confirmationFeedback}
              onConfirm={handleConfirmValidItems}
              onSendReview={handleSendReview}
            />
          </div>
        </section>

        <ArchitecturePanel />
        <ReviewQueue tickets={reviewTickets} onResolve={handleResolveTicket} />
        <RecentOrders orders={recentOrders} />
        <ProductCatalog products={catalog} syncPulse={syncPulse} onEditPrice={setEditingProduct} />
        <ResultSection />

        <footer className="py-8 text-center text-sm text-slate-500">
          Ambiente demonstrativo local. Sem deploy, sem disparo de n8n real neste repositório e sem
          dados pessoais.
        </footer>
      </main>
    </>
  );
}
