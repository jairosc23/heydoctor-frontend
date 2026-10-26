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

describe("P2-E public booking → portal invitation handoff (isolated)", () => {
  it("retains invitation only in this tab, scoped to its booking token", async () => {
    const { storePortalInvite, readPortalInvite } = await import("./portal-invite-storage");
    const values = new Map<string, string>();
    const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => { values.set(key, value); },
      },
    });
    try {
      storePortalInvite("booking-A", "invite-A");
      storePortalInvite("booking-B", "invite-B");
      assert.equal(readPortalInvite("booking-A"), "invite-A");
      assert.equal(readPortalInvite("booking-B"), "invite-B");
      assert.equal(readPortalInvite("booking-C"), null);
      assert.equal(values.has("invite-A"), false);
      assert.deepEqual([...values.keys()].sort(), [
        "hd_portal_invite:booking-A",
        "hd_portal_invite:booking-B",
      ]);
    } finally {
      if (previous) Object.defineProperty(globalThis, "sessionStorage", previous);
      else Reflect.deleteProperty(globalThis, "sessionStorage");
    }
  });

  it("does not write invitations when sessionStorage is unavailable", async () => {
    const { storePortalInvite, readPortalInvite } = await import("./portal-invite-storage");
    const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
    Reflect.deleteProperty(globalThis, "sessionStorage");
    try {
      assert.doesNotThrow(() => storePortalInvite("booking", "secret"));
      assert.equal(readPortalInvite("booking"), null);
    } finally {
      if (previous) Object.defineProperty(globalThis, "sessionStorage", previous);
    }
  });
});
