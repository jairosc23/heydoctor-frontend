"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import type { MedicalCopilotMemorySummary } from "@/lib/medical-copilot/types";
import { MedicalCopilotEmptyState } from "./states";

export function ConversationMemoryPanel({
  memory,
}: {
  memory: MedicalCopilotMemorySummary | null;
}) {
  const entries = memory?.entries ?? [];

  return (
    <ClinicalPanel depth={2} className="min-h-[12rem]">
      <ClinicalSection title="Conversation Memory">
        <p className="mb-3 text-sm text-slate-500">
          Memoria clínica efímera de la sesión. No es historial de chat ni prompts.
        </p>
        {entries.length === 0 ? (
          <MedicalCopilotEmptyState
            title="Sin entradas de memoria"
            description="Solo se muestran resúmenes y referencias a artifacts."
          />
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.entryId}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {entry.memoryType}
                </p>
                <p className="text-sm text-slate-800">{entry.summary}</p>
                <p className="text-xs text-slate-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </ClinicalSection>
    </ClinicalPanel>
  );
}
