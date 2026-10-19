import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  LOGIN_PATH,
  VERIFICATION_COPY,
  VERIFICATION_PAGE_PATH,
  VERIFY_PATIENT_EMAIL_PATH,
  canSubmitVerification,
  classifyVerifyResponse,
  readVerificationFragment,
  readVerificationToken,
} from "./patient-email-verification";

const TOKEN = "ab".repeat(32);

describe("patient email verification page contract", () => {
  it("accepts only the 64 hex token from the fragment", () => {
    assert.deepEqual(readVerificationToken(null), { view: "missing" });
    assert.deepEqual(readVerificationToken("short"), { view: "invalid" });
    assert.deepEqual(readVerificationFragment(`#token=${TOKEN}`), {
      view: "ready",
      token: TOKEN,
    });
    assert.deepEqual(readVerificationFragment(""), { view: "missing" });
    assert.deepEqual(readVerificationFragment("#token=short"), { view: "invalid" });
    assert.deepEqual(readVerificationFragment(`?token=${TOKEN}`), { view: "missing" });
    const link = new URL(`https://staging-app.heydoctor.health/verificar-correo#token=${TOKEN}`);
    assert.equal(link.search, "");
    assert.equal(link.pathname, VERIFICATION_PAGE_PATH);
    assert.equal(link.hash, `#token=${TOKEN}`);
  });

  it("maps the existing verify responses without inventing a cause", () => {
    assert.equal(classifyVerifyResponse(200, { verified: true }), "success");
    assert.equal(classifyVerifyResponse(200, { verified: false }), "error");
    assert.equal(classifyVerifyResponse(400, { message: "Verification could not be completed" }), "unusable");
    assert.equal(classifyVerifyResponse(500, {}), "error");
    assert.equal(classifyVerifyResponse(0, null), "error");
  });

  it("allows one submit and a retry only after a transport error", () => {
    assert.equal(canSubmitVerification("ready"), true);
    assert.equal(canSubmitVerification("verifying"), false);
    assert.equal(canSubmitVerification("success"), false);
    assert.equal(canSubmitVerification("unusable"), false);
    assert.equal(canSubmitVerification("invalid"), false);
    assert.equal(canSubmitVerification("error"), true);
  });

  it("keeps Spanish and English copy distinct and free of clinical claims", () => {
    assert.notEqual(VERIFICATION_COPY.es.success.title, VERIFICATION_COPY.en.success.title);
    assert.match(VERIFICATION_COPY.es.unusable.body, /venció/);
    assert.match(VERIFICATION_COPY.en.unusable.body, /expired/);
    assert.match(VERIFICATION_COPY.es.success.body, /no completa un reclamo ni una reserva/);
    const blob = JSON.stringify(VERIFICATION_COPY);
    assert.equal(blob.includes(TOKEN), false);
    assert.equal(/diagnos|receta|historia/i.test(blob), false);
  });

  it("points success to login and does not hardcode a production host", () => {
    const page = readFileSync(
      new URL("../app/verificar-correo/verify-email-card.tsx", import.meta.url),
      "utf8",
    );
    const route = readFileSync(
      new URL("../app/verificar-correo/page.tsx", import.meta.url),
      "utf8",
    );
    assert.equal(VERIFICATION_PAGE_PATH, "/verificar-correo");
    assert.equal(VERIFY_PATIENT_EMAIL_PATH, "/auth/patient/email/verify");
    assert.equal(LOGIN_PATH, "/login");
    assert.equal(page.includes("localStorage"), false);
    assert.equal(page.includes("document.cookie"), false);
    assert.equal(page.includes("pro-api.heydoctor.health"), false);
    assert.equal(page.includes("app.heydoctor.health"), false);
    assert.equal(page.includes("VERIFY_PATIENT_EMAIL_PATH"), true);
    assert.equal(page.includes("LOGIN_PATH"), true);
    assert.equal(page.includes("history.replaceState"), true);
    assert.equal(page.includes("location.hash"), true);
    assert.equal(page.includes("location.search"), false);
    assert.equal(page.includes("?token="), false);
    assert.equal(route.includes("searchParams"), false);
    assert.equal(route.includes("no-referrer"), true);
    assert.equal(route.includes("index: false"), true);
  });
});
