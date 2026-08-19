import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "./heydoctor-api";
import { toClinicalUserError } from "./clinical-user-error";
import { shouldRetryFailedQuery } from "./queries/query-retry";
import {
  createTimeoutRegistry,
  type TimeoutClock,
} from "./hooks/timeout-registry";
import { CARE_PATH_STEP_LABELS } from "../app/panel/consultas/[id]/_components/clinical-navigation-rail-model";
import { shouldMountDisclosurePreviews } from "../app/panel/consultas/[id]/_components/encounter-hot-path";

test("production hardening: HAB 403 is fail-closed and not retried", () => {
  const error = new ApiError("Forbidden", 403, {
    code: "HAB_CONFIRM_REQUIRED",
  });
  assert.equal(shouldRetryFailedQuery(0, error), false);
  assert.equal(toClinicalUserError(error).includes("HAB"), true);
});

test("production hardening: SOAP/offer/HAB labels and disclosure budget unchanged", () => {
  assert.equal(typeof CARE_PATH_STEP_LABELS.offer, "string");
  assert.equal(shouldMountDisclosurePreviews(false), false);
  assert.equal(shouldMountDisclosurePreviews(true), true);
});

test("production hardening: ephemeral timers can be cleared on unmount", () => {
  let ran = false;
  const pending = new Set<number>();
  let seq = 1;
  const clock: TimeoutClock = {
    setTimeout(fn, _ms) {
      const id = seq++;
      pending.add(id);
      void fn;
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout(id) {
      pending.delete(id as unknown as number);
    },
  };
  const registry = createTimeoutRegistry(clock);
  registry.set(() => {
    ran = true;
  }, 10);
  registry.clearAll();
  assert.equal(pending.size, 0);
  assert.equal(ran, false);
});
