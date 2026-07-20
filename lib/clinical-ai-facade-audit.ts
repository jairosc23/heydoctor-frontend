/**
 * Phase 4.8.3A — Clinical AI Facade Audit™
 * Inventario de consumidores, endpoints y validación de migración arquitectónica.
 */

import fs from "node:fs";
import path from "node:path";

export type FacadeOperationId =
  | "inline_note_suggestions"
  | "consultation_assist"
  | "consultation_insights"
  | "autofill_record"
  | "consultation_summary";

export type FacadeEndpointMapping = {
  operation: FacadeOperationId;
  facadeMethod: string;
  backendRoute: string;
  transportModule: string;
  payloadNotes?: string;
};

export type FacadeConsumer = {
  component: string;
  facadeMethod: string;
  operation: FacadeOperationId;
  trigger: string;
  migrated: boolean;
};

/** Rutas backend — sin cambios Phase 4.8.3A */
export const CLINICAL_AI_FACADE_ENDPOINTS: FacadeEndpointMapping[] = [
  {
    operation: "inline_note_suggestions",
    facadeMethod: "getInlineNoteSuggestions / requestEnrichedClinicalDocumentation",
    backendRoute: "POST /consultation-assist → fallback POST /ai/consultation-summary",
    transportModule: "lib/services/consultation-assist.ts, lib/clinical-ai-facade.ts",
    payloadNotes: "EnrichedClinicalDocumentationInput + sync consulta previo",
  },
  {
    operation: "consultation_summary",
    facadeMethod: "postConsultationSummary (interno)",
    backendRoute: "POST /ai/consultation-summary",
    transportModule: "lib/clinical-ai-facade.ts → heydoctorApi",
  },
  {
    operation: "consultation_assist",
    facadeMethod: "getConsultationAssist",
    backendRoute: "POST /consultation-assist",
    transportModule: "lib/services/consultation-assist.ts",
  },
  {
    operation: "consultation_insights",
    facadeMethod: "getConsultationInsights",
    backendRoute: "GET /consultations/:id/ai",
    transportModule: "lib/services/consultations.ts → fetchConsultationAi",
  },
  {
    operation: "autofill_record",
    facadeMethod: "autofillStructuredRecord",
    backendRoute: "POST /consultations/:id/ai/autofill-record",
    transportModule: "lib/services/clinical-record.ts → autofillClinicalRecord",
  },
];

/** Consumidores UI generativos — deben importar solo clinical-ai-facade */
export const CLINICAL_AI_FACADE_CONSUMERS: FacadeConsumer[] = [
  {
    component: "components/clinical/LiveAiNoteSuggestions.tsx",
    facadeMethod: "requestEnrichedClinicalDocumentation",
    operation: "inline_note_suggestions",
    trigger: "Debounce al escribir notas SOAP",
    migrated: true,
  },
  {
    component:
      "app/panel/consultas/[id]/_components/copilot/CopilotGenerativeSection.tsx",
    facadeMethod: "getConsultationAssist",
    operation: "consultation_assist",
    trigger: "Clinical Copilot Daily Hub → asistencia generativa",
    migrated: true,
  },
  {
    component: "components/clinical/ClinicalRecordPanel.tsx",
    facadeMethod: "autofillStructuredRecord",
    operation: "autofill_record",
    trigger: "Autollenar con IA / menú Análisis clínico",
    migrated: true,
  },
];

/** Imports directos a servicios IA prohibidos en components/ */
export const FORBIDDEN_COMPONENT_AI_IMPORTS = [
  "requestConsultationAssist",
  "fetchConsultationAi",
  "autofillClinicalRecord",
  "requestEnrichedClinicalDocumentation",
] as const;

export type FacadeArchitectureLayer = {
  layer: string;
  modules: string[];
  role: string;
};

export const CLINICAL_AI_ARCHITECTURE_BEFORE: FacadeArchitectureLayer[] = [
  {
    layer: "UI",
    modules: [
      "LiveAiNoteSuggestions",
      "ConsultationAssistPanel (removed E3-0c)",
      "AiInsightsPanel (removed E3-0c)",
      "ClinicalRecordPanel",
    ],
    role: "Cada componente llama servicio IA directo",
  },
  {
    layer: "Servicios dispersos",
    modules: [
      "lib/services/ai-clinical.ts",
      "lib/services/consultation-assist.ts",
      "lib/services/consultations.ts",
      "lib/services/clinical-record.ts",
    ],
    role: "Lógica duplicada, métricas inconsistentes",
  },
  {
    layer: "Backend",
    modules: ["NestJS AI endpoints"],
    role: "Sin cambios",
  },
];

