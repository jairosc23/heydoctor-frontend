/**
 * Phase 4.8.1 — Production Consolidation Audit™
 * Auditoría y propuestas de consolidación. Sin cambios de runtime.
 */

export type IaComponentId =
  | "clinical-copilot"
  | "consultation-assist"
  | "ai-insights-panel"
  | "live-ai-note-suggestions"
  | "telemedicine-chat";

export type IaComponentAudit = {
  id: IaComponentId;
  label: string;
  location: string[];
  dataSource: string;
  purpose: string;
  entryPoints: string[];
  redundantWith: IaComponentId[];
  verdict: "mantener" | "consolidar" | "deprecar" | "reubicar";
  rationale: string;
};

/** Prioridad 1 — IA unificada */
export const IA_UNIFICATION_AUDIT: IaComponentAudit[] = [
  {
    id: "clinical-copilot",
    label: "Clinical Copilot™",
    location: [
      "app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx",
      "lib/clinical-copilot-intelligence.ts",
    ],
    dataSource: "Motor determinístico local (SOAP + Clinical Memory + Doctor DNA)",
    purpose:
      "Inteligencia clínica de consulta: quality, gaps, insights, risk signals, context engine.",
    entryPoints: [
      "EncounterHeader → ClinicalCopilotTrigger (✨)",
    ],
    redundantWith: [],
    verdict: "mantener",
    rationale:
      "Canónico post-4.7D. Único punto para inteligencia determinística de la consulta activa.",
  },
  {
    id: "consultation-assist",
    label: "Consultation Assist™",
    location: [
      "components/clinical/ConsultationAssistPanel.tsx",
      "lib/services/consultation-assist.ts",
    ],
    dataSource: "POST /consultation-assist (LLM generativo)",
    purpose: "Diferenciales, recomendaciones generales, educación — bajo demanda.",
    entryPoints: [
      "EncounterLeftPane tab Asistencia",
      "MobileConsultationWorkspace tab Asistencia",
      "app/panel/consultas/page.tsx (legacy)",
    ],
    redundantWith: ["ai-insights-panel", "clinical-copilot"],
    verdict: "consolidar",
    rationale:
      "Solapa propósito con AiInsightsPanel y confunde con Copilot. No aporta trazabilidad determinística.",
  },
  {
    id: "ai-insights-panel",
    label: "AI Insights Panel™",
    location: [
      "components/clinical/AiInsightsPanel.tsx",
      "lib/services/consultations.ts → fetchConsultationAi",
    ],
    dataSource: "GET consultation AI payload (summary, improvedNotes, suggestedDiagnosis)",
    purpose: "Resumen IA cacheado, notas mejoradas, diagnósticos sugeridos con botones Usar.",
    entryPoints: [
      "EncounterLeftPane tab Asistencia (debajo de Assist)",
      "MobileConsultationWorkspace tab Asistencia",
      "EncounterActionMenu → Análisis clínico con IA (via aiTrigger autofill)",
      "ConsultationActionBar chip IA (legacy layout)",
      "app/panel/consultas/page.tsx (legacy)",
    ],
    redundantWith: ["live-ai-note-suggestions", "consultation-assist"],
    verdict: "consolidar",
    rationale:
      "Cuatro entry points para el mismo backend IA. Duplica improvedNotes/suggestedDiagnosis con LiveAiNoteSuggestions.",
  },
  {
    id: "live-ai-note-suggestions",
    label: "Live AI Note Suggestions™",
    location: [
      "components/clinical/LiveAiNoteSuggestions.tsx",
      "lib/services/ai-clinical.ts",
    ],
    dataSource: "requestEnrichedClinicalDocumentation (debounced, SOAP block 3)",
    purpose: "Sugerencias inline mientras el médico escribe notas — momento UX distinto.",
    entryPoints: ["SoapSection bloque Notas"],
    redundantWith: ["ai-insights-panel"],
    verdict: "mantener",
    rationale:
      "Inline en flujo de escritura. Consolidar APIs con Insights pero mantener superficie en Notas.",
  },
  {
    id: "telemedicine-chat",
    label: "Chat teleconsulta",
    location: ["components/telemedicine/ChatPanel.tsx"],
    dataSource: "Mensajes de consulta / WebRTC",
    purpose: "Comunicación médico-paciente — no es IA clínica.",
    entryPoints: ["Tab Asistencia (ChatPanel)"],
    redundantWith: [],
    verdict: "reubicar",
    rationale:
      "No pertenece a tab Asistencia IA. Mover a teleconsulta o panel comunicación dedicado.",
  },
];

