import { dedupeInflight } from "./request-dedupe";
import {
  maybeRememberPackage,
  tryProjectGovernedPackageFirst,
} from "./package-first-cache";

/**
 * GET Medical Copilot con:
 * - package-first (proyección local si el package ya está en cache)
 * - dedupe de requests idénticos en vuelo
 * Endpoints existentes sin cambios.
 */
export async function medicalCopilotGet<T>(
  path: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const projected = tryProjectGovernedPackageFirst(path);
  if (projected !== null) {
    return projected as T;
  }
  return dedupeInflight(path, async () => {
    const payload = await fetchFn();
    maybeRememberPackage(path, payload);
    return payload;
  });
}
