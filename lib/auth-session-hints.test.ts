import test from "node:test";
import assert from "node:assert/strict";
import {
  isAuthRedirectStubPath,
  isPublicAuthRoute,
  shouldSkipAuthBootstrapOnMount,
} from "./auth-session-hints";

test("isPublicAuthRoute reconoce rutas publicas", () => {
  assert.equal(isPublicAuthRoute("/"), true);
  assert.equal(isPublicAuthRoute("/login"), true);
  assert.equal(isPublicAuthRoute("/register"), true);
  assert.equal(isPublicAuthRoute("/medicos"), true);
  assert.equal(isPublicAuthRoute("/especialidades"), true);
  assert.equal(isPublicAuthRoute("/dr/e2e-ci-doctor"), true);
  assert.equal(isPublicAuthRoute("/dr/booking/token"), false);
  assert.equal(isPublicAuthRoute("/panel"), false);
  assert.equal(isPublicAuthRoute("/panel/consultas"), false);
});

test("shouldSkipAuthBootstrapOnMount en publico sin token en RAM", () => {
  assert.equal(shouldSkipAuthBootstrapOnMount("/login"), true);
  assert.equal(shouldSkipAuthBootstrapOnMount("/panel"), false);
});

test("isAuthRedirectStubPath solo cubre el hop /panel -> /dashboard", () => {
  assert.equal(isAuthRedirectStubPath("/panel"), true);
  assert.equal(isAuthRedirectStubPath("/dashboard"), false);
  assert.equal(isAuthRedirectStubPath("/panel/agenda"), false);
  assert.equal(isAuthRedirectStubPath("/login"), false);
});
