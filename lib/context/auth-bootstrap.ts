/**
 * Helpers puros para hidratación auth (testeables sin React).
 */

import { OperationTimeoutError } from "@/lib/async/with-timeout";

export type BootstrapPhase = "refresh" | "getMe";

export function isBootstrapTimeoutError(err: unknown): boolean {
  return err instanceof OperationTimeoutError;
}

export function shouldClearSessionOnBootstrapError(
  err: unknown,
  phase: BootstrapPhase,
): boolean {
  if (phase !== "refresh") return false;
  if (isBootstrapTimeoutError(err)) return true;
  return true;
}

export function shouldFinishHydrationAfterError(err: unknown): boolean {
  return isBootstrapTimeoutError(err) || err != null;
}
