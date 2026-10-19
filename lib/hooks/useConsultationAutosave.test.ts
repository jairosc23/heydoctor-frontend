import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Contract for flushNow awaitability — mirrors useConsultationAutosave.runSave
 * coalescing without mounting React.
 */
async function simulateFlushPipeline(opts: {
  inFlight?: Promise<void>;
  lastSavedKey: string | null;
  key: string;
  save: () => Promise<void>;
}): Promise<{ wrote: boolean; alreadyPersisted: boolean }> {
  if (opts.inFlight) await opts.inFlight;
  if (opts.lastSavedKey === opts.key) {
    return { wrote: false, alreadyPersisted: true };
  }
  await opts.save();
  return { wrote: true, alreadyPersisted: false };
}

describe("useConsultationAutosave flush contract", () => {
  it("awaits in-flight save before writing again", async () => {
    const order: string[] = [];
    let release!: () => void;
    const inFlight = new Promise<void>((resolve) => {
      release = resolve;
    }).then(() => {
      order.push("first-done");
    });

    const pending = simulateFlushPipeline({
      inFlight,
      lastSavedKey: null,
      key: "k2",
      save: async () => {
        order.push("second-write");
      },
    });

    order.push("queued");
    release();
    const result = await pending;
    assert.deepEqual(order, ["queued", "first-done", "second-write"]);
    assert.equal(result.wrote, true);
  });

  it("reports alreadyPersisted when fingerprint matches", async () => {
    const result = await simulateFlushPipeline({
      lastSavedKey: "same",
      key: "same",
      save: async () => {
        throw new Error("should not write");
      },
    });
    assert.equal(result.alreadyPersisted, true);
    assert.equal(result.wrote, false);
  });
});
