/**
 * RC18: place the clinical Copilot beside the ACTUAL navigation rail, not a
 * guessed sidebar + padding. BoundingClientRect values are viewport-relative;
 * the Copilot drawer is fixed-positioned in the same viewport.
 */
export interface CopilotRailGeometry {
  left: number;
  width: number;
}

export function resolveCopilotRailGeometry(
  railRight: number,
  viewportWidth: number,
  gap = 12,
  edge = 12,
): CopilotRailGeometry | null {
  if (
    !Number.isFinite(railRight) ||
    !Number.isFinite(viewportWidth) ||
    viewportWidth < 1280 ||
    railRight <= 0
  ) {
    return null;
  }

  const left = Math.ceil(railRight) + gap;
  const available = Math.floor(viewportWidth - left - edge);
  if (available <= 0) return null;

  return { left, width: Math.min(576, available) };
}
