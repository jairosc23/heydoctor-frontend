import {
  CLINICAL_OVERLAY_DIALOG_BACKDROP_CLASS,
  CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS,
  CLINICAL_OVERLAY_MODAL_BACKDROP_CLASS,
} from "@/lib/clinical-overlay-contract";
import type {
  VisualWorkspaceState,
  WorkspaceSurface,
  WorkspaceSurfaceId,
} from "../kernel";

type OverlaySession = {
  surface: WorkspaceSurface;
  previousFocus: Element | null;
};

let blocking: OverlaySession | null = null;
let escapeAttached = false;
let backdropEl: HTMLButtonElement | null = null;
const visualListeners = new Set<() => void>();

function notifyVisualState(): void {
  visualListeners.forEach((listener) => listener());
}

export function getVisualWorkspaceState(): VisualWorkspaceState {
  const surface = blocking?.surface ?? null;
  if (!surface) return { mode: "frame", activeSurface: null };
  const mode =
    surface.kind === "drawer" ||
    surface.kind === "modal" ||
    surface.kind === "dialog" ||
    surface.kind === "fullscreen"
      ? surface.kind
      : "frame";
  return { mode, activeSurface: surface.id };
}

export function subscribeVisualWorkspaceState(listener: () => void): () => void {
  visualListeners.add(listener);
  return () => {
    visualListeners.delete(listener);
  };
}

function backdropClassFor(surface: WorkspaceSurface): string {
  const tint = surface.backdropClassName ?? "clinical-drawer-enter bg-slate-900/10";
  if (surface.kind === "dialog") {
    return `${tint} ${CLINICAL_OVERLAY_DIALOG_BACKDROP_CLASS}`;
  }
  if (surface.kind === "modal") {
    return `${tint} ${CLINICAL_OVERLAY_MODAL_BACKDROP_CLASS}`;
  }
  return `${tint} ${CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS}`;
}

function applyStacking(_surface: WorkspaceSurface): void {}

function applyPointerEvents(surface: WorkspaceSurface): void {
  if (typeof document === "undefined") return;
  if (!surface.blocking) return;
  document.documentElement.dataset.hdOverlayLock = surface.kind;
  document.body.style.overflow = "hidden";
}

function releasePointerEvents(): void {
  if (typeof document === "undefined") return;
  delete document.documentElement.dataset.hdOverlayLock;
  document.body.style.overflow = "";
}

function applyFocus(_surface: WorkspaceSurface): void {
  if (typeof document === "undefined") return;
  window.requestAnimationFrame(() => {
    const host = document.querySelector<HTMLElement>(
      '[data-testid="share-consultation-host"] [role="dialog"], [role="dialog"][aria-modal="true"]',
    );
    const target = host?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (target ?? host)?.focus();
  });
}

function releaseFocus(session: OverlaySession): void {
  const prev = session.previousFocus;
  if (prev instanceof HTMLElement && document.contains(prev)) {
    prev.focus();
  }
}

function applyBackdrop(surface: WorkspaceSurface): void {
  if (typeof document === "undefined") return;
  releaseBackdrop();
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", surface.backdropAriaLabel ?? "Cerrar");
  button.className = backdropClassFor(surface);
  button.dataset.overlayLayer =
    surface.kind === "dialog" || surface.kind === "modal"
      ? surface.kind
      : "drawers";
  button.dataset.overlaySurface = `${surface.kind}-backdrop`;
  button.dataset.overlayPortal = "document-body";
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
  releasePointerEvents();
  releaseFocus(session);
  releaseEscape();
  if (invokeCallback) session.surface.onDismiss?.();
  notifyVisualState();
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
  notifyVisualState();
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
