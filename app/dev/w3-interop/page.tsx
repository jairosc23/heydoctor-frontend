"use client";

import { W3InteropWorkspace } from "@/components/hcx/intelligence/interop";
import { isW3InteropEnabled } from "@/lib/w3/flags";

export default function W3InteropDevPage() {
  const enabled = isW3InteropEnabled();
  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-interop-disabled">
          Define <code>NEXT_PUBLIC_W3_INTEROP=true</code>.
        </p>
      </main>
    );
  }
  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      <W3InteropWorkspace
        enabled
        quarantineCount={1}
        exportCount={1}
        connectors={[
          {
            connectorId: "conn-fhir-demo",
            name: "Demo FHIR Partner",
            ownsCos: false,
          },
        ]}
        message="Demo interop — quarantine only. No HAB bypass."
      />
    </main>
  );
}
