"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import type { MedicalCopilotTimelineSummary } from "@/lib/medical-copilot/types";
import {
  formatEventLabel,
  sortTimelineEntries,
} from "@/lib/medical-copilot/view-model";
import { MedicalCopilotEmptyState } from "./states";

export function ClinicalTimelinePanel({
  timeline,
}: {
  timeline: MedicalCopilotTimelineSummary | null;
}) {
  const entries = sortTimelineEntries(timeline?.entries);

  return (
    <ClinicalPanel depth={2} className="min-h-[12rem]">
      <ClinicalSection title="Clinical Timeline">
        <p className="mb-3 text-sm text-slate-500">
          Proyección cronológica por referencias. No copia artifacts ni memoria.
        </p>
        {entries.length === 0 ? (
          <MedicalCopilotEmptyState
            title="Timeline vacío"
            description="Los eventos de sesión, workspace y memoria aparecerán aquí."
          />
        ) : (
          <ol className="space-y-3 border-l border-slate-200 pl-4">
            {entries.map((entry) => (
              <li key={entry.timelineEntryId} className="relative">
                <span className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {formatEventLabel(entry.eventType)}
                </p>
                <p className="text-sm text-slate-800">{entry.summary}</p>
                <p className="text-xs text-slate-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        )}
      </ClinicalSection>
    </ClinicalPanel>
  );
}
