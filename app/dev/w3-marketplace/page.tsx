"use client";

import { W3MarketplaceWorkspace } from "@/components/hcx/intelligence/marketplace";
import { isW3MarketplaceEnabled } from "@/lib/w3/flags";

export default function W3MarketplaceDevPage() {
  const enabled = isW3MarketplaceEnabled();
  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-marketplace-disabled">
          Define <code>NEXT_PUBLIC_W3_MARKETPLACE=true</code>.
        </p>
      </main>
    );
  }
  return (
    <main style={{ padding: 16, fontFamily: "system-ui" }}>
      <W3MarketplaceWorkspace
        enabled
        adminMode
        specialties={["general_practice", "cardiology", "pediatrics"]}
        providers={[
          {
            providerId: "prov-gp-1",
            displayName: "Dra. Demo GP",
            specialties: ["general_practice"],
            isAuthority: false,
          },
          {
            providerId: "prov-card-1",
            displayName: "Dr. Demo Cardio",
            specialties: ["cardiology"],
            isAuthority: false,
          },
        ]}
        referralCount={1}
        connectorCount={2}
        message="Demo marketplace — orchestration only. No Confirm / Emit / Orders."
      />
    </main>
  );
}
