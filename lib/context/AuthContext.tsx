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
  /** Recarga perfil con cookies; `explicitAccessToken` opcional sincroniza memoria + cookie proxy Next. */
  refreshUser: (explicitAccessToken?: string) => Promise<void>;
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onSessionCleared = () => setUser(null);
    window.addEventListener("heydoctor:session-cleared", onSessionCleared);
    return () =>
      window.removeEventListener("heydoctor:session-cleared", onSessionCleared);
  }, []);

  const clearSession = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    await clearMiddlewareSession();
  }, []);

  const refreshUser = useCallback(
    async (explicitToken?: string) => {
      try {
        const t0 = explicitToken?.trim();
        if (t0) {
          setAccessToken(t0);
        } else {
          await refreshAccessToken();
        }
        const me = await getMe();
        setUser(me);
        const t = getAccessToken()?.trim();
        if (t) {
          await syncMiddlewareSession(t);
        }
      } catch {
        await clearSession();
      }
    },
    [clearSession],
  );

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
    try {
      await loginRequest(email, password);
    } catch (e) {
      await clearMiddlewareSession();
      throw e;
    }
    try {
      const me = await getMe();
      setUser(me);
      const t = getAccessToken()?.trim();
      if (t) {
        await syncMiddlewareSession(t);
      }
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
