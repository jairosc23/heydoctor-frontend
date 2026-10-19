import {
  GOVERNED_REFERRAL_PERSISTENCE_BRIDGE_GOVERNANCE,
  type GovernedReferralPersistenceBridgeComponentKey,
  type GovernedReferralPersistenceBridgeComponentPresence,
  type GovernedReferralPersistenceBridgeResult,
} from "./governed-referral-persistence-bridge";

const COMPONENT_DEFS: Array<{
  key: GovernedReferralPersistenceBridgeComponentKey;
  label: string;
}> = [
  { key: "infrastructure", label: "Infrastructure" },
  { key: "bridge", label: "Bridge" },
  { key: "binding", label: "Binding" },
  { key: "validation", label: "Validation" },
  { key: "preview", label: "Preview" },
  { key: "execution", label: "Execution" },
  { key: "readiness", label: "Readiness" },
];

export function mapGovernedReferralPersistenceBridgeEnvelope(
  payload: unknown,
): GovernedReferralPersistenceBridgeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.runtime !== undefined || root.status !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const runtime =
    data.runtime && typeof data.runtime === "object"
      ? (data.runtime as Record<string, unknown>)
      : {};

  const components: GovernedReferralPersistenceBridgeComponentPresence[] = COMPONENT_DEFS.map(
    ({ key, label }) => {
      let present = false;
      if (key === "infrastructure") present = runtime.infrastructure === true;
      else if (key === "bridge") present = runtime.bridge != null;
      else if (key === "binding") present = runtime.binding != null;
      else if (key === "validation") present = runtime.validator != null;
      else if (key === "preview") present = runtime.preview != null;
      else if (key === "execution") present = runtime.execution != null;
      else if (key === "readiness") present = runtime.readiness != null;
      return {
        key,
        label,
        present,
        readOnly: true as const,
        persisted: false as const,
      };
    },
  );

  return {
    runtime: data.runtime ?? null,
    status: typeof data.status === "string" ? data.status : null,
    components,
    governance: { ...GOVERNED_REFERRAL_PERSISTENCE_BRIDGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
    writeAttempted: false,
    repositoryInvoked: false,
  };
}
