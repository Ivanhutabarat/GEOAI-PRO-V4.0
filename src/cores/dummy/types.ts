export const GeoModule = {
  DASHBOARD: 'dashboard',
  SEISMIC: 'seismic',
  WELL_LOGGING: 'well-logging',
  SPATIAL: 'spatial',
  GRAVITY_MAG: 'gravity-mag',
  ELECTRICAL: 'electrical',
  MICROSEISMIC: 'microseismic',
  GEOCHEM: 'geochem',
  GPR: 'gpr',
  METEO: 'meteo',
  GROUNDWATER: 'groundwater',
  SOIL_PH: 'soil-ph',
  BOREHOLE_RADIOMETRIC: 'radiometric',
  GEOTECHNICAL_TILT: 'tilt-extenso',
  GAS_AIR_QUALITY: 'gas-air',
  AI_CONSULTANT: 'ai-consultant',
  SIMULATION: 'simulation',
  DIAGNOSTICS: 'diagnostics',
  SECURITY: 'security',
  MANUAL_BOOK: 'manual-book',
  MIROFISH: 'mirofish',
  OSINT: 'osint'
} as const;

export type GeoModule = typeof GeoModule[keyof typeof GeoModule];

export type GeoFileType = 
  | 'segy' | 'sgy'        // Seismic
  | 'las'                // Well Logging
  | 'shp' | 'kml' | 'tiff' // Spatial
  | 'mseed'              // Microseismic
  | 'dzx' | 'rd3' | 'dt1' // GPR
  | 'edi' | 'j'           // MT
  | 'nc' | 'hdf' | 'jp2' | 'nc' // Satellite/Meteo
  | 'csv' | 'txt' | 'dat' // General Data
  | 'xlsx' | 'xyz' | 'grd' // Geochem/Bathymetry
  | 'ply' | 'laz';        // Drone/Lidar

export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  memory: string[];
  status: 'active' | 'idle' | 'interacting';
  faction?: string;
  stance: 'PRO' | 'KONTRA' | 'NEUTRAL' | 'PENDING';
}

export interface SimulationEvent {
  id: string;
  timestamp: Date;
  senderId: string;
  targetId: string | 'world';
  content: string;
}

export interface GeoFile {
  id: string;
  name: string;
  type: GeoFileType;
  module: GeoModule;
  size: number;
  uploadedAt: Date;
  status: 'raw' | 'processed' | 'analyzing' | 'error';
  content?: any;
  metadata?: Record<string, any>;
}

export interface AnalysisInsight {
  id: string;
  title: string;
  content: string;
  type: 'anomaly' | 'summary' | 'suggestion';
  confidence: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
}
