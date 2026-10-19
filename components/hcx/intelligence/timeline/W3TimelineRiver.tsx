export type W3TimelineEventModel = {
  eventId: string;
  sourceKind: string;
  sourceRef: string;
  occurredAt: string;
  title: string;
  summary: string;
  status: string | null;
  advisory: boolean;
  navigationHint: string | null;
};

export type W3TimelineGroupModel = {
  groupKey: string;
  label: string;
  events: W3TimelineEventModel[];
};

export type W3TimelineRiverProps = {
  enabled?: boolean;
  events: W3TimelineEventModel[];
  groups?: W3TimelineGroupModel[];
  sourceFilter?: string;
  onSourceFilterChange?: (source: string) => void;
  groupBy?: "none" | "day" | "source";
  onGroupByChange?: (g: "none" | "day" | "source") => void;
  /** Simple virtualization window for large rivers. */
  windowSize?: number;
  message?: string | null;
};

const SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  { value: "documentation", label: "Documentation" },
  { value: "therapy_draft", label: "Therapy" },
  { value: "orders", label: "Orders" },
  { value: "assist_proposal", label: "Assist" },
  { value: "cds_recommendation", label: "CDS" },
  { value: "cpi_suggestion", label: "Care Plan Intel" },
  { value: "longitudinal_insight", label: "Longitudinal" },
  { value: "e10_timeline", label: "E10 timeline" },
];

/**
 * WP-06 Clinical Timeline river — visualization only.
 * No Confirm / Emit / Ready / Renew CTAs.
 */
export function W3TimelineRiver({
  enabled = true,
  events,
  groups,
  sourceFilter = "",
  onSourceFilterChange,
  groupBy = "none",
  onGroupByChange,
  windowSize = 50,
  message,
}: W3TimelineRiverProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-timeline-off">
        Clinical Timeline (`w3.timeline.projection`) desactivado.
      </div>
    );
  }

  const filtered = sourceFilter
    ? events.filter((e) => e.sourceKind === sourceFilter)
    : events;
  const windowed = filtered.slice(0, windowSize);
  const renderGroups =
    groupBy !== "none" && groups?.length
      ? groups
      : [{ groupKey: "all", label: "All events", events: windowed }];

  return (
    <section
      data-testid="w3-timeline-river"
      data-w3-flag="w3.timeline.projection"
      data-is-authority="false"
      data-read-only="true"
      data-may-confirm="false"
      data-may-emit="false"
    >
      <header>
        <h2>Clinical Timeline (read-only)</h2>
        <p>
          Unified chronological view for navigation. Never confirms, emits, or
          changes COS ownership.
        </p>
      </header>
      {message ? <p data-testid="w3-timeline-message">{message}</p> : null}
      <div data-testid="w3-timeline-filters">
        <label>
          Source{" "}
          <select
            value={sourceFilter}
            onChange={(e) => onSourceFilterChange?.(e.target.value)}
            data-testid="w3-timeline-source-filter"
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Group{" "}
          <select
            value={groupBy}
            onChange={(e) =>
              onGroupByChange?.(e.target.value as "none" | "day" | "source")
            }
            data-testid="w3-timeline-group-by"
          >
            <option value="none">None</option>
            <option value="day">Day</option>
            <option value="source">Source</option>
          </select>
        </label>
      </div>
      {renderGroups.map((g) => (
        <div key={g.groupKey} data-testid="w3-timeline-group" data-group={g.groupKey}>
          <h3>{g.label}</h3>
          <ul>
            {(groupBy === "none" ? windowed : g.events).map((e) => (
              <li
                key={e.eventId}
                data-testid="w3-timeline-event"
                data-source={e.sourceKind}
                data-advisory={String(e.advisory)}
              >
                <p>
                  <strong>{e.title}</strong> · {e.sourceKind}
                  {e.advisory ? " · advisory" : ""}
                </p>
                <p>{e.summary}</p>
                <time dateTime={e.occurredAt}>{e.occurredAt}</time>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
