import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSafePostLoginPath } from "../auth/safe-redirect";

describe("EPIC-2 patient portal post-login routing", () => {
  it("sends patients to /portal by default", () => {
    assert.equal(getSafePostLoginPath(null, "patient"), "/portal");
    assert.equal(getSafePostLoginPath("/panel", "patient"), "/portal");
    assert.equal(getSafePostLoginPath("/panel/agenda", "patient"), "/portal");
  });

  it("keeps staff on /panel and blocks /portal deep-links", () => {
    assert.equal(getSafePostLoginPath(null, "doctor"), "/panel");
    assert.equal(getSafePostLoginPath("/portal", "doctor"), "/panel");
    assert.equal(getSafePostLoginPath("/portal/citas", "admin"), "/panel");
  });

  it("allows safe patient deep-links inside /portal", () => {
    assert.equal(
      getSafePostLoginPath("/portal/citas/abc", "patient"),
      "/portal/citas/abc",
    );
  });
});
