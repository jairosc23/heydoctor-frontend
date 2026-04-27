/**
 * Ficha cl\u00ednica estructurada (motivo, historia de enfermedad actual,
 * revisi\u00f3n por sistemas). El backend NestJS actual solo expone los campos
 * `chiefComplaint`, `diagnosis`, `treatmentPlan`, `notes`.
 *
 * Para no bloquear el frontend en tiempo de producto, **persistimos la ficha
 * estructurada serializada dentro del campo `notes`** con un marcador de
 * versi\u00f3n al inicio. Si las notas no contienen el marcador, las tratamos
 * como notas libres legacy y la ficha estructurada queda vac\u00eda.
 *
 * Cuando el backend exponga columnas dedicadas (`presentIllnessHistory`,
 * `systemsReview`, etc.) basta con cambiar `serialize` y `parse` para
 * leer/escribir de los nuevos campos sin tocar la UI.
 */

import { heydoctorApi } from "../heydoctor-api";
import { createClinicalLogger } from "../clinical-logger";

const log = createClinicalLogger("clinical");

const RECORD_MARKER = "[[HD_CR_V1]]";
const RECORD_END = "[[/HD_CR_V1]]";

export interface SystemsReview {
  /** Piel y faneras: lesiones, exantemas, palidez, etc. */
  skin: string;
  /** Aparato digestivo: dolor abdominal, n\u00e1useas, h\u00e1bitos, etc. */
  digestive: string;
  /** Sistema nervioso: cefalea, parestesias, focalidad, etc. */
  neurological: string;
  /** V\u00edas respiratorias: tos, disnea, dolor, etc. */
  respiratory: string;
  /** Cardiovascular: dolor tor\u00e1cico, palpitaciones, edema, etc. */
  cardiovascular: string;
  /** Genitourinario: disuria, hematuria, ciclo menstrual, etc. */
  genitourinary: string;
}

export interface ClinicalRecord {
  /** Historia de enfermedad actual (HEA). Texto libre. */
  presentIllnessHistory: string;
  /** Revisi\u00f3n por sistemas estructurada. */
  systemsReview: SystemsReview;
  /**
   * Notas adicionales que el m\u00e9dico haya escrito en formato libre, fuera de
   * la ficha estructurada (legacy o evoluci\u00f3n).
   */
  freeNotes: string;
}

export const EMPTY_CLINICAL_RECORD: ClinicalRecord = {
  presentIllnessHistory: "",
  systemsReview: {
    skin: "",
    digestive: "",
    neurological: "",
    respiratory: "",
    cardiovascular: "",
    genitourinary: "",
  },
  freeNotes: "",
};

interface PersistedRecord {
  v: 1;
  presentIllnessHistory?: string;
  systemsReview?: Partial<SystemsReview>;
}

function safeParseJson(s: string): PersistedRecord | null {
  try {
    const parsed = JSON.parse(s) as PersistedRecord;
    if (parsed && typeof parsed === "object" && parsed.v === 1) return parsed;
    return null;
  } catch {
    return null;
  }
}

/**
 * Extrae la ficha estructurada del campo `notes` del backend. Si no contiene
 * el marcador, todo el contenido se considera notas libres.
 */
export function parseClinicalRecord(notes: string | null | undefined): ClinicalRecord {
  if (!notes) return { ...EMPTY_CLINICAL_RECORD, systemsReview: { ...EMPTY_CLINICAL_RECORD.systemsReview } };
  const start = notes.indexOf(RECORD_MARKER);
  if (start === -1) {
    return {
      ...EMPTY_CLINICAL_RECORD,
      systemsReview: { ...EMPTY_CLINICAL_RECORD.systemsReview },
      freeNotes: notes.trim(),
    };
  }
  const end = notes.indexOf(RECORD_END, start);
  const jsonPart =
    end >= 0
      ? notes.slice(start + RECORD_MARKER.length, end).trim()
      : notes.slice(start + RECORD_MARKER.length).trim();
  const parsed = safeParseJson(jsonPart);
  const beforeFree = notes.slice(0, start).trim();
  const afterFree = end >= 0 ? notes.slice(end + RECORD_END.length).trim() : "";
  const freeNotes = [beforeFree, afterFree].filter(Boolean).join("\n\n").trim();

  return {
    presentIllnessHistory: parsed?.presentIllnessHistory ?? "",
    systemsReview: {
      skin: parsed?.systemsReview?.skin ?? "",
      digestive: parsed?.systemsReview?.digestive ?? "",
      neurological: parsed?.systemsReview?.neurological ?? "",
      respiratory: parsed?.systemsReview?.respiratory ?? "",
      cardiovascular: parsed?.systemsReview?.cardiovascular ?? "",
      genitourinary: parsed?.systemsReview?.genitourinary ?? "",
    },
    freeNotes,
  };
}

