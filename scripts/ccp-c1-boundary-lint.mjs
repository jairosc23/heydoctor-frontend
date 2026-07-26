#!/usr/bin/env node
/**
 * I5 — Continuity Panel C1 import boundary lint (no ESLint dependency).
 * Fails if Composer / Draft / write-path / C0 hydration imports appear.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "components/clinical/continuity");

const FORBIDDEN = [
  "@/lib/composer-intake",
  "lib/composer-intake",
  "ClinicalAssistPrefillDraft",
  "confirmAndEmit",
  "hydrateFromAssistDraft",
  "createPrescription",
  "@/lib/services/prescriptions",
  "lib/services/prescriptions",
  "renewPrescription",
  "continuity-platform/index",
  "continuity-platform/adapter",
  "continuity-platform/assert-hydration-draft",
  "continuity-platform/hydration-policy",
  "toClinicalAssistPrefillDraft",
  "assertContinuityHydrationDraft",
  "resolveContinuityHydrationGate",
  // Barrel import (quote immediately after package root)
  "@/lib/continuity-platform\"",
  "@/lib/continuity-platform'",
  "@/lib/continuity-platform`",
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
  const src = fs.readFileSync(file, "utf8");
  // Boundary definition file lists forbidden tokens — skip content checks there
  if (file.endsWith("continuity-panel-boundary.ts")) continue;
  for (const pattern of FORBIDDEN) {
    if (src.includes(pattern)) {
      console.error(`FORBIDDEN "${pattern}" in ${path.relative(ROOT, file)}`);
      failed = true;
    }
  }
  // Must not import continuity-platform barrel via bare path ending
  const barrelRe =
    /from\s+["']@\/lib\/continuity-platform["']|require\(["']@\/lib\/continuity-platform["']\)/;
  if (barrelRe.test(src)) {
    console.error(`FORBIDDEN barrel import in ${path.relative(ROOT, file)}`);
    failed = true;
  }
}

if (failed) {
  console.error("ccp-c1-boundary-lint: FAIL");
  process.exit(1);
}
console.log("ccp-c1-boundary-lint: PASS");
