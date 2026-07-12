"use client";

import { useEffect } from "react";
import {
  useClinicalActions,
  useConversationMemory,
  useMedicalCopilot,
  useTimeline,
  useWorkspace,
} from "@/context/MedicalCopilotContext";
import { ClinicalActionsPanel } from "./ClinicalActionsPanel";
import { ClinicalTimelinePanel } from "./ClinicalTimelinePanel";
import { ClinicalWorkspacePanel } from "./ClinicalWorkspacePanel";
import { ConversationMemoryPanel } from "./ConversationMemoryPanel";
import { MedicalCopilotErrorBoundary } from "./MedicalCopilotErrorBoundary";
import { MedicalCopilotHeader } from "./MedicalCopilotHeader";
import { MedicalCopilotSessionCard } from "./MedicalCopilotSessionCard";
import {
  MedicalCopilotErrorState,
  MedicalCopilotLoadingState,
} from "./states";

export type MedicalCopilotWorkspaceProps = {
  consultationId: string;
  patientId: string;
  appointmentId?: string | null;
};

/**
 * CP-25 — presentation consumes MedicalCopilotStore via hooks only.
 */
export function MedicalCopilotWorkspace({
  consultationId,
  patientId,
  appointmentId,
}: MedicalCopilotWorkspaceProps) {
  const {
    session,
    loading,
    ready,
    error,
    hasError,
    bootstrap,
  } = useMedicalCopilot();
  const { workspace } = useWorkspace();
  const { timeline } = useTimeline();
  const { memory } = useConversationMemory();
  const {
    actions,
    busyActionId,
    actionError,
    approveAction,
    rejectAction,
  } = useClinicalActions();

  useEffect(() => {
    void bootstrap({
      consultationId,
      patientId,
      appointmentId,
    });
  }, [appointmentId, bootstrap, consultationId, patientId]);

  return (
    <MedicalCopilotErrorBoundary>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <MedicalCopilotHeader
          consultationId={consultationId}
          sessionId={session?.sessionId}
        />

        {loading ? <MedicalCopilotLoadingState /> : null}

        {hasError && !ready ? (
          <MedicalCopilotErrorState
            message={error ?? undefined}
            onRetry={() =>
              void bootstrap({
                consultationId,
                patientId,
                appointmentId,
              })
            }
          />
        ) : null}

        {ready ? (
          <>
            <MedicalCopilotSessionCard session={session} />
            <div className="grid gap-4 lg:grid-cols-2">
              <ClinicalWorkspacePanel workspace={workspace} />
              <ConversationMemoryPanel memory={memory} />
              <ClinicalTimelinePanel timeline={timeline} />
              <ClinicalActionsPanel
                actions={actions}
                busyActionId={busyActionId}
                onApprove={(actionId) => void approveAction(actionId)}
                onReject={(actionId) => void rejectAction(actionId)}
              />
            </div>
            {actionError ? (
              <MedicalCopilotErrorState
                title="Acción no completada"
                message={actionError}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </MedicalCopilotErrorBoundary>
  );
}
