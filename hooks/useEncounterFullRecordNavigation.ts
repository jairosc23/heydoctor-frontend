"use client";

/**
 * In-encounter Full Clinical Record — React-only surface (Encounter Shell SSOT).
 *
 * Same ownership model as Continuity: open/close mutates React state only.
 * No History API, no overlay query param, no popstate — Runtime stays mounted.
 */

import { useCallback, useState } from "react";

export function useEncounterFullRecordNavigation() {
  const [fullRecordOpen, setFullRecordOpen] = useState(false);

  const openFullRecord = useCallback(() => {
    setFullRecordOpen(true);
  }, []);

  const closeFullRecord = useCallback(() => {
    setFullRecordOpen(false);
  }, []);

  /** Exit Encounter: close overlay without touching router/History. */
  const dismissFullRecordForExit = useCallback(() => {
    setFullRecordOpen(false);
  }, []);

  return {
    fullRecordOpen,
    openFullRecord,
    closeFullRecord,
    dismissFullRecordForExit,
  };
}
