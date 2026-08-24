/** Hide the public WhatsApp FAB on auth, teleconsulta, and the staff panel. */
export function shouldHideGlobalWhatsAppFab(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/teleconsulta/") ||
    pathname.startsWith("/panel")
  );
}
