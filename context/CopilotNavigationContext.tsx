"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { CopilotSectionId } from "@/lib/copilot-navigation";

export type CopilotNavigationContextValue = {
  open: boolean;
  generativeExpandToken: number;
  openCopilot: () => void;
  closeCopilot: () => void;
  openCopilotSection: (section: CopilotSectionId) => void;
  expandCopilotGenerativeSection: () => void;
};

const CopilotNavigationContext =
  createContext<CopilotNavigationContextValue | null>(null);

export type CopilotNavigationProviderProps = {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generativeExpandToken: number;
  onRequestGenerativeExpand: () => void;
};

/**
 * Phase 4.8.3C — CopilotNavigationContext™
 * API unificada para abrir Copilot y expandir secciones desde cualquier superficie.
 */
export function CopilotNavigationProvider({
  children,
  open,
  onOpenChange,
  generativeExpandToken,
  onRequestGenerativeExpand,
}: CopilotNavigationProviderProps) {
  const openCopilot = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const closeCopilot = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const expandCopilotGenerativeSection = useCallback(() => {
    onRequestGenerativeExpand();
  }, [onRequestGenerativeExpand]);

  const openCopilotSection = useCallback(
    (section: CopilotSectionId) => {
      onOpenChange(true);
      if (section === "generative") {
        onRequestGenerativeExpand();
      }
    },
    [onOpenChange, onRequestGenerativeExpand],
  );

  const value = useMemo<CopilotNavigationContextValue>(
    () => ({
      open,
      generativeExpandToken,
      openCopilot,
      closeCopilot,
      openCopilotSection,
      expandCopilotGenerativeSection,
    }),
    [
      open,
      generativeExpandToken,
      openCopilot,
      closeCopilot,
      openCopilotSection,
      expandCopilotGenerativeSection,
    ],
  );

  return (
    <CopilotNavigationContext.Provider value={value}>
      {children}
    </CopilotNavigationContext.Provider>
  );
}

export function useCopilotNavigation(): CopilotNavigationContextValue {
  const ctx = useContext(CopilotNavigationContext);
  if (!ctx) {
    throw new Error(
      "useCopilotNavigation debe usarse dentro de CopilotNavigationProvider",
    );
  }
  return ctx;
}

export function useCopilotNavigationOptional():
  | CopilotNavigationContextValue
  | null {
  return useContext(CopilotNavigationContext);
}
