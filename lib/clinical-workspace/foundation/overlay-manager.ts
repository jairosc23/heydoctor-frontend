import { CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS } from "@/lib/clinical-overlay-contract";
import type { WorkspaceSurface, WorkspaceSurfaceId } from "../kernel";

type OverlaySession = {
  surface: WorkspaceSurface;
  previousFocus: Element | null;
};

let blocking: OverlaySession | null = null;
let escapeAttached = false;
let backdropEl: HTMLButtonElement | null = null;

function applyStacking(_surface: WorkspaceSurface): void {}

function applyPointerEvents(_surface: WorkspaceSurface): void {}

function applyFocus(_surface: WorkspaceSurface): void {}

function releaseFocus(session: OverlaySession): void {
  void session.previousFocus;
}

function applyBackdrop(surface: WorkspaceSurface): void {
  if (typeof document === "undefined") return;
  releaseBackdrop();
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", surface.backdropAriaLabel ?? "Cerrar");
  button.className = `clinical-drawer-enter bg-slate-900/10 ${CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS}`;
  button.dataset.overlayLayer = "drawers";
  button.dataset.overlaySurface = "drawer-backdrop";
  button.addEventListener("click", () => closeBlocking(true));
  document.body.insertBefore(button, document.body.firstChild);
  backdropEl = button;
}

function releaseBackdrop(): void {
  backdropEl?.remove();
  backdropEl = null;
}

function onEscape(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;
  if (!blocking) return;
  event.preventDefault();
  closeBlocking(true);
}

function attachEscape(): void {
  if (escapeAttached || typeof window === "undefined") return;
  window.addEventListener("keydown", onEscape);
  escapeAttached = true;
}

function releaseEscape(): void {
  if (!escapeAttached || typeof window === "undefined") return;
  window.removeEventListener("keydown", onEscape);
  escapeAttached = false;
}

function closeBlocking(invokeCallback: boolean): void {
  if (!blocking) return;
  const session = blocking;
  blocking = null;
  releaseBackdrop();
  releaseFocus(session);
  releaseEscape();
  if (invokeCallback) session.surface.onDismiss?.();
}

export function present(surface: WorkspaceSurface): void {
  if (!surface.blocking) return;
  if (blocking?.surface.id === surface.id) {
    blocking.surface = surface;
    return;
  }
  if (blocking) closeBlocking(true);
  blocking = {
    surface,
    previousFocus:
      typeof document === "undefined" ? null : document.activeElement,
  };
  applyStacking(surface);
  applyPointerEvents(surface);
  applyBackdrop(surface);
  applyFocus(surface);
  attachEscape();
}

export function dismiss(id?: WorkspaceSurfaceId): void {
  if (!blocking) return;
  if (id && blocking.surface.id !== id) return;
  closeBlocking(false);
}

export function dismissAll(): void {
  closeBlocking(false);
}

export function getBlockingSurface(): WorkspaceSurface | null {
  return blocking?.surface ?? null;
}
