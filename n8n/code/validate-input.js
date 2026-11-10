const request = $input.first().json;
const body = request.body && typeof request.body === 'object' ? request.body : request;
const headers = request.headers ?? {};
const expectedSecret = $vars.SUPFY_WEBHOOK_SECRET;
const receivedSecret = headers['x-supfy-webhook-secret'] ?? headers['X-Supfy-Webhook-Secret'];

if (expectedSecret && receivedSecret !== expectedSecret) {
  return [{ json: { ok: false, retryable: false, statusCode: 401, error: 'Webhook não autorizado.' } }];
}

const message = body.message;
if (typeof message !== 'string' || !message.trim()) {
  return [{ json: { ok: false, retryable: false, statusCode: 400, error: 'A mensagem do pedido é obrigatória.' } }];
}

if (body.catalog !== undefined && !Array.isArray(body.catalog)) {
  return [{ json: { ok: false, retryable: false, statusCode: 400, error: 'Catálogo inválido.' } }];
}

const headerIdempotency = headers['x-idempotency-key'] ?? headers['X-Idempotency-Key'];
const requestId =
  typeof body.requestId === 'string' && body.requestId.trim()
    ? body.requestId.trim()
    : (typeof headerIdempotency === 'string' && headerIdempotency.trim() ? headerIdempotency.trim() : null);

return [{
  json: {
    ok: true,
    retryable: false,
    message: message.trim(),
    catalog: Array.isArray(body.catalog) ? body.catalog : [],
    requestId,
  },
}];