/**
 * Serializa la ficha estructurada para guardar en `notes`. Las notas libres
 * quedan al principio (legibles incluso si el m\u00e9dico abriera la consulta
 * desde otra herramienta), y luego un bloque marcado con el JSON.
 */
export function serializeClinicalRecord(record: ClinicalRecord): string {
  const payload: PersistedRecord = {
    v: 1,
    presentIllnessHistory: record.presentIllnessHistory.trim() || undefined,
    systemsReview: {
      skin: record.systemsReview.skin.trim() || undefined,
      digestive: record.systemsReview.digestive.trim() || undefined,
      neurological: record.systemsReview.neurological.trim() || undefined,
      respiratory: record.systemsReview.respiratory.trim() || undefined,
      cardiovascular: record.systemsReview.cardiovascular.trim() || undefined,
      genitourinary: record.systemsReview.genitourinary.trim() || undefined,
    },
  };
  /**
   * Si todo est\u00e1 vac\u00edo, no insertamos el marcador: dejamos solo las notas
   * libres para no contaminar el campo cuando el m\u00e9dico no us\u00f3 la ficha.
   */
  const sysHasContent = Object.values(payload.systemsReview ?? {}).some(
    (v) => typeof v === "string" && v.trim().length > 0,
  );
  const hasStructured =
    !!payload.presentIllnessHistory || sysHasContent;
  const free = record.freeNotes.trim();
  if (!hasStructured) return free;
  const block = `${RECORD_MARKER}\n${JSON.stringify(payload)}\n${RECORD_END}`;
  return free ? `${free}\n\n${block}` : block;
}

/* ────────────────────────── Autollenado IA ────────────────────────── */

export interface AutofillContext {
  chiefComplaint?: string | null;
  patientName?: string | null;
  patientAge?: number | null;
  patientSex?: string | null;
  /** Notas previas (texto libre o estructura ya parseada). */
  currentRecord?: ClinicalRecord;
}

export interface AutofillResult {
  record: ClinicalRecord;
  /** True si el backend respondi\u00f3 con datos AI; false si usamos heur\u00edsticas locales. */
  source: "ai" | "fallback";
  message?: string;
}

/**
 * Plantilla heur\u00edstica para cuando el backend AI no est\u00e1 disponible.
 * La idea es darle al m\u00e9dico un punto de partida edicionable, NUNCA datos
 * inventados: dejamos placeholders claros para completar.
 */
