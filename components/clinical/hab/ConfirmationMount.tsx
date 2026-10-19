"use client";

import { useState } from "react";
import {
  submitHabDecision,
  type HabDecisionKind,
  type HabDecisionRecord,
} from "@/lib/hab-authority/api";

/**
 * E04 Confirmation Mount — Human Authority Boundary challenge UX.
 * Visually and semantically distinct from Copilot Dispose / Accept suggestion.
 * Does not emit or persist clinical masters.
 */
export function ConfirmationMount({
  consultationId,
  enabled,
  contextBound,
}: {
  consultationId: string;
  enabled: boolean;
  contextBound: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<HabDecisionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modifySummary, setModifySummary] = useState("");

  if (!enabled) return null;

  const run = async (kind: HabDecisionKind) => {
    if (!contextBound) {
      setError("CONTEXT_UNBOUND");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const record = await submitHabDecision({
        consultationId,
        kind,
        actKind: "irreversible_clinical_stub",
        rationale:
          kind === "confirm"
            ? "Physician confirms irreversible clinical stub (HAB)"
            : kind === "reject"
              ? "Physician rejects irreversible clinical stub (HAB)"
              : kind === "abort"
                ? "Physician aborts authority challenge (HAB)"
                : "Physician modifies before authority completion (HAB)",
        modificationSummary:
          kind === "modify" ? modifySummary || undefined : undefined,
      });
      setLast(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "hab_decision_failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-testid="hab-confirmation-mount"
      className="space-y-2 border-t-2 border-[#078A92] bg-[#E6F5F6]/80 px-3 py-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#056B72]">
          Confirmación de autoridad (HAB)
        </h3>
        <span className="text-[11px] font-medium uppercase tracking-wide text-[#3D5256]">
          No es Dispose del Copilot · No emite
        </span>
      </div>
      <p className="text-xs text-[#3D5256]">
        Acto irreversible de autoridad humana. Requiere contexto clínico
        vinculado. Distinto de aceptar/desechar una sugerencia de IA.
      </p>
      {!contextBound ? (
        <p className="text-xs font-medium text-amber-900" role="status">
          Contexto no vinculado — HAB bloqueado (fail-closed).
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="hab-confirm"
          disabled={busy || !contextBound}
          className="rounded-md bg-[#078A92] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          onClick={() => void run("confirm")}
        >
          Confirmar
        </button>
        <button
          type="button"
          data-testid="hab-reject"
          disabled={busy || !contextBound}
          className="rounded-md border border-[#B42318] px-3 py-1.5 text-xs font-semibold text-[#B42318] disabled:opacity-40"
          onClick={() => void run("reject")}
        >
          Rechazar
        </button>
        <button
          type="button"
          data-testid="hab-abort"
          disabled={busy || !contextBound}
          className="rounded-md border border-[#3D5256] px-3 py-1.5 text-xs font-medium text-[#3D5256] disabled:opacity-40"
          onClick={() => void run("abort")}
        >
          Abortar
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          data-testid="hab-modify-summary"
          className="min-w-[12rem] flex-1 rounded-md border border-[#E8EEF0] bg-white px-2 py-1 text-xs"
          placeholder="Resumen de modificación"
          value={modifySummary}
          onChange={(e) => setModifySummary(e.target.value)}
          disabled={busy || !contextBound}
        />
        <button
          type="button"
          data-testid="hab-modify"
          disabled={busy || !contextBound || !modifySummary.trim()}
          className="rounded-md border border-[#078A92] bg-white px-3 py-1.5 text-xs font-semibold text-[#056B72] disabled:opacity-40"
          onClick={() => void run("modify")}
        >
          Modificar
        </button>
      </div>
      {/* Explicit non-HAB control label for tests: dispose lives elsewhere */}
      <p
        data-testid="hab-not-copilot-dispose"
        className="text-[10px] text-[#6B7F84]"
      >
        Copilot Dispose / Accept suggestion no aparecen en este mount.
      </p>
      {last ? (
        <p className="text-xs text-[#0F7A5F]" data-testid="hab-last-decision">
          HAB {last.kind} · {last.decisionId.slice(0, 8)} · emit=
          {String(last.emissionPerformed)}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-[#B42318]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
