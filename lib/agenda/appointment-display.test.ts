import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { collectClinicDoctorOptions } from "./appointment-display";

describe("collectClinicDoctorOptions", () => {
  it("deduplicates doctors from appointments and consultations", () => {
    const options = collectClinicDoctorOptions(
      [
        {
          id: "a-1",
          doctorId: "doc-1",
          doctor: { id: "doc-1", name: "Dr. Ana" },
        },
      ],
      [{ id: "doc-2" }],
    );

    assert.equal(options.length, 2);
    assert.equal(options[0]?.id, "doc-1");
    assert.equal(options[0]?.label, "Dr. Ana");
    assert.equal(options[1]?.id, "doc-2");
  });
});
