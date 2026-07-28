"use client";

import { useState } from "react";
import { W3CpiSuggestionList } from "@/components/hcx/intelligence/cpi";
import { isW3CpiEnabled } from "@/lib/w3/flags";

export default function W3CpiDevPage() {
  const enabled = isW3CpiEnabled();
  const [message, setMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState([
    {
      suggestionId: "s1",
      kind: "objective",
      label: "Objetivo demo",
      detail: "Advisory only",
      status: "suggested",
    },
    {
      suggestionId: "s2",
      kind: "plan_item",
      label: "Ítem no farmacológico demo",
      detail: null,
      status: "suggested",
    },
  ]);

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-cpi-disabled">
          Define <code>NEXT_PUBLIC_W3_CPI=true</code>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      <W3CpiSuggestionList
        enabled
        suggestions={suggestions}
        message={message}
        onDismiss={(id) => {
          setSuggestions((prev) =>
            prev.map((s) =>
              s.suggestionId === id ? { ...s, status: "dismissed" } : s,
            ),
          );
          setMessage("Suggestion dismissed.");
        }}
        onApply={(id) => {
          setSuggestions((prev) =>
            prev.map((s) =>
              s.suggestionId === id ? { ...s, status: "applied" } : s,
            ),
          );
          setMessage(
            "Inserted into Therapy Draft. Plan Ready still required on COS care plan.",
          );
        }}
      />
    </main>
  );
}
