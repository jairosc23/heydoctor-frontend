/**
 * AI-4 — OpenAI provider diagnostic contracts (frontend).
 * Reuses GovernedAIGatewayResult — never exposes SDK objects.
 */

export type {
  GatewayResponse,
  GovernedAIGatewayResult,
} from "./governed-ai-gateway";

export {
  GATEWAY_GOVERNANCE,
  GOVERNED_AI_GATEWAY_VERSION,
} from "./governed-ai-gateway";
