import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import InvitadoTeleconsultaHashPage from "@/app/teleconsulta/invitado/page";

const { push, guestSession } = vi.hoisted(() => ({
  push: vi.fn(),
  guestSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/components/webrtc/TeleconsultaVideoSession", () => ({
  teleconsultaFullscreenGateShell: { display: "flex" },
  TeleconsultaVideoSession: (props: {
    inviteTokenGate: string;
    mode: string;
    isDoctor: boolean;
  }) => {
    guestSession(props);
    return <div data-testid="guest-session">{props.inviteTokenGate}</div>;
  },
}));

describe("RC12.12 invited teleconsultation entry", () => {
  beforeEach(() => {
    push.mockReset();
    guestSession.mockReset();
    window.history.replaceState(null, "", "/teleconsulta/invitado");
  });

  it("rejects a missing token before mounting WebRTC", async () => {
    render(<InvitadoTeleconsultaHashPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enlace de teleconsulta inválido.",
    );
    expect(guestSession).not.toHaveBeenCalled();
  });

  it("rejects an invalid token without launching the call", async () => {
    window.history.replaceState(null, "", "/teleconsulta/invitado#invalid");
    render(<InvitadoTeleconsultaHashPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enlace de teleconsulta inválido.",
    );
    expect(guestSession).not.toHaveBeenCalled();
  });

  it("passes the fragment token to the established guest gate", async () => {
    const token = "11111111-1111-4111-8111-111111111111";
    window.history.replaceState(
      null,
      "",
      `/teleconsulta/invitado#${token}`,
    );
    render(<InvitadoTeleconsultaHashPage />);
    expect(await screen.findByTestId("guest-session")).toHaveTextContent(token);
    expect(guestSession).toHaveBeenCalledWith(
      expect.objectContaining({
        inviteTokenGate: token,
        mode: "guest",
        isDoctor: false,
      }),
    );
  });
});
