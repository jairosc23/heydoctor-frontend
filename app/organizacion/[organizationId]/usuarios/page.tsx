import { OrganizationWorkspace } from "@/components/organizations/organization-workspace";

export default async function OrganizationUsersPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return (
    <OrganizationWorkspace organizationId={organizationId} section="usuarios" />
  );
}
