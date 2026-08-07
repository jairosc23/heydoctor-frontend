"use client";

/**
 * In-encounter Full Clinical Record navigation.
 * Preserves Encounter Runtime — never remounts providers.
 *
 * Close path is optimistic + replaceState (not history.back), so returning
 * to consultation always restores the shell even when Next rewrites history.state.
 */

import { useCallback, useEffect, useState } from "react";
import {
  isEncounterFullRecordOpenFromSearch,
  pushEncounterFullRecordState,
  replaceEncounterFullRecordState,
} from "@/lib/encounter/full-record-navigation";

function readOpenFromLocation(): boolean {
  if (typeof window === "undefined") return false;
  return isEncounterFullRecordOpenFromSearch(window.location.search);
}

export function useEncounterFullRecordNavigation() {
  const [fullRecordOpen, setFullRecordOpen] = useState(false);

  useEffect(() => {
    setFullRecordOpen(readOpenFromLocation());
    const onPopState = () => {
      setFullRecordOpen(readOpenFromLocation());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openFullRecord = useCallback(() => {
    setFullRecordOpen(true);
    if (!readOpenFromLocation()) {
      pushEncounterFullRecordState(true);
    }
  }, []);

  const closeFullRecord = useCallback(() => {
    // Optimistic UI close — shell restores immediately.
    setFullRecordOpen(false);
    if (readOpenFromLocation()) {
      replaceEncounterFullRecordState(false);
    }
  }, []);

  /** Exit Encounter: close overlay + strip ?ficha without history.back(). */
  const dismissFullRecordForExit = useCallback(() => {
    setFullRecordOpen(false);
    if (readOpenFromLocation()) {
      replaceEncounterFullRecordState(false);
    }
  }, []);

  return {
    fullRecordOpen,
    openFullRecord,
    closeFullRecord,
    dismissFullRecordForExit,
  };
}
