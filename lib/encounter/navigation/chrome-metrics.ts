/**
 * Encounter Navigation — versioned JS subscribers for chrome height.
 * CSS publication lives in the Clinical Workspace Kernel / Foundation.
 */

import {
  clinicalWorkspaceKernel,
  WORKSPACE_CHROME_FALLBACK_PX,
} from "@/lib/clinical-workspace/kernel";

export type EncounterChromeMetrics = {
  heightPx: number;
  version: number;
};

const DEFAULT_HEIGHT_PX = WORKSPACE_CHROME_FALLBACK_PX;

type Listener = (metrics: EncounterChromeMetrics) => void;

let heightPx = DEFAULT_HEIGHT_PX;
let version = 0;
const listeners = new Set<Listener>();

function notify() {
  const snapshot: EncounterChromeMetrics = { heightPx, version };
  listeners.forEach((listener) => listener(snapshot));
}

/** Publish measured chrome height; bumps version when height meaningfully changes. */
export function publishEncounterChromeHeight(nextHeightPx: number): void {
  const safe = Number.isFinite(nextHeightPx)
    ? Math.max(0, nextHeightPx)
    : DEFAULT_HEIGHT_PX;
  if (Math.abs(safe - heightPx) < 0.5 && version > 0) {
    // Still sync CSS vars (workspace may have remounted).
    writeCssVars(safe);
    return;
  }
  heightPx = safe;
  version += 1;
  writeCssVars(safe);
  notify();
}

function writeCssVars(px: number) {
  clinicalWorkspaceKernel.publishChromeHeight(px);
}

export function getEncounterChromeMetrics(): EncounterChromeMetrics {
  return { heightPx, version };
}

export function subscribeEncounterChromeMetrics(
  listener: Listener,
): () => void {
  listeners.add(listener);
  listener({ heightPx, version });
  return () => {
    listeners.delete(listener);
  };
}

/** @internal tests */
export function __resetEncounterChromeMetricsForTests() {
  heightPx = DEFAULT_HEIGHT_PX;
  version = 0;
  listeners.clear();
}
