/**
 * CP-28 — SpeechProviderRegistry.
 */

import type {
  SpeechProviderFactoryFn,
  SpeechProviderRegistry,
} from "./contracts";
import type {
  SpeechProviderDescriptor,
  SpeechProviderId,
} from "./types";

export function createSpeechProviderRegistry(): SpeechProviderRegistry {
  const factories = new Map<SpeechProviderId, SpeechProviderFactoryFn>();
  const descriptors = new Map<SpeechProviderId, SpeechProviderDescriptor>();

  return {
    register(descriptor, factory) {
      descriptors.set(descriptor.id, descriptor);
      factories.set(descriptor.id, factory);
    },

    unregister(id) {
      descriptors.delete(id);
      factories.delete(id);
    },

    has(id) {
      return factories.has(id);
    },

    getFactory(id) {
      return factories.get(id) ?? null;
    },

    getDescriptor(id) {
      return descriptors.get(id) ?? null;
    },

    listDescriptors() {
      return Array.from(descriptors.values());
    },

    listIds() {
      return Array.from(descriptors.keys());
    },
  };
}
