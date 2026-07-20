/**
 * EPIC-3 UC-03A — Live Clinical Context Timeline (deterministic).
 *
 * Merges:
 * 1) Encounter milestones from Consultation + Clinical Foundation
 * 2) Medical Copilot Session timeline entries (existing CP-21 API)
 *
 * Chronological, read-only. No LLM, no EMR writes, no clinical suggestions.
 */

import type { MedicalCopilotTimelineEntry } from "@/lib/medical-copilot/types";
import { formatEventLabel } from "@/lib/medical-copilot/view-model";
import type { NestConsultation } from "@/lib/services/consultations";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export type LiveTimelineSource =
  | "consultation"
  | "clinical_foundation"
  | "medical_copilot_timeline";

export type LiveTimelineCategory =
  | "encounter"
  | "status"
  | "telemedicine"
  | "vitals"
  | "notes"
  | "documents"
  | "orders"
  | "session"
  | "other";

export type LiveClinicalTimelineEvent = {
  id: string;
  timestamp: string;
  category: LiveTimelineCategory;
  eventType: string;
  label: string;
  summary: string;
  source: LiveTimelineSource;
};

export type LiveClinicalContextTimelineView = {
  title: "Clinical Context Timeline";
  phase: "live";
  events: LiveClinicalTimelineEvent[];
  sessionId: string | null;
  timelineId: string | null;
  readOnly: true;
  generative: false;
  persistsToEmr: false;
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function hasVitalPayload(
  vitalSigns: Record<string, unknown> | null | undefined,
): boolean {
  if (!vitalSigns || typeof vitalSigns !== "object") return false;
  return Object.keys(vitalSigns).some((key) => {
    const v = vitalSigns[key];
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "number") return Number.isFinite(v);
    return true;
  });
}

function pushEvent(
  events: LiveClinicalTimelineEvent[],
  event: LiveClinicalTimelineEvent,
): void {
  events.push(event);
}

/**
 * Pure encounter milestones from Consultation + Foundation (no inference).
 */
