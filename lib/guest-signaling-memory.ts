/**
 * Guest Credential Channel — signaling JWT in RAM only.
 * Never cookies. Never the Staff access-token store.
 * Platform standard for all Guest telemedicine flows (ARCH-REM-01).
 */

let _guestSignalingToken: string | null = null;
let _guestConsultationId: string | null = null;

export function getGuestSignalingToken(): string | null {
  return _guestSignalingToken?.trim() ? _guestSignalingToken : null;
}

export function getGuestConsultationId(): string | null {
  return _guestConsultationId?.trim() ? _guestConsultationId : null;
}

export function setGuestSignalingToken(
  token: string | null,
  consultationId?: string | null,
): void {
  _guestSignalingToken = token?.trim() ? token.trim() : null;
  if (consultationId !== undefined) {
    _guestConsultationId = consultationId?.trim() ? consultationId.trim() : null;
  }
  if (!_guestSignalingToken) {
    _guestConsultationId = null;
  }
}

export function clearGuestSignalingToken(): void {
  _guestSignalingToken = null;
  _guestConsultationId = null;
}
