// src/lib/SwarmEngine.ts
import { Agent } from "../types";
import { AGENT_ROSTER } from "./AgentCatalog";
import { validateIdentity } from "./identityValidator";

export class SwarmEngine {
  private activeAgents: Agent[] = [];
  private currentPhase: number = 1;
  private consensusIteration: number = 0;

  constructor() {
    validateIdentity();
    // Clone roster to mutable state
    this.activeAgents = AGENT_ROSTER.map(a => ({ ...a }));
  }

  public getAgents(): Agent[] {
    validateIdentity();
    return this.activeAgents;
  }

  // Requirement 5B: calculateInitialStance deterministic logic
  public calculateInitialStance(riskMetric: number) {
    validateIdentity();
    this.activeAgents.forEach(agent => {
      // Deterministic based on personality/faction and riskMetric (0.0 to 1.0)
      if (agent.faction === "💼 CORPORATE & CAPITAL") {
        agent.stance = riskMetric < 0.6 ? "PRO" : "KONTRA";
      } else if (agent.faction === "🌍 SOCIAL & WATCHDOGS") {
        agent.stance = riskMetric > 0.3 ? "KONTRA" : "NEUTRAL";
      } else if (agent.faction === "⚙️ OPERATIONS & SUPPLY CHAIN") {
        agent.stance = riskMetric < 0.5 ? "PRO" : (riskMetric > 0.8 ? "KONTRA" : "NEUTRAL");
      } else {
        agent.stance = "NEUTRAL";
      }
      agent.status = "interacting";
    });
  }

  public iterateConsensus() {
    validateIdentity();
    this.consensusIteration++;
    this.resolveDeadlock();
  }

  // Requirement 5A: DeadlockResolver to force fallback to Phase 3 if > 3 iterations
  public resolveDeadlock(): boolean {
    validateIdentity();
    if (this.consensusIteration > 3) {
      console.warn("[DeadlockResolver] Consensus iteration > 3. Forcing fallback to Phase 3 (Executive Override).");
      this.currentPhase = 3;
      
      // Force consensus: corporate wins, watchdogs object, ops comply
      this.activeAgents.forEach(agent => {
        if (agent.faction === "💼 CORPORATE & CAPITAL") agent.stance = "PRO";
        else if (agent.faction === "🌍 SOCIAL & WATCHDOGS") agent.stance = "KONTRA";
        else agent.stance = "PRO"; 
      });
      return true; // Deadlock resolved
    }
    return false; // Still debating
  }

  public getPhase(): number {
    validateIdentity();
    return this.currentPhase;
  }
}

export const globalSwarmEngine = new SwarmEngine();
