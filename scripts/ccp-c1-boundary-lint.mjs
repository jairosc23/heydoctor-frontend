#!/usr/bin/env node
/**
 * Continuity Panel C1/C2 import boundary lint.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "components/clinical/continuity");

const C2_HANDOFF = new Set([
  "continuity-hydration-handoff.ts",
  "ContinuityHintCta.tsx",
  "ContinuityPanelShell.tsx",
  "ContinuityHintsSection.tsx",
]);

const ALWAYS = [
  "confirmAndEmit",
  "createPrescription",
  "@/lib/services/prescriptions",
  "lib/services/prescriptions",
  "renewPrescription",
  "POST /prescriptions",
  "hydrateFromAssistDraft",
  "continuity-platform/index",
];

const C1_EXTRA = [
  "@/lib/composer-intake",
  "lib/composer-intake",
  "ClinicalAssistPrefillDraft",
  "continuity-platform/adapter",
  "continuity-platform/assert-hydration-draft",
  "continuity-platform/hydration-policy",
  "toClinicalAssistPrefillDraft",
  "assertContinuityHydrationDraft",
  "resolveContinuityHydrationGate",
  "applyContinuityHydrationDraft",
  "runContinuityHydrationHandoff",
];

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|js|mjs)$/.test(ent.name) && !ent.name.endsWith(".test.ts"))
      out.push(p);
  }
  return out;
}

let failed = false;
for (const file of walk(DIR)) {
  const base = path.basename(file);
  if (base === "continuity-panel-boundary.ts") continue;
  const src = fs.readFileSync(file, "utf8");
  const isC2 = C2_HANDOFF.has(base);
  for (const pattern of ALWAYS) {
    if (src.includes(pattern)) {
      console.error(`FORBIDDEN "${pattern}" in ${path.relative(ROOT, file)}`);
      failed = true;
    }
  }
  if (!isC2) {
    for (const pattern of C1_EXTRA) {
      if (src.includes(pattern)) {
        console.error(`FORBIDDEN C1 "${pattern}" in ${path.relative(ROOT, file)}`);
        failed = true;
      }
    }
  } else {
    // C2/C3 handoff files: deep imports only (apply-continuity / hint-events-client / adapter)
    if (/from\s+["']@\/lib\/composer-intake["']/.test(src)) {
      console.error(`FORBIDDEN composer-intake barrel in ${path.relative(ROOT, file)}`);
      failed = true;
    }
    if (/from\s+["']@\/lib\/continuity-platform["']/.test(src)) {
      console.error(`FORBIDDEN continuity barrel in ${path.relative(ROOT, file)}`);
      failed = true;
    }
  }
  if (/from\s+["']@\/lib\/continuity-platform["']/.test(src)) {
    console.error(`FORBIDDEN continuity barrel in ${path.relative(ROOT, file)}`);
    failed = true;
  }
}

if (failed) {
  console.error("ccp-c1-boundary-lint: FAIL");
  process.exit(1);
}
console.log("ccp-c1-boundary-lint: PASS");
