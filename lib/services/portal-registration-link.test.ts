import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { patientRegistrationHref } from "./portal-registration-link";

describe("P1-B.2 patient registration link", () => {
  it("includes only the booking reference and never an invitation proof", () => {
    const href = patientRegistrationHref("booking/with ? special");
    assert.equal(href, "/portal/register?bookingToken=booking%2Fwith%20%3F%20special");
    assert.equal(new URL(href, "https://staging-app.heydoctor.health").searchParams.has("inviteToken"), false);
  });

  it("does not modify or truncate an ordinary booking UUID", () => {
    const uuid = "11111111-2222-4333-8444-555555555555";
    assert.equal(new URL(patientRegistrationHref(uuid), "https://example.org").searchParams.get("bookingToken"), uuid);
  });
});
