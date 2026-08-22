import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CLINICAL_OVERLAY_CLASS,
  CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS,
  CLINICAL_OVERLAY_DRAWER_PANEL_CLASS,
  CLINICAL_OVERLAY_LAYER_ORDER,
  CLINICAL_OVERLAY_Z,
  overlayLayerOf,
} from "./clinical-overlay-contract";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const DRAWER_SOURCES = [
  "app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx",
  "app/panel/consultas/[id]/_components/DoctorDnaDrawer.tsx",
  "app/panel/consultas/[id]/_components/action-workspace/ClinicalModuleSheet.tsx",
] as const;

const BANNED_Z = [40, 45, 51, 55, 90] as const;

describe("clinical overlay contract", () => {
  it("exposes exactly Chrome, Drawers, Navigation, Modal, Dialog, System", () => {
    assert.deepEqual(CLINICAL_OVERLAY_LAYER_ORDER, [
      "chrome",
      "drawers",
      "navigation",
      "modal",
      "dialog",
      "system",
    ]);
    assert.deepEqual(
      Object.keys(CLINICAL_OVERLAY_Z),
      [...CLINICAL_OVERLAY_LAYER_ORDER],
    );
    assert.deepEqual(
      Object.keys(CLINICAL_OVERLAY_CLASS),
      [...CLINICAL_OVERLAY_LAYER_ORDER],
    );
  });

  it("keeps Navigation above Drawers so the sidebar outranks intelligence overlays", () => {
    assert.ok(
      CLINICAL_OVERLAY_Z.navigation > CLINICAL_OVERLAY_Z.drawers,
      "navigation must stack above drawers",
    );
    assert.ok(CLINICAL_OVERLAY_Z.chrome < CLINICAL_OVERLAY_Z.drawers);
    assert.ok(CLINICAL_OVERLAY_Z.drawers < CLINICAL_OVERLAY_Z.navigation);
    assert.ok(CLINICAL_OVERLAY_Z.navigation < CLINICAL_OVERLAY_Z.modal);
    assert.ok(CLINICAL_OVERLAY_Z.modal < CLINICAL_OVERLAY_Z.dialog);
    assert.ok(CLINICAL_OVERLAY_Z.dialog < CLINICAL_OVERLAY_Z.system);
  });

  it("rejects the historical magic z-index values", () => {
    const values = Object.values(CLINICAL_OVERLAY_Z);
    for (const banned of BANNED_Z) {
      assert.ok(
        !values.includes(banned as never),
        `contract must not reuse banned z-index ${banned}`,
      );
    }
  });

  it("maps each contract value back to a named layer", () => {
    for (const layer of CLINICAL_OVERLAY_LAYER_ORDER) {
      assert.equal(overlayLayerOf(CLINICAL_OVERLAY_Z[layer]), layer);
    }
    assert.equal(overlayLayerOf(51), null);
    assert.equal(overlayLayerOf(90), null);
  });

  it("gives Copilot, Doctor DNA and Module Sheet the same drawer backdrop and panel classes", () => {
    assert.match(
      CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS,
      /clinical-overlay-drawers/,
    );
    assert.match(
      CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS,
      /clinical-overlay-clinical-content/,
    );
    assert.match(
      CLINICAL_OVERLAY_DRAWER_PANEL_CLASS,
      /clinical-overlay-drawers/,
    );
    for (const relative of DRAWER_SOURCES) {
      const source = readFileSync(join(ROOT, relative), "utf8");
      assert.match(
        source,
        /CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS/,
        `${relative} must consume the shared drawer backdrop`,
      );
      assert.match(
        source,
        /CLINICAL_OVERLAY_DRAWER_PANEL_CLASS/,
        `${relative} must consume the shared drawer panel`,
      );
      assert.doesNotMatch(source, /inset-0/);
      assert.doesNotMatch(source, /z-\[(?:40|45|51|55|90)\]/);
    }
  });

  it("keeps Feedback on System and the sidebar on Navigation", () => {
    const feedback = readFileSync(
      join(ROOT, "components/clinical-beta/ClinicalBetaFeedbackWidget.tsx"),
      "utf8",
    );
    const sidebar = readFileSync(
      join(ROOT, "components/PanelLayout.tsx"),
      "utf8",
    );
    const dialog = readFileSync(
      join(ROOT, "components/unsaved-changes/UnsavedChangesDialog.tsx"),
      "utf8",
    );
    const fullRecord = readFileSync(
      join(ROOT, "components/encounter/EncounterFullRecordOverlay.tsx"),
      "utf8",
    );
    assert.match(feedback, /CLINICAL_OVERLAY_CLASS\.system/);
    assert.doesNotMatch(feedback, /z-\[90\]/);
    assert.match(sidebar, /CLINICAL_OVERLAY_CLASS\.navigation/);
    assert.doesNotMatch(sidebar, /\bz-40\b/);
    assert.match(dialog, /CLINICAL_OVERLAY_CLASS\.dialog/);
    assert.match(fullRecord, /CLINICAL_OVERLAY_CLASS\.modal/);
  });

  it("defines only the six overlay tokens in CSS", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    for (const layer of CLINICAL_OVERLAY_LAYER_ORDER) {
      assert.match(css, new RegExp(`--hd-overlay-${layer}:\\s+${CLINICAL_OVERLAY_Z[layer]};`));
    }
    assert.doesNotMatch(css, /--hd-overlay-intelligence/);
    assert.doesNotMatch(css, /--hd-overlay-module/);
    assert.doesNotMatch(css, /--hd-overlay-full-record/);
    assert.doesNotMatch(css, /--hd-overlay-continuity/);
    assert.match(css, /\.clinical-overlay-clinical-content\s*\{/);
  });
});
