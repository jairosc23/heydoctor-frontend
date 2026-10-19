"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePatientsListQuery } from "@/lib/hooks/use-panel-list-queries";
import { PATIENTS_LIST_ROOT } from "@/lib/queries/query-keys";
import { PatientIntakeForm } from "@/components/patients/PatientIntakeForm";
import { formatPatientAge, formatPatientDisplayName } from "@/lib/services/patients";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2";

interface PatientItem {
  id: string;
  name?: string;
  displayName?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  age?: string | number | null;
}

export default function PacientesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [showForm, setShowForm] = useState(false);

  const patientsQuery = usePatientsListQuery({
    search: debouncedSearch || undefined,
    limit: 50,
  });

  const patients: PatientItem[] = Array.isArray(patientsQuery.data?.data)
    ? (patientsQuery.data.data as PatientItem[])
    : [];
  const total = patientsQuery.data?.total ?? 0;
  const loading = patientsQuery.isPending;
  const listError = patientsQuery.isError
    ? getApiErrorMessage(
        patientsQuery.error,
        "No se pudo cargar la lista de pacientes.",
      )
    : "";

  async function handlePatientCreated() {
    setShowForm(false);
    await queryClient.invalidateQueries({ queryKey: PATIENTS_LIST_ROOT });
  }

  function displayName(p: PatientItem): string {
    return formatPatientDisplayName(p);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1
          className="m-0 text-2xl font-bold text-primary"
          style={{ fontFamily: FONT_HEADING }}
        >
          Pacientes
        </h1>
        <Button
          type="button"
          variant="primary"
          className={CTA_PRIMARY}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancelar" : "+ Nuevo paciente"}
        </Button>
      </div>

      <p className="m-0 text-primaryDark/70">
        Gestión de pacientes del centro.
      </p>

      {listError ? (
        <p className="mb-0 text-sm text-red-600" role="alert">
          {listError}
        </p>
      ) : null}

      {showForm ? (
        <PatientIntakeForm
          onSuccess={() => void handlePatientCreated()}
          onCancel={() => setShowForm(false)}
        />
      ) : null}

      <Input
        type="search"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md rounded-lg border-hd-border-default"
      />

      {loading ? (
        <p className="text-primaryDark/70">Cargando...</p>
      ) : patients.length === 0 ? (
        <p className="text-primaryDark/70">No hay pacientes.</p>
      ) : (
        <Card className="overflow-hidden p-0 shadow-premium">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-hd-surface-muted">
                  <th className="px-4 py-3 text-xs font-semibold text-primaryDark/60">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-primaryDark/60">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-primaryDark/60">
                    Edad
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-primaryDark/60">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-hd-border-subtle last:border-b-0"
                  >
                    <td className="px-4 py-3 text-primaryDark">{displayName(p)}</td>
                    <td className="px-4 py-3 text-primaryDark/70">
                      {p.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-primaryDark/70">
                      {formatPatientAge(p.age)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/panel/pacientes/${p.id}`)
                          }
                          className="border-0 bg-transparent p-0 text-sm font-semibold text-primary hover:underline"
                        >
                          Ver ficha →
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/panel/consultas?patientId=${p.id}`)
                          }
                          className="border-0 bg-transparent p-0 text-sm font-semibold text-primary hover:underline"
                        >
                          Nueva consulta →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <p className="text-[13px] text-primaryDark/50">Total: {total}</p>
    </div>
  );
}
