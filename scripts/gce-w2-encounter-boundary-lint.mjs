#!/usr/bin/env node
/**
 * GCE-W2 — Encounter Runtime / plugins / encounter UI write-path boundary lint.
 * Complements lib/encounter-runtime/write-path.boundaries.test.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SCAN_DIRS = [
  path.join(ROOT, "lib/encounter-runtime"),
  path.join(ROOT, "lib/encounter-plugins"),
  path.join(ROOT, "components/clinical/encounter"),
];

const BANNED = [
  "confirmAndEmit",
  "confirm-and-emit",
  "@/lib/composer-intake",
  "lib/composer-intake",
  "applyContinuityHydrationDraft",
  "createPrescription",
  "governed-prescription-persistence-execution",
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (
      /\.(ts|tsx)$/.test(ent.name) &&
      !ent.name.endsWith(".test.ts") &&
      !ent.name.endsWith(".boundaries.test.ts")
    ) {
      out.push(p);
    }
  }
  return out;
}

let failed = false;
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = fs.readFileSync(file, "utf8");
    for (const pattern of BANNED) {
      if (src.includes(pattern)) {
        console.error(
          `FORBIDDEN "${pattern}" in ${path.relative(ROOT, file)}`,
        );
        failed = true;
      }
    }
  }
}

if (failed) {
  console.error("GCE-W2 encounter boundary lint FAILED");
  process.exit(1);
}
console.log("GCE-W2 encounter boundary lint OK");
