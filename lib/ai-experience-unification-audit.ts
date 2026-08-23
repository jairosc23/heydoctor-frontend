/**
 * Phase 4.8.2 — AI Experience Unification Audit™
 * Auditoría y diseño de consolidación IA. Sin cambios de runtime.
 */

export type AiEntryPointId =
  | "ep-copilot-header"
  | "ep-tab-asistencia"
  | "ep-menu-analisis-ia"
  | "ep-ficha-autollenar"
  | "ep-live-ai-notes"
  | "ep-assist-manual"
  | "ep-insights-auto-load"
  | "ep-legacy-consultas-page"
  | "ep-actionbar-chip-dead";

export type AiEntryPoint = {
  id: AiEntryPointId;
  label: string;
  route: string;
  trigger: string;
  component: string;
  backend: string;
  userInitiated: boolean;
  activeInProductionId: boolean;
  countsTowardSeven: boolean;
  notes?: string;
};

/** Inventario completo — entry points IA en flujo consulta */
export const AI_ENTRY_POINTS_INVENTORY: AiEntryPoint[] = [
  {
    id: "ep-copilot-header",
    label: "HeyDoctor Copilot (header)",
    route: "/panel/consultas/[id]",
    trigger: "Botón ✨ Copilot en EncounterHeader",
    component: "ClinicalCopilotDrawer.tsx",
    backend: "lib/clinical-copilot-intelligence.ts (determinístico local)",
    userInitiated: true,
    activeInProductionId: true,
    countsTowardSeven: true,
    notes: "Hub principal objetivo Phase 4.8.2",
  },
  {
    id: "ep-tab-asistencia",
    label: "Tab Asistencia",
    route: "/panel/consultas/[id]",
    trigger: "EncounterLeftPane / MobileConsultationWorkspace tab «Asistencia»",
    component: "EncounterLeftPane.tsx, MobileConsultationWorkspace.tsx",
    backend: "(contenedor — no API directa)",
    userInitiated: true,
    activeInProductionId: true,
    countsTowardSeven: true,
    notes: "Agrupa Assist + Insights + Chat — 1 tab, 3 experiencias distintas",
  },
  {
    id: "ep-assist-manual",
    label: "Consultation Assist™ manual",
    route: "/panel/consultas/[id]",
    trigger: "Tab Asistencia → «Obtener sugerencias»",
    component: "ConsultationAssistPanel.tsx",
    backend: "POST /consultation-assist",
    userInitiated: true,
    activeInProductionId: true,
    countsTowardSeven: true,
  },
  {
    id: "ep-insights-auto-load",
    label: "AI Insights Panel™ auto",
    route: "/panel/consultas/[id]",
    trigger: "Tab Asistencia → carga automática al montar",
    component: "AiInsightsPanel.tsx",
    backend: "GET fetchConsultationAi(consultationId)",
    userInitiated: false,
    activeInProductionId: true,
    countsTowardSeven: true,
    notes: "También expone Regenerar + Usar en notas/diagnóstico",
  },
  {
    id: "ep-menu-analisis-ia",
    label: "Menú ⋯ Análisis clínico con IA",
    route: "/panel/consultas/[id]",
    trigger: "EncounterActionMenu → handleAnalyzeWithAi",
    component: "page.tsx → ClinicalRecordPanel autofillRequest",
    backend: "POST /consultations/:id/ai/autofill-record",
    userInitiated: true,
    activeInProductionId: true,
    countsTowardSeven: true,
    notes: "NO abre Insights — redirige a Ficha (comportamiento opaco)",
  },
  {
    id: "ep-ficha-autollenar",
    label: "Ficha → Autollenar con IA",
    route: "/panel/consultas/[id]",
    trigger: "ClinicalRecordPanel botón «Autollenar con IA»",
    component: "ClinicalRecordPanel.tsx",
    backend: "POST /consultations/:id/ai/autofill-record",
    userInitiated: true,
    activeInProductionId: true,
    countsTowardSeven: true,
    notes: "Duplica backend del menú Análisis IA",
  },
  {
    id: "ep-live-ai-notes",
    label: "LiveAiNoteSuggestions™",
    route: "/panel/consultas/[id]",
    trigger: "Automático al escribir en Notas SOAP (≥30 chars, debounce 2.5s)",
    component: "LiveAiNoteSuggestions.tsx → SoapSection bloque 3",
    backend: "requestEnrichedClinicalDocumentation → assist + summary fallback",
    userInitiated: false,
    activeInProductionId: true,
    countsTowardSeven: true,
    notes: "Experiencia contextual objetivo — mantener",
  },
  {
    id: "ep-legacy-consultas-page",
    label: "Legacy /panel/consultas inline",
    route: "/panel/consultas",
    trigger: "UI inline si consultationId sin redirect",
    component: "app/panel/consultas/page.tsx",
    backend: "Assist + Insights + LiveAiNotes",
    userInitiated: true,
    activeInProductionId: false,
    countsTowardSeven: false,
    notes: "Redirect a [id] en flujo normal; legacy residual",
  },
  {
    id: "ep-actionbar-chip-dead",
    label: "ConsultationActionBar chip IA",
    route: "/panel/consultas/[id]",
    trigger: "Chip «Análisis clínico con IA»",
    component: "ConsultationActionBar.tsx (eliminado 19A.1)",
    backend: "handleAnalyzeWithAi (mismo que menú)",
    userInitiated: true,
    activeInProductionId: false,
    countsTowardSeven: false,
    notes: "Componente eliminado en 19A.1; tipos viven en lib/encounter/action-bar-types.ts",
  },
];

