"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AgeFromBirthDateField,
  GlobalAddressFields,
  NationalityField,
} from "@/components/global-address";
import { usePatientProfilePersistFeedback } from "@/hooks/usePatientProfilePersistFeedback";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  addressSelectionToPatientFields,
  patientFieldsToAddressSelection,
  resolveAgeDisplay,
  type AddressSelection,
} from "@/lib/global-address-engine";
import {
  jsonLinesToText,
  textToJsonLines,
} from "@/lib/patient-profile-display";
import {
  emptyHabitDraft,
  habitsFromProfile,
  habitsToPayload,
  PATIENT_HABIT_FIELDS,
  type PatientHabitDraft,
} from "@/lib/patient-profile-habits";
import { isUnmodifiedLeftClick } from "@/lib/unsaved-changes-guard/is-unmodified-left-click";
import { useUnsavedChangesGuard } from "@/lib/unsaved-changes-guard/unsaved-changes-guard-context";
import {
  fetchPatientById,
  fetchPatientProfile,
  formatPatientDisplayName,
  updatePatient,
  upsertPatientProfile,
  type PatientDocumentType,
  type PatientProfile,
  type PatientRow,
  type PatientSex,
  type UpdatePatientDto,
} from "@/lib/services/patients";

type TabId = "datos" | "cobertura" | "emergencia" | "antecedentes";

const TEAL = "#078A92";
const TABS: { id: TabId; label: string }[] = [
  { id: "datos", label: "Datos personales" },
  { id: "cobertura", label: "Cobertura de salud" },
  { id: "emergencia", label: "Contacto de emergencia" },
  { id: "antecedentes", label: "Antecedentes médicos" },
];

const DOCUMENT_TYPES: PatientDocumentType[] = [
  "RUT",
  "DNI",
  "CPF",
  "SSN",
  "PASSPORT",
  "NIE",
  "OTHER",
];

const SEX_OPTIONS: { value: PatientSex; label: string }[] = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Otro" },
  { value: "unknown", label: "No especificado" },
];

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #dfe6e8",
  borderRadius: 8,
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "rgba(2,44,44,0.7)",
  marginBottom: 4,
  fontWeight: 600,
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}


