import {
  GOVERNED_CONSULTATION_HOME_GOVERNANCE,
  type GovernedConsultationHomeComponentKey,
  type GovernedConsultationHomeComponentPresence,
  type GovernedConsultationHomeResult,
} from "./governed-consultation-home";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationHomeComponentKey;
  label: string;
}> = [
  { key: "consultationDashboard", label: "Consultation Dashboard" },
  { key: "physicianHome", label: "Physician Home" },
];

export function mapGovernedConsultationHomeEnvelope(
  payload: unknown,
): GovernedConsultationHomeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationDashboard !== undefined ||
    root.physicianHome !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationHomeComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationDashboard: data.consultationDashboard ?? null,
    physicianHome: data.physicianHome ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_HOME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
