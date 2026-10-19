import type {
  UnifiedClinicalPlan,
  UnifiedClinicalPlanItem,
} from "./types/unified-clinical-plan";

export interface FallbackPlanInput {
  code: string;
  description?: string | null;
}

function item(
  category: UnifiedClinicalPlanItem["category"],
  id: string,
  label: string,
  reason: string,
): UnifiedClinicalPlanItem {
  return {
    id,
    label,
    category,
    reason,
    source: "fallback_plan",
    enabled: true,
  };
}

type FallbackTemplate = {
  education: Array<{ id: string; label: string; reason: string }>;
  labs: Array<{ id: string; label: string; reason: string }>;
  followUp: Array<{ id: string; label: string; reason: string }>;
};

const FALLBACK_TEMPLATES: Array<{
  match: (code: string) => boolean;
  template: FallbackTemplate;
}> = [
  {
    match: (code) => /^I1[0-5]/i.test(code),
    template: {
      education: [
        {
          id: "hta-edu-diet",
          label: "Dieta baja en sodio y estilo de vida cardiosaludable",
          reason: "Medida de primera línea en hipertensión arterial.",
        },
        {
          id: "hta-edu-adherence",
          label: "Adherencia terapéutica y automonitorización de PA",
          reason: "Reduce riesgo cardiovascular y complicaciones.",
        },
      ],
      labs: [
        {
          id: "hta-lab-creat",
          label: "Creatinina y electrolitos",
          reason: "Evaluar función renal basal antes y durante tratamiento.",
        },
        {
          id: "hta-lab-lipids",
          label: "Perfil lipídico",
          reason: "Evaluar riesgo cardiovascular asociado.",
        },
      ],
      followUp: [
        {
          id: "hta-fu-control",
          label: "Control de presión arterial en 4–8 semanas",
          reason: "Verificar respuesta y ajustar manejo según metas.",
        },
      ],
    },
  },
  {
    match: (code) => /^E11/i.test(code),
    template: {
      education: [
        {
          id: "dm-edu-diet",
          label: "Educación en alimentación y actividad física",
          reason: "Pilar central del control glucémico en DM2.",
        },
        {
          id: "dm-edu-hypo",
          label: "Reconocimiento y manejo de hipoglucemia",
          reason: "Prevención de eventos agudos en tratamiento.",
        },
      ],
      labs: [
        {
          id: "dm-lab-hba1c",
          label: "HbA1c",
          reason: "Control metabólico a mediano plazo.",
        },
        {
          id: "dm-lab-fpg",
          label: "Glucosa en ayunas",
          reason: "Seguimiento glucémico basal.",
        },
        {
          id: "dm-lab-creat",
          label: "Creatinina / filtrado glomerular",
          reason: "Tamizaje de nefropatía diabética.",
        },
      ],
      followUp: [
        {
          id: "dm-fu-control",
          label: "Control diabetológico en 3 meses",
          reason: "Reevaluar metas glucémicas y plan terapéutico.",
        },
      ],
    },
  },
  {
    match: (code) => /^J44/i.test(code),
    template: {
      education: [
        {
          id: "copd-edu-smoking",
          label: "Cesación tabáquica y evitar irritantes respiratorios",
          reason: "Intervención con mayor impacto en progresión de EPOC.",
        },
        {
          id: "copd-edu-inhaler",
          label: "Técnica inhalatoria y uso de broncodilatadores",
          reason: "Optimiza control sintomático y reduce exacerbaciones.",
        },
      ],
      labs: [
        {
          id: "copd-lab-spo2",
          label: "Oximetría / evaluación funcional respiratoria",
          reason: "Valorar gravedad y necesidad de oxigenoterapia.",
        },
      ],
      followUp: [
        {
          id: "copd-fu-control",
          label: "Control respiratorio en 4–12 semanas",
          reason: "Ajustar tratamiento según síntomas y exacerbaciones.",
        },
      ],
    },
  },
  {
    match: (code) => /^J45/i.test(code),
    template: {
      education: [
        {
          id: "asthma-edu-triggers",
          label: "Identificación de desencadenantes y plan de acción",
          reason: "Reduce exacerbaciones y uso de rescate.",
        },
        {
          id: "asthma-edu-inhaler",
          label: "Técnica inhalatoria y adherencia",
          reason: "Mejora control del asma.",
        },
      ],
      labs: [],
      followUp: [
        {
          id: "asthma-fu-control",
          label: "Control de asma en 4–8 semanas",
          reason: "Reevaluar control y escalonamiento terapéutico.",
        },
      ],
    },
  },
  {
    match: (code) => /^E66/i.test(code),
    template: {
      education: [
        {
          id: "ob-edu-lifestyle",
          label: "Modificaciones de estilo de vida y alimentación",
          reason: "Base del manejo de obesidad y comorbilidades.",
        },
      ],
      labs: [
        {
          id: "ob-lab-metabolic",
          label: "Perfil metabólico (glucosa, lípidos, TSH)",
          reason: "Tamizaje de comorbilidades metabólicas.",
        },
      ],
      followUp: [
        {
          id: "ob-fu-control",
          label: "Seguimiento ponderal en 8–12 semanas",
          reason: "Monitorear progreso y adherencia.",
        },
      ],
    },
  },
  {
    match: (code) => /^R51/i.test(code),
    template: {
      education: [
        {
          id: "ha-edu-redflags",
          label: "Signos de alarma (cefalea thunderclap, fiebre, focalidad)",
          reason: "Derivación oportuna ante cefalea secundaria.",
        },
      ],
      labs: [],
      followUp: [
        {
          id: "ha-fu-control",
          label: "Reevaluación si persiste o empeora",
          reason: "Ajustar estudio y manejo según evolución.",
        },
      ],
    },
  },
  {
    match: (code) => /^M54\.5/i.test(code),
    template: {
      education: [
        {
          id: "lbp-edu-activity",
          label: "Actividad gradual y ergonomía postural",
          reason: "Favorece recuperación funcional en lumbalgia.",
        },
        {
          id: "lbp-edu-redflags",
          label: "Signos de alarma neurológicos o sistémicos",
          reason: "Identificar cuadros que requieren estudio urgente.",
        },
      ],
      labs: [],
      followUp: [
        {
          id: "lbp-fu-control",
          label: "Control en 2–4 semanas si no mejora",
          reason: "Reevaluar manejo conservador vs. estudio adicional.",
        },
      ],
    },
  },
  {
    match: (code) => /^K21\.9/i.test(code),
    template: {
      education: [
        {
          id: "gerd-edu-diet",
          label: "Medidas dietéticas y posturales anti-reflujo",
          reason: "Complemento al tratamiento farmacológico.",
        },
      ],
      labs: [],
      followUp: [
        {
          id: "gerd-fu-control",
          label: "Control de síntomas en 4–8 semanas",
          reason: "Evaluar respuesta y necesidad de endoscopia.",
        },
      ],
    },
  },
];

