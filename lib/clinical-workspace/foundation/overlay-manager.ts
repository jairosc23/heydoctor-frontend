import type { WorkspaceSurface, WorkspaceSurfaceId } from "../kernel";

type OverlaySession = {
  surface: WorkspaceSurface;
  previousFocus: Element | null;
};

let blocking: OverlaySession | null = null;
let escapeAttached = false;

function applyStacking(_surface: WorkspaceSurface): void {}

function applyPointerEvents(_surface: WorkspaceSurface): void {}

function applyBackdrop(_surface: WorkspaceSurface): void {}

function releaseBackdrop(): void {}

function applyFocus(_surface: WorkspaceSurface): void {}

function releaseFocus(session: OverlaySession): void {
  void session.previousFocus;
}

function onEscape(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;
  if (!blocking) return;
  event.preventDefault();
  dismiss();
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

export function present(surface: WorkspaceSurface): void {
  if (surface.blocking && blocking) {
    dismiss();
  }
  if (!surface.blocking) return;
  blocking = {
    surface,
    previousFocus: typeof document === "undefined" ? null : document.activeElement,
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
  const session = blocking;
  blocking = null;
  releaseBackdrop();
  releaseFocus(session);
  releaseEscape();
}

export function dismissAll(): void {
  dismiss();
}

export function getBlockingSurface(): WorkspaceSurface | null {
  return blocking?.surface ?? null;
}
