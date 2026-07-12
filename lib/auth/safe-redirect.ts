/**
 * Post-login / middleware redirect target.
 * Only same-origin relative paths; rejects open redirects (`//evil`).
 */
export function getSafePostLoginPath(redirect: string | null | undefined): string {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/panel";
}
