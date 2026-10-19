import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

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
  "single_write_path_forbidden", // should not need W1 codes in FE runtime
];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
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

describe("GCE-W2 write-path boundaries", () => {
  it("Runtime/plugins/encounter UI must not import PE emit or Composer bridge", () => {
    const offenders: string[] = [];
    for (const dir of SCAN_DIRS) {
      for (const file of walk(dir)) {
        const src = fs.readFileSync(file, "utf8");
        for (const ban of BANNED) {
          if (src.includes(ban)) {
            offenders.push(`${path.relative(ROOT, file)}:${ban}`);
          }
        }
      }
    }
    assert.deepEqual(offenders, []);
  });
});
