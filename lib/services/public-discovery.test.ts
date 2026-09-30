import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { publicAvailabilityPath, publicDoctorsPath } from "./public-discovery";

describe("public discovery contracts", () => {
  it("builds a credentials-free doctors path with filters", () => {
    assert.equal(publicDoctorsPath(), "/public/doctors");
    assert.equal(
      publicDoctorsPath({ q: " cardio ", specialty: "Cardiología" }),
      "/public/doctors?q=cardio&specialty=Cardiolog%C3%ADa",
    );
  });

  it("builds an availability search path over the public slot engine", () => {
    assert.equal(
      publicAvailabilityPath({
        specialty: "Medicina General",
        from: "2030-01-01T00:00:00.000Z",
        to: "2030-01-08T00:00:00.000Z",
      }),
      "/public/availability?specialty=Medicina+General&from=2030-01-01T00%3A00%3A00.000Z&to=2030-01-08T00%3A00%3A00.000Z",
    );
  });
});
