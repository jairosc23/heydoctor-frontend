"use client";

import { useEffect, useState } from "react";
import { W3InteropWorkspace } from "@/components/hcx/intelligence/interop";
import { isW3InteropEnabled } from "@/lib/w3/flags";
import {
  mapInteropOpenToHarness,
  w3InteropOpen,
  type InteropHarnessView,
} from "@/lib/w3/interop-api";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; view: InteropHarnessView }
  | { status: "error"; message: string };

/**
 * Wave-4 Theme 2 M3 — durable interop harness.
 * Chrome gated by NEXT_PUBLIC_W3_INTEROP (default OFF).
 * BE remains SoT for flags / clinic / authority envelope.
 * Dev-only route — no production navigation.
 */
export default function W3InteropDevPage() {
  const enabled = isW3InteropEnabled();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const payload = await w3InteropOpen();
        if (cancelled) return;
        setState({
          status: "ready",
          view: mapInteropOpenToHarness(payload),
        });
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : "W3_INTEROP_LOAD_FAILED";
        setState({
          status: "error",
          message:
            msg === "W3_FLAG_OR_CONTEXT_DENIED"
              ? "Backend interop flag OFF or clinic/context denied (fail-closed)."
              : `Interop load failed: ${msg}`,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-interop-disabled">
          Define <code>NEXT_PUBLIC_W3_INTEROP=true</code>.
        </p>
      </main>
    );
  }

  if (state.status === "loading") {
    return (
      <main style={{ padding: 16, fontFamily: "system-ui" }}>
        <p data-testid="w3-interop-loading">Loading durable interop…</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main style={{ padding: 16, fontFamily: "system-ui" }}>
        <p data-testid="w3-interop-error">{state.message}</p>
      </main>
    );
  }

  const { view } = state;
  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      <W3InteropWorkspace
        enabled
        quarantineCount={view.quarantineCount}
        exportCount={view.exportCount}
        connectors={view.connectors}
        message={view.message}
        workspaceId={view.workspaceId}
        persisted={view.persisted}
        quarantineStatuses={view.quarantineStatuses}
        exportStatuses={view.exportStatuses}
      />
      {view.persisted ? (
        <p data-testid="w3-interop-persisted" data-persisted="true">
          persisted
          {view.clinicId ? ` · clinicId=${view.clinicId}` : ""}
        </p>
      ) : null}
    </main>
  );
}
