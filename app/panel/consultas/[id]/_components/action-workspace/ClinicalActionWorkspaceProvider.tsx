"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
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

export type ClinicalActionWorkspaceNavigationRef =
  MutableRefObject<ClinicalActionWorkspaceContextValue | null>;

const ClinicalActionWorkspaceContext =
  createContext<ClinicalActionWorkspaceContextValue | null>(null);

export function ClinicalActionWorkspaceProvider({
  enabled,
  navigationRef,
  children,
}: {
  enabled: boolean;
  navigationRef?: MutableRefObject<ClinicalActionWorkspaceContextValue | null>;
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

  useEffect(() => {
    if (!navigationRef) return;
    navigationRef.current = value;
    return () => {
      navigationRef.current = null;
    };
  }, [navigationRef, value]);

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
