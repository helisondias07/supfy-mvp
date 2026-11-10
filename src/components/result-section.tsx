import { ClipboardList, PackageCheck, ReceiptText } from "lucide-react";

const results = [
  {
    title: "Menos redigitação manual",
    description: "Mensagens deixam de ser copiadas manualmente para o sistema.",
    icon: ClipboardList,
  },
  {
    title: "Menos divergência de preço",
    description: "Todos consultam o mesmo catálogo central.",
    icon: ReceiptText,
  },
  {
    title: "Menos venda de itens indisponíveis",
    description: "O pedido é validado antes de seguir para confirmação.",
    icon: PackageCheck,
  },
];

export function ResultSection() {
  return (
    <section className="app-card mt-10 bg-white/45 p-6 sm:p-8">
      <h2 className="text-2xl font-black text-[#101828]">O que este MVP demonstra</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {results.map((item) => (
          <article key={item.title} className="app-card app-card-hover p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
              <item.icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="font-black text-[#101828]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-600">
        Não há métricas de negócio reais neste repositório. Um piloto futuro poderia medir tempo de
        digitação, pedidos sem retrabalho e tentativas de vender item indisponível — esses números
        ainda não existem aqui.
      </p>
    </section>
  );
}
