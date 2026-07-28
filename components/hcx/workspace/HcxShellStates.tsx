import { HcxText } from "../primitive/HcxText";
import { HcxSpinner } from "../primitive/HcxSpinner";
import { HcxSpacer } from "../primitive/HcxSpacer";

export function HcxLoadingShell({ label = "Cargando espacio de trabajo" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="hcx-loading-shell"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        padding: "var(--hcx-space-8)",
      }}
    >
      <HcxSpinner label={label} />
      <HcxSpacer size={3} />
      <HcxText variant="bodySm" tone="secondary">
        {label}
      </HcxText>
    </div>
  );
}

export function HcxEmptyShell({
  title = "Sin contenido",
  description = "Este espacio está vacío. El contenido clínico se añadirá en fases posteriores.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      data-testid="hcx-empty-shell"
      style={{
        textAlign: "center",
        padding: "var(--hcx-space-8)",
        border: "1px dashed var(--hcx-color-border-subtle)",
        borderRadius: "var(--hcx-radius-lg)",
        background: "var(--hcx-color-bg-muted)",
      }}
    >
      <HcxText as="h2" variant="section" weight="semibold">
        {title}
      </HcxText>
      <HcxSpacer size={2} />
      <HcxText variant="bodySm" tone="secondary">
        {description}
      </HcxText>
    </div>
  );
}

export function HcxSkeletonShell({ rows = 3 }: { rows?: number }) {
  return (
    <div
      aria-hidden
      data-testid="hcx-skeleton-shell"
      style={{ display: "flex", flexDirection: "column", gap: "var(--hcx-space-3)" }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 14,
            borderRadius: "var(--hcx-radius-sm)",
            background: "var(--hcx-color-neutral-100)",
            width: `${100 - i * 12}%`,
          }}
        />
      ))}
    </div>
  );
}
