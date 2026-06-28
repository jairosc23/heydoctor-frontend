"use client";

import { useEffect, useRef } from "react";
import { fetchWithAuth } from "@/lib/heydoctor-api";

const GROWTH_ANON_SESSION_KEY = "heyd_growth_anon_v1";
const VISIT_MARKETING_EVENT = "VISIT_MARKETING";

function getGrowthAnonSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let value = window.localStorage.getItem(GROWTH_ANON_SESSION_KEY);
    if (!value || value.length < 12) {
      value =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
      window.localStorage.setItem(GROWTH_ANON_SESSION_KEY, value);
    }
    return value;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  }
}

async function trackLandingVisit(anonSessionId: string): Promise<void> {
  await fetchWithAuth(
    "/growth/events-public",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: VISIT_MARKETING_EVENT,
        properties: {
          anonSessionId,
          path: "/",
        },
      }),
    },
    { requireAuth: false },
  ).catch(() => undefined);
}

export function GrowthLandingVisitBeacon() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const anonSessionId = getGrowthAnonSessionId();
    if (anonSessionId.length < 12) return;
    void trackLandingVisit(anonSessionId);
  }, []);

  return null;
}
