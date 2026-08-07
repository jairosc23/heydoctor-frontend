"use client";

/**
 * In-encounter Full Clinical Record navigation (P0).
 * History API only — never remounts Encounter Runtime providers.
 */

import { useCallback, useEffect, useState } from "react";
import {
  isEncounterFullRecordOpenFromSearch,
  pushEncounterFullRecordState,
} from "@/lib/encounter/full-record-navigation";

function readOpen(): boolean {
  if (typeof window === "undefined") return false;
  return isEncounterFullRecordOpenFromSearch(window.location.search);
}

export function useEncounterFullRecordNavigation() {
  const [fullRecordOpen, setFullRecordOpen] = useState(false);

  useEffect(() => {
    setFullRecordOpen(readOpen());
    const onPopState = () => {
      setFullRecordOpen(readOpen());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openFullRecord = useCallback(() => {
    pushEncounterFullRecordState(true);
    setFullRecordOpen(true);
  }, []);

  const closeFullRecord = useCallback(() => {
    if (typeof window === "undefined") return;
    const state = window.history.state as { encounterFullRecord?: boolean } | null;
    if (state?.encounterFullRecord === true) {
      window.history.back();
      return;
    }
    pushEncounterFullRecordState(false);
    setFullRecordOpen(false);
  }, []);

  return { fullRecordOpen, openFullRecord, closeFullRecord };
}
