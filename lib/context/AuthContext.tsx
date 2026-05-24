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
  cancelInFlightAuthRequests,
  forceResetRefreshState,
} from "@/lib/auth-client";
import {
  AUTH_HYDRATION_MAX_MS,
  AUTH_OVERLAY_MAX_MS,
  AUTH_REQUEST_TIMEOUT_MS,
} from "@/lib/async/auth-request-config";
import { withTimeout } from "@/lib/async/with-timeout";
import { emitAuthTelemetry } from "@/lib/auth-telemetry";
import { useAuthRuntimeStabilizer } from "@/lib/hooks/useAuthRuntimeStabilizer";
import {
  isBootstrapTimeoutError,
  shouldClearSessionOnBootstrapError,
} from "@/lib/context/auth-bootstrap";
import { shouldSkipAuthBootstrapOnMount } from "@/lib/auth-session-hints";

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

/** Invalida operaciones en vuelo tras login/logout concurrente. */
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
  const overlaySinceRef = useRef<number | null>(null);

  useEffect(() => {
    return subscribeRefreshState(setSessionRevalidating);
  }, []);

  useEffect(() => {
    void bootstrapApiCsrf();
  }, []);

  const handleOverlayRecovery = useCallback(() => {
    forceResetRefreshState();
    setSessionRevalidating(false);
  }, []);

  const handleHydrationRecovery = useCallback(() => {
    setLoading(false);
  }, []);

  useAuthRuntimeStabilizer({
    loading,
    sessionRevalidating,
    onOverlayRecovery: handleOverlayRecovery,
    onHydrationRecovery: handleHydrationRecovery,
    onStaleLoadingReset: handleHydrationRecovery,
  });

  /** Watchdog local: overlay atascado aunque emitRefreshState no haya corrido. */
  useEffect(() => {
    if (sessionRevalidating) {
      if (overlaySinceRef.current == null) {
        overlaySinceRef.current = Date.now();
      }
      const watchdogId = setTimeout(() => {
        if (overlaySinceRef.current == null) return;
        if (Date.now() - overlaySinceRef.current < AUTH_OVERLAY_MAX_MS) return;
        emitAuthTelemetry("overlay_recovery", {
          phase: "watchdog",
          durationMs: Date.now() - overlaySinceRef.current,
        });
        handleOverlayRecovery();
      }, AUTH_OVERLAY_MAX_MS);
      return () => clearTimeout(watchdogId);
    }
    overlaySinceRef.current = null;
    return undefined;
  }, [sessionRevalidating, handleOverlayRecovery]);

  const clearSession = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    await clearMiddlewareSession();
  }, []);

  const logout = useCallback(async () => {
    bumpSessionGen();
    await logoutRequest();
    await clearSession();
  }, [bumpSessionGen, clearSession]);

  const recoverFromBootstrapFailure = useCallback(() => {
    cancelInFlightAuthRequests();
    forceResetRefreshState();
    setSessionRevalidating(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    const genAtStart = sessionGen();
    const hydrationAbort = new AbortController();

    void (async () => {
      try {
        if (shouldSkipAuthBootstrapOnMount(pathname)) {
          return;
        }

        try {
          const refreshed = await withTimeout(
            refreshAccessToken({ silent: true }),
            AUTH_REQUEST_TIMEOUT_MS,
            "auth-bootstrap-refresh",
          );
          if (!refreshed) {
            if (!mounted || hydrationAbort.signal.aborted) return;
            console.warn(
              "refresh failed on mount → clear local session (no remote logout)",
            );
            await clearSession();
            return;
          }
        } catch (e) {
          if (!mounted || hydrationAbort.signal.aborted) return;
          if (isBootstrapTimeoutError(e)) {
            emitAuthTelemetry("bootstrap_timeout", {
              phase: "refresh",
              durationMs: AUTH_REQUEST_TIMEOUT_MS,
            });
            recoverFromBootstrapFailure();
          }
          if (shouldClearSessionOnBootstrapError(e, "refresh")) {
            console.warn(
              "refresh failed on mount → clear local session (no remote logout)",
              e,
            );
            await clearSession();
          }
          return;
        }

        if (!mounted || hydrationAbort.signal.aborted) return;

        try {
          const me = await withTimeout(
            getMe(),
            AUTH_REQUEST_TIMEOUT_MS,
            "auth-bootstrap-getMe",
          );
          if (!mounted || sessionGen() !== genAtStart || hydrationAbort.signal.aborted) {
            return;
          }
          setUser(me);
          const t = getAccessToken()?.trim();
          if (t) {
            await syncMiddlewareSession(t);
          }
        } catch (e) {
          if (isBootstrapTimeoutError(e)) {
            emitAuthTelemetry("bootstrap_timeout", {
              phase: "getMe",
              durationMs: AUTH_REQUEST_TIMEOUT_MS,
            });
            recoverFromBootstrapFailure();
          }
          /* NO limpiar sesión en hidratación por fallo de getMe */
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      hydrationAbort.abort();
      cancelInFlightAuthRequests();
    };
    // Solo al montar: cookies cross-site + getMe para estado inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSession, pathname, recoverFromBootstrapFailure]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onSessionCleared = () => setUser(null);
    window.addEventListener("heydoctor:session-cleared", onSessionCleared);
    return () =>
      window.removeEventListener("heydoctor:session-cleared", onSessionCleared);
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
        let refreshed = false;
        try {
          refreshed = await withTimeout(
            refreshAccessToken(),
            AUTH_REQUEST_TIMEOUT_MS,
            "refreshUser-refresh",
          );
        } catch (e) {
          if (g0 !== sessionGen()) return;
          console.warn("refreshUser: refresh threw → clear session", e);
          await clearSession();
          return;
        }
        if (!refreshed) {
          if (g0 !== sessionGen()) return;
          console.warn("refreshUser: refresh not ok → clear session");
          await clearSession();
          return;
        }
        const me = await withTimeout(
          getMe(),
          AUTH_REQUEST_TIMEOUT_MS,
          "refreshUser-getMe",
        );
        if (g0 !== sessionGen()) return;
        setUser(me);
        const t = getAccessToken()?.trim();
        if (t) {
          await syncMiddlewareSession(t);
        }
      } catch (e) {
        if (g0 !== sessionGen()) return;
        console.warn("refreshUser failed:", e);
      }
    })();
    refreshUserInFlightRef.current = p;
    p.finally(() => {
      if (refreshUserInFlightRef.current === p) {
        refreshUserInFlightRef.current = null;
      }
    });
    return p;
  }, [sessionGen, loading, clearSession]);

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
    await withTimeout(
      (async () => {
        bumpSessionGen();
        try {
          await loginRequest(email, password);
          await new Promise((res) => setTimeout(res, 150));
        } catch (e) {
          await clearMiddlewareSession();
          throw e;
        }
        try {
          const me = await getMe({ skipRefreshRetry: true });
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
      })(),
      AUTH_HYDRATION_MAX_MS,
      "login-transaction",
    );
  }, [bumpSessionGen, clearMiddlewareSession]);

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
    [user, loading, sessionRevalidating, login, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {sessionRevalidating && (
        <div
          data-heydoctor-auth-overlay="true"
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
