/**
 * EPIC-2: persist portal invite proof from public booking create.
 * Invite is not returned on public booking status (anti-squatting).
 */

const keyFor = (bookingToken: string) => `hd_portal_invite:${bookingToken}`;

export function storePortalInvite(
  bookingToken: string,
  inviteToken: string,
): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(keyFor(bookingToken), inviteToken);
}

export function readPortalInvite(bookingToken: string): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(keyFor(bookingToken));
}
