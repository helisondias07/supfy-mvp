"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Boxes, Database, Info, MessagesSquare, PackageCheck } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { MetricCard } from "@/components/metric-card";
import { OrderSimulator } from "@/components/order-simulator";
import { OrderValidationPanel } from "@/components/order-validation-panel";
import { PriceEditor } from "@/components/price-editor";
import { ProductCatalog } from "@/components/product-catalog";
import { ResultSection } from "@/components/result-section";
import { ToastStack } from "@/components/ui/toast";
import { getProductStatus, initialCatalog } from "@/lib/catalog-data";
import { formatSyncTime } from "@/lib/formatters";
import { parseOrderMessage } from "@/lib/order-parser";
import { validateOrderItems } from "@/lib/order-validation";
import type { Product, ToastMessage, ValidatedOrderItem } from "@/lib/types";

const metrics = [
  {
    title: "400 pedidos/dia",
    description: "Volume atual que depende de leitura e digitação manual.",
    icon: MessagesSquare,
  },
  {
    title: "Fonte única de verdade",
    description: "Produtos, preços e disponibilidade em um mesmo lugar.",
    icon: Database,
  },
  {
    title: "Revisão humana",
    description: "Exceções continuam visíveis para o operador.",
    icon: Boxes,
  },
  {
    title: "Estoque atualizado",
    description: "A confirmação do pedido atualiza a disponibilidade.",
    icon: PackageCheck,
  },
];

const progressMessages = [
  "IA interpretando a mensagem...",
  "Identificando itens e quantidades...",
  "Consultando catálogo central...",
];

export default function Home() {
  const [catalog, setCatalog] = useState<Product[]>(initialCatalog);
  const [message, setMessage] = useState("");
  const [validatedItems, setValidatedItems] = useState<ValidatedOrderItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [processedOnce, setProcessedOnce] = useState(false);
  const [syncDate, setSyncDate] = useState<Date | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [syncPulse, setSyncPulse] = useState(false);
  const [confirmationFeedback, setConfirmationFeedback] = useState("");

  const syncLabel = useMemo(() => (syncDate ? formatSyncTime(syncDate) : "agora"), [syncDate]);

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

  function handleInterpret() {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    setConfirmationFeedback("");
    setProgressIndex(0);

    progressMessages.forEach((_, index) => {
      window.setTimeout(() => setProgressIndex(index), index * 330);
    });

    window.setTimeout(() => {
      const parsedItems = parseOrderMessage(message);
      const nextValidatedItems = validateOrderItems(parsedItems, catalog);
      setValidatedItems(nextValidatedItems);
      setProcessedOnce(true);
      setIsProcessing(false);
    }, 1050);
  }

  function handleConfirmValidItems() {
    const validItems = validatedItems.filter((item) => item.status === "Validado" && item.product);
    if (validItems.length === 0) return;

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
              status: "Revisão humana",
              note: "Item já confirmado. Novo pedido exige nova validação de estoque.",
            }
          : item,
      ),
    );
    refreshSyncVisual();
    setConfirmationFeedback(
      "Pedido confirmado. Disponibilidade atualizada para operação e atendimento.",
    );
    addToast({
      title: "Pedido confirmado",
      description: "Disponibilidade atualizada para operação e atendimento.",
      type: "success",
    });
  }

  function handleSendReview() {
    addToast({
      title: "Exceções encaminhadas",
      description: "Itens com inconsistência permanecem visíveis para revisão humana.",
      type: "info",
    });
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
      title: "Preço atualizado no catálogo central.",
      type: "success",
    });
  }

  return (
    <>
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

      <main className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-6 lg:px-8">
        <section className="pt-10">
          <div className="max-w-4xl">
            <Image
              src="/nola-logo-preto.svg"
              alt="Nola"
              width={220}
              height={106}
              priority
              className="mb-8 h-20 w-auto"
            />
            <p className="mb-5 text-sm font-extrabold text-coral-500">
              De pedidos por mensagem, para pedidos validados.
            </p>
            <h1 className="max-w-5xl text-4xl font-black leading-[1.04] text-[#101828] sm:text-6xl lg:text-7xl">
              Pedidos inteligentes para uma operação{" "}
              <span className="text-coral-500">conectada.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Protótipo de um fluxo que transforma mensagens de WhatsApp em pedidos estruturados,
              validados por um catálogo central.
            </p>
          </div>

          <div className="nola-card mt-6 flex items-start gap-3 p-4 text-[#101828]">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" aria-hidden />
            <p className="text-sm font-semibold leading-6">
              A IA organiza a mensagem. O sistema valida produto, preço, unidade e disponibilidade.
            </p>
          </div>
        </section>

        <section className="nola-section-band mt-10 p-5 sm:p-7 lg:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do MVP">
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
              onMessageChange={setMessage}
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

        <ProductCatalog products={catalog} syncPulse={syncPulse} onEditPrice={setEditingProduct} />
        <ResultSection />

        <footer className="py-8 text-center text-sm text-slate-500">
          MVP demonstrativo sem autenticação, banco de dados, WhatsApp real ou chamada externa de IA.
        </footer>
      </main>
    </>
  );
}
