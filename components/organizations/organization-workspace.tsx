"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import { useOrganizationDashboardQuery } from "@/lib/hooks/use-organization-queries";
import { organizationDashboardQueryKey } from "@/lib/queries/query-keys";
import {
  acceptOrganizationClinic,
  createOrganizationGroup,
  inviteOrganizationClinic,
  updateOrganizationSettings,
  upsertOrganizationMember,
  type OrganizationDashboard,
} from "@/lib/services/organizations";
import {
  OrgErrorState,
  OrgNav,
  OrgPageHeader,
  OrgSection,
  OrgSkeleton,
} from "./org-ui";

type Section = "dashboard" | "clinicas" | "usuarios" | "equipos" | "configuracion";

export function OrganizationWorkspace({
  organizationId,
  section,
}: {
  organizationId: string;
  section: Section;
}) {
  const queryClient = useQueryClient();
  const query = useOrganizationDashboardQuery(organizationId);
  const data = query.data ?? null;
  const [settingsDraft, setSettingsDraft] =
    useState<OrganizationDashboard["settings"] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const settings = settingsDraft ?? data?.settings ?? null;
  const queryError =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "No se pudo cargar la organización"
        : null;
  const error = actionError ?? queryError;
  const currentPath = `/organizacion/${organizationId}${
    section === "dashboard" ? "" : `/${section}`
  }`;

  async function run(action: () => Promise<unknown>) {
    setSaving(true);
    setActionError(null);
    try {
      await action();
      await queryClient.invalidateQueries({
        queryKey: organizationDashboardQueryKey(organizationId),
      });
      setSettingsDraft(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!data && !error) return <OrgSkeleton />;

  return (
    <div className="mx-auto max-w-3xl">
      <OrgPageHeader
        title={data?.organization.name ?? "Organización"}
        description="Directorio multi-clínica, equipos compartidos y métricas agregadas."
      />
      <OrgNav organizationId={organizationId} currentPath={currentPath} />
      {error ? (
        <div className="mb-4">
          <OrgErrorState message={error} />
        </div>
      ) : null}

      {data && section === "dashboard" ? (
        <div className="space-y-4">
          <OrgSection title="Dashboard">
            <dl className="grid grid-cols-2 gap-3 text-sm text-primaryDark">
              <div>
                <dt className="text-xs uppercase text-primaryDark/50">Clínicas</dt>
                <dd className="font-semibold">{data.metrics.clinics}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-primaryDark/50">Consultas</dt>
                <dd className="font-semibold">{data.metrics.consultationsCompleted}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-primaryDark/50">Ingresos netos</dt>
                <dd className="font-semibold">{data.metrics.recognizedRevenue.net}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-primaryDark/50">Plataforma</dt>
                <dd className="font-semibold">{data.platform.status}</dd>
              </div>
            </dl>
          </OrgSection>
          <OrgSection title="Permisos cross-clinic">
            <p className="text-sm text-primaryDark">
              Rol {data.permissions.role}. Alcance:{" "}
              {data.permissions.accessibleClinicIds.length} clínicas.
            </p>
          </OrgSection>
        </div>
      ) : null}

      {data && section === "clinicas" ? (
        <div className="space-y-4">
          <OrgSection title="Directorio" empty={data.directory.length === 0}>
            <ul className="space-y-2">
              {data.directory.map((clinic) => (
                <li
                  key={clinic.clinicId}
                  className="rounded-xl border border-hd-border-subtle bg-hd-surface-base px-3 py-2 text-sm"
                >
                  <p className="font-semibold text-primaryDark">{clinic.name}</p>
                  <p className="text-xs text-primaryDark/60">
                    {clinic.status} · {clinic.timezone}
                    {clinic.groupName ? ` · ${clinic.groupName}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </OrgSection>
          {data.permissions.canManage ? (
            <OrgSection title="Invitar clínica">
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() => inviteOrganizationClinic(organizationId, clinicId.trim()));
                }}
              >
                <input
                  value={clinicId}
                  onChange={(event) => setClinicId(event.target.value)}
                  placeholder="UUID de clínica"
                  className="w-full rounded-xl border border-hd-border-subtle px-3 py-2 text-sm"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    Invitar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving}
                    onClick={() => void run(() => acceptOrganizationClinic(organizationId))}
                  >
                    Aceptar invitación de mi clínica
                  </Button>
                </div>
              </form>
            </OrgSection>
          ) : null}
        </div>
      ) : null}

      {data && section === "usuarios" ? (
        <div className="space-y-4">
          <OrgSection title="Usuarios y staff compartido" empty={data.members.length === 0}>
            <ul className="space-y-2">
              {data.members.map((member) => (
                <li
                  key={member.id}
                  className="rounded-xl border border-hd-border-subtle bg-hd-surface-base px-3 py-2 text-sm"
                >
                  <p className="font-semibold text-primaryDark">{member.name}</p>
                  <p className="text-xs text-primaryDark/60">
                    {member.role} · {member.clinicIds.length} clínicas
                  </p>
                </li>
              ))}
            </ul>
          </OrgSection>
          {data.permissions.canManage ? (
            <OrgSection title="Agregar miembro">
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() =>
                    upsertOrganizationMember(organizationId, {
                      userId: userId.trim(),
                      role: "member",
                    }),
                  );
                }}
              >
                <input
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="UUID de usuario"
                  className="w-full rounded-xl border border-hd-border-subtle px-3 py-2 text-sm"
                  required
                />
                <Button type="submit" disabled={saving}>
                  Agregar
                </Button>
              </form>
            </OrgSection>
          ) : null}
        </div>
      ) : null}

      {data && section === "equipos" ? (
        <div className="space-y-4">
          <OrgSection title="Equipos / grupos" empty={data.groups.length === 0}>
            <ul className="space-y-2">
              {data.groups.map((group) => (
                <li
                  key={group.id}
                  className="rounded-xl border border-hd-border-subtle bg-hd-surface-base px-3 py-2 text-sm text-primaryDark"
                >
                  {group.name} · {group.clinicIds.length} clínicas
                </li>
              ))}
            </ul>
          </OrgSection>
          {data.permissions.canManage ? (
            <OrgSection title="Crear equipo">
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() =>
                    createOrganizationGroup(organizationId, { name: groupName.trim() }),
                  );
                }}
              >
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  minLength={2}
                  required
                  className="w-full rounded-xl border border-hd-border-subtle px-3 py-2 text-sm"
                />
                <Button type="submit" disabled={saving}>
                  Crear equipo
                </Button>
              </form>
            </OrgSection>
          ) : null}
        </div>
      ) : null}

      {data && section === "configuracion" ? (
        <OrgSection title="Configuración">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void run(() =>
                updateOrganizationSettings(organizationId, {
                  allowSharedStaff: settings?.allowSharedStaff ?? data.settings.allowSharedStaff,
                  requireExplicitClinicScope:
                    settings?.requireExplicitClinicScope ??
                    data.settings.requireExplicitClinicScope,
                  timezone: settings?.timezone ?? data.settings.timezone,
                  locale: settings?.locale ?? data.settings.locale,
                }),
              );
            }}
          >
            <p className="text-sm text-primaryDark">
              Zona horaria: {settings?.timezone ?? data.settings.timezone}. Staff
              compartido:{" "}
              {(settings?.allowSharedStaff ?? data.settings.allowSharedStaff)
                ? "sí"
                : "no"}
              .
            </p>
            <label className="flex items-center gap-2 text-sm text-primaryDark">
              <input
                type="checkbox"
                checked={settings?.allowSharedStaff ?? false}
                onChange={(event) =>
                  setSettingsDraft({
                    ...(settings ?? data.settings),
                    allowSharedStaff: event.target.checked,
                  })
                }
              />
              Permitir staff compartido
            </label>
            {data.permissions.canManage ? (
              <Button type="submit" disabled={saving}>
                Guardar
              </Button>
            ) : null}
          </form>
        </OrgSection>
      ) : null}
    </div>
  );
}