export const CLINICAL_AI_ARCHITECTURE_AFTER: FacadeArchitectureLayer[] = [
  {
    layer: "Experiencias IA",
    modules: ["Clinical Copilot™", "LiveAiNoteSuggestions™"],
    role: "Superficies objetivo (Copilot local fuera del facade generativo)",
  },
  {
    layer: "ClinicalAiFacade™",
    modules: ["lib/clinical-ai-facade.ts"],
    role: "Request IDs, hooks throttling, métricas, errores unificados",
  },
  {
    layer: "Transporte interno",
    modules: [
      "consultation-assist.ts",
      "consultations.ts",
      "clinical-record.ts",
      "heydoctorApi",
    ],
    role: "Solo invocado desde facade — no desde components/",
  },
  {
    layer: "Backend",
    modules: ["NestJS AI endpoints"],
    role: "Sin cambios Phase 4.8.3A",
  },
];

export type FacadeAuditViolation = {
  file: string;
  pattern: string;
  detail: string;
};

export type ClinicalAiFacadeAuditResult = {
  consumersTotal: number;
  consumersMigrated: number;
  endpointsCentralized: number;
  componentViolations: FacadeAuditViolation[];
  passed: boolean;
  risks: string[];
};

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

function readComponentSource(relativePath: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

/** Escanea components/ buscando imports directos a servicios IA generativos. */
export function scanComponentAiImportViolations(
  root = path.join(REPO_ROOT, "components"),
): FacadeAuditViolation[] {
  const violations: FacadeAuditViolation[] = [];
  const forbiddenImportPatterns = [
    { pattern: /from\s+["']@\/lib\/services\/consultation-assist["']/, name: "consultation-assist" },
    { pattern: /from\s+["']@\/lib\/services\/ai-clinical["']/, name: "ai-clinical" },
  ];
  const forbiddenCallPatterns = FORBIDDEN_COMPONENT_AI_IMPORTS.map((fn) => ({
    pattern: new RegExp(`\\b${fn}\\s*\\(`),
    name: fn,
  }));

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(tsx|ts|jsx|js)$/.test(entry.name)) continue;
      const src = fs.readFileSync(full, "utf8");
      const rel = path.relative(REPO_ROOT, full);
      for (const { pattern, name } of forbiddenImportPatterns) {
        if (pattern.test(src)) {
          violations.push({
            file: rel,
            pattern: name,
            detail: `Import directo a servicio IA: ${name}`,
          });
        }
      }
      for (const { pattern, name } of forbiddenCallPatterns) {
        if (pattern.test(src) && !src.includes("clinical-ai-facade")) {
          violations.push({
            file: rel,
            pattern: name,
            detail: `Llamada directa a ${name} sin facade`,
          });
        }
      }
      if (/fetchConsultationAi\s*\(/.test(src) && !src.includes("clinical-ai-facade")) {
        violations.push({
          file: rel,
          pattern: "fetchConsultationAi",
          detail: "Llamada directa a fetchConsultationAi sin facade",
        });
      }
    }
  }

  walk(root);
  return violations;
}

/** Verifica que cada consumidor migrado importa clinical-ai-facade. */
export function verifyFacadeConsumerImports(): FacadeAuditViolation[] {
  const violations: FacadeAuditViolation[] = [];
  for (const consumer of CLINICAL_AI_FACADE_CONSUMERS) {
    const src = readComponentSource(consumer.component);
    if (!src.includes("clinical-ai-facade")) {
      violations.push({
        file: consumer.component,
        pattern: "clinical-ai-facade",
        detail: `Falta import desde clinical-ai-facade (${consumer.facadeMethod})`,
      });
    }
    if (!src.includes(consumer.facadeMethod)) {
      violations.push({
        file: consumer.component,
        pattern: consumer.facadeMethod,
        detail: `No usa método facade esperado: ${consumer.facadeMethod}`,
      });
    }
  }
  return violations;
}

export const CLINICAL_AI_FACADE_RISKS = [
  "Copilot header usa motor determinístico local — fuera del facade generativo (intencional 4.8.3A)",
  "lib/clinical-real-validation.ts y lib/clinical-ai-validation.ts importan ai-clinical re-export (tests/auditoría, no UI)",
  "services/index.ts re-exporta ai-clinical por compatibilidad — componentes no deben usarlo",
  "Phase 4.8.3B+ migrará redirects UX; facade ya prepara hooks throttling",
];

export function runClinicalAiFacadeAudit(): ClinicalAiFacadeAuditResult {
  const importViolations = verifyFacadeConsumerImports();
  const componentViolations = [
    ...importViolations,
    ...scanComponentAiImportViolations(),
  ];
  const consumersMigrated = CLINICAL_AI_FACADE_CONSUMERS.filter(
    (c) => c.migrated,
  ).length;

  return {
    consumersTotal: CLINICAL_AI_FACADE_CONSUMERS.length,
    consumersMigrated,
    endpointsCentralized: CLINICAL_AI_FACADE_ENDPOINTS.length,
    componentViolations,
    passed:
      consumersMigrated === CLINICAL_AI_FACADE_CONSUMERS.length &&
      componentViolations.length === 0,
    risks: CLINICAL_AI_FACADE_RISKS,
  };
}
