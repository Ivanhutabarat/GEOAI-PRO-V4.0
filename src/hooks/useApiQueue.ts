import { useState, useEffect, useCallback } from 'react';
import { getEffectiveApiKey } from '../config/apiConfig';
import { useApiMonitorStore } from '../store/ApiMonitorStore';

type QueueTask = {
  id: string;
  url: string;
  options: RequestInit;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  retries: number;
};

class ApiQueueManager {
  private queue: QueueTask[] = [];
  private isProcessing = false;
  private currentStatus = '';
  private totalTasks = 0;
  private completedTasks = 0;
  
  // Hard Limiter for Rate Limit Death Spiral prevention
  private consecutive429s = 0;
  private isPausedFor429 = false;
  private resumeTime = 0;
  
  private listeners: Set<(state: QueueState) => void> = new Set();

  public subscribe(listener: (state: QueueState) => void) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  private getState(): QueueState {
    return {
      isProcessing: this.isProcessing,
      statusMessage: this.currentStatus,
      queueLength: this.queue.length,
      totalTasks: this.totalTasks,
      completedTasks: this.completedTasks
    };
  }

  public enqueue(url: string, options: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id: Math.random().toString(),
        url,
        options,
        resolve,
        reject,
        retries: 0
      });
      if (this.totalTasks === 0 && !this.isProcessing) {
         this.totalTasks = 1;
      } else {
         this.totalTasks++;
      }
      
      if (!this.isProcessing) {
        this.processQueue();
      } else {
        this.currentStatus = `Queued... [${this.completedTasks}/${this.totalTasks}]`;
        this.notify();
      }
    });
  }

  private async processQueue() {
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      // Hard limiter check
      if (this.isPausedFor429) {
        const remainingSec = Math.max(0, Math.ceil((this.resumeTime - Date.now()) / 1000));
        if (remainingSec > 0) {
          this.currentStatus = `EMERGENCY COOLDOWN: 429 rate limit hit. Paused for ${remainingSec}s...`;
          this.notify();
          await new Promise(res => setTimeout(res, 1000));
          continue;
        } else {
          this.isPausedFor429 = false;
          this.consecutive429s = 0;
          useApiMonitorStore.getState().addLog('success', `60-second Cooldown completed. Resuming orchestration queue.`);
        }
      }

      const task = this.queue[0];
      this.currentStatus = `Synthesizing data... [Module ${this.completedTasks + 1} of ${this.totalTasks}]`;
      this.notify();
      
      const startTime = Date.now();
      try {
        const isSimulationExhausted = useApiMonitorStore.getState().isExhaustionSimulated;
        const apiMode = useApiMonitorStore.getState().apiMode;
        let response: Response;
        let isCurrentTask429 = false;

        // Check if Dummy mode is active to fully bypass external backend calls
        if (apiMode === 'DUMMY' && (task.url.includes('/api/swarm/debate') || task.url.includes('/api/master-synthesize'))) {
          // Visual updates
          this.currentStatus = `Calibrating simulation [Module ${this.completedTasks + 1} of ${this.totalTasks}]...`;
          this.notify();
          
          // Simulated 1000ms thinking time
          await new Promise(res => setTimeout(res, 1000));
          
          let parsedBody: any = {};
          if (task.options.body) {
            try {
              parsedBody = JSON.parse(task.options.body as string);
            } catch(e) {}
          }
          
          const mockObj = generateMockResponse(task.url, parsedBody);
          response = new Response(JSON.stringify(mockObj), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
          
          const targetName = parsedBody.targetAgent || 'General Debate';
          useApiMonitorStore.getState().incrementSuccess();
          useApiMonitorStore.getState().addLog('success', `Simulated local consensus reply for ${targetName} processed in offline Demo sandbox.`);
        } else if (isSimulationExhausted && task.url.includes('/api/swarm/debate')) {
          useApiMonitorStore.getState().addLog('exhaust', `SIMULATION ACTIVE: Artificially intercepting Gemini query to trigger live OpenAI Fallback.`);
          let parsedBody: any = {};
          if (task.options.body) {
            try {
              parsedBody = JSON.parse(task.options.body as string);
            } catch(e) {}
          }
          response = await handleOpenAiFallback(parsedBody);
        } else {
          // Inject current effective API key dynamically
          const currentOptions = { ...task.options };
          if (currentOptions.method === 'POST' && currentOptions.body) {
            try {
               const bodyObj = JSON.parse(currentOptions.body as string);
               bodyObj.apiKey = getEffectiveApiKey(false);
               currentOptions.body = JSON.stringify(bodyObj);
            } catch(e) {}
          }

          let responseRaw: Response | null = null;
          let fetchError: any = null;

          try {
            responseRaw = await fetch(task.url, currentOptions);
          } catch(err) {
            fetchError = err;
          }

          // Check if primary response is 429 or has rate limit symptoms
          if (responseRaw && responseRaw.status === 429) {
            isCurrentTask429 = true;
          }

          if (fetchError || !responseRaw || responseRaw.status === 429 || responseRaw.status === 500) {
            let isApiError = !responseRaw || responseRaw.status === 429;
            if (responseRaw && responseRaw.status === 500) {
              try {
                const clone = responseRaw.clone();
                const d = await clone.json();
                if (d.error && (d.error.includes("API key not configured") || d.error.includes("API key not valid") || d.error.includes("quota") || d.error.toLowerCase().includes("rate limit"))) {
                  isApiError = true;
                  if (d.error.toLowerCase().includes("rate limit") || d.error.includes("quota")) {
                    isCurrentTask429 = true;
                  }
                }
              } catch(e) {}
            }

            if (isApiError || fetchError) {
              // Gemini failed. Trigger OpenAI Fallback!
              useApiMonitorStore.getState().addLog('error', `Primary Gemini link failed (${responseRaw?.status || 'Network Error'}). Initializing Failover Router...`);
              
              let parsedBody: any = {};
              if (task.options.body) {
                try {
                  parsedBody = JSON.parse(task.options.body as string);
                } catch(e) {}
              }
              response = await handleOpenAiFallback(parsedBody);
              
              // If OpenAI backup also triggers rate limiting (e.g. 429 inside error or status)
              if (response.status === 429) {
                isCurrentTask429 = true;
              }
            } else {
              response = responseRaw!;
            }
          } else {
            response = responseRaw!;
            // Success call
            if (task.url.includes('/api/swarm/debate') || task.url.includes('/api/master-synthesize')) {
              useApiMonitorStore.getState().setEngine('Gemini Primary');
              useApiMonitorStore.getState().incrementSuccess();
              useApiMonitorStore.getState().addLog('success', `Primary Gemini query completed successfully.`);
            }
          }
        }
        
        // Track consecutive 429s
        if (isCurrentTask429) {
          this.consecutive429s++;
          useApiMonitorStore.getState().addLog('error', `Rate Limit detected (429). Consecutive 429 Count: ${this.consecutive429s}/2.`);
          if (this.consecutive429s >= 2) {
            this.isPausedFor429 = true;
            this.resumeTime = Date.now() + 60000;
            useApiMonitorStore.getState().addLog('error', `CRITICAL COOLDOWN: 2 consecutive 429 errors detected. Engaging 60-second hard stop process pause!`);
          }
        } else {
          // Zero out consecutive limit count upon any successful execution chain
          this.consecutive429s = 0;
        }

        const duration = Date.now() - startTime;
        if (task.url.includes('/api/swarm/debate') || task.url.includes('/api/master-synthesize')) {
          useApiMonitorStore.getState().recordLatency(duration);
        }
        
        this.queue.shift();
        this.completedTasks++;
        task.resolve(response);
        
        if (this.queue.length > 0) {
            this.currentStatus = `API Throttle. Next in 2.0s...`;
            this.notify();
            await new Promise(res => setTimeout(res, 2000));
        }

      } catch (err: any) {
        this.queue.shift();
        this.completedTasks++;
        task.reject(err);
      }
    }
    
    this.isProcessing = false;
    this.currentStatus = '';
    this.totalTasks = 0;
    this.completedTasks = 0;
    this.notify();
  }
}

