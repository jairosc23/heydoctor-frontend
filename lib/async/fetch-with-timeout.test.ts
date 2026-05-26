import test from "node:test";
import assert from "node:assert/strict";
import {
  fetchWithTimeout,
  FetchTimeoutError,
} from "./fetch-with-timeout";

test("fetchWithTimeout resuelve cuando fetch responde a tiempo", async () => {
  const res = await fetchWithTimeout(
    "https://example.test/ok",
    {},
    {
      timeoutMs: 500,
      fetchImpl: async () =>
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
    },
  );
  assert.equal(res.status, 200);
});

test("fetchWithTimeout rechaza con FetchTimeoutError si fetch cuelga", async () => {
  await assert.rejects(
    () =>
      fetchWithTimeout(
        "https://example.test/slow",
        {},
        {
          timeoutMs: 30,
          fetchImpl: () => new Promise(() => {}),
        },
      ),
    (err: unknown) => err instanceof FetchTimeoutError,
  );
});

test("fetchWithTimeout propaga abort externo sin FetchTimeoutError", async () => {
  const controller = new AbortController();
  const pending = fetchWithTimeout(
    "https://example.test/abort",
    {},
    {
      timeoutMs: 500,
      signal: controller.signal,
      fetchImpl: (_input, init) =>
        new Promise((resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
          setTimeout(() => resolve(new Response(null, { status: 200 })), 200);
        }),
    },
  );
  controller.abort();
  await assert.rejects(
    async () => pending,
    (err: unknown) =>
      err instanceof DOMException && err.name === "AbortError",
  );
});
