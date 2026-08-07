/**
 * In-encounter Full Clinical Record navigation (Encounter Shell SSOT).
 *
 * React open state is the UI source of truth.
 * URL `?ficha=1` enables browser Back without remounting providers.
 *
 * Close must NEVER rely on history.back() alone — Next App Router can
 * merge/overwrite history.state and leave the Encounter route.
 */

export const ENCOUNTER_FULL_RECORD_PARAM = "ficha";

export const ENCOUNTER_FULL_RECORD_HISTORY_KEY = "hdEncounterFullRecord" as const;

export type EncounterFullRecordHistoryState = {
  [ENCOUNTER_FULL_RECORD_HISTORY_KEY]?: boolean;
};

export function encounterUrlWithFullRecord(
  href: string,
  open: boolean,
): string {
  const url = new URL(href, "http://local.invalid");
  if (open) {
    url.searchParams.set(ENCOUNTER_FULL_RECORD_PARAM, "1");
  } else {
    url.searchParams.delete(ENCOUNTER_FULL_RECORD_PARAM);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function isEncounterFullRecordOpenFromSearch(
  search: string | null | undefined,
): boolean {
  if (!search) return false;
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  return params.get(ENCOUNTER_FULL_RECORD_PARAM) === "1";
}

function mergeHistoryState(
  open: boolean,
): EncounterFullRecordHistoryState & Record<string, unknown> {
  const prev =
    typeof window !== "undefined" &&
    window.history.state &&
    typeof window.history.state === "object"
      ? (window.history.state as Record<string, unknown>)
      : {};
  return {
    ...prev,
    [ENCOUNTER_FULL_RECORD_HISTORY_KEY]: open,
  };
}

/** Open Full Record: push a history entry so browser Back closes the overlay. */
export function pushEncounterFullRecordState(open: boolean): void {
  if (typeof window === "undefined") return;
  const next = encounterUrlWithFullRecord(window.location.href, open);
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;
  window.history.pushState(mergeHistoryState(open), "", next);
}

/**
 * Sync URL to closed Full Record without popping history.
 * Prefer this for the explicit "Volver a la consulta" control.
 */
export function replaceEncounterFullRecordState(open: boolean): void {
  if (typeof window === "undefined") return;
  const next = encounterUrlWithFullRecord(window.location.href, open);
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) {
    // Still refresh our marker so Next merges don't leave stale flags.
    window.history.replaceState(mergeHistoryState(open), "", current);
    return;
  }
  window.history.replaceState(mergeHistoryState(open), "", next);
}
