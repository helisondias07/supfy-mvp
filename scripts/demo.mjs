import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["vitest", "run", "src/lib/__tests__/demo-transcript.test.ts"], {
  stdio: "inherit",
  env: { ...process.env, SUPFY_PRINT_DEMO: "1" },
});

process.exit(result.status ?? 1);
