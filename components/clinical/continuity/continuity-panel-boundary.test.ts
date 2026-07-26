import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  findForbiddenBoundaryHits,
  isContinuityC2HandoffFile,
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

describe("PR-10/11 Continuity Panel boundary", () => {
  it("forbids writes / confirmAndEmit / Renew on all panel sources", () => {
    const files = walk(HERE).filter(
      (f) =>
        !f.endsWith(".test.ts") &&
        !f.endsWith("continuity-panel-boundary.ts"),
    );
    assert.ok(files.length >= 8);

    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      const hits = findForbiddenBoundaryHits(src, path.basename(file));
      assert.deepEqual(
        hits,
        [],
        `${path.basename(file)} forbidden: ${hits.join(", ")}`,
      );
    }
  });

  it("marks C2 handoff files", () => {
    assert.equal(isContinuityC2HandoffFile("continuity-hydration-handoff.ts"), true);
    assert.equal(isContinuityC2HandoffFile("continuity-panel-cache.ts"), false);
  });

  it("C1 sources do not contain Composer CTA label", () => {
    for (const file of walk(HERE)) {
      if (file.endsWith(".test.ts")) continue;
      const base = path.basename(file);
      if (
        base === "ContinuityHintCta.tsx" ||
        base === "ContinuityHintsSection.tsx" ||
        base === "ContinuityPanelShell.tsx"
      ) {
        continue;
      }
      const src = fs.readFileSync(file, "utf8");
      assert.equal(
        src.includes("Usar en Composer"),
        false,
        base,
      );
    }
  });
});
