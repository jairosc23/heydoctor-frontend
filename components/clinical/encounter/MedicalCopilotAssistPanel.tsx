"use client";

import { useCallback, useEffect, useState } from "react";
import type { EncounterRuntimeActor } from "@/lib/encounter-runtime";
import {
  createCopilotAssistController,
  type CopilotAssistController,
  type CopilotAssistUiState,
} from "@/lib/encounter-plugins/medical-copilot-assist/plugin";

export function MedicalCopilotAssistPanel({
  actor,
  active,
}: {
  actor: EncounterRuntimeActor;
  active: boolean;
}) {
  const [ctrl] = useState<CopilotAssistController>(() =>
    createCopilotAssistController(),
  );
  const [ui, setUi] = useState<CopilotAssistUiState>(ctrl.state);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(() => {
    setUi(ctrl.state);
    setSummary(ctrl.suggestion?.summary ?? null);
    setError(ctrl.error);
  }, [ctrl]);

  useEffect(() => {
    if (!active) {
      ctrl.reset();
      sync();
      return;
    }
    void ctrl.load(actor).then(sync);
  }, [active, actor, ctrl, sync]);

  if (!active) return null;

  return (
    <section
      data-testid="gce-copilot-assist-panel"
      className="border-t border-hd-border-subtle bg-hd-surface-elevated/80 px-3 py-3"
      aria-label="HeyDoctor Copilot · Assistant"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-hd-text">
          HeyDoctor Copilot · Assistant
        </h3>
        <span className="text-[11px] uppercase tracking-wide text-hd-text-muted">
          Dispose · no Confirm · no emisión
        </span>
      </div>
      <p className="mb-3 text-xs text-hd-text-muted">
        Asistencia provisional. Dispose acepta/rechaza sugerencias — no es HAB.
        Actos irreversibles: Confirmation Mount (HAB). Emisión de Rx: PE tras HAB
        (no desde Copilot).
      </p>

      {ui === "loading" ? (
        <p className="text-sm text-hd-text-muted">Cargando asistencia…</p>
      ) : null}
      {ui === "error" ? (
        <p className="text-sm text-red-600" role="alert">
          {error ?? "No se pudo cargar la asistencia."}
        </p>
      ) : null}
      {ui === "suggestion" || ui === "ready" ? (
        <div className="space-y-3">
          <p className="text-sm text-hd-text">{summary}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-hd-brand px-3 py-1.5 text-xs font-medium text-white"
              onClick={() => {
                ctrl.acceptLocal();
                sync();
              }}
            >
              Aceptar (local)
            </button>
            <button
              type="button"
              className="rounded-md border border-hd-border px-3 py-1.5 text-xs font-medium text-hd-text"
              onClick={() => {
                ctrl.rejectLocal();
                sync();
              }}
            >
              Rechazar
            </button>
          </div>
        </div>
      ) : null}
      {ui === "accepted_local" ? (
        <p className="text-sm text-hd-text">
          Sugerencia aceptada localmente. No se emitió ninguna receta. Continúe
          en Composer si requiere prescribir.
        </p>
      ) : null}
      {ui === "rejected" ? (
        <p className="text-sm text-hd-text-muted">Sugerencia rechazada.</p>
      ) : null}
    </section>
  );
}
