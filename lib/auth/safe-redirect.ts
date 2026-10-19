/**
 * Post-login / middleware redirect target.
 * Only same-origin relative paths; rejects open redirects (`//evil`).
 * EPIC-2: patient accounts default to `/portal` (never Staff `/panel`).
 */
export function getSafePostLoginPath(
  redirect: string | null | undefined,
  role?: string | null,
): string {
  const normalizedRole = (role ?? "").toLowerCase();
  const isPatient = normalizedRole === "patient";
  const defaultPath = isPatient ? "/portal" : "/panel";

  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    if (isPatient && (redirect === "/panel" || redirect.startsWith("/panel/"))) {
      return "/portal";
    }
    if (
      !isPatient &&
      (redirect === "/portal" || redirect.startsWith("/portal/"))
    ) {
      return defaultPath;
    }
    return redirect;
  }
  return defaultPath;
}
