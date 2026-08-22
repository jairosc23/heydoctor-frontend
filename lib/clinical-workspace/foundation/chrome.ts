export const WORKSPACE_CHROME_FALLBACK_PX = 88;
export const WORKSPACE_CHROME_CSS_VAR = "--encounter-chrome-h";

export function measureChrome(chrome: HTMLElement): number {
  const heightPx = chrome.getBoundingClientRect().height;
  return Number.isFinite(heightPx)
    ? Math.max(0, heightPx)
    : WORKSPACE_CHROME_FALLBACK_PX;
}

export function publishChromeHeight(nextHeightPx: number): void {
  const safe = Number.isFinite(nextHeightPx)
    ? Math.max(0, nextHeightPx)
    : WORKSPACE_CHROME_FALLBACK_PX;
  if (typeof document === "undefined") return;
  const value = `${safe}px`;
  document.documentElement.style.setProperty(WORKSPACE_CHROME_CSS_VAR, value);
  const workspace = document.querySelector(".clinical-workspace");
  if (workspace instanceof HTMLElement) {
    workspace.style.setProperty(WORKSPACE_CHROME_CSS_VAR, value);
  }
}
