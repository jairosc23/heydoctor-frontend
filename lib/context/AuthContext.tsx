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
import { usePathname } from "next/navigation";
import {
  type AuthUser,
  login as loginRequest,
  logout as logoutRequest,
  getMe,
  ensureMiddlewareSessionForSsr,
  clearMiddlewareSession,
} from "@/lib/services/auth";
import {
  refreshAccessToken,
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
import {
  hasLikelySession,
  shouldSkipAuthBootstrapOnMount,
} from "@/lib/auth-session-hints";
import {
  detectSsrClientAuthMismatch,
  emitUnexpectedLogoutIfNeeded,
  markUserInitiatedLogout,
  recordBootstrapCompleted,
} from "@/lib/session-analytics";
import { ApiError } from "@/lib/heydoctor-api";
import { getLogger } from "@/lib/logger";
import { getSafePostLoginPath } from "@/lib/auth/safe-redirect";

const logAuth = getLogger("AUTH");
const logSsr = getLogger("SSR");

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
  login: (email: string, password: string) => Promise<AuthUser>;
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
  const { bump: bumpSessionGen, snapshot: sessionGen } = useSessionGeneration();
  const refreshUserInFlightRef = useRef<Promise<void> | null>(null);
  const overlaySinceRef = useRef<number | null>(null);
  /** Una sola hidratación refresh+getMe por ciclo de sesión (no re-disparar en cada pathname). */
  const authBootstrappedRef = useRef(false);

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

  const clearSession = useCallback(
    async (options?: { expected?: boolean }) => {
      if (!options?.expected) {
        emitUnexpectedLogoutIfNeeded({ phase: "clear_session" });
      }
      setUser(null);
      setAccessToken(null);
      authBootstrappedRef.current = false;
      await clearMiddlewareSession();
    },
    [],
  );

  const logout = useCallback(async () => {
    bumpSessionGen();
    markUserInitiatedLogout();
    await logoutRequest();
    await clearSession({ expected: true });
  }, [bumpSessionGen, clearSession]);

  const recoverFromBootstrapFailure = useCallback(() => {
    cancelInFlightAuthRequests();
    forceResetRefreshState();
    setSessionRevalidating(false);
  }, []);

  useEffect(() => {
    return () => {
      cancelInFlightAuthRequests();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const genAtStart = sessionGen();
    const hydrationAbort = new AbortController();

    if (shouldSkipAuthBootstrapOnMount(pathname)) {
      setLoading(false);
      return () => {
        mounted = false;
        hydrationAbort.abort();
      };
    }

    if (authBootstrappedRef.current) {
      setLoading(false);
      return () => {
        mounted = false;
        hydrationAbort.abort();
      };
    }
    authBootstrappedRef.current = true;
    const bootstrapStartedAt = Date.now();
    let bootstrapHadUser = false;

    void (async () => {
      try {
        try {
          const refreshed = await withTimeout(
            refreshAccessToken({ silent: true }),
            AUTH_REQUEST_TIMEOUT_MS,
            "auth-bootstrap-refresh",
          );
          if (!refreshed) {
            if (!mounted || hydrationAbort.signal.aborted) return;
            logAuth.warn("bootstrap refresh returned false; clearing local session", {
              phase: "bootstrap",
              step: "refresh",
            });
            await clearSession({ expected: true });
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
            logAuth.warn("bootstrap refresh failed; clearing local session", {
              phase: "bootstrap",
              step: "refresh",
              error: e instanceof Error ? e.message : String(e),
            });
            await clearSession({ expected: true });
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
          bootstrapHadUser = true;
          await ensureMiddlewareSessionForSsr();
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
          recordBootstrapCompleted(Date.now() - bootstrapStartedAt, {
            pathname: pathname ?? "/",
            hasUser: bootstrapHadUser,
          });
        }
      }
    })();

    return () => {
      mounted = false;
      hydrationAbort.abort();
    };
  }, [clearSession, pathname, recoverFromBootstrapFailure, sessionGen]);

  useEffect(() => {
    if (loading) return;
    if (shouldSkipAuthBootstrapOnMount(pathname)) return;
    detectSsrClientAuthMismatch({
      pathname: pathname ?? "/",
      hasAccessTokenInRam: hasLikelySession(),
      loading: false,
      hasUser: Boolean(user),
    });
  }, [loading, pathname, user]);

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
            refreshAccessToken({ silent: true }),
            AUTH_REQUEST_TIMEOUT_MS,
            "refreshUser-refresh",
          );
        } catch (e) {
          if (g0 !== sessionGen()) return;
          if (isUnauthorizedError(e)) {
            await clearSession();
          } else {
            logAuth.warn("refreshUser: refresh threw (no logout)", {
              error: e instanceof Error ? e.message : String(e),
            });
          }
          return;
        }
        if (!refreshed) {
          if (g0 !== sessionGen()) return;
          logAuth.warn("refreshUser: refresh returned false (no logout)");
          return;
        }
        const me = await withTimeout(
          getMe(),
          AUTH_REQUEST_TIMEOUT_MS,
          "refreshUser-getMe",
        );
        if (g0 !== sessionGen()) return;
        setUser(me);
        await ensureMiddlewareSessionForSsr();
      } catch (e) {
        if (g0 !== sessionGen()) return;
        if (isUnauthorizedError(e)) {
          await clearSession();
        } else {
          logAuth.warn("refreshUser failed (no logout)", {
            error: e instanceof Error ? e.message : String(e),
          });
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
  }, [sessionGen, loading, clearSession]);

  /**
   * Sesión API válida en /login: sincronizar cookie SSR y navegar con recarga completa.
   */
  useEffect(() => {
    if (!user || pathname !== "/login" || typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    // EPIC-2: role is required — omitting it defaults patients to Staff /panel.
    const target = getSafePostLoginPath(
      params.has("redirect") ? params.get("redirect") : null,
      user.role,
    );

    let cancelled = false;
    void (async () => {
      try {
        await ensureMiddlewareSessionForSsr();
        if (cancelled) return;
        window.location.assign(target);
      } catch (e) {
        logSsr.warn("SSR session sync before redirect failed", {
          phase: "post-login-redirect",
          error: e instanceof Error ? e.message : String(e),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

  const login = useCallback(async (email: string, password: string) => {
    return withTimeout(
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
          await ensureMiddlewareSessionForSsr();
          authBootstrappedRef.current = true;
          setUser(me);
          setLoading(false);
          return me;
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
