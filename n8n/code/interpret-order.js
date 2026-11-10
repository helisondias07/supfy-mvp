const input = $input.first().json;
const message = input.message;

const unitWords = ['caixas', 'caixa', 'fardos', 'fardo', 'unidades', 'unidade', 'pacotes', 'pacote', 'kg', 'quilo', 'quilos'];
const singularUnits = { caixas: 'caixa', fardos: 'fardo', unidades: 'unidade', pacotes: 'pacote', quilos: 'kg', quilo: 'kg' };

const cleanItemName = (value) => value
  .replace(/\b(bom dia|boa tarde|boa noite|oi|olá|ola|por favor|pedido foi esse|o pedido foi esse)\b/gi, ' ')
  .replace(/\b(eu quero|quero|queria|preciso|me manda|me envia|manda|envia|separa|pode separar)\b/gi, ' ')
  .replace(/\b(de|da|do|dos|das)\b/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const parseQuantity = (raw) => {
  const value = String(raw).trim();
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(value)) {
    return Number(value.replace(/\./g, '').replace(',', '.'));
  }
  return Number(value.replace(',', '.'));
};

const normalizedMessage = message
  .replace(/\s+e\s+(?=\d+)/gi, ', ')
  .replace(/;|\.(?!\d)|(?<!\d)\./g, ',');

const items = normalizedMessage
  .split(/,(?!\d)|(?<!\d),/)
  .map((part) => part.trim())
  .filter((part) => /\d/.test(part))
  .map((part, index) => {
    const unitPattern = unitWords.join('|');
    const match = part.match(new RegExp(`(\\d+(?:[.,]\\d+)*)\\s*(${unitPattern})?\\s*(?:de\\s+)?(.+)`, 'i'));
    if (!match) return null;

    const quantity = parseQuantity(match[1]);
    const receivedUnit = match[2]?.toLowerCase();
    const unit = receivedUnit ? (singularUnits[receivedUnit] ?? receivedUnit) : 'unidade';
    const originalName = cleanItemName(match[3]);
    if (!originalName || !Number.isFinite(quantity)) return null;

    return {
      id: `item-${index}`,
      originalName,
      quantity,
      unit,
      rawText: part,
    };
  })
  .filter(Boolean);

return [{
  json: {
    ok: true,
    retryable: false,
    statusCode: 200,
    items,
    requestId: input.requestId ?? null,
    interpreter: 'deterministic-rules',
  },
}];
