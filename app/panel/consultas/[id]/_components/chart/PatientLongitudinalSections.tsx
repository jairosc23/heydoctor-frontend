"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  jsonLinesToList,
  jsonLinesToText,
  textToJsonLines,
} from "@/lib/patient-profile-display";
import {
  upsertPatientProfile,
  type PatientProfile,
} from "@/lib/services/patients";
import { cn } from "@/lib/utils";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";
import { ProfileTextBlock } from "./PatientProfileFields";

const HABIT_FIELDS: { key: keyof PatientProfile; label: string }[] = [
  { key: "smokingStatus", label: "Tabaco" },
  { key: "alcoholUse", label: "Alcohol" },
  { key: "drugUse", label: "Drogas" },
  { key: "exerciseFrequency", label: "Actividad física" },
];

const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-hd-md border border-slate-300 bg-white px-hd-3 py-hd-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500";

function mergeLines(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const line of group) {
      if (!seen.has(line)) {
        seen.add(line);
        out.push(line);
      }
    }
  }
  return out;
}

type AntecedentsDraft = {
  personalText: string;
  medicationsText: string;
  allergiesText: string;
  familyText: string;
};

function draftFromProfile(profile: PatientProfile | null): AntecedentsDraft {
  return {
    personalText: jsonLinesToText(profile?.chronicConditions),
    medicationsText: jsonLinesToText(profile?.medications),
    allergiesText: jsonLinesToText(profile?.allergies),
    familyText: jsonLinesToText(profile?.familyHistory),
  };
}

function draftKeyOf(draft: AntecedentsDraft): string {
  return JSON.stringify(draft);
}

export type PatientAntecedentsSectionHandle = {
  /** Persiste el perfil si hay cambios. Retorna true si escribió en la ficha del paciente. */
  flush: () => Promise<boolean>;
  getDraftKey: () => string;
  isDirty: () => boolean;
};

export interface PatientLongitudinalSectionsProps {
  profile: PatientProfile | null;
  loading?: boolean;
  patientId?: string | null;
  editable?: boolean;
  onProfileSaved?: (profile: PatientProfile) => void;
  onDraftKeyChange?: (draftKey: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onPersistError?: (message: string) => void;
}

function SectionSummary({
  label,
  lines,
  emptyLabel,
  critical,
}: {
  label: string;
  lines: string[];
  emptyLabel: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-hd-md border border-hd-border-subtle bg-white px-hd-3 py-hd-2",
        critical && "border-red-200 bg-red-50",
      )}
    >
      <p
        className={cn(
          "mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600",
          critical && "text-red-800",
        )}
      >
        {label}
      </p>
      <ProfileTextBlock lines={lines} emptyLabel={emptyLabel} />
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  critical,
  disabled,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  critical?: boolean;
  disabled?: boolean;
  testId: string;
}) {
  return (
    <label
      className={cn(
        "block rounded-hd-md border border-slate-300 bg-white px-hd-3 py-hd-2 shadow-sm",
        critical && "border-red-300 bg-red-50/40",
      )}
    >
      <span
        className={cn(
          "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-700",
          critical && "text-red-800",
        )}
      >
        {label}
      </span>
      <textarea
        className={TEXTAREA_CLASS}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        data-testid={testId}
        rows={4}
      />
      <span className="mt-1 block text-[11px] text-slate-500">
        Una entrada por línea. Se guarda en la ficha del paciente.
      </span>
    </label>
  );
}

export const PatientAntecedentsSection = forwardRef<
  PatientAntecedentsSectionHandle,
  PatientLongitudinalSectionsProps
