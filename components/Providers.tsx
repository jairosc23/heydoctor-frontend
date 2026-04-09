"use client";

import { MagicLinkSessionBootstrap } from "@/components/MagicLinkSessionBootstrap";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ensureCsrfToken } from "@/lib/csrf";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    void ensureCsrfToken().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MagicLinkSessionBootstrap>{children}</MagicLinkSessionBootstrap>
      </AuthProvider>
    </QueryClientProvider>
  );
}
