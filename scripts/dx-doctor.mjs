#!/usr/bin/env node
/**
 * PQ-07 — Local environment doctor (Frontend).
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const issues = [];
const warnings = [];
const ok = [];

function check(name, pass, detail) {
  if (pass) ok.push(`✔ ${name}${detail ? ` — ${detail}` : ""}`);
  else issues.push(`✖ ${name}${detail ? ` — ${detail}` : ""}`);
}

function warn(name, pass, detail) {
  if (pass) ok.push(`✔ ${name}${detail ? ` — ${detail}` : ""}`);
  else warnings.push(`⚠ ${name}${detail ? ` — ${detail}` : ""}`);
}

const nodeMajor = Number(process.versions.node.split(".")[0]);
check("Node.js >= 20", nodeMajor >= 20, `found v${process.versions.node}`);

check(
  "package-lock.json",
  existsSync(join(root, "package-lock.json")),
  "use npm ci in CI",
);

const envExample = join(root, ".env.example");
check(".env.example present", existsSync(envExample));
warn(
  ".env.local present",
  existsSync(join(root, ".env.local")),
  existsSync(join(root, ".env.local"))
    ? "found"
    : "create from .env.example for API URL",
);

check(
  "e2e/.env.e2e.example present",
  existsSync(join(root, "e2e/.env.e2e.example")),
);
warn(
  ".env.e2e for Playwright P0",
  existsSync(join(root, ".env.e2e")),
  existsSync(join(root, ".env.e2e"))
    ? "ok"
    : "optional until E2E: cp e2e/.env.e2e.example .env.e2e",
);

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
for (const script of [
  "dx:check",
  "dx:test",
  "dx:test:e2e",
  "dev",
  "start:dev",
  "test:component",
  "test:e2e:p0",
  "test:e2e:f2-01",
]) {
  check(`script "${script}"`, Boolean(pkg.scripts?.[script]));
}

check("vitest.config.ts (PQ-02)", existsSync(join(root, "vitest.config.ts")));
check(
  "Playwright config (PQ-01)",
  existsSync(join(root, "e2e/playwright.config.ts")),
);

// Honesty note: lint === typecheck today
check(
  'lint aliases typecheck (tsc --noEmit)',
  pkg.scripts?.lint === "tsc --noEmit",
  "no ESLint in npm lint yet",
);

console.log("## dx:doctor — Frontend (heydoctor-frontend)\n");
for (const line of ok) console.log(line);
if (warnings.length) {
  console.log("");
  for (const line of warnings) console.log(line);
}
if (issues.length) {
  console.log("");
  for (const line of issues) console.log(line);
  console.log(
    "\nNext: backend monorepo docs/pq-07-developer-experience.md (platform DX guide).",
  );
  process.exit(1);
}
console.log(
  warnings.length
    ? "\nHard checks passed (see warnings). Suggested: npm run dx:check"
    : "\nAll checks passed. Suggested: npm run dx:check",
);
process.exit(0);
