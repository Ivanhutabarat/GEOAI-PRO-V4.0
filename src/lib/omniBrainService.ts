import { ComprehensiveMathEngine } from './ComprehensiveMathEngine';

export interface InferencePayload {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export function isApiActiveGlobal(): boolean {
  let mode = 'DUMMY';
  try {
    mode = localStorage.getItem('geoai_mode') || 'DUMMY';
  } catch (e) {}
  return mode === 'LIVE';
}

export async function executeInference(payload: InferencePayload): Promise<any> {
  const isLive = isApiActiveGlobal();
  const endpoint = payload.endpoint;

  if (!isLive) {
    console.warn(`🛑 [OMNI-BRAIN] DUMMY MODE ACTIVE: Severed connection to ${endpoint}. Returning simulated offline response.`);
    return generateMockResponse(payload);
  }

  console.log(`🌐 [OMNI-BRAIN] LIVE MODE ACTIVE: Transmitting payload to API: ${endpoint}...`);
  
  const options: RequestInit = {
    method: payload.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(payload.headers || {}),
    }
  };

  if (payload.body) {
    options.body = typeof payload.body === 'string' ? payload.body : JSON.stringify(payload.body);
  }

  const response = await fetch(endpoint, options);
  if (!response.ok) {
    throw new Error(`API returned HTTP ${response.status}`);
  }
  return response;
}

export function generateMockResponse(payload: InferencePayload): any {
  const endpoint = payload.endpoint;
  let body: any = {};
  try {
    body = typeof payload.body === 'string' ? JSON.parse(payload.body) : (payload.body || {});
  } catch (e) {
    body = {};
  }
  
  // Custom response mapper based on the target endpoint
  if (endpoint.includes('/api/swarm/debate')) {
    const activeModule = body.activeModule || 'General';
    const activeAgents = body.activeAgents || [
      { id: "GV", name: "Dr. Marcus Vance" },
      { id: "GR", name: "Dr. Elena Rostova" },
      { id: "PT", name: "Dr. Sarah Lin" }
    ];

    const parsedData = body.spatialData || {};
    const result = ComprehensiveMathEngine.analyze(parsedData, activeModule);

    const fallbackDebate = activeAgents.map((agent: any, index: number) => {
      let content = "";
      if (index === 0) content = result.marcusText || `Reviewing direct dataset wavelets and metrics locally.`;
      else if (index === 1) content = result.elenaText || `Assessing fault block structural boundaries locally.`;
      else content = result.sarahText || `Calculating logging metrics and boundary saturation parameters.`;

      let role = agent.role || "Expert Analyst";
      let faction = agent.faction || "⚙️ OPERATIONS & SUPPLY CHAIN";

      return {
        agent: agent.name,
        role,
        faction,
        stance: index % 2 === 0 ? "PRO" : "CON",
        reasoning: "Validated via local analytical coprocessing core",
        content,
        avatar: agent.avatar || agent.id || "EX"
      };
    });

    const userMsg = (body.message || "").toLowerCase();
    const isStormy = activeModule.toLowerCase().includes('meteorology') || userMsg.includes('badai') || userMsg.includes('cuaca') || userMsg.includes('evacuate');
    const isDrillProtest = userMsg.includes('titik') || userMsg.includes('drill') || userMsg.includes('investor') || userMsg.includes('sesar') || userMsg.includes('patahan');

    if (isStormy) {
      fallbackDebate.push({
        agent: "Prof. Dwikorita (BMKG Climatology Director)",
        role: "Climatology & Hazard Lead",
        faction: "🏛️ GOVERNMENT & REGULATORS",
        stance: "CON",
        reasoning: "Extreme wind shear and cyclone warning active.",
        content: "[MATH CORE] Cyclone alert calibrated offline. Wind velocity 95 km/h exceeds safe structural limit of 50 km/h. Running barometric gradient dP/dt = -3.5 hPa/hr, confirming imminent landfall. We mandate immediate evacuation of the drilling pad.",
        avatar: "BMK"
      });
    } else if (isDrillProtest) {
      fallbackDebate.push({
        agent: "Ir. Bambang (SKK Migas Senior Regulator)",
        role: "Compliance & Safety Auditor",
        faction: "🏛️ GOVERNMENT & REGULATORS",
        stance: "NEUTRAL",
        reasoning: "Licensing and geomechanical integrity audit triggered.",
        content: "[MATH CORE] Audit verification initiated offline. With a fault probability of 0.98 at Grid Y:30, starting operations will trigger an immediate suspension under Section 12-B. The pore pressure drop exceeds the safety threshold. We require a complete geomechanical hold.",
        avatar: "SKK"
      });
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        debate: fallbackDebate,
        isFallback: true
      })
    };
  }

  if (endpoint.includes('/api/master-synthesize')) {
    const message = body.message || '';
    let reply = `### SYSTEM OMNI-BRAIN SYNTHESIS REPORT\n\n[OMNI-BRAIN LOCAL CORE] Analysed geological parameters offline. No single decision dominates; all conflicting faction data is weighted with equal status.\n\n- **Stability Parameters:** Standard crustal structures evaluated.\n- **HSE & Capital Spectrum:** Complete balance maintained. Operational targets and geomechanical safety thresholds are in direct dialogue.\n- **Arbitration Stance:** Strictly neutral. Faction perspectives must be negotiated through the primary debate boards.`;
    
    if (message.toLowerCase().includes('anomaly') || message.toLowerCase().includes('critical') || message.toLowerCase().includes('leak') || message.toLowerCase().includes('badai') || message.toLowerCase().includes('sesar') || message.toLowerCase().includes('evacuate')) {
      reply = `### ⚠️ CRITICAL BOARDROOM TENSION ALERT\n\n[OMNI-BRAIN LOCAL CORE] has detected a major conflict in strategic directives.\n\n- **Corporate Objective:** Complete operational continuity to secure reserves.\n- **Environmental & Safety Boundary:** Severe active risk (atmospheric wind, fault slippage probability, or compaction hazards).\n- **Arbitration Directive:** The AI Master remains strictly neutral. Both Proceeding and Evacuating options carry significant, valid weight and catastrophic risks on either side. A boardroom vote or manual consensus is required to resolve this friction.`;
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        reply
      })
    };
  }

  if (endpoint.includes('/api/whatsapp/qr')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        qr: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 4 4'><rect width='4' height='4' fill='white'/><rect x='0' y='0' width='1' height='1' fill='black'/><rect x='3' y='0' width='1' height='1' fill='black'/><rect x='0' y='3' width='1' height='1' fill='black'/><rect x='2' y='2' width='1' height='1' fill='black'/></svg>"
      })
    };
  }

  if (endpoint.includes('/api/whatsapp/authenticate')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        authenticated: true,
        token: "offline_mock_auth_token_ready"
      })
    };
  }

  if (endpoint.includes('/api/whatsapp/simulate-incoming')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        logs: [
          { sender: "Admin", text: "Offline simulation: Ingestion port confirmed." }
        ],
        message: "Offline Simulation Completed"
      })
    };
  }

  if (endpoint.includes('/api/ingest-journal')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        file: body.fileName || "journal.pdf"
      })
    };
  }

  if (endpoint.includes('/api/support/submit')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        ticketId: Math.floor(Math.random() * 89999 + 10000)
      })
    };
  }

  if (endpoint.includes('/api/integrity-check')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        healthy: true,
        status: "SECURE"
      })
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      message: "Offline default response"
    })
  };
}
