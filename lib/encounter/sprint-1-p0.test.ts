import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function source(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("RC-19A Stabilization Sprint 1 P0", () => {
  it("D1 keeps logout above the Feedback pill", () => {
    const layout = source("components/PanelLayout.tsx");
    const feedback = source(
      "components/clinical-beta/ClinicalBetaFeedbackWidget.tsx",
    );
    assert.match(layout, /data-testid="panel-logout"/);
    assert.match(layout, /mb-14/);
    assert.match(layout, /pointer-events-auto/);
    assert.match(
      feedback,
      /md:left-\[calc\(var\(--workspace-sidebar-w,16rem\)\+1rem\)\]/,
    );
  });

  it("D17 keeps camera on openWorkspaceShare without effect-dismiss races", () => {
    const page = source("app/panel/consultas/[id]/page.tsx");
    const dialog = source("components/clinical/ShareConsultationDialog.tsx");
    assert.match(page, /onShare=\{openWorkspaceShare\}/);
    assert.match(page, /onClose=\{handleCloseShare\}/);
    assert.match(
      dialog,
      /useEffect\(\(\) => \{\s*return \(\) => \{\s*clinicalWorkspaceKernel\.dismiss\("share"\);/,
    );
    assert.doesNotMatch(
      dialog,
      /onClose\]\);\s*\n\s*if \(!open\) return null/,
    );
  });

  it("D18–D19 keep sidebar clickable and back wired to consultas", () => {
    const page = source("app/panel/consultas/[id]/page.tsx");
    const css = source("app/globals.css");
    const unsaved = source(
      "components/unsaved-changes/UnsavedChangesDialog.tsx",
    );
    assert.match(page, /onBack=\{handleBackToConsultas\}/);
    assert.match(page, /router\.push\("\/panel\/consultas"\)/);
    assert.match(css, /--encounter-chrome-h,\s*0px/);
    assert.match(css, /--workspace-sidebar-w,\s*var\(--hd-sidebar-w/);
    assert.match(
      unsaved,
      /useEffect\(\(\) => \{\s*return \(\) => \{\s*clinicalWorkspaceKernel\.dismiss\("unsaved"\);/,
    );
  });
});
