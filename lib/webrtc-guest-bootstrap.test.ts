import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  clearGuestSignalingToken,
  getGuestSignalingToken,
  setGuestSignalingToken,
} from "./guest-signaling-memory";
import {
  guestSignalingAuthForBootstrap,
  shouldClearGuestTokenOnTeardown,
} from "./webrtc-guest-bootstrap";

describe("guest WebRTC token lifecycle", () => {
  beforeEach(() => {
    clearGuestSignalingToken();
  });

  it("preserves the guest JWT across startCall reset and effect cleanup", () => {
    setGuestSignalingToken("guest.invite.jwt");
    assert.equal(shouldClearGuestTokenOnTeardown(true, "start_reset"), false);
    assert.equal(
      shouldClearGuestTokenOnTeardown(true, "effect_cleanup"),
      false,
    );
    if (shouldClearGuestTokenOnTeardown(true, "start_reset")) {
      clearGuestSignalingToken();
    }
    assert.equal(getGuestSignalingToken(), "guest.invite.jwt");
    const auth = guestSignalingAuthForBootstrap();
    assert.deepEqual(auth, {
      channel: "guest",
      token: "guest.invite.jwt",
    });
    assert.equal(getGuestSignalingToken(), "guest.invite.jwt");
  });

  it("clears the guest JWT only on hangup", () => {
    setGuestSignalingToken("guest.invite.jwt");
    assert.equal(shouldClearGuestTokenOnTeardown(true, "hangup"), true);
    if (shouldClearGuestTokenOnTeardown(true, "hangup")) {
      clearGuestSignalingToken();
    }
    assert.equal(getGuestSignalingToken(), null);
  });

  it("never clears guest storage on authenticated teardown", () => {
    setGuestSignalingToken("guest.invite.jwt");
    assert.equal(shouldClearGuestTokenOnTeardown(false, "start_reset"), false);
    assert.equal(shouldClearGuestTokenOnTeardown(false, "hangup"), false);
    assert.equal(getGuestSignalingToken(), "guest.invite.jwt");
  });

  it("fails closed when bootstrap runs without an invitation token", () => {
    assert.throws(
      () => guestSignalingAuthForBootstrap(),
      /Enlace de invitado inválido o expirado/,
    );
  });
});
