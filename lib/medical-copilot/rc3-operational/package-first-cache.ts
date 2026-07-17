type CacheEntry = { packagePayload: unknown; fetchedAt: number };

/** RC4 — session package cache TTL (ms). */
export const RC4_PACKAGE_CACHE_TTL_MS = 60_000;
const RC4_PACKAGE_CACHE_MAX_SESSIONS = 32;

const orchestratorBySession = new Map<string, CacheEntry>();
const workflowBySession = new Map<string, CacheEntry>();

function isFresh(entry: CacheEntry | undefined): entry is CacheEntry {
  if (!entry) return false;
  return Date.now() - entry.fetchedAt <= RC4_PACKAGE_CACHE_TTL_MS;
}

function evictOldest(map: Map<string, CacheEntry>): void {
  if (map.size < RC4_PACKAGE_CACHE_MAX_SESSIONS) return;
  let oldestKey: string | null = null;
  let oldest = Number.POSITIVE_INFINITY;
  for (const [k, v] of map) {
    if (v.fetchedAt < oldest) {
      oldest = v.fetchedAt;
      oldestKey = k;
    }
  }
  if (oldestKey) map.delete(oldestKey);
}

const ORCH_FIELD_BY_SUFFIX: Record<string, string> = {
  "governed-clinical-orchestrator-runtime": "clinicalOrchestratorRuntime",
  "governed-clinical-context-aggregator": "clinicalContextAggregator",
  "governed-clinical-intelligence-aggregator": "clinicalIntelligenceAggregator",
  "governed-knowledge-aggregator": "knowledgeAggregator",
  "governed-evidence-aggregator": "evidenceAggregator",
  "governed-guideline-aggregator": "guidelineAggregator",
  "governed-decision-aggregator": "decisionAggregator",
  "governed-calculation-aggregator": "calculationAggregator",
  "governed-longitudinal-aggregator": "longitudinalAggregator",
  "governed-therapeutic-aggregator": "therapeuticAggregator",
  "governed-diagnostic-aggregator": "diagnosticAggregator",
  "governed-population-aggregator": "populationAggregator",
  "governed-persistence-aggregator": "persistenceAggregator",
  "governed-reasoning-aggregator": "reasoningAggregator",
  "governed-suggestion-aggregator": "suggestionAggregator",
  "governed-rule-aggregator": "ruleAggregator",
  "governed-safety-aggregator": "safetyAggregator",
  "governed-governance-aggregator": "governanceAggregator",
  "governed-audit-aggregator": "auditAggregator",
};

const WF_FIELD_BY_SUFFIX: Record<string, string> = {
  "governed-clinical-consultation-workflow": "clinicalConsultationWorkflow",
  "governed-clinical-documentation-workflow": "clinicalDocumentationWorkflow",
  "governed-clinical-reasoning-workflow": "clinicalReasoningWorkflow",
  "governed-clinical-decision-workflow": "clinicalDecisionWorkflow",
  "governed-clinical-intelligence-workflow": "clinicalIntelligenceWorkflow",
  "governed-clinical-knowledge-workflow": "clinicalKnowledgeWorkflow",
  "governed-clinical-evidence-workflow": "clinicalEvidenceWorkflow",
  "governed-clinical-guidelines-workflow": "clinicalGuidelinesWorkflow",
  "governed-clinical-calculation-workflow": "clinicalCalculationWorkflow",
  "governed-clinical-safety-workflow": "clinicalSafetyWorkflow",
  "governed-clinical-validation-workflow": "clinicalValidationWorkflow",
  "governed-clinical-physician-review-workflow": "clinicalPhysicianReviewWorkflow",
  "governed-clinical-persistence-workflow": "clinicalPersistenceWorkflow",
  "governed-clinical-audit-workflow": "clinicalAuditWorkflow",
  "governed-clinical-analytics-workflow": "clinicalAnalyticsWorkflow",
  "governed-clinical-population-workflow": "clinicalPopulationWorkflow",
  "governed-clinical-marketplace-workflow": "clinicalMarketplaceWorkflow",
  "governed-clinical-dashboard-workflow": "clinicalDashboardWorkflow",
  "governed-clinical-session-workflow": "clinicalSessionWorkflow",
};

function sessionIdFromPath(path: string): string | null {
  const m = path.match(/\/session\/([^/]+)\//);
  return m ? decodeURIComponent(m[1]) : null;
}

function suffixFromPath(path: string): string | null {
  const m = path.match(/\/session\/[^/]+\/([^?]+)/);
  return m ? m[1] : null;
}

function unwrapPackage(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  if (root.data && typeof root.data === "object") return root.data as Record<string, unknown>;
  return root;
}

function envelopeFromSurface(surface: unknown, reason: string): unknown {
  return {
    status: "ok",
    data: surface,
    reason,
    executesAction: false,
    autoPersistedToEmr: false,
    requiresPhysicianReview: true,
  };
}

export function rememberOrchestratorPackage(sessionId: string, payload: unknown): void {
  evictOldest(orchestratorBySession);
  orchestratorBySession.set(sessionId, { packagePayload: payload, fetchedAt: Date.now() });
}

export function rememberWorkflowPackage(sessionId: string, payload: unknown): void {
  evictOldest(workflowBySession);
  workflowBySession.set(sessionId, { packagePayload: payload, fetchedAt: Date.now() });
}

/** Si hay package en cache, proyecta superficie sin nuevo fetch. */
export function tryProjectGovernedPackageFirst(path: string): unknown | null {
  if (!path.includes("/medical-copilot/")) return null;
  const sessionId = sessionIdFromPath(path);
  const suffix = suffixFromPath(path);
  if (!sessionId || !suffix) return null;

  if (suffix === "governed-clinical-ai-orchestrator-package") return null;
  if (suffix === "governed-clinical-workflow-engine-package") return null;

  const orchField = ORCH_FIELD_BY_SUFFIX[suffix];
  if (orchField) {
    const entry = orchestratorBySession.get(sessionId);
    if (!isFresh(entry)) {
      if (entry) orchestratorBySession.delete(sessionId);
      return null;
    }
    const pkg = unwrapPackage(entry.packagePayload);
    if (!pkg || pkg[orchField] === undefined) return null;
    return envelopeFromSurface(pkg[orchField], `rc3_package_first_${orchField}`);
  }

  const wfField = WF_FIELD_BY_SUFFIX[suffix];
  if (wfField) {
    const entry = workflowBySession.get(sessionId);
    if (!isFresh(entry)) {
      if (entry) workflowBySession.delete(sessionId);
      return null;
    }
    const pkg = unwrapPackage(entry.packagePayload);
    if (!pkg || pkg[wfField] === undefined) return null;
    return envelopeFromSurface(pkg[wfField], `rc3_package_first_${wfField}`);
  }

  return null;
}

export function maybeRememberPackage(path: string, payload: unknown): void {
  const sessionId = sessionIdFromPath(path);
  const suffix = suffixFromPath(path);
  if (!sessionId || !suffix) return;
  if (suffix === "governed-clinical-ai-orchestrator-package") {
    rememberOrchestratorPackage(sessionId, payload);
  }
  if (suffix === "governed-clinical-workflow-engine-package") {
    rememberWorkflowPackage(sessionId, payload);
  }
}

export function __rc3ClearPackageCacheForTests(): void {
  orchestratorBySession.clear();
  workflowBySession.clear();
}
