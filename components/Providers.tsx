"use client";

import { MagicLinkSessionBootstrap } from "@/components/MagicLinkSessionBootstrap";
import { DevSessionDiagnosticsPanel } from "@/components/DevSessionDiagnosticsPanel";
import { AuthProvider } from "@/lib/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MagicLinkSessionBootstrap>{children}</MagicLinkSessionBootstrap>
      </AuthProvider>
      {process.env.NODE_ENV !== "production" && <DevSessionDiagnosticsPanel />}
    </QueryClientProvider>
  );
}
