"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { ClinicalReviewWorkspaceMeta } from "@/lib/epic3/clinical-review-workspace";
import type { LiveClinicalContextTimelineView } from "@/lib/epic3/live-clinical-context-timeline";
import type { LiveDocumentationQualityView } from "@/lib/epic3/live-documentation-quality";
import type { PreVisitClinicalSnapshotView } from "@/lib/epic3/pre-visit-clinical-snapshot";
import type { PreVisitContextView } from "@/lib/epic3/pre-visit-context";
import type { PreVisitQualitySignalsView } from "@/lib/epic3/pre-visit-quality-signals";
import type { CloseHitlAuditTrail } from "@/lib/epic3/close-hitl-execution";
import type { PersistencePreviewPayload } from "@/lib/epic3/persistence-preview";
import type {
  ReviewSelectionState,
  ReviewSelectionSummary,
} from "@/lib/epic3/review-selection";
import { CopilotCloseExecution } from "./CopilotCloseExecution";
import { CopilotLiveClinicalContextTimeline } from "./CopilotLiveClinicalContextTimeline";
import { CopilotLiveDocumentationQuality } from "./CopilotLiveDocumentationQuality";
import { CopilotPersistencePreview } from "./CopilotPersistencePreview";
import { CopilotPreVisitClinicalSnapshot } from "./CopilotPreVisitClinicalSnapshot";
import { CopilotPreVisitContext } from "./CopilotPreVisitContext";
import { CopilotPreVisitQualitySignals } from "./CopilotPreVisitQualitySignals";
import { CopilotReviewSelectionLayer } from "./CopilotReviewSelectionLayer";

/**
 * UC-04A–D — Close Workspace + Selection + Preview + H2/H3/H4 execution.
 */
export function CopilotClinicalReviewWorkspace({
  meta,
  agendaLoading,
  preVisitView,
  clinicalSnapshot,
  qualitySignals,
  documentationQuality,
  timelineView,
  timelineLoading,
  timelineError,
  onTimelineRefresh,
  reviewState,
  reviewSummary,
  onReviewAccept,
  onReviewDiscard,
  onReviewEdit,
  reviewBusy = false,
  reviewError = null,
  persistencePreview,
  closeAudit,
  closeGateOk,
  closeGateReason,
  closeBusy,
  closeError,
  onCloseApproveH2,
  onCloseExecuteH3,
  onCloseSignH4,
}: {
  meta: ClinicalReviewWorkspaceMeta;
  agendaLoading: boolean;
  preVisitView: PreVisitContextView;
  clinicalSnapshot: PreVisitClinicalSnapshotView;
  qualitySignals: PreVisitQualitySignalsView;
  documentationQuality: LiveDocumentationQualityView;
  timelineView: LiveClinicalContextTimelineView;
  timelineLoading: boolean;
  timelineError: string | null;
  onTimelineRefresh: () => void;
  reviewState: ReviewSelectionState | null;
  reviewSummary: ReviewSelectionSummary;
  onReviewAccept: (id: string) => void;
  onReviewDiscard: (id: string) => void;
  onReviewEdit: (id: string, text: string) => void;
  reviewBusy?: boolean;
  reviewError?: string | null;
  persistencePreview: PersistencePreviewPayload;
  closeAudit: CloseHitlAuditTrail | null;
  closeGateOk: boolean;
  closeGateReason: string | null;
  closeBusy: boolean;
  closeError: string | null;
  onCloseApproveH2: () => void;
  onCloseExecuteH3: () => void;
  onCloseSignH4: (signatureBase64: string) => void;
}) {
  return (
    <section
      aria-label="Clinical Review Workspace"
      data-testid="copilot-clinical-review-workspace"
      className="space-y-hd-4 rounded-hd-md border border-primary/15 bg-primaryLight/20 px-hd-3 py-hd-3"
    >
      <header className="space-y-1 border-b border-hd-border-subtle pb-hd-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          EPIC-3 · Close · Revisión consolidada
        </p>
        <h3 className={CLINICAL_SECTION_TITLE}>{meta.title}</h3>
        <p className="text-[11px] text-slate-600">
          Única vista de revisión de sesión antes de cualquier persistencia EMR.
          Observacionales en solo lectura · decisiones HITL en Selection Layer.
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
          <div className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-2 py-hd-1">
            <dt className="font-medium uppercase tracking-wide text-slate-400">
              Preguntas (fuente sesión)
            </dt>
            <dd>{meta.interviewFinal.active} en sesión</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-2 py-hd-1">
            <dt className="font-medium uppercase tracking-wide text-slate-400">
              HITL Close
            </dt>
            <dd>
              {reviewSummary.accepted + reviewSummary.edited} decididos ·{" "}
              {reviewSummary.pending} pendientes
            </dd>
          </div>
        </dl>
        <p className="pt-1 font-mono text-[10px] text-slate-400">
          sessionId: {meta.sessionId ?? "(sin sesión)"} · persistsToEmr: false
        </p>
      </header>

      <div className="space-y-hd-5" data-testid="clinical-review-workspace-sections">
        <CopilotPreVisitContext
          view={preVisitView}
          agendaLoading={agendaLoading}
        />
        <CopilotPreVisitClinicalSnapshot view={clinicalSnapshot} />
        <CopilotPreVisitQualitySignals view={qualitySignals} />
        <CopilotReviewSelectionLayer
          state={reviewState}
          summary={reviewSummary}
          onAccept={onReviewAccept}
          onDiscard={onReviewDiscard}
          onEdit={onReviewEdit}
          busy={reviewBusy}
          error={reviewError}
        />
        <CopilotPersistencePreview preview={persistencePreview} />
        <CopilotCloseExecution
          preview={persistencePreview}
          audit={closeAudit}
          gateOk={closeGateOk}
          gateReason={closeGateReason}
          busy={closeBusy}
          error={closeError}
          onApproveH2={onCloseApproveH2}
          onExecuteH3={onCloseExecuteH3}
          onSignH4={onCloseSignH4}
        />
        <CopilotLiveDocumentationQuality view={documentationQuality} />
        <CopilotLiveClinicalContextTimeline
          view={timelineView}
          loading={timelineLoading}
          error={timelineError}
          onRefresh={onTimelineRefresh}
        />
      </div>
    </section>
  );
}
