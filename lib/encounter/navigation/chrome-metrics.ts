/**
 * Encounter Navigation SSOT — live sticky-chrome metrics.
 * Single publisher for --encounter-chrome-h + versioned JS subscribers.
 * Observers must re-subscribe when version changes.
 */

export type EncounterChromeMetrics = {
  heightPx: number;
  version: number;
};

const DEFAULT_HEIGHT_PX = 88;

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
  if (typeof document === "undefined") return;
  const value = `${px}px`;
  document.documentElement.style.setProperty("--encounter-chrome-h", value);
  const workspace = document.querySelector(".clinical-workspace");
  if (workspace instanceof HTMLElement) {
    workspace.style.setProperty("--encounter-chrome-h", value);
  }
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
