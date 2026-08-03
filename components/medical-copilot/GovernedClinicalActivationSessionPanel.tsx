"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalActivationSession } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-activation-session";
import type { GovernedClinicalActivationSessionComponentPresence } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-activation-session";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function ComponentPresenceCard({
  component,
}: {
  component: GovernedClinicalActivationSessionComponentPresence;
}) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
      <p className="text-xs font-medium text-slate-700">{component.label}</p>
      <p className="mt-1 text-xs text-slate-500">
        Presencia: {component.present ? "disponible" : "ausente"}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-700">
        READ ONLY · NOT PERSISTED · DRAFT ONLY
      </p>
    </div>
  );
}

export function GovernedClinicalActivationSessionPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedClinicalActivationSession({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="governed-clinical-activation-session-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Activation Session Gobernado (Fase 66)">
          <p className="mb-3 text-xs text-slate-500">
            Sesión de preparación de activación clínica · Solo lectura · Sin persistencia · HITL obligatorio · No modifica EMR/Workflow.
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · NOT PERSISTED · REQUIRES PHYSICIAN REVIEW · DRAFT ONLY
          </p>
          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {result ? (
            <div className="space-y-3" data-testid="governed-clinical-activation-session">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  Componentes:{" "}
                  {result.components.filter((c) => c.present).length}/
                  {result.components.length}
                </span>
                <span>·</span>
                <span>
                  Aprobado: {result.governance.draftApproved ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Persistido EMR:{" "}
                  {result.governance.autoPersistedToEmr ? "sí" : "no"}
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
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {result.components.map((component) => (
                  <ComponentPresenceCard
                    key={component.key}
                    component={component}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
