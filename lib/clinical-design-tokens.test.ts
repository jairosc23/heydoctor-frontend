import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clinicalCardClass,
  clinicalPanelClass,
  clinicalSurfaceClass,
  clinicalTabClass,
  CLINICAL_DEPTH_STYLES,
} from "./clinical-design-tokens";

describe("clinical-design-tokens", () => {
  it("expone estilos por nivel de profundidad clínica", () => {
    assert.ok(CLINICAL_DEPTH_STYLES[1].includes("clinical-depth-1"));
    assert.ok(CLINICAL_DEPTH_STYLES[3].includes("clinical-depth-3"));
    assert.ok(CLINICAL_DEPTH_STYLES[5].includes("clinical-depth-5"));
  });

  it("compone clases de superficie con focus y secondary", () => {
    const surface = clinicalSurfaceClass(3, {
      focusPrimary: true,
      secondary: true,
      className: "extra",
    });
    assert.match(surface, /clinical-focus-primary/);
    assert.match(surface, /clinical-depth-secondary/);
    assert.match(surface, /extra/);
  });

  it("compone panel, card y tabs del design system", () => {
    const panel = clinicalPanelClass(3, "comfortable", { focusPrimary: true });
    assert.match(panel, /clinical-panel/);
    assert.match(panel, /clinical-focus-primary/);

    const card = clinicalCardClass("custom");
    assert.match(card, /clinical-card/);
    assert.match(card, /custom/);

    const activeTab = clinicalTabClass(true);
    const inactiveTab = clinicalTabClass(false);
    assert.match(activeTab, /border-primary/);
    assert.match(inactiveTab, /border-transparent/);
  });
});
