import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPublicBooking } from "../services/public-booking";
import {
  bookingIntent,
  formatPreviewSlot,
  isBookingSubmitEnabled,
  slotOffsetLabel,
} from "./booking-preview";

describe("public booking preview", () => {
  it("keeps submit closed unless the flag is exactly true", () => {
    assert.equal(isBookingSubmitEnabled({}), false);
    assert.equal(
      isBookingSubmitEnabled({ BOOKING_SUBMIT_ENABLED: "false" }),
      false,
    );
    assert.equal(
      isBookingSubmitEnabled({ NEXT_PUBLIC_BOOKING_SUBMIT_ENABLED: "1" }),
      false,
    );
    assert.equal(
      isBookingSubmitEnabled({ BOOKING_SUBMIT_ENABLED: "true" }),
      true,
    );
    assert.equal(bookingIntent(false), "preview");
    assert.equal(bookingIntent(true), "submit");
  });

  it("formats Santiago slots in Spanish and keeps the DST offset", () => {
    const summer = "2026-01-15T15:00:00.000Z";
    const winter = "2026-07-15T15:00:00.000Z";
    const zone = "America/Santiago";
    assert.match(formatPreviewSlot(summer, zone), /ene/i);
    assert.match(formatPreviewSlot(summer, zone), /12:00/);
    assert.match(formatPreviewSlot(winter, zone), /jul/i);
    assert.match(formatPreviewSlot(winter, zone), /11:00/);
    assert.equal(slotOffsetLabel(summer, zone), "GMT-3");
    assert.equal(slotOffsetLabel(winter, zone), "GMT-4");
  });

  it("does not send a booking or checkout when the preview is requested", async () => {
    assert.equal(bookingIntent(isBookingSubmitEnabled({})), "preview");
    const calls: string[] = [];
    globalThis.fetch = async (input, init) => {
      calls.push(`${init?.method ?? "GET"} ${String(input)}`);
      return new Response("{}", { status: 500 });
    };
    await assert.rejects(
      () =>
        createPublicBooking("profile-slug", {
          patientName: "QA",
          patientEmail: "qa@example.com",
          startsAt: "2026-01-15T15:00:00.000Z",
          endsAt: "2026-01-15T15:30:00.000Z",
          patientCountry: "CL",
        }),
      (error: unknown) => {
        assert.equal((error as { status?: number }).status, 403);
        return true;
      },
    );
    assert.deepEqual(calls, []);
  });
});