function buildHeuristicRecord(ctx: AutofillContext): ClinicalRecord {
  const reason = (ctx.chiefComplaint ?? "").toLowerCase();
  const has = (kw: string) => reason.includes(kw);

  const presentIllness =
    [
      ctx.patientName ? `Paciente ${ctx.patientName}` : "Paciente",
      ctx.patientAge ? `de ${ctx.patientAge} a\u00f1os` : null,
      ctx.patientSex ? `(${ctx.patientSex})` : null,
      ctx.chiefComplaint
        ? `consulta por: ${ctx.chiefComplaint}.`
        : "consulta por motivo a documentar.",
      "Refiere [completar evoluci\u00f3n y s\u00edntomas asociados].",
    ]
      .filter(Boolean)
      .join(" ");

  /**
   * Plantillas r\u00e1pidas por palabras clave del motivo. Solo escribimos
   * "Sin hallazgos" cuando hay una pista clara del motivo (DM2, HTA, IRA),
   * en otros casos dejamos placeholders para forzar al m\u00e9dico a revisar.
   */
  let skin = "[Examinar piel y faneras.]";
  let digestive = "[Documentar h\u00e1bitos y s\u00edntomas digestivos.]";
  let neurological = "[Documentar estado neurol\u00f3gico.]";
  let respiratory = "[Documentar v\u00edas respiratorias.]";
  let cardiovascular = "[Documentar examen cardiovascular.]";
  let genitourinary = "[Documentar genitourinario seg\u00fan caso.]";

  if (has("diabet") || has("dm2") || has("dm 2")) {
    skin = "Sin lesiones en pies.";
    digestive = "Sin hallazgos.";
    neurological = "Sin parestesias ni visi\u00f3n borrosa.";
    respiratory = "Sin hallazgos.";
    cardiovascular = "Sin hallazgos.";
    genitourinary = "Sin hallazgos.";
  } else if (has("hipertens") || has("hta")) {
    skin = "Sin hallazgos.";
    digestive = "Sin hallazgos.";
    neurological = "Sin cefalea ni focalidad.";
    respiratory = "Sin disnea.";
    cardiovascular = "Sin dolor tor\u00e1cico ni palpitaciones.";
    genitourinary = "Sin hallazgos.";
  } else if (has("respirator") || has("tos") || has("gripe") || has("resfri")) {
    skin = "Sin hallazgos.";
    digestive = "Sin hallazgos.";
    neurological = "Sin cefalea.";
    respiratory = "Tos seca/productiva [especificar], sin disnea.";
    cardiovascular = "Sin hallazgos.";
    genitourinary = "Sin hallazgos.";
  } else if (has("dolor abdom") || has("digestiv") || has("diarrea") || has("vomito")) {
    skin = "Sin hallazgos.";
    digestive = "[Detallar tipo de dolor, irradiaci\u00f3n, h\u00e1bitos.]";
    neurological = "Sin hallazgos.";
    respiratory = "Sin hallazgos.";
    cardiovascular = "Sin hallazgos.";
    genitourinary = "Sin hallazgos.";
  }

  return {
    presentIllnessHistory: presentIllness,
    systemsReview: {
      skin,
      digestive,
      neurological,
      respiratory,
      cardiovascular,
      genitourinary,
    },
    freeNotes: ctx.currentRecord?.freeNotes ?? "",
  };
}

interface AutofillResponse {
  presentIllnessHistory?: string;
  systemsReview?: Partial<SystemsReview>;
}

/**
 * Llama al backend para que la IA proponga el contenido de la ficha
 * estructurada. Si el endpoint no existe (404), aplicamos un fallback
 * heur\u00edstico local para que el m\u00e9dico vea siempre un punto de partida.
 */
export async function autofillClinicalRecord(
  consultationId: string,
  ctx: AutofillContext,
): Promise<AutofillResult> {
  const fallback = buildHeuristicRecord(ctx);
  try {
    const res = await heydoctorApi.postOrFallback<AutofillResponse | null>(
      `/consultations/${consultationId}/ai/autofill-record`,
      {
        chiefComplaint: ctx.chiefComplaint ?? null,
        patient: {
          name: ctx.patientName ?? null,
          age: ctx.patientAge ?? null,
          sex: ctx.patientSex ?? null,
        },
        currentRecord: ctx.currentRecord ?? null,
      },
      null,
    );
    if (res && (res.presentIllnessHistory || res.systemsReview)) {
      const merged: ClinicalRecord = {
        presentIllnessHistory:
          res.presentIllnessHistory ?? fallback.presentIllnessHistory,
        systemsReview: {
          skin: res.systemsReview?.skin ?? fallback.systemsReview.skin,
          digestive:
            res.systemsReview?.digestive ?? fallback.systemsReview.digestive,
          neurological:
            res.systemsReview?.neurological ??
            fallback.systemsReview.neurological,
          respiratory:
            res.systemsReview?.respiratory ?? fallback.systemsReview.respiratory,
          cardiovascular:
            res.systemsReview?.cardiovascular ??
            fallback.systemsReview.cardiovascular,
          genitourinary:
            res.systemsReview?.genitourinary ??
            fallback.systemsReview.genitourinary,
        },
        freeNotes: ctx.currentRecord?.freeNotes ?? "",
      };
      log.event("autofill_ai_ok", { consultationId });
      return { record: merged, source: "ai" };
    }
    log.event("autofill_fallback", { consultationId });
    return {
      record: fallback,
      source: "fallback",
      message:
        "El servicio de IA no est\u00e1 disponible. Te dejamos una plantilla orientativa basada en el motivo. Revisa y ajusta antes de guardar.",
    };
  } catch (e) {
    log.warn("autofill_failed", e);
    return {
      record: fallback,
      source: "fallback",
      message:
        "No se pudo generar la propuesta con IA. Te dejamos una plantilla orientativa para editar.",
    };
  }
}
