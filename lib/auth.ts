/**
 * Utilidades de sesión legadas. El perfil real viene de useAuth() / GET /auth/me.
 */

import { logout as serviceLogout } from "./services/auth";
import { getAccessToken } from "./auth-client";

export async function logoutAndRedirectToLogin(): Promise<void> {
  await serviceLogout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export { getAccessToken };
