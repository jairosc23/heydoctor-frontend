import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Contrato de respuesta Nest: `{ data: string[] }`.
 * `heydoctorApi.get` devuelve el cuerpo JSON tal cual; `res.data` es el array.
 */
describe("suggest-medications response shape", () => {
  it("unwraps Nest envelope { data: string[] }", () => {
    const apiBody = {
      data: ["Paracetamol 500 mg comprimido", "Paracetamol 1000 mg comprimido"],
    };
    const list = (apiBody as { data?: string[] }).data ?? [];
    assert.equal(list.length, 2);
    assert.match(list[0], /Paracetamol/);
  });

  it("does not treat nested data.data as required", () => {
    const apiBody = {
      data: ["Ibuprofeno 400 mg comprimido"],
    };
    const wrong = (apiBody as { data?: { data?: string[] } }).data?.data ?? [];
    const correct = (apiBody as { data?: string[] }).data ?? [];
    assert.equal(wrong.length, 0);
    assert.equal(correct.length, 1);
  });
});
