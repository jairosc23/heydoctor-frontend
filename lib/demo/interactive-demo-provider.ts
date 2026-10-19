import { getBackendOrigin } from "@/lib/api-base";
import {
  interactiveDemoScenario,
  type DemoScenario,
  type DemoSignal,
} from "@/lib/demo/interactive-demo-scenario";

export type InteractiveDemoMode = "mock" | "live";

type LiveProbe = {
  name: "livez" | "readyz" | "version";
  path: string;
  ok: boolean;
  statusCode: number | null;
};

type LiveBackendSnapshot = {
  probes: LiveProbe[];
  versionLabel: string;
};

const LIVE_TIMEOUT_MS = 2_500;

export function resolveInteractiveDemoMode(value?: string): InteractiveDemoMode {
  return value === "live" ? "live" : "mock";
}

export async function getInteractiveDemoScenario(
  mode: InteractiveDemoMode,
): Promise<DemoScenario> {
  if (mode === "mock") {
    return interactiveDemoScenario;
  }

  const snapshot = await fetchLiveBackendSnapshot();
  if (!snapshot) {
    return withLiveFallback(interactiveDemoScenario);
  }

  return withLiveBackendSnapshot(interactiveDemoScenario, snapshot);
}

async function fetchLiveBackendSnapshot(): Promise<LiveBackendSnapshot | null> {
  let baseUrl: string;
  try {
    baseUrl = getBackendOrigin();
  } catch {
    return null;
  }

  const probes = await Promise.all([
    probeEndpoint(baseUrl, "livez", "/livez"),
    probeEndpoint(baseUrl, "readyz", "/readyz"),
    probeEndpoint(baseUrl, "version", "/health/version"),
  ]);

  if (!probes.some((probe) => probe.ok)) {
    return null;
  }

  const versionProbe = probes.find((probe) => probe.name === "version");
  return {
    probes,
    versionLabel: versionProbe?.ok ? "Version endpoint reachable" : "Version unavailable",
  };
}

async function probeEndpoint(
  baseUrl: string,
  name: LiveProbe["name"],
  path: string,
): Promise<LiveProbe> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json,text/plain",
      },
      signal: controller.signal,
    });
    return {
      name,
      path,
      ok: response.ok,
      statusCode: response.status,
    };
  } catch {
    return {
      name,
      path,
      ok: false,
      statusCode: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function withLiveFallback(scenario: DemoScenario): DemoScenario {
  return {
    ...scenario,
    signals: replaceSignals(scenario.signals, [
      { label: "Demo Mode", value: "Mock fallback", tone: "amber" },
      { label: "Backend live", value: "No disponible", tone: "amber" },
    ]),
    evidence: {
      ...scenario.evidence,
      dataOrigin: scenario.evidence.dataOrigin.map((item) =>
        item.label === "Mock Mode"
          ? {
              ...item,
              value: "Fallback determinista",
              description:
                "Live Backend Mode fue solicitado, pero la demo conserva datos mock al no confirmar backend disponible.",
            }
          : item,
      ),
      capabilities: scenario.evidence.capabilities.map((item) =>
        item.name === "Observability"
          ? {
              ...item,
              status: "protected",
              evidence:
                "La demo intentó health/readiness públicos y volvió a mock sin romper la experiencia.",
            }
          : item,
      ),
    },
  };
}

function withLiveBackendSnapshot(
  scenario: DemoScenario,
  snapshot: LiveBackendSnapshot,
): DemoScenario {
  const liveEvidence = buildLiveEvidence(snapshot.probes);
  return {
    ...scenario,
    mode: "live",
    subtitle:
      "Historia clínica guiada con datos demo y verificación read-only del Backend Enterprise v1.",
    consultation: {
      ...scenario.consultation,
      status: "Live backend read-only checks enabled",
      timeline: [
        ...scenario.consultation.timeline,
        "Health y readiness públicos verificados en modo live opcional.",
      ],
    },
    signals: replaceSignals(scenario.signals, [
      { label: "Demo Mode", value: "Live opcional", tone: "emerald" },
      { label: "Backend live", value: "GET público OK", tone: "emerald" },
    ]),
    evidence: {
      dataOrigin: scenario.evidence.dataOrigin.map((item) => {
        if (item.label === "Mock Mode") {
          return {
            ...item,
            label: "Live Backend Mode",
            value: "Read-only probes",
            description:
              "El workspace conserva datos demo, mientras el proveedor valida endpoints GET públicos.",
          };
        }
        if (item.label === "Backend Enterprise v1") {
          return {
            ...item,
            value: snapshot.versionLabel,
            description:
              "Se consultaron endpoints públicos de health/readiness sin autenticación obligatoria.",
          };
        }
        return item;
      }),
      capabilities: scenario.evidence.capabilities.map((item) =>
        liveEvidence[item.name]
          ? {
              ...item,
              evidence: liveEvidence[item.name],
            }
          : item,
      ),
    },
  };
}

function buildLiveEvidence(probes: LiveProbe[]): Record<string, string> {
  const summary = probes
    .map((probe) => {
      const code = probe.statusCode == null ? "unreachable" : `HTTP ${probe.statusCode}`;
      return `${probe.path}: ${code}`;
    })
    .join(" · ");

  return {
    Observability: `Live read-only probes ejecutados: ${summary}.`,
    "Production Ready": `Backend Enterprise v1 respondió al menos un endpoint público: ${summary}.`,
  };
}

function replaceSignals(signals: DemoSignal[], next: DemoSignal[]): DemoSignal[] {
  const replacements = new Map(next.map((signal) => [signal.label, signal]));
  return signals.map((signal) => replacements.get(signal.label) ?? signal);
}