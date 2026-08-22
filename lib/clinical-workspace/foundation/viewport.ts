import type { WorkspaceViewport } from "../kernel";
import { WORKSPACE_CHROME_FALLBACK_PX } from "./chrome";

/** Structural defaults. Existing CSS / chrome-metrics consumers stay in place. */
export const WORKSPACE_VIEWPORT_DEFAULTS = {
  sidebarWidth: 256,
  panelHeaderHeight: 64,
  encounterChromeHeight: WORKSPACE_CHROME_FALLBACK_PX,
  safeTop: 0,
  safeBottom: 0,
} as const;

export function getWorkspaceViewport(): WorkspaceViewport {
  const {
    sidebarWidth,
    panelHeaderHeight,
    encounterChromeHeight,
    safeTop,
    safeBottom,
  } = WORKSPACE_VIEWPORT_DEFAULTS;
  return {
    sidebarWidth,
    panelHeaderHeight,
    encounterChromeHeight,
    safeTop,
    safeBottom,
    contentRect: {
      top: panelHeaderHeight + encounterChromeHeight,
      left: sidebarWidth,
      width: 0,
      height: 0,
    },
  };
}

export function subscribeWorkspaceViewport(
  listener: (viewport: WorkspaceViewport) => void,
): () => void {
  listener(getWorkspaceViewport());
  return () => {};
}