export const AI_ENTRY_POINT_SUMMARY = {
  totalInventory: AI_ENTRY_POINTS_INVENTORY.length,
  activeInConsultationDetail: AI_ENTRY_POINTS_INVENTORY.filter(
    (e) => e.activeInProductionId && e.countsTowardSeven,
  ).length,
  userInitiatedActive: AI_ENTRY_POINTS_INVENTORY.filter(
    (e) => e.activeInProductionId && e.userInitiated,
  ).length,
  targetMax: 2,
  targetPrimary: "HeyDoctor Copilot",
  targetContextual: "LiveAiNoteSuggestions™",
} as const;

export type AiBackendNode = {
  id: string;
  endpoint: string;
  consumers: string[];
  responseShape: string;
};

/** Mapa de dependencias — backend y lib */
export const AI_DEPENDENCY_MAP = {
  uiComponents: [
    {
      id: "clinical-copilot-drawer",
      file: "app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx",
      dependsOn: [
        "lib/clinical-copilot-intelligence.ts",
        "lib/clinical-memory.ts",
        "lib/doctor-dna-intelligence.ts",
        "hooks/usePatientClinicalMemory.ts",
        "hooks/useDoctorDna.ts",
      ],
      children: [
        "CopilotDocumentationQuality.tsx",
        "CopilotContextEngine.tsx",
        "CopilotInsightCards.tsx",
        "CopilotRiskSignals.tsx",
        "CopilotDocumentationGaps.tsx",
        "CopilotActionSystem.tsx",
        "CopilotGovernanceBoundary.tsx",
      ],
    },
    {
      id: "consultation-assist-panel",
      file: "components/clinical/ConsultationAssistPanel.tsx",
      dependsOn: ["lib/services/consultation-assist.ts"],
      children: [],
    },
    {
      id: "ai-insights-panel",
      file: "components/clinical/AiInsightsPanel.tsx",
      dependsOn: [
        "lib/services/consultations.ts → fetchConsultationAi",
        "context/ConsultationContext.tsx → appendNotesFromAi",
      ],
      children: [],
    },
    {
      id: "live-ai-notes",
      file: "components/clinical/LiveAiNoteSuggestions.tsx",
      dependsOn: [
        "lib/services/ai-clinical.ts → requestEnrichedClinicalDocumentation",
        "lib/ai-clinical-context.ts",
        "lib/clinical-data-foundation.ts",
        "context/ClinicalIntelligenceContext.tsx",
      ],
      children: [],
    },
    {
      id: "clinical-record-autofill",
      file: "components/clinical/ClinicalRecordPanel.tsx",
      dependsOn: [
        "lib/services/clinical-record.ts → autofillClinicalRecord",
        "hooks/usePatientClinicalMemory.ts",
      ],
      children: [],
    },
  ],
  backendEndpoints: [
    {
      id: "copilot-local",
      endpoint: "(ninguno — motor cliente)",
      consumers: ["ClinicalCopilotDrawer"],
      responseShape: "ClinicalCopilotIntelligenceBundle",
    },
    {
      id: "consultation-assist",
      endpoint: "POST /consultation-assist",
      consumers: [
        "ConsultationAssistPanel",
        "requestEnrichedClinicalDocumentation (primario)",
      ],
      responseShape: "ConsultationAssistResponse",
    },
    {
      id: "consultation-ai-get",
      endpoint: "GET consultation AI payload",
      consumers: ["AiInsightsPanel → fetchConsultationAi"],
      responseShape: "ConsultationAiPayload",
    },
    {
      id: "consultation-summary",
      endpoint: "POST /ai/consultation-summary",
      consumers: ["requestEnrichedClinicalDocumentation (fallback)"],
      responseShape: "ConsultationSummaryResponse",
    },
    {
      id: "autofill-record",
      endpoint: "POST /consultations/:id/ai/autofill-record",
      consumers: [
        "ClinicalRecordPanel handleAutofill",
        "EncounterActionMenu → aiTrigger",
      ],
      responseShape: "AutofillResponse → ClinicalRecord",
    },
  ] satisfies AiBackendNode[],
  orchestration: [
    {
      file: "app/panel/consultas/[id]/page.tsx",
      state: ["aiTrigger", "copilotDrawerOpen", "leftPaneTab", "workspaceTab"],
      handlers: ["handleAnalyzeWithAi", "onOpenCopilot"],
    },
    {
      file: "lib/services/ai-clinical.ts",
      role: "Orquesta assist → summary fallback para documentación enriquecida",
    },
    {
      file: "lib/clinical-summary-quality.ts",
      role: "mapAssistToClinicalSummary, enhanceConsultationSummary",
    },
  ],
  outOfScopeNotGenerativeIa: [
    {
      id: "doctor-dna-drawer",
      file: "DoctorDnaDrawer.tsx",
      note: "Analítica determinística del médico — no LLM; confunde con Copilot en header",
    },
    {
      id: "chat-panel",
      file: "components/telemedicine/ChatPanel.tsx",
      note: "Mensajería consulta — no IA; ubicado en tab Asistencia",
    },
  ],
} as const;

