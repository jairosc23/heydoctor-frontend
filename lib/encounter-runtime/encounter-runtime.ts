import type { ClinicalPluginManifest } from "./clinical-plugin-manifest";
import { ClinicalPluginRegistry } from "./plugin-registry";
import type {
  EncounterRuntimeActor,
  EncounterRuntimeSession,
  EncounterRuntimeState,
} from "./types";

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ers_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Clinical Encounter Runtime v1 — FE orchestration only.
 * No prescription emit/persist; no Composer bridge; HITL assist host only.
 */
export class EncounterRuntime {
  private session: EncounterRuntimeSession | null = null;
  private readonly registry: ClinicalPluginRegistry;

  constructor(registry?: ClinicalPluginRegistry) {
    this.registry = registry ?? new ClinicalPluginRegistry();
  }

  getRegistry(): ClinicalPluginRegistry {
    return this.registry;
  }

  getSession(): EncounterRuntimeSession | null {
    return this.session ? { ...this.session, activePluginIds: [...this.session.activePluginIds] } : null;
  }

  getContextRefs(): EncounterRuntimeActor | null {
    return this.session?.actor ?? null;
  }

  listPlugins(): ClinicalPluginManifest[] {
    return this.registry.list(true);
  }

  assertNoWriteCapability(pluginId: string): void {
    const entry = this.registry.get(pluginId);
    if (!entry) throw new Error(`plugin_not_found:${pluginId}`);
    const m = entry.manifest;
    if (
      m.executesAction !== false ||
      m.writesEmr !== false ||
      m.writesPrescription !== false ||
      m.hitlRequired !== true
    ) {
      throw new Error(`plugin_write_capability_forbidden:${pluginId}`);
    }
  }

  async open(actor: EncounterRuntimeActor): Promise<EncounterRuntimeSession> {
    if (!actor.doctorId || !actor.clinicId || !actor.patientId || !actor.encounterId) {
      throw new Error("encounter_runtime_actor_incomplete");
    }
    this.session = {
      sessionId: newSessionId(),
      state: "opening",
      actor: { ...actor },
      activePluginIds: [],
      lastError: null,
      openedAt: null,
      closedAt: null,
    };
    this.session.state = "ready";
    this.session.openedAt = new Date().toISOString();
    return this.getSession()!;
  }

  async activatePlugin(pluginId: string): Promise<void> {
    const s = this.session;
    if (!s || (s.state !== "ready" && s.state !== "assisting")) {
      throw new Error("encounter_runtime_not_ready");
    }
    const entry = this.registry.get(pluginId);
    if (!entry || !entry.enabled) {
      throw new Error(`plugin_not_enabled:${pluginId}`);
    }
    this.assertNoWriteCapability(pluginId);
    if (!s.activePluginIds.includes(pluginId)) {
      s.activePluginIds = [...s.activePluginIds, pluginId];
    }
    s.state = "assisting";
  }

  async deactivatePlugin(pluginId: string): Promise<void> {
    const s = this.session;
    if (!s) return;
    s.activePluginIds = s.activePluginIds.filter((id) => id !== pluginId);
    if (s.state === "assisting" && s.activePluginIds.length === 0) {
      s.state = "ready";
    }
  }

  async close(): Promise<void> {
    const s = this.session;
    if (!s || s.state === "closed") return;
    s.state = "closing";
    s.activePluginIds = [];
    s.state = "closed";
    s.closedAt = new Date().toISOString();
  }

  fail(code: string, message: string): void {
    if (!this.session) return;
    const terminal: EncounterRuntimeState[] = ["closed"];
    if (terminal.includes(this.session.state)) return;
    this.session.state = "failed";
    this.session.lastError = { code, message };
    this.session.activePluginIds = [];
  }
}
