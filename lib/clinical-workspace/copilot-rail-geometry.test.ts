import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { resolveCopilotRailGeometry } from "./copilot-rail-geometry";

describe("RC18 Copilot / Signature-Ready geometry", () => {
  it("anchors the drawer after the actual right edge of the rail", () => {
    const geometry = resolveCopilotRailGeometry(588.4, 1440);
    assert.deepEqual(geometry, { left: 601, width: 576 });
    assert.ok(geometry!.left > 588.4);
  });

  it("keeps Copilot inside the viewport at narrower desktop widths", () => {
    const geometry = resolveCopilotRailGeometry(763, 1280);
    assert.deepEqual(geometry, { left: 775, width: 493 });
    assert.ok(geometry!.left + geometry!.width <= 1280);
  });

  it("lets the responsive drawer use existing mobile / tablet geometry", () => {
    assert.equal(resolveCopilotRailGeometry(490, 1279), null);
    assert.equal(resolveCopilotRailGeometry(490, 768), null);
  });

  it("rejects unmeasurable and unavailable viewport geometry", () => {
    assert.equal(resolveCopilotRailGeometry(Number.NaN, 1440), null);
    assert.equal(resolveCopilotRailGeometry(1440, 1440), null);
  });
});
