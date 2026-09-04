"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import { useMyOrganizationsQuery } from "@/lib/hooks/use-organization-queries";
import { myOrganizationsQueryKey } from "@/lib/queries/query-keys";
import { createOrganization } from "@/lib/services/organizations";
import { OrgErrorState, OrgPageHeader, OrgSection, OrgSkeleton } from "./org-ui";

export function OrganizationHome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useMyOrganizationsQuery();
  const orgs = query.data ?? null;
  const [actionError, setActionError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const queryError =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "No se pudieron cargar las organizaciones"
        : null;
  const error = actionError ?? queryError;

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      const created = await createOrganization({ name: name.trim() });
      await queryClient.invalidateQueries({ queryKey: myOrganizationsQueryKey() });
      router.push(`/organizacion/${created.id}`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No se pudo crear la organización",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!orgs && !error) return <OrgSkeleton />;

  return (
    <div className="mx-auto max-w-3xl">
      <OrgPageHeader
        title="Organización"
        description="Opera varias clínicas sobre la misma instancia, respetando clinicId y RBAC."
      />
      {error ? (
        <div className="mb-4">
          <OrgErrorState message={error} />
        </div>
      ) : null}

      <OrgSection title="Tus organizaciones" empty={orgs?.length === 0}>
        <ul className="space-y-2">
          {orgs?.map((org) => (
            <li key={org.id}>
              <button
                type="button"
                onClick={() => router.push(`/organizacion/${org.id}`)}
                className="w-full rounded-xl border border-hd-border-subtle bg-hd-surface-base px-3 py-3 text-left"
              >
                <p className="font-semibold text-primaryDark">{org.name}</p>
                <p className="text-xs text-primaryDark/60">
                  {org.clinicCount} clínicas · rol {org.role}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </OrgSection>

      <OrgSection title="Crear organización">
        <form onSubmit={onCreate} className="space-y-3">
          <label className="block text-sm text-primaryDark">
            Nombre
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
              className="mt-1 w-full rounded-xl border border-hd-border-subtle px-3 py-2 text-sm"
            />
          </label>
          <Button type="submit" disabled={saving || name.trim().length < 2}>
            {saving ? "Creando…" : "Crear desde mi clínica"}
          </Button>
        </form>
      </OrgSection>
    </div>
  );
}
