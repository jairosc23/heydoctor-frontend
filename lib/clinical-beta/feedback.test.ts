import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeBetaComment } from "./feedback";

describe("clinical beta feedback privacy", () => {
  it("redacts identifiers before sending comments", () => {
    assert.equal(
      sanitizeBetaComment(
        "Error en 11111111-1111-4111-8111-111111111111 contacto user@clinic.cl",
      ),
      "Error en [id] contacto [email]",
    );
  });
});