export type AiComponentVerdict = {
  component: string;
  category: "principal" | "contextual" | "redundante" | "retiro" | "consolidar" | "reubicar";
  rationale: string;
};

/** Respuestas explícitas a las 5 preguntas Phase 4.8.2 */
export const AI_UNIFICATION_VERDICTS: AiComponentVerdict[] = [
  {
    component: "HeyDoctor Copilot",
    category: "principal",
    rationale:
      "Único hub determinístico post-4.7D: quality, gaps, risks, insights, governance. Entry point canónico header.",
  },
  {
    component: "LiveAiNoteSuggestions™",
    category: "contextual",
    rationale:
      "Momento UX distinto (escritura inline Notas). Máximo 2ª experiencia IA permitida por regla central.",
  },
  {
    component: "Consultation Assist™",
    category: "consolidar",
    rationale:
      "Generativo redundante con Insights y parcialmente con LiveAiNotes. Fusionar en sección opt-in del Copilot.",
  },
  {
    component: "AI Insights Panel™",
    category: "retiro",
    rationale:
      "Duplica summary/improvedNotes/suggestedDiagnosis. Carga automática genera ruido y API paralela.",
  },
  {
    component: "Tab Asistencia",
    category: "retiro",
    rationale:
      "Contenedor que mezcla IA generativa + chat. Causa «¿qué IA uso?». Eliminar tab tras migración.",
  },
  {
    component: "Menú ⋯ Análisis clínico con IA",
    category: "retiro",
    rationale:
      "Comportamiento opaco (va a Ficha autofill, no a Copilot). Duplica botón Autollenar.",
  },
  {
    component: "ClinicalRecordPanel Autollenar",
    category: "consolidar",
    rationale:
      "Mantener capacidad autofill-record; exponer como acción Copilot «Completar ficha» o botón único en Ficha.",
  },
  {
    component: "ConsultationActionBar chip IA",
    category: "retiro",
    rationale: "Código no montado en [id]; eliminar en limpieza para evitar reactivación accidental.",
  },
  {
    component: "ChatPanel en tab Asistencia",
    category: "reubicar",
    rationale: "No es IA. Mover a teleconsulta o chip Comunicación.",
  },
  {
    component: "Doctor DNA™ drawer",
    category: "reubicar",
    rationale:
      "Fuera de unificación IA generativa. Mantener separado; quitar observación DNA del Copilot Context Engine.",
  },
  {
    component: "Legacy page.tsx IA stack",
    category: "retiro",
    rationale: "Duplica todo el stack; eliminar con redirect forzado.",
  },
];

