"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatInClinic } from "@/lib/agenda/calendar-utils";
import {
  emptyReminderPolicyForm,
  formatOffsetLabel,
  OFFSET_PRESETS,
  policyToFormState,
  REMINDER_CHANNEL_OPTIONS,
  REMINDER_TYPE_OPTIONS,
  reminderStatusLabel,
  validateReminderPolicyForm,
  type ReminderPolicyFormState,
} from "@/lib/agenda/reminder-policy-form";
import { useAuth } from "@/lib/context/AuthContext";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  createReminderPolicy,
  deleteReminder,
  deleteReminderPolicy,
  updateReminder,
  updateReminderPolicy,
  type AppointmentReminder,
  type ReminderPolicy,
} from "@/lib/services/appointments";
import { cn } from "@/lib/utils";

type DoctorOption = { id: string; label: string };

type Props = {
  policies: ReminderPolicy[] | undefined;
  reminders: AppointmentReminder[] | undefined;
  isLoading: boolean;
  isError: boolean;
  clinicTimezone: string;
  clinicId?: string;
  doctorOptions: DoctorOption[];
  defaultDoctorId?: string;
  canManage: boolean;
};

async function invalidateRemindersRelated(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "reminder-policies"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "reminders"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "list"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "waitlist"],
  });
  await queryClient.invalidateQueries({
    queryKey: ["appointments", "availability-enterprise"],
  });
}

