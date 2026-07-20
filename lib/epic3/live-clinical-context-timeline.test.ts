import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import type { NestConsultation } from "@/lib/services/consultations";
import {
  buildEncounterTimelineEvents,
  mergeLiveClinicalContextTimeline,
} from "./live-clinical-context-timeline";

const MODULE = path.resolve(
  import.meta.dirname,
  "live-clinical-context-timeline.ts",
);

describe("EPIC-3 UC-03A live-clinical-context-timeline", () => {
  it("builds chronological encounter milestones from consultation + foundation", () => {
    const consultation: NestConsultation = {
      id: "c1",
      status: "in_progress",
      createdAt: "2026-07-19T10:00:00.000Z",
      updatedAt: "2026-07-19T11:00:00.000Z",
      notes: "Anamnesis breve",
      publicToken: "tok",
      consentGivenAt: "2026-07-19T10:01:00.000Z",
      consentVersion: "v1",
    };
    const foundation = {
      meta: { generatedAt: "2026-07-19T11:05:00.000Z" },
      consultation: {
        id: "c1",
        status: "in_progress",
        createdAt: "2026-07-19T10:00:00.000Z",
        updatedAt: "2026-07-19T11:00:00.000Z",
        notes: "Anamnesis breve",
        signedAt: null,
      },
      encounter: { vitalSigns: { hr: 72 } },
      orders: {
        prescriptions: [
          { id: "rx1", status: "active", createdAt: "2026-07-19T10:30:00.000Z" },
        ],
        labs: [],
        referrals: [],
      },
    } as unknown as ClinicalFoundationBundle;

    const events = buildEncounterTimelineEvents({ consultation, foundation });
    assert.ok(events.some((e) => e.eventType === "encounter_opened"));
    assert.ok(events.some((e) => e.eventType === "telemedicine_invite_ready"));
    assert.ok(events.some((e) => e.eventType === "vitals_present"));
    assert.ok(events.some((e) => e.eventType === "notes_present"));
    assert.ok(events.some((e) => e.eventType === "prescription_order_present"));

    const view = mergeLiveClinicalContextTimeline({
      consultation,
      foundation,
      sessionTimelineEntries: [
        {
          timelineEntryId: "s1",
          timestamp: "2026-07-19T10:02:00.000Z",
          eventType: "session_created",
          summary: "Session created",
        },
      ],
      sessionId: "sess-1",
      timelineId: "tl-1",
    });
    assert.equal(view.phase, "live");
    assert.equal(view.generative, false);
    assert.equal(view.persistsToEmr, false);
    assert.ok(view.events.length >= 5);
    for (let i = 1; i < view.events.length; i += 1) {
      assert.ok(
        view.events[i - 1]!.timestamp <= view.events[i]!.timestamp,
        "events must be chronological",
      );
    }
  });

  it("module has no LLM / EMR write surface", () => {
    const src = fs.readFileSync(MODULE, "utf8");
    for (const token of [
      "openai",
      "consultation-assist",
      "getConsultationAssist",
      "updateConsultation",
      "governed-",
      "heydoctorApi",
    ]) {
      assert.equal(src.includes(token), false, `forbidden: ${token}`);
    }
    assert.ok(src.includes("No LLM"));
  });
});
