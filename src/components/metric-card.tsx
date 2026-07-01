import type { Metric } from "@/lib/types";

export function MetricCard({ title, description, icon: Icon }: Metric) {
  return (
    <article className="nola-card nola-card-hover p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-base font-extrabold text-[#101828]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
