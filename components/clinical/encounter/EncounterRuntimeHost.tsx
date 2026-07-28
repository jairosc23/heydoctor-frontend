"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClinicalContextBanner } from "@/components/clinical/context/ClinicalContextBanner";
import { ConfirmationMount } from "@/components/clinical/hab/ConfirmationMount";
import { JourneyNavigator } from "@/components/clinical/journey/JourneyNavigator";
import { useBoundClinicalContext } from "@/hooks/useBoundClinicalContext";
import { useAuth } from "@/lib/context/AuthContext";
import {
  EncounterRuntime,
  isCosW1JourneyEnabled,
  isCosW1WorkspaceHostEnabled,
  isGceCopilotAssistEnabled,
  isGceEncounterRuntimeEnabled,
  type EncounterRuntimeSession,
} from "@/lib/encounter-runtime";
import { MEDICAL_COPILOT_ASSIST_MANIFEST } from "@/lib/encounter-plugins/medical-copilot-assist/manifest";
import { EncounterPluginSlot } from "./EncounterPluginSlot";

export function EncounterRuntimeHost({
  patientId,
  consultationId,
  clinicId,
}: {
  patientId: string;
  consultationId: string;
  clinicId?: string | null;
}) {
  const { user } = useAuth();
  const runtimeEnabled = isGceEncounterRuntimeEnabled();
  const copilotEnabled = isGceCopilotAssistEnabled();
  const w1HostEnabled = isCosW1WorkspaceHostEnabled();
  const w1JourneyEnabled = isCosW1JourneyEnabled();
  const resolvedClinicId = clinicId ?? user?.clinicId ?? null;

  const context = useBoundClinicalContext(consultationId, {
    enabled: w1HostEnabled && runtimeEnabled,
    autoBind: w1HostEnabled,
  });

  const runtime = useMemo(() => new EncounterRuntime(), []);
  const [session, setSession] = useState<EncounterRuntimeSession | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setSession(runtime.getSession());
  }, [runtime]);

  const assistOpen =
    session?.activePluginIds.includes(MEDICAL_COPILOT_ASSIST_MANIFEST.id) ??
    false;

  const contextBlocksAssist =
    w1HostEnabled && context.status !== "bound" && context.status !== "loading";

  useEffect(() => {
    if (
      !runtimeEnabled ||
      !user?.id ||
      !resolvedClinicId ||
      !patientId ||
      !consultationId
    ) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        if (copilotEnabled) {
          const reg = runtime.getRegistry();
          if (!reg.get(MEDICAL_COPILOT_ASSIST_MANIFEST.id)) {
            reg.register(MEDICAL_COPILOT_ASSIST_MANIFEST);
          }
        }
        await runtime.open({
          doctorId: user.id,
          clinicId: resolvedClinicId,
          patientId,
          encounterId: consultationId,
        });
        if (!cancelled) {
          setInitError(null);
          refresh();
        }
      } catch (err) {
        if (!cancelled) {
          setInitError(
            err instanceof Error ? err.message : "runtime_open_failed",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
      void runtime.close();
    };
  }, [
    runtimeEnabled,
    copilotEnabled,
    user?.id,
    resolvedClinicId,
    patientId,
    consultationId,
    runtime,
    refresh,
  ]);

  const toggleAssist = async () => {
    if (!session || !copilotEnabled) return;
    if (contextBlocksAssist) {
      setInitError("CONTEXT_UNBOUND");
      return;
    }
    try {
      if (assistOpen) {
        await runtime.deactivatePlugin(MEDICAL_COPILOT_ASSIST_MANIFEST.id);
      } else {
        await runtime.activatePlugin(MEDICAL_COPILOT_ASSIST_MANIFEST.id);
      }
      refresh();
    } catch (err) {
      setInitError(err instanceof Error ? err.message : "plugin_toggle_failed");
    }
  };

  if (!runtimeEnabled) return null;

  return (
    <div data-testid="gce-encounter-runtime-host" className="space-y-0">
      {w1HostEnabled ? (
        <ClinicalContextBanner
          status={context.status}
          error={context.error}
          onRetryBind={() => void context.bind()}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-2 border-t border-hd-border-subtle bg-hd-surface-chrome/90 px-0 py-hd-2">
        <span className="px-1 text-[11px] font-medium uppercase tracking-wide text-hd-text-muted">
          Encounter Runtime
        </span>
        <span className="text-xs text-hd-text-muted">
          {session?.state ?? "idle"}
        </span>
        {copilotEnabled ? (
          <button
            type="button"
            data-testid="gce-copilot-assist-toggle"
            className="rounded-md border border-hd-border px-2.5 py-1 text-xs font-medium text-hd-text disabled:opacity-50"
            onClick={() => void toggleAssist()}
            disabled={
              !session ||
              session.state === "failed" ||
              session.state === "closed" ||
              contextBlocksAssist
            }
          >
            {assistOpen ? "Ocultar Copilot Assist" : "Copilot Assist"}
          </button>
        ) : null}
        {initError ? (
          <span className="text-xs text-red-600" role="alert">
            {initError}
          </span>
        ) : null}
      </div>
      {session && assistOpen && !contextBlocksAssist ? (
        <EncounterPluginSlot
          actor={session.actor}
          activePluginIds={session.activePluginIds}
        />
      ) : null}
      {w1HostEnabled ? (
        <ConfirmationMount
          consultationId={consultationId}
          enabled={w1HostEnabled}
          contextBound={context.status === "bound"}
        />
      ) : null}
      {w1JourneyEnabled || w1HostEnabled ? (
        <JourneyNavigator
          consultationId={consultationId}
          patientId={patientId}
          enabled={w1JourneyEnabled || w1HostEnabled}
          contextBound={context.status === "bound"}
        />
      ) : null}
    </div>
  );
}
