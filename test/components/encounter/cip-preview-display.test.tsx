import { describe, expect, it } from "vitest";
import { cipVocabularyLabel } from "@/app/panel/consultas/[id]/_components/cip-preview-display";

const STANCE_LABEL = {
  admit: "Admit",
  withhold: "Withhold",
  conflicted: "Conflicted",
};

describe("cipVocabularyLabel", () => {
  it("maps a declared CIP token without coercing it", () => {
    expect(cipVocabularyLabel("conflicted", STANCE_LABEL)).toBe("Conflicted");
  });

  it("does not invent admit when the producer omitted the token", () => {
    expect(cipVocabularyLabel(undefined, STANCE_LABEL)).toBeNull();
    expect(cipVocabularyLabel(null, STANCE_LABEL)).toBeNull();
    expect(cipVocabularyLabel("", STANCE_LABEL)).toBeNull();
  });

  it("does not trim unknown values into a declared token", () => {
    expect(cipVocabularyLabel("  admit  ", STANCE_LABEL)).toBeNull();
    expect(cipVocabularyLabel("Admit", STANCE_LABEL)).toBeNull();
  });
});
