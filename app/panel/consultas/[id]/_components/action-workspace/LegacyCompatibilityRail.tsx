"use client";

import { ClinicalStatusBadge } from "@/components/clinical/design";
import { OrdersOverview } from "../orders/OrdersOverview";
import { useClinicalActionWorkspace } from "./ClinicalActionWorkspaceProvider";

export interface LegacyCompatibilityRailProps {
  patientId: string;
  consultationId: string;
  refreshKey?: number;
}

export function LegacyCompatibilityRail({
  patientId,
  consultationId,
  refreshKey = 0,
}: LegacyCompatibilityRailProps) {
  const { openModule } = useClinicalActionWorkspace();

  return (
    <section
      aria-label="Resumen de órdenes"
      className="clinical-depth-secondary min-w-0 space-y-hd-2"
      data-testid="legacy-compatibility-rail"
    >
      <OrdersOverview
        patientId={patientId}
        consultationId={consultationId}
        refreshKey={refreshKey}
      />
      <div className="rounded-hd-md border border-dashed border-hd-border-subtle bg-hd-surface-muted/40 px-hd-2 py-hd-2">
        <p className="text-[10px] leading-relaxed text-slate-500">
          Legacy Compatibility Rail™ — solo resumen. Formularios y paneles
          completos en Clinical Module Sheet™.
        </p>
        <button
          type="button"
          onClick={() => openModule("orders")}
          className="clinical-interactive mt-hd-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
        >
          Abrir bandeja completa
          <ClinicalStatusBadge status="active" label="Sheet" className="w-fit" />
        </button>
      </div>
    </section>
  );
}
