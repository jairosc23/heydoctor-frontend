import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AGENDA_INVALID_AVAILABILITY_WINDOW,
  assertClientAgendaWindow,
} from "./agenda-api-contract";

describe("agenda-api-contract (F2-04)", () => {
  it("accepts a valid window", () => {
    const w = assertClientAgendaWindow({
      from: "2026-07-17T00:00:00.000Z",
      to: "2026-07-18T00:00:00.000Z",
    });
    assert.equal(w.from.startsWith("2026-07-17"), true);
  });

  it("rejects inverted window", () => {
    assert.throws(
      () =>
        assertClientAgendaWindow({
          from: "2026-07-18T00:00:00.000Z",
          to: "2026-07-17T00:00:00.000Z",
        }),
      (err: Error) => err.message === AGENDA_INVALID_AVAILABILITY_WINDOW,
    );
  });
});
