"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatInClinic } from "@/lib/agenda/calendar-utils";
import {
  blockToFormState,
  emptyScheduleBlockForm,
  validateScheduleBlockForm,
  type ScheduleBlockFormState,
} from "@/lib/agenda/schedule-block-form";
import { useAuth } from "@/lib/context/AuthContext";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  createScheduleBlock,
  deleteScheduleBlock,
  updateScheduleBlock,
  type ScheduleBlock,
} from "@/lib/services/appointments-availability";
import { cn } from "@/lib/utils";

type DoctorOption = { id: string; label: string };

type Props = {
  blocks: ScheduleBlock[] | undefined;
  isLoading: boolean;
  isError: boolean;
  clinicTimezone: string;
  clinicId?: string;
  doctorOptions: DoctorOption[];
  defaultDoctorId?: string;
  canManage: boolean;
};

export function AgendaBlocksPanel({
  blocks,
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
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleBlock | null>(null);
  const [form, setForm] = useState<ScheduleBlockFormState>(() =>
    emptyScheduleBlockForm(defaultDoctorId, clinicTimezone),
  );
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["appointments", "schedule-blocks"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["appointments", "availability-enterprise"],
    });
  };

  const createMut = useMutation({
    mutationFn: createScheduleBlock,
    onSuccess: async () => {
      await invalidate();
      closeForm();
    },
  });
  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateScheduleBlock>[1];
    }) => updateScheduleBlock(id, payload),
    onSuccess: async () => {
      await invalidate();
      closeForm();
    },
  });
  const deleteMut = useMutation({
    mutationFn: deleteScheduleBlock,
    onSuccess: async () => {
      await invalidate();
    },
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateScheduleBlock(id, { isActive }),
    onSuccess: async () => {
      await invalidate();
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
    setForm(emptyScheduleBlockForm(defaultDoctorId, clinicTimezone));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyScheduleBlockForm(defaultDoctorId, clinicTimezone));
    setFormErrors([]);
    setFormOpen(true);
  };

  const openEdit = (block: ScheduleBlock) => {
    setEditing(block);
    setForm(blockToFormState(block, clinicTimezone));
    setFormErrors([]);
    setFormOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateScheduleBlockForm(form, {
      requireDoctorId: isAdmin,
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
          startsAt: validated.payload.startsAt,
          endsAt: validated.payload.endsAt,
          reason: validated.payload.reason ?? null,
          isActive: validated.payload.isActive,
          doctorId: form.clinicWide
            ? null
            : (validated.payload.doctorId ?? form.doctorId ?? null),
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
          Bloques de agenda
        </p>
        <p className="mt-1">
          Seleccione un profesional (admin) para gestionar bloqueos, o cree
          bloqueos de clínica.
        </p>
      </section>
    );
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
      aria-label="Bloques de agenda enterprise"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Bloques de agenda
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SSOT · /appointments/blocks
            {clinicId ? ` · clínica ${clinicId.slice(0, 8)}…` : ""}
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={busy}
          className="rounded-lg border-0 bg-primary px-3 py-2 text-sm shadow-none hover:bg-primaryMid hover:scale-100"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo bloque
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando bloques…</p>
      ) : isError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300">
          No se pudieron cargar los bloques.
        </p>
      ) : !blocks?.length ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sin bloques en el rango visible.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {blocks.map((block) => (
            <li
              key={block.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {formatInClinic(
                    block.startsAt,
                    clinicTimezone,
                    "EEE d MMM HH:mm",
                  )}{" "}
                  –{" "}
                  {formatInClinic(block.endsAt, clinicTimezone, "HH:mm")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {block.doctorId
                    ? `Médico ${block.doctorId.slice(0, 8)}…`
                    : "Toda la clínica"}
                  {block.reason ? ` · ${block.reason}` : ""}
                  {" · "}
                  <span
                    className={
                      block.isActive !== false
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-slate-500"
                    }
                  >
                    {block.isActive !== false ? "Activo" : "Inactivo"}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    toggleMut.mutate({
                      id: block.id,
                      isActive: !(block.isActive !== false),
                    })
                  }
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                    block.isActive !== false
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      : "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
                  )}
                >
                  {block.isActive !== false ? "Desactivar" : "Activar"}
                </button>
                <button
                  type="button"
                  aria-label="Editar bloque"
                  disabled={busy}
                  onClick={() => openEdit(block)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Eliminar bloque"
                  disabled={busy}
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm("¿Eliminar este bloque de agenda?")
                    ) {
                      deleteMut.mutate(block.id);
                    }
                  }}
                  className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {mutationError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
          {getApiErrorMessage(mutationError, "Error al guardar el bloque")}
        </p>
      ) : null}

      {formOpen ? (
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-600 dark:bg-slate-950/40"
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {editing ? "Editar bloque" : "Nuevo bloque"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, mode: "range" }))}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold",
                form.mode === "range"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800",
              )}
            >
              Rango horario
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, mode: "full_day" }))}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold",
                form.mode === "full_day"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800",
              )}
            >
              Día completo
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {form.mode === "full_day" ? (
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
                Día
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                  value={form.dayDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dayDate: e.target.value }))
                  }
                />
              </label>
            ) : (
              <>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Inicio
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    value={form.startsLocal}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startsLocal: e.target.value }))
                    }
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Fin
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    value={form.endsLocal}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endsLocal: e.target.value }))
                    }
                  />
                </label>
              </>
            )}
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
              Motivo
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                placeholder="Ej. vacaciones, junta clínica…"
              />
            </label>
            {isAdmin ? (
              <>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.clinicWide}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        clinicWide: e.target.checked,
                      }))
                    }
                  />
                  Bloqueo de toda la clínica
                </label>
                {!form.clinicWide ? (
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
                    Médico
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                      value={form.doctorId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, doctorId: e.target.value }))
                      }
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
              </>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Bloque activo
            </label>
          </div>
          {formErrors.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-rose-700 dark:text-rose-300">
              {formErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          ) : null}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy}
              className="rounded-lg border-0 bg-primary px-3 py-2 text-sm shadow-none hover:scale-100"
            >
              {busy
                ? "Guardando…"
                : editing
                  ? "Guardar cambios"
                  : "Crear bloque"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={closeForm}
              className="rounded-lg px-3 py-2 text-sm hover:scale-100"
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
