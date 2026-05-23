import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateAuthStabilizerRecovery,
  detectOrphanAuthOverlayDom,
} from "./runtime-stabilizer";
import { AUTH_HYDRATION_MAX_MS, AUTH_OVERLAY_MAX_MS } from "./async/auth-request-config";

test("evaluateAuthStabilizerRecovery detecta overlay atascado", () => {
  const now = Date.now();
  const reason = evaluateAuthStabilizerRecovery(
    {
      loading: false,
      sessionRevalidating: true,
      loadingSinceMs: null,
      revalidatingSinceMs: now - AUTH_OVERLAY_MAX_MS - 1,
    },
    now,
  );
  assert.equal(reason, "overlay_stuck");
});

test("evaluateAuthStabilizerRecovery detecta hidratación atascada", () => {
  const now = Date.now();
  const reason = evaluateAuthStabilizerRecovery(
    {
      loading: true,
      sessionRevalidating: false,
      loadingSinceMs: now - AUTH_HYDRATION_MAX_MS - 1,
      revalidatingSinceMs: null,
    },
    now,
  );
  assert.equal(reason, "hydration_stuck");
});

test("evaluateAuthStabilizerRecovery sin recovery en estado sano", () => {
  const now = Date.now();
  const reason = evaluateAuthStabilizerRecovery(
    {
      loading: true,
      sessionRevalidating: true,
      loadingSinceMs: now - 100,
      revalidatingSinceMs: now - 100,
    },
    now,
  );
  assert.equal(reason, null);
});

test("detectOrphanAuthOverlayDom sin document retorna false", () => {
  assert.equal(detectOrphanAuthOverlayDom(), false);
});
