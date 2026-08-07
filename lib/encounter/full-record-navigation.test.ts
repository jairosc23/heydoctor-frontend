import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  encounterUrlWithFullRecord,
  isEncounterFullRecordOpenFromSearch,
} from "./full-record-navigation";

describe("full-record-navigation", () => {
  it("adds and removes ficha query without changing pathname", () => {
    assert.equal(
      encounterUrlWithFullRecord("/panel/consultas/abc", true),
      "/panel/consultas/abc?ficha=1",
    );
    assert.equal(
      encounterUrlWithFullRecord("/panel/consultas/abc?ficha=1", false),
      "/panel/consultas/abc",
    );
  });

  it("preserves unrelated search params when toggling ficha", () => {
    assert.equal(
      encounterUrlWithFullRecord("/panel/consultas/abc?payment=1", true),
      "/panel/consultas/abc?payment=1&ficha=1",
    );
    assert.equal(
      encounterUrlWithFullRecord(
        "/panel/consultas/abc?payment=1&ficha=1",
        false,
      ),
      "/panel/consultas/abc?payment=1",
    );
  });

  it("detects open state from search", () => {
    assert.equal(isEncounterFullRecordOpenFromSearch("?ficha=1"), true);
    assert.equal(isEncounterFullRecordOpenFromSearch("ficha=1"), true);
    assert.equal(isEncounterFullRecordOpenFromSearch(""), false);
    assert.equal(isEncounterFullRecordOpenFromSearch("?other=1"), false);
  });
});
