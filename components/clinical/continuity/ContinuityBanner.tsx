"use client";

import type { ContinuityContext } from "@/lib/continuity-platform/types";
import type { ContinuityPanelError } from "./continuity-panel.types";

export type ContinuityBannerModel = {
  versionUnsupported?: boolean;
  softError?: ContinuityPanelError | null;
  truncatedTimeline?: boolean;
  omittedHintCount?: number;
};

export function bannersFromContext(
  context: ContinuityContext | null,
  softError: ContinuityPanelError | null,
  blockingError: ContinuityPanelError | null,
): ContinuityBannerModel {
  return {
    versionUnsupported: blockingError?.code === "version_unsupported",
    softError: softError ?? null,
    truncatedTimeline: context?.assemblyNotes?.truncatedTimeline === true,
    omittedHintCount: context?.assemblyNotes?.omittedHintCount ?? 0,
  };
}

/** Stable priority: version → soft refresh → truncated → omitted hints */
export function ContinuityBanner({ model }: { model: ContinuityBannerModel }) {
  const items: string[] = [];
  if (model.versionUnsupported) {
    items.push(
      "Versión de Continuity Context no soportada. Actualice el cliente o contacte soporte.",
    );
  }
  if (model.softError) {
    items.push("No se pudo actualizar Continuity. Se muestra la última carga.");
  }
  if (model.truncatedTimeline) {
    items.push("La línea de tiempo está truncada para este contexto.");
  }
  if ((model.omittedHintCount ?? 0) > 0) {
    items.push(
      `${model.omittedHintCount} sugerencia(s) de continuidad omitida(s) por límite.`,
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="space-y-1.5" data-testid="continuity-banners">
      {items.map((text) => (
        <div
          key={text}
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          role="status"
        >
          {text}
        </div>
      ))}
    </div>
  );
}