export const IA_UNIFICATION_PROPOSAL = {
  canonicalHub: "Clinical Copilot™ (drawer header ✨)",
  inlineAssist: "LiveAiNoteSuggestions™ (solo bloque Notas SOAP)",
  deprecate: [
    "Tab Asistencia completa en EncounterLeftPane / Mobile",
    "ConsultationAssistPanel en producción",
    "AiInsightsPanel como panel independiente",
    "Entry points duplicados: EncounterActionMenu Análisis IA, ConsultationActionBar chip IA",
  ],
  migrateToCopilot: [
    "Acción única «Solicitar asistencia generativa» dentro del drawer Copilot (colapsada, opt-in)",
    "Unificar backend: LiveAiNoteSuggestions + fetchConsultationAi → un servicio documentado",
  ],
  keepSeparate: [
    "Doctor DNA™ — analítica del médico, no IA de consulta",
    "ChatPanel — comunicación, no documentación",
  ],
  expectedImpact: {
    entryPointsBefore: 7,
    entryPointsAfter: 2,
    cognitiveLoadReduction: "≈60% en superficies IA",
  },
} as const;

export type ClinicalDataDomain =
  | "demographics"
  | "active_conditions"
  | "allergies"
  | "clinical_alerts"
  | "medications"
  | "pending_labs"
  | "longitudinal_consultations"
  | "vitals"
  | "physical_exam"
  | "documentation_quality"
  | "doctor_style";

export type DeduplicationCell = {
  domain: ClinicalDataDomain;
  surfaces: string[];
  sourceOfTruth: string;
  duplicationSeverity: "alta" | "media" | "baja";
  simplification: string;
};

