import {
  GOVERNED_CLINICAL_VALIDATION_PACKAGE_GOVERNANCE,
  type GovernedClinicalValidationPackageComponentKey,
  type GovernedClinicalValidationPackageComponentPresence,
  type GovernedClinicalValidationPackageResult,
} from "./governed-clinical-validation-package";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalValidationPackageComponentKey;
  label: string;
}> = [
  { key: "ownershipValidator", label: "Ownership Validator" },
  { key: "tenantValidator", label: "Tenant Validator" },
  { key: "clinicValidator", label: "Clinic Validator" },
  { key: "sessionValidator", label: "Session Validator" },
  { key: "versionValidator", label: "Version Validator" },
  { key: "entityValidator", label: "Entity Validator" },
  { key: "draftValidator", label: "Draft Validator" },
  { key: "approvalValidator", label: "Approval Validator" },
];

export function mapGovernedClinicalValidationPackageEnvelope(
  payload: unknown,
): GovernedClinicalValidationPackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.ownershipValidator !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalValidationPackageComponentPresence[] = COMPONENT_DEFS.map(
    ({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }),
  );

  return {
    ownershipValidator: data.ownershipValidator ?? null,
    tenantValidator: data.tenantValidator ?? null,
    clinicValidator: data.clinicValidator ?? null,
    sessionValidator: data.sessionValidator ?? null,
    versionValidator: data.versionValidator ?? null,
    entityValidator: data.entityValidator ?? null,
    draftValidator: data.draftValidator ?? null,
    approvalValidator: data.approvalValidator ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_VALIDATION_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
