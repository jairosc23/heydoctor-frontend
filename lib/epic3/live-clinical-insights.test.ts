import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  buildLiveInsightsAssistRequest,
  isForbiddenInsightLine,
  mapAssistToLiveClinicalInsights,
} from "./live-clinical-insights";
import { evaluateLiveDocumentationQuality } from "./live-documentation-quality";

const MODULE = path.resolve(import.meta.dirname, "live-clinical-insights.ts");
const SESSION = path.resolve(
  import.meta.dirname,
  "live-clinical-insights-session.ts",
);

describe("EPIC-3 UC-03C live-clinical-insights", () => {
  it("builds assist request with live mode constraints", () => {
    const quality = evaluateLiveDocumentationQuality({
      consultation: { id: "c1", chiefComplaint: "Cefalea" },
      foundation: null,
    });
    const req = buildLiveInsightsAssistRequest({
      consultation: { id: "c1", chiefComplaint: "Cefalea", notes: "x" },
      foundation: null,
      documentationQuality: quality,
    });
    assert.match(req.notes ?? "", /UC-03C/);
    assert.match(req.notes ?? "", /PROHIBIDO/);
    assert.match(req.symptoms ?? "", /Documentation Quality/);
    assert.equal(req.chiefComplaint, "Cefalea");
  });

  it("maps recommendations and filters forbidden clinical action lines", () => {
    assert.equal(isForbiddenInsightLine("Prescribir losartán 50mg"), true);
    assert.equal(
      isForbiddenInsightLine("Profundizar duración de la cefalea"),
      false,
    );

    const batch = mapAssistToLiveClinicalInsights({
      sessionId: "sess-1",
      aiRunId: "run-1",
      promptVersion: "v1.0.0",
      assistiveOnlyNotice: "Solo asistencia",
      recommendations: [
        "Profundizar duración de la cefalea",
        "Prescribir losartán 50mg",
        "Verificar si hay signos de alarma documentados",
      ],
    });
    assert.equal(batch.persistsToEmr, false);
    assert.equal(batch.promptVersion, "v1.0.0");
    assert.equal(batch.insights.length, 2);
    assert.ok(batch.insights.every((i) => i.origin === "copilot"));
    assert.ok(
      !batch.insights.some((i) => i.text.toLowerCase().includes("prescribir")),
    );
  });

  it("source modules never call EMR writers", () => {
    for (const file of [MODULE, SESSION]) {
      const src = fs.readFileSync(file, "utf8");
      for (const token of [
        "updateConsultation",
        "governed-",
        "persistence-execution",
        "signConsultation",
      ]) {
        assert.equal(
          src.includes(token),
          false,
          `${path.basename(file)} contains ${token}`,
        );
      }
    }
  });
});
