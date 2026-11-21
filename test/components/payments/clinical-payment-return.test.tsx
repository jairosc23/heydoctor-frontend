import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClinicalPaymentReturnPage from "@/app/payments/return/page";
import { createPaymentSession, fetchConsultationPaymentStatus, fetchPaymentRecord } from "@/lib/services/payments";

const mocks = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(),
  auth: { loading: false, user: { id: "doctor-qa", clinicId: "clinic-qa", role: "doctor" } as { id: string; clinicId: string; role: string } | null },
}));
vi.mock("@/lib/heydoctor-api", () => ({ heydoctorApi: { get: mocks.get, post: mocks.post } }));
vi.mock("@/lib/context/AuthContext", () => ({ useAuth: () => mocks.auth }));

const id = "abbbbbbb-1111-4111-8111-111111111111";
const other = "bbbbbbbb-2222-4222-8222-222222222222";
const row = (status: string, paymentId = id) => ({ paymentId, status, amount: 15000, currency: "CLP" });
function fragment(hash: string) {
  window.history.replaceState(null, "", `/payments/return${hash}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

beforeEach(() => {
  mocks.get.mockReset(); mocks.post.mockReset();
  mocks.auth.loading = false;
  mocks.auth.user = { id: "doctor-qa", clinicId: "clinic-qa", role: "doctor" };
  window.history.replaceState(null, "", `/payments/return#${id}`);
});

describe("clinical payment services integration boundary", () => {
  it("uses the canonical consultation endpoints and sends only consultationId", async () => {
    mocks.post.mockResolvedValue({ paymentId: id, paymentUrl: "https://checkout.stripe.com/test" });
    mocks.get.mockResolvedValue({ isPaid: false, hasPending: true, hasFailed: false });
    await createPaymentSession(other);
    await fetchConsultationPaymentStatus(other);
    expect(mocks.post).toHaveBeenCalledWith("/payments/create-payment-session", { consultationId: other });
    expect(mocks.get).toHaveBeenCalledWith(`/payments/consultation/${other}/payment-status`);
  });
  it("reads the owned transaction through the existing authenticated API", async () => {
    mocks.get.mockResolvedValue(row("paid"));
    expect(await fetchPaymentRecord(id)).toEqual({ paymentId: id, status: "paid" });
    expect(mocks.get).toHaveBeenCalledWith(`/payments/intents/${id}`);
    expect(mocks.post).not.toHaveBeenCalled();
    await expect(fetchPaymentRecord("../paid")).rejects.toThrow();
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });
});

describe("clinical payment return UI and persisted-state integration", () => {
  it.each([
    ["pending", "Pago pendiente"], ["paid", "Pago aprobado"],
    ["failed", "Pago rechazado"], ["cancelled", "Pago cancelado"], ["expired", "Pago vencido"],
  ])("renders %s only from the authenticated persisted response", async (status, title) => {
    mocks.get.mockResolvedValue(row(status));
    render(<ClinicalPaymentReturnPage />);
    expect(await screen.findByRole("heading", { name: title })).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith(`/payments/intents/${id}`);
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("never requests or renders payment data before authentication", async () => {
    mocks.auth.user = null;
    render(<ClinicalPaymentReturnPage />);
    expect(await screen.findByRole("heading", { name: "Inicia sesión para verificar el pago" })).toBeInTheDocument();
    expect(mocks.get).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", `/login?redirect=${encodeURIComponent(`/payments/return#${id}`)}`);
  });
  it("waits for auth hydration, then reads using the authenticated service", async () => {
    mocks.auth.loading = true;
    mocks.get.mockResolvedValue(row("pending"));
    const view = render(<ClinicalPaymentReturnPage />);
    expect(mocks.get).not.toHaveBeenCalled();
    mocks.auth.loading = false;
    view.rerender(<ClinicalPaymentReturnPage />);
    expect(await screen.findByText("Pago pendiente")).toBeInTheDocument();
  });
  it.each(["", "#payment=success", `#${id}&status=paid`])("rejects an invalid fragment %s without an API request", async (hash) => {
    window.history.replaceState(null, "", `/payments/return?payment=success${hash}`);
    render(<ClinicalPaymentReturnPage />);
    expect(await screen.findByText("Referencia de pago no válida")).toBeInTheDocument();
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("ignores forged success/lock query parameters; pending remains pending", async () => {
    window.history.replaceState(null, "", `/payments/return?payment=success&status=locked#${id}`);
    mocks.get.mockResolvedValue(row("pending"));
    render(<ClinicalPaymentReturnPage />);
    expect(await screen.findByText("Pago pendiente")).toBeInTheDocument();
    expect(screen.queryByText("Pago aprobado")).not.toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("cannot reverse a persisted approval or unlock a consultation through URL parameters", async () => {
    window.history.replaceState(null, "", `/payments/return?status=draft&payment=failed&unlock=true#${id}`);
    mocks.get.mockResolvedValue(row("paid"));
    render(<ClinicalPaymentReturnPage />);
    expect(await screen.findByText("Pago aprobado")).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });
  it.each([401, 403, 404, 500])("fails closed on HTTP %s without leaking server details", async (status) => {
    mocks.get.mockRejectedValue({ status, message: "sensitive backend details" });
    render(<ClinicalPaymentReturnPage />);
    expect(await screen.findByText("No pudimos verificar el pago")).toBeInTheDocument();
    expect(screen.queryByText(/sensitive backend/)).not.toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("rejects a mismatched transaction and unknown states", async () => {
    mocks.get.mockResolvedValue(row("paid", other));
    render(<ClinicalPaymentReturnPage />);
    expect(await screen.findByText("No pudimos verificar el pago")).toBeInTheDocument();
  });
  it("supports explicit refresh from pending to persisted approved without mutations", async () => {
    mocks.get.mockResolvedValueOnce(row("pending")).mockResolvedValueOnce(row("paid"));
    render(<ClinicalPaymentReturnPage />);
    await screen.findByText("Pago pendiente");
    fireEvent.click(screen.getByRole("button", { name: "Actualizar estado" }));
    expect(await screen.findByText("Pago aprobado")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledTimes(2);
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("does not apply an old approval after changing the transaction fragment", async () => {
    const first = deferred<ReturnType<typeof row>>();
    mocks.get.mockReturnValueOnce(first.promise).mockResolvedValueOnce(row("pending", other));
    render(<ClinicalPaymentReturnPage />);
    await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(1));
    act(() => fragment(`#${other}`));
    await screen.findByText("Pago pendiente");
    await act(async () => first.resolve(row("paid")));
    expect(screen.queryByText("Pago aprobado")).not.toBeInTheDocument();
    expect(screen.getByText("Pago pendiente")).toBeInTheDocument();
  });
  it("does not expose a late result after logout or account switch", async () => {
    const first = deferred<ReturnType<typeof row>>();
    mocks.get.mockReturnValueOnce(first.promise).mockRejectedValueOnce({ status: 403 });
    const view = render(<ClinicalPaymentReturnPage />);
    await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(1));
    mocks.auth.user = null;
    view.rerender(<ClinicalPaymentReturnPage />);
    await act(async () => first.resolve(row("paid")));
    expect(screen.queryByText("Pago aprobado")).not.toBeInTheDocument();
    mocks.auth.user = { id: "other-doctor", clinicId: "other-clinic", role: "doctor" };
    view.rerender(<ClinicalPaymentReturnPage />);
    expect(await screen.findByText("No pudimos verificar el pago")).toBeInTheDocument();
  });
});
