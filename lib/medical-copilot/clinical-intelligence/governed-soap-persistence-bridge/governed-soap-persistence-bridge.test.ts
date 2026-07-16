import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_SOAP_PERSISTENCE_BRIDGE_GOVERNANCE } from "./governed-soap-persistence-bridge";
import { mapGovernedSoapPersistenceBridgeEnvelope } from "./governed-soap-persistence-bridge-mapper";

describe("Governed SOAP Persistence Bridge mapper", () => {
  it("maps READY_TO_CONNECT surface without write flags", () => {
    const mapped = mapGovernedSoapPersistenceBridgeEnvelope({
      status: "READY_TO_CONNECT",
      runtime: {
        infrastructure: true,
        bridge: { status: "READY_TO_CONNECT", domain: "soap" },
        binding: { connected: false, repositoryInvoked: false },
        validator: { pathComplete: true, stoppedBeforeWrite: true },
        preview: { nextStep: "connect_soap_adapter" },
        execution: { planned: true, executed: false },
        readiness: { readyToConnect: true, readyForPersistence: false },
      },
      governance: { ...GOVERNED_SOAP_PERSISTENCE_BRIDGE_GOVERNANCE },
      reason: "governed_soap_persistence_bridge_ready_to_connect_pre_write",
    });
    assert.ok(mapped);
    assert.equal(mapped.status, "READY_TO_CONNECT");
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.writeAttempted, false);
    assert.equal(mapped.repositoryInvoked, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedSoapPersistenceBridgeEnvelope(null), null);
  });
});
