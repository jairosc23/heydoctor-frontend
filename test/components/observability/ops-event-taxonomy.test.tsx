import { describe, expect, it } from "vitest";
import {
  feEventKey,
  isValidOpsFeEventName,
  OPS_CORRELATION_HEADERS,
  OPS_FE_EVENT_TAXONOMY,
} from "@/lib/observability/ops-event-taxonomy";
import { createHttpRequestId } from "@/lib/observability/correlation";

describe("ops-event-taxonomy (PQ-10)", () => {
  it("exposes correlation header contract matching BE", () => {
    expect(OPS_CORRELATION_HEADERS.requestId).toBe("X-Request-Id");
    expect(OPS_CORRELATION_HEADERS.clientCorrelationId).toBe(
      "X-Client-Correlation-Id",
    );
  });

  it("validates FE event names and catalogue", () => {
    expect(OPS_FE_EVENT_TAXONOMY.length).toBeGreaterThanOrEqual(5);
    for (const row of OPS_FE_EVENT_TAXONOMY) {
      expect(isValidOpsFeEventName(row.event)).toBe(true);
      expect(feEventKey(row.domain, row.event)).toBe(
        `ops.${row.domain}.${row.event}`,
      );
    }
  });

  it("creates distinct HTTP request ids", () => {
    const a = createHttpRequestId();
    const b = createHttpRequestId();
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).not.toBe(b);
  });
});
