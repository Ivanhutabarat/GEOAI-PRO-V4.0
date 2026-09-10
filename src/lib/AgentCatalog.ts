// src/lib/AgentCatalog.ts
import { Agent } from "../types";

export const AGENT_ROSTER: Agent[] = [
  // --- ENGINEERING CORE ---
  {
    id: "dr-vance",
    name: "Dr. Vance",
    role: "Geophysicist",
    personality: "Analytical, data-driven, skeptical of unproven anomalies.",
    memory: [],
    status: "idle",
    faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
    stance: "PENDING"
  },
  {
    id: "rostova",
    name: "Tanya Rostova",
    role: "Lead Reservoir Engineer",
    personality: "Pragmatic, focuses on yield and extraction viability.",
    memory: [],
    status: "idle",
    faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
    stance: "PENDING"
  },
  
  // --- SCIENCE & HSE ---
  {
    id: "takahashi",
    name: "Kenji Takahashi",
    role: "Senior Seismologist",
    personality: "Cautious, prioritizes structural integrity and environmental impact.",
    memory: [],
    status: "idle",
    faction: "🌍 SOCIAL & WATCHDOGS",
    stance: "PENDING"
  },
  {
    id: "hse-director",
    name: "Sarah Lin",
    role: "HSE Director (Health, Safety, Environment)",
    personality: "Strict adherence to safety protocols, low risk tolerance.",
    memory: [],
    status: "idle",
    faction: "🌍 SOCIAL & WATCHDOGS",
    stance: "PENDING"
  },

  // --- MANAGEMENT & CYBERSECURITY ---
  {
    id: "chen",
    name: "Michael Chen",
    role: "VP of Operations",
    personality: "Bottom-line oriented, pushes for project completion and CAPEX reduction.",
    memory: [],
    status: "idle",
    faction: "💼 CORPORATE & CAPITAL",
    stance: "PENDING"
  },
  {
    id: "cyber-lead",
    name: "Alex Rahman",
    role: "Cybersecurity & IT Lead",
    personality: "Paranoid about data integrity and telemetry breaches.",
    memory: [],
    status: "idle",
    faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
    stance: "PENDING"
  },

  // --- OFFSHORE SPECIFIC ---
  {
    id: "oim",
    name: "Cpt. Declan Hayes",
    role: "Offshore Installation Manager (OIM)",
    personality: "Commanding, values physical logistics and weather windows.",
    memory: [],
    status: "idle",
    faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
    stance: "PENDING"
  },
  {
    id: "barge-master",
    name: "Sven Olsen",
    role: "Barge Master / Marine Sup.",
    personality: "Grounded, focuses on vessel stability and rig positioning.",
    memory: [],
    status: "idle",
    faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
    stance: "PENDING"
  },

  // --- ONSHORE SPECIFIC ---
  {
    id: "rig-move",
    name: "Budi Santoso",
    role: "Onshore Rig Move Coordinator",
    personality: "Logistics wizard, deals with local infrastructure hurdles.",
    memory: [],
    status: "idle",
    faction: "⚙️ OPERATIONS & SUPPLY CHAIN",
    stance: "PENDING"
  },
  {
    id: "humas",
    name: "Andi Wijaya",
    role: "Public Relations (Humas)",
    personality: "Diplomatic, focuses on community relations and land disputes.",
    memory: [],
    status: "idle",
    faction: "🏛️ GOVERNMENT & REGULATORS",
    stance: "PENDING"
  },

  // --- GLOBAL GEOPOLITICS & FINANCE ---
  {
    id: "opec-liaison",
    name: "Tariq Al-Hashemi",
    role: "OPEC+ Policy Liaison",
    personality: "Strategic, observes global supply quotas and geopolitical shifts.",
    memory: [],
    status: "idle",
    faction: "🏛️ GOVERNMENT & REGULATORS",
    stance: "PENDING"
  },
  {
    id: "blackrock-rep",
    name: "Eleanor Vance",
    role: "Institutional Investor (BlackRock)",
    personality: "Yield-obsessed, demands ESG compliance for funding continuous operations.",
    memory: [],
    status: "idle",
    faction: "💼 CORPORATE & CAPITAL",
    stance: "PENDING"
  },

  // --- GLOBAL NGOs & MEDIA ---
  {
    id: "greenpeace",
    name: "Lars Mikkelsen",
    role: "Greenpeace Senior Activist",
    personality: "Hostile to drilling operations, scrutinizes every environmental report.",
    memory: [],
    status: "idle",
    faction: "🌍 SOCIAL & WATCHDOGS",
    stance: "PENDING"
  },
  {
    id: "reuters-journalist",
    name: "Chloe Mendez",
    role: "Energy Correspondent (Reuters)",
    personality: "Inquisitive, looks for the scoop on operational failures or massive finds.",
    memory: [],
    status: "idle",
    faction: "🌍 SOCIAL & WATCHDOGS",
    stance: "PENDING"
  }
];
