import { HcxText } from "../primitive/HcxText";
import { HcxSpacer } from "../primitive/HcxSpacer";
import { HcxBanner } from "../foundation/HcxBanner";

export function HcxEmptyContext({
  title = "Sin contexto de espacio",
  description = "No hay contexto de workspace seleccionado. Esto no es un fallo de Clinical Context COS.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      data-testid="hcx-empty-context"
      style={{
        padding: "var(--hcx-space-6)",
        textAlign: "center",
        border: "1px dashed var(--hcx-color-border-subtle)",
        borderRadius: "var(--hcx-radius-lg)",
      }}
    >
      <HcxText as="h3" variant="section" weight="semibold">
        {title}
      </HcxText>
      <HcxSpacer size={2} />
      <HcxText variant="bodySm" tone="secondary">
        {description}
      </HcxText>
    </div>
  );
}

export function HcxErrorContext({
  title = "Error de experiencia",
  description = "No se pudo cargar el chrome de contexto. Reintenta. No implica autorización clínica.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div data-testid="hcx-error-context">
      <HcxBanner title={title} tone="critical" live="assertive">
        {description}
      </HcxBanner>
    </div>
  );
}
