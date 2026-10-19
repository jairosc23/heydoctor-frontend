import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CLINIC_REGISTER_COPY,
  PENDING_CLINIC_RETURN_PATH,
  buildOwnClinicRegisterBody,
  buildOwnClinicResendBody,
  clinicRegisterError,
  clinicRegisterFailureMessage,
  pendingClinicLoginHref,
  readClinicVerificationStatus,
} from "./clinic-registration";

describe("own clinic registration client", () => {
  it("sends only the new clinic fields", () => {
    const body = buildOwnClinicRegisterBody({
      clinicName: " Clínica Sintética ",
      email: "Owner@example.com",
      password: "synthetic-1",
    });
    assert.deepEqual(body, {
      clinicName: "Clínica Sintética",
      email: "owner@example.com",
      password: "synthetic-1",
    });
    assert.equal("clinicId" in body, false);
    assert.equal("role" in body, false);
  });

  it("maps duplicate, rejection, and rate limit in es and en", () => {
    assert.equal(clinicRegisterError(409, "es"), CLINIC_REGISTER_COPY.es.duplicate);
    assert.equal(clinicRegisterError(409, "en"), CLINIC_REGISTER_COPY.en.duplicate);
    assert.equal(clinicRegisterError(403, "es"), CLINIC_REGISTER_COPY.es.rejected);
    assert.equal(clinicRegisterError(429, "en"), CLINIC_REGISTER_COPY.en.limited);
    assert.equal(clinicRegisterError(500, "es"), null);
  });

  it("does not treat a missing verification flag as sent", () => {
    assert.equal(readClinicVerificationStatus({ emailVerification: "pending" }), "pending");
    assert.equal(readClinicVerificationStatus({ emailVerification: "failed" }), "failed");
    assert.equal(readClinicVerificationStatus({ emailVerification: "sent" }), "failed");
    assert.equal(readClinicVerificationStatus({}), "failed");
    assert.equal(
      readClinicVerificationStatus({
        emailVerification: "pending",
        access_token: "session-field",
        csrfToken: "session-field",
      }),
      "pending",
    );
  });

  it("keeps resend and the next step outside clinical operations", () => {
    const resend = buildOwnClinicResendBody(" Owner@example.com ");
    assert.deepEqual(resend, { email: "owner@example.com" });
    assert.equal("clinicId" in resend, false);
    const href = pendingClinicLoginHref();
    assert.equal(href.includes("/panel"), false);
    assert.equal(href.includes("token"), false);
    assert.match(href, /^\/login\?redirect=/);
    assert.equal(decodeURIComponent(href.split("redirect=")[1]), PENDING_CLINIC_RETURN_PATH);
    assert.equal(clinicRegisterFailureMessage(500, "es"), CLINIC_REGISTER_COPY.es.network);
    assert.equal(clinicRegisterFailureMessage(422, "en"), CLINIC_REGISTER_COPY.en.rejected);
    assert.equal(CLINIC_REGISTER_COPY.es.pendingBody.includes("enviado"), false);
    assert.equal(CLINIC_REGISTER_COPY.en.pendingBody.toLowerCase().includes("email sent"), false);
  });

  it("states that commercial activation stays off", () => {
    assert.match(CLINIC_REGISTER_COPY.es.pendingBody, /activación comercial/);
    assert.match(CLINIC_REGISTER_COPY.en.pendingBody, /commercial activation/);
    assert.match(CLINIC_REGISTER_COPY.es.pendingBody, /telemedicina/);
    assert.match(CLINIC_REGISTER_COPY.en.intro, /existing clinic/);
  });
});
