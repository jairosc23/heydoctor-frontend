import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dedupeInflight, __rc3ClearInflightForTests } from "./request-dedupe";
import {
  rememberOrchestratorPackage,
  tryProjectGovernedPackageFirst,
  __rc3ClearPackageCacheForTests,
} from "./package-first-cache";
import { medicalCopilotGet } from "./medical-copilot-get";

describe("RC3 request dedupe", () => {
  it("shares a single inflight promise", async () => {
    __rc3ClearInflightForTests();
    let runs = 0;
    const p1 = dedupeInflight("k", async () => { runs += 1; await new Promise((r) => setTimeout(r, 10)); return 1; });
    const p2 = dedupeInflight("k", async () => { runs += 1; return 2; });
    const [a, b] = await Promise.all([p1, p2]);
    assert.equal(a, 1);
    assert.equal(b, 1);
    assert.equal(runs, 1);
  });
});

describe("RC3 package-first", () => {
  it("projects aggregator from cached orchestrator package", () => {
    __rc3ClearPackageCacheForTests();
    rememberOrchestratorPackage("s1", {
      status: "ok",
      data: {
        knowledgeAggregator: { kind: "knowledge_aggregator", title: "Knowledge Aggregator", order: 4 },
      },
    });
    const projected = tryProjectGovernedPackageFirst("/medical-copilot/session/s1/governed-knowledge-aggregator");
    assert.ok(projected);
    assert.equal((projected as { data: { kind: string } }).data.kind, "knowledge_aggregator");
  });

  it("medicalCopilotGet remembers package then projects", async () => {
    __rc3ClearPackageCacheForTests();
    __rc3ClearInflightForTests();
    let fetches = 0;
    await medicalCopilotGet("/medical-copilot/session/s1/governed-clinical-ai-orchestrator-package", async () => {
      fetches += 1;
      return { status: "ok", data: { knowledgeAggregator: { kind: "knowledge_aggregator" } } };
    });
    const second = await medicalCopilotGet("/medical-copilot/session/s1/governed-knowledge-aggregator", async () => {
      fetches += 1;
      return { status: "ok", data: { kind: "SHOULD_NOT_FETCH" } };
    });
    assert.equal(fetches, 1);
    assert.equal((second as { data: { kind: string } }).data.kind, "knowledge_aggregator");
  });
});
