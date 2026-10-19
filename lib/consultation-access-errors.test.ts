import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "./heydoctor-api";
import {
  CONSULTATION_ACCESS_DENIED_MESSAGE,
  CONSULTATION_NOT_FOUND_MESSAGE,
  getConsultationAccessErrorMessage,
  isConsultationAccessDenied,
} from "./consultation-access-errors";

describe("getConsultationAccessErrorMessage", () => {
  it("maps 403 to explicit access denied message", () => {
    assert.equal(
      getConsultationAccessErrorMessage(
        new ApiError("Forbidden", 403, null),
      ),
      CONSULTATION_ACCESS_DENIED_MESSAGE,
    );
  });

  it("maps 404 to not found message", () => {
    assert.equal(
      getConsultationAccessErrorMessage(
        new ApiError("Not Found", 404, null),
      ),
      CONSULTATION_NOT_FOUND_MESSAGE,
    );
  });

  it("detects consultation access denied", () => {
    assert.equal(
      isConsultationAccessDenied(new ApiError("Forbidden", 403, null)),
      true,
    );
  });
});
