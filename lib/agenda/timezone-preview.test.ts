import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTimezonePreview } from "./timezone-preview";

describe("timezone-preview (Agenda Enterprise Phase 7)", () => {
  it("previews equivalent times between Santiago and Madrid", () => {
    const preview = buildTimezonePreview({
      instantIso: "2026-07-20T15:00:00.000Z",
      clinicTimezone: "America/Santiago",
      compareTimezone: "Europe/Madrid",
    });
    assert.equal(preview.ok, true);
    assert.ok(preview.clinicLocal.includes("2026"));
    assert.ok(preview.compareLocal.includes("2026"));
    assert.notEqual(preview.clinicLocal, preview.compareLocal);
  });

  it("rejects invalid IANA", () => {
    const preview = buildTimezonePreview({
      clinicTimezone: "Not/AZone",
      compareTimezone: "UTC",
    });
    assert.equal(preview.ok, false);
  });
});