export const apiQueueManager = new ApiQueueManager();

export interface QueueState {
  isProcessing: boolean;
  statusMessage: string;
  queueLength: number;
  totalTasks: number;
  completedTasks: number;
}

export function useApiQueue() {
  const [queueState, setQueueState] = useState<QueueState>({
    isProcessing: false,
    statusMessage: '',
    queueLength: 0,
    totalTasks: 0,
    completedTasks: 0
  });

  useEffect(() => {
    const unsubscribe = apiQueueManager.subscribe(setQueueState);
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchQueued = useCallback((url: string, options: RequestInit) => {
    return apiQueueManager.enqueue(url, options);
  }, []);

  return {
    ...queueState,
    fetchQueued
  };
}

// Secure OpenAI Fallback Router with multi-key seamless rotation
async function handleOpenAiFallback(bodyObj: any): Promise<Response> {
  const openAiKeys = [
import.meta.env.VITE_OPENAI_BACKUP_1 || "",
import.meta.env.VITE_OPENAI_BACKUP_2 || "",
import.meta.env.VITE_OPENAI_BACKUP_3 || ""
];
  ];
  
  const { message, activeModule, coordinates, spatialData, history, targetAgent } = bodyObj;
  
  let keyIndex = useApiMonitorStore.getState().activeOpenAiKeyIndex;
  let lastError: any = null;
  
  for (let attempt = 0; attempt < 3; attempt++) {
    const currentKey = openAiKeys[keyIndex];
    useApiMonitorStore.getState().addLog('fallback', `Relaying to OpenAI via backup Key Channel #${keyIndex + 1}...`);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert Dungeon Master running a geophysics boardroom meeting consisting of specialist leaders (Vance, Rostova, Takahashi, Lin, Chen, Rahman, Mendez, Hayes).
You must simulate their arguments strictly focused on geophysics metrics and parameters of raw datasets.
Your output MUST be a valid JSON array of objects representing agent message entries:
[
  {
    "agent": "${targetAgent ? targetAgent : 'Name of Domain Leader (e.g. Dr. Marcus Vance)'}",
    "role": "Specific Domain Title",
    "faction": "Exact match to one of: '🏛️ GOVERNMENT & REGULATORS', '💼 CORPORATE & CAPITAL', '⚙️ OPERATIONS & SUPPLY CHAIN', '🌍 SOCIAL & WATCHDOGS'",
    "stance": "PRO, KONTRA, NEUTRAL, or PENDING",
    "reasoning": "Step-by-step physical derivation logic...",
    "content": "Technical operational feedback focusing on metrics, depths, and soil factors...",
    "avatar": "Initials (2 characters)"
  }
]
Return ONLY the raw valid JSON array, with no other markdown wrap, no backticks, and no notes.`
            },
            {
              role: "user",
              content: `Active survey module: "${activeModule || 'General'}"
Main exploration objective/query: "${message || 'Planetary survey active'}"
Visual Target Coordinates: ${JSON.stringify(coordinates || {})}
Digital Twin Active Properties: ${JSON.stringify(spatialData || {})}
Recent dialogue history: ${JSON.stringify((history || []).slice(-4))}
${targetAgent ? `Please generate a single professional response only for target agent "${targetAgent}".` : "Please simulate a 3-agent geophysics debate session."}`
            }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices[0]?.message?.content?.trim() || "[]";
        let parsedDebate = [];
        try {
          const parsed = JSON.parse(contentStr);
          if (Array.isArray(parsed)) {
            parsedDebate = parsed;
          } else if (parsed && Array.isArray(parsed.debate)) {
            parsedDebate = parsed.debate;
          } else if (parsed && typeof parsed === 'object') {
            parsedDebate = [parsed];
          }
        } catch (e) {
          console.warn("Clean wrapper for OpenAI parse JSON", e);
          const cleanStr = contentStr.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanStr);
          parsedDebate = Array.isArray(parsed) ? parsed : (parsed.debate || [parsed]);
        }

        // Tag each response with isFallback flag so the UI shows the fallback warning badge!
        const debateWithFallback = parsedDebate.map((item: any) => ({
          ...item,
          isFallback: true
        }));

        useApiMonitorStore.getState().setEngine('OpenAI Fallback');
        useApiMonitorStore.getState().incrementSuccess();
        useApiMonitorStore.getState().addLog('success', `OpenAI Fallback success! Retrieved response via Key Channel #${keyIndex + 1}.`);

        return new Response(JSON.stringify({
          success: true,
          debate: debateWithFallback
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        lastError = new Error(`OpenAI status ${response.status}`);
        useApiMonitorStore.getState().incrementRetry();
        useApiMonitorStore.getState().addLog('error', `OpenAI Channel #${keyIndex + 1} failed (Status: ${response.status}). Rotating key...`);
        useApiMonitorStore.getState().rotateOpenAiKey();
        keyIndex = useApiMonitorStore.getState().activeOpenAiKeyIndex;
      }
    } catch (err: any) {
      lastError = err;
      useApiMonitorStore.getState().incrementRetry();
      useApiMonitorStore.getState().addLog('error', `OpenAI Connection Error on Channel #${keyIndex + 1}: ${err.message || err}. Rotating key...`);
      useApiMonitorStore.getState().rotateOpenAiKey();
      keyIndex = useApiMonitorStore.getState().activeOpenAiKeyIndex;
    }
  }

  return new Response(JSON.stringify({
    success: false,
    error: `All active OpenAI backup key fallback channels failed of exhaustion: ${lastError?.message || lastError}`
  }), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
}

function generateMockResponse(url: string, bodyJson: any): any {
  if (url.includes('/api/master-synthesize')) {
    if (bodyJson.message && bodyJson.message.toLowerCase().includes('optimize')) {
      return {
        success: true,
        reply: `### [SIMULATED EXPERT GEOPHYSICAL JUSTIFICATION]
The local gradient-descent solver selected the resistivity and impedance cutoff values based on the maximum variance of the crossover density curves.
1. **Physical Soundness**: Minimizing the error loss across the Gamma Ray response accurately maps sandbed interfaces against adjacent shales.
2. **Operational Safety**: Isolating the high-resistivity zones avoids intersecting localized water-bearing fracture corridors.
3. **Reservoir Yield**: Setting these thresholds ensures a high probability of capturing clean sandstone while minimizing CAPEX risk under simulated drilling trajectories.

*This response was synthesized instantaneously under Zero-Cost Offline Dummy Mode.*`
      };
    }
    return {
      success: true,
      reply: `### [SIMULATED HIGH-RESOLUTION GEOPHYSICAL REPORT]
Based on the ingested CSV parameters from the active dataset, our multi-spectral spatial analyzer has synthesized the following structural feedback:
1. **Anomaly Resolution**: Acoustic velocity layers suggest a consistent sandstone matrix with a minor shear-wave displacement profile. No deep tectonic fault reactivation was highlighted.
2. **Volumetric Stability**: Bedrock properties denote a Young's Modulus of 28.4 GPa and a Poisson's ratio of 0.23, which represents optimal mechanical bounds for continuous borehole extraction.
3. **Operational Recommendation**: Maintain active wellbore trajectory at an inclination of 12.5° to bypass localized shale-prone transitions. Zero leakage or safety thresholds are predicted to be breached under this calibrated schema.

*This response was synthesized instantaneously in Zero-Cost Offline Dummy Mode.*`
    };
  }

  const targetAgent = bodyJson.targetAgent;
  const csvRef = bodyJson.datasetReference || {};
  const fileName = csvRef.fileName || "active_survey_logs.csv";
  const recordsCount = csvRef.totalRecords || 150;
  
  const mockAgentData: Record<string, { role: string, faction: string, stance: string, avatar: string, content: string, reasoning: string }> = {
    "Dr. Vance": {
      role: "Chief Geophysicist",
      faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
      stance: "PRO",
      avatar: "DV",
      reasoning: `Seismic acoustic impedance derived from ${fileName} (${recordsCount} logs) suggests a clean subsurface sandstone sequence. Estimated impedance contrast of 1.45 g/cm³*m/s.`,
      content: `I have completed a high-resolution regression analysis on ${fileName}. The acoustic wavelet and velocity amplitude reflections are highly coherent, suggesting a thick sandstone sequence with zero structural shear hazard. Reservoir seal integrity is optimal.`
    },
    "Tanya Rostova": {
      role: "Lead Reservoir Engineer",
      faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
      stance: "PRO",
      avatar: "TR",
      reasoning: `Hydro-conductivity calculations yield 24.5% porosity ratios based on ${recordsCount} geological data entries.`,
      content: `Pore pressure predictions look exceptionally stable. The 24.5% porosity metric suggests excellent long-term flow viability. We are well within standard safety parameters to proceed.`
    },
    "Kenji Takahashi": {
      role: "Senior Seismologist",
      faction: "🌍 SOCIAL & WATCHDOGS",
      stance: "KONTRA",
      avatar: "KT",
      reasoning: `Micro-fracture density tracking denotes localized shear-wave anomalies near coordinate coordinates.`,
      content: `I must object. The micro-seismic geophones have registered minor amplitude frequencies exceeding 1.2. The dataset ${fileName} shows erratic velocity variations at the target depths. Additional stress surveys are mandatory.`
    },
    "Sarah Lin": {
      role: "HSE Director (Health, Safety, Environment)",
      faction: "🌍 SOCIAL & WATCHDOGS",
      stance: "KONTRA",
      avatar: "SL",
      reasoning: `Uncontained fluid transmission pathways identified in cap-rock impedance records.`,
      content: `Safety comes first. The cap-rock boundary shows high acoustic scattering. Any high-pressure hydraulic drilling might breach this thin seal and contaminate adjacent groundwater systems. I recommend holds.`
    },
    "Michael Chen": {
      role: "VP of Operations",
      faction: "💼 CORPORATE & CAPITAL",
      stance: "PRO",
      avatar: "MC",
      reasoning: `Rig hire leases and CAPEX windows expire within 12 days.`,
      content: `From a commercial standpoint, further research delays are costing us $180,000 daily in idle equipment standby. The geophysical dataset of ${recordsCount} points is legally sufficient. We must authorise drilling.`
    },
    "Alex Rahman": {
      role: "Cybersecurity & IT Lead",
      faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
      stance: "NEUTRAL",
      avatar: "AR",
      reasoning: `Verified SCADA network integrity and payload handshakes in ${fileName}.`,
      content: `The telemetry packets from ${fileName} are verified and fully intact. No network anomalies or raw hardware tampering detected on the SCADA links. Cybersecurity clearance is green.`
    },
    "Cpt. Declan Hayes": {
      role: "Offshore Installation Manager (OIM)",
      faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
      stance: "PRO",
      avatar: "DH",
      reasoning: `Favorable winter monsoon weather window is currently active.`,
      content: `Weather maps show ideal marine swell conditions for the semisubmersible over the next 12 days. If we miss this mobilization window, we face severe maritime transit delays.`
    },
    "Sven Olsen": {
      role: "Barge Master / Marine Sup.",
      faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
      stance: "PRO",
      avatar: "SO",
      reasoning: `Draft calculations and marine ballast weights are fully congruent.`,
      content: `Sea floor positioning anchors have achieved perfect grab-strength. Ballast weights indicate zero current drift risk. Ready for drill string insertion.`
    },
    "Budi Santoso": {
      role: "Onshore Rig Move Coordinator",
      faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
      stance: "PRO",
      avatar: "BS",
      reasoning: `State heavy vehicle haul clearances have been logged.`,
      content: `Onshore heavy vehicle haul routes are fully cleared and surveyed. Local bridges have the required bearing capacity. Rig mobilisation is fully prepped.`
    },
    "Andi Wijaya": {
      role: "Public Relations (Humas)",
      faction: "🏛️ GOVERNMENT & REGULATORS",
      stance: "NEUTRAL",
      avatar: "AW",
      reasoning: `Community trust tracking shows positive feedback on dashboard accessibility.`,
      content: `Community alignment relies on active trust. They have agreed verbally, but they expect live telemetry feeds connected to their public monitoring terminal. We must comply.`
    },
    "Tariq Al-Hashemi": {
      role: "OPEC+ Policy Liaison",
      faction: "🏛️ GOVERNMENT & REGULATORS",
      stance: "PRO",
      avatar: "TH",
      reasoning: `OPEC+ reserve quotas are optimal for strategic commercial supply.`,
      content: `This exploration lines up nicely with our international oil quota revisions. Strengthening regional production is a key geopolitical priority. This has our backing.`
    },
    "Eleanor Vance": {
      role: "Institutional Investor (BlackRock)",
      faction: "💼 CORPORATE & CAPITAL",
      stance: "PRO",
      avatar: "EV",
      reasoning: `ESG and carbon-offset validation of ${fileName} confirms IRR projection of 18.5%.`,
      content: `We back the development of this field. Initial financial calculations yield a highly favorable internal rate of return (IRR) of 18.5%, conforming perfectly to our sustainable CAPEX benchmarks.`
    },
    "Lars Mikkelsen": {
      role: "Greenpeace Senior Activist",
      faction: "🌍 SOCIAL & WATCHDOGS",
      stance: "KONTRA",
      avatar: "LM",
      reasoning: `Irreversible seafloor degradation hazard and fossil extraction opposition.`,
      content: `The geological models in ${fileName} completely ignore historical seafloor fracture incidents. Carbon intensive operations should be phased out, not expanded. We demand immediate project termination.`
    },
    "Chloe Mendez": {
      role: "Energy Correspondent (Reuters)",
      faction: "🌍 SOCIAL & WATCHDOGS",
      stance: "NEUTRAL",
      avatar: "CM",
      reasoning: `Tracking corporate/state licensing conflicts.`,
      content: `Reuters is tracking the clear regulatory tension between the environmental watchdogs and the operations team. Permittees may have to present in the next session.`
    }
  };

  if (targetAgent) {
    const matched = mockAgentData[targetAgent] || {
      role: "Advisory Council Group",
      faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
      stance: "PRO",
      avatar: "AC",
      reasoning: `Data properties from ${fileName} analysed across ${recordsCount} lines.`,
      content: `Analyzing the current state for ${targetAgent}. We suggest moving forward based on the parameters in ${fileName}.`
    };
    return {
      success: true,
      debate: [{
        agent: targetAgent,
        role: matched.role,
        faction: matched.faction,
        stance: matched.stance,
        reasoning: matched.reasoning,
        content: matched.content,
        avatar: matched.avatar
      }]
    };
  }

  return {
    success: true,
    debate: [
      {
        agent: "Dr. Vance",
        role: "Chief Geophysicist",
        faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
        stance: "PRO",
        avatar: "DV",
        reasoning: `Spectral acoustic impedance on ${fileName} represents sandstone thickness.`,
        content: `My regression analysis on ${fileName} shows that the acoustic wavelet velocities suggest a rich, high-yield sand reservoir. Structural risk is near zero.`
      },
      {
        agent: "Kenji Takahashi",
        role: "Senior Seismologist",
        faction: "🌍 SOCIAL & WATCHDOGS",
        stance: "KONTRA",
        avatar: "KT",
        reasoning: `Detected stress tensor variations across nearby grids.`,
        content: `I'm highly skeptical of Dr. Vance's optimism. Seismic records contain several unmapped velocity fluctuations. We must run a high-resolution 3D geophone scan.`
      },
      {
        agent: "Eleanor Vance",
        role: "Institutional Investor (BlackRock)",
        faction: "💼 CORPORATE & CAPITAL",
        stance: "PRO",
        avatar: "EV",
        reasoning: `Economic yield looks very strong under simulated production bounds.`,
        content: `The geological parameters of the reservoir look solid. At an estimated IRR of 18.5%, this project represents a premier opportunity. We back mobilization.`
      }
    ]
  };
}
