import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  AI_ASSIST_UNAVAILABLE_COPY,
  toAiClinicalUserMessage,
} from "./ai-clinical-errors";
import { Rc5FeTimeoutError } from "./medical-copilot/rc5-operational/resilience";

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walkTsFiles(path, out);
    } else if (name.endsWith(".ts") || name.endsWith(".tsx")) {
      out.push(path);
    }
  }
  return out;
}

describe("copilot error leakage guards", () => {
  it("never returns RC5/timeout internals from presenter", () => {
    const samples = [
      new Rc5FeTimeoutError("/api/medical-copilot/x", 20000),
      "RC5 FE timeout 20000ms: /governed-clinical-assistance",
      new Error("Clinical analysis timed out"),
    ];
    for (const sample of samples) {
      const ui = toAiClinicalUserMessage(sample);
      assert.equal(ui, AI_ASSIST_UNAVAILABLE_COPY);
      assert.doesNotMatch(ui, /RC5|20000|\/api\/|governed-clinical/i);
    }
  });

  it("medical-copilot hooks route errors through toAiClinicalUserMessage", () => {
    const root = join(process.cwd(), "lib/medical-copilot");
    const files = walkTsFiles(root).filter((f) => f.endsWith("-hooks.ts"));
    assert.ok(files.length > 50, "expected governed hook corpus");
    const raw = files.filter((f) => {
      const text = readFileSync(f, "utf8");
      return /setError\(err instanceof Error \? err\.message/.test(text);
    });
    assert.equal(
      raw.length,
      0,
      `raw setError still present in:\n${raw.slice(0, 10).join("\n")}`,
    );
  });
});
