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
import {
  type AuthUser,
  login as loginRequest,
  logout as logoutRequest,
  getMe,
  syncMiddlewareSession,
  clearMiddlewareSession,
} from "@/lib/services/auth";
import { refreshAccessToken, getAccessToken } from "@/lib/auth-client";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  const login = useCallback(async (email: string, password: string) => {
    await loginRequest(email, password);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
