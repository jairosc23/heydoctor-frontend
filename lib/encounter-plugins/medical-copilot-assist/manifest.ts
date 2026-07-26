import type { ClinicalPluginManifest } from "@/lib/encounter-runtime";

export const MEDICAL_COPILOT_ASSIST_PLUGIN_ID = "medical-copilot-assist" as const;

export const MEDICAL_COPILOT_ASSIST_MANIFEST: ClinicalPluginManifest = {
  id: MEDICAL_COPILOT_ASSIST_PLUGIN_ID,
  version: "1.0.0",
  displayName: "Medical Copilot Assist",
  slot: "assist",
  priority: 10,
  permissions: ["context:read", "copilot:suggest"],
  hitlRequired: true,
  executesAction: false,
  writesEmr: false,
  writesPrescription: false,
  requiresNetwork: true,
  description:
    "GCE-W2 HITL assistant. Never emits or persists prescriptions.",
};
