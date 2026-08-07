"use client";

/**
 * Workspace runtime strip + capability hosts.
 * Capabilities consume the shared Clinical Snapshot (CCE) — no local context copies.
 */

import { ClinicalDictationPanel } from "@/components/medical-copilot/ClinicalDictationPanel";
import { ClinicalWorkflowBanner } from "@/components/medical-copilot/ClinicalWorkflowBanner";
import { ClinicalVoiceSuggestionsPanel } from "@/components/medical-copilot/ClinicalVoiceSuggestionsPanel";
import { ClinicalPanelFrame } from "@/components/encounter/ClinicalPanelFrame";
import { useEncounterMemoryOptional } from "@/context/EncounterMemoryContext";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
import { useClinicalWorkflow } from "@/context/ClinicalWorkflowContext";
import { useClinicalSnapshot } from "@/hooks/useClinicalSnapshot";
import {
  HEYDOCTOR_COPILOT_BRAND,
  HEYDOCTOR_COPILOT_COPY,
} from "@/lib/brand/heydoctor-copilot";
import { resolveClinicalPanelUiState } from "@/lib/encounter/clinical-panel-ui";
import { navigateToEncounterSection } from "@/lib/encounter/navigation/section-navigation";
import { ClinicalSnapshotPanel } from "@/components/encounter/ClinicalSnapshotPanel";

export function HeyDoctorCopilotRuntimeStrip() {
  const { phase, status, progress } = useClinicalWorkflow();
  const { loading, ready } = useMedicalCopilot();
  const memoryCtx = useEncounterMemoryOptional();
  const memory = memoryCtx?.memory;

  return (
    <section
      aria-label={HEYDOCTOR_COPILOT_COPY.runtimeStripAria}
      data-testid="heydoctor-copilot-runtime-strip"
      data-ui-state={
        loading ? "loading" : ready || memory ? "ready" : "empty"
      }
      className="rounded-hd-md border border-slate-200 bg-slate-50/90 px-hd-3 py-hd-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {HEYDOCTOR_COPILOT_BRAND.workspaceLabel}
          </p>
          <p className="mt-0.5 text-[12px] font-semibold text-slate-900">
            {(memory?.workflowPhase ?? phase).split("_").join(" ")}
          </p>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          <p>
            {memory?.encounterStatus ?? status}
            {loading ? " · bootstrapping" : ready ? " · ready" : ""}
          </p>
        </div>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        data-testid="heydoctor-copilot-encounter-memory"
        data-encounter-status={memory?.encounterStatus ?? ""}
        data-workflow-phase={memory?.workflowPhase ?? ""}
        data-problems={String(memory?.activeProblems.length ?? 0)}
      >
        <div
          className="h-full rounded-full bg-slate-800 transition-all"
          style={{ width: `${progress.percent}%` }}
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del encuentro"
        />
      </div>
    </section>
  );
}

export function HeyDoctorCopilotVoiceCapability() {
  const { loading } = useMedicalCopilot();
  const snapshot = useClinicalSnapshot();
  const uiState = resolveClinicalPanelUiState({
    loading: loading && !snapshot,
    hasData: snapshot != null,
  });

  return (
    <ClinicalPanelFrame
      state={uiState === "loading" ? "loading" : "ready"}
      label="Voice Dictation"
      testId="heydoctor-copilot-voice-capability"
      loadingLabel="Preparando Voice Dictation y Clinical Snapshot…"
      emptyTitle="Voice Dictation no disponible"
      emptyDescription="El runtime del encuentro aún no expone dictado para esta sesión."
    >
      <ClinicalSnapshotPanel
        snapshot={snapshot}
        variant="compact"
        loading={loading && !snapshot}
      />
      <ClinicalDictationPanel />
      <ClinicalVoiceSuggestionsPanel />
    </ClinicalPanelFrame>
  );
}

export function HeyDoctorCopilotReviewSignCapability({
  onOpenEvidence,
}: {
  onOpenEvidence: () => void;
}) {
  const snapshot = useClinicalSnapshot();

  return (
    <ClinicalPanelFrame
      state="ready"
      label="Review & Sign"
      testId="heydoctor-copilot-review-sign-capability"
      emptyTitle="Sin Clinical Snapshot para cierre"
      emptyDescription="Review & Sign necesita Encounter Memory montado para compartir el mismo contexto clínico del encuentro."
    >
      <ClinicalSnapshotPanel snapshot={snapshot} variant="compact" />
      <p className="text-[11px] leading-relaxed text-slate-600">
        {HEYDOCTOR_COPILOT_COPY.reviewSignHint}
      </p>
      <ClinicalWorkflowBanner />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="clinical-interactive rounded-hd-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
          onClick={() => {
            navigateToEncounterSection("encounter-section-20");
          }}
        >
          {HEYDOCTOR_COPILOT_COPY.goToSignature}
        </button>
        <button
          type="button"
          className="clinical-interactive rounded-hd-md border border-primary/30 bg-primaryLight px-3 py-1.5 text-[11px] font-semibold text-primary"
          onClick={onOpenEvidence}
        >
          Evidence · Close HITL
        </button>
      </div>
    </ClinicalPanelFrame>
  );
}

export function HeyDoctorCopilotContinuityCapability({
  onOpenContinuity,
}: {
  onOpenContinuity?: () => void;
}) {
  const snapshot = useClinicalSnapshot();

  return (
    <ClinicalPanelFrame
      state="ready"
      label="Continuity"
      testId="heydoctor-copilot-continuity-capability"
      emptyTitle="Continuity sin contexto de encuentro"
      emptyDescription="Continuity es una capability del mismo Encounter — requiere Encounter Memory / Clinical Snapshot compartido."
    >
      <ClinicalSnapshotPanel snapshot={snapshot} variant="compact" />
      <p className="text-[11px] leading-relaxed text-slate-600">
        Encounter Timeline — continuidad del mismo encuentro clínico. No es otro
        producto: abre la línea de tiempo Continuity sobre el Clinical Snapshot
        compartido (Memory · Insights · Voice · Review).
      </p>
      <button
        type="button"
        className="clinical-interactive rounded-hd-md border border-primary/30 bg-primaryLight px-3 py-1.5 text-[11px] font-semibold text-primary"
        onClick={() => onOpenContinuity?.()}
      >
        Abrir Encounter Timeline
      </button>
    </ClinicalPanelFrame>
  );
}