const GENERIC_TEMPLATE: FallbackTemplate = {
  education: [
    {
      id: "generic-edu",
      label: "Educación al paciente sobre el diagnóstico y plan de cuidados",
      reason: "Refuerzo de adherencia y autocuidado.",
    },
  ],
  labs: [],
  followUp: [
    {
      id: "generic-fu",
      label: "Seguimiento clínico según evolución",
      reason: "Reevaluar respuesta al plan terapéutico.",
    },
  ],
};

function resolveTemplate(code: string): FallbackTemplate {
  const normalized = code.trim().toUpperCase();
  for (const entry of FALLBACK_TEMPLATES) {
    if (entry.match(normalized)) return entry.template;
  }
  return GENERIC_TEMPLATE;
}

/** Phase 4.3.1 — plan mínimo cuando workflow/flow no devuelven acciones. Sin medicación automática. */
export function buildFallbackUnifiedPlan(
  input: FallbackPlanInput,
): UnifiedClinicalPlan | null {
  const code = input.code?.trim().toUpperCase();
  if (!code) return null;

  const description = input.description?.trim() || code;
  const template = resolveTemplate(code);

  const medications: UnifiedClinicalPlanItem[] = [];
  const labs = template.labs.map((l) => item("lab", l.id, l.label, l.reason));
  const education = template.education.map((e) =>
    item("education", e.id, e.label, e.reason),
  );
  const followUp = template.followUp.map((f) =>
    item("follow_up", f.id, f.label, f.reason),
  );

  if (labs.length + education.length + followUp.length === 0) {
    return null;
  }

  return {
    planId: null,
    title: `Plan básico — ${code}`,
    explanation: `Plan de apoyo clínico para ${description}. Revise y confirme cada acción; no incluye prescripción automática.`,
    source: "fallback_plan",
    sourceLabel: "Fallback Plan™",
    diagnosisCode: code,
    diagnosisLabel: description,
    medications,
    labs,
    education,
    followUp,
  };
}

export function isSupportedFallbackDiagnosisCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return false;
  return FALLBACK_TEMPLATES.some((entry) => entry.match(normalized));
}
