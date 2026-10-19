import assert from "node:assert/strict";
import test from "node:test";
import type { PublicSpecialty } from "./services/public-discovery";
import {
  CANONICAL_SPECIALTY_SLUGS,
  FALLBACK_SPECIALTY_ICON,
  SPECIALTY_ICON_COLOR,
  readSpecialtySlug,
  specialtyIconId,
  specialtyIconModel,
} from "./specialty-icons";

test("ALL_CANONICAL_SPECIALTIES_MAPPED", () => {
  assert.equal(CANONICAL_SPECIALTY_SLUGS.length, 16);
  for (const slug of CANONICAL_SPECIALTY_SLUGS) {
    const model = specialtyIconModel(slug, 24);
    assert.equal(model.id, slug);
    assert.ok(model.paths.length > 0);
    assert.equal(model.color, SPECIALTY_ICON_COLOR);
    assert.notEqual(model.id, FALLBACK_SPECIALTY_ICON);
  }
});

test("UNKNOWN_SPECIALTY_FALLBACK", () => {
  assert.equal(specialtyIconId(undefined), FALLBACK_SPECIALTY_ICON);
  assert.equal(specialtyIconId("not-a-specialty"), FALLBACK_SPECIALTY_ICON);
});

test("TRANSLATION_INDEPENDENT", () => {
  for (const label of ["Pediatría", "Cardiología", "Medicina general", "Cardiology", "Pediatrics"]) {
    assert.equal(specialtyIconId(label), FALLBACK_SPECIALTY_ICON);
  }
  assert.equal(specialtyIconId("cardiology"), "cardiology");
});

test("WEB_SLUG_NOT_DERIVED_FROM_LABEL", () => {
  assert.equal(readSpecialtySlug({ slug: "pediatrics" }), "pediatrics");
  assert.equal(readSpecialtySlug({ slug: "Pediatría" }), null);
  const specialty: PublicSpecialty = { name: "Cardiología", doctorCount: 1 };
  assert.equal(readSpecialtySlug(specialty), null);
  assert.equal(specialtyIconId("Medicina General"), "medical");
});

test("WEB_RENDER", () => {
  for (const size of [24, 32, 48]) {
    const model = specialtyIconModel("dentistry", size);
    assert.equal(model.size, size);
    assert.equal(model.viewBox, 24);
    assert.equal(model.paths.join(" ").includes("<text"), false);
  }
});
