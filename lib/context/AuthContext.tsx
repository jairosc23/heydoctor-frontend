"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  bootstrapApiCsrf,
} from "@/lib/auth-client";
import { ApiError } from "@/lib/heydoctor-api";

function isUnauthorizedError(e: unknown): boolean {
  if (e instanceof ApiError && e.status === 401) return true;
  if (
    typeof e === "object" &&
    e !== null &&
    "status" in e &&
    (e as { status: unknown }).status === 401
  ) {
    return true;
  }
  const msg =
    e instanceof Error ? e.message : typeof e === "string" ? e : String(e ?? "");
  return msg.includes("401");
}

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionRevalidating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Recarga perfil: refresh por cookies y GET /auth/me. */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Invalida `refreshUser` en vuelo para que no llame a `clearSession` tras un login concurrente. */
function useSessionGeneration() {
  const gen = useRef(0);
  const bump = useCallback(() => {
    gen.current += 1;
  }, []);
  const snapshot = useCallback(() => gen.current, []);
  return { bump, snapshot };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  /** Hidratación inicial: refresh + getMe antes de tratar “no hay usuario” en rutas protegidas. */
  const [loading, setLoading] = useState(true);
  const [sessionRevalidating, setSessionRevalidating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { bump: bumpSessionGen, snapshot: sessionGen } = useSessionGeneration();
  const refreshUserInFlightRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    return subscribeRefreshState(setSessionRevalidating);
  }, []);

  useEffect(() => {
    void bootstrapApiCsrf();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const genAtStart = sessionGen();
    void (async () => {
      try {
        await refreshAccessToken();
        const me = await getMe();
        if (cancelled || sessionGen() !== genAtStart) return;
        setUser(me);
        const t = getAccessToken()?.trim();
        if (t) {
          await syncMiddlewareSession(t);
        }
      } catch (e) {
        if (cancelled || sessionGen() !== genAtStart) return;
        if (isUnauthorizedError(e)) {
          setUser(null);
          setAccessToken(null);
          await clearMiddlewareSession();
        } else {
          console.warn("Initial auth hydrate failed (non-fatal):", e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Solo al montar: cookies cross-site + getMe para estado inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const refreshUser = useCallback(async () => {
    if (loading) {
      return;
    }
    const existing = refreshUserInFlightRef.current;
    if (existing) {
      return existing;
    }
    const g0 = sessionGen();
    const p = (async () => {
      try {
        await refreshAccessToken();
        const me = await getMe();
        if (g0 !== sessionGen()) return;
        setUser(me);
        const t = getAccessToken()?.trim();
        if (t) {
          await syncMiddlewareSession(t);
        }
      } catch (e) {
        if (g0 !== sessionGen()) return;
        if (isUnauthorizedError(e)) {
          await clearSession();
        } else {
          console.warn("refreshUser failed (no logout):", e);
        }
      }
    })();
    refreshUserInFlightRef.current = p;
    p.finally(() => {
      if (refreshUserInFlightRef.current === p) {
        refreshUserInFlightRef.current = null;
      }
    });
    return p;
  }, [clearSession, sessionGen, loading]);

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
    bumpSessionGen();
    try {
      await loginRequest(email, password);
    } catch (e) {
      await clearMiddlewareSession();
      throw e;
    }
    try {
      const me = await getMe();
      setUser(me);
      setLoading(false);
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
  }, [bumpSessionGen, clearMiddlewareSession]);

  const logout = useCallback(async () => {
    bumpSessionGen();
    await logoutRequest();
    setUser(null);
  }, [bumpSessionGen]);

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
