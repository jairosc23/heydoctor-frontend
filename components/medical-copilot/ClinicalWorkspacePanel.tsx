"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { ClinicalStatusBadge } from "@/components/clinical/design";
import type { MedicalCopilotWorkspaceSummary } from "@/lib/medical-copilot/types";
import { MedicalCopilotEmptyState } from "./states";

export function ClinicalWorkspacePanel({
  workspace,
}: {
  workspace: MedicalCopilotWorkspaceSummary | null;
}) {
  const artifacts = workspace?.artifacts ?? [];

  return (
    <ClinicalPanel depth={2} className="min-h-[12rem]">
      <ClinicalSection title="Clinical Workspace">
        <p className="mb-3 text-sm text-slate-500">
          Artifacts clínicos publicados (borradores). Nunca se ejecutan ni
          persisten en EMR desde aquí.
        </p>
        {!workspace ? (
          <MedicalCopilotEmptyState title="Sin workspace" />
        ) : artifacts.length === 0 ? (
          <MedicalCopilotEmptyState
            title="Sin artifacts todavía"
            description="Cuando Skills publiquen borradores, aparecerán aquí versionados."
          />
        ) : (
          <ul className="space-y-2">
            {artifacts.map((artifact) => (
              <li
                key={artifact.artifactId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {artifact.artifactType}
                  </p>
                  <p className="text-xs text-slate-500">
                    v{artifact.version}
                    {artifact.sourceSkill
                      ? ` · skill ${artifact.sourceSkill}`
                      : ""}
                  </p>
                </div>
                <ClinicalStatusBadge
                  status={
                    artifact.status === "ready_for_review"
                      ? "pending"
                      : artifact.status === "superseded"
                        ? "draft"
                        : "active"
                  }
                  label={artifact.status}
                />
              </li>
            ))}
          </ul>
        )}
      </ClinicalSection>
    </ClinicalPanel>
  );
}
