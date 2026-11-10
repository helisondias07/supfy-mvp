const steps = [
  {
    title: "1. Mensagem",
    body: "Texto livre do simulador ou envelope sintético no formato da Cloud API do WhatsApp. Sem envio externo.",
  },
  {
    title: "2. Interpretação",
    body: "Regras determinísticas (regex e normalização). Opcionalmente o mesmo contrato via workflow n8n importável.",
  },
  {
    title: "3. Catálogo",
    body: "Preço, unidade e estoque só são decididos nesta aplicação. n8n não confirma pedido nem baixa estoque.",
  },
  {
    title: "4. Operador",
    body: "Itens válidos podem ser confirmados. Exceções vão para a fila de revisão humana desta sessão.",
  },
];

export function ArchitecturePanel() {
  return (
    <section className="app-card mt-10 p-4 sm:p-6" aria-labelledby="architecture-title">
      <h2 id="architecture-title" className="text-2xl font-black text-[#101828]">
        Como o fluxo funciona
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Este MVP não usa LLM. n8n, quando configurado, reproduz o parser de regras. Há um ponto de
        extensão documentado para trocar o node de interpretação por um modelo, desde que o contrato
        de <code className="rounded bg-white/80 px-1 py-0.5 text-xs">items</code> seja preservado.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => (
          <article key={step.title} className="app-surface p-4">
            <h3 className="font-black text-[#101828]">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