export const AI_TARGET_ARCHITECTURE = {
  rule: "El médico nunca pregunta «¿Qué IA debo usar?»",
  layers: [
    {
      layer: "Principal",
      surface: "HeyDoctor Copilot drawer",
      contains: [
        "Documentation Quality + Gaps (determinístico)",
        "Risk Signals + Insight Cards (determinístico)",
        "Context Engine resumido (sin duplicar Memory/Timeline)",
        "Generative Assist (opt-in colapsado): diferenciales + educación",
        "Acción «Completar ficha estructurada» → autofill-record",
      ],
      entryPoints: 1,
    },
    {
      layer: "Contextual",
      surface: "LiveAiNoteSuggestions™ en SOAP Notas",
      contains: [
        "Sugerencias debounced al escribir",
        "Insertar fragmento en notas",
      ],
      entryPoints: 1,
    },
  ],
  serviceLayer: {
    name: "ClinicalAiFacade (futuro lib/clinical-ai-facade.ts)",
    unifies: [
      "requestEnrichedClinicalDocumentation",
      "fetchConsultationAi (deprecar)",
      "requestConsultationAssist (internal)",
      "autofillClinicalRecord",
    ],
    exposes: [
      "getInlineNoteSuggestions(input) → LiveAiNotes",
      "getGenerativeAssist(input) → Copilot opt-in",
      "autofillStructuredRecord(input) → Copilot action",
    ],
  },
  entryPointTarget: { before: 7, after: 2 },
} as const;

export type MigrationRisk = {
  id: string;
  risk: string;
  severity: "alta" | "media" | "baja";
  mitigation: string;
};

export const AI_MIGRATION_RISKS: MigrationRisk[] = [
  {
    id: "mr-1",
    risk: "Médicos acostumbrados a tab Asistencia para diferenciales generativos",
    severity: "alta",
    mitigation: "Copilot sección «Asistencia generativa» colapsada + tooltip migración 1 release",
  },
  {
    id: "mr-2",
    risk: "AiInsightsPanel appendNotesFromAi usa ConsultationContext desincronizado con page [id]",
    severity: "media",
    mitigation: "Migrar insert a handler SOAP local antes de retirar panel",
  },
  {
    id: "mr-3",
    risk: "LiveAiNotes y Copilot generativo comparten assist — rate limit 429",
    severity: "media",
    mitigation: "Facade con cooldown compartido y prioridad inline > drawer",
  },
  {
    id: "mr-4",
    risk: "Menú Análisis IA actual va a Ficha — usuarios esperan Insights",
    severity: "alta",
    mitigation: "Comunicar cambio; unificar en Copilot antes de remover menú",
  },
  {
    id: "mr-5",
    risk: "Tests Phase 4.5.x acoplados a Assist/Insights separados",
    severity: "baja",
    mitigation: "Actualizar clinical-ai-validation y real-validation tras facade",
  },
  {
    id: "mr-6",
    risk: "Backend sin cambios — 4 endpoints IA distintos permanecen",
    severity: "baja",
    mitigation: "Facade frontend unifica consumo; consolidación backend fuera alcance 4.8.2",
  },
];

