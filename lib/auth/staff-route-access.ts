/**
 * Edge / layout access decisions for staff vs patient surfaces.
 * JWT roles are doctor | admin | patient. Organization membership
 * (owner/admin/manager/member) is enforced by existing org RBAC, not here.
 */

export function normalizeRole(role?: string | null): string {
  return (role ?? "").toLowerCase().trim();
}

export function isPatientRole(role?: string | null): boolean {
  return normalizeRole(role) === "patient";
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === "admin";
}

const STAFF_ORG_ROLES = new Set([
  "doctor",
  "admin",
  "owner",
  "manager",
  "member",
]);

/** Staff JWT or organization membership roles that may open /organizacion. */
export function canAccessOrganizationRoute(role?: string | null): boolean {
  if (isPatientRole(role)) return false;
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return STAFF_ORG_ROLES.has(normalized);
}

export function organizationRouteRedirect(
  role?: string | null,
): "/portal" | null {
  return canAccessOrganizationRoute(role) ? null : "/portal";
}

export function isOrganizationPath(pathname: string): boolean {
  return pathname === "/organizacion" || pathname.startsWith("/organizacion/");
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isStaffHomePath(pathname: string): boolean {
  return (
    pathname.startsWith("/panel") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    isOrganizationPath(pathname)
  );
}

/**
 * Patients stay out of staff surfaces. Staff keep /organizacion.
 */
export function patientStaffSurfaceRedirect(
  pathname: string,
  role?: string | null,
): "/portal" | null {
  if (!isPatientRole(role)) return null;
  if (isStaffHomePath(pathname) || isAdminPath(pathname)) return "/portal";
  return null;
}

/**
 * Staff must not use patient portal / closure routes.
 * /organizacion is a staff surface and is not redirected.
 */
export function staffPatientSurfaceRedirect(
  pathname: string,
  role?: string | null,
): "/panel" | null {
  const normalized = normalizeRole(role);
  if (!normalized || isPatientRole(normalized)) return null;
  if (pathname.startsWith("/portal/register")) return null;
  if (pathname.startsWith("/portal") || pathname.startsWith("/cierre")) {
    return "/panel";
  }
  return null;
}

/**
 * Fail-closed: only role=admin may render /admin/*.
 * Unknown or missing role is denied.
 */
export function adminRouteRedirect(
  pathname: string,
  role?: string | null,
): "/panel" | "/portal" | null {
  if (!isAdminPath(pathname)) return null;
  if (isAdminRole(role)) return null;
  return isPatientRole(role) ? "/portal" : "/panel";
}
