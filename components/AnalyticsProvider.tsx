"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { trackPageView } from "@/lib/analytics";

function AnalyticsRouteListener({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    try {
      const qs = searchParams?.toString() ?? "";
      const full = `${pathname ?? "/"}${qs ? `?${qs}` : ""}`;
      if (lastPath.current === full) return;
      lastPath.current = full;
      void trackPageView(full).catch(() => {});
    } catch {
      /* no bloquear el árbol de la app si analytics falla */
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

/**
 * Debe vivir bajo un árbol cliente (p. ej. dentro de {@link Providers}).
 * `useSearchParams` requiere boundary Suspense en App Router.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AnalyticsRouteListener>{children}</AnalyticsRouteListener>
    </Suspense>
  );
}
