"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalDraft } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-draft";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedClinicalDraftPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedClinicalDraft({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="governed-clinical-draft-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Borrador Clínico Gobernado (Fase 4)">
          <p className="mb-3 text-xs text-slate-500">
            Draft estructural · Solo lectura · HITL obligatorio · No persistido ·
            No ejecuta acciones · Requiere aprobación médica explícita.
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
            <div className="space-y-3" data-testid="governed-clinical-draft">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  Draft: {result.draft.available ? "disponible" : "no disponible"}
                </span>
                <span>·</span>
                <span>Estado: {result.draft.status}</span>
                <span>·</span>
                <span>
                  Aprobado: {result.draft.draftApproved ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Persistido: {result.draft.persisted ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>Solo lectura: {result.draft.readOnly ? "sí" : "no"}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>
              <div className="rounded border border-amber-200 bg-amber-50/60 p-3 text-sm text-slate-800">
                <p className="text-xs font-medium text-amber-800">
                  Requiere revisión médica · HITL activo · No escrito en EMR
                </p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  <li>
                    requiresPhysicianReview:{" "}
                    {result.governance.requiresPhysicianReview ? "true" : "false"}
                  </li>
                  <li>
                    executesAction:{" "}
                    {result.governance.executesAction ? "true" : "false"}
                  </li>
                  <li>
                    autoPersistedToEmr:{" "}
                    {result.governance.autoPersistedToEmr ? "true" : "false"}
                  </li>
                  <li>
                    draftApproved:{" "}
                    {result.governance.draftApproved ? "true" : "false"}
                  </li>
                </ul>
              </div>
              {result.reason ? (
                <p className="text-xs text-slate-500">reason: {result.reason}</p>
              ) : null}
              <p className="text-xs text-slate-500">
                generatedAt: {result.draft.generatedAt}
              </p>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
