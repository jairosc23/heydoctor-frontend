"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatInClinic } from "@/lib/agenda/calendar-utils";
import {
  emptyWaitlistEntryForm,
  validateWaitlistEntryForm,
  waitlistEntryToFormState,
  waitlistPatientLabel,
  type WaitlistEntryFormState,
} from "@/lib/agenda/waitlist-entry-form";
import { useAuth } from "@/lib/context/AuthContext";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { usePatientsListQuery } from "@/lib/hooks/use-panel-list-queries";
import {
  createWaitlistEntry,
  deleteWaitlistEntry,
  updateWaitlistEntry,
  type WaitlistEntry,
} from "@/lib/services/appointments";
import { formatPatientDisplayName } from "@/lib/services/patients";
import { cn } from "@/lib/utils";

type DoctorOption = { id: string; label: string };

type Props = {
  entries: WaitlistEntry[] | undefined;
  isLoading: boolean;
  isError: boolean;
  clinicTimezone: string;
  clinicId?: string;
  doctorOptions: DoctorOption[];
  defaultDoctorId?: string;
  canManage: boolean;
};

async function invalidateWaitlistRelated(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "waitlist"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "availability-enterprise"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "list"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "reminders"],
  });
}

export function AgendaWaitlistPanel({
  entries,
  isLoading,
  isError,
  clinicTimezone,
  clinicId,
  doctorOptions,
  defaultDoctorId = "",
  canManage,
}: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const { data: patientsData } = usePatientsListQuery(
    { limit: 100 },
    { enabled: canManage },
  );
  const patients = patientsData?.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WaitlistEntry | null>(null);
  const [form, setForm] = useState<WaitlistEntryFormState>(() =>
    emptyWaitlistEntryForm(defaultDoctorId, clinicTimezone),
  );
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const createMut = useMutation({
    mutationFn: createWaitlistEntry,
    onSuccess: async () => {
      await invalidateWaitlistRelated(queryClient);
      closeForm();
    },
  });
  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateWaitlistEntry>[1];
    }) => updateWaitlistEntry(id, payload),
    onSuccess: async () => {
      await invalidateWaitlistRelated(queryClient);
      closeForm();
    },
  });
  const deleteMut = useMutation({
    mutationFn: deleteWaitlistEntry,
    onSuccess: async () => {
      await invalidateWaitlistRelated(queryClient);
    },
  });
  const toggleMut = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "cancelled";
    }) => updateWaitlistEntry(id, { status }),
    onSuccess: async () => {
      await invalidateWaitlistRelated(queryClient);
    },
  });

  const busy =
    createMut.isPending ||
    updateMut.isPending ||
    deleteMut.isPending ||
    toggleMut.isPending;
  const mutationError =
    createMut.error || updateMut.error || deleteMut.error || toggleMut.error;

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormErrors([]);
    setForm(emptyWaitlistEntryForm(defaultDoctorId, clinicTimezone));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyWaitlistEntryForm(defaultDoctorId, clinicTimezone));
    setFormErrors([]);
    setFormOpen(true);
  };

  const openEdit = (entry: WaitlistEntry) => {
    setEditing(entry);
    setForm(waitlistEntryToFormState(entry, clinicTimezone));
    setFormErrors([]);
    setFormOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateWaitlistEntryForm(form, {
      requireDoctorId: isAdmin,
      requirePatientId: !editing,
      clinicTimezone,
    });
    if (!validated.ok || !validated.payload) {
      setFormErrors(validated.errors);
      return;
    }
    setFormErrors([]);
    if (editing) {
      updateMut.mutate({
        id: editing.id,
        payload: {
          preferredFrom: validated.payload.preferredFrom,
          preferredTo: validated.payload.preferredTo,
          reason: validated.payload.reason ?? null,
          priority: validated.payload.priority,
          status: form.statusActive ? "active" : "cancelled",
        },
      });
      return;
    }
    createMut.mutate(validated.payload);
  };

  if (!canManage) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          Lista de espera
        </p>
        <p className="mt-1">
          Seleccione un profesional (admin) para gestionar la lista de espera.
        </p>
      </section>
    );
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
      aria-label="Lista de espera enterprise"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Lista de espera
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SSOT · /appointments/waitlist
            {clinicId ? ` · clínica ${clinicId.slice(0, 8)}…` : ""}
            {" · sync Availability / Slots / Blocks"}
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={busy}
          className="rounded-lg border-0 bg-primary px-3 py-2 text-sm shadow-none hover:bg-primaryMid hover:scale-100"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Agregar paciente
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando lista de espera…</p>
      ) : isError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300">
          No se pudo cargar la lista de espera.
        </p>
      ) : !entries?.length ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sin pacientes en lista de espera para el rango visible.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.map((entry) => {
            const active = entry.status === "active";
            return (
              <li
                key={entry.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {waitlistPatientLabel(entry)}
                    <span className="ml-2 text-xs font-semibold text-slate-500">
                      P{entry.priority}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ventana{" "}
                    {formatInClinic(
                      entry.preferredFrom,
                      clinicTimezone,
                      "EEE yyyy-MM-dd HH:mm",
                    )}{" "}
                    –{" "}
                    {formatInClinic(
                      entry.preferredTo,
                      clinicTimezone,
                      "HH:mm",
                    )}
                    {" · Ingreso "}
                    {formatInClinic(
                      entry.createdAt,
                      clinicTimezone,
                      "d MMM yyyy HH:mm",
                    )}
                    {entry.reason ? ` · ${entry.reason}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs">
                    <span
                      className={
                        active
                          ? "font-semibold text-emerald-700 dark:text-emerald-300"
                          : "text-slate-500"
                      }
                    >
                      {active ? "Activo" : entry.status}
                    </span>
                    {entry.matchingSlotAvailable ? (
                      <span className="ml-2 font-semibold text-amber-700 dark:text-amber-300">
                        Hueco disponible
                        {entry.nextMatchingSlotStartsAt
                          ? ` · ${formatInClinic(
                              entry.nextMatchingSlotStartsAt,
                              clinicTimezone,
                              "EEE HH:mm",
                            )}`
                          : ""}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(entry.status === "active" ||
                    entry.status === "cancelled") && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        toggleMut.mutate({
                          id: entry.id,
                          status: active ? "cancelled" : "active",
                        })
                      }
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                        active
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
                      )}
                    >
                      {active ? "Desactivar" : "Activar"}
                    </button>
                  )}
                  {entry.status !== "promoted" ? (
                    <>
                      <button
                        type="button"
                        aria-label="Editar prioridad"
                        disabled={busy}
                        onClick={() => openEdit(entry)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Eliminar de lista de espera"
                        disabled={busy}
                        onClick={() => {
                          if (
                            typeof window !== "undefined" &&
                            window.confirm(
                              "¿Eliminar este paciente de la lista de espera?",
                            )
                          ) {
                            deleteMut.mutate(entry.id);
                          }
                        }}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {mutationError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
          {getApiErrorMessage(
            mutationError,
            "Error al guardar la lista de espera",
          )}
        </p>
      ) : null}

      {formOpen ? (
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-600 dark:bg-slate-950/40"
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {editing ? "Editar entrada" : "Agregar a lista de espera"}
          </p>

          {!editing ? (
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Paciente
              <select
                value={form.patientId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, patientId: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                required
              >
                <option value="">Seleccionar…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatPatientDisplayName(p)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {isAdmin ? (
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Profesional
              <select
                value={form.doctorId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, doctorId: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                required={!editing}
                disabled={Boolean(editing)}
              >
                <option value="">Seleccionar…</option>
                {doctorOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Ventana desde
              <input
                type="datetime-local"
                value={form.preferredFromLocal}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    preferredFromLocal: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Ventana hasta
              <input
                type="datetime-local"
                value={form.preferredToLocal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, preferredToLocal: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Prioridad (1 = máxima)
              <input
                type="number"
                min={1}
                max={999}
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: Number(e.target.value) || 100,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Motivo de ingreso
              <input
                type="text"
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                maxLength={500}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                placeholder="Opcional"
              />
            </label>
          </div>

          {editing ? (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.statusActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, statusActive: e.target.checked }))
                }
              />
              Entrada activa
            </label>
          ) : null}

          {formErrors.length ? (
            <ul className="list-disc pl-4 text-xs text-rose-700 dark:text-rose-300">
              {formErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={busy}
              className="rounded-lg border-0 bg-primary px-3 py-2 text-sm shadow-none hover:bg-primaryMid hover:scale-100"
            >
              {editing ? "Guardar" : "Agregar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={closeForm}
              className="rounded-lg px-3 py-2 text-sm"
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
