import { getMedicalCopilotDiagnosticGapAnalyzer } from "../../api";
import { mapDiagnosticGapAnalyzerResultEnvelope } from "./diagnostic-gap-analyzer-mapper";
import type { DiagnosticGapAnalyzerResultBuilderResult } from "./diagnostic-gap-analyzer";

export async function getDiagnosticGapAnalyzer(sessionId: string): Promise<DiagnosticGapAnalyzerResultBuilderResult | null> {
  const envelope = await getMedicalCopilotDiagnosticGapAnalyzer(sessionId);
  return mapDiagnosticGapAnalyzerResultEnvelope(envelope.data ?? envelope);
}

export type DiagnosticGapAnalyzerReadAdapter = { getDiagnosticGapAnalyzer: typeof getDiagnosticGapAnalyzer };
export const gapAnalyzerReadAdapter: DiagnosticGapAnalyzerReadAdapter = { getDiagnosticGapAnalyzer };
