import { dedupeInflight } from "./request-dedupe";
import {
  maybeRememberPackage,
  tryProjectGovernedPackageFirst,
} from "./package-first-cache";
import {
  withFeTimeout,
  markDuplicateBlocked,
  RC5_FE_GET_TIMEOUT_MS,
} from "../rc5-operational/resilience";
import {
  rc5TrackGetStart,
  rc5TrackGetEnd,
  recordRc5PackageResolution,
} from "../rc5-operational/observability";

/**
 * GET Medical Copilot con:
 * - package-first (proyección local si el package ya está en cache)
 * - dedupe de requests idénticos en vuelo
 * - RC5 timeout + concurrency tracking
 * Endpoints existentes sin cambios.
 */
export async function medicalCopilotGet<T>(
  path: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const projected = tryProjectGovernedPackageFirst(path);
  if (projected !== null) {
    markDuplicateBlocked();
    return projected as T;
  }
  rc5TrackGetStart();
  const started =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    return await dedupeInflight(path, async () => {
      const payload = await withFeTimeout(
        fetchFn(),
        path,
        RC5_FE_GET_TIMEOUT_MS,
      );
      maybeRememberPackage(path, payload);
      return payload;
    });
  } finally {
    const end =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    recordRc5PackageResolution(end - started);
    rc5TrackGetEnd();
  }
}
