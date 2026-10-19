import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";

export type TimelineEventKind =
  | "diagnosis"
  | "consultation"
  | "medication"
  | "lab";

export type ClinicalTimelineEvent = {
  id: string;
  kind: TimelineEventKind;
  year: number;
  sortAt: number;
  title: string;
  subtitle?: string;
  code?: string | null;
};

export type ClinicalTimelineGroup = {
  year: number;
  events: ClinicalTimelineEvent[];
};

export type ClinicalTimelineModel = {
  groups: ClinicalTimelineGroup[];
  undated: ClinicalTimelineEvent[];
  alertCount: number;
  isEmpty: boolean;
};

function parseTimestamp(value?: string | null): number | null {
  if (!value?.trim()) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

function yearFromTimestamp(ts: number | null, fallbackYear: number): number {
  if (ts === null) return fallbackYear;
  return new Date(ts).getFullYear();
}

function diagnosisKey(code: string | null, label: string): string {
  return `${code ?? ""}::${label}`.toLowerCase();
}

export function buildClinicalTimeline(
  data: PatientClinicalMemory,
  options?: { currentConsultationId?: string; now?: Date },
): ClinicalTimelineModel {
  const now = options?.now ?? new Date();
  const currentYear = now.getFullYear();
  const events: ClinicalTimelineEvent[] = [];
  const undated: ClinicalTimelineEvent[] = [];
  const seenDiagnoses = new Set<string>();

  const pushDiagnosis = (
    item: { code: string | null; label: string; lastSeenAt?: string },
    source: string,
  ) => {
    const key = diagnosisKey(item.code, item.label);
    if (seenDiagnoses.has(key)) return;
    seenDiagnoses.add(key);

    const sortAt = parseTimestamp(item.lastSeenAt);
    const event: ClinicalTimelineEvent = {
      id: `dx-${key}-${source}`,
      kind: "diagnosis",
      year: yearFromTimestamp(sortAt, currentYear),
      sortAt: sortAt ?? 0,
      title: item.label,
      code: item.code,
      subtitle: item.code ? undefined : "Diagnóstico",
    };

    if (sortAt === null) {
      undated.push(event);
    } else {
      events.push(event);
    }
  };

  for (const item of data.activeConditions) {
    pushDiagnosis(item, "active");
  }
  for (const item of data.recentDiagnoses) {
    pushDiagnosis(item, "recent");
  }

  for (const c of data.recentConsultations) {
    if (
      options?.currentConsultationId &&
      c.id === options.currentConsultationId
    ) {
      continue;
    }
    const sortAt = parseTimestamp(c.createdAt) ?? 0;
    const title =
      c.diagnosisLabel?.trim() ||
      (c.diagnosisCode ? `Consulta ${c.diagnosisCode}` : "Consulta previa");
    events.push({
      id: `consult-${c.id}`,
      kind: "consultation",
      year: yearFromTimestamp(sortAt, currentYear),
      sortAt,
      title,
      code: c.diagnosisCode,
      subtitle: new Date(c.createdAt).toLocaleDateString("es-CL"),
    });
  }

  for (const med of data.currentMedications) {
    const sortAt = parseTimestamp(med.since);
    const dosage = [med.dosage, med.frequency].filter(Boolean).join(" · ");
    const event: ClinicalTimelineEvent = {
      id: `med-${med.prescriptionId}-${med.drugPresentationId ?? med.name}`,
      kind: "medication",
      year: yearFromTimestamp(sortAt, currentYear),
      sortAt: sortAt ?? 0,
      title: med.name,
      subtitle: dosage || "Medicación actual",
    };
    if (sortAt === null) {
      undated.push(event);
    } else {
      events.push(event);
    }
  }

  for (const lab of data.pendingLabs) {
    const sortAt = parseTimestamp(lab.orderedAt) ?? 0;
    events.push({
      id: `lab-${lab.labOrderId}-${lab.exam}`,
      kind: "lab",
      year: yearFromTimestamp(sortAt, currentYear),
      sortAt,
      title: lab.exam,
      subtitle: `Pendiente · ${lab.status}`,
    });
  }

  const byYear = new Map<number, ClinicalTimelineEvent[]>();
  for (const event of events) {
    const bucket = byYear.get(event.year) ?? [];
    bucket.push(event);
    byYear.set(event.year, bucket);
  }

  const groups: ClinicalTimelineGroup[] = Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, yearEvents]) => ({
      year,
      events: yearEvents.sort((a, b) => a.sortAt - b.sortAt),
    }));

  const isEmpty =
    groups.length === 0 &&
    undated.length === 0 &&
    data.alerts.length === 0;

  return {
    groups,
    undated,
    alertCount: data.alerts.length,
    isEmpty,
  };
}
