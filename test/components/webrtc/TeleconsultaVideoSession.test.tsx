import { describe, expect, it, vi, beforeEach } from "vitest";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";
import { renderWithProviders, screen } from "@/test/utils/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const { authState, refreshUser } = vi.hoisted(() => ({
  authState: {
    user: null as { id: string; role: string } | null,
    loading: false,
  },
  refreshUser: vi.fn(async () => undefined),
}));

vi.mock("@/lib/context/AuthContext", () => ({
  useAuth: () => ({
    user: authState.user,
    loading: authState.loading,
    refreshUser,
  }),
}));

vi.mock("@/components/VideoCall", () => ({
  VideoCall: () => <div data-testid="video-call-active" />,
}));

const fetchPublicTeleconsultationByToken = vi.fn();
vi.mock("@/lib/services/public-consultations", () => ({
  fetchPublicTeleconsultationByToken: (...args: unknown[]) =>
    fetchPublicTeleconsultationByToken(...args),
  GuestConsultationError: class GuestConsultationError extends Error {
    status = 404;
  },
}));

vi.mock("@/lib/telemedicine-consent", () => ({
  getTelemedicineConsentStatus: async () => ({ hasConsent: true }),
  postTelemedicineConsent: async () => undefined,
  setTelemedicineConsent: () => undefined,
}));

describe("TeleconsultaVideoSession guest/auth gates", () => {
  beforeEach(() => {
    refreshUser.mockClear();
    fetchPublicTeleconsultationByToken.mockReset();
    authState.user = null;
    authState.loading = false;
  });

  it("does not render a blank/null screen when auth mode has no user", async () => {
    const { container } = renderWithProviders(
      <TeleconsultaVideoSession
        consultationId="93793a01-0000-4000-8000-000000000001"
        roomId="93793a01-0000-4000-8000-000000000001"
        mode="auth"
        isDoctor
      />,
    );
    expect(
      await screen.findByRole("heading", { name: "Sesión requerida" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ir a login/i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("video-call-active")).not.toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
    expect(container.textContent?.trim()).not.toBe("");
  });

  it("keeps authenticated teleconsulta mounting VideoCall", async () => {
    authState.user = { id: "doc-1", role: "doctor" };
    authState.loading = false;
    renderWithProviders(
      <TeleconsultaVideoSession
        consultationId="93793a01-0000-4000-8000-000000000001"
        roomId="93793a01-0000-4000-8000-000000000001"
        mode="auth"
        isDoctor
      />,
    );
    expect(await screen.findByTestId("video-call-active")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Sesión requerida" }),
    ).toBeNull();
  });

  it("mounts the guest call after a valid invitation token", async () => {
    fetchPublicTeleconsultationByToken.mockResolvedValue({
      consultationId: "93793a01-0000-4000-8000-000000000001",
      roomId: "93793a01-0000-4000-8000-000000000001",
      signalingToken: "guest.invite.jwt",
    });
    renderWithProviders(
      <TeleconsultaVideoSession
        inviteTokenGate="11111111-1111-4111-8111-111111111111"
        consultationId=""
        roomId=""
        mode="guest"
        isDoctor={false}
      />,
    );
    expect(await screen.findByTestId("video-call-active")).toBeInTheDocument();
    expect(fetchPublicTeleconsultationByToken).toHaveBeenCalled();
  });
});