>(function PatientAntecedentsSection(
  {
    profile,
    loading,
    patientId,
    editable = false,
    onProfileSaved,
    onDraftKeyChange,
    onDirtyChange,
    onPersistError,
  },
  ref,
) {
  const [draft, setDraft] = useState<AntecedentsDraft>(() =>
    draftFromProfile(profile),
  );
  const [baselineKey, setBaselineKey] = useState(() =>
    draftKeyOf(draftFromProfile(profile)),
  );
  const [saving, setSaving] = useState(false);
  const profileUpdatedAt = profile?.updatedAt ?? null;
  const draftRef = useRef(draft);
  const baselineKeyRef = useRef(baselineKey);
  const savingRef = useRef(false);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    baselineKeyRef.current = baselineKey;
  }, [baselineKey]);

  useEffect(() => {
    const next = draftFromProfile(profile);
    setDraft(next);
    setBaselineKey(draftKeyOf(next));
  }, [patientId, profileUpdatedAt]);

  const currentDraftKey = useMemo(() => draftKeyOf(draft), [draft]);
  const dirty = currentDraftKey !== baselineKey;

  useEffect(() => {
    onDraftKeyChange?.(currentDraftKey);
  }, [currentDraftKey, onDraftKeyChange]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const flush = useCallback(async (): Promise<boolean> => {
    if (!patientId || !editable) return false;
    if (savingRef.current) return false;
    const current = draftRef.current;
    const key = draftKeyOf(current);
    if (key === baselineKeyRef.current) return false;

    savingRef.current = true;
    setSaving(true);
    try {
      const updated = await upsertPatientProfile(patientId, {
        chronicConditions: textToJsonLines(current.personalText),
        medications: textToJsonLines(current.medicationsText),
        allergies: textToJsonLines(current.allergiesText),
        familyHistory: textToJsonLines(current.familyText),
      });
      const synced = draftFromProfile(updated);
      setDraft(synced);
      const syncedKey = draftKeyOf(synced);
      setBaselineKey(syncedKey);
      baselineKeyRef.current = syncedKey;
      draftRef.current = synced;
      onProfileSaved?.(updated);
      return true;
    } catch (err) {
      onPersistError?.(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los antecedentes. Intente Guardar de nuevo.",
      );
      throw err;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [editable, onPersistError, onProfileSaved, patientId]);

  useImperativeHandle(
    ref,
    () => ({
      flush,
      getDraftKey: () => draftKeyOf(draftRef.current),
      isDirty: () => draftKeyOf(draftRef.current) !== baselineKeyRef.current,
    }),
    [flush],
  );

  const chronic = jsonLinesToList(profile?.chronicConditions);
  const surgeries = jsonLinesToList(profile?.surgeries);
  const trauma = jsonLinesToList(profile?.disabilities);
  const personalLines = mergeLines(chronic, surgeries, trauma);
  const medicationLines = jsonLinesToList(profile?.medications);
  const allergyLines = jsonLinesToList(profile?.allergies);
  const habitLines = HABIT_FIELDS.map(({ key, label }) => {
    const raw = profile?.[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    return value ? `${label}: ${value}` : null;
  }).filter((line): line is string => Boolean(line));
  const familyLines = jsonLinesToList(profile?.familyHistory);
  const hasAllergies =
    allergyLines.length > 0 || draft.allergiesText.trim().length > 0;
  const canEdit = Boolean(editable && patientId);

  return (
    <ClinicalEncounterSection
      sectionNumber={4}
      title="Antecedentes del paciente"
      id="encounter-section-4"
    >
      {loading ? (
        <p className="text-sm text-slate-500">Cargando antecedentes…</p>
      ) : canEdit ? (
        <div className="space-y-hd-3" data-testid="antecedents-editor">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-hd-md border border-primary/20 bg-primaryLight/40 px-2 py-0.5 font-semibold text-primary">
              Antecedentes — editable
            </span>
            {dirty && !saving ? (
              <span
                className="font-semibold text-amber-700"
                data-testid="antecedents-dirty-badge"
              >
                Hay cambios sin guardar en antecedentes
              </span>
            ) : null}
            {saving ? (
              <span className="font-semibold text-slate-600">
                Guardando en la ficha del paciente…
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">
            Use «Guardar» en la ficha clínica para confirmar los cambios en la
            ficha del paciente.
          </p>
          <div className="grid gap-hd-3 md:grid-cols-2">
            <EditableField
              label="Antecedentes personales"
              value={draft.personalText}
              onChange={(personalText) =>
                setDraft((prev) => ({ ...prev, personalText }))
              }
              placeholder="Una condición por línea"
              disabled={saving}
              testId="antecedents-personal"
            />
            <EditableField
              label="Medicamentos habituales"
              value={draft.medicationsText}
              onChange={(medicationsText) =>
                setDraft((prev) => ({ ...prev, medicationsText }))
              }
              placeholder="Un medicamento por línea"
              disabled={saving}
              testId="antecedents-medications"
            />
            <EditableField
              label="Alergias"
              value={draft.allergiesText}
              onChange={(allergiesText) =>
                setDraft((prev) => ({ ...prev, allergiesText }))
              }
              placeholder="Una alergia por línea"
              critical={hasAllergies}
              disabled={saving}
              testId="antecedents-allergies"
            />
            <EditableField
              label="Antecedentes familiares"
              value={draft.familyText}
              onChange={(familyText) =>
                setDraft((prev) => ({ ...prev, familyText }))
              }
              placeholder="Un antecedente familiar por línea"
              disabled={saving}
              testId="antecedents-family"
            />
            <SectionSummary
              label="Hábitos"
              lines={habitLines}
              emptyLabel="Sin hábitos registrados."
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-hd-3 md:grid-cols-2">
          {!editable ? (
            <p className="md:col-span-2 text-xs text-slate-500">
              Solo lectura. Active «Editar consulta» para modificar
              antecedentes.
            </p>
          ) : null}
          <SectionSummary
            label="Antecedentes personales"
            lines={personalLines}
            emptyLabel="Sin antecedentes personales registrados."
          />
          <SectionSummary
            label="Medicamentos habituales"
            lines={medicationLines}
            emptyLabel="Sin medicamentos habituales registrados."
          />
          <SectionSummary
            label="Alergias"
            lines={allergyLines}
            emptyLabel="Sin alergias documentadas en la ficha del paciente."
            critical={hasAllergies}
          />
          <SectionSummary
            label="Hábitos"
            lines={habitLines}
            emptyLabel="Sin hábitos registrados."
          />
          <SectionSummary
            label="Antecedentes familiares"
            lines={familyLines}
            emptyLabel="Sin antecedentes familiares registrados."
          />
        </div>
      )}
    </ClinicalEncounterSection>
  );
});
