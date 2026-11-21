import { expect, type Locator, type Page, type Response } from "@playwright/test";
import { preflight, QA, stripeRead, checkoutSessionId, verifySession } from "../../scripts/rc12-stripe-preflight.mjs";
import { gotoConsultation, visibleEncounterSection } from "./encounter";
import { paymentState, clinicalState, observeThenAct } from "../../scripts/rc12-stripe-state.mjs";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const appGet = (response: Response, path: string) => response.request().method() === "GET" &&
  new URL(response.url()).origin === QA.app && new URL(response.url()).pathname === `/hd-api${path}`;

async function body(response: Response) {
  if (!response.ok()) throw new Error(`RC12_API_HTTP_${response.status()}`);
  return response.json();
}

async function cardField(page: Page, label: RegExp): Promise<Locator> {
  let field: Locator | undefined;
  await expect.poll(async () => {
    const candidates: Locator[] = [];
    for (const frame of page.frames()) {
      let origin: string; try { origin = new URL(frame.url()).origin; } catch { continue; }
      if (!["https://checkout.stripe.com", "https://js.stripe.com", "https://hooks.stripe.com"].includes(origin)) continue;
      const matches = frame.getByLabel(label).filter({ visible: true });
      for (const match of await matches.all()) candidates.push(match);
    }
    if (candidates.length > 1) throw new Error("RC12_BLOCKED:ambiguous_checkout_field");
    field = candidates[0]; return candidates.length;
  }, { timeout: 15000, message: "Expected one supported Stripe Test field" }).toBe(1);
  return field!;
}

/** Official hosted Test card only; no Stripe API POST/confirmation or fabricated webhook. */
export async function completeHostedTestCheckout(page: Page, paymentId: string, paymentUrl: string) {
  await preflight(); // Independent effective-runtime/Stripe GET checks immediately before financial UI.
  const id = checkoutSessionId(paymentUrl);
  const session = await stripeRead(`/checkout/sessions/${id}`);
  verifySession(session, paymentId, id);
  if (session.url !== paymentUrl) throw new Error("RC12_BLOCKED:checkout_url_mismatch");
  await page.waitForURL((url) => url.origin === "https://checkout.stripe.com" && url.pathname.includes(id));
  await expect(page.getByText(/test mode|modo de prueba/i).first()).toBeVisible();
  // Standard hosted Checkout accessible fields. A changed/unsupported form fails;
  // no alternate provider, bypass, personal bank data or guessed success fallback.
  const email = page.getByRole("textbox", { name: /^email$|correo electrónico/i });
  if (await email.isVisible() && await email.isEditable()) await email.fill("rc18.doctor@heydoctor.invalid");
  await (await cardField(page, /card number|número de tarjeta/i)).fill("4242424242424242");
  await (await cardField(page, /expiration|expiry|vencimiento|caducidad/i)).fill("12/34");
  await (await cardField(page, /cvc|cvv|security code|código de seguridad/i)).fill("123");
  await (await cardField(page, /cardholder name|name on card|nombre del titular/i)).fill("RC12 Synthetic QA");
  const country = page.getByRole("combobox", { name: /country|país/i });
  if (await country.isVisible()) await country.selectOption("CL");
  const postal = page.getByLabel(/postal|zip/i);
  if (await postal.isVisible()) await postal.fill("2520000");
  // No retry of the financial submit. All return observers are already armed.
  await page.getByRole("button", { name: /^pay\b|^pagar\b/i }).click();
  return id;
}

export async function runStripeP0(page: Page, consultationId: string) {
  await preflight(); // Failure here prevents even creating an app checkout session.
  if (!uuid.test(consultationId)) throw new Error("RC12_BLOCKED:consultation_id");
  await gotoConsultation(page, consultationId);
  await expect(page.getByTestId("encounter-signed-confirmation")).toBeVisible();
  await expect(page.getByTestId("encounter-signed-confirmation")).toHaveAttribute("role", "status");
  const trigger = page.getByTestId("encounter-pay-trigger");
  await expect(trigger).toBeVisible();
  await trigger.click();
  const confirm = page.getByTestId("encounter-payment-panel").getByRole("button", { name: "Confirmar pago", exact: true });
  await expect(confirm).toBeVisible();

  const checkout = page.waitForResponse((r) => r.request().method() === "POST" &&
    new URL(r.url()).origin === QA.app && new URL(r.url()).pathname === "/hd-api/payments/create-payment-session")
    .then(async (r) => {
      const value = await body(r) as { paymentId: string; paymentUrl: string };
      if (!uuid.test(value.paymentId)) throw new Error("RC12_BLOCKED:payment_id");
      checkoutSessionId(value.paymentUrl);
      return value;
    });
  // Register every observer BEFORE the app action. Promise.all owns all
  // rejections, including a failed confirmation, so no detached waiter races.
  const [created, firstResponse, , sessionId] = await observeThenAct([
    () => checkout,
    () => page.waitForResponse(async (r) => {
      if (r.request().method() !== "GET" || !new URL(r.url()).pathname.includes("/payments/intents/")) return false;
      return appGet(r, `/payments/intents/${(await checkout).paymentId}`);
    }, { timeout: 90000 }),
    () => page.waitForURL((url) => url.origin === QA.app && url.pathname === "/payments/return" && uuid.test(url.hash.slice(1)),
      { timeout: 90000, waitUntil: "domcontentloaded" }),
    () => checkout.then((value) => completeHostedTestCheckout(page, value.paymentId, value.paymentUrl)),
  ], () => confirm.click());
  if (new URL(page.url()).hash !== `#${created.paymentId}`) throw new Error("RC12_BLOCKED:return_correlation");
  let payment = await body(firstResponse);
  await expect.poll(async () => {
    if (paymentState(payment, created.paymentId) === "paid") return "paid";
    const refresh = page.getByRole("button", { name: "Actualizar estado", exact: true });
    await expect(refresh).toBeEnabled();
    const [response] = await Promise.all([
      page.waitForResponse((r) => appGet(r, `/payments/intents/${created.paymentId}`)), refresh.click(),
    ]);
    payment = await body(response);
    return paymentState(payment, created.paymentId);
  }, { timeout: 60000, message: "Persisted payment must become PAID" }).toBe("paid");
  verifySession(await stripeRead(`/checkout/sessions/${sessionId}`), created.paymentId, sessionId, true);

  // The outbox is asynchronous. Re-read through the application until the
  // persisted state changes; no SQL, client-side lock, fixed sleep or test retry.
  await expect.poll(async () => {
    const [response] = await Promise.all([
      page.waitForResponse((r) => appGet(r, `/consultations/${consultationId}`)),
      gotoConsultation(page, consultationId),
    ]);
    return clinicalState(await body(response), consultationId);
  }, { timeout: 60000, message: "Outbox must persist SIGNED → LOCKED" }).toBe("locked");
  await expect(page.getByText(/bloqueada|locked|pagada/i)).toBeVisible();
  await visibleEncounterSection(page, "encounter-section-13").scrollIntoViewIfNeeded();
  await expect(page.locator("#soap-treatment")).toBeDisabled();
  await expect(trigger).toHaveCount(0);
  return { paymentId: created.paymentId, consultationId, testMode: true, persistedPayment: "paid", persistedConsultation: "locked" };
}
