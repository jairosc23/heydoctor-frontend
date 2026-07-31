import { describe, expect, it } from "vitest";
import { LiquidClinicalWorkspaceShell } from "@/components/aec1/liquid/LiquidClinicalWorkspaceShell";
import { renderWithProviders, screen } from "@/test/utils/render";

describe("AEC-1 M4 Liquid Clinical Workspace shell", () => {
  it("passthrough when soak OFF preserves ConsultationWorkspace children", () => {
    renderWithProviders(
      <LiquidClinicalWorkspaceShell
        consultationId="c1"
        encounterStatus="in_progress"
        enabled={false}
      >
        <div data-testid="consultation-workspace-child">workspace</div>
      </LiquidClinicalWorkspaceShell>,
    );
    expect(screen.getByTestId("aec1-liquid-passthrough")).toHaveAttribute(
      "data-shell",
      "ConsultationWorkspace",
    );
    expect(screen.getByTestId("consultation-workspace-child")).toBeInTheDocument();
    expect(screen.queryByTestId("aec1-liquid-clinical-workspace")).toBeNull();
  });

  it("wraps work surface with HCX container when soak ON", () => {
    renderWithProviders(
      <LiquidClinicalWorkspaceShell
        consultationId="c1"
        encounterStatus="in_progress"
        role="doctor"
        enabled
      >
        <div data-testid="consultation-workspace-child">workspace</div>
      </LiquidClinicalWorkspaceShell>,
    );
    const root = screen.getByTestId("aec1-liquid-clinical-workspace");
    expect(root).toHaveAttribute("data-shell", "ConsultationWorkspace");
    expect(root).toHaveAttribute("data-no-second-workspace", "true");
    expect(root).toHaveAttribute("data-assist-never-authority", "true");
    expect(root).toHaveAttribute("data-encounter-phase", "active");
    expect(screen.getByTestId("hcx-workspace-container")).toBeInTheDocument();
    expect(screen.getByTestId("aec1-liquid-work-surface")).toHaveTextContent(
      "workspace",
    );
    expect(screen.getByTestId("aec1-liquid-assist-plane")).toHaveAttribute(
      "data-authority",
      "NON_AUTHORITY",
    );
    expect(screen.getByTestId("aec1-liquid-interrupt-lane")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Confirm|Emit|Emitir/i }),
    ).toBeNull();
  });

  it("fail-closed hides assist plane when degraded", () => {
    renderWithProviders(
      <LiquidClinicalWorkspaceShell
        consultationId="c1"
        encounterStatus="in_progress"
        degraded
        enabled
      >
        <span>work</span>
      </LiquidClinicalWorkspaceShell>,
    );
    expect(screen.getByTestId("aec1-liquid-clinical-workspace")).toHaveAttribute(
      "data-encounter-phase",
      "degraded",
    );
    expect(screen.getByTestId("aec1-liquid-assist-plane")).toHaveAttribute(
      "data-disclosure",
      "hidden",
    );
    expect(screen.getByTestId("aec1-liquid-work-surface")).toHaveTextContent(
      "work",
    );
  });

  it("role-aware steward keeps assist secondary landmark", () => {
    renderWithProviders(
      <LiquidClinicalWorkspaceShell
        consultationId="c1"
        encounterStatus="in_progress"
        role="steward"
        enabled
      >
        <span>work</span>
      </LiquidClinicalWorkspaceShell>,
    );
    expect(screen.getByTestId("aec1-liquid-clinical-workspace")).toHaveAttribute(
      "data-role",
      "steward",
    );
    expect(screen.getByTestId("aec1-liquid-assist-plane")).toBeInTheDocument();
  });

  it("exposes accessibility regions for work and assist", () => {
    renderWithProviders(
      <LiquidClinicalWorkspaceShell
        consultationId="c1"
        encounterStatus="active"
        enabled
      >
        <span>work</span>
      </LiquidClinicalWorkspaceShell>,
    );
    expect(
      screen.getByRole("region", { name: /superficie de trabajo clínico/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: /asistencia clínica/i }),
    ).toBeInTheDocument();
  });
});