export const AI_TRANSITION_PLAN = [
  {
    step: 1,
    name: "Documentar y congelar (4.8.2)",
    actions: ["Audit completo", "Sin cambios UX"],
    exitCriteria: "Aprobación clínica del diseño",
  },
  {
    step: 2,
    name: "Facade servicio (4.8.3a)",
    actions: [
      "Crear clinical-ai-facade.ts",
      "LiveAiNotes + Copilot consumen facade",
      "Sin retirar paneles aún",
    ],
    exitCriteria: "Tests existentes PASS",
  },
  {
    step: 3,
    name: "Copilot generative section (4.8.3b)",
    actions: [
      "Añadir sección colapsada Generative Assist en drawer",
      "Paridad funcional Assist + Insights",
    ],
    exitCriteria: "Paridad manual QA documentada",
  },
  {
    step: 4,
    name: "Redirect entry points (4.8.3c)",
    actions: [
      "Menú Análisis IA → abre Copilot (no Ficha)",
      "Tab Asistencia oculta con flag",
    ],
    exitCriteria: "2 entry points visibles en [id]",
  },
  {
    step: 5,
    name: "Retiro paneles (4.8.3d)",
    actions: [
      "Eliminar ConsultationAssistPanel mount",
      "Eliminar AiInsightsPanel mount",
      "Reubicar ChatPanel",
    ],
    exitCriteria: "Zero imports Assist/Insights en encounter",
  },
  {
    step: 6,
    name: "Limpieza legacy",
    actions: [
      "Retirar chip ConsultationActionBar IA",
      "Limpiar page.tsx legacy IA",
      "Un solo botón Autollenar (Ficha o Copilot)",
    ],
    exitCriteria: "Inventario entry points = 2",
  },
] as const;

export const AI_EXPERIENCE_FILES_AFFECTED = [
  "app/panel/consultas/[id]/page.tsx",
  "app/panel/consultas/[id]/_components/EncounterHeader.tsx",
  "app/panel/consultas/[id]/_components/EncounterLeftPane.tsx",
  "app/panel/consultas/[id]/_components/EncounterActionMenu.tsx",
  "app/panel/consultas/[id]/_components/MobileConsultationWorkspace.tsx",
  "app/panel/consultas/[id]/_components/SoapSection.tsx",
  "app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotActionSystem.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotGenerativeSection.tsx",
  "components/clinical/LiveAiNoteSuggestions.tsx",
  "components/clinical/ClinicalRecordPanel.tsx",
  "lib/encounter/action-bar-types.ts",
  "components/clinical/index.ts",
  "components/telemedicine/ChatPanel.tsx",
  "lib/services/ai-clinical.ts",
  "lib/services/consultation-assist.ts",
  "lib/services/consultations.ts",
  "lib/services/clinical-record.ts",
  "context/ConsultationContext.tsx",
  "app/panel/consultas/page.tsx",
] as const;

export function runAiExperienceUnificationAudit() {
  return {
    entryPoints: AI_ENTRY_POINT_SUMMARY,
    redundantComponents: AI_UNIFICATION_VERDICTS.filter((v) =>
      ["redundante", "retiro"].includes(v.category),
    ).length,
    consolidateComponents: AI_UNIFICATION_VERDICTS.filter(
      (v) => v.category === "consolidar",
    ).length,
    backendEndpoints: AI_DEPENDENCY_MAP.backendEndpoints.length,
    migrationRisks: AI_MIGRATION_RISKS.length,
    transitionSteps: AI_TRANSITION_PLAN.length,
  };
}
