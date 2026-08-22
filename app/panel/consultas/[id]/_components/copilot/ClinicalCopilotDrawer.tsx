"use client";

import { useEffect, useMemo, useState } from "react";
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
import { CLINICAL_OVERLAY_DRAWER_PANEL_CLASS } from "@/lib/clinical-overlay-contract";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";
import {
  HEYDOCTOR_COPILOT_BRAND,
  HEYDOCTOR_COPILOT_CAPABILITIES,
  HEYDOCTOR_COPILOT_COPY,
  HEYDOCTOR_COPILOT_DEFAULT_SECTION,
  type HeyDoctorCopilotSectionId,
} from "@/lib/brand/heydoctor-copilot";
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
import { ClinicalSnapshotPanel } from "@/components/encounter/ClinicalSnapshotPanel";
import {
  HeyDoctorCopilotContinuityCapability,
  HeyDoctorCopilotReviewSignCapability,
  HeyDoctorCopilotRuntimeStrip,
  HeyDoctorCopilotVoiceCapability,
} from "./HeyDoctorCopilotWorkspaceRuntime";
import { useClinicalSnapshot } from "@/hooks/useClinicalSnapshot";

export interface ClinicalCopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Opens the single Continuity portal (Action Bar / Workspace — same surface). */
  onOpenContinuity?: () => void;
  /** When true, runtime strip + workflow capabilities are available (providers mounted). */
  runtimeEnabled?: boolean;
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
  /** CX-01 I4 — cambios locales aún no guardados (p. ej. antecedentes). */
  hasUnsavedClinicalChanges?: boolean;
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
  onOpenContinuity,
  runtimeEnabled = false,
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
  hasUnsavedClinicalChanges = false,
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
  // Preferir gaps del bundle persistido cuando está disponible (incluye lista vacía).
  const displayedGaps =
    foundationOutputs != null
      ? foundationGaps
      : intelligence.documentationGaps;
  const documentationGapsSyncState =
    clinicalFoundationLoading
      ? ("loading" as const)
      : hasUnsavedClinicalChanges
        ? ("unsaved_changes" as const)
        : foundationOutputs != null
          ? ("synced" as const)
          : ("unavailable" as const);
  const silenceMode =
    displayedInsights.length === 0 &&
    intelligence.riskSignals.length === 0 &&
    displayedGaps.length === 0;

  // One Clinical Snapshot from Encounter Shell SSOT (provider) — no local copy.
  const clinicalSnapshot = useClinicalSnapshot();

  const [activeSection, setActiveSection] =
    useState<HeyDoctorCopilotSectionId>(HEYDOCTOR_COPILOT_DEFAULT_SECTION);

  useEffect(() => {
    if (!open) {
      clinicalWorkspaceKernel.dismiss("copilot");
      return;
    }
    setActiveSection(HEYDOCTOR_COPILOT_DEFAULT_SECTION);
    clinicalWorkspaceKernel.present({
      id: "copilot",
      kind: "drawer",
      blocking: true,
      onDismiss: onClose,
      backdropAriaLabel: HEYDOCTOR_COPILOT_COPY.close,
    });
    return () => {
      clinicalWorkspaceKernel.dismiss("copilot");
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || activeSection !== "continuity") return;
    onOpenContinuity?.();
  }, [activeSection, onOpenContinuity, open]);

  if (!open) return null;

  const viewport = clinicalWorkspaceKernel.getViewport();

  return (
    <>
      <aside
        role="dialog"
        aria-modal="false"
        aria-label={HEYDOCTOR_COPILOT_COPY.workspaceAria}
        data-testid="heydoctor-copilot-workspace"
        className={cn(
          "clinical-drawer-enter left-0 flex w-full max-w-xl flex-col md:left-[var(--workspace-sidebar-w)]",
          "border-r border-hd-border-subtle bg-hd-surface-chrome shadow-hd-3",
          CLINICAL_OVERLAY_DRAWER_PANEL_CLASS,
        )}
        style={{
          ["--workspace-sidebar-w" as string]: `${viewport.sidebarWidth}px`,
        }}
        data-overlay-layer="drawers"
      >
        {/* HERO — product identity (Brand Promise once here; not every screen) */}
        <header
          className="relative shrink-0 border-b border-hd-border-subtle px-hd-4 py-hd-4"
          data-testid="heydoctor-copilot-hero"
        >
          <div className="heydoctor-presence pr-14">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                {HEYDOCTOR_COPILOT_BRAND.productName}
              </h2>
              <span
                className="inline-flex items-center rounded-full border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-900"
                data-testid="heydoctor-copilot-non-authority-badge"
              >
                {HEYDOCTOR_COPILOT_BRAND.authorityBadge}
              </span>
            </div>
            <p className="text-[12px] font-semibold text-primary">
              {HEYDOCTOR_COPILOT_BRAND.subtitle}
            </p>
            <p
              className="mt-2 text-[11px] leading-relaxed text-slate-600"
              data-testid="heydoctor-copilot-brand-promise"
            >
              <span className="block">
                {HEYDOCTOR_COPILOT_BRAND.brandPromiseLine1}
              </span>
              <span className="block font-medium text-slate-800">
                {HEYDOCTOR_COPILOT_BRAND.brandPromiseLine2}
              </span>
            </p>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              {HEYDOCTOR_COPILOT_BRAND.mission}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={HEYDOCTOR_COPILOT_COPY.close}
            className="clinical-interactive absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-hd-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            ✕
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-hd-4 overflow-y-auto px-hd-4 py-hd-4">
            {runtimeEnabled ? <HeyDoctorCopilotRuntimeStrip /> : null}

            {/* HOME first when Clinical Insights — intelligence before interaction */}
            {activeSection === "clinical-insights" ? (
              <section
                aria-label={HEYDOCTOR_COPILOT_COPY.insightsHomeLabel}
                data-testid="heydoctor-copilot-insights-home"
              >
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {HEYDOCTOR_COPILOT_COPY.insightsHomeLabel}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {HEYDOCTOR_COPILOT_COPY.insightsHomeHint}
                  </p>
                </div>
                <div className="space-y-hd-4">
                  <ClinicalSnapshotPanel snapshot={clinicalSnapshot} />
                  <CopilotLiveClinicalInsights
                    batch={liveInsights.batch}
                    loading={liveInsights.loading}
                    error={liveInsights.error}
                    onRegenerate={() => {
                      void liveInsights.regenerate();
                    }}
                    onDiscard={liveInsights.discardInsight}
                  />
                  <CopilotInsightCards insights={displayedInsights} />
                  <CopilotRiskSignals signals={intelligence.riskSignals} />
                  <CopilotContextEngine context={intelligence.context} />
                  {silenceMode ? (
                    <p
                      role="status"
                      className="rounded-hd-md border border-slate-200/80 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-600"
                    >
                      {COPILOT_SILENCE_MESSAGE}
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            {activeSection === "voice-dictation" && runtimeEnabled ? (
              <section aria-label="Voice Dictation">
                <HeyDoctorCopilotVoiceCapability />
              </section>
            ) : null}

            {activeSection === "assistant" ? (
              <section aria-label={HEYDOCTOR_COPILOT_COPY.assistAria}>
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Assistant
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Capability of the same intelligence — not the home.
                  </p>
                </div>
                <div className="space-y-hd-4">
                  <ClinicalSnapshotPanel
                    snapshot={clinicalSnapshot}
                    variant="compact"
                  />
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
                  <CopilotActionSystem />
                </div>
              </section>
            ) : null}

            {activeSection === "recommendations" ? (
              <section aria-label="Recommendations" className="space-y-hd-4">
                <ClinicalSnapshotPanel
                  snapshot={clinicalSnapshot}
                  variant="compact"
                />
                <CopilotDocumentationGaps
                  gaps={displayedGaps}
                  syncState={documentationGapsSyncState}
                />
                <CopilotDocumentationQuality
                  quality={intelligence.documentationQuality}
                />
              </section>
            ) : null}

            {activeSection === "explainability" ? (
              <section aria-label="Explainability" className="space-y-hd-4">
                <ClinicalSnapshotPanel
                  snapshot={clinicalSnapshot}
                  variant="compact"
                />
                <CopilotGovernanceBoundary />
              </section>
            ) : null}

            {activeSection === "continuity" ? (
              <section aria-label="Continuity">
                <HeyDoctorCopilotContinuityCapability
                  onOpenContinuity={onOpenContinuity}
                />
              </section>
            ) : null}

            {activeSection === "review-sign" && runtimeEnabled ? (
              <section aria-label="Review & Sign">
                <HeyDoctorCopilotReviewSignCapability
                  onOpenEvidence={() => setActiveSection("evidence")}
                />
              </section>
            ) : null}

            {activeSection === "evidence" ? (
              <section aria-label="Evidence" className="space-y-hd-4">
                <ClinicalSnapshotPanel
                  snapshot={clinicalSnapshot}
                  variant="compact"
                />
                {foundationOutputs?.clinicalSummary ? (
                  <section
                    className="rounded-hd-md border border-primary/10 bg-primaryLight/40 px-hd-3 py-hd-2"
                    data-ui-state="ready"
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Resumen clínico
                    </p>
                    <ul className="space-y-1 text-[11px] leading-relaxed text-slate-700">
                      {foundationOutputs.clinicalSummary.lines
                        .slice(0, 4)
                        .map((line) => (
                          <li key={line.id}>{line.text}</li>
                        ))}
                    </ul>
                  </section>
                ) : (
                  <section
                    role="status"
                    data-ui-state="empty"
                    data-testid="evidence-foundation-summary-empty"
                    className="rounded-hd-md border border-dashed border-slate-200 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-500"
                  >
                    <p className="font-medium text-slate-700">
                      Sin resumen de Foundation
                    </p>
                    <p className="mt-1 leading-relaxed">
                      Clinical Foundation aún no aportó un clinical summary para
                      este encuentro. Evidence sigue usando el Clinical Snapshot
                      compartido y el workspace de revisión.
                    </p>
                  </section>
                )}
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
              </section>
            ) : null}

            {/* Capability continuum — secondary; same intelligence, different views */}
            <nav
              aria-label={HEYDOCTOR_COPILOT_COPY.continuumAria}
              className="border-t border-hd-border-subtle pt-hd-3"
              data-testid="heydoctor-copilot-capability-continuum"
            >
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                {HEYDOCTOR_COPILOT_COPY.continuumHint}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {HEYDOCTOR_COPILOT_CAPABILITIES.filter((capability) => {
                  if (runtimeEnabled) return true;
                  return (
                    capability.id !== "voice-dictation" &&
                    capability.id !== "review-sign"
                  );
                }).map((capability) => {
                  const selected = activeSection === capability.id;
                  const isHome = capability.id === "clinical-insights";
                  return (
                    <button
                      key={capability.id}
                      type="button"
                      onClick={() => setActiveSection(capability.id)}
                      aria-pressed={selected}
                      className={cn(
                        "clinical-interactive rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                        selected
                          ? isHome
                            ? "bg-primary text-white"
                            : "bg-primaryLight text-primary"
                          : "bg-hd-surface-muted text-slate-600 hover:bg-slate-200/70",
                      )}
                    >
                      {capability.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Persistent trust footer */}
          <footer
            className="shrink-0 border-t border-hd-border-subtle bg-hd-surface-raised px-hd-4 py-hd-2.5"
            data-testid="heydoctor-copilot-trust-footer"
          >
            <p className="text-[10px] font-medium text-slate-700">
              {HEYDOCTOR_COPILOT_COPY.trustFooter}
            </p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
              {HEYDOCTOR_COPILOT_BRAND.authorityBadge}
              {" · "}
              {HEYDOCTOR_COPILOT_BRAND.humanInTheLoop}
              {" · "}
              {HEYDOCTOR_COPILOT_BRAND.evidenceDriven}
            </p>
          </footer>
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
      aria-label={HEYDOCTOR_COPILOT_COPY.open}
      title={HEYDOCTOR_COPILOT_BRAND.productName}
      className={cn(
        "clinical-interactive inline-flex h-8 items-center gap-1 rounded-hd-md border px-2 text-xs font-medium",
        active
          ? "border-primary bg-primaryLight text-primary"
          : "border-hd-border-subtle bg-hd-surface-raised text-slate-600 hover:bg-hd-surface-muted",
        className,
      )}
    >
      <span aria-hidden>✨</span>
      <span className="hidden md:inline">{HEYDOCTOR_COPILOT_COPY.openShort}</span>
    </button>
  );
}
