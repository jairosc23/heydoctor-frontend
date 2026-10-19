import type { ClinicalActId, ClinicalCompletionSnapshot } from "./types";

const CURRENT_PREFIX = "hd.clinical-completion.current.v1:";
const ACT_PREFIX = "hd.clinical-act.v1:";

const currentByConsultation = new Map<string, ClinicalActId>();
const acts = new Map<ClinicalActId, ClinicalCompletionSnapshot>();

function currentKey(consultationId: string): string {
  return `${CURRENT_PREFIX}${consultationId}`;
}

function actKey(clinicalActId: ClinicalActId): string {
  return `${ACT_PREFIX}${clinicalActId}`;
}

function readStorage(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode / quota */
  }
}

export function loadClinicalActById(
  clinicalActId: ClinicalActId,
): ClinicalCompletionSnapshot | null {
  const cached = acts.get(clinicalActId);
  if (cached) return cached;
  const raw = readStorage(actKey(clinicalActId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ClinicalCompletionSnapshot;
    if (parsed?.clinicalActId !== clinicalActId) return null;
    acts.set(clinicalActId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function loadClinicalCompletionSnapshot(
  consultationId: string,
): ClinicalCompletionSnapshot | null {
  const cachedId = currentByConsultation.get(consultationId);
  if (cachedId) return loadClinicalActById(cachedId);
  const currentId = readStorage(currentKey(consultationId));
  if (currentId) {
    currentByConsultation.set(consultationId, currentId);
    return loadClinicalActById(currentId);
  }
  return null;
}

export function saveClinicalCompletionSnapshot(
  snapshot: ClinicalCompletionSnapshot,
  options: { asCurrent?: boolean } = {},
): ClinicalCompletionSnapshot {
  acts.set(snapshot.clinicalActId, snapshot);
  writeStorage(actKey(snapshot.clinicalActId), JSON.stringify(snapshot));
  const asCurrent = options.asCurrent ?? snapshot.supersededBy == null;
  if (asCurrent) {
    currentByConsultation.set(snapshot.consultationId, snapshot.clinicalActId);
    writeStorage(currentKey(snapshot.consultationId), snapshot.clinicalActId);
  }
  return snapshot;
}

export function clearClinicalCompletionSnapshots(): void {
  currentByConsultation.clear();
  acts.clear();
  if (typeof localStorage === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (
      key?.startsWith(CURRENT_PREFIX) ||
      key?.startsWith(ACT_PREFIX) ||
      key?.startsWith("hd.clinical-completion.v1:")
    ) {
      keys.push(key);
    }
  }
  for (const key of keys) localStorage.removeItem(key);
}
