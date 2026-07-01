export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const formatSyncTime = (date: Date) =>
  date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const pluralizeUnit = (unit: string, quantity: number) => {
  if (!unit) return "";
  if (quantity === 1 || unit === "kg") return unit;

  const plurals: Record<string, string> = {
    caixa: "caixas",
    unidade: "unidades",
    fardo: "fardos",
    pacote: "pacotes",
  };

  return plurals[unit] ?? `${unit}s`;
};

export const formatQuantityUnit = (quantity: number, unit: string) =>
  `${quantity} ${pluralizeUnit(unit, quantity)}`.trim();
