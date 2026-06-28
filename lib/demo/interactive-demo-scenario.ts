export type DemoStepKey =
  | 'welcome'
  | 'consultation-start'
  | 'clinical-workspace'
  | 'clinical-copilot'
  | 'evidence-panel'
  | 'closing';

export type DemoStep = {
  key: DemoStepKey;
  title: string;
  eyebrow: string;
  description: string;
  outcome: string;
};

export type DemoSignal = {
  label: string;
  value: string;
  tone: 'emerald' | 'indigo' | 'amber' | 'slate';
};

export type DemoEvidenceStatus = 'active' | 'ready' | 'protected';

export type DemoEvidenceCapability = {
  name: string;
  status: DemoEvidenceStatus;
  summary: string;
  evidence: string;
};

export type DemoDataOrigin = {
  label: string;
  value: string;
  description: string;
};

export type DemoScenarioMode = 'mock' | 'live';

export type DemoScenario = {
  mode: DemoScenarioMode;
  title: string;
  subtitle: string;
  patient: {
    initials: string;
    age: number;
    context: string;
    chiefComplaint: string;
  };
  consultation: {
    reason: string;
    status: string;
    timeline: string[];
  };
  workspace: {
    memory: {
      activeConditions: string[];
      currentMedications: string[];
      pendingLabs: string[];
      alerts: string[];
    };
    intelligence: {
      insights: string[];
      recommendations: string[];
      careGaps: string[];
    };
    orders: {
      prescriptions: string[];
      labs: string[];
      referrals: string[];
    };
    clinicalNote: {
      chiefComplaint: string;
      hpi: string;
      assessment: string;
      plan: string;
    };
    copilot: {
      symptoms_detected: string[];
      suggested_diagnoses: Array<{
        code: string;
        description: string;
        confidence: number;
        explanation: string;
      }>;
      suggested_questions: string[];
      suggested_tests: string[];
      suggested_treatments: Array<{
        name: string;
        confidence: number;
        explanation: string;
      }>;
    };
  };
  evidence: {
    dataOrigin: DemoDataOrigin[];
    capabilities: DemoEvidenceCapability[];
  };
  steps: DemoStep[];
  signals: DemoSignal[];
};

