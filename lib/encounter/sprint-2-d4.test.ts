import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { COPILOT_BACKDROP_CLASS } from "../clinical-workspace/visual-surfaces";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("RC-19A Sprint 2 D4 Copilot backdrop", () => {
  it("dims the Encounter more than a faint /10 wash", () => {
    assert.match(COPILOT_BACKDROP_CLASS, /bg-slate-900\/45/);
    assert.doesNotMatch(COPILOT_BACKDROP_CLASS, /\/10\b/);
  });

  it("keeps camera share on the frozen D17 pipeline", () => {
    const page = readFileSync(
      join(ROOT, "app/panel/consultas/[id]/page.tsx"),
      "utf8",
    );
    assert.match(page, /onShare=\{openWorkspaceShare\}/);
  });
});
