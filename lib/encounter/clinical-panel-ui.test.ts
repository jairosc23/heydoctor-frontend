import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveClinicalPanelUiState } from "./clinical-panel-ui";

describe("resolveClinicalPanelUiState", () => {
  it("prefers loading over data", () => {
    assert.equal(
      resolveClinicalPanelUiState({ loading: true, hasData: true }),
      "loading",
    );
  });

  it("returns ready when data is present", () => {
    assert.equal(resolveClinicalPanelUiState({ hasData: true }), "ready");
  });

  it("returns empty when explicitly empty or no data", () => {
    assert.equal(resolveClinicalPanelUiState({ empty: true }), "empty");
    assert.equal(resolveClinicalPanelUiState({ hasData: false }), "empty");
    assert.equal(resolveClinicalPanelUiState({}), "empty");
  });
});
