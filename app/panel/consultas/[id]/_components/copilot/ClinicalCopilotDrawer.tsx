"use client";

import { useEffect, useMemo } from "react";
import { useDoctorDna } from "@/hooks/useDoctorDna";
import { EMPTY_PATIENT_CLINICAL_MEMORY } from "@/hooks/usePatientClinicalMemory";
import { buildClinicalMemoryView } from "@/lib/clinical-memory";
import {
  buildClinicalCopilotIntelligence,
  COPILOT_SILENCE_MESSAGE,
  type CopilotInsight,
  type CopilotInsightKind,
  type DocumentationGap,
} from "@/lib/clinical-copilot-intelligence";
import { buildDoctorDnaIntelligenceView } from "@/lib/doctor-dna-intelligence";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";
import { useDailyHubPreVisit } from "@/hooks/useDailyHubPreVisit";
import { useCloseHitlExecution } from "@/hooks/useCloseHitlExecution";
import { useLiveClinicalContextTimeline } from "@/hooks/useLiveClinicalContextTimeline";
import { useLiveClinicalInsights } from "@/hooks/useLiveClinicalInsights";
import { useReviewSelectionLayer } from "@/hooks/useReviewSelectionLayer";
import { useSuggestedInterviewQuestions } from "@/hooks/useSuggestedInterviewQuestions";
import type {
  ClinicalFoundationBundle,
  ClinicalFoundationFinding,
  ClinicalFoundationOutputs,
} from "@/lib/types/clinical-foundation";
import type { NestConsultation } from "@/lib/services/consultations";
import { cn } from "@/lib/utils";
import {
  CLINICAL_OVERLAY_BACKDROP_CLASS,
  CLINICAL_OVERLAY_PANEL_CLASS,
} from "@/lib/clinical-overlay-contract";
import { CopilotActionSystem } from "./CopilotActionSystem";
import { CopilotContextEngine } from "./CopilotContextEngine";
import { CopilotDocumentationGaps } from "./CopilotDocumentationGaps";
import { CopilotDocumentationQuality } from "./CopilotDocumentationQuality";
import { CopilotGovernanceBoundary } from "./CopilotGovernanceBoundary";
import { CopilotInsightCards } from "./CopilotInsightCards";
import { CopilotClinicalReviewWorkspace } from "./CopilotClinicalReviewWorkspace";
import { CopilotLiveClinicalInsights } from "./CopilotLiveClinicalInsights";
import { buildClinicalReviewWorkspaceMeta } from "@/lib/epic3/clinical-review-workspace";
import { buildPersistencePreview } from "@/lib/epic3/persistence-preview";
import { buildPreVisitClinicalSnapshot } from "@/lib/epic3/pre-visit-clinical-snapshot";
import { evaluateLiveDocumentationQuality } from "@/lib/epic3/live-documentation-quality";
import { evaluatePreVisitQualitySignals } from "@/lib/epic3/pre-visit-quality-signals";
import { CopilotSuggestedInterviewQuestions } from "./CopilotSuggestedInterviewQuestions";
import { CopilotRiskSignals } from "./CopilotRiskSignals";

export interface ClinicalCopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  consultation?: NestConsultation | null;
  consultationId?: string | null;
  patientId?: string | null;
  diagnosis?: string | null;
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  chiefComplaint?: string | null;
  treatment?: string | null;
  notes?: string | null;
  patientName?: string | null;
  patientAge?: string | number | null;
  patientSex?: string | null;
  clinicalMemory?: PatientClinicalMemory;
  /** Full Clinical Foundation bundle (UC-01 Prep). */
  clinicalFoundation?: ClinicalFoundationBundle | null;
  clinicalFoundationLoading?: boolean;
  clinicalFoundationError?: string | null;
  foundationOutputs?: ClinicalFoundationOutputs | null;
  /** @deprecated Unused — UC-02B/03C are the sole generative Daily Hub surfaces. */
  generativeExpandToken?: number;
  /** UC-04D H4 — prefer encounter handleSign (flush + tracking). */
  onSignConsultation?: (signatureBase64: string) => Promise<void>;
  /** UC-04D after H3 — refresh consultation expectedVersion / notes. */
  onClosePersisted?: () => void;
}

