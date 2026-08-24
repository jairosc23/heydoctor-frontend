import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldHideGlobalWhatsAppFab } from "./whatsapp-fab-visibility";

describe("RC-19A Sprint 2 D3 WhatsApp FAB", () => {
  it("hides on the staff panel so it cannot cover Ver detalle", () => {
    assert.equal(shouldHideGlobalWhatsAppFab("/panel/consultas"), true);
    assert.equal(
      shouldHideGlobalWhatsAppFab("/panel/consultas/abc"),
      true,
    );
    assert.equal(shouldHideGlobalWhatsAppFab("/login"), true);
  });

  it("stays visible on public booking surfaces", () => {
    assert.equal(shouldHideGlobalWhatsAppFab("/"), false);
    assert.equal(shouldHideGlobalWhatsAppFab("/consulta-rapida"), false);
    assert.equal(shouldHideGlobalWhatsAppFab("/for-doctors/apply"), false);
  });
});