export default function PatientDetailPage() {
  const params = useParams();
  const patientId = typeof params.id === "string" ? params.id : "";

  const [tab, setTab] = useState<TabId>("datos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const persist = usePatientProfilePersistFeedback();
  const { register, requestNavigation } = useUnsavedChangesGuard();

  const [form, setForm] = useState<UpdatePatientDto>({});
  const [address, setAddress] = useState<AddressSelection>(() =>
    patientFieldsToAddressSelection({ country: "CL" }),
  );
  const [allergiesText, setAllergiesText] = useState("");
  const [medicationsText, setMedicationsText] = useState("");
  const [chronicText, setChronicText] = useState("");
  const [familyHistoryText, setFamilyHistoryText] = useState("");
  const [habitDraft, setHabitDraft] = useState<PatientHabitDraft>(emptyHabitDraft);
  const [profileNotes, setProfileNotes] = useState("");
  const [profileBaseline, setProfileBaseline] = useState("");
  const [formBaseline, setFormBaseline] = useState("");

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError("");
    try {
      const [p, prof] = await Promise.all([
        fetchPatientById(patientId),
        fetchPatientProfile(patientId).catch(() => null),
      ]);
      setPatient(p);
      setProfile(prof);
      const nextForm: UpdatePatientDto = {
        firstName: p.firstName ?? p.firstname ?? "",
        middleName: p.middleName ?? "",
        lastName: p.lastName ?? p.lastname ?? "",
        secondLastName: p.secondLastName ?? "",
        preferredName: p.preferredName ?? "",
        email: p.email ?? "",
        documentType: p.documentType ?? undefined,
        documentNumber: p.documentNumber ?? "",
        sex: (p.sex as PatientSex | undefined) ?? undefined,
        genderIdentity: p.genderIdentity ?? "",
        birthDate: p.birthDate ?? "",
        nationality: p.nationality ?? "",
        phone: p.phone ?? "",
        mobilePhone: p.mobilePhone ?? "",
        addressLine1: p.addressLine1 ?? "",
        addressLine2: p.addressLine2 ?? "",
        city: p.city ?? "",
        stateProvince: p.stateProvince ?? "",
        postalCode: p.postalCode ?? "",
        country: p.country ?? "",
        insuranceProvider: p.insuranceProvider ?? "",
        insurancePlan: p.insurancePlan ?? "",
        memberNumber: p.memberNumber ?? "",
        emergencyContactName: p.emergencyContactName ?? "",
        emergencyContactPhone: p.emergencyContactPhone ?? "",
        emergencyRelationship: p.emergencyRelationship ?? "",
      };
      setForm(nextForm);
      setAddress(
        patientFieldsToAddressSelection({
          country: p.country ?? "CL",
          stateProvince: p.stateProvince ?? "",
          city: p.city ?? "",
          addressLine1: p.addressLine1 ?? "",
          addressLine2: p.addressLine2 ?? "",
          postalCode: p.postalCode ?? "",
        }),
      );
      const nextAllergies = prof ? jsonLinesToText(prof.allergies) : "";
      const nextMedications = prof ? jsonLinesToText(prof.medications) : "";
      const nextChronic = prof ? jsonLinesToText(prof.chronicConditions) : "";
      const nextFamily = prof ? jsonLinesToText(prof.familyHistory) : "";
      const nextHabits = habitsFromProfile(prof);
      const nextNotes = prof?.notes ?? "";
      setAllergiesText(nextAllergies);
      setMedicationsText(nextMedications);
      setChronicText(nextChronic);
      setFamilyHistoryText(nextFamily);
      setHabitDraft(nextHabits);
      setProfileNotes(nextNotes);
      setFormBaseline(JSON.stringify(nextForm));
      setProfileBaseline(
        JSON.stringify({
          allergiesText: nextAllergies,
          medicationsText: nextMedications,
          chronicText: nextChronic,
          familyHistoryText: nextFamily,
          habitDraft: nextHabits,
          profileNotes: nextNotes,
        }),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo cargar la ficha del paciente."));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (persist.phase !== "saved" && persist.phase !== "updated") return;
    const t = window.setTimeout(() => persist.ackIdle(), 3500);
    return () => window.clearTimeout(t);
  }, [persist.phase, persist.ackIdle]);

  function updateField<K extends keyof UpdatePatientDto>(
    key: K,
    value: UpdatePatientDto[K]
  ) {
    markFormDirty();
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateAddress(next: AddressSelection) {
    markFormDirty();
    setAddress(next);
    const mapped = addressSelectionToPatientFields(next);
    setForm((prev) => ({
      ...prev,
      country: mapped.country ?? "",
      stateProvince: mapped.stateProvince ?? "",
      city: mapped.city ?? "",
      addressLine1: mapped.addressLine1 ?? "",
      addressLine2: mapped.addressLine2 ?? "",
      postalCode: mapped.postalCode ?? "",
    }));
  }

  function currentProfileSnapshot() {
    return JSON.stringify({
      allergiesText,
      medicationsText,
      chronicText,
      familyHistoryText,
      habitDraft,
      profileNotes,
    });
  }

  function isFichaDirty() {
    return (
      currentProfileSnapshot() !== profileBaseline ||
      JSON.stringify(form) !== formBaseline
    );
  }

  async function persistAll() {
    if (!patientId) return;
    if (persist.inFlight) {
      throw new Error("Guardado en curso. Espere e intente de nuevo.");
    }
    const profileDirty = currentProfileSnapshot() !== profileBaseline;
    const demoDirty = JSON.stringify(form) !== formBaseline;
    if (!profileDirty && !demoDirty) return;

    setError("");
    if (persist.phase === "error") {
      persist.retryPersist();
    } else {
      persist.beginPersist();
    }
    try {
      if (profileDirty) {
        const updatedProfile = await upsertPatientProfile(patientId, {
          allergies: textToJsonLines(allergiesText),
          medications: textToJsonLines(medicationsText),
          chronicConditions: textToJsonLines(chronicText),
          familyHistory: textToJsonLines(familyHistoryText),
          ...habitsToPayload(habitDraft),
          notes: profileNotes.trim() || null,
        });
        setProfile(updatedProfile);
        setProfileBaseline(currentProfileSnapshot());
      }
      if (demoDirty) {
        const updated = await updatePatient(patientId, form);
        setPatient(updated);
        setFormBaseline(JSON.stringify(form));
      }
      persist.completeSuccess();
    } catch (err) {
      const message = getApiErrorMessage(err, "Error al guardar los cambios.");
      setError(message);
      persist.fail(message);
      throw err;
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await persistAll();
    } catch {
      // persistAll already surfaced the error in UI / FSM.
    }
  }

  function markFormDirty() {
    persist.markDirty();
  }

  useEffect(() => {
    return register({
      isDirty: () => isFichaDirty(),
      save: persistAll,
    });
  });

  if (!patientId) {
    return (
      <div style={{ padding: 25 }}>
        <p>Identificador de paciente inválido.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 25 }}>
        <p style={{ color: "rgba(2,44,44,0.7)" }}>Cargando ficha clínica...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ padding: 25 }}>
        <p className="text-red-500" role="alert">
          {error || "Paciente no encontrado."}
        </p>
        <Link href="/panel/pacientes" style={{ color: TEAL }}>
          ← Volver a pacientes
        </Link>
      </div>
    );
  }

  const displayName = formatPatientDisplayName(patient);

  return (
    <div style={{ padding: 25, maxWidth: 960 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Link
            href="/panel/pacientes"
            onClick={(event) => {
              if (!isUnmodifiedLeftClick(event)) return;
              event.preventDefault();
              requestNavigation("/panel/pacientes");
            }}
            style={{ color: TEAL, fontSize: 14, textDecoration: "none" }}
          >
            ← Pacientes
          </Link>
          <h1
            style={{
              fontFamily: "Montserrat",
              color: TEAL,
              margin: "8px 0 4px",
              fontSize: 28,
            }}
          >
            {displayName}
          </h1>
          <p style={{ margin: 0, color: "rgba(2,44,44,0.7)", fontSize: 14 }}>
            {patient.email || "Sin email"} · Edad:{" "}
            {resolveAgeDisplay(form.birthDate ?? patient.birthDate, patient.age)}
            {patient.documentType && patient.documentNumber
              ? ` · ${patient.documentType} ${patient.documentNumber}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            requestNavigation(`/panel/consultas?patientId=${patientId}`)
          }
          style={{
            padding: "10px 18px",
            background: TEAL,
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Nueva consulta
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
          borderBottom: "1px solid #e8eef0",
          paddingBottom: 8,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: tab === t.id ? TEAL : "#f0f0f0",
              color: tab === t.id ? "white" : "#444",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {persist.phase === "error" || error ? (
        <p className="text-red-500 text-sm" role="alert" style={{ marginBottom: 12 }}>
          {persist.errorMessage || error}
        </p>
      ) : null}
      {persist.phase === "pending" ||
      persist.phase === "pending_again" ||
      persist.phase === "saving" ||
      persist.phase === "updating" ||
      persist.phase === "saved" ||
      persist.phase === "updated" ? (
        <p
          style={{
            color:
              persist.phase === "pending" || persist.phase === "pending_again"
                ? "#b45309"
                : "#078A92",
            fontSize: 14,
            marginBottom: 12,
            fontWeight: 600,
          }}
          role="status"
          data-testid="profile-persist-status"
          data-persist-phase={persist.phase}
        >
          {persist.label}
        </p>
      ) : null}

      <form
        onSubmit={handleSave}
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        {tab === "datos" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0 16px",
            }}
          >
            <Field label="Nombre">
              <input
                style={inputStyle}
                value={form.firstName ?? ""}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </Field>
            <Field label="Segundo nombre">
              <input
                style={inputStyle}
                value={form.middleName ?? ""}
                onChange={(e) => updateField("middleName", e.target.value)}
              />
            </Field>
            <Field label="Apellido paterno">
              <input
                style={inputStyle}
                value={form.lastName ?? ""}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </Field>
            <Field label="Apellido materno">
              <input
                style={inputStyle}
                value={form.secondLastName ?? ""}
                onChange={(e) => updateField("secondLastName", e.target.value)}
              />
            </Field>
            <Field label="Nombre preferido">
              <input
                style={inputStyle}
                value={form.preferredName ?? ""}
                onChange={(e) => updateField("preferredName", e.target.value)}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                style={inputStyle}
                value={form.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </Field>
            <Field label="Tipo de documento">
              <select
                style={inputStyle}
                value={form.documentType ?? ""}
                onChange={(e) =>
                  updateField(
                    "documentType",
                    (e.target.value || undefined) as PatientDocumentType | undefined
                  )
                }
              >
                <option value="">—</option>
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Número de documento">
              <input
                style={inputStyle}
                value={form.documentNumber ?? ""}
                onChange={(e) => updateField("documentNumber", e.target.value)}
              />
            </Field>
            <Field label="Fecha de nacimiento">
              <input
                type="date"
                style={inputStyle}
                value={form.birthDate ?? ""}
                onChange={(e) => updateField("birthDate", e.target.value)}
              />
            </Field>
            <AgeFromBirthDateField
              birthDate={form.birthDate ?? ""}
              fallbackAge={patient.age}
            />
            <Field label="Sexo biológico">
              <select
                style={inputStyle}
                value={form.sex ?? ""}
                onChange={(e) =>
                  updateField("sex", (e.target.value || undefined) as PatientSex)
                }
              >
                <option value="">—</option>
                {SEX_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Identidad de género">
              <input
                style={inputStyle}
                value={form.genderIdentity ?? ""}
                onChange={(e) => updateField("genderIdentity", e.target.value)}
              />
            </Field>
            <NationalityField
              value={form.nationality ?? ""}
              onChange={(code) => updateField("nationality", code)}
            />
            <Field label="Teléfono">
              <input
                style={inputStyle}
                value={form.phone ?? ""}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </Field>
            <Field label="Móvil">
              <input
                style={inputStyle}
                value={form.mobilePhone ?? ""}
                onChange={(e) => updateField("mobilePhone", e.target.value)}
              />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <GlobalAddressFields
                value={address}
                onChange={updateAddress}
                idPrefix="patient-detail-address"
              />
            </div>
          </div>
        )}

        {tab === "cobertura" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "0 16px",
            }}
          >
            <Field label="Aseguradora / sistema de salud">
              <input
                style={inputStyle}
                placeholder="Ej. FONASA, SURA, Medicare, NHS..."
                value={form.insuranceProvider ?? ""}
                onChange={(e) =>
                  updateField("insuranceProvider", e.target.value)
                }
              />
            </Field>
            <Field label="Plan">
              <input
                style={inputStyle}
                value={form.insurancePlan ?? ""}
                onChange={(e) => updateField("insurancePlan", e.target.value)}
              />
            </Field>
            <Field label="Número de afiliado / póliza">
              <input
                style={inputStyle}
                value={form.memberNumber ?? ""}
                onChange={(e) => updateField("memberNumber", e.target.value)}
              />
            </Field>
            <p style={{ gridColumn: "1 / -1", color: "rgba(2,44,44,0.5)", fontSize: 13, margin: 0 }}>
              Compatible con coberturas de Chile (FONASA/ISAPRE), Colombia (EPS),
              Brasil (SUS/planes privados), USA (Medicare/Medicaid/privado) y
              Europa (seguros nacionales/privados).
            </p>
          </div>
        )}

        {tab === "emergencia" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "0 16px",
            }}
          >
            <Field label="Nombre del contacto">
              <input
                style={inputStyle}
                value={form.emergencyContactName ?? ""}
                onChange={(e) =>
                  updateField("emergencyContactName", e.target.value)
                }
              />
            </Field>
            <Field label="Teléfono de emergencia">
              <input
                style={inputStyle}
                value={form.emergencyContactPhone ?? ""}
                onChange={(e) =>
                  updateField("emergencyContactPhone", e.target.value)
                }
              />
            </Field>
            <Field label="Parentesco / relación">
              <input
                style={inputStyle}
                placeholder="Ej. cónyuge, padre, hijo..."
                value={form.emergencyRelationship ?? ""}
                onChange={(e) =>
                  updateField("emergencyRelationship", e.target.value)
                }
              />
            </Field>
          </div>
        )}

        {tab === "antecedentes" && (
          <div>
            <Field label="Alergias (una por línea)">
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                value={allergiesText}
                onChange={(e) => {
                  markFormDirty();
                  setAllergiesText(e.target.value);
                }}
                placeholder="Penicilina: rash cutáneo"
              />
            </Field>
            <Field label="Medicación habitual (una por línea)">
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                value={medicationsText}
                onChange={(e) => {
                  markFormDirty();
                  setMedicationsText(e.target.value);
                }}
              />
            </Field>
            <Field label="Condiciones crónicas (una por línea)">
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                value={chronicText}
                onChange={(e) => {
                  markFormDirty();
                  setChronicText(e.target.value);
                }}
              />
            </Field>
            <Field label="Antecedentes familiares (una por línea)">
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                value={familyHistoryText}
                onChange={(e) => {
                  markFormDirty();
                  setFamilyHistoryText(e.target.value);
                }}
                placeholder="DM padre"
                data-testid="profile-family-history"
              />
            </Field>
            <div
              style={{
                marginBottom: 14,
                padding: 12,
                border: "1px solid #dfe6e8",
                borderRadius: 8,
              }}
              data-testid="profile-habits"
            >
              <p style={{ ...labelStyle, marginBottom: 10 }}>Hábitos</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                }}
              >
                {PATIENT_HABIT_FIELDS.map(({ key, label }) => (
                  <Field key={key} label={label}>
                    <input
                      style={inputStyle}
                      value={habitDraft[key]}
                      onChange={(e) => {
                        markFormDirty();
                        setHabitDraft((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }));
                      }}
                      placeholder="Ej. nunca, ocasional, diario"
                      data-testid={`profile-habit-${key}`}
                    />
                  </Field>
                ))}
              </div>
            </div>
            <Field label="Notas clínicas generales">
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                value={profileNotes}
                onChange={(e) => {
                  markFormDirty();
                  setProfileNotes(e.target.value);
                }}
              />
            </Field>
            {profile?.updatedAt && (
              <p style={{ fontSize: 12, color: "#999", marginTop: 0 }}>
                Perfil clínico actualizado: {profile.updatedAt}
              </p>
            )}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button
            type="submit"
            disabled={persist.inFlight}
            data-testid="profile-persist-submit"
            style={{
              padding: "10px 22px",
              background: TEAL,
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: persist.inFlight ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {persist.buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
