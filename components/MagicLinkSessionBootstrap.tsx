"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { exchangeMagicLinkToken } from "@/lib/magic-link-exchange";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
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
        const next = new URLSearchParams(searchParams.toString());
        next.delete("access_token");
        const q = next.toString();
        router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
        await refreshUser();
      } catch {
        ranForTokenRef.current = null;
      }
    })();
  }, [pathname, refreshUser, router, searchParams]);

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
