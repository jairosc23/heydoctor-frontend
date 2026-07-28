import { describe, expect, it } from "vitest";
import {
  W3DenseMountLayout,
  W3WorkspaceMaturityGate,
} from "@/components/hcx/intelligence/workspace";
import { renderWithProviders, screen } from "@/test/utils/render";
import {
  isW3AssistEnabled,
  isW3WorkspaceEnabled,
} from "@/lib/w3/flags";
import { isW3AuthorityEnvelope } from "@/lib/w3/types";

describe("W3 WP-01 Foundation + Workspace maturity", () => {
  it("FE flags default off", () => {
    expect(isW3WorkspaceEnabled(undefined)).toBe(false);
    expect(isW3AssistEnabled(undefined)).toBe(false);
    expect(isW3WorkspaceEnabled("true")).toBe(true);
  });

  it("authority envelope helper rejects authority claims", () => {
    expect(
      isW3AuthorityEnvelope({
        isAuthority: false,
        mayConfirm: false,
        mayEmit: false,
        mayReady: false,
      }),
    ).toBe(true);
    expect(
      isW3AuthorityEnvelope({
        isAuthority: true,
        mayConfirm: false,
        mayEmit: false,
        mayReady: false,
      }),
    ).toBe(false);
  });

  it("maturity gate respects enabled override", () => {
    renderWithProviders(
      <W3WorkspaceMaturityGate enabled={false} fallback={<span>off</span>}>
        <span>on</span>
      </W3WorkspaceMaturityGate>,
    );
    expect(screen.getByText("off")).toBeInTheDocument();
  });

  it("dense layout keeps unbound indicator and has no Confirm/Emit CTAs", () => {
    renderWithProviders(
      <W3WorkspaceMaturityGate enabled>
        <W3DenseMountLayout
          mounts={[
            {
              kind: "orientation",
              visible: true,
              densityHint: "compact",
              slotLabel: "Orientation",
            },
          ]}
          maturityEnabled
          connectivityState="offline"
          unboundVisible
        />
      </W3WorkspaceMaturityGate>,
    );
    expect(screen.getByTestId("w3-unbound-indicator")).toBeInTheDocument();
    expect(screen.getByTestId("hcx-connectivity-banner")).toBeInTheDocument();
    expect(screen.queryByText(/Confirmar|Emitir|Authorize/i)).toBeNull();
  });
});
