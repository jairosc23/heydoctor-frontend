import {
  GOVERNED_CLINICAL_ENTITY_MAPPING_GOVERNANCE,
  type GovernedClinicalEntityMappingComponentKey,
  type GovernedClinicalEntityMappingComponentPresence,
  type GovernedClinicalEntityMappingResult,
} from "./governed-clinical-entity-mapping";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalEntityMappingComponentKey;
  label: string;
}> = [
  { key: "consultationMapping", label: "Consultation Mapping" },
  { key: "soapMapping", label: "SOAP Mapping" },
  { key: "prescriptionMapping", label: "Prescription Mapping" },
  { key: "ordersMapping", label: "Orders Mapping" },
  { key: "referralMapping", label: "Referral Mapping" },
  { key: "clinicalDocumentsMapping", label: "Clinical Documents Mapping" },
];

export function mapGovernedClinicalEntityMappingEnvelope(
  payload: unknown,
): GovernedClinicalEntityMappingResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.mappingRuntime !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const nested =
    data.mappingRuntime && typeof data.mappingRuntime === "object"
      ? (data.mappingRuntime as Record<string, unknown>)
      : {};
  const components: GovernedClinicalEntityMappingComponentPresence[] = COMPONENT_DEFS.map(
    ({ key, label }) => ({
      key,
      label,
      present: nested[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }),
  );
  return {
    mappingRuntime: data.mappingRuntime ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ENTITY_MAPPING_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
  };
}
