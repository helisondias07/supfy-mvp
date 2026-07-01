import type { ParsedOrderItem } from "./types";

const unitWords = [
  "caixas",
  "caixa",
  "fardos",
  "fardo",
  "unidades",
  "unidade",
  "pacotes",
  "pacote",
  "kg",
  "quilo",
  "quilos",
];

const cleanItemName = (value: string) =>
  value
    .replace(
      /\b(bom dia|boa tarde|boa noite|oi|olá|ola|por favor|pedido foi esse|o pedido foi esse)\b/gi,
      " ",
    )
    .replace(/\b(eu quero|quero|queria|preciso|me manda|me envia|manda|envia|separa|pode separar)\b/gi, " ")
    .replace(/\b(de|da|do|dos|das)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const singularUnit = (unit: string) => {
  const normalized = unit.toLowerCase();
  const units: Record<string, string> = {
    caixas: "caixa",
    fardos: "fardo",
    unidades: "unidade",
    pacotes: "pacote",
    quilos: "kg",
    quilo: "kg",
  };

  return units[normalized] ?? normalized;
};

export const quickExamples = [
  "Me manda 5 caixas de leite integral, 10 refrigerantes cola 2L e 10 kg de arroz tipo 1.",
  "Preciso de 20 caixas de leite sem lactose e 5 fardos de água mineral.",
  "Quero 200 unidades de refrigerante cola 2L.",
];

export function parseOrderMessage(message: string): ParsedOrderItem[] {
  const normalizedMessage = message
    .replace(/\s+e\s+(?=\d+)/gi, ", ")
    .replace(/[.;]/g, ",");

  return normalizedMessage
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /\d/.test(part))
    .map((part, index) => {
      const unitPattern = unitWords.join("|");
      const match = part.match(
        new RegExp(`(\\d+(?:[,.]\\d+)?)\\s*(${unitPattern})?\\s*(?:de\\s+)?(.+)`, "i"),
      );

      if (!match) {
        return null;
      }

      const quantity = Number(match[1].replace(",", "."));
      const inferredUnit = match[2] ? singularUnit(match[2]) : "unidade";
      const itemName = cleanItemName(match[3]);

      return {
        id: `item-${index}`,
        originalName: itemName,
        quantity,
        unit: inferredUnit,
        rawText: part,
      };
    })
    .filter((item): item is ParsedOrderItem => Boolean(item?.originalName));
}
