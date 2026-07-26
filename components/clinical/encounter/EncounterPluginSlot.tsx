"use client";

import type { EncounterRuntimeActor } from "@/lib/encounter-runtime";
import { MEDICAL_COPILOT_ASSIST_PLUGIN_ID } from "@/lib/encounter-plugins/medical-copilot-assist/manifest";
import { MedicalCopilotAssistPanel } from "./MedicalCopilotAssistPanel";

export function EncounterPluginSlot({
  actor,
  activePluginIds,
}: {
  actor: EncounterRuntimeActor;
  activePluginIds: string[];
}) {
  const copilotActive = activePluginIds.includes(MEDICAL_COPILOT_ASSIST_PLUGIN_ID);
  if (!copilotActive) return null;
  return (
    <div data-testid="gce-encounter-plugin-slot">
      <MedicalCopilotAssistPanel actor={actor} active={copilotActive} />
    </div>
  );
}