/** Prioridad 2 — deduplicación clínica */
export const CLINICAL_DEDUPLICATION_MAP: DeduplicationCell[] = [
  {
    domain: "demographics",
    surfaces: [
      "PatientSnapshot (chrome)",
      "PatientContextRail (rail)",
      "Copilot Context Engine",
    ],
    sourceOfTruth: "PatientRow + PatientProfile API",
    duplicationSeverity: "media",
    simplification:
      "Rail como única demografía expandida; Snapshot solo nombre + estado consulta en desktop xl+.",
  },
  {
    domain: "active_conditions",
    surfaces: [
      "PatientSnapshot badges (top 3)",
      "ClinicalMemoryCard highlights",
      "ClinicalTimeline diagnosis events",
      "Copilot Context Engine",
    ],
    sourceOfTruth: "usePatientClinicalMemory → activeConditions",
    duplicationSeverity: "alta",
    simplification:
      "Memory card = vista canónica condiciones; Snapshot muestra solo contador «N condiciones» con tooltip.",
  },
  {
    domain: "allergies",
    surfaces: [
      "SafetyStrip chips",
      "PatientSnapshot allergy badges",
      "ClinicalMemoryCard tier-allergy",
      "PatientProfile en rail",
    ],
    sourceOfTruth: "PatientProfile.allergies",
    duplicationSeverity: "alta",
    simplification:
      "SafetyStrip único para riesgo inmediato; eliminar badges duplicados en Snapshot y Memory.",
  },
  {
    domain: "clinical_alerts",
    surfaces: [
      "SafetyStrip",
      "PatientSnapshot «N alertas»",
      "ClinicalTimeline AlertsStrip",
      "Copilot Risk Signals",
    ],
    sourceOfTruth: "PatientProfile alerts + Clinical Memory alerts",
    duplicationSeverity: "alta",
    simplification:
      "Críticas en SafetyStrip; resto solo en Copilot Risk (priorizado) — no repetir en Timeline strip.",
  },
  {
    domain: "medications",
    surfaces: [
      "ClinicalMemoryCard",
      "ClinicalTimeline medication events",
      "UnifiedClinicalActionBar plan meds",
      "PrescriptionPanel orders",
      "Copilot Context Engine medicación activa",
    ],
    sourceOfTruth: "Clinical Memory currentMedications + Orders prescriptions",
    duplicationSeverity: "alta",
    simplification:
      "Memory lista activa; Orders = acciones; Copilot no repite listado (solo insights accionables).",
  },
  {
    domain: "pending_labs",
    surfaces: ["ClinicalMemoryCard", "ClinicalTimeline", "Copilot insights dm2-lab"],
    sourceOfTruth: "Clinical Memory pendingLabs",
    duplicationSeverity: "media",
    simplification: "Memory + Copilot insight único; Timeline solo histórico completado.",
  },
  {
    domain: "longitudinal_consultations",
    surfaces: [
      "ClinicalTimeline",
      "Copilot Context Engine longitudinalSummary",
      "Doctor DNA activity narrative",
    ],
    sourceOfTruth: "Clinical Memory recentConsultations",
    duplicationSeverity: "media",
    simplification:
      "Timeline canónico; Copilot referencia sin re-listar fechas; DNA fuera del encounter.",
  },
  {
    domain: "vitals",
    surfaces: [
      "SOAP notes (parsed)",
      "Copilot vitalsSummary + hta-vitals insight",
      "Documentation Quality factor vitals",
    ],
    sourceOfTruth: "SOAP notes / HD_VS_V1 marker",
    duplicationSeverity: "baja",
    simplification: "Aceptable si Copilot no duplica valores numéricos en insight+risk (4.7B OK).",
  },
  {
    domain: "physical_exam",
    surfaces: [
      "ClinicalRecordPanel systemsReview",
      "SOAP notes HD_PE_V1",
      "Copilot Documentation Gaps gap-pe-*",
    ],
    sourceOfTruth: "notes serialized markers",
    duplicationSeverity: "media",
    simplification: "Un solo lugar de captura: Ficha → serializa a notes; gaps solo en Copilot.",
  },
  {
    domain: "documentation_quality",
    surfaces: [
      "Copilot Documentation Quality",
      "Copilot Documentation Gaps",
      "LiveAiNoteSuggestions",
    ],
    sourceOfTruth: "buildDocumentationQuality + buildDocumentationGaps",
    duplicationSeverity: "media",
    simplification:
      "Quality compacto en Copilot; sugerencias IA solo en Notas — no tercer panel de calidad.",
  },
  {
    domain: "doctor_style",
    surfaces: ["DoctorDnaDrawer", "Copilot doctorDnaObservation"],
    sourceOfTruth: "lib/doctor-dna-intelligence.ts",
    duplicationSeverity: "baja",
    simplification:
      "Eliminar doctorDnaObservation del Copilot Context Engine; DNA solo en drawer dedicado.",
  },
];

export type CloseFlowStep = {
  status: string;
  label: string;
  uiLocation: string[];
  editable: boolean;
  ambiguity?: string;
};

/** Prioridad 3 — Consultation Close Flow audit */
export const CONSULTATION_CLOSE_FLOW_AUDIT: CloseFlowStep[] = [
  {
    status: "draft",
    label: "Borrador",
    uiLocation: ["PatientSnapshot emoji", "EncounterActionMenu → Iniciar consulta"],
    editable: true,
    ambiguity: "Consulta creada pero médico puede no saber que debe «Iniciar».",
  },
  {
    status: "in_progress",
    label: "En progreso",
    uiLocation: ["Autosave activo", "SOAP editable"],
    editable: true,
  },
  {
    status: "completed",
    label: "Completada",
    uiLocation: ["EncounterActionMenu → Marcar como completada"],
    editable: true,
    ambiguity: "«Completada» sugiere cierre pero aún editable y firmable sin checklist.",
  },
  {
    status: "signed",
    label: "Firmada",
    uiLocation: ["EncounterHeader → SignatureCanvas → handleSign"],
    editable: false,
    ambiguity: "Firma separada del menú ⋯; médico puede firmar sin marcar completada.",
  },
  {
    status: "locked",
    label: "Bloqueada",
    uiLocation: ["Payku redirect ?payment=success", "Card consulta pagada"],
    editable: false,
    ambiguity: "Pago accesible también en signed/completed (canPay ambiguo).",
  },
];

