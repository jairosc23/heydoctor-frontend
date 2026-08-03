"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalRepositoryRuntime } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-repository-runtime";
import type { GovernedClinicalRepositoryRuntimeComponentPresence } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-repository-runtime";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function ComponentPresenceCard({
  component,
}: {
  component: GovernedClinicalRepositoryRuntimeComponentPresence;
}) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
      <p className="text-xs font-medium text-slate-700">{component.label}</p>
      <p className="mt-1 text-xs text-slate-500">
        Presencia: {component.present ? "disponible" : "ausente"}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-700">
        READ ONLY · NOT CONNECTED · NO EMR WRITE
      </p>
    </div>
  );
}

export function GovernedClinicalRepositoryRuntimePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } =
    useGovernedClinicalRepositoryRuntime({
      sessionId,
      enabled: Boolean(sessionId),
    });

  const anyWrite =
    result?.capabilities &&
    typeof result.capabilities === "object" &&
    "anyWriteEnabled" in (result.capabilities as Record<string, unknown>)
      ? Boolean((result.capabilities as Record<string, unknown>).anyWriteEnabled)
      : null;

  const anyReady =
    result?.readiness &&
    typeof result.readiness === "object" &&
    "anyReady" in (result.readiness as Record<string, unknown>)
      ? Boolean((result.readiness as Record<string, unknown>).anyReady)
      : null;

  return (
    <div data-testid="governed-clinical-repository-runtime-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Clinical Repository Runtime">
          <p className="mb-3 text-xs text-slate-500">
            Bloque 3 · Repository Adapter Layer · Interfaces / Resolver /
            Capability Matrix · Solo lectura · NO CRUD · NO TypeORM · NO
            conexión a módulos clínicos.
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · NOT PERSISTED · REQUIRES PHYSICIAN REVIEW · NO WRITE
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
            <div
              className="space-y-3"
              data-testid="governed-clinical-repository-runtime"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  Contratos:{" "}
                  {result.components.filter((c) => c.present).length}/
                  {result.components.length}
                </span>
                <span>·</span>
                <span>
                  Write enabled:{" "}
                  {anyWrite === null ? "—" : anyWrite ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Adapters ready:{" "}
                  {anyReady === null ? "—" : anyReady ? "sí" : "no"}
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
