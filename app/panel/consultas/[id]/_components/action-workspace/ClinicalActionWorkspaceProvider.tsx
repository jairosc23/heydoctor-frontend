"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ClinicalActionModuleId } from "@/lib/clinical-action-workspace";

export interface ClinicalActionWorkspaceContextValue {
  enabled: boolean;
  activeModule: ClinicalActionModuleId | null;
  sheetOpen: boolean;
  openModule: (moduleId: ClinicalActionModuleId) => void;
  closeSheet: () => void;
}

const ClinicalActionWorkspaceContext =
  createContext<ClinicalActionWorkspaceContextValue | null>(null);

export function ClinicalActionWorkspaceProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [activeModule, setActiveModule] =
    useState<ClinicalActionModuleId | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openModule = useCallback((moduleId: ClinicalActionModuleId) => {
    setActiveModule(moduleId);
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      enabled,
      activeModule,
      sheetOpen,
      openModule,
      closeSheet,
    }),
    [enabled, activeModule, sheetOpen, openModule, closeSheet],
  );

  return (
    <ClinicalActionWorkspaceContext.Provider value={value}>
      {children}
    </ClinicalActionWorkspaceContext.Provider>
  );
}

export function useClinicalActionWorkspace(): ClinicalActionWorkspaceContextValue {
  const context = useContext(ClinicalActionWorkspaceContext);
  if (!context) {
    return {
      enabled: false,
      activeModule: null,
      sheetOpen: false,
      openModule: () => undefined,
      closeSheet: () => undefined,
    };
  }
  return context;
}