export const CONSULTATION_CLOSE_FLOW_RECOMMENDED = {
  title: "Consultation Close Flow™ — diseño recomendado (no implementado)",
  phases: [
    {
      phase: 1,
      name: "Documentar",
      actions: ["SOAP completo", "Órdenes emitidas", "Ficha guardada"],
      gate: "Copilot gaps CRÍTICOS visibles (informativo, no bloqueante)",
    },
    {
      phase: 2,
      name: "Completar consulta",
      actions: ["Un solo botón «Finalizar documentación»"],
      backend: "in_progress → completed",
    },
    {
      phase: 3,
      name: "Firmar",
      actions: ["Wizard paso firma con preview PDF"],
      backend: "completed → signed",
    },
    {
      phase: 4,
      name: "Entregar",
      actions: ["Documentos legales", "Pago opcional"],
      backend: "signed → locked (post-pago)",
    },
  ],
  uiPrinciples: [
    "Barra de progreso horizontal en EncounterHeader (4 pasos)",
    "Eliminar «Marcar completada» del menú oculto ⋯",
    "canPay solo cuando status === signed",
    "endConsultation en /panel/consultas ≠ cierre legal — renombrar o unificar",
  ],
  duplicateRoutes: [
    "EncounterActionMenu transition vs header sign (orden libre)",
    "ConsultationContext.endConsultation vs signConsultation API",
    "DocumentsTab + ActionBar + EncounterActionMenu PDF/factura",
  ],
} as const;

/** Prioridad 4 — Action Workspace validation */
export const ACTION_WORKSPACE_VALIDATION = {
  flags: {
    clinicalActionWorkspace: {
      env: "NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE",
      defaultInCode: false,
      documentedInEnvExample: true,
      smartDocumented: false,
    },
    smartClinicalWorkspace: {
      env: "NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE",
      defaultInCode: false,
      documentedInEnvExample: false,
    },
  },
  layoutMatrix: [
    {
      actionWs: false,
      smartWs: false,
      layout: "Legacy 3-column: Rail | SOAP | Orders+Docs right pane",
      productionLikely: true,
    },
    {
      actionWs: true,
      smartWs: false,
      layout: "2-column + ClinicalModuleSheet para órdenes/docs",
      productionLikely: false,
    },
    {
      actionWs: false,
      smartWs: true,
      layout: "3-column con SOAP compacto + scroll spy",
      productionLikely: false,
    },
    {
      actionWs: true,
      smartWs: true,
      layout: "2-column compacto + sheet (config auditada 4.7–4.8)",
      productionLikely: false,
    },
  ],
  productionVerification: {
    railwayMcpAccessible: false,
    note:
      "Railway MCP no autenticado en sesión 4.8.1. Flags compile-time en Next.js — requieren verificación manual en Vercel/Railway dashboard.",
    recommendedAction:
      "Documentar valores reales en runbook ops; activar ambos flags en staging → QA checklist P0 → prod.",
  },
  behavioralDifferences: [
    "Action WS ON: órdenes/documentos en sheet, no panel derecho",
    "Smart WS ON: Memory compact, Timeline colapsado, SoapStickyNav",
    "Ambos OFF: más scroll, timeline abierto, copy plan «panel derecho» válido",
    "Header shortcuts legacy ocultos cuando Action WS ON",
  ],
} as const;

export type E2eSpecCase = {
  id: string;
  priority: "P0" | "P1";
  scenario: string;
  preconditions: string[];
  steps: string[];
  assertions: string[];
};

