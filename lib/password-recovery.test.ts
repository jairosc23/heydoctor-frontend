import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PASSWORD_REQUEST_PATH,
  PASSWORD_RESET_PATH,
  REQUEST_COPY,
  RESET_COPY,
  classifyForgotResponse,
  classifyResetResponse,
  passwordMeetsPolicy,
  readResetFragment,
} from "./password-recovery";

const TOKEN = "ab".repeat(32);

describe("password recovery client", () => {
  it("reads the token only from the hash", () => {
    assert.deepEqual(readResetFragment(`#token=${TOKEN}`), {
      view: "ready",
      token: TOKEN,
    });
    assert.deepEqual(readResetFragment(`?token=${TOKEN}`), { view: "missing" });
    assert.deepEqual(readResetFragment("#token=short"), { view: "invalid" });
  });

  it("treats accepted and reset responses without echoing secrets", () => {
    assert.equal(classifyForgotResponse(202), "accepted");
    assert.equal(classifyForgotResponse(404), "error");
    assert.equal(classifyResetResponse(200, { reset: true }), "success");
    assert.equal(classifyResetResponse(400, {}), "unusable");
    assert.equal(classifyResetResponse(500, { reset: true }), "error");
  });

  it("keeps the existing six-character policy and both languages", () => {
    assert.equal(passwordMeetsPolicy("12345"), false);
    assert.equal(passwordMeetsPolicy("123456"), true);
    assert.equal(REQUEST_COPY.es.acceptedTitle.length > 0, true);
    assert.equal(REQUEST_COPY.en.acceptedTitle.length > 0, true);
    for (const view of Object.keys(RESET_COPY.es)) {
      assert.equal(
        RESET_COPY.en[view as keyof typeof RESET_COPY.en].title.length > 0,
        true,
      );
    }
    assert.equal(PASSWORD_REQUEST_PATH, "/recuperar-contrasena");
    assert.equal(PASSWORD_RESET_PATH, "/restablecer-contrasena");
  });
});
