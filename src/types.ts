export interface Agent {
  id: string;
  name: string;
  role: string;
  faction: string;
  avatar?: string;
  active?: boolean;
  personality: string;
  memory: string[];
  status: string;
  stance: string;
}

export interface Coordinates {
  x: number;
  y: number;
  depth: number;
}

export interface DebateMessage {
  agent: string;
  role: string;
  faction: string;
  stance: 'PRO' | 'CON' | 'NEUTRAL';
  reasoning: string;
  content: string;
  avatar: string;
  timestamp: string;
}

export type GeologicalModule =
  | 'seismic'
  | 'well-logging'
  | 'spatial-twin'
  | 'gravity-mag'
  | 'em'
  | 'gpr'
  | 'geochem'
  | 'meteorology'
  | 'groundwater'
  | 'soil'
  | 'borehole'
  | 'geotech'
  | 'atmosphere';
