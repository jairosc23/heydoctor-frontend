import { HcxText } from "@/components/hcx/primitive";
import { HcxConnectivityBanner } from "@/components/hcx/context/HcxConnectivityBanner";
import type { HcxConnectivityState } from "@/components/hcx/context/HcxConnectivityBanner";
import type { W3MountCapability } from "@/lib/w3/types";

export type W3DenseMountLayoutProps = {
  mounts: W3MountCapability[];
  maturityEnabled: boolean;
  /** Parent-supplied — must remain visible when maturity ON. */
  connectivityState?: HcxConnectivityState;
  unboundVisible?: boolean;
};

/**
 * WP-01 dense mount layout. Density metadata only.
 * Preserves unbound/offline chrome; no Confirm/Emit controls.
 */
export function W3DenseMountLayout({
  mounts,
  maturityEnabled,
  connectivityState = "online",
  unboundVisible = true,
}: W3DenseMountLayoutProps) {
  const density = maturityEnabled ? "compact" : "baseline";

  return (
    <div
      data-testid="w3-dense-mount-layout"
      data-density={density}
      data-maturity={maturityEnabled ? "on" : "off"}
    >
      <HcxConnectivityBanner state={connectivityState} />
      {unboundVisible ? (
        <div data-testid="w3-unbound-indicator" role="status">
          <HcxText>
            Contexto clínico: el indicador de unbound/offline permanece visible.
            La madurez del workspace no oculta fail-closed.
          </HcxText>
        </div>
      ) : null}
      <ul data-testid="w3-mount-list">
        {mounts
          .filter((m) => m.visible)
          .map((m) => (
            <li key={m.kind} data-mount-kind={m.kind}>
              <HcxText>
                {m.slotLabel} · {m.densityHint}
              </HcxText>
            </li>
          ))}
      </ul>
    </div>
  );
}
