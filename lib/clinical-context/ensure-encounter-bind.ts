import { bindClinicalContext } from "./api";

type BindFn = (consultationId: string) => Promise<unknown>;

const succeeded = new Set<string>();
const inFlight = new Map<string, Promise<void>>();

/** Test-only: drop in-memory once-per-consultation coalescing. */
export function resetEncounterContextBindForTests(): void {
  succeeded.clear();
  inFlight.clear();
}

/**
 * Canonical Encounter open → E05 bind.
 * Idempotent in-process; fail-closed (does not invent bound state).
 * No UI. HAB remains the authority gate if bind fails.
 */
export function ensureEncounterContextBound(
  consultationId: string,
  bind: BindFn = bindClinicalContext,
): Promise<void> {
  const id = consultationId.trim();
  if (!id) {
    return Promise.reject(
      new Error("consultationId is required to bind clinical context"),
    );
  }
  if (succeeded.has(id)) return Promise.resolve();
  const pending = inFlight.get(id);
  if (pending) return pending;

  const work = Promise.resolve()
    .then(() => bind(id))
    .then(() => {
      succeeded.add(id);
    })
    .finally(() => {
      inFlight.delete(id);
    });
  inFlight.set(id, work);
  return work;
}
