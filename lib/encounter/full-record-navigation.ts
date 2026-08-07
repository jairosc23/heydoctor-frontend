/**
 * In-encounter Full Clinical Record navigation (P0).
 * Uses History API so browser Back restores the Encounter without remounting providers.
 */

export const ENCOUNTER_FULL_RECORD_PARAM = "ficha";

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

export function pushEncounterFullRecordState(open: boolean): void {
  if (typeof window === "undefined") return;
  const next = encounterUrlWithFullRecord(window.location.href, open);
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;
  window.history.pushState({ encounterFullRecord: open }, "", next);
}