export function buildEncounterTimelineEvents(input: {
  consultation: NestConsultation | null;
  foundation: ClinicalFoundationBundle | null;
}): LiveClinicalTimelineEvent[] {
  const events: LiveClinicalTimelineEvent[] = [];
  const consultation = input.consultation;
  const foundation = input.foundation;
  const createdAt =
    foundation?.consultation.createdAt ?? consultation?.createdAt ?? null;
  const updatedAt =
    foundation?.consultation.updatedAt ?? consultation?.updatedAt ?? null;
  const consultationId =
    foundation?.consultation.id ?? consultation?.id ?? "unknown";

  if (createdAt) {
    pushEvent(events, {
      id: `encounter:${consultationId}:opened`,
      timestamp: createdAt,
      category: "encounter",
      eventType: "encounter_opened",
      label: "Apertura del encounter",
      summary: "Consulta creada / encounter abierto",
      source: foundation ? "clinical_foundation" : "consultation",
    });
  }

  if (hasText(consultation?.consentGivenAt)) {
    pushEvent(events, {
      id: `encounter:${consultationId}:consent`,
      timestamp: consultation!.consentGivenAt!,
      category: "encounter",
      eventType: "consent_recorded",
      label: "Consentimiento registrado",
      summary: `Versión: ${consultation?.consentVersion ?? "n/d"}`,
      source: "consultation",
    });
  }

  const status =
    foundation?.consultation.status ?? consultation?.status ?? null;
  if (status && (updatedAt || createdAt)) {
    pushEvent(events, {
      id: `encounter:${consultationId}:status:${status}`,
      timestamp: updatedAt ?? createdAt!,
      category: "status",
      eventType: "status_observed",
      label: "Estado del encounter",
      summary: `Estado actual: ${status}`,
      source: foundation ? "clinical_foundation" : "consultation",
    });
  }

  if (hasText(consultation?.publicToken)) {
    pushEvent(events, {
      id: `encounter:${consultationId}:telemed_invite`,
      timestamp: updatedAt ?? createdAt ?? new Date(0).toISOString(),
      category: "telemedicine",
      eventType: "telemedicine_invite_ready",
      label: "Teleconsulta",
      summary: "Invitación / token público de teleconsulta presente",
      source: "consultation",
    });
  }

  const vitals = foundation?.encounter.vitalSigns;
  if (hasVitalPayload(vitals)) {
    pushEvent(events, {
      id: `encounter:${consultationId}:vitals`,
      timestamp:
        foundation?.meta.generatedAt ?? updatedAt ?? createdAt ?? new Date(0).toISOString(),
      category: "vitals",
      eventType: "vitals_present",
      label: "Signos vitales",
      summary: "Signos vitales presentes en el encounter",
      source: "clinical_foundation",
    });
  }

  const notes =
    foundation?.consultation.notes ?? consultation?.notes ?? null;
  if (hasText(notes)) {
    pushEvent(events, {
      id: `encounter:${consultationId}:notes`,
      timestamp: updatedAt ?? createdAt ?? new Date(0).toISOString(),
      category: "notes",
      eventType: "notes_present",
      label: "Notas clínicas",
      summary: "Notas clínicas presentes en la consulta",
      source: foundation ? "clinical_foundation" : "consultation",
    });
  }

  const signedAt =
    foundation?.consultation.signedAt ?? consultation?.signedAt ?? null;
  if (hasText(signedAt)) {
    pushEvent(events, {
      id: `encounter:${consultationId}:signed`,
      timestamp: signedAt!,
      category: "status",
      eventType: "consultation_signed",
      label: "Consulta firmada",
      summary: "Hito de firma registrado",
      source: foundation ? "clinical_foundation" : "consultation",
    });
  }

  if (foundation) {
    for (const rx of foundation.orders.prescriptions ?? []) {
      pushEvent(events, {
        id: `order:rx:${rx.id}`,
        timestamp: rx.createdAt,
        category: "orders",
        eventType: "prescription_order_present",
        label: "Orden / receta",
        summary: `Prescripción ${rx.status}${rx.validationCode ? ` · ${rx.validationCode}` : ""}`,
        source: "clinical_foundation",
      });
    }
    for (const lab of foundation.orders.labs ?? []) {
      pushEvent(events, {
        id: `order:lab:${lab.id}`,
        timestamp: lab.createdAt,
        category: "orders",
        eventType: "lab_order_present",
        label: "Examen / laboratorio",
        summary: `Orden lab ${lab.status}${lab.templateName ? ` · ${lab.templateName}` : ""}`,
        source: "clinical_foundation",
      });
    }
    for (const ref of foundation.orders.referrals ?? []) {
      pushEvent(events, {
        id: `order:ref:${ref.id}`,
        timestamp: ref.createdAt,
        category: "documents",
        eventType: "referral_present",
        label: "Documento / interconsulta",
        summary: `Interconsulta ${ref.specialty} · ${ref.status}`,
        source: "clinical_foundation",
      });
    }
  }

  return events;
}

export function mapSessionTimelineEntries(
  entries: MedicalCopilotTimelineEntry[] | null | undefined,
): LiveClinicalTimelineEvent[] {
  if (!entries?.length) return [];
  return entries.map((entry) => ({
    id: `session-tl:${entry.timelineEntryId}`,
    timestamp: entry.timestamp,
    category: "session" as const,
    eventType: entry.eventType,
    label: formatEventLabel(entry.eventType),
    summary: entry.summary,
    source: "medical_copilot_timeline" as const,
  }));
}

export function mergeLiveClinicalContextTimeline(input: {
  consultation: NestConsultation | null;
  foundation: ClinicalFoundationBundle | null;
  sessionTimelineEntries?: MedicalCopilotTimelineEntry[] | null;
  sessionId?: string | null;
  timelineId?: string | null;
}): LiveClinicalContextTimelineView {
  const events = [
    ...buildEncounterTimelineEvents({
      consultation: input.consultation,
      foundation: input.foundation,
    }),
    ...mapSessionTimelineEntries(input.sessionTimelineEntries),
  ].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return {
    title: "Clinical Context Timeline",
    phase: "live",
    events,
    sessionId: input.sessionId ?? null,
    timelineId: input.timelineId ?? null,
    readOnly: true,
    generative: false,
    persistsToEmr: false,
  };
}
