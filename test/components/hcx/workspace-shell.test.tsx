import { describe, expect, it } from "vitest";
import {
  HcxApplicationShell,
  HcxEmptyShell,
  HcxSplitView,
  HcxWorkspaceShellGate,
} from "@/components/hcx/workspace";
import { HcxText } from "@/components/hcx/primitive";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isHcxWorkspaceShellEnabled } from "@/lib/hcx/flags";

describe("HCX Phase 13 Workspace Shell", () => {
  it("renders application shell landmarks without clinical verbs", () => {
    renderWithProviders(
      <HcxWorkspaceShellGate enabled>
        <HcxApplicationShell
          title="HeyDoctor"
          navItems={[{ id: "home", label: "Inicio", active: true }]}
        >
          <HcxText>Contenido</HcxText>
        </HcxApplicationShell>
      </HcxWorkspaceShellGate>,
    );
    expect(screen.getByTestId("hcx-application-shell")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
    expect(screen.queryByText(/Confirmar|Emitir|Dispose|Consulta/i)).toBeNull();
  });

  it("split view shows primary and secondary regions", () => {
    renderWithProviders(
      <HcxSplitView
        primary={<span>Primario</span>}
        secondary={<span>Secundario</span>}
      />,
    );
    expect(screen.getByTestId("hcx-split-view")).toBeInTheDocument();
    expect(screen.getByTestId("hcx-split-secondary")).toHaveTextContent(
      "Secundario",
    );
  });

  it("empty shell is non-clinical placeholder", () => {
    renderWithProviders(<HcxEmptyShell />);
    expect(screen.getByTestId("hcx-empty-shell")).toBeInTheDocument();
    expect(screen.getByText(/fases posteriores/i)).toBeInTheDocument();
  });

  it("workspace shell gate respects enabled override", () => {
    renderWithProviders(
      <HcxWorkspaceShellGate enabled={false} fallback={<span>off</span>}>
        <span>on</span>
      </HcxWorkspaceShellGate>,
    );
    expect(screen.getByText("off")).toBeInTheDocument();
  });

  it("flag helper defaults off", () => {
    expect(isHcxWorkspaceShellEnabled(undefined)).toBe(false);
    expect(isHcxWorkspaceShellEnabled("on")).toBe(true);
  });
});
