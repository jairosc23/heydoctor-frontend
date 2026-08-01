import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASSIST_ORCHESTRATOR_ASSERTIONS,
  COPILOT_PRESENCE_CARD_ID,
  applyAssistFatigue,
  compareAssistCards,
  createAssistProviderRegistry,
  createCopilotPresenceCard,
  createDefaultAssistProviders,
  enforceSingleModelPresence,
  planAssistOrchestration,
  resolveAssistConflicts,
  resolveAssistDisclosure,
  urgencyForSource,
  type AssistCard,
  type AssistProvider,
} from "./assist-orchestrator";
import { LIQUID_URGENCY_RANK } from "./liquid-composition";

function card(
  partial: Partial<AssistCard> & Pick<AssistCard, "id" | "sourceClass">,
): AssistCard {
  return {
    kind:
      partial.sourceClass === "DETERMINISTIC"
        ? "deterministic_advisory"
        : partial.sourceClass === "MODEL"
          ? "model_presence"
          : "external",
    urgencyRank: urgencyForSource(partial.sourceClass),
    ...partial,
  };
}

describe("AEC-1 M6 Assist Orchestrator", () => {
  it("registers MODEL + DETERMINISTIC and refuses EXTERNAL at runtime", () => {
    const providers: AssistProvider[] = [
      ...createDefaultAssistProviders(),
      {
        sourceClass: "EXTERNAL",
        contribute: () => [
          card({ id: "x1", sourceClass: "EXTERNAL", title: "nope" }),
        ],
      },
    ];
    const reg = createAssistProviderRegistry(providers);
    assert.equal(reg.has("DETERMINISTIC"), true);
    assert.equal(reg.has("MODEL"), true);
    assert.equal(reg.has("EXTERNAL"), false);
  });

  it("MODEL default provider contributes exactly one CopilotPresence card", () => {
    const model = createDefaultAssistProviders().find(
      (p) => p.sourceClass === "MODEL",
    );
    const cards = model?.contribute({ phase: "active" }) ?? [];
    assert.equal(cards.length, 1);
    assert.equal(cards[0]?.id, COPILOT_PRESENCE_CARD_ID);
    assert.equal(cards[0]?.kind, "model_presence");
    assert.equal(createCopilotPresenceCard().id, COPILOT_PRESENCE_CARD_ID);
  });

  it("enforceSingleModelPresence keeps only one MODEL presence", () => {
    const capped = enforceSingleModelPresence([
      createCopilotPresenceCard(),
      card({ id: "m2", sourceClass: "MODEL", kind: "model_presence" }),
      card({ id: "d1", sourceClass: "DETERMINISTIC" }),
    ]);
    assert.equal(
      capped.filter((c) => c.kind === "model_presence").length,
      1,
    );
    assert.equal(capped.some((c) => c.id === "d1"), true);
  });

  it("disclosure policy mirrors Liquid phase rules", () => {
    assert.equal(resolveAssistDisclosure("degraded"), "hidden");
    assert.equal(resolveAssistDisclosure("pre_encounter"), "collapsed");
    assert.equal(resolveAssistDisclosure("closing"), "collapsed");
    assert.equal(resolveAssistDisclosure("active"), "expanded");
  });

  it("orders by urgency then DETERMINISTIC before MODEL", () => {
    const a = card({
      id: "m1",
      sourceClass: "MODEL",
      urgencyRank: LIQUID_URGENCY_RANK.model_suggestion,
    });
    const b = card({
      id: "d1",
      sourceClass: "DETERMINISTIC",
      urgencyRank: LIQUID_URGENCY_RANK.deterministic_intel,
    });
    const c = card({
      id: "d0",
      sourceClass: "DETERMINISTIC",
      urgencyRank: 10,
    });
    const sorted = [a, c, b].sort(compareAssistCards);
    assert.deepEqual(
      sorted.map((x) => x.id),
      ["d1", "m1", "d0"],
    );
  });

  it("conflict: DETERMINISTIC wins MODEL on same theme; strips AUTHORITY ranks", () => {
    const resolved = resolveAssistConflicts([
      card({
        id: "hab",
        sourceClass: "MODEL",
        urgencyRank: LIQUID_URGENCY_RANK.safety_hab,
        themeId: "t1",
      }),
      card({
        id: "alert",
        sourceClass: "DETERMINISTIC",
        urgencyRank: LIQUID_URGENCY_RANK.clinical_alert,
        themeId: "t2",
      }),
      card({
        id: "m-theme",
        sourceClass: "MODEL",
        themeId: "gap-lab",
        title: "model view",
      }),
      card({
        id: "d-theme",
        sourceClass: "DETERMINISTIC",
        themeId: "gap-lab",
        title: "w5 view",
      }),
    ]);
    assert.equal(
      resolved.some((c) => c.urgencyRank >= LIQUID_URGENCY_RANK.clinical_alert),
      false,
    );
    const theme = resolved.filter((c) => c.themeId === "gap-lab");
    assert.equal(theme.length, 1);
    assert.equal(theme[0]?.id, "d-theme");
  });

  it("fatigue prefers DETERMINISTIC when trimming past soft-cap", () => {
    const cards: AssistCard[] = [];
    for (let i = 0; i < 4; i++) {
      cards.push(
        card({
          id: `d${i}`,
          sourceClass: "DETERMINISTIC",
          urgencyRank: 60 - i,
        }),
      );
    }
    for (let i = 0; i < 4; i++) {
      cards.push(
        card({
          id: `m${i}`,
          sourceClass: "MODEL",
          urgencyRank: 40 - i,
        }),
      );
    }
    const { visible, hiddenCount } = applyAssistFatigue(cards, {
      maxVisible: 5,
    });
    assert.equal(visible.length, 5);
    assert.equal(hiddenCount, 3);
    assert.equal(
      visible.filter((c) => c.sourceClass === "DETERMINISTIC").length,
      4,
    );
    assert.equal(visible.filter((c) => c.sourceClass === "MODEL").length, 1);
  });

  it("plan enables MODEL presence when visible; disables when fatigued out", () => {
    const active = planAssistOrchestration({ phase: "active" });
    assert.equal(active.disclosure, "expanded");
    assert.equal(active.assertions, ASSIST_ORCHESTRATOR_ASSERTIONS);
    const modelSlot = active.renderSlots.find((s) => s.slot === "model_presence");
    assert.equal(modelSlot && "enabled" in modelSlot && modelSlot.enabled, true);
    assert.equal(
      active.visibleCards.some((c) => c.id === COPILOT_PRESENCE_CARD_ID),
      true,
    );

    const fatigued = planAssistOrchestration({
      phase: "active",
      // Soft-cap full of Assist-eligible DETERMINISTIC (< clinical_alert) → MODEL dropped.
      cards: [0, 1, 2, 3, 4].map((i) =>
        card({
          id: `d${i}`,
          sourceClass: "DETERMINISTIC",
          urgencyRank: LIQUID_URGENCY_RANK.deterministic_intel - i,
        }),
      ),
      fatigue: { maxVisible: 5 },
    });
    assert.equal(
      fatigued.visibleCards.filter((c) => c.sourceClass === "DETERMINISTIC")
        .length,
      5,
    );
    assert.equal(
      fatigued.visibleCards.some((c) => c.sourceClass === "MODEL"),
      false,
    );
    const fatiguedModel = fatigued.renderSlots.find(
      (s) => s.slot === "model_presence",
    );
    assert.equal(
      fatiguedModel && "enabled" in fatiguedModel && fatiguedModel.enabled,
      false,
    );
  });

  it("hidden disclosure clears visible stream and disables MODEL slot", () => {
    const plan = planAssistOrchestration({
      phase: "degraded",
    });
    assert.equal(plan.disclosure, "hidden");
    assert.equal(plan.visibleCards.length, 0);
    const modelSlot = plan.renderSlots.find((s) => s.slot === "model_presence");
    assert.equal(modelSlot && "enabled" in modelSlot && modelSlot.enabled, false);
  });
});
