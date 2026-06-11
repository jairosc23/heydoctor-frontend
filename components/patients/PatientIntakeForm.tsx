"use client";

import React, { useState } from "react";
import {
  createPatient,
  upsertPatientProfile,
  type CreatePatientDto,
  type PatientDocumentType,
  type PatientSex,
} from "@/lib/services/patients";
import { getApiErrorMessage } from "@/lib/heydoctor-api";

const TEAL = "#078a92";

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

const COUNTRY_OPTIONS = [
  { value: "CL", label: "Chile" },
  { value: "AR", label: "Argentina" },
  { value: "PE", label: "Perú" },
  { value: "CO", label: "Colombia" },
  { value: "MX", label: "México" },
  { value: "ES", label: "España" },
  { value: "US", label: "Estados Unidos" },
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
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function allergiesToProfileLines(text: string): Record<string, unknown>[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ label: line }));
}

export interface PatientIntakeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PatientIntakeForm({ onSuccess, onCancel }: PatientIntakeFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [documentType, setDocumentType] = useState<PatientDocumentType>("RUT");
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<PatientSex>("unknown");
  const [mobilePhone, setMobilePhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [country, setCountry] = useState("CL");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [allergiesSummary, setAllergiesSummary] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const name = fullName.trim();
    const emailNorm = email.trim().toLowerCase();
    if (!name || !emailNorm) {
      setFormError("Nombre completo y email son requeridos.");
      return;
    }

    const { firstName, lastName } = splitFullName(name);
    const dto: CreatePatientDto = {
      email: emailNorm,
      name,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      documentType: documentNumber.trim() ? documentType : undefined,
      documentNumber: documentNumber.trim() || undefined,
      birthDate: birthDate || undefined,
      sex: sex !== "unknown" ? sex : undefined,
      mobilePhone: mobilePhone.trim() || undefined,
      addressLine1: addressLine1.trim() || undefined,
      country: country || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      emergencyRelationship: emergencyRelationship.trim() || undefined,
    };

    setCreating(true);
    try {
      const patient = await createPatient(dto);
      const allergyLines = allergiesSummary.trim();
      if (allergyLines && patient.id) {
        await upsertPatientProfile(patient.id, {
          allergies: allergiesToProfileLines(allergyLines),
        });
      }
      onSuccess?.();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Error al crear paciente"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 640,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 16, color: "#333" }}>
        Alta clínica de paciente
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
        Datos mínimos para consulta, memoria clínica y seguridad prescriptiva.
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Nombre completo" required>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={creating}
              placeholder="Nombre y apellidos"
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Email" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={creating}
            style={inputStyle}
          />
        </Field>

        <Field label="Teléfono móvil">
          <input
            type="tel"
            value={mobilePhone}
            onChange={(e) => setMobilePhone(e.target.value)}
            disabled={creating}
            placeholder="+56 9 ..."
            style={inputStyle}
          />
        </Field>

        <Field label="Tipo de documento">
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as PatientDocumentType)}
            disabled={creating}
            style={inputStyle}
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Número de documento">
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            disabled={creating}
            style={inputStyle}
          />
        </Field>

        <Field label="Fecha de nacimiento">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={creating}
            style={inputStyle}
          />
        </Field>

        <Field label="Sexo">
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as PatientSex)}
            disabled={creating}
            style={inputStyle}
          >
            {SEX_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Dirección">
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              disabled={creating}
              placeholder="Calle, número, comuna"
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="País">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={creating}
            style={inputStyle}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          padding: 12,
          margin: 0,
        }}
      >
        <legend style={{ fontSize: 12, fontWeight: 600, color: "#666", padding: "0 6px" }}>
          Contacto de emergencia
        </legend>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Nombre">
            <input
              type="text"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              disabled={creating}
              style={inputStyle}
            />
          </Field>
          <Field label="Teléfono">
            <input
              type="tel"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
              disabled={creating}
              style={inputStyle}
            />
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Parentesco / relación">
              <input
                type="text"
                value={emergencyRelationship}
                onChange={(e) => setEmergencyRelationship(e.target.value)}
                disabled={creating}
                placeholder="Ej. cónyuge, hijo/a"
                style={inputStyle}
              />
            </Field>
          </div>
        </div>
      </fieldset>

      <Field label="Alergias (resumen)">
        <textarea
          value={allergiesSummary}
          onChange={(e) => setAllergiesSummary(e.target.value)}
          disabled={creating}
          placeholder="Una alergia por línea"
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </Field>

      {formError ? (
        <p className="text-red-500 text-sm" style={{ margin: 0 }} role="alert">
          {formError}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={creating}
          style={{
            padding: "10px 20px",
            background: TEAL,
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: creating ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {creating ? "Creando..." : "Crear paciente"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={creating}
            style={{
              padding: "10px 20px",
              background: "transparent",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: 8,
              cursor: creating ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
