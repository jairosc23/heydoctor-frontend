import { describe, expect, it } from "vitest";
import {
  HcxBreadcrumbs,
  HcxConnectivityBanner,
  HcxContextHeader,
  HcxContextShellGate,
  HcxEmptyContext,
  HcxOfflineBanner,
  HcxWorkspaceStatusBar,
} from "@/components/hcx/context";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isHcxContextShellEnabled } from "@/lib/hcx/flags";

describe("HCX Phase 14 Context & Offline Chrome", () => {
  it("renders context header with environment and session chrome", () => {
    renderWithProviders(
      <HcxContextShellGate enabled>
        <HcxContextHeader environment="staging" sessionLabel="Sesión demo" />
      </HcxContextShellGate>,
    );
    expect(screen.getByTestId("hcx-context-header")).toBeInTheDocument();
    expect(screen.getByTestId("hcx-environment-badge")).toHaveTextContent(
      "staging",
    );
    expect(screen.getByTestId("hcx-session-indicator")).toHaveTextContent(
      "Sesión demo",
    );
    expect(screen.queryByText(/Confirmar|Emitir|HAB|Paciente/i)).toBeNull();
  });

  it("breadcrumbs expose nav landmark and current page", () => {
    renderWithProviders(
      <HcxBreadcrumbs
        items={[
          { id: "a", label: "App" },
          { id: "b", label: "Actual", current: true },
        ]}
      />,
    );
    expect(screen.getByTestId("hcx-breadcrumbs")).toBeInTheDocument();
    expect(screen.getByText("Actual")).toHaveAttribute("aria-current", "page");
  });

  it("offline banner is assertive and connectivity hides when online", () => {
    const { rerender } = renderWithProviders(
      <HcxConnectivityBanner state="online" />,
    );
    expect(screen.queryByTestId("hcx-connectivity-banner")).toBeNull();
    rerender(<HcxConnectivityBanner state="offline" />);
    expect(screen.getByTestId("hcx-connectivity-banner")).toBeInTheDocument();
    renderWithProviders(<HcxOfflineBanner visible />);
    expect(screen.getByTestId("hcx-offline-banner")).toBeInTheDocument();
  });

  it("status bar and empty context are non-clinical", () => {
    renderWithProviders(
      <>
        <HcxEmptyContext />
        <HcxWorkspaceStatusBar syncStatus="synced" />
      </>,
    );
    expect(screen.getByTestId("hcx-empty-context")).toBeInTheDocument();
    expect(screen.getByTestId("hcx-workspace-status-bar")).toBeInTheDocument();
  });

  it("flag defaults off", () => {
    expect(isHcxContextShellEnabled(undefined)).toBe(false);
    expect(isHcxContextShellEnabled("true")).toBe(true);
  });
});
