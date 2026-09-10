
import { validateIdentity } from './identityValidator';

export interface RepositoryParameters {
  acousticImpedance: number;
  resistivityThreshold: number;
  shaleCutoff: number;
  drillCoordinates: { x: number; y: number; z: number } | null;
  activeModule: string;
}

export interface RepositoryOptimizedFindings {
  acousticImpedance: number;
  resistivityThreshold: number;
  shaleCutoff: number;
  confidence: number;
  justification?: string;
}

export interface RepositoryEntry {
  id: string;
  timestamp: string;
  parameters: RepositoryParameters;
  consensus: any[]; // Debate logs or agent answers
  optimizedFindings: RepositoryOptimizedFindings | null;
  report: string;
  snapshotBase64: string; // Portability: compressed Base64 representation
}

// Generate a compressed geophysics-grade visualization snapshot as Base64 using HTML5 Canvas
export function generateVisualSnapshot(
  params: RepositoryParameters,
  findings: RepositoryOptimizedFindings | null
): string {
  // Create offscreen canvas
  if (typeof document === 'undefined') {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, 400, 300);

  // Grid
  ctx.strokeStyle = '#1e1e24';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 400; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 300);
    ctx.stroke();
  }
  for (let j = 0; j < 300; j += 40) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(400, j);
    ctx.stroke();
  }

  // Draw some simulated seismic waveforms
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let x = 30; x < 370; x++) {
    const y = 100 + Math.sin(x * 0.08) * 15 * Math.sin(x * 0.01) + Math.cos(x * 0.15) * 5;
    if (x === 30) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw simulated well density traces
  ctx.strokeStyle = '#4caf50';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 50; y < 250; y++) {
    const x = 300 + Math.sin(y * 0.05) * 20 + Math.cos(y * 0.1) * 8;
    if (y === 50) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw Anomaly highlights if resistivity threshold is low
  const resLimit = params.resistivityThreshold;
  if (resLimit < 90) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.fillRect(80, 50, 100, 200);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 50, 100, 200);
    
    ctx.fillStyle = '#ef4444';
    ctx.font = '8px monospace';
    ctx.fillText('ANOMALY CROSSOVER DETECTED', 85, 65);
  }

  // Draw UI boundaries / findings
  ctx.fillStyle = 'rgba(22, 22, 30, 0.85)';
  ctx.fillRect(10, 10, 180, 80);
  ctx.strokeStyle = '#ff9800';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(10, 10, 180, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = '9px monospace';
  ctx.fillText(`LENS: ${params.activeModule.toUpperCase()}`, 15, 22);
  ctx.fillStyle = '#888888';
  ctx.fillText(`IMPEDANCE: ${params.acousticImpedance} GPa*s/m`, 15, 33);
  ctx.fillText(`RESISTIVITY: ${params.resistivityThreshold} Ohm-m`, 15, 44);
  ctx.fillText(`SHALE CUTOFF: ${params.shaleCutoff}%`, 15, 55);

  if (findings) {
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`OPT RES: ${findings.resistivityThreshold} Ohm-m`, 15, 71);
    ctx.fillText(`OPT CONFIDENCE: ${findings.confidence}%`, 15, 82);
  } else {
    ctx.fillStyle = '#888888';
    ctx.fillText(`NO AUTOMATED OPT RUN`, 15, 75);
  }

  // Crosshairs & coords
  if (params.drillCoordinates) {
    const { x, y, z } = params.drillCoordinates;
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(200, 180, 10, 0, 2 * Math.PI);
    ctx.moveTo(185, 180);
    ctx.lineTo(215, 180);
    ctx.moveTo(200, 165);
    ctx.lineTo(200, 195);
    ctx.stroke();

    ctx.fillStyle = '#2196f3';
    ctx.font = '7px monospace';
    ctx.fillText(`GRID CORD: X:${x.toFixed(1)} Y:${y.toFixed(1)} Z:${z.toFixed(1)}`, 160, 210);
  }

  // Watermark/Integrity Indicator
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.font = '8px monospace';
  ctx.fillText('GEOAI PRO INTEGRATED DIAGNOSTICS SURVEY', 200, 290);

  // Compress to low-quality JPEG as Base64 string (0.6 quality for size/portability)
  return canvas.toDataURL('image/jpeg', 0.6);
}

// Normalized coordinate distance
function coordinatesDistance(
  c1: { x: number; y: number; z: number } | null,
  c2: { x: number; y: number; z: number } | null
): number {
  if (!c1 && !c2) return 0;
  if (!c1 || !c2) return 0.5; // one has coordinates, other doesn't
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const dz = c1.z - c2.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return Math.min(1.0, dist / 50.0);
}

// Calculate similarity score [0 - 1] between active inputs and historical repository parameters
export function calculateSimilarity(p1: RepositoryParameters, p2: RepositoryParameters): number {
  if (p1.activeModule !== p2.activeModule) {
    return 0; // Modules must correspond to be recalled intelligently
  }

  // Normalize and compare
  const diffAI = Math.abs((p1.acousticImpedance - 2.0) / 8.0 - (p2.acousticImpedance - 2.0) / 8.0);
  const diffRes = Math.abs((p1.resistivityThreshold - 5.0) / 195.0 - (p2.resistivityThreshold - 5.0) / 195.0);
  const diffShale = Math.abs((p1.shaleCutoff - 10.0) / 80.0 - (p2.shaleCutoff - 10.0) / 80.0);
  const diffCoords = coordinatesDistance(p1.drillCoordinates, p2.drillCoordinates);

  const hasCoords = p1.drillCoordinates || p2.drillCoordinates;
  const totalWeight = hasCoords ? 4 : 3;
  const averageDiff = (diffAI + diffRes + diffShale + (hasCoords ? diffCoords : 0)) / totalWeight;

  return Math.max(0, Math.min(1, 1 - averageDiff));
}

export class GlobalKnowledgeRepository {
  private static STORAGE_KEY = 'geoai_global_knowledge_v4';

  static saveEntry(entry: Omit<RepositoryEntry, 'id' | 'timestamp' | 'snapshotBase64'>): RepositoryEntry {
    validateIdentity();
    const entries = this.getAllEntries();
    const snapshotBase64 = generateVisualSnapshot(entry.parameters, entry.optimizedFindings);

    const newEntry: RepositoryEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      timestamp: new Date().toISOString(),
      snapshotBase64
    };

    entries.unshift(newEntry); // Insert at beginning (newest first)
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Storage quota overflow while saving knowledge entry:', e);
      // Prune oldest if storage fails
      if (entries.length > 10) {
        entries.pop();
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
        } catch (_) {}
      }
    }
    return newEntry;
  }

  static getAllEntries(): RepositoryEntry[] {
    validateIdentity();
    if (typeof localStorage === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (_) {
      return [];
    }
  }

  static clear(): void {
    validateIdentity();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Returns matched historical entry if similarity exceeds threshold (e.g. 90% or 0.90)
  static findRecallMatch(
    params: RepositoryParameters,
    threshold: number = 0.90
  ): RepositoryEntry | null {
    validateIdentity();
    const entries = this.getAllEntries();
    let bestMatch: RepositoryEntry | null = null;
    let highestSim = 0;

    for (const entry of entries) {
      const sim = calculateSimilarity(params, entry.parameters);
      if (sim > highestSim) {
        highestSim = sim;
        bestMatch = entry;
      }
    }

    if (highestSim >= threshold) {
      return bestMatch;
    }
    return null;
  }
}
