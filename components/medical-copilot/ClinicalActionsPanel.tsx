"use client";

import Button from "@/components/ui/Button";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { ClinicalStatusBadge } from "@/components/clinical/design";
import type { MedicalCopilotActionSummary } from "@/lib/medical-copilot/types";
import { actionableActions } from "@/lib/medical-copilot/view-model";
import { MedicalCopilotEmptyState } from "./states";

export function ClinicalActionsPanel({
  actions,
  busyActionId,
  onApprove,
  onReject,
}: {
  actions: MedicalCopilotActionSummary[];
  busyActionId?: string | null;
  onApprove: (actionId: string) => void;
  onReject: (actionId: string) => void;
}) {
  const pending = actionableActions(actions);

  return (
    <ClinicalPanel depth={2} className="min-h-[12rem]" focusPrimary>
      <ClinicalSection title="Clinical Actions">
        <p className="mb-3 text-sm text-slate-500">
          Cola de disposición Copilot (Dispose). Aceptar/rechazar solo cambia
          estado de sugerencia — nunca HAB Confirm ni emite recetas,
          certificados ni interconsultas.
        </p>
        {actions.length === 0 ? (
          <MedicalCopilotEmptyState
            title="Sin acciones elegibles"
            description="Cuando el Timeline tenga eventos accionables, aparecerán aquí."
          />
        ) : (
          <ul className="space-y-3">
            {actions.map((action) => {
              const canDecide = pending.some(
                (item) => item.actionId === action.actionId,
              );
              const busy = busyActionId === action.actionId;
              return (
                <li
                  key={action.actionId}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {action.actionType}
                      </p>
                      {action.summary ? (
                        <p className="mt-1 text-sm text-slate-600">
                          {action.summary}
                        </p>
                      ) : null}
                    </div>
                    <ClinicalStatusBadge
                      status={
                        action.status === "approved"
                          ? "completed"
                          : action.status === "rejected"
                            ? "critical"
                            : "pending"
                      }
                      label={action.status}
                    />
                  </div>
                  {canDecide ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        className="px-4 py-2 text-sm"
                        disabled={busy}
                        onClick={() => onApprove(action.actionId)}
                      >
                        Aceptar disposición
                      </Button>
                      <Button
                        variant="secondary"
                        className="px-4 py-2 text-sm"
                        disabled={busy}
                        onClick={() => onReject(action.actionId)}
                      >
                        Desechar
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </ClinicalSection>
    </ClinicalPanel>
  );
}
