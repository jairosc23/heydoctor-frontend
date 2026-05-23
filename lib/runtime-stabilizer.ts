/**
 * Recuperación de estado UI global atascado por auth (no modals/WebRTC).
 */

import {
  AUTH_HYDRATION_MAX_MS,
  AUTH_OVERLAY_MAX_MS,
} from "./async/auth-request-config";
import { emitAuthTelemetry } from "./auth-telemetry";
import {
  cancelInFlightAuthRequests,
  forceResetRefreshState,
} from "./auth-client";

const AUTH_OVERLAY_SELECTOR = '[data-heydoctor-auth-overlay="true"]';
const AUTH_BODY_CLASS_PREFIX = "heydoctor-auth-";

export type AuthStabilizerSnapshot = {
  loading: boolean;
  sessionRevalidating: boolean;
  loadingSinceMs: number | null;
  revalidatingSinceMs: number | null;
};

export type AuthStabilizerRecoveryReason =
  | "overlay_stuck"
  | "hydration_stuck"
  | "orphan_overlay_dom";

export type AuthStabilizerCallbacks = {
  onOverlayRecovery?: () => void;
  onHydrationRecovery?: () => void;
  onStaleLoadingReset?: () => void;
};

/**
 * Limpia estilos/clases auth en html/body sin tocar overflow de VideoCall ni modales.
 */
export function recoverAuthGlobalUiState(): void {
  if (typeof document === "undefined") return;

  for (const el of [document.documentElement, document.body]) {
    if (!el) continue;
    el.style.removeProperty("filter");
    el.style.removeProperty("backdrop-filter");
    el.style.removeProperty("pointer-events");
    el.style.removeProperty("opacity");
    const classes = Array.from(el.classList);
    for (const cls of classes) {
      if (cls.startsWith(AUTH_BODY_CLASS_PREFIX)) {
        el.classList.remove(cls);
      }
    }
  }

  document
    .querySelectorAll(AUTH_OVERLAY_SELECTOR)
    .forEach((node) => {
      if (node.parentElement && node.getAttribute("data-heydoctor-stale") === "true") {
        node.remove();
      }
    });
}

export function detectOrphanAuthOverlayDom(): boolean {
  if (typeof document === "undefined") return false;
  return document.querySelector(AUTH_OVERLAY_SELECTOR) !== null;
}

export function evaluateAuthStabilizerRecovery(
  snapshot: AuthStabilizerSnapshot,
  now = Date.now(),
): AuthStabilizerRecoveryReason | null {
  if (
    snapshot.sessionRevalidating &&
    snapshot.revalidatingSinceMs != null &&
    now - snapshot.revalidatingSinceMs >= AUTH_OVERLAY_MAX_MS
  ) {
    return "overlay_stuck";
  }

  if (
    snapshot.loading &&
    snapshot.loadingSinceMs != null &&
    now - snapshot.loadingSinceMs >= AUTH_HYDRATION_MAX_MS
  ) {
    return "hydration_stuck";
  }

  if (
    !snapshot.sessionRevalidating &&
    detectOrphanAuthOverlayDom()
  ) {
    return "orphan_overlay_dom";
  }

  return null;
}

export function runAuthStabilizerRecovery(
  reason: AuthStabilizerRecoveryReason,
  callbacks: AuthStabilizerCallbacks = {},
): void {
  cancelInFlightAuthRequests();
  forceResetRefreshState();
  recoverAuthGlobalUiState();

  if (reason === "overlay_stuck" || reason === "orphan_overlay_dom") {
    emitAuthTelemetry("overlay_recovery", { reason });
    callbacks.onOverlayRecovery?.();
  }

  if (reason === "hydration_stuck") {
    emitAuthTelemetry("hydration_recovery", { reason });
    emitAuthTelemetry("stale_loading_reset", { reason });
    callbacks.onHydrationRecovery?.();
    callbacks.onStaleLoadingReset?.();
  }
}

export type AuthStabilizerHandle = {
  tick: (snapshot: AuthStabilizerSnapshot) => void;
  dispose: () => void;
};

export function createAuthStabilizer(
  callbacks: AuthStabilizerCallbacks = {},
): AuthStabilizerHandle {
  return {
    tick(snapshot: AuthStabilizerSnapshot) {
      const reason = evaluateAuthStabilizerRecovery(snapshot);
      if (reason) {
        runAuthStabilizerRecovery(reason, callbacks);
      }
    },
    dispose() {
      /* hook owns interval lifecycle */
    },
  };
}
