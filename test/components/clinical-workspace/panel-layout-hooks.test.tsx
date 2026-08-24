import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PanelLayout from "@/components/PanelLayout";

vi.mock("next/link", () => import("@/test/mocks/next-link"));

vi.mock("next/navigation", () => ({
  usePathname: () => "/panel/consultas",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/components/branding", () => ({
  BrandLogo: () => <div data-testid="brand-logo" />,
}));

const auth = vi.hoisted(() => ({
  loading: true,
  isAuthenticated: false,
  logout: vi.fn(),
  refreshUser: vi.fn(async () => undefined),
  user: null as null | { email: string; role: string; id: string },
}));

vi.mock("@/lib/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: auth.isAuthenticated,
    logout: auth.logout,
    refreshUser: auth.refreshUser,
    loading: auth.loading,
    user: auth.user,
  }),
}));

describe("INC-002 SPR1-BLOCKER-02 PanelLayout hooks", () => {
  it("survives authLoading true → false without React #310", () => {
    auth.loading = true;
    auth.isAuthenticated = false;
    auth.user = null;

    const { rerender } = render(
      <PanelLayout>
        <p>consultas</p>
      </PanelLayout>,
    );
    expect(screen.queryByTestId("panel-logout")).not.toBeInTheDocument();

    auth.loading = false;
    auth.isAuthenticated = true;
    auth.user = { email: "qa@heydoctor.health", role: "doctor", id: "qa-1" };

    rerender(
      <PanelLayout>
        <p>consultas</p>
      </PanelLayout>,
    );
    expect(screen.getByTestId("panel-logout")).toBeInTheDocument();
    expect(screen.getByTestId("panel-sidebar")).toBeInTheDocument();
    expect(screen.getByText("consultas")).toBeInTheDocument();
  });
});