function mapFoundationFindingKind(
  finding: ClinicalFoundationFinding,
): CopilotInsightKind {
  switch (finding.category) {
    case "medication":
    case "order":
      return "medication";
    case "vital_sign":
      return "vitals";
    case "memory":
      return "continuity";
    default:
      return "context";
  }
}

function mapFoundationFindingsToInsights(
  outputs?: ClinicalFoundationOutputs | null,
): CopilotInsight[] {
  return (outputs?.clinicalFindings ?? []).map((finding) => ({
    id: `foundation-${finding.id}`,
    kind: mapFoundationFindingKind(finding),
    title: finding.label,
    body: finding.value,
  }));
}

function mapFoundationGapsToDocumentationGaps(
  outputs?: ClinicalFoundationOutputs | null,
): DocumentationGap[] {
  return (outputs?.documentationGaps ?? []).map((gap) => ({
    id: `foundation-${gap.id}`,
    field: gap.code,
    message: gap.label,
  }));
}

export function ClinicalCopilotDrawer({
  open,
  onClose,
  consultation = null,
  consultationId,
  patientId,
  diagnosis,
  diagnosisCode,
  diagnosisDescription,
  chiefComplaint,
  treatment,
  notes,
  patientName,
  patientAge,
  patientSex,
  clinicalMemory: providedClinicalMemory,
  clinicalFoundation = null,
  clinicalFoundationLoading = false,
  clinicalFoundationError = null,
  foundationOutputs,
  generativeExpandToken: _generativeExpandToken = 0,
  onSignConsultation,
  onClosePersisted,
}: ClinicalCopilotDrawerProps) {
  void _generativeExpandToken;
  const clinicalMemoryData =
    providedClinicalMemory ?? EMPTY_PATIENT_CLINICAL_MEMORY;
  const { data: doctorDnaData, loading: dnaLoading, error: dnaError } =
    useDoctorDna();
  const { view: preVisitView, agendaLoading } = useDailyHubPreVisit({
    open,
    consultationId,
    patientId,
    foundation: clinicalFoundation,
    foundationLoading: clinicalFoundationLoading,
    foundationError: clinicalFoundationError,
  });
  const preVisitQualitySignals = useMemo(
    () => evaluatePreVisitQualitySignals(clinicalFoundation),
    [clinicalFoundation],
  );
  const preVisitClinicalSnapshot = useMemo(
    () => buildPreVisitClinicalSnapshot(clinicalFoundation),
    [clinicalFoundation],
  );
  const interviewQuestions = useSuggestedInterviewQuestions({
    open,
    sessionId: preVisitView.sessionId,
    sessionBootstrapping:
      preVisitView.sessionStatus === "idle" ||
      preVisitView.sessionStatus === "loading",
    preVisit: preVisitView,
    qualitySignals: preVisitQualitySignals,
    foundation: clinicalFoundation,
  });
  const liveTimeline = useLiveClinicalContextTimeline({
    open,
    sessionId: preVisitView.sessionId,
    consultation,
    foundation: clinicalFoundation,
  });
  const liveDocumentationQuality = useMemo(
    () =>
      evaluateLiveDocumentationQuality({
        consultation,
        foundation: clinicalFoundation,
      }),
    [consultation, clinicalFoundation],
  );
  const liveInsights = useLiveClinicalInsights({
    open,
    sessionId: preVisitView.sessionId,
    sessionBootstrapping:
      preVisitView.sessionStatus === "idle" ||
      preVisitView.sessionStatus === "loading",
    consultation,
    foundation: clinicalFoundation,
    documentationQuality: liveDocumentationQuality,
  });
  const clinicalReviewWorkspace = useMemo(
    () =>
      buildClinicalReviewWorkspaceMeta({
        sessionId: preVisitView.sessionId,
        interviewBatch: interviewQuestions.batch,
        insightsBatch: liveInsights.batch,
      }),
    [
      preVisitView.sessionId,
      interviewQuestions.batch,
      liveInsights.batch,
    ],
  );
  const reviewSelection = useReviewSelectionLayer({
    open,
    sessionId: preVisitView.sessionId,
    interviewBatch: interviewQuestions.batch,
    insightsBatch: liveInsights.batch,
    snapshot: preVisitClinicalSnapshot,
  });
  const persistencePreview = useMemo(
    () =>
      buildPersistencePreview({
        reviewState: reviewSelection.state,
        consultationId: consultationId ?? consultation?.id ?? null,
        foundationProvenance: clinicalFoundation?.provenance ?? null,
      }),
    [
      reviewSelection.state,
      consultationId,
      consultation?.id,
      clinicalFoundation?.provenance,
    ],
  );
  const closeHitl = useCloseHitlExecution({
    open,
    preview: persistencePreview,
    expectedVersion: consultation?.updatedAt ?? null,
    existingNotes: notes ?? consultation?.notes ?? null,
    signConsultationFn: onSignConsultation,
    onPersisted: onClosePersisted,
  });

  const clinicalMemory = useMemo(
    () =>
      patientId
        ? buildClinicalMemoryView({
            memory: clinicalMemoryData,
            encounterDiagnosis:
              diagnosisDescription?.trim() || diagnosis?.trim() || null,
          })
        : null,
    [clinicalMemoryData, diagnosis, diagnosisDescription, patientId],
  );

  const doctorDna = useMemo(
    () =>
      !dnaLoading && !dnaError
        ? buildDoctorDnaIntelligenceView(doctorDnaData)
        : null,
    [doctorDnaData, dnaLoading, dnaError],
  );

  const intelligence = useMemo(
    () =>
      buildClinicalCopilotIntelligence({
        consultationId,
        diagnosis,
        diagnosisCode,
        diagnosisDescription,
        chiefComplaint,
        treatment,
        notes,
        patientName,
        patientAge,
        patientSex,
        clinicalMemory,
        clinicalMemoryRaw: clinicalMemoryData.patientId
          ? clinicalMemoryData
          : null,
        doctorDna,
      }),
    [
      consultationId,
      diagnosis,
      diagnosisCode,
      diagnosisDescription,
      chiefComplaint,
      treatment,
      notes,
      patientName,
      patientAge,
      patientSex,
      clinicalMemory,
      clinicalMemoryData,
      doctorDna,
    ],
  );

  const foundationInsights = useMemo(
    () => mapFoundationFindingsToInsights(foundationOutputs),
    [foundationOutputs],
  );
  const foundationGaps = useMemo(
    () => mapFoundationGapsToDocumentationGaps(foundationOutputs),
    [foundationOutputs],
  );
  const displayedInsights =
    foundationInsights.length > 0 ? foundationInsights : intelligence.insights;
  // Foundation disponible (aunque con 0 gaps) es el SoT de Documentation Gaps.
  // Antes, length===0 caía al heurístico y mostraba pendientes inexistentes.
  const displayedGaps =
    foundationOutputs != null
      ? foundationGaps
      : intelligence.documentationGaps;
  const silenceMode =
    displayedInsights.length === 0 &&
    intelligence.riskSignals.length === 0 &&
    displayedGaps.length === 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar Clinical Copilot"
        className={cn(
          "clinical-drawer-enter fixed inset-0 bg-slate-900/10",
          CLINICAL_OVERLAY_BACKDROP_CLASS.intelligence,
        )}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="false"
        aria-label="Clinical Copilot"
        className={cn(
          "clinical-drawer-enter fixed inset-y-0 left-0 flex w-full max-w-md flex-col",
          "border-r border-hd-border-subtle bg-hd-surface-chrome shadow-hd-3",
          CLINICAL_OVERLAY_PANEL_CLASS.intelligence,
        )}
      >
        <header className="shrink-0 border-b border-hd-border-subtle px-hd-4 py-hd-3">
          <div className="heydoctor-presence">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
              Clinical Copilot Daily Hub · Prep
            </p>
            <h2 className="text-sm font-semibold text-slate-900">
              Clinical Copilot™
            </h2>
            <p className="text-[10px] text-slate-500">
              Contexto pre-consulta · solo lectura
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="clinical-interactive absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-hd-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-hd-5 overflow-y-auto px-hd-4 py-hd-4">
          {/* Prep/Live generative SSOT (UC-02B / UC-03C) — single surface */}
          <CopilotSuggestedInterviewQuestions
            batch={interviewQuestions.batch}
            loading={interviewQuestions.loading}
            error={interviewQuestions.error}
            onRegenerate={() => {
              void interviewQuestions.regenerate();
            }}
            onUpdate={interviewQuestions.updateSuggestion}
            onDiscard={interviewQuestions.discardSuggestion}
          />
          <CopilotLiveClinicalInsights
            batch={liveInsights.batch}
            loading={liveInsights.loading}
            error={liveInsights.error}
            onRegenerate={() => {
              void liveInsights.regenerate();
            }}
            onDiscard={liveInsights.discardInsight}
          />
          {/* Close SSOT — observational + H1 selection + preview + H2/H3/H4 */}
          <CopilotClinicalReviewWorkspace
            meta={clinicalReviewWorkspace}
            agendaLoading={agendaLoading}
            preVisitView={preVisitView}
            clinicalSnapshot={preVisitClinicalSnapshot}
            qualitySignals={preVisitQualitySignals}
            documentationQuality={liveDocumentationQuality}
            timelineView={liveTimeline.view}
            timelineLoading={liveTimeline.loading}
            timelineError={liveTimeline.error}
            onTimelineRefresh={() => {
              void liveTimeline.refresh();
            }}
            reviewState={reviewSelection.state}
            reviewSummary={reviewSelection.summary}
            onReviewAccept={(id) => {
              void reviewSelection.accept(id);
            }}
            onReviewDiscard={(id) => {
              void reviewSelection.discard(id);
            }}
            onReviewEdit={(id, text) => {
              void reviewSelection.edit(id, text);
            }}
            reviewBusy={reviewSelection.busy}
            reviewError={reviewSelection.error}
            persistencePreview={persistencePreview}
            closeAudit={closeHitl.audit}
            closeGateOk={closeHitl.gateOk}
            closeGateReason={closeHitl.gateReason}
            closeBusy={closeHitl.busy}
            closeError={closeHitl.error}
            onCloseApproveH2={() => {
              void closeHitl.approveH2();
            }}
            onCloseExecuteH3={() => {
              void closeHitl.executeH3();
            }}
            onCloseSignH4={(signatureBase64) => {
              void closeHitl.signH4(signatureBase64);
            }}
          />
          <CopilotGovernanceBoundary />
          {silenceMode ? (
            <p
              role="status"
              className="rounded-hd-md border border-slate-200/80 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-600"
            >
              {COPILOT_SILENCE_MESSAGE}
            </p>
          ) : null}
          {foundationOutputs?.clinicalSummary ? (
            <section className="rounded-hd-md border border-primary/10 bg-primaryLight/40 px-hd-3 py-hd-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Resumen Foundation
              </p>
              <ul className="space-y-1 text-[11px] leading-relaxed text-slate-700">
                {foundationOutputs.clinicalSummary.lines.slice(0, 4).map((line) => (
                  <li key={line.id}>{line.text}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <CopilotDocumentationQuality quality={intelligence.documentationQuality} />
          <CopilotContextEngine context={intelligence.context} />
          <CopilotInsightCards insights={displayedInsights} />
          <CopilotRiskSignals signals={intelligence.riskSignals} />
          <CopilotDocumentationGaps gaps={displayedGaps} />
          <CopilotActionSystem />
        </div>
      </aside>
    </>
  );
}

export function ClinicalCopilotTrigger({
  onClick,
  active = false,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir Clinical Copilot"
      title="Clinical Copilot"
      className={cn(
        "clinical-interactive inline-flex h-8 items-center gap-1 rounded-hd-md border px-2 text-xs font-medium",
        active
          ? "border-primary bg-primaryLight text-primary"
          : "border-hd-border-subtle bg-hd-surface-raised text-slate-600 hover:bg-hd-surface-muted",
        className,
      )}
    >
      <span aria-hidden>✨</span>
      <span className="hidden md:inline">Copilot</span>
    </button>
  );
}
