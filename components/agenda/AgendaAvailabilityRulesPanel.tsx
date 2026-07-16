"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { collectClinicDoctorOptions } from "@/lib/agenda/appointment-display";
import {
  DAY_OF_WEEK_OPTIONS,
  emptyAvailabilityRuleForm,
  ruleToFormState,
  validateAvailabilityRuleForm,
  type AvailabilityRuleFormState,
} from "@/lib/agenda/availability-rule-form";
import { formatMinutesAsClock } from "@/lib/agenda/availability-summary";
import { useAuth } from "@/lib/context/AuthContext";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  useAppointmentsListQuery,
  useConsultationsListQuery,
} from "@/lib/hooks/use-panel-list-queries";
import {
  createAvailabilityRule,
  deleteAvailabilityRule,
  updateAvailabilityRule,
  type DoctorAvailabilityRule,
} from "@/lib/services/appointments-availability";
import { cn } from "@/lib/utils";

type Props = {
  rules: DoctorAvailabilityRule[] | undefined;
  isLoading: boolean;
  isError: boolean;
  canManage: boolean;
};

export function AgendaAvailabilityRulesPanel({
  rules,
  isLoading,
  isError,
  canManage,
}: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DoctorAvailabilityRule | null>(null);
  const [form, setForm] = useState<AvailabilityRuleFormState>(() =>
    emptyAvailabilityRuleForm(),
  );
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const { data: appointmentsData } = useAppointmentsListQuery(
    { limit: 200 },
    { enabled: isAdmin },
  );
  const { data: consultationsData } = useConsultationsListQuery(
    { limit: 100 },
    { enabled: isAdmin },
  );
  const doctorOptions = useMemo(
    () =>
      collectClinicDoctorOptions(
        appointmentsData?.data ?? [],
        (consultationsData?.data ?? [])
          .filter((c) => Boolean(c.doctorId))
          .map((c) => ({ id: c.doctorId as string, label: undefined })),
      ),
    [appointmentsData?.data, consultationsData?.data],
  );

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["appointments", "availability-enterprise"],
    });
  };

  const createMut = useMutation({
    mutationFn: createAvailabilityRule,
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
      payload: Parameters<typeof updateAvailabilityRule>[1];
    }) => updateAvailabilityRule(id, payload),
    onSuccess: async () => {
      await invalidate();
      closeForm();
    },
  });
  const deleteMut = useMutation({
    mutationFn: deleteAvailabilityRule,
    onSuccess: async () => {
      await invalidate();
    },
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateAvailabilityRule(id, { isActive }),
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
    setForm(emptyAvailabilityRuleForm(isAdmin ? "" : (user?.id ?? "")));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyAvailabilityRuleForm(isAdmin ? "" : (user?.id ?? "")));
    setFormErrors([]);
    setFormOpen(true);
  };

  const openEdit = (rule: DoctorAvailabilityRule) => {
    setEditing(rule);
    setForm(ruleToFormState(rule));
    setFormErrors([]);
    setFormOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateAvailabilityRuleForm(form, {
      requireDoctorId: isAdmin && !editing,
    });
    if (!validated.ok || !validated.payload) {
      setFormErrors(validated.errors);
      return;
    }
    setFormErrors([]);
    if (editing) {
      const { doctorId: _doctorId, ...patch } = validated.payload;
      updateMut.mutate({ id: editing.id, payload: patch });
      return;
    }
    createMut.mutate(validated.payload);
  };

  const dayLabel = (dow: number) =>
    DAY_OF_WEEK_OPTIONS.find((d) => d.value === dow)?.label ?? `D${dow}`;

  if (!canManage) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          Reglas de disponibilidad
        </p>
        <p className="mt-1">
          Seleccione un médico (admin) para gestionar reglas enterprise.
        </p>
      </section>
    );
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
      aria-label="Reglas de disponibilidad enterprise"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Reglas de disponibilidad
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SSOT · /appointments/availability/rules
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={busy}
          className="rounded-lg border-0 bg-primary px-3 py-2 text-sm shadow-none hover:bg-primaryMid hover:scale-100"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva regla
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando reglas…</p>
      ) : isError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300">
          No se pudieron cargar las reglas.
        </p>
      ) : !rules?.length ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sin reglas. El backend usa horario fallback 07:00–21:00 hasta que
          cree reglas activas.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {dayLabel(rule.dayOfWeek)}{" "}
                  {formatMinutesAsClock(rule.startMinutes)}–
                  {formatMinutesAsClock(rule.endMinutes)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {rule.effectiveFrom || rule.effectiveUntil
                    ? `Vigencia ${rule.effectiveFrom ?? "…"} → ${rule.effectiveUntil ?? "…"}`
                    : "Sin ventana de vigencia"}
                  {" · "}
                  <span
                    className={
                      rule.isActive
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-500"
                    }
                  >
                    {rule.isActive ? "Activa" : "Inactiva"}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    toggleMut.mutate({
                      id: rule.id,
                      isActive: !rule.isActive,
                    })
                  }
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                    rule.isActive
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
                  )}
                >
                  {rule.isActive ? "Desactivar" : "Activar"}
                </button>
                <button
                  type="button"
                  aria-label="Editar regla"
                  disabled={busy}
                  onClick={() => openEdit(rule)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Eliminar regla"
                  disabled={busy}
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm(
                        "¿Eliminar esta regla de disponibilidad?",
                      )
                    ) {
                      deleteMut.mutate(rule.id);
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
          {getApiErrorMessage(mutationError, "Error al guardar la regla")}
        </p>
      ) : null}

      {formOpen ? (
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-600 dark:bg-slate-950/40"
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {editing ? "Editar regla" : "Nueva regla"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Día
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={form.dayOfWeek}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    dayOfWeek: Number(e.target.value),
                  }))
                }
              >
                {DAY_OF_WEEK_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            {isAdmin && !editing ? (
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
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
                      {d.label ?? d.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div />
            )}
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Inicio
              <input
                type="time"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
              />
            </label>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Fin
              <input
                type="time"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
              />
            </label>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Vigente desde
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={form.effectiveFrom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, effectiveFrom: e.target.value }))
                }
              />
            </label>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Vigente hasta
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={form.effectiveUntil}
                onChange={(e) =>
                  setForm((f) => ({ ...f, effectiveUntil: e.target.value }))
                }
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
            />
            Regla activa
          </label>
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
                  : "Crear regla"}
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
