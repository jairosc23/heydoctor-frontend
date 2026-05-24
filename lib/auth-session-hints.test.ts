import test from "node:test";
import assert from "node:assert/strict";
import {
  isPublicAuthRoute,
  shouldSkipAuthBootstrapOnMount,
} from "./auth-session-hints";

test("isPublicAuthRoute reconoce rutas publicas", () => {
  assert.equal(isPublicAuthRoute("/"), true);
  assert.equal(isPublicAuthRoute("/login"), true);
  assert.equal(isPublicAuthRoute("/register"), true);
  assert.equal(isPublicAuthRoute("/panel"), false);
  assert.equal(isPublicAuthRoute("/panel/consultas"), false);
});

test("shouldSkipAuthBootstrapOnMount en publico sin token en RAM", () => {
  assert.equal(shouldSkipAuthBootstrapOnMount("/login"), true);
  assert.equal(shouldSkipAuthBootstrapOnMount("/panel"), false);
});
