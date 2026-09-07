/** Compact JWS shape only — never decode claims in the browser. */
const INVITE_JWT_RE =
  /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const DOCTOR_APPLY_INVITE_QUERY_PARAM = "invite";

export function resolveDoctorApplyInviteToken(
  search: string | URLSearchParams | null | undefined,
): string | null {
  if (search == null) return null;
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  const raw = params.get(DOCTOR_APPLY_INVITE_QUERY_PARAM);
  if (raw == null) return null;
  const token = raw.trim();
  if (!INVITE_JWT_RE.test(token)) return null;
  return token;
}

export function canSubmitDoctorApplication(inviteToken: string | null): boolean {
  return inviteToken != null && INVITE_JWT_RE.test(inviteToken);
}

export function buildDoctorApplyInvitePath(inviteToken: string): string {
  const params = new URLSearchParams();
  params.set(DOCTOR_APPLY_INVITE_QUERY_PARAM, inviteToken);
  return `/for-doctors/apply?${params.toString()}`;
}

/** Path + search + hash with `invite` removed. Does not touch storage. */
export function nextUrlWithoutInvite(href: string): string {
  const url = new URL(href, "https://app.heydoctor.health");
  if (!url.searchParams.has(DOCTOR_APPLY_INVITE_QUERY_PARAM)) {
    const qs = url.searchParams.toString();
    return `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`;
  }
  url.searchParams.delete(DOCTOR_APPLY_INVITE_QUERY_PARAM);
  const qs = url.searchParams.toString();
  return `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`;
}

export function stripDoctorApplyInviteFromUrl(): void {
  if (typeof window === "undefined") return;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const next = nextUrlWithoutInvite(window.location.href);
  if (next === current) return;
  window.history.replaceState(window.history.state, "", next);
}
