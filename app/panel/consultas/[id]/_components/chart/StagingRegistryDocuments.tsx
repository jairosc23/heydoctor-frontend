"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  listStagingRegistryForConsultation,
  type StagingRegistryMetadata,
} from "@/lib/clinical-documents/registry-staging";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

type LoadState = "idle" | "loading" | "ready" | "error";

export function StagingRegistryDocuments({
  consultationId,
}: {
  consultationId?: string | null;
}) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<StagingRegistryMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!consultationId) {
      setItems([]);
      setError(null);
      setState("ready");
      return;
    }
    setState("loading");
    setError(null);
    try {
      setItems(await listStagingRegistryForConsultation(consultationId));
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(err, "No se pudieron cargar los metadatos del registry."),
      );
      setState("error");
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ClinicalEncounterSection
      sectionNumber={21}
      title="Clinical Documents"
      id="encounter-section-21"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Metadatos del registry. Preview y PDF permanecen ocultos en este host.
      </p>
      {state === "loading" ? (
        <div data-testid="staging-registry-skeleton" aria-busy="true" />
      ) : null}
      {state === "error" ? (
        <p role="alert" data-testid="staging-registry-error">
          {error}
        </p>
      ) : null}
      {state === "ready" && items.length === 0 ? (
        <p data-testid="staging-registry-empty">
          No hay documentos publicados para esta consulta.
        </p>
      ) : null}
      {state === "ready" && items.length > 0 ? (
        <ul data-testid="staging-registry-list">
          {items.map((item) => (
            <li key={item.id} data-testid={`staging-registry-${item.id}`}>
              <h4>{item.title}</h4>
              <p>
                {item.status} · v{item.currentVersion} · {item.signatureStatus}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </ClinicalEncounterSection>
  );
}
