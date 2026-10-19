import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("RC-19A Sprint 2 D8 overflow menu", () => {
  it("portals an opaque menu that still uses the overlay dialog token", () => {
    const menu = readFileSync(
      join(ROOT, "app/panel/consultas/[id]/_components/EncounterActionMenu.tsx"),
      "utf8",
    );
    assert.match(menu, /createPortal/);
    assert.match(menu, /CLINICAL_OVERLAY_CLASS\.dialog/);
    assert.match(menu, /data-testid="encounter-overflow-menu"/);
    assert.match(menu, /isolate/);
    assert.match(menu, /bg-white/);
    assert.match(menu, /shadow-xl/);
  });
});
