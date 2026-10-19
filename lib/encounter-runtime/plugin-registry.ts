import {
  validateClinicalPluginManifest,
  type ClinicalPluginManifest,
} from "./clinical-plugin-manifest";

export type PluginRegistryEntry = {
  manifest: ClinicalPluginManifest;
  enabled: boolean;
};

export class ClinicalPluginRegistry {
  private readonly entries = new Map<string, PluginRegistryEntry>();

  register(raw: unknown): ClinicalPluginManifest {
    const validated = validateClinicalPluginManifest(raw);
    if (!validated.ok) {
      throw new Error(`plugin_register_rejected:${validated.reason}`);
    }
    if (this.entries.has(validated.manifest.id)) {
      throw new Error(`plugin_id_collision:${validated.manifest.id}`);
    }
    this.entries.set(validated.manifest.id, {
      manifest: validated.manifest,
      enabled: true,
    });
    return validated.manifest;
  }

  enable(pluginId: string): void {
    const e = this.entries.get(pluginId);
    if (!e) throw new Error(`plugin_not_found:${pluginId}`);
    e.enabled = true;
  }

  disable(pluginId: string): void {
    const e = this.entries.get(pluginId);
    if (!e) throw new Error(`plugin_not_found:${pluginId}`);
    e.enabled = false;
  }

  list(enabledOnly = true): ClinicalPluginManifest[] {
    const all = [...this.entries.values()]
      .filter((e) => (enabledOnly ? e.enabled : true))
      .map((e) => e.manifest);
    return all.sort((a, b) => {
      if (a.slot !== b.slot) return a.slot.localeCompare(b.slot);
      return a.priority - b.priority;
    });
  }

  get(pluginId: string): PluginRegistryEntry | undefined {
    return this.entries.get(pluginId);
  }

  clear(): void {
    this.entries.clear();
  }
}
