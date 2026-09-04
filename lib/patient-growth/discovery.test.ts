import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultAvailabilityWindow,
  doctorInitials,
  formatPublicSlot,
} from "./discovery";

describe("patient growth discovery helpers", () => {
  it("builds a 7-day public availability window from local midnight", () => {
    const { from, to } = defaultAvailabilityWindow();
    const start = new Date(from);
    const end = new Date(to);
    assert.equal(start.getHours(), 0);
    assert.equal(Math.round((end.getTime() - start.getTime()) / 86_400_000), 7);
  });

  it("formats initials and slot labels for the discovery cards", () => {
    assert.equal(doctorInitials("Dra. Ana Pérez"), "DA");
    assert.equal(doctorInitials("Medico"), "ME");
    assert.match(
      formatPublicSlot("2030-01-15T15:00:00.000Z", "UTC"),
      /15/,
    );
  });
});
