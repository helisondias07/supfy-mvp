import Image from "next/image";
import { Badge } from "./ui/badge";

type AppHeaderProps = {
  syncLabel: string;
};

export function AppHeader({ syncLabel }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--nola-border)] bg-[#f2f4f7]/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/nola-logo-preto.svg"
              alt="Nola"
              width={150}
              height={72}
              priority
              className="h-9 w-auto sm:h-11"
            />
            <span className="hidden h-7 w-px bg-slate-300/80 sm:block" aria-hidden />
            <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-slate-500 sm:inline">
              DESAFIO PRÁTICO · MVP OPERACIONAL
            </span>
          </div>

          <div className="hidden flex-wrap items-center gap-3 text-sm text-slate-600 sm:flex">
            <Badge tone="info">Ambiente demonstrativo</Badge>
            <span>Última sincronização: {syncLabel}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:hidden">
          <span className="text-[0.68rem] font-extrabold uppercase leading-4 tracking-[0.18em] text-slate-500">
            DESAFIO PRÁTICO · MVP OPERACIONAL
          </span>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Badge tone="info">Ambiente demonstrativo</Badge>
            <span className="whitespace-nowrap">Última sincronização: {syncLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
