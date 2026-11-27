import assert from "node:assert/strict";
import { test } from "node:test";
import { toClinicDoctorOptions } from "./clinic-doctor-directory";

test("RC31: doctors without appointments remain selectable", () => {
  assert.deepEqual(
    toClinicDoctorOptions([{ id: "user-1", name: "Dr. Jairo Santana" }]),
    [{ id: "user-1", label: "Dr. Jairo Santana" }],
  );
});

test("RC31: empty authenticated clinic directory stays empty", () => {
  assert.deepEqual(toClinicDoctorOptions([]), []);
});

test("RC31: missing display name uses internal ID without leaking email", () => {
  assert.deepEqual(toClinicDoctorOptions([{ id: "1234567890", name: null }]), [
    { id: "1234567890", label: "Médico 12345678" },
  ]);
});
