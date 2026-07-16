"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedCarePlanDraft } from "@/lib/medical-copilot/clinical-intelligence/governed-care-plan-draft";
import type { GovernedCarePlanDraftItem } from "@/lib/medical-copilot/clinical-intelligence/governed-care-plan-draft";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

const SLOT_LABELS: Record<string, string> = {
  primary_goal_slot: "Primary Goal Draft",
  secondary_goals_slot: "Secondary Goals Draft",
  planned_interventions_slot: "Planned Interventions Draft",
  monitoring_strategy_slot: "Monitoring Strategy Draft",
  review_schedule_slot: "Review Schedule Draft",
  care_plan_notes_slot: "Care Plan Notes Draft",
};

function SlotCard({ item }: { item: GovernedCarePlanDraftItem }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
      <p className="text-xs font-medium text-slate-700">
        {SLOT_LABELS[item.slotKey] ?? item.slotKey}
      </p>
      <p className="mt-1 text-xs text-slate-500">Estado: {item.status}</p>
      <p className="text-xs text-slate-500">Valor: vacío</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-700">
        READ ONLY · NOT PERSISTED · DRAFT ONLY
      </p>
    </div>
  );
}

export function GovernedCarePlanDraftPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedCarePlanDraft({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="governed-care-plan-draft-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Care Plan Draft Gobernado (Fase 14)">
          <p className="mb-3 text-xs text-slate-500">
            Slots estructurales vacíos · Sin plan terapéutico real · Sin
            objetivos clínicos · HITL obligatorio · No modifica Care Plans/EMR.
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · NOT PERSISTED · REQUIRES PHYSICIAN REVIEW · DRAFT ONLY
          </p>
          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {result ? (
            <div className="space-y-3" data-testid="governed-care-plan-draft">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Status: {result.carePlanDraft.status}</span>
                <span>·</span>
                <span>
                  Aprobado: {result.carePlanDraft.draftApproved ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Persistido: {result.carePlanDraft.persisted ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Revisión médica:{" "}
                  {result.governance.requiresPhysicianReview ? "sí" : "no"}
                </span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>
              {result.reason ? (
                <p className="text-xs text-slate-500">reason: {result.reason}</p>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2">
                {result.carePlanDraft.carePlanItems.map((item) => (
                  <SlotCard key={item.slotKey} item={item} />
                ))}
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
