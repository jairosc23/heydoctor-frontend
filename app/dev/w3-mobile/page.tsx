"use client";

import { W3MobileWorkspace } from "@/components/hcx/intelligence/mobile";
import { isW3MobileEnabled } from "@/lib/w3/flags";

export default function W3MobileDevPage() {
  const enabled = isW3MobileEnabled();
  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-mobile-disabled">
          Define <code>NEXT_PUBLIC_W3_MOBILE=true</code>.
        </p>
      </main>
    );
  }
  return (
    <main style={{ padding: 16, fontFamily: "system-ui" }}>
      <W3MobileWorkspace
        enabled
        sessionState="active"
        cacheCount={2}
        pendingSyncCount={1}
        message="Demo mobile — offline read cache. Sync requires validation."
      />
    </main>
  );
}
