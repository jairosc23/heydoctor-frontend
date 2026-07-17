"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import {
  ensureIanaInOptions,
} from "@/lib/agenda/iana-timezones";
import { buildTimezonePreview } from "@/lib/agenda/timezone-preview";
import { useAuth } from "@/lib/context/AuthContext";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { updateClinicTimezone } from "@/lib/services/clinic";
import { updateMyDoctorProfile } from "@/lib/services/my-doctor-profile";
import type { Appointment } from "@/lib/services/appointments";

type Props = {
  clinicTimezone: string;
  clinicName?: string;
  doctorTimezone: string | null | undefined;
  appointments: Appointment[];
  canEditClinic: boolean;
  canEditDoctor: boolean;
  timezoneSource: "ssot" | "auth" | "browser";
};

async function invalidateAgendaTimezone(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.invalidateQueries({ queryKey: ["clinic", "me"] });
  await queryClient.invalidateQueries({ queryKey: ["doctor-profile"] });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "availability-enterprise"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "schedule-blocks"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "waitlist"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "reminders"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "reminder-policies"],
  });
  await queryClient.invalidateQueries({ queryKey: ["appointments", "list"] });
}

export function AgendaTimezonePanel({
  clinicTimezone,
  clinicName,
  doctorTimezone,
  appointments,
  canEditClinic,
  canEditDoctor,
  timezoneSource,
}: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [clinicDraft, setClinicDraft] = useState(clinicTimezone);
  const [doctorDraft, setDoctorDraft] = useState(doctorTimezone ?? "");
  const [compareTz, setCompareTz] = useState(
    () =>
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Madrid",
  );

  const clinicOptions = useMemo(
    () => ensureIanaInOptions(clinicTimezone),
    [clinicTimezone],
  );
  const compareOptions = useMemo(
    () => ensureIanaInOptions(compareTz),
    [compareTz],
  );

  const patientTimezones = useMemo(() => {
    const set = new Set<string>();
    for (const a of appointments) {
      if (a.patientTimezone) set.add(a.patientTimezone);
    }
    return [...set].sort();
  }, [appointments]);

  const preview = useMemo(
    () =>
      buildTimezonePreview({
        clinicTimezone,
        compareTimezone: compareTz,
      }),
    [clinicTimezone, compareTz],
  );

  const clinicMut = useMutation({
    mutationFn: updateClinicTimezone,
    onSuccess: async () => {
      await invalidateAgendaTimezone(queryClient);
    },
  });
  const doctorMut = useMutation({
    mutationFn: (timezone: string | null) =>
      updateMyDoctorProfile({ timezone }),
    onSuccess: async () => {
      await invalidateAgendaTimezone(queryClient);
    },
  });

  const busy = clinicMut.isPending || doctorMut.isPending;
  const mutationError = clinicMut.error || doctorMut.error;

  return (
    <section
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
      aria-label="Zonas horarias enterprise"
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Zonas horarias
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          SSOT · IANA · /clinic/me
          {clinicName ? ` · ${clinicName}` : ""}
          {" · fuente "}
          {timezoneSource}
          {" · DST vía Intl/date-fns-tz"}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Clínica
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
            {clinicTimezone}
          </p>
          {canEditClinic ? (
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="block min-w-[12rem] flex-1 text-xs text-slate-600">
                Seleccionar IANA
                <select
                  value={clinicDraft}
                  onChange={(e) => setClinicDraft(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                >
                  {clinicOptions.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                disabled={busy || clinicDraft === clinicTimezone}
                onClick={() => clinicMut.mutate(clinicDraft)}
                className="rounded-lg border-0 bg-primary px-3 py-2 text-sm shadow-none hover:bg-primaryMid hover:scale-100"
              >
                Guardar
              </Button>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              Solo admin puede cambiar la timezone de clínica.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Profesional
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
            {doctorTimezone || `Hereda clínica (${clinicTimezone})`}
          </p>
          {canEditDoctor ? (
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="block min-w-[12rem] flex-1 text-xs text-slate-600">
                Override IANA (vacío = heredar)
                <select
                  value={doctorDraft}
                  onChange={(e) => setDoctorDraft(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="">Heredar clínica</option>
                  {clinicOptions.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                disabled={busy}
                onClick={() =>
                  doctorMut.mutate(doctorDraft.trim() ? doctorDraft : null)
                }
                className="rounded-lg border-0 bg-primary px-3 py-2 text-sm shadow-none hover:bg-primaryMid hover:scale-100"
              >
                Guardar
              </Button>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              {user?.role === "admin"
                ? "Seleccione perfil médico para override (doctor)."
                : "Sin permiso de edición."}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Paciente (desde citas del rango)
        </p>
        {patientTimezones.length ? (
          <ul className="mt-1 flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
            {patientTimezones.map((tz) => (
              <li
                key={tz}
                className="rounded-lg bg-white px-2 py-1 dark:bg-slate-900"
              >
                {tz}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-slate-500">
            Sin patientTimezone en citas visibles (se envía con la cita).
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Previsualización equivalente
        </p>
        <label className="mt-2 block text-xs text-slate-600">
          Comparar con
          <select
            value={compareTz}
            onChange={(e) => setCompareTz(e.target.value)}
            className="mt-1 w-full max-w-md rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            {compareOptions.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label}
              </option>
            ))}
          </select>
        </label>
        {preview.ok ? (
          <dl className="mt-2 grid gap-1 text-xs text-slate-700 dark:text-slate-300 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-500">Clínica</dt>
              <dd>
                {preview.clinicLocal} {preview.clinicOffset}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Comparación</dt>
              <dd>
                {preview.compareLocal} {preview.compareOffset}
              </dd>
            </div>
            <p className="sm:col-span-2 text-slate-500">{preview.dstNote}</p>
          </dl>
        ) : (
          <p className="mt-2 text-xs text-rose-700">{preview.errors.join("; ")}</p>
        )}
      </div>

      {mutationError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
          {getApiErrorMessage(mutationError, "Error al guardar timezone")}
        </p>
      ) : null}
    </section>
  );
}
