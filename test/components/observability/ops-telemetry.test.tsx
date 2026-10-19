import { describe, expect, it } from "vitest";
import { classifyRoutePath } from "@/lib/observability/ops-telemetry";

describe("ops-telemetry (PQ-05)", () => {
  it("redacts UUIDs and numeric ids from navigation paths", () => {
    expect(
      classifyRoutePath(
        "/panel/consultas/153e8214-53b9-4b20-90d5-59d47d0017eb",
      ),
    ).toBe("/panel/consultas/:id");
    expect(classifyRoutePath("/panel/pacientes/42/edit")).toBe(
      "/panel/pacientes/:n/edit",
    );
  });
});
