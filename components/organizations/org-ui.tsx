import {
  HdErrorState,
  HdNavLink,
  HdPageHeader,
  HdSection,
  HdSkeleton,
} from "@/components/ui/HdFeedback";
import { cn } from "@/lib/utils";

export function OrgPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <HdPageHeader
      eyebrow="Multi-Clinic"
      title={title}
      description={description}
    />
  );
}

export function OrgSkeleton() {
  return (
    <HdSkeleton rows={4} testId="org-skeleton" rowClassName="h-24" />
  );
}

export function OrgErrorState({ message }: { message: string }) {
  return <HdErrorState message={message} />;
}

export function OrgSection({
  title,
  children,
  empty,
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <HdSection title={title} empty={empty}>
      {children}
    </HdSection>
  );
}

export function isOrgNavActive(
  currentPath: string | undefined,
  href: string,
  organizationId: string,
): boolean {
  if (!currentPath) return false;
  const dashboard = `/organizacion/${organizationId}`;
  if (href === dashboard) return currentPath === dashboard;
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function OrgNav({
  organizationId,
  currentPath,
}: {
  organizationId: string;
  currentPath?: string;
}) {
  const items = [
    { href: `/organizacion/${organizationId}`, label: "Dashboard" },
    { href: `/organizacion/${organizationId}/clinicas`, label: "Clínicas" },
    { href: `/organizacion/${organizationId}/usuarios`, label: "Usuarios" },
    { href: `/organizacion/${organizationId}/equipos`, label: "Equipos" },
    {
      href: `/organizacion/${organizationId}/configuracion`,
      label: "Configuración",
    },
  ];
  return (
    <nav
      className="mb-6 flex gap-2 overflow-x-auto pb-1"
      aria-label="Organización"
    >
      {items.map((item) => {
        const active = isOrgNavActive(currentPath, item.href, organizationId);
        return (
          <HdNavLink
            key={item.href}
            href={item.href}
            active={active}
            className={cn(
              "shrink-0 rounded-xl border px-3 py-1.5 text-sm font-semibold no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              active
                ? "border-primary bg-primaryLight text-primary"
                : "border-hd-border-subtle bg-hd-surface-raised text-primary hover:bg-hd-surface-base",
            )}
          >
            {item.label}
          </HdNavLink>
        );
      })}
    </nav>
  );
}
