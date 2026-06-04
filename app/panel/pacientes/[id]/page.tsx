"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { jsonLinesToText } from "@/lib/patient-profile-display";
import {
  fetchPatientById,
  fetchPatientProfile,
  formatPatientAge,
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

const TEAL = "#078a92";
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
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#666",
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

function textToJsonLines(text: string): Record<string, unknown>[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(":");
      if (colon > 0) {
        return {
          label: line.slice(0, colon).trim(),
          detail: line.slice(colon + 1).trim(),
        };
      }
      return { label: line };
    });
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = typeof params.id === "string" ? params.id : "";

  const [tab, setTab] = useState<TabId>("datos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  const [form, setForm] = useState<UpdatePatientDto>({});
  const [allergiesText, setAllergiesText] = useState("");
  const [medicationsText, setMedicationsText] = useState("");
  const [chronicText, setChronicText] = useState("");
  const [profileNotes, setProfileNotes] = useState("");

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
      setForm({
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
      });
      if (prof) {
        setAllergiesText(jsonLinesToText(prof.allergies));
        setMedicationsText(jsonLinesToText(prof.medications));
        setChronicText(jsonLinesToText(prof.chronicConditions));
        setProfileNotes(prof.notes ?? "");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo cargar la ficha del paciente."));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField<K extends keyof UpdatePatientDto>(
    key: K,
    value: UpdatePatientDto[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (tab === "antecedentes") {
        const updatedProfile = await upsertPatientProfile(patientId, {
          allergies: textToJsonLines(allergiesText),
          medications: textToJsonLines(medicationsText),
          chronicConditions: textToJsonLines(chronicText),
          notes: profileNotes.trim() || null,
        });
        setProfile(updatedProfile);
      } else {
        const updated = await updatePatient(patientId, form);
        setPatient(updated);
      }
      setSuccess("Cambios guardados correctamente.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Error al guardar los cambios."));
    } finally {
      setSaving(false);
    }
  }

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
        <p style={{ color: "#666" }}>Cargando ficha clínica...</p>
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
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
            {patient.email || "Sin email"} · Edad:{" "}
            {formatPatientAge(patient.age)}
            {patient.documentType && patient.documentNumber
              ? ` · ${patient.documentType} ${patient.documentNumber}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            router.push(`/panel/consultas?patientId=${patientId}`)
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
          borderBottom: "1px solid #eee",
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

      {error && (
        <p className="text-red-500 text-sm" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ color: "#059669", fontSize: 14, marginBottom: 12 }} role="status">
          {success}
        </p>
      )}

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
            <Field label="Edad (calculada)">
              <input
                style={{ ...inputStyle, background: "#f9f9f9" }}
                value={formatPatientAge(patient.age)}
                readOnly
                disabled
              />
            </Field>
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
            <Field label="Nacionalidad (ISO-2)">
              <input
                style={inputStyle}
                maxLength={2}
                value={form.nationality ?? ""}
                onChange={(e) =>
                  updateField("nationality", e.target.value.toUpperCase())
                }
              />
            </Field>
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
            <Field label="Dirección">
              <input
                style={inputStyle}
                value={form.addressLine1 ?? ""}
                onChange={(e) => updateField("addressLine1", e.target.value)}
              />
            </Field>
            <Field label="Dirección (línea 2)">
              <input
                style={inputStyle}
                value={form.addressLine2 ?? ""}
                onChange={(e) => updateField("addressLine2", e.target.value)}
              />
            </Field>
            <Field label="Ciudad">
              <input
                style={inputStyle}
                value={form.city ?? ""}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </Field>
            <Field label="Región / Estado">
              <input
                style={inputStyle}
                value={form.stateProvince ?? ""}
                onChange={(e) => updateField("stateProvince", e.target.value)}
              />
            </Field>
            <Field label="Código postal">
              <input
                style={inputStyle}
                value={form.postalCode ?? ""}
                onChange={(e) => updateField("postalCode", e.target.value)}
              />
            </Field>
            <Field label="País (ISO-2)">
              <input
                style={inputStyle}
                maxLength={2}
                value={form.country ?? ""}
                onChange={(e) =>
                  updateField("country", e.target.value.toUpperCase())
                }
              />
            </Field>
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
            <p style={{ gridColumn: "1 / -1", color: "#888", fontSize: 13, margin: 0 }}>
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
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="Penicilina: rash cutáneo"
              />
            </Field>
            <Field label="Medicación habitual (una por línea)">
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
              />
            </Field>
            <Field label="Condiciones crónicas (una por línea)">
              <textarea
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                value={chronicText}
                onChange={(e) => setChronicText(e.target.value)}
              />
            </Field>
            <Field label="Notas clínicas generales">
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                value={profileNotes}
                onChange={(e) => setProfileNotes(e.target.value)}
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
            disabled={saving}
            style={{
              padding: "10px 22px",
              background: TEAL,
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
