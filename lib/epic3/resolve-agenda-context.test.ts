import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickAgendaForConsultation } from "./resolve-agenda-context";

describe("EPIC-3 UC-01 resolve-agenda-context", () => {
  it("picks appointment linked to consultationId", () => {
    const slice = pickAgendaForConsultation(
      [
        {
          id: "a-other",
          consultationId: "c-other",
          reason: "Otro",
          startsAt: "2026-07-01T10:00:00.000Z",
          status: "CONFIRMED",
        },
        {
          id: "a1",
          consultationId: "c1",
          reason: "Control anual",
          startsAt: "2026-07-20T15:00:00.000Z",
          status: "CONFIRMED",
        },
      ],
      "c1",
    );
    assert.equal(slice.appointmentId, "a1");
    assert.equal(slice.reason, "Control anual");
    assert.equal(slice.startsAt, "2026-07-20T15:00:00.000Z");
  });

  it("returns empty slice when no link", () => {
    const slice = pickAgendaForConsultation(
      [{ id: "a1", reason: "X", consultationId: null }],
      "c1",
    );
    assert.equal(slice.appointmentId, null);
    assert.equal(slice.reason, null);
  });
});
