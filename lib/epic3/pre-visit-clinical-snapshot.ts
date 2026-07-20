/**
 * EPIC-3 UC-02C — Pre-Visit Clinical Snapshot (deterministic).
 *
 * Projects Clinical Foundation fields already loaded into a read-only view.
 * No LLM, no free-text generation, no interpretation, no EMR writes.
 */

import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export type SnapshotLine = {
  id: string;
  text: string;
};

export type SnapshotSectionId =
  | "problemas_activos"
  | "diagnosticos_recientes"
  | "medicacion_habitual"
  | "alergias"
  | "signos_vitales"
  | "examenes"
  | "consultas_recientes";

export type SnapshotSectionAvailability =
  | "has_data"
  | "empty"
  | "unavailable";

export type SnapshotSection = {
  id: SnapshotSectionId;
  title: string;
  availability: SnapshotSectionAvailability;
  lines: SnapshotLine[];
  /** Observable source path only. */
  source: string;
};

export type PreVisitClinicalSnapshotView = {
  title: "Pre-Visit Clinical Snapshot";
  patientLabel: string | null;
  sections: SnapshotSection[];
  foundationReady: boolean;
  evaluatedAt: string;
  readOnly: true;
  generative: false;
  persistsToEmr: false;
};

function scalarText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return null;
}

function vitalSignLines(
  vitalSigns: Record<string, unknown> | null | undefined,
): SnapshotLine[] {
  if (!vitalSigns || typeof vitalSigns !== "object") return [];
  return Object.keys(vitalSigns)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const text = scalarText(vitalSigns[key]);
      if (!text) return null;
      return { id: `vital-${key}`, text: `${key}: ${text}` };
    })
    .filter((line): line is SnapshotLine => line !== null);
}

/**
 * Pure projector. Does not invent, rank, or recommend.
 */
export function buildPreVisitClinicalSnapshot(
  foundation: ClinicalFoundationBundle | null,
  options?: { evaluatedAt?: string },
): PreVisitClinicalSnapshotView {
  const evaluatedAt = options?.evaluatedAt ?? new Date().toISOString();

  if (!foundation) {
    const unavailable = (
      id: SnapshotSectionId,
      title: string,
      source: string,
    ): SnapshotSection => ({
      id,
      title,
      availability: "unavailable",
      lines: [],
      source,
    });
    return {
      title: "Pre-Visit Clinical Snapshot",
      patientLabel: null,
      sections: [
        unavailable("problemas_activos", "Problemas activos", "memory.activeConditions"),
        unavailable(
          "diagnosticos_recientes",
          "Diagnósticos recientes",
          "memory.recentDiagnoses",
        ),
        unavailable(
          "medicacion_habitual",
          "Medicación habitual",
          "memory.currentMedications",
        ),
        unavailable("alergias", "Alergias", "clinical_foundation (no field)"),
        unavailable("signos_vitales", "Últimos signos vitales", "encounter.vitalSigns"),
        unavailable("examenes", "Exámenes relevantes", "orders.labs / memory.pendingLabs"),
        unavailable(
          "consultas_recientes",
          "Consultas recientes",
          "memory.recentConsultations",
        ),
      ],
      foundationReady: false,
      evaluatedAt,
      readOnly: true,
      generative: false,
      persistsToEmr: false,
    };
  }

  const memoryLoaded = foundation.bundleHealth.memoryLoaded;
  const memory = foundation.memory;

  const activeLines: SnapshotLine[] = (memory?.activeConditions ?? []).map(
    (c, i) => ({
      id: `active-${i}-${c.code ?? "x"}`,
      text: c.code ? `${c.code} — ${c.label}` : c.label,
    }),
  );

  const recentDxLines: SnapshotLine[] = (memory?.recentDiagnoses ?? []).map(
    (c, i) => ({
      id: `rdx-${i}-${c.code ?? "x"}`,
      text: c.code ? `${c.code} — ${c.label}` : c.label,
    }),
  );

  const memoryMeds = (memory?.currentMedications ?? []).map((m, i) => ({
    id: `med-mem-${i}`,
    text: [m.name, m.dosage, m.frequency].filter(Boolean).join(" · "),
  }));
  const orderMeds = (foundation.orders.prescriptions ?? []).flatMap((rx, ri) =>
    (rx.medications ?? []).map((m, mi) => ({
      id: `med-rx-${ri}-${mi}`,
      text: [m.name, m.dosage, m.frequency].filter(Boolean).join(" · "),
    })),
  );
  const medLines = [...memoryMeds, ...orderMeds];

  const vitalLines = vitalSignLines(foundation.encounter.vitalSigns);

  const pendingLabLines = (memory?.pendingLabs ?? []).map((lab, i) => ({
    id: `plab-${i}`,
    text: [lab.exam, lab.status].filter(Boolean).join(" · "),
  }));
  const orderLabLines = (foundation.orders.labs ?? []).flatMap((order, oi) =>
    (order.exams ?? []).map((exam, ei) => ({
      id: `olab-${oi}-${ei}`,
      text: [exam.exam, order.status, order.createdAt].filter(Boolean).join(" · "),
    })),
  );
  const examLines = [...pendingLabLines, ...orderLabLines];

  const consultLines = (memory?.recentConsultations ?? []).map((c, i) => ({
    id: `rc-${i}`,
    text: [
      c.createdAt,
      c.status,
      c.diagnosisCode || c.diagnosisLabel
        ? [c.diagnosisCode, c.diagnosisLabel].filter(Boolean).join(" — ")
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  function section(
    id: SnapshotSectionId,
    title: string,
    source: string,
    lines: SnapshotLine[],
    sourceAvailable: boolean,
  ): SnapshotSection {
    if (!sourceAvailable) {
      return { id, title, availability: "unavailable", lines: [], source };
    }
    if (lines.length === 0) {
      return { id, title, availability: "empty", lines: [], source };
    }
    return { id, title, availability: "has_data", lines, source };
  }

  return {
    title: "Pre-Visit Clinical Snapshot",
    patientLabel: foundation.patient.displayName || null,
    sections: [
      section(
        "problemas_activos",
        "Problemas activos",
        "memory.activeConditions",
        activeLines,
        memoryLoaded && memory != null,
      ),
      section(
        "diagnosticos_recientes",
        "Diagnósticos recientes",
        "memory.recentDiagnoses",
        recentDxLines,
        memoryLoaded && memory != null,
      ),
      section(
        "medicacion_habitual",
        "Medicación habitual",
        "memory.currentMedications / orders.prescriptions",
        medLines,
        memoryLoaded || foundation.bundleHealth.prescriptionsLoaded,
      ),
      // Allergies are not exposed on the Clinical Foundation patient/memory DTOs.
      {
        id: "alergias",
        title: "Alergias",
        availability: "unavailable",
        lines: [],
        source: "clinical_foundation (campo no expuesto)",
      },
      section(
        "signos_vitales",
        "Últimos signos vitales",
        "encounter.vitalSigns",
        vitalLines,
        true,
      ),
      section(
        "examenes",
        "Exámenes relevantes",
        "orders.labs / memory.pendingLabs",
        examLines,
        memoryLoaded || foundation.bundleHealth.labsLoaded,
      ),
      section(
        "consultas_recientes",
        "Consultas recientes",
        "memory.recentConsultations",
        consultLines,
        memoryLoaded && memory != null,
      ),
    ],
    foundationReady: true,
    evaluatedAt,
    readOnly: true,
    generative: false,
    persistsToEmr: false,
  };
}
