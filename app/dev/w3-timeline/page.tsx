"use client";

import { useMemo, useState } from "react";
import { W3TimelineRiver } from "@/components/hcx/intelligence/timeline";
import { isW3TimelineEnabled } from "@/lib/w3/flags";

const DEMO_EVENTS = [
  {
    eventId: "cds:1",
    sourceKind: "cds_recommendation",
    sourceRef: "1",
    occurredAt: "2026-03-03T12:00:00.000Z",
    title: "Drug interaction warning (demo)",
    summary: "Advisory CDS signal — not an authorization.",
    status: "proposed",
    advisory: true,
    navigationHint: "cds",
  },
  {
    eventId: "assist:1",
    sourceKind: "assist_proposal",
    sourceRef: "2",
    occurredAt: "2026-03-02T12:00:00.000Z",
    title: "Assist note fragment (demo)",
    summary: "Advisory proposal for documentation draft.",
    status: "active",
    advisory: true,
    navigationHint: "assist",
  },
  {
    eventId: "doc:1",
    sourceKind: "documentation",
    sourceRef: "3",
    occurredAt: "2026-03-01T12:00:00.000Z",
    title: "Documentation",
    summary: "State=drafting",
    status: "drafting",
    advisory: false,
    navigationHint: "documentation",
  },
  {
    eventId: "cpi:1",
    sourceKind: "cpi_suggestion",
    sourceRef: "4",
    occurredAt: "2026-02-28T12:00:00.000Z",
    title: "Care plan objective (demo)",
    summary: "Advisory CPI suggestion.",
    status: "suggested",
    advisory: true,
    navigationHint: "cpi",
  },
];

export default function W3TimelineDevPage() {
  const enabled = isW3TimelineEnabled();
  const [sourceFilter, setSourceFilter] = useState("");
  const [groupBy, setGroupBy] = useState<"none" | "day" | "source">("none");

  const groups = useMemo(() => {
    if (groupBy === "none") return undefined;
    const map = new Map<string, typeof DEMO_EVENTS>();
    for (const e of DEMO_EVENTS) {
      const key = groupBy === "day" ? e.occurredAt.slice(0, 10) : e.sourceKind;
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return [...map.entries()].map(([groupKey, events]) => ({
      groupKey,
      label: groupKey,
      events,
    }));
  }, [groupBy]);

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-timeline-disabled">
          Define <code>NEXT_PUBLIC_W3_TIMELINE=true</code>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800 }}>
      <W3TimelineRiver
        enabled
        events={DEMO_EVENTS}
        groups={groups}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        message="Demo river — read-only. No Confirm / Emit / Ready."
      />
    </main>
  );
}
