"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  createConsultation,
  fetchConsultations,
  fetchPatients,
  type NestConsultation,
  type PatientRow,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";

function displayPatient(patient?: PatientRow | NestConsultation["patient"]): string {
  if (!patient) return "Paciente";
  if ("displayName" in patient && patient.displayName) return patient.displayName;
  if ("name" in patient && patient.name) return patient.name;
  const parts =
    "firstName" in patient
      ? [patient.firstName, patient.lastName].filter(Boolean)
      : [];
  return parts.join(" ") || patient.email || patient.id || "Paciente";
}

function formatDate(iso?: string): string {
  if (!iso) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function ConsultationsListPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<NestConsultation[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState("");
  const [reason, setReason] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const [consultationPage, patientPage] = await Promise.all([
        fetchConsultations({ page: 1, limit: 50 }),
        fetchPatients({ page: 1, limit: 100 }),
      ]);
      setConsultations(consultationPage.data);
      setPatients(patientPage.data);
    } catch (err) {
      setListError(getApiErrorMessage(err, "No se pudieron cargar las consultas."));
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!patientId || !reason.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createConsultation({
        patientId,
        reason: reason.trim(),
      });
      router.push(`/panel/consultas/${created.id}`);
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "No se pudo crear la consulta."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Consultas</h1>
          <p className="text-sm text-slate-600">Espacio clínico del médico</p>
        </div>
        <Link
          href="/panel"
          className="rounded text-sm text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Volver al panel
        </Link>
      </div>

      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Nueva consulta</h2>
        <form onSubmit={onCreate} className="space-y-3">
          <div>
            <label htmlFor="patient" className="mb-1 block text-sm font-medium text-slate-700">
              Paciente
            </label>
            <select
              id="patient"
              required
              value={patientId}
              aria-invalid={Boolean(createError)}
              aria-describedby={createError ? "create-consultation-error" : undefined}
              onChange={(event) => setPatientId(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={creating || listLoading}
            >
              <option value="">Seleccionar paciente...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {displayPatient(patient)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="reason" className="mb-1 block text-sm font-medium text-slate-700">
              Motivo de consulta
            </label>
            <textarea
              id="reason"
              required
              rows={3}
              value={reason}
              aria-invalid={Boolean(createError)}
              aria-describedby={createError ? "create-consultation-error" : undefined}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Síntomas, motivo de la visita..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={creating}
            />
          </div>
          {createError && (
            <p id="create-consultation-error" className="text-sm text-red-600" role="alert">
              {createError}
            </p>
          )}
          <button
            type="submit"
            disabled={creating || !patientId || !reason.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {creating ? "Creando..." : "Abrir consulta"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Consultas recientes</h2>
        </div>

        {listLoading && <p className="px-4 py-6 text-sm text-slate-600">Cargando consultas...</p>}

        {!listLoading && listError && (
          <p className="px-4 py-6 text-sm text-red-600" role="alert">
            {listError}
          </p>
        )}

        {!listLoading && !listError && consultations.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-600">
            No hay consultas. Crea una nueva arriba para abrir el espacio clínico.
          </p>
        )}

        {!listLoading && !listError && consultations.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {consultations.map((consultation) => (
              <li key={consultation.id}>
                <Link
                  href={`/panel/consultas/${consultation.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {displayPatient(consultation.patient)}
                    </p>
                    <p className="truncate text-sm text-slate-600">
                      {consultation.chiefComplaint ?? consultation.reason ?? "Sin motivo registrado"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="capitalize">{consultation.status?.toLowerCase() ?? "pending"}</p>
                    <p>{formatDate(consultation.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
