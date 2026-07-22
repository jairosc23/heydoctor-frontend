"use client";

import Link from "next/link";
import {
  formatPatientDocument,
  formatPatientSex,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import {
  formatPatientDisplayName,
  type PatientRow,
} from "@/lib/services/patients";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";
import { ProfileField, ProfileFieldGrid } from "./PatientProfileFields";

function formatAddress(patient: PatientRow): string {
  const parts = [
    patient.addressLine1,
    patient.addressLine2,
    patient.city,
    patient.stateProvince,
    patient.postalCode,
    patient.country,
  ]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.join(", ");
}

function formatInsurance(patient: PatientRow): string {
  const parts = [
    patient.insuranceProvider,
    patient.insurancePlan,
    patient.memberNumber ? `N° ${patient.memberNumber}` : null,
  ]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.join(" · ");
}

function formatEmergency(patient: PatientRow): string {
  const parts = [
    patient.emergencyContactName,
    patient.emergencyContactPhone,
    patient.emergencyRelationship,
  ]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.join(" · ");
}

export interface PatientIdentificationSectionProps {
  patient: PatientRow | null;
  loading?: boolean;
  patientId?: string | null;
}

export function PatientIdentificationSection({
  patient,
  loading = false,
  patientId,
}: PatientIdentificationSectionProps) {
  return (
    <ClinicalEncounterSection sectionNumber={1} title="Identificación del paciente">
      {loading ? (
        <p className="text-sm text-slate-500" aria-busy="true">
          Cargando datos del paciente…
        </p>
      ) : !patient ? (
        <p className="text-sm text-slate-500">
          Esta consulta no tiene paciente asociado.
        </p>
      ) : (
        <>
          <p className="mb-hd-3 font-[Montserrat] text-base font-bold text-slate-900">
            {formatPatientDisplayName(patient)}
          </p>
          <ProfileFieldGrid>
            <ProfileField label="Documento" value={formatPatientDocument(patient)} />
            <ProfileField label="Edad" value={resolvePatientAge(patient)} />
            <ProfileField label="Sexo" value={formatPatientSex(patient.sex)} />
            <ProfileField
              label="Fecha de nacimiento"
              value={
                patient.birthDate
                  ? (() => {
                      const d = new Date(patient.birthDate);
                      return Number.isNaN(d.getTime())
                        ? patient.birthDate
                        : d.toLocaleDateString("es-CL");
                    })()
                  : "—"
              }
            />
            <ProfileField
              label="Teléfono"
              value={patient.mobilePhone || patient.phone || "—"}
            />
            <ProfileField label="Correo" value={patient.email ?? "—"} />
            <ProfileField label="Dirección" value={formatAddress(patient)} />
            <ProfileField label="Previsión / seguro" value={formatInsurance(patient)} />
            <ProfileField
              label="Contacto de emergencia"
              value={formatEmergency(patient)}
            />
          </ProfileFieldGrid>
        </>
      )}
      {patientId ? (
        <p className="mt-hd-3 text-xs">
          <Link
            href={`/panel/pacientes/${patientId}`}
            className="font-medium text-primary hover:underline"
          >
            Datos demográficos del paciente →
          </Link>
        </p>
      ) : null}
    </ClinicalEncounterSection>
  );
}
