/**
 * AEC-1 M1 — Steward disposition attestation (client-side artifact).
 * Steward acceptance ≠ HAB Confirm / PE Emit / chart mutation.
 */

export type StewardDisposition = "ACCEPT" | "ACCEPT_WITH_FIXES" | "REJECT";

export type StewardScenarioResult = {
  id: string;
  title: string;
  passed: boolean | null;
  notes: string;
};

export type StewardAttestation = {
  kind: "AEC1_STEWARD_ATTESTATION";
  version: "1.0";
  createdAt: string;
  stewardIdentity: string;
  disposition: StewardDisposition;
  tipSha: string | null;
  flagSnapshot: {
    NEXT_PUBLIC_AEC1_STEWARD_REVIEW: boolean;
  };
  scenarios: StewardScenarioResult[];
  authorityAssertions: {
    nonAuthorityPreserved: true;
    dismissIsNotHab: true;
    acknowledgeIsNotHab: true;
    stewardIsNotClinicalAuthority: true;
    confirmHabForbiddenInUi: true;
    emitPeForbiddenInUi: true;
    applyToChartForbiddenInUi: true;
  };
  notes: string;
};

export const STEWARD_SCENARIO_CATALOG: Array<{
  id: string;
  title: string;
  description: string;
}> = [
  {
    id: "label-non-authority",
    title: "Advisory NON_AUTHORITY label visible",
    description:
      "Insight cards show advisory / NON_AUTHORITY labeling and disclaimer.",
  },
  {
    id: "dismiss-not-hab",
    title: "Dismiss ≠ HAB",
    description:
      "Dismiss calls W5 dismiss only; no Confirm HAB affordance on intel cards.",
  },
  {
    id: "ack-not-hab",
    title: "Acknowledge ≠ HAB",
    description:
      "Acknowledge calls W5 ack only; does not change clinical confirmation state.",
  },
  {
    id: "no-confirm-emit",
    title: "No Confirm / Emit on Steward chrome",
    description:
      "UI does not expose Confirm HAB, Emit PE, or apply-to-chart for intel.",
  },
  {
    id: "fail-closed",
    title: "Fail-closed when flags/API deny",
    description:
      "FLAG_OFF / AUTHORITY_FORBIDDEN / network errors show honest degraded state.",
  },
];

export function buildStewardAttestation(input: {
  stewardIdentity: string;
  disposition: StewardDisposition;
  scenarios: StewardScenarioResult[];
  tipSha?: string | null;
  stewardReviewEnabled: boolean;
  notes?: string;
}): StewardAttestation {
  return {
    kind: "AEC1_STEWARD_ATTESTATION",
    version: "1.0",
    createdAt: new Date().toISOString(),
    stewardIdentity: input.stewardIdentity.trim(),
    disposition: input.disposition,
    tipSha: input.tipSha ?? null,
    flagSnapshot: {
      NEXT_PUBLIC_AEC1_STEWARD_REVIEW: input.stewardReviewEnabled,
    },
    scenarios: input.scenarios,
    authorityAssertions: {
      nonAuthorityPreserved: true,
      dismissIsNotHab: true,
      acknowledgeIsNotHab: true,
      stewardIsNotClinicalAuthority: true,
      confirmHabForbiddenInUi: true,
      emitPeForbiddenInUi: true,
      applyToChartForbiddenInUi: true,
    },
    notes: input.notes?.trim() ?? "",
  };
}

export function attestationIsComplete(
  attestation: Pick<StewardAttestation, "stewardIdentity" | "scenarios">,
): boolean {
  if (!attestation.stewardIdentity.trim()) return false;
  return attestation.scenarios.every((s) => s.passed === true || s.passed === false);
}
