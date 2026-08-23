import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { SHARE_CONSULTATION_ACTION_ID } from "./encounter-action-registry";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function source(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const ENCOUNTER_PAGE = "app/panel/consultas/[id]/page.tsx";
const ENCOUNTER_HEADER =
  "app/panel/consultas/[id]/_components/EncounterHeader.tsx";
const ENCOUNTER_MENU =
  "app/panel/consultas/[id]/_components/EncounterActionMenu.tsx";
const LIST_PAGE = "app/panel/consultas/page.tsx";
const OVERLAY_MANAGER =
  "lib/clinical-workspace/foundation/overlay-manager.ts";
const SHARE_DIALOG = "components/clinical/ShareConsultationDialog.tsx";
const LEGACY_ACTION_BAR = "components/clinical/ConsultationActionBar.tsx";

describe("phase 19A.1 clinical workspace closure", () => {
  it("keeps a single share-consultation pipeline from camera and overflow", () => {
    const page = source(ENCOUNTER_PAGE);
    const header = source(ENCOUNTER_HEADER);
    const menu = source(ENCOUNTER_MENU);

    assert.match(page, /onShare=\{openWorkspaceShare\}/);
    assert.match(page, /onStartTeleconsultation:\s*openWorkspaceShare/);
    assert.doesNotMatch(page, /handleStartCall/);
    assert.doesNotMatch(page, /\bstartCall\b/);
    assert.doesNotMatch(page, /router\.push\([^)]*teleconsulta/);

    assert.match(
      header,
      /case ["']share-consultation["'][\s\S]*onClick=\{onShare\}/,
    );
    assert.match(header, /resolveEncounterActions/);

    assert.match(
      menu,
      /case ["']share-consultation["'][\s\S]*onShare\?\.\(\)/,
    );
    assert.equal(SHARE_CONSULTATION_ACTION_ID, "share-consultation");
  });

  it("routes the consultas list share button through the same kernel surface", () => {
    const list = source(LIST_PAGE);
    assert.match(list, /openWorkspaceShare\(\)/);
    assert.match(list, /clinicalWorkspaceKernel\.dismiss\("share"\)/);
    assert.doesNotMatch(list, /router\.push\([^)]*teleconsulta/);
    assert.doesNotMatch(list, /setShareOpen/);
  });

  it("removes the dead ConsultationActionBar component", () => {
    assert.equal(existsSync(join(ROOT, LEGACY_ACTION_BAR)), false);
    const barrel = source("components/clinical/index.ts");
    assert.doesNotMatch(barrel, /ConsultationActionBar/);
    assert.match(barrel, /action-bar-types/);
  });

  it("locks share overlay stacking, portal, focus and scroll on the manager", () => {
    const manager = source(OVERLAY_MANAGER);
    const dialog = source(SHARE_DIALOG);

    assert.match(manager, /function backdropClassFor/);
    assert.match(manager, /document\.body\.style\.overflow = "hidden"/);
    assert.match(manager, /dataset\.hdOverlayLock/);
    assert.match(manager, /dataset\.overlayPortal/);
    assert.match(manager, /document-body/);
    assert.match(manager, /requestAnimationFrame/);
    assert.match(manager, /\[role="dialog"\]\[aria-modal="true"\]/);

    assert.match(dialog, /CLINICAL_OVERLAY_CLASS\.dialog/);
    assert.match(dialog, /pointer-events-none/);
    assert.match(dialog, /pointerEvents:\s*"auto"/);
    assert.match(dialog, /tabIndex=\{-1\}/);
    assert.match(dialog, /data-testid="share-consultation-host"/);
  });
});
