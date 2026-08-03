import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiquidClinicalWorkspaceShell } from "@/components/aec1/liquid/LiquidClinicalWorkspaceShell";
import * as w5Api from "@/lib/aec1/w5-clinical-steward-api";
import { HEYDOCTOR_COPILOT_COPY } from "@/lib/brand/heydoctor-copilot";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

describe("AEC-1 M4 Liquid Clinical Workspace shell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(w5Api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [],
      code: "W5_FLAG_OR_AUTHORITY_DENIED",
      authorityClass: "NON_AUTHORITY",
      disclaimer: w5Api.W5_CLINICAL_DISCLAIMER,
    });
  });

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

  it("wraps work surface with HCX container when soak ON", async () => {
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
    expect(screen.getByTestId("hcx-workspace-container")).toHaveAttribute(
      "data-hcx-landmark",
      "composition",
    );
    expect(screen.getByTestId("aec1-liquid-work-surface")).toHaveTextContent(
      "workspace",
    );
    expect(screen.getByTestId("aec1-liquid-assist-plane")).toHaveAttribute(
      "data-authority",
      "NON_AUTHORITY",
    );
    expect(screen.getByTestId("aec1-liquid-interrupt-lane")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-advisory-cards")).toBeInTheDocument();
    });
    expect(screen.getByTestId("consultation-workspace-child")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Confirm|Emit|Emitir/i }),
    ).toBeNull();
  });

  it("M5: workspace survives W5 fail-closed and keeps single shell", async () => {
    renderWithProviders(
      <LiquidClinicalWorkspaceShell
        consultationId="c1"
        encounterStatus="in_progress"
        enabled
      >
        <div data-testid="consultation-workspace-child">workspace</div>
      </LiquidClinicalWorkspaceShell>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-state-forbidden")).toBeInTheDocument();
    });
    expect(screen.getByTestId("consultation-workspace-child")).toBeInTheDocument();
    expect(screen.getByTestId("aec1-liquid-clinical-workspace")).toHaveAttribute(
      "data-shell",
      "ConsultationWorkspace",
    );
    expect(screen.getAllByTestId("aec1-liquid-clinical-workspace")).toHaveLength(
      1,
    );
  });

  it("does not nest a second main landmark under PanelLayout main", () => {
    renderWithProviders(
      <main data-testid="panel-layout-main" aria-label="Contenido del panel">
        <LiquidClinicalWorkspaceShell
          consultationId="c1"
          encounterStatus="in_progress"
          enabled
        >
          <div data-testid="consultation-workspace-child">workspace</div>
        </LiquidClinicalWorkspaceShell>
      </main>,
    );
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByTestId("panel-layout-main")).toBeInTheDocument();
    expect(screen.getByTestId("hcx-workspace-container").tagName).toBe("DIV");
    expect(screen.getByTestId("hcx-workspace-container")).not.toHaveAttribute(
      "role",
      "main",
    );
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
      screen.getByRole("complementary", {
        name: HEYDOCTOR_COPILOT_COPY.assistPlaneAria,
      }),
    ).toBeInTheDocument();
  });


  it.each([
    ["desktop", 1280],
    ["tablet", 768],
    ["mobile", 390],
  ] as const)(
    "responsive soak %s keeps work→assist hierarchy and single main",
    (_label, width) => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
      });
      renderWithProviders(
        <main aria-label="Contenido del panel">
          <div
            data-testid="encounter-chrome-shell"
            style={{ position: "sticky", top: 0 }}
          >
            chrome
          </div>
          <LiquidClinicalWorkspaceShell
            consultationId="c1"
            encounterStatus="in_progress"
            enabled
          >
            <div data-testid="consultation-workspace-child">
              clinical work content
            </div>
          </LiquidClinicalWorkspaceShell>
        </main>,
      );
      expect(screen.getAllByRole("main")).toHaveLength(1);
      const work = screen.getByTestId("aec1-liquid-work-surface");
      const assist = screen.getByTestId("aec1-liquid-assist-plane");
      expect(work).toHaveTextContent("clinical work content");
      expect(assist).toHaveAttribute("data-authority", "NON_AUTHORITY");
      expect(
        work.compareDocumentPosition(assist) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(screen.getByTestId("encounter-chrome-shell")).toBeInTheDocument();
      expect(
        screen.queryByTestId("aec1-liquid-passthrough"),
      ).not.toBeInTheDocument();
    },
  );
});