export function AgendaRemindersPanel({
  policies,
  reminders,
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
  const [editing, setEditing] = useState<ReminderPolicy | null>(null);
  const [form, setForm] = useState<ReminderPolicyFormState>(() =>
    emptyReminderPolicyForm(defaultDoctorId),
  );
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const createMut = useMutation({
    mutationFn: createReminderPolicy,
    onSuccess: async () => {
      await invalidateRemindersRelated(queryClient);
      closeForm();
    },
  });
  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateReminderPolicy>[1];
    }) => updateReminderPolicy(id, payload),
    onSuccess: async () => {
      await invalidateRemindersRelated(queryClient);
      closeForm();
    },
  });
  const deletePolicyMut = useMutation({
    mutationFn: deleteReminderPolicy,
    onSuccess: async () => {
      await invalidateRemindersRelated(queryClient);
    },
  });
  const togglePolicyMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateReminderPolicy(id, { isActive }),
    onSuccess: async () => {
      await invalidateRemindersRelated(queryClient);
    },
  });
  const toggleReminderMut = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "scheduled" | "skipped";
    }) => updateReminder(id, { status }),
    onSuccess: async () => {
      await invalidateRemindersRelated(queryClient);
    },
  });
  const deleteReminderMut = useMutation({
    mutationFn: deleteReminder,
    onSuccess: async () => {
      await invalidateRemindersRelated(queryClient);
    },
  });

  const busy =
    createMut.isPending ||
    updateMut.isPending ||
    deletePolicyMut.isPending ||
    togglePolicyMut.isPending ||
    toggleReminderMut.isPending ||
    deleteReminderMut.isPending;
  const mutationError =
    createMut.error ||
    updateMut.error ||
    deletePolicyMut.error ||
    togglePolicyMut.error ||
    toggleReminderMut.error ||
    deleteReminderMut.error;

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormErrors([]);
    setForm(emptyReminderPolicyForm(defaultDoctorId));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyReminderPolicyForm(defaultDoctorId));
    setFormErrors([]);
    setFormOpen(true);
  };

  const openEdit = (policy: ReminderPolicy) => {
    setEditing(policy);
    setForm(policyToFormState(policy));
    setFormErrors([]);
    setFormOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateReminderPolicyForm(form, {
      requireDoctorId: isAdmin,
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
          type: validated.payload.type,
          channel: validated.payload.channel,
          offsetMinutes: validated.payload.offsetMinutes,
          anchor: validated.payload.anchor,
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
          Recordatorios
        </p>
        <p className="mt-1">
          Seleccione un profesional (admin) para gestionar recordatorios.
        </p>
      </section>
    );
  }

  return (
    <section
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
      aria-label="Recordatorios enterprise"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Recordatorios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            SSOT · /appointments/reminders
            {clinicId ? ` · clínica ${clinicId.slice(0, 8)}…` : ""}
            {" · sin envío real (solo configuración y estado)"}
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={busy}
          className="rounded-lg border-0 bg-primary px-3 py-2 text-sm shadow-none hover:bg-primaryMid hover:scale-100"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva configuración
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando recordatorios…</p>
      ) : isError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300">
          No se pudieron cargar los recordatorios.
        </p>
      ) : (
        <>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Configuración (anticipaciones)
            </h3>
            {!policies?.length ? (
              <p className="text-sm text-slate-500">Sin políticas configuradas.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {policies.map((policy) => (
                  <li
                    key={policy.id}
                    className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {REMINDER_TYPE_OPTIONS.find((t) => t.id === policy.type)
                          ?.label ?? policy.type}
                        {" · "}
                        {formatOffsetLabel(policy.offsetMinutes)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {REMINDER_CHANNEL_OPTIONS.find(
                          (c) => c.id === policy.channel,
                        )?.label ?? policy.channel}
                        {" · "}
                        {policy.doctorId
                          ? `Médico ${policy.doctorId.slice(0, 8)}…`
                          : "Toda la clínica"}
                        {" · "}
                        <span
                          className={
                            policy.isActive
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-slate-500"
                          }
                        >
                          {policy.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          togglePolicyMut.mutate({
                            id: policy.id,
                            isActive: !policy.isActive,
                          })
                        }
                        className={cn(
                          "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                          policy.isActive
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800"
                            : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40",
                        )}
                      >
                        {policy.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        type="button"
                        aria-label="Editar política"
                        disabled={busy}
                        onClick={() => openEdit(policy)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Eliminar política"
                        disabled={busy}
                        onClick={() => {
                          if (
                            typeof window !== "undefined" &&
                            window.confirm("¿Eliminar esta configuración?")
                          ) {
                            deletePolicyMut.mutate(policy.id);
                          }
                        }}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Programados en el rango
            </h3>
            {!reminders?.length ? (
              <p className="text-sm text-slate-500">
                Sin recordatorios programados en el rango visible.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {reminders.map((reminder) => {
                  const pending = reminder.status === "scheduled";
                  const toggleable =
                    reminder.status === "scheduled" ||
                    reminder.status === "skipped";
                  return (
                    <li
                      key={reminder.id}
                      className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 text-sm">
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {REMINDER_TYPE_OPTIONS.find(
                            (t) => t.id === reminder.type,
                          )?.label ?? reminder.type}
                          {" · "}
                          {formatInClinic(
                            reminder.scheduledFor,
                            clinicTimezone,
                            "EEE d MMM HH:mm",
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {REMINDER_CHANNEL_OPTIONS.find(
                            (c) => c.id === reminder.channel,
                          )?.label ?? reminder.channel}
                          {" · "}
                          {formatOffsetLabel(reminder.offsetMinutes ?? 0)}
                          {" · Cita "}
                          {reminder.appointmentId.slice(0, 8)}…
                          {" · "}
                          <span
                            className={
                              pending
                                ? "font-semibold text-amber-700 dark:text-amber-300"
                                : "text-slate-500"
                            }
                          >
                            {reminderStatusLabel(reminder.status)}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {toggleable ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              toggleReminderMut.mutate({
                                id: reminder.id,
                                status: pending ? "skipped" : "scheduled",
                              })
                            }
                            className={cn(
                              "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                              pending
                                ? "bg-slate-100 text-slate-700 dark:bg-slate-800"
                                : "bg-amber-100 text-amber-900 dark:bg-amber-900/40",
                            )}
                          >
                            {pending ? "Desactivar" : "Reactivar"}
                          </button>
                        ) : null}
                        {reminder.status !== "sent" ? (
                          <button
                            type="button"
                            aria-label="Eliminar recordatorio"
                            disabled={busy}
                            onClick={() => {
                              if (
                                typeof window !== "undefined" &&
                                window.confirm(
                                  "¿Eliminar este recordatorio programado?",
                                )
                              ) {
                                deleteReminderMut.mutate(reminder.id);
                              }
                            }}
                            className="rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      {mutationError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
          {getApiErrorMessage(
            mutationError,
            "Error al guardar recordatorios",
          )}
        </p>
      ) : null}

      {formOpen ? (
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-600 dark:bg-slate-950/40"
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {editing ? "Editar configuración" : "Nueva configuración"}
          </p>

          <div className="flex flex-wrap gap-2">
            {OFFSET_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    offsetAmount: preset.amount,
                    offsetUnit: preset.unit,
                    beforeAnchor: preset.before,
                    anchor:
                      preset.before || preset.amount === 0
                        ? "starts_at"
                        : "ends_at",
                    type:
                      preset.amount === 0
                        ? "confirmation"
                        : !preset.before
                          ? "follow_up"
                          : preset.amount === 2 && preset.unit === "hours"
                            ? "no_show_risk"
                            : "upcoming",
                  }))
                }
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Tipo
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as ReminderPolicyFormState["type"],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              >
                {REMINDER_TYPE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Canal
              <select
                value={form.channel}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    channel: e.target
                      .value as ReminderPolicyFormState["channel"],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              >
                {REMINDER_CHANNEL_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Anticipación
              <input
                type="number"
                min={0}
                value={form.offsetAmount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    offsetAmount: Number(e.target.value) || 0,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Unidad
              <select
                value={form.offsetUnit}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    offsetUnit: e.target.value as "minutes" | "hours",
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              >
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
              </select>
            </label>
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Dirección
              <select
                value={form.beforeAnchor ? "before" : "after"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    beforeAnchor: e.target.value === "before",
                    anchor:
                      e.target.value === "after" ? "ends_at" : "starts_at",
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              >
                <option value="before">Antes</option>
                <option value="after">Después</option>
              </select>
            </label>
          </div>

          {isAdmin ? (
            <>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.clinicWide}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clinicWide: e.target.checked }))
                  }
                />
                Política de toda la clínica
              </label>
              {!form.clinicWide ? (
                <label className="block text-xs text-slate-600 dark:text-slate-300">
                  Profesional
                  <select
                    value={form.doctorId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, doctorId: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
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

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
            />
            Configuración activa
          </label>

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
              {editing ? "Guardar" : "Crear"}
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
