import { describe, expect, it, vi, beforeEach } from "vitest";
import { MfaChallenge } from "@/components/auth/MfaChallenge";
import { renderWithProviders, screen } from "@/test/utils/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,AAA"),
  },
}));

const startMfaEnrollment = vi.fn();
const confirmMfaEnrollment = vi.fn();
const verifyMfaChallenge = vi.fn();

vi.mock("@/lib/auth-mfa-client", () => ({
  startMfaEnrollment: (...args: unknown[]) => startMfaEnrollment(...args),
  confirmMfaEnrollment: (...args: unknown[]) => confirmMfaEnrollment(...args),
  verifyMfaChallenge: (...args: unknown[]) => verifyMfaChallenge(...args),
}));

describe("MfaChallenge", () => {
  beforeEach(() => {
    startMfaEnrollment.mockReset();
    confirmMfaEnrollment.mockReset();
    verifyMfaChallenge.mockReset();
  });

  it("shows TOTP/backup verification for enrolled staff", () => {
    renderWithProviders(
      <MfaChallenge enrolled onAuthenticated={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(
      screen.getByRole("heading", { name: "Verificación en dos pasos" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Código")).toBeInTheDocument();
    expect(startMfaEnrollment).not.toHaveBeenCalled();
  });

  it("requires backup-code acknowledgement before continue", async () => {
    startMfaEnrollment.mockResolvedValue({
      otpauthUri:
        "otpauth://totp/HeyDoctor:doc%40clinic.test?secret=JBSWY3DPEHPK3PXP&issuer=HeyDoctor",
    });
    confirmMfaEnrollment.mockResolvedValue({
      backupCodes: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
    });
    const { user } = renderWithProviders(
      <MfaChallenge
        enrolled={false}
        onAuthenticated={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const totp = await screen.findByLabelText("Código de 6 dígitos");
    await user.type(totp, "123456");
    await user.click(
      screen.getByRole("button", { name: "Confirmar autenticador" }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Guarda tus códigos de respaldo",
      }),
    ).toBeInTheDocument();
    const continueBtn = screen.getByRole("button", { name: "Continuar" });
    expect(continueBtn).toBeDisabled();
    await user.click(
      screen.getByLabelText("He guardado estos códigos en un lugar seguro."),
    );
    expect(continueBtn).toBeEnabled();
  });
});
