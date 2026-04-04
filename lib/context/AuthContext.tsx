"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  type AuthUser,
  login as loginRequest,
  logout as logoutRequest,
  getMe,
  syncMiddlewareSession,
  clearMiddlewareSession,
} from "@/lib/services/auth";
import {
  refreshAccessToken,
  getAccessToken,
  subscribeRefreshState,
  setAccessToken,
} from "@/lib/auth-client";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionRevalidating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Tras login pasar el `accessToken` devuelto para el primer GET /me sin depender solo de memoria. */
  refreshUser: (accessTokenFromLogin?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  /** Sin hidratación al mount: no refresh ni getMe al cargar (evita carreras con login). */
  const [loading, setLoading] = useState(false);
  const [sessionRevalidating, setSessionRevalidating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    return subscribeRefreshState(setSessionRevalidating);
  }, []);

  /**
   * Perfil desde el API. Si pasas `accessToken` (p. ej. recién devuelto por login), no toca refresh ni memoria previa.
   * Sin token explícito: memoria actual o una llamada a refresh (flujo normal post-carga de página, ej. payment-success).
   */
  const refreshUser = useCallback(async (accessTokenFromLogin?: string) => {
    try {
      const explicit = accessTokenFromLogin?.trim();
      if (!explicit) {
        if (!getAccessToken()) {
          await refreshAccessToken();
        }
        if (!getAccessToken()) {
          setUser(null);
          await clearMiddlewareSession();
          return;
        }
      }
      const me = await getMe(explicit || undefined);
      setUser(me);
      await syncMiddlewareSession();
    } catch {
      setUser(null);
      await clearMiddlewareSession();
    }
  }, []);

  /**
   * Tras login exitoso: `?redirect=` → ir al destino sin depender de estado async global previo.
   */
  useEffect(() => {
    if (
      !user ||
      pathname !== "/login" ||
      typeof window === "undefined"
    ) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (!params.has("redirect")) {
      return;
    }
    const raw = params.get("redirect");
    const target =
      raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/panel";
    router.replace(target);
  }, [user, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    let accessToken: string;
    try {
      const result = await loginRequest(email, password);
      accessToken = result.accessToken?.trim() ?? "";
      if (!accessToken) {
        throw new Error("Login no devolvió access_token.");
      }
    } catch (e) {
      await clearMiddlewareSession();
      throw e;
    }
    try {
      const me = await getMe(accessToken);
      setUser(me);
      await syncMiddlewareSession();
    } catch (e) {
      await clearMiddlewareSession();
      setAccessToken(null);
      const detail = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Inicio de sesión correcto, pero falló cargar el perfil (GET /api/auth/me): ${detail}`,
      );
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      sessionRevalidating,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, sessionRevalidating, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {sessionRevalidating && (
        <div
          aria-live="polite"
          aria-busy="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(2px)",
            pointerEvents: "none",
          }}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
