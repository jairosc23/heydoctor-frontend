import Link from "next/link";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const FONT = "Montserrat, sans-serif";

const SKIP_CLASS =
  "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-hd-surface-chrome focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primaryDark focus:ring-2 focus:ring-primary";

export function HdSkipLink({
  href = "#contenido-principal",
  label = "Saltar al contenido",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <a href={href} className={SKIP_CLASS}>
      {label}
    </a>
  );
}

export function HdPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary/70">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className="text-2xl font-bold tracking-tight text-primary sm:text-3xl"
        style={{ fontFamily: FONT }}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-primaryDark/70">{description}</p>
      ) : null}
    </header>
  );
}

export function HdSkeleton({
  rows = 3,
  testId,
  rowClassName,
}: {
  rows?: number;
  testId?: string;
  rowClassName?: string;
}) {
  return (
    <div
      className="space-y-3"
      data-testid={testId}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Cargando"
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className={cn(
            "h-20 animate-pulse rounded-2xl border border-hd-border-subtle bg-hd-surface-base",
            rowClassName,
          )}
        />
      ))}
    </div>
  );
}

export function HdErrorState({
  message,
  children,
  className,
  id,
  testId,
}: {
  message?: string;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  testId?: string;
}) {
  return (
    <div
      id={id}
      data-testid={testId}
      role="alert"
      className={cn(
        "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950",
        className,
      )}
    >
      {children ?? message}
    </div>
  );
}

export function HdEmptyState({
  title,
  description,
  href,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  href?: string;
  action?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-hd-border-subtle bg-hd-surface-raised px-4 py-8 text-center",
        className,
      )}
    >
      <p className="text-sm font-semibold text-primaryDark">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-primaryDark/60">{description}</p>
      ) : null}
      {children}
      {href && action ? (
        <Button href={href} variant="secondary" className="mt-4 px-4 py-2 text-sm">
          {action}
        </Button>
      ) : null}
    </div>
  );
}

export function HdSection({
  title,
  children,
  empty,
  emptyLabel = "Aún no hay información.",
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
  emptyLabel?: string;
}) {
  return (
    <section className="rounded-2xl border border-hd-border-subtle bg-hd-surface-raised px-4 py-4">
      <h2
        className="mb-3 text-lg font-semibold text-primaryDark"
        style={{ fontFamily: FONT }}
      >
        {title}
      </h2>
      {empty ? (
        <p className="text-sm text-primaryDark/60">{emptyLabel}</p>
      ) : (
        children
      )}
    </section>
  );
}

export function HdNavLink({
  href,
  children,
  active,
  className,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

export type HdStatusTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

const STATUS_TONE_CLASS: Record<HdStatusTone, string> = {
  neutral:
    "bg-hd-surface-muted text-primaryDark/80",
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-950",
  danger: "bg-rose-100 text-rose-900",
  info: "bg-sky-100 text-sky-900",
};

export function HdStatusBadge({
  label,
  tone = "neutral",
  title,
}: {
  label: string;
  tone?: HdStatusTone;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
        STATUS_TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}
