import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapInteropOpenToHarness } from "./interop-api";

describe("mapInteropOpenToHarness (W4-T2 M3)", () => {
  it("maps durable open payload and forces ownsCos false", () => {
    const view = mapInteropOpenToHarness({
      workspaceId: "ws-1",
      clinicId: "clinic-a",
      persisted: true,
      connectors: [
        {
          connectorId: "c1",
          name: "Partner",
          ownsCos: true as unknown as boolean,
        },
      ],
      quarantine: [
        {
          quarantineId: "q1",
          status: "quarantined",
          resourceType: "Observation",
          ownsCos: true as unknown as boolean,
          mayConfirm: true as unknown as boolean,
        },
      ],
      exports: [
        {
          exportId: "e1",
          status: "staged",
          resourceType: "Patient",
          mayBypassHab: true as unknown as boolean,
        },
      ],
    });
    assert.equal(view.persisted, true);
    assert.equal(view.workspaceId, "ws-1");
    assert.equal(view.clinicId, "clinic-a");
    assert.equal(view.quarantineCount, 1);
    assert.equal(view.exportCount, 1);
    assert.equal(view.connectors[0].ownsCos, false);
    assert.equal(view.quarantineStatuses[0].status, "quarantined");
    assert.equal(view.exportStatuses[0].status, "staged");
    assert.match(view.message, /Durable interop/);
  });

  it("handles empty durable workspace", () => {
    const view = mapInteropOpenToHarness({
      persisted: true,
      connectors: [],
      quarantine: [],
      exports: [],
    });
    assert.equal(view.quarantineCount, 0);
    assert.equal(view.exportCount, 0);
    assert.equal(view.persisted, true);
  });
});
