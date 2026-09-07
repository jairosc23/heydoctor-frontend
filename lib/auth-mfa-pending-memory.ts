/**
 * MFA pending JWT lives in RAM only. Never localStorage / sessionStorage / URL.
 */

export type MfaPendingUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

export type MfaPendingState = {
  token: string;
  mfaEnrolled: boolean;
  user: MfaPendingUser;
};

let _pending: MfaPendingState | null = null;

export function setMfaPendingState(next: MfaPendingState | null): void {
  _pending = next;
}

export function getMfaPendingState(): MfaPendingState | null {
  return _pending;
}

export function getMfaPendingToken(): string | null {
  const token = _pending?.token?.trim() ?? "";
  return token.length > 0 ? token : null;
}

export function clearMfaPendingState(): void {
  _pending = null;
}