/** Prioridad 5 — E2E readiness (especificación solamente) */
export const E2E_MINIMUM_SPEC: E2eSpecCase[] = [
  {
    id: "e2e-hta-followup",
    priority: "P0",
    scenario: "HTA control — SOAP + plan + receta + firma",
    preconditions: ["Paciente con memoria I10", "Consulta draft"],
    steps: [
      "Iniciar consulta → in_progress",
      "Documentar dx I10, PA en notas, plan antihipertensivo",
      "Verificar autosave indicator",
      "Aplicar plan unificado → crear receta",
      "Marcar completada → firmar → generar PDF consulta",
    ],
    assertions: [
      "status signed",
      "Prescription visible en Orders",
      "PDF descargable",
      "Clinical Memory sin regresión",
    ],
  },
  {
    id: "e2e-ficha-autosave",
    priority: "P0",
    scenario: "Ficha clínica + SOAP sin pérdida de datos",
    preconditions: ["Consulta in_progress"],
    steps: [
      "Escribir notas SOAP",
      "Abrir tab Ficha → guardar HEA",
      "Recargar página",
    ],
    assertions: [
      "Notas SOAP intactas",
      "Marcador HD_CR_V1 presente en notes",
      "Sin duplicación corrupta",
    ],
  },
  {
    id: "e2e-acute-cefalea",
    priority: "P1",
    scenario: "Consulta aguda cefalea — documentación mínima",
    preconditions: ["Paciente sin memoria crónica"],
    steps: [
      "Dx R51, notas breves, plan sintomático",
      "Verificar Copilot silence mode",
      "Completar y firmar",
    ],
    assertions: ["Copilot sin falsos riesgos", "Quality Adecuado o superior"],
  },
  {
    id: "e2e-orders-lab",
    priority: "P0",
    scenario: "Orden laboratorio + overview",
    preconditions: ["Consulta in_progress", "Dx DM2"],
    steps: [
      "Abrir Orders → Lab → crear orden HbA1c",
      "Verificar OrdersOverview contadores",
    ],
    assertions: ["Lab order pending", "Overview pendientes += 1"],
  },
  {
    id: "e2e-payment-lock",
    priority: "P0",
    scenario: "Firma → pago → bloqueo",
    preconditions: ["Consulta signed", "Payku sandbox"],
    steps: [
      "Iniciar pago desde header",
      "Completar flujo Payku",
      "Retorno ?payment=success",
    ],
    assertions: ["status locked", "SOAP no editable", "Card bloqueada visible"],
  },
  {
    id: "e2e-documents-hub",
    priority: "P1",
    scenario: "Documentos post-firma",
    preconditions: ["Consulta signed"],
    steps: [
      "Abrir DocumentsTab",
      "Generar receta firmada PDF",
    ],
    assertions: ["PDF generado", "Botones disabled pre-firma en consulta draft"],
  },
  {
    id: "e2e-mobile-tabs",
    priority: "P1",
    scenario: "Navegación móvil 5 tabs",
    preconditions: ["Viewport móvil"],
    steps: [
      "Alternar SOAP → Órdenes → Documentos",
      "Verificar rail duplicado xl:hidden",
    ],
    assertions: ["Sin pérdida estado tabs", "Autosave continúa"],
  },
];

export type LegacyItem = {
  id: string;
  path: string;
  type: "route" | "component" | "panel" | "compat" | "deprecated-lib";
  severity: "retirar" | "redirect" | "monitorear";
  plan: string;
};

/** Prioridad 6 — Legacy cleanup inventory */
export const LEGACY_INVENTORY: LegacyItem[] = [
  {
    id: "legacy-consultas-page",
    path: "app/panel/consultas/page.tsx",
    type: "route",
    severity: "redirect",
    plan:
      "Mantener solo selector/iniciar consulta; eliminar workspace inline (Rx, Lab, IA) tras redirect garantizado.",
  },
  {
    id: "patient-banner",
    path: "app/panel/consultas/[id]/_components/PatientBanner.tsx",
    type: "component",
    severity: "retirar",
    plan: "Sin imports activos; reemplazado por PatientSnapshot + EncounterChromeShell.",
  },
  {
    id: "encounter-right-pane",
    path: "app/panel/consultas/[id]/_components/EncounterRightPane.tsx",
    type: "panel",
    severity: "monitorear",
    plan: "Activo solo con Action WS OFF; retirar cuando flag ON sea default prod.",
  },
  {
    id: "consultation-action-bar-full",
    path: "components/clinical/ConsultationActionBar.tsx",
    type: "component",
    severity: "monitorear",
    plan: "Parcialmente sustituido por EncounterHeader + ClinicalActionBar; unificar handlers.",
  },
  {
    id: "assist-tab",
    path: "EncounterLeftPane tab assist",
    type: "panel",
    severity: "retirar",
    plan: "Deprecar tras consolidación IA (4.8.1 P1).",
  },
  {
    id: "clinical-copilot-mock",
    path: "lib/clinical-copilot-mock.ts",
    type: "deprecated-lib",
    severity: "retirar",
    plan: "Eliminar tras verificar cero imports.",
  },
  {
    id: "invoice-dual",
    path: "InvoicesSubTab + DocumentsTab legacy POST",
    type: "compat",
    severity: "monitorear",
    plan: "Unificar a createInvoiceForConsultation; mantener legacy hasta migración billing.",
  },
  {
    id: "consultation-context-notes",
    path: "context/ConsultationContext.tsx clinicalNotes",
    type: "compat",
    severity: "monitorear",
    plan: "Desincronizado con page [id]; deprecar estado global notes.",
  },
  {
    id: "create-diagnosis-legacy",
    path: "lib/services/diagnosis.ts + page.tsx legacy",
    type: "compat",
    severity: "retirar",
    plan: "Usar updateConsultation + cie10CodeId exclusivamente.",
  },
];

