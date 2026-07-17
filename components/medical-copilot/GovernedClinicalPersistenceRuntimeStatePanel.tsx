"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalPersistenceRuntimeState } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-persistence-runtime-state";
import type { GovernedClinicalPersistenceRuntimeStateComponentPresence } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-persistence-runtime-state";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function ComponentPresenceCard({
  component,
}: {
  component: GovernedClinicalPersistenceRuntimeStateComponentPresence;
}) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
      <p className="text-xs font-medium text-slate-700">{component.label}</p>
      <p className="mt-1 text-xs text-slate-500">
        Presencia: {component.present ? "disponible" : "ausente"}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-700">
        READ ONLY · NOT PERSISTED · NO EMR WRITE
      </p>
    </div>
  );
}

export function GovernedClinicalPersistenceRuntimeStatePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } =
    useGovernedClinicalPersistenceRuntimeState({
      sessionId,
      enabled: Boolean(sessionId),
    });

  const lifecycleStatus =
    result?.lifecycle &&
    typeof result.lifecycle === "object" &&
    "status" in (result.lifecycle as Record<string, unknown>)
      ? String((result.lifecycle as Record<string, unknown>).status)
      : null;

  const healthReady =
    result?.health &&
    typeof result.health === "object" &&
    "ready" in (result.health as Record<string, unknown>)
      ? Boolean((result.health as Record<string, unknown>).ready)
      : null;

  return (
    <div data-testid="governed-clinical-persistence-runtime-state-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Clinical Persistence Runtime State">
          <p className="mb-3 text-xs text-slate-500">
            Bloque 2 · Coordinator / Transaction / Validation / Authorization /
            Lifecycle · Solo lectura · NO persiste · NO escribe EMR · NO
            ejecuta · Adapters/repositorios sin conectar.
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · NOT PERSISTED · REQUIRES PHYSICIAN REVIEW · NO CRUD
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
            <div
              className="space-y-3"
              data-testid="governed-clinical-persistence-runtime-state"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  Contratos:{" "}
                  {result.components.filter((c) => c.present).length}/
                  {result.components.length}
                </span>
                <span>·</span>
                <span>Lifecycle: {lifecycleStatus ?? "—"}</span>
                <span>·</span>
                <span>
                  Health ready:{" "}
                  {healthReady === null ? "—" : healthReady ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>EMR write: {result.writesEmr ? "sí" : "no"}</span>
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
