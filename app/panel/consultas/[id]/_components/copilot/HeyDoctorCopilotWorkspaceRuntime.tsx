"use client";

/**
 * P0 — Workspace runtime strip + capability hosts reused from existing surfaces.
 * Requires HeyDoctorCopilotRuntimeProviders (Encounter-scoped).
 */

import { ClinicalDictationPanel } from "@/components/medical-copilot/ClinicalDictationPanel";
import { ClinicalWorkflowBanner } from "@/components/medical-copilot/ClinicalWorkflowBanner";
import { ClinicalVoiceSuggestionsPanel } from "@/components/medical-copilot/ClinicalVoiceSuggestionsPanel";
import { useEncounterMemory } from "@/context/EncounterMemoryContext";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
import { useClinicalWorkflow } from "@/context/ClinicalWorkflowContext";
import {
  HEYDOCTOR_COPILOT_BRAND,
  HEYDOCTOR_COPILOT_COPY,
} from "@/lib/brand/heydoctor-copilot";
import { navigateToEncounterSection } from "@/lib/encounter/navigation/section-navigation";

export function HeyDoctorCopilotRuntimeStrip() {
  const { phase, status, sessionId, progress } = useClinicalWorkflow();
  const { session, loading, ready } = useMedicalCopilot();
  const { memory } = useEncounterMemory();

  return (
    <section
      aria-label={HEYDOCTOR_COPILOT_COPY.runtimeStripAria}
      data-testid="heydoctor-copilot-runtime-strip"
      className="rounded-hd-md border border-slate-200 bg-slate-50/90 px-hd-3 py-hd-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {HEYDOCTOR_COPILOT_BRAND.productName} ·{" "}
            {HEYDOCTOR_COPILOT_BRAND.workspaceLabel}
          </p>
          <p className="mt-0.5 text-[12px] font-semibold text-slate-900">
            {(memory.workflowPhase ?? phase).split("_").join(" ")}
          </p>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          <p>status · {memory.encounterStatus ?? status}</p>
          <p>
            session ·{" "}
            {sessionId
              ? `${sessionId.slice(0, 10)}…`
              : session?.sessionId
                ? `${session.sessionId.slice(0, 10)}…`
                : loading
                  ? "bootstrapping…"
                  : ready
                    ? "ready"
                    : "pending"}
          </p>
          <p>
            memory · problems {memory.activeProblems.length} · pending{" "}
            {memory.pendingActions.length} · dictation{" "}
            {memory.dictationBufferRef?.draftLength ?? 0}c
          </p>
          <p>{progress.percent}% · NON_AUTHORITY</p>
        </div>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        data-testid="heydoctor-copilot-encounter-memory"
        data-encounter-status={memory.encounterStatus ?? ""}
        data-workflow-phase={memory.workflowPhase ?? ""}
        data-problems={String(memory.activeProblems.length)}
      >
        <div
          className="h-full rounded-full bg-slate-800 transition-all"
          style={{ width: `${progress.percent}%` }}
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </section>
  );
}

export function HeyDoctorCopilotVoiceCapability() {
  const { memory } = useEncounterMemory();
  return (
    <div className="space-y-hd-3" data-testid="heydoctor-copilot-voice-capability">
      <p className="text-[10px] text-slate-500">
        Encounter Memory · dictation {memory.dictationBufferRef?.status ?? "idle"} ·{" "}
        {memory.dictationBufferRef?.draftLength ?? 0} chars
      </p>
      <ClinicalDictationPanel />
      <ClinicalVoiceSuggestionsPanel />
    </div>
  );
}

export function HeyDoctorCopilotReviewSignCapability({
  onOpenEvidence,
}: {
  onOpenEvidence: () => void;
}) {
  const { memory } = useEncounterMemory();
  return (
    <div
      className="space-y-hd-3"
      data-testid="heydoctor-copilot-review-sign-capability"
    >
      <p className="text-[11px] leading-relaxed text-slate-600">
        {HEYDOCTOR_COPILOT_COPY.reviewSignHint}
      </p>
      <p className="text-[10px] text-slate-500">
        Encounter Memory · phase {memory.workflowPhase ?? "—"} · pending{" "}
        {memory.pendingActions.length} · decisions{" "}
        {memory.encounterDecisions.length}
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
    </div>
  );
}

export function HeyDoctorCopilotContinuityCapability({
  onOpenContinuity,
}: {
  onOpenContinuity?: () => void;
}) {
  const { memory } = useEncounterMemory();
  return (
    <div
      className="space-y-hd-3"
      data-testid="heydoctor-copilot-continuity-capability"
    >
      <p className="text-[11px] leading-relaxed text-slate-600">
        Longitudinal continuity for this patient — same Continuity surface, not a
        second product.
      </p>
      <p className="text-[10px] text-slate-500">
        Encounter Memory · active problems:{" "}
        {memory.activeProblems.length
          ? memory.activeProblems.join(", ")
          : "none recorded"}
      </p>
      <button
        type="button"
        className="clinical-interactive rounded-hd-md border border-primary/30 bg-primaryLight px-3 py-1.5 text-[11px] font-semibold text-primary"
        onClick={() => onOpenContinuity?.()}
      >
        {HEYDOCTOR_COPILOT_COPY.openContinuity}
      </button>
    </div>
  );
}
