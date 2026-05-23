import test from "node:test";
import assert from "node:assert/strict";
import { withTimeout, OperationTimeoutError } from "./with-timeout";

test("withTimeout resuelve si la promesa termina a tiempo", async () => {
  const value = await withTimeout(Promise.resolve(42), 200, "fast-op");
  assert.equal(value, 42);
});

test("withTimeout rechaza con OperationTimeoutError si cuelga", async () => {
  await assert.rejects(
    () => withTimeout(new Promise(() => {}), 25, "slow-op"),
    (err: unknown) =>
      err instanceof OperationTimeoutError && err.label === "slow-op",
  );
});
