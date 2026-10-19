import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "./heydoctor-api";
import { toClinicalUserError } from "./clinical-user-error";

test("toClinicalUserError maps HAB and emission codes without leaking internals", () => {
  assert.equal(
    toClinicalUserError(
      new ApiError("Forbidden", 403, { code: "HAB_CONFIRM_REQUIRED" }),
    ),
    "Se requiere confirmación de autoridad (HAB) para persistir.",
  );
  assert.equal(
    toClinicalUserError(
      new ApiError("already", 403, { code: "HAB_CONFIRM_ALREADY_CONSUMED" }),
    ).includes("ya fue utilizada"),
    true,
  );
  assert.equal(
    toClinicalUserError(
      new ApiError("gated", 403, { code: "EMISSION_PE_ADAPTER_GATED" }),
    ).includes("no está disponible"),
    true,
  );
});

test("toClinicalUserError falls back to getApiErrorMessage", () => {
  assert.equal(
    toClinicalUserError(new Error("timeout de red"), "fallback"),
    "timeout de red",
  );
  assert.equal(
    toClinicalUserError(null, "No se pudo guardar"),
    "No se pudo guardar",
  );
});
