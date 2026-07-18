"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { MedicalCopilotInlineStatus } from "@/components/medical-copilot/states";
import { useGovernedReviewSession } from "@/lib/medical-copilot/clinical-intelligence/governed-review-session";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
import type { HitlDecisionTrail } from "@/lib/medical-copilot/hitl-decision-trail";

export function GovernedReviewSessionPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, hitlDecisionTrail, refresh } =
    useGovernedReviewSession({
      sessionId,
      enabled: Boolean(sessionId),
    });
  const model = result?.reviewSession;

  return (
    <div data-testid="governed-review-session-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Review Session (AI-40)">
          <p className="mb-3 text-xs text-slate-500">
            Sesión oficial de revisión clínica gobernada. Sin persistir · sin
            ejecutar · sin enviar a IA · HITL obligatorio.
          </p>
          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}
          <MedicalCopilotInlineStatus
            loading={loading}
            error={error}
            loadingLabel="Cargando revisión gobernada…"
            onRetry={refresh}
          />
          {model && !loading ? (
            <div className="space-y-3" data-testid="governed-review-session">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>reviewSessionId: {model.reviewSessionId}</span>
                <span>·</span>
                <span>Provider: {model.providerId}</span>
                <span>·</span>
                <span>Estado: {model.metadata.status}</span>
                <span>·</span>
                <span>Slots: {model.metadata.slotCount}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>
              {result?.reason ? (
                <p className="text-xs text-slate-500">reason: {result.reason}</p>
              ) : null}
              <HitlTrailSummary trail={hitlDecisionTrail} />
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}

function HitlTrailSummary({ trail }: { trail: HitlDecisionTrail | null }) {
  if (!trail) {
    return (
      <p className="text-xs text-slate-500" data-testid="hitl-trail-empty">
        Trail HITL: sin decisiones registradas en esta sesión.
      </p>
    );
  }
  return (
    <div
      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
      data-testid="hitl-decision-trail"
    >
      <p className="font-medium text-slate-700">Trail HITL (W4)</p>
      <p>
        Aprobadas: {trail.approvedCount} · Rechazadas: {trail.rejectedCount} ·
        Pendientes: {trail.pendingActionCount}
      </p>
      <p>
        Persist gate: {trail.persistGate} · revisión médica requerida · sin
        auto-EMR
      </p>
    </div>
  );
}
