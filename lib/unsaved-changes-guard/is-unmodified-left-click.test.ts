import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isUnmodifiedLeftClick } from "./is-unmodified-left-click";

describe("isUnmodifiedLeftClick", () => {
  it("accepts a plain left click", () => {
    assert.equal(
      isUnmodifiedLeftClick({
        button: 0,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      }),
      true,
    );
  });

  it("lets Ctrl/Cmd/middle click through to the browser", () => {
    assert.equal(
      isUnmodifiedLeftClick({
        button: 0,
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      }),
      false,
    );
    assert.equal(
      isUnmodifiedLeftClick({
        button: 0,
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        altKey: false,
      }),
      false,
    );
    assert.equal(
      isUnmodifiedLeftClick({
        button: 1,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      }),
      false,
    );
  });
});
