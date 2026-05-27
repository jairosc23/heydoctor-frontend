/**
 * Helpers puros para hidratación auth (testeables sin React).
 */

import { OperationTimeoutError } from "@/lib/async/with-timeout";

export type BootstrapPhase = "refresh" | "getMe";

export function isBootstrapTimeoutError(err: unknown): boolean {
  return err instanceof OperationTimeoutError;
}

/** Cancelación explícita (navegación/unmount): no tratar como fallo de sesión. */
export function isAuthAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "AbortError" || err.code === 20)
  );
}

export function shouldClearSessionOnBootstrapError(
  err: unknown,
  phase: BootstrapPhase,
): boolean {
  if (phase !== "refresh") return false;
  if (isAuthAbortError(err)) return false;
  if (isBootstrapTimeoutError(err)) return true;
  return true;
}

export function shouldFinishHydrationAfterError(err: unknown): boolean {
  return isBootstrapTimeoutError(err) || err != null;
}
