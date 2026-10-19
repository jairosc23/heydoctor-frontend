"use client";

import { useSyncExternalStore } from "react";
import { clinicalWorkspaceKernel } from "./kernel";

export function useVisualWorkspaceState() {
  return useSyncExternalStore(
    clinicalWorkspaceKernel.subscribeVisualState,
    clinicalWorkspaceKernel.getVisualState,
    clinicalWorkspaceKernel.getVisualState,
  );
}
