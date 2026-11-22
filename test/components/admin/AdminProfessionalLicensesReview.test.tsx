import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminProfessionalLicensesReview } from "@/components/admin/AdminProfessionalLicensesReview";
import { renderWithProviders, screen } from "@/test/utils/render";

const adminUser = { role: "admin", sub: "rc18-admin-qa" };
const useAuth = vi.fn(() => ({ user: adminUser }));
const listClinic = vi.fn();
const verify = vi.fn();

vi.mock("@/lib/context/AuthContext", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/lib/services/professional-licenses", () => ({
  listClinicProfessionalLicenses: (...args: unknown[]) => listClinic(...args),
  verifyProfessionalLicense: (...args: unknown[]) => verify(...args),
}));

const license = {
  id: "e3005c80-863e-4c79-9dfa-5cc732b0f8a7",
  doctorProfileId: "5abc1b5a-59ba-4b78-990b-6f36435bcfa7",
  countryCode: "CL",
  subdivisionCode: null,
  jurisdictionCode: "CL",
  authority: "Synthetic test authority",
  licenseNumber: "SYNTHETIC-RC19-001",
  status: "unverified" as const,
  expiresAt: null,
  verifiedAt: null,
  verifiedBy: null,
};

describe("RC19 admin professional license review", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: adminUser });
    listClinic.mockResolvedValue([license]);
    verify.mockReset();
  });

  it("loads only the authenticated clinic's licenses without mutating them", async () => {
    renderWithProviders(<AdminProfessionalLicensesReview />);
    expect(await screen.findByText(/SYNTHETIC-RC19-001/)).toBeInTheDocument();
    expect(listClinic).toHaveBeenCalledTimes(1);
    expect(verify).not.toHaveBeenCalled();
  });

  it("requires explicit confirmation and verifies exact license ID", async () => {
    verify.mockResolvedValue({
      ...license,
      status: "active",
      verifiedAt: "2026-11-22T00:00:00.000Z",
      verifiedBy: "f83804e7-9357-4f53-a358-f73df1b3a163",
    });
    const confirmation = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user } = renderWithProviders(<AdminProfessionalLicensesReview />);
    await screen.findByText(/SYNTHETIC-RC19-001/);
    await user.click(screen.getByRole("button", { name: "Verificar credencial" }));
    expect(confirmation).toHaveBeenCalledOnce();
    expect(verify).toHaveBeenCalledWith(license.id);
    expect(
      await screen.findByText(/Se confirmó el estado y el administrador/),
    ).toBeInTheDocument();
  });

  it("does not verify a license when the administrator cancels", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = renderWithProviders(<AdminProfessionalLicensesReview />);
    await screen.findByText(/SYNTHETIC-RC19-001/);
    await user.click(screen.getByRole("button", { name: "Verificar credencial" }));
    expect(verify).not.toHaveBeenCalled();
  });

  it("never queries or verifies when the session is not an admin", () => {
    useAuth.mockReturnValue({ user: { role: "doctor", sub: "doctor" } });
    renderWithProviders(<AdminProfessionalLicensesReview />);
    expect(screen.getByRole("alert")).toHaveTextContent("Solo un administrador");
    expect(listClinic).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
  });
});
