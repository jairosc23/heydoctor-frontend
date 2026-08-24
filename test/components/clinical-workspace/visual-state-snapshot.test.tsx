import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useVisualWorkspaceState } from "@/lib/clinical-workspace/use-visual-workspace-state";
import {
  dismissAll,
  getVisualWorkspaceState,
  present,
} from "@/lib/clinical-workspace/foundation/overlay-manager";
import PanelLayout from "@/components/PanelLayout";

vi.mock("next/link", () => import("@/test/mocks/next-link"));

vi.mock("next/navigation", () => ({
  usePathname: () => "/panel/consultas",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/lib/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    logout: vi.fn(),
    refreshUser: vi.fn(async () => undefined),
    loading: false,
    user: { email: "qa@heydoctor.health", role: "doctor", id: "qa-1" },
  }),
}));

vi.mock("@/components/branding", () => ({
  BrandLogo: () => <div data-testid="brand-logo" />,
}));

function VisualStateProbe() {
  const state = useVisualWorkspaceState();
  return (
    <div data-testid="visual-state-probe">
      {state.mode}:{state.activeSurface ?? "none"}
    </div>
  );
}

describe("INC-001 SPR1-BLOCKER-01 PanelLayout mount", () => {
  afterEach(() => {
    dismissAll();
  });

  it("caches a new snapshot only when the surface changes", () => {
    const idle = getVisualWorkspaceState();
    present({ id: "share", kind: "dialog", blocking: true });
    const open = getVisualWorkspaceState();
    expect(open).not.toBe(idle);
    expect(getVisualWorkspaceState()).toBe(open);
    expect(open).toEqual({ mode: "dialog", activeSurface: "share" });
    dismissAll();
    const idleAgain = getVisualWorkspaceState();
    expect(idleAgain).toEqual(idle);
    expect(getVisualWorkspaceState()).toBe(idleAgain);
    expect(idleAgain).not.toBe(open);
  });

  it("useVisualWorkspaceState completes without React #185", () => {
    render(<VisualStateProbe />);
    expect(screen.getByTestId("visual-state-probe")).toHaveTextContent(
      "frame:none",
    );
  });

  it("PanelLayout completes the first authenticated render", () => {
    render(
      <PanelLayout>
        <p>consultas</p>
      </PanelLayout>,
    );
    expect(screen.getByTestId("panel-logout")).toBeInTheDocument();
    expect(screen.getByTestId("panel-sidebar")).toBeInTheDocument();
    expect(screen.getByText("consultas")).toBeInTheDocument();
  });
});
