/**
 * Staff Credential Channel — JWT de acceso solo en RAM
 * (fallback cuando las cookies HttpOnly cross-site están bloqueadas).
 * Sin localStorage/sessionStorage persistente.
 *
 * Guest telemedicine MUST use {@link ./guest-signaling-memory} (ARCH-REM-01).
 * Never store purpose=webrtc_guest tokens here.
 */

import { invalidateJwtPayloadCache } from "./auth-token";

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken?.trim() ? _accessToken : null;
}

export function setAccessToken(token: string | null): void {
  const next = token?.trim() ? token.trim() : null;
  if (_accessToken !== next) {
    invalidateJwtPayloadCache();
  }
  _accessToken = next;
}
