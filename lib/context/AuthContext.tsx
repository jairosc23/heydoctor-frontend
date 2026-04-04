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
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionRevalidating, setSessionRevalidating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    return subscribeRefreshState(setSessionRevalidating);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (!getAccessToken()) {
        await refreshAccessToken();
      }
      const me = await getMe();
      setUser(me);
      await syncMiddlewareSession();
    } catch {
      setUser(null);
      await clearMiddlewareSession();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (!getAccessToken()) {
          await refreshAccessToken();
        }
        const me = await getMe();
        if (!cancelled) {
          setUser(me);
          await syncMiddlewareSession();
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          await clearMiddlewareSession();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Si venimos del middleware (`?redirect=`) pero el refresh aún es válido,
   * volver a la ruta pedida sin quedar bloqueados en /login.
   */
  useEffect(() => {
    if (
      loading ||
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
  }, [loading, user, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await loginRequest(email, password);
        if (!getAccessToken()?.trim()) {
          throw new Error(
            "Login completó pero no hay access_token en memoria para Bearer.",
          );
        }
      } catch (e) {
        await clearMiddlewareSession();
        throw e;
      }
      try {
        await refreshUser();
      } catch (e) {
        await clearMiddlewareSession();
        setAccessToken(null);
        const detail = e instanceof Error ? e.message : String(e);
        throw new Error(
          `Inicio de sesión correcto, pero falló cargar el perfil (GET /api/auth/me): ${detail}`,
        );
      }
    },
    [refreshUser]
  );

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
