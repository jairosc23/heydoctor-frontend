/**
 * EPIC-3 UC-01 — Pre-visit context view-model (read-only).
 * Agenda → Clinical Foundation → Daily Hub.
 * No generative AI, no EMR writes, no drafts.
 */

import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export type PreVisitAgendaSlice = {
  appointmentId: string | null;
  reason: string | null;
  startsAt: string | null;
  status: string | null;
};

export type PreVisitPatientSlice = {
  id: string;
  displayName: string;
  documentLabel: string | null;
  birthDate: string | null;
  sex: string | null;
  email: string | null;
};

export type PreVisitEncounterSlice = {
  consultationId: string;
  status: string;
  statusLabel: string;
  isSigned: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PreVisitBundleHealthSlice = {
  memoryLoaded: boolean;
  intelligenceLoaded: boolean;
  prescriptionsLoaded: boolean;
  labsLoaded: boolean;
  referralsLoaded: boolean;
};

export type PreVisitContextView = {
  phase: "prep";
  motivo: string;
  motivoSource: "agenda" | "foundation_reason" | "foundation_chief_complaint" | "unavailable";
  patient: PreVisitPatientSlice | null;
  encounter: PreVisitEncounterSlice | null;
  agenda: PreVisitAgendaSlice;
  bundleHealth: PreVisitBundleHealthSlice | null;
  foundationReady: boolean;
  foundationError: string | null;
  sessionId: string | null;
  sessionStatus: "idle" | "loading" | "ready" | "unavailable";
  readOnly: true;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  in_progress: "En curso",
  completed: "Completada",
  signed: "Firmada",
  locked: "Bloqueada",
};

export function labelConsultationStatus(status: string | null | undefined): string {
  if (!status) return "Desconocido";
  const key = status.trim().toLowerCase();
  return STATUS_LABELS[key] ?? status;
}

function formatDocument(
  documentType: string | null | undefined,
  documentNumber: string | null | undefined,
): string | null {
  const type = documentType?.trim();
  const number = documentNumber?.trim();
  if (type && number) return `${type} ${number}`;
  return number || type || null;
}

export function buildPreVisitContextView(input: {
  foundation: ClinicalFoundationBundle | null;
  foundationError?: string | null;
  agenda?: PreVisitAgendaSlice | null;
  sessionId?: string | null;
  sessionStatus?: PreVisitContextView["sessionStatus"];
}): PreVisitContextView {
  const foundation = input.foundation;
  const agenda: PreVisitAgendaSlice = input.agenda ?? {
    appointmentId: null,
    reason: null,
    startsAt: null,
    status: null,
  };

  let motivo = "Sin motivo registrado";
  let motivoSource: PreVisitContextView["motivoSource"] = "unavailable";

  const agendaReason = agenda.reason?.trim() || null;
  const foundationReason = foundation?.consultation.reason?.trim() || null;
  const chiefComplaint = foundation?.encounter.chiefComplaint?.trim() || null;

  if (agendaReason) {
    motivo = agendaReason;
    motivoSource = "agenda";
  } else if (foundationReason) {
    motivo = foundationReason;
    motivoSource = "foundation_reason";
  } else if (chiefComplaint) {
    motivo = chiefComplaint;
    motivoSource = "foundation_chief_complaint";
  }

  const patient: PreVisitPatientSlice | null = foundation
    ? {
        id: foundation.patient.id,
        displayName: foundation.patient.displayName || "Paciente",
        documentLabel: formatDocument(
          foundation.patient.documentType,
          foundation.patient.documentNumber,
        ),
        birthDate: foundation.patient.birthDate,
        sex: foundation.patient.sex,
        email: foundation.patient.email,
      }
    : null;

  const encounter: PreVisitEncounterSlice | null = foundation
    ? {
        consultationId: foundation.consultation.id,
        status: foundation.consultation.status,
        statusLabel: labelConsultationStatus(foundation.consultation.status),
        isSigned: foundation.consultation.isSigned,
        createdAt: foundation.consultation.createdAt,
        updatedAt: foundation.consultation.updatedAt,
      }
    : null;

  const bundleHealth: PreVisitBundleHealthSlice | null = foundation
    ? {
        memoryLoaded: foundation.bundleHealth.memoryLoaded,
        intelligenceLoaded: foundation.bundleHealth.intelligenceLoaded,
        prescriptionsLoaded: foundation.bundleHealth.prescriptionsLoaded,
        labsLoaded: foundation.bundleHealth.labsLoaded,
        referralsLoaded: foundation.bundleHealth.referralsLoaded,
      }
    : null;

  return {
    phase: "prep",
    motivo,
    motivoSource,
    patient,
    encounter,
    agenda,
    bundleHealth,
    foundationReady: foundation != null,
    foundationError: input.foundationError ?? null,
    sessionId: input.sessionId ?? null,
    sessionStatus: input.sessionStatus ?? "idle",
    readOnly: true,
  };
}