export const interactiveDemoScenario: DemoScenario = {
  mode: 'mock',
  title: 'Interactive Demo: Backend Enterprise v1',
  subtitle:
    'Historia clínica guiada para demostrar Foundation, CKG, Copilot y observabilidad sin tocar datos reales.',
  patient: {
    initials: 'MR',
    age: 54,
    context: 'Paciente crónico con seguimiento cardiometabólico y órdenes activas.',
    chiefComplaint: 'Control por cefalea, presión arterial elevada y revisión de tratamiento.',
  },
  consultation: {
    reason: 'Consulta ambulatoria de seguimiento',
    status: 'Read-only demo',
    timeline: [
      'Antecedentes y alertas clínicas disponibles desde Clinical Foundation.',
      'Órdenes actuales preparadas para lectura desde CKG con fallback canonical.',
      'Copilot clínico consume contexto estructurado, contratos y guardrails.',
    ],
  },
  workspace: {
    memory: {
      activeConditions: [
        'Hipertensión arterial en seguimiento',
        'Dislipidemia con tratamiento activo',
        'Cefaleas episódicas asociadas a estrés laboral',
      ],
      currentMedications: [
        'Losartán 50 mg cada 24 horas',
        'Atorvastatina 20 mg nocturna',
      ],
      pendingLabs: [
        'Perfil lipídico de control',
        'Función renal y electrolitos',
      ],
      alerts: [
        'Verificar adherencia antes de ajustar antihipertensivo',
        'Confirmar cifras domiciliarias de presión arterial',
      ],
    },
    intelligence: {
      insights: [
        'Patrón de controles irregulares en los últimos 6 meses',
        'Riesgo cardiometabólico moderado por comorbilidades activas',
      ],
      recommendations: [
        'Solicitar registro domiciliario de presión por 7 días',
        'Revisar efectos adversos y adherencia a tratamiento actual',
        'Programar seguimiento con resultados de laboratorio',
      ],
      careGaps: [
        'Laboratorio anual pendiente',
        'Educación de signos de alarma no documentada en último control',
      ],
    },
    orders: {
      prescriptions: [
        'Losartán 50 mg - mantener hasta revisión de registros',
        'Atorvastatina 20 mg - continuar nocturna',
      ],
      labs: [
        'Perfil lipídico',
        'Creatinina, BUN, sodio y potasio',
        'Hemoglobina glicosilada',
      ],
      referrals: [
        'Nutrición clínica si persiste mal control metabólico',
      ],
    },
    clinicalNote: {
      chiefComplaint:
        'Paciente consulta por cefalea intermitente y presión arterial elevada en controles domiciliarios.',
      hpi:
        'Refiere episodios de cefalea vespertina sin focalidad neurológica. Niega dolor torácico, disnea o síncope. Trae registros parciales de presión arterial.',
      assessment:
        'Hipertensión en seguimiento con posible control subóptimo. Cefalea sin signos de alarma reportados en este escenario demo.',
      plan:
        'Completar registro domiciliario, solicitar laboratorio de control, reforzar adherencia y agendar seguimiento clínico.',
    },
    copilot: {
      symptoms_detected: [
        'Cefalea intermitente',
        'Presión arterial elevada',
        'Seguimiento cardiometabólico',
      ],
      suggested_diagnoses: [
        {
          code: 'I10',
          description: 'Hipertensión esencial con control subóptimo',
          confidence: 0.82,
          explanation: 'Compatible con registros elevados y antecedente activo.',
        },
        {
          code: 'R51',
          description: 'Cefalea no especificada, sin signos de alarma en relato',
          confidence: 0.64,
          explanation: 'Requiere evaluación clínica completa y examen físico.',
        },
      ],
      suggested_questions: [
        '¿Cuál es el rango de presión arterial domiciliaria de la última semana?',
        '¿Ha omitido dosis del antihipertensivo?',
        '¿La cefalea se asocia a síntomas neurológicos, vómitos o fiebre?',
      ],
      suggested_tests: [
        'Perfil lipídico',
        'Función renal y electrolitos',
        'Hemoglobina glicosilada',
      ],
      suggested_treatments: [
        {
          name: 'Mantener tratamiento actual hasta completar registros',
          confidence: 0.74,
          explanation: 'Evita ajustes sin evidencia suficiente en escenario demo.',
        },
      ],
    },
  },
  evidence: {
    dataOrigin: [
      {
        label: 'Mock Mode',
        value: 'Deterministic scenario',
        description: 'La demo usa datos controlados, no registros productivos.',
      },
      {
        label: 'Read-only',
        value: 'No mutable actions',
        description: 'No crea órdenes, recetas, notas ni eventos clínicos reales.',
      },
      {
        label: 'Backend Enterprise v1',
        value: 'Production Ready',
        description: 'El panel explica capacidades desplegadas sin invocar backend live.',
      },
    ],
    capabilities: [
      {
        name: 'Clinical Foundation',
        status: 'active',
        summary: 'Bundle clínico consolidado para snapshot de paciente y consulta.',
        evidence: 'El workspace agrupa condiciones, alertas, órdenes y timeline clínico.',
      },
      {
        name: 'Clinical Knowledge Graph',
        status: 'active',
        summary: 'Modelo de relaciones clínicas para Foundation, órdenes y contexto IA.',
        evidence: 'Las órdenes y referencias se presentan como lectura trazable del grafo.',
      },
      {
        name: 'Orders → CKG Primary',
        status: 'ready',
        summary: 'Runtime preparado para servir órdenes desde CKG con fallback canonical.',
        evidence: 'Prescripciones, laboratorios y derivaciones se muestran como dominios separados.',
      },
      {
        name: 'AI Governance',
        status: 'protected',
        summary: 'Ejecuciones IA pasan por políticas, auditoría y metadatos controlados.',
        evidence: 'Copilot aparece como flujo gobernado, no como prompt aislado.',
      },
      {
        name: 'Output Contracts',
        status: 'protected',
        summary: 'Respuestas IA esperadas con estructura por workflow y degradación controlada.',
        evidence: 'Diagnósticos, preguntas, tests y tratamientos se separan por contrato visual.',
      },
      {
        name: 'Clinical Guardrails',
        status: 'protected',
        summary: 'Validaciones clínicas internas antes de aceptar o degradar salidas IA.',
        evidence: 'Las sugerencias incluyen cautela clínica y no reemplazan juicio médico.',
      },
      {
        name: 'Output Evaluation',
        status: 'ready',
        summary: 'Capa interna para evaluar calidad, completitud y seguridad de respuestas.',
        evidence: 'El panel evidencia readiness sin ejecutar evaluaciones live en demo.',
      },
      {
        name: 'PHI-safe Logging',
        status: 'protected',
        summary: 'Observabilidad sin IDs sensibles, textos clínicos crudos ni errores verbosos.',
        evidence: 'La demo no emite datos reales ni requiere llamadas instrumentadas.',
      },
      {
        name: 'Observability',
        status: 'ready',
        summary: 'Health, readiness, smoke y métricas productivas preparadas para operación.',
        evidence: 'La historia declara estado productivo y separa demo mock de backend live.',
      },
      {
        name: 'Production Ready',
        status: 'ready',
        summary: 'Backend Enterprise v1 desplegado y congelado para esta subfase frontend.',
        evidence: 'Las señales superiores muestran Backend Enterprise v1 y Production Ready.',
      },
    ],
  },
  steps: [
    {
      key: 'welcome',
      title: 'Bienvenida',
      eyebrow: '1 / 6',
      description:
        'La demo abre con un caso clínico controlado y explica que todo corre en Demo Mode, sin datos productivos ni acciones mutables.',
      outcome: 'La audiencia entiende alcance, seguridad y narrativa antes de entrar al caso.',
    },
    {
      key: 'consultation-start',
      title: 'Inicio de consulta',
      eyebrow: '2 / 6',
      description:
        'Se presenta el motivo de consulta, contexto del paciente y señales iniciales para simular la apertura de una atención real.',
      outcome: 'El médico identifica rápidamente el problema clínico y el estado de la atención.',
    },
    {
      key: 'clinical-workspace',
      title: 'Workspace clínico',
      eyebrow: '3 / 6',
      description:
        'El workspace resume memoria, inteligencia clínica, órdenes, alertas y timeline sin depender de backend live.',
      outcome: 'La demo comunica consolidación clínica sin riesgo de mutar registros.',
    },
    {
      key: 'clinical-copilot',
      title: 'Clinical Copilot',
      eyebrow: '4 / 6',
      description:
        'Se muestra cómo el futuro panel Copilot usaría contexto estructurado, prompt builder, adapter, governance y evaluación.',
      outcome: 'La audiencia ve una IA clínica gobernada, no un prompt aislado.',
    },
    {
      key: 'evidence-panel',
      title: 'Evidence Panel',
      eyebrow: '5 / 6',
      description:
        'El panel de evidencia conecta cada bloque visual con Backend Enterprise v1: Foundation, CKG, fallback y observabilidad.',
      outcome: 'Stakeholders técnicos pueden auditar qué capacidad backend respalda cada parte.',
    },
    {
      key: 'closing',
      title: 'Cierre',
      eyebrow: '6 / 6',
      description:
        'La demo finaliza con estado Production Ready, alcance read-only y próximos pasos para live mode controlado.',
      outcome: 'Queda claro qué está listo, qué se está simulando y qué checkpoint continúa.',
    },
  ],
  signals: [
    { label: 'Demo Mode', value: 'Mock determinista', tone: 'indigo' },
    { label: 'Backend Enterprise v1', value: 'Production Ready', tone: 'emerald' },
    { label: 'Mutabilidad', value: 'Read-only', tone: 'slate' },
    { label: 'Backend live', value: 'No requerido', tone: 'amber' },
  ],
};
