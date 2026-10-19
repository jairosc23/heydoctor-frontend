/**
 * Guest WebRTC token lifecycle. The invitation JWT stays in RAM until hang-up.
 * Call reset / remount must not wipe it before Socket.IO + ICE bootstrap.
 */

import { getGuestSignalingToken } from "./guest-signaling-memory";

export type CallTeardownReason = "start_reset" | "effect_cleanup" | "hangup";

export function shouldClearGuestTokenOnTeardown(
  guestCall: boolean,
  reason: CallTeardownReason,
): boolean {
  if (!guestCall) {
    return false;
  }
  return reason === "hangup";
}

/** Read the invitation JWT for Socket.IO auth. Does not delete it. */
export function guestSignalingAuthForBootstrap(): {
  channel: "guest";
  token: string;
} {
  const token = getGuestSignalingToken()?.trim() ?? "";
  if (!token) {
    throw new Error("Enlace de invitado inválido o expirado.");
  }
  return { channel: "guest", token };
}
