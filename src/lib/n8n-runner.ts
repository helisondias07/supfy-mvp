import { readFileSync } from "node:fs";
import { join } from "node:path";

type N8nNode = {
  name: string;
  type: string;
  parameters?: { jsCode?: string };
};

type N8nWorkflow = {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, { main?: { node: string }[][] }>;
  active: boolean;
};

export function loadSupfyWorkflow(): N8nWorkflow {
  const path = join(process.cwd(), "n8n/supfy-process-order.workflow.json");
  return JSON.parse(readFileSync(path, "utf8")) as N8nWorkflow;
}

export function loadN8nCode(fileName: "validate-input.js" | "interpret-order.js") {
  return readFileSync(join(process.cwd(), "n8n/code", fileName), "utf8");
}

export function runN8nCode(
  jsCode: string,
  inputJson: unknown,
  vars: Record<string, string | undefined> = {},
) {
  const $input = { first: () => ({ json: inputJson }) };
  const $vars = vars;
  const execute = new Function("$input", "$vars", `${jsCode}\n`);
  const result = execute($input, $vars) as unknown;
  if (!Array.isArray(result) || !result[0] || typeof result[0] !== "object") {
    throw new Error("Node Code do n8n deve retornar [{ json }].");
  }
  return (result[0] as { json: Record<string, unknown> }).json;
}

export function runSupfyN8nInterpretation(
  message: string,
  options: {
    catalog?: unknown;
    requestId?: string;
    secret?: string;
    receivedSecret?: string;
  } = {},
) {
  const validateCode = loadN8nCode("validate-input.js");
  const interpretCode = loadN8nCode("interpret-order.js");
  const webhookEnvelope = {
    body: {
      message,
      catalog: options.catalog ?? [],
      requestId: options.requestId,
    },
    headers: {
      "x-supfy-webhook-secret": options.receivedSecret,
      "x-idempotency-key": options.requestId,
    },
  };

  const validated = runN8nCode(
    validateCode,
    webhookEnvelope,
    options.secret ? { SUPFY_WEBHOOK_SECRET: options.secret } : {},
  );

  if (!validated.ok) return validated;
  return runN8nCode(interpretCode, validated);
}
