"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { MedicalCopilotInlineStatus } from "@/components/medical-copilot/states";
import { usePhysicianReasoningReview } from "@/lib/medical-copilot/clinical-intelligence/physician-reasoning-review";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
export function PhysicianReasoningReviewPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = usePhysicianReasoningReview({ sessionId, enabled: Boolean(sessionId) });
  const model = result?.physicianReasoningReview;
  return (
    <div data-testid="physician-reasoning-review-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Physician Reasoning Review (AI-84)">
          <p className="mb-3 text-xs text-slate-500">Vista integrada para revisión médica. Sin aprobación automática · HITL obligatorio.</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          <MedicalCopilotInlineStatus loading={loading} error={error} onRetry={refresh} />
          {model ? (
            <div className="space-y-3" data-testid="physician-reasoning-review">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>physicianReasoningReviewId: {model.physicianReasoningReviewId}</span><span>·</span><span>Provider: {model.providerId}</span><span>·</span>
                <span>Estado: {model.metadata.status}</span><span>·</span><span>Slots: {model.metadata.slotCount}</span>
                <button type="button" onClick={refresh} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">Actualizar</button>
              </div>
              {result?.reason ? <p className="text-xs text-slate-500">reason: {result.reason}</p> : null}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
