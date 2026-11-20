import { describe, expect, it } from "vitest";
import { resolveCopilotRailGeometry } from "./copilot-rail-geometry";

describe("RC18 Copilot / Signature-Ready geometry", () => {
  it("anchors the drawer after the actual right edge of the rail", () => {
    const geometry = resolveCopilotRailGeometry(588.4, 1440);
    expect(geometry).toEqual({ left: 601, width: 576 });
    expect(geometry!.left).toBeGreaterThan(588.4);
  });

  it("keeps Copilot inside the viewport at narrower desktop widths", () => {
    const geometry = resolveCopilotRailGeometry(763, 1280);
    expect(geometry).toEqual({ left: 775, width: 493 });
    expect(geometry!.left + geometry!.width).toBeLessThanOrEqual(1280);
  });

  it("lets the responsive drawer use existing mobile / tablet geometry", () => {
    expect(resolveCopilotRailGeometry(490, 1279)).toBeNull();
    expect(resolveCopilotRailGeometry(490, 768)).toBeNull();
  });

  it("rejects unmeasurable and unavailable viewport geometry", () => {
    expect(resolveCopilotRailGeometry(Number.NaN, 1440)).toBeNull();
    expect(resolveCopilotRailGeometry(1440, 1440)).toBeNull();
  });
});
