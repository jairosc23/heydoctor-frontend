/**
 * I2 — single Empty convention for Continuity Context.
 */

import type { ContinuityContext } from "@/lib/continuity-platform/types";

export function isContinuityContextEmpty(ctx: ContinuityContext): boolean {
  const noActive = (ctx.activeMedications?.length ?? 0) === 0;
  const noEvents = (ctx.timelineSummary?.events?.length ?? 0) === 0;
  const noHints = (ctx.hints?.length ?? 0) === 0;
  return noActive && noEvents && noHints;
}

/** Maps a successful context to Loaded vs Empty (no FETCH_EMPTY event). */
export function uiStateForContext(
  ctx: ContinuityContext,
): "Loaded" | "Empty" {
  return isContinuityContextEmpty(ctx) ? "Empty" : "Loaded";
}