export const CONSOLIDATION_ROADMAP = [
  {
    phase: "4.8.2",
    name: "IA Unification",
    scope: "Deprecar tab Asistencia; unificar entry points; reubicar Chat",
    effort: "M",
    risk: "Medio — médicos acostumbrados a tab Asistencia",
  },
  {
    phase: "4.8.3",
    name: "Clinical Chrome Dedup",
    scope: "SafetyStrip canónico; Snapshot minimal; Copilot sin Context duplicado",
    effort: "M",
    risk: "Bajo",
  },
  {
    phase: "4.8.4",
    name: "Close Flow Wizard",
    scope: "Implementar diseño CONSULTATION_CLOSE_FLOW_RECOMMENDED",
    effort: "L",
    risk: "Medio — legal/billing",
  },
  {
    phase: "4.8.5",
    name: "Workspace Flags Prod",
    scope: "Activar Action+Smart WS; QA; retirar layout legacy 3-col",
    effort: "S",
    risk: "Medio — layout change",
  },
  {
    phase: "4.8.6",
    name: "E2E P0 Suite",
    scope: "Implementar E2E_MINIMUM_SPEC casos P0",
    effort: "L",
    risk: "Bajo",
  },
  {
    phase: "4.8.7",
    name: "Legacy Retirement",
    scope: "LEGACY_INVENTORY items severity retirar",
    effort: "M",
    risk: "Bajo",
  },
] as const;

export const E2E_ROADMAP = [
  { sprint: 1, cases: ["e2e-hta-followup", "e2e-ficha-autosave"], tooling: "Playwright" },
  { sprint: 2, cases: ["e2e-orders-lab", "e2e-payment-lock"], tooling: "Playwright + Payku mock" },
  { sprint: 3, cases: ["e2e-acute-cefalea", "e2e-documents-hub", "e2e-mobile-tabs"], tooling: "Playwright" },
] as const;

export const FILES_AFFECTED_BY_CONSOLIDATION = [
  "app/panel/consultas/[id]/page.tsx",
  "app/panel/consultas/[id]/_components/EncounterLeftPane.tsx",
  "app/panel/consultas/[id]/_components/MobileConsultationWorkspace.tsx",
  "app/panel/consultas/[id]/_components/EncounterHeader.tsx",
  "app/panel/consultas/[id]/_components/EncounterActionMenu.tsx",
  "app/panel/consultas/[id]/_components/PatientSnapshot.tsx",
  "app/panel/consultas/[id]/_components/SafetyStrip.tsx",
  "app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotContextEngine.tsx",
  "components/clinical/ConsultationAssistPanel.tsx",
  "components/clinical/AiInsightsPanel.tsx",
  "components/clinical/ConsultationActionBar.tsx",
  "app/panel/consultas/page.tsx",
] as const;

export function runProductionConsolidationAuditSummary() {
  return {
    iaComponents: IA_UNIFICATION_AUDIT.length,
    iaEntryPointsBefore: IA_UNIFICATION_PROPOSAL.expectedImpact.entryPointsBefore,
    deduplicationDomains: CLINICAL_DEDUPLICATION_MAP.length,
    highSeverityDupes: CLINICAL_DEDUPLICATION_MAP.filter(
      (d) => d.duplicationSeverity === "alta",
    ).length,
    closeFlowSteps: CONSULTATION_CLOSE_FLOW_AUDIT.length,
    e2eCasesP0: E2E_MINIMUM_SPEC.filter((c) => c.priority === "P0").length,
    legacyItems: LEGACY_INVENTORY.length,
    consolidationPhases: CONSOLIDATION_ROADMAP.length,
  };
}
