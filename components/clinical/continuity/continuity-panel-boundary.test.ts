import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CONTINUITY_C1_ALLOWED_CONTINUITY_IMPORTS,
  findForbiddenBoundaryHits,
} from "./continuity-panel-boundary";

const HERE = path.dirname(fileURLToPath(import.meta.url));

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

describe("PR-10 C1 Continuity Panel boundary (I4/I5)", () => {
  it("forbids Composer / Draft / write / hydration / barrel imports", () => {
    const files = walk(HERE).filter(
      (f) =>
        !f.endsWith(".test.ts") &&
        !f.endsWith("continuity-panel-boundary.ts"),
    );
    assert.ok(files.length >= 8, "expected continuity panel source files");

    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      const hits = findForbiddenBoundaryHits(src);
      assert.deepEqual(
        hits,
        [],
        `${path.basename(file)} forbidden: ${hits.join(", ")}`,
      );
      assert.equal(
        /from\s+["']@\/lib\/continuity-platform["']/.test(src),
        false,
        `${path.basename(file)} must not use continuity-platform barrel`,
      );
    }
  });

  it("documents allowed continuity-platform import", () => {
    assert.deepEqual(CONTINUITY_C1_ALLOWED_CONTINUITY_IMPORTS, [
      "@/lib/continuity-platform/types",
    ]);
  });

  it("source files do not mention Usar en Composer CTA", () => {
    for (const file of walk(HERE)) {
      if (file.endsWith(".test.ts")) continue;
      const src = fs.readFileSync(file, "utf8");
      assert.equal(
        src.includes("Usar en Composer"),
        false,
        path.basename(file),
      );
    }
  });
});
