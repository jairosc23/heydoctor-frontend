import test from "node:test";
import assert from "node:assert/strict";
import {
  extractTotpSecretFromOtpauth,
  formatTotpSecretForDisplay,
  isMfaPendingOutcome,
  parseAuthLoginPayload,
} from "./auth-mfa";
import {
  clearMfaPendingState,
  getMfaPendingState,
  getMfaPendingToken,
  setMfaPendingState,
} from "./auth-mfa-pending-memory";

test("parseAuthLoginPayload returns mfa_pending without an access token", () => {
  const parsed = parseAuthLoginPayload({
    kind: "mfa_pending",
    mfa_pending_token: " pending.jwt.token ",
    mfaEnrolled: false,
    user: { id: "u1", email: "doc@clinic.test", role: "doctor" },
  });
  assert.equal(parsed.outcome.kind, "mfa_pending");
  assert.equal(parsed.accessToken, null);
  assert.equal(parsed.pendingToken, "pending.jwt.token");
  if (parsed.outcome.kind === "mfa_pending") {
    assert.equal(parsed.outcome.mfaEnrolled, false);
  }
});

test("parseAuthLoginPayload keeps PATIENT session login as a session", () => {
  const parsed = parseAuthLoginPayload({
    user: { id: "p1", email: "pat@clinic.test", role: "patient" },
    access_token: "session-jwt",
    csrfToken: "csrf",
  });
  assert.equal(parsed.outcome.kind, "session");
  assert.equal(parsed.accessToken, "session-jwt");
  assert.equal(parsed.pendingToken, null);
  assert.equal(isMfaPendingOutcome(parsed.outcome), false);
});

test("parseAuthLoginPayload rejects a pending payload without token", () => {
  assert.throws(
    () =>
      parseAuthLoginPayload({
        kind: "mfa_pending",
        mfaEnrolled: true,
        user: { id: "u1", email: "doc@clinic.test", role: "admin" },
      }),
    /Respuesta MFA inválida/,
  );
});

test("extractTotpSecretFromOtpauth reads the manual secret", () => {
  const uri =
    "otpauth://totp/HeyDoctor:doc%40clinic.test?secret=JBSWY3DPEHPK3PXP&issuer=HeyDoctor&algorithm=SHA1&digits=6&period=30";
  assert.equal(extractTotpSecretFromOtpauth(uri), "JBSWY3DPEHPK3PXP");
  assert.equal(
    formatTotpSecretForDisplay("JBSWY3DPEHPK3PXP"),
    "JBSW Y3DP EHPK 3PXP",
  );
  assert.equal(extractTotpSecretFromOtpauth("https://evil.example/x"), null);
});

test("MFA pending state stays in RAM and never writes localStorage", () => {
  const writes: string[] = [];
  const original = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      setItem(key: string) {
        writes.push(key);
      },
      getItem() {
        return null;
      },
      removeItem() {},
      clear() {},
    },
  });
  try {
    setMfaPendingState({
      token: "pending.jwt.token",
      mfaEnrolled: true,
      user: { id: "u1", email: "doc@clinic.test", name: "Doc" },
    });
    assert.equal(getMfaPendingToken(), "pending.jwt.token");
    clearMfaPendingState();
    assert.equal(getMfaPendingState(), null);
    assert.deepEqual(writes, []);
  } finally {
    if (original === undefined) {
      // @ts-expect-error test cleanup
      delete globalThis.localStorage;
    } else {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: original,
      });
    }
  }
});
