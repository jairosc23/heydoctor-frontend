import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COPILOT_REDIRECT_ENTRY_POINTS,
  countRedirectedEntryPoints,
  shouldExpandGenerativeForSection,
} from "./copilot-navigation";

describe("copilot-navigation Phase 4.8.3C", () => {
  it("shouldExpandGenerativeForSection solo para generative", () => {
    assert.equal(shouldExpandGenerativeForSection("generative"), true);
  });

  it("inventaria entry points redirigidos vs legacy", () => {
    const redirected = countRedirectedEntryPoints();
    assert.equal(redirected, 3);
    const unchanged = COPILOT_REDIRECT_ENTRY_POINTS.filter(
      (e) => e.phase483cBehavior === "unchanged",
    );
    assert.ok(unchanged.length >= 4);
    assert.ok(
      unchanged.some((e) => e.id === "live-ai-notes"),
      "LiveAiNoteSuggestions sin cambios",
    );
  });

  it("tab Asistencia retirado en 4.8.3D; Chat reemplaza mensajería", () => {
    const assist = COPILOT_REDIRECT_ENTRY_POINTS.find(
      (e) => e.id === "tab-asistencia-assist",
    );
    const chat = COPILOT_REDIRECT_ENTRY_POINTS.find((e) => e.id === "tab-chat");
    assert.equal(assist?.phase483dStatus, "retired_unmounted");
    assert.equal(chat?.phase483dStatus, "active_replacement");
  });

  it("menú Análisis clínico redirige a Copilot generativo", () => {
    const menu = COPILOT_REDIRECT_ENTRY_POINTS.find(
      (e) => e.id === "menu-analisis-clinico-ia",
    );
    assert.equal(menu?.phase483cBehavior, "redirect_to_copilot_generative");
  });
});
