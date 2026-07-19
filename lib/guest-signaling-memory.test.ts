import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { getAccessToken, setAccessToken } from "./auth-access-memory";
import {
  clearGuestSignalingToken,
  getGuestConsultationId,
  getGuestSignalingToken,
  setGuestSignalingToken,
} from "./guest-signaling-memory";

describe("Credential Channels isolation (ARCH-REM-01)", () => {
  beforeEach(() => {
    clearGuestSignalingToken();
    setAccessToken(null);
  });

  it("keeps Guest and Staff stores independent", () => {
    setAccessToken("staff.jwt");
    setGuestSignalingToken(
      "guest.jwt",
      "66666666-6666-4666-8666-666666666666",
    );

    assert.equal(getAccessToken(), "staff.jwt");
    assert.equal(getGuestSignalingToken(), "guest.jwt");
    assert.equal(
      getGuestConsultationId(),
      "66666666-6666-4666-8666-666666666666",
    );

    setAccessToken(null);
    assert.equal(getGuestSignalingToken(), "guest.jwt");

    clearGuestSignalingToken();
    assert.equal(getAccessToken(), null);
    assert.equal(getGuestSignalingToken(), null);
  });
});
