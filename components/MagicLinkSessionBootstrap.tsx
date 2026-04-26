"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { exchangeMagicLinkToken } from "@/lib/magic-link-exchange";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

function MagicLinkSessionBootstrapInner({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const ranForTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("access_token")?.trim();
    if (!token) {
      return;
    }
    if (ranForTokenRef.current === token) {
      return;
    }
    ranForTokenRef.current = token;

    void (async () => {
      try {
        await exchangeMagicLinkToken(token);
        router.replace("/panel", { scroll: false });
        await refreshUser();
      } catch {
        ranForTokenRef.current = null;
      }
    })();
  }, [refreshUser, router, searchParams]);

  return <>{children}</>;
}

/**
 * Si la URL incluye `access_token`, canjea en el API Nest y limpia el query param.
 * Debe ir dentro de {@link AuthProvider} y debajo de un boundary `Suspense` (usa `useSearchParams`).
 */
export function MagicLinkSessionBootstrap({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <MagicLinkSessionBootstrapInner>{children}</MagicLinkSessionBootstrapInner>
    </Suspense>
  );
}
