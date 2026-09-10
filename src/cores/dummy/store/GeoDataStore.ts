import { create } from 'zustand';

export interface GeoDataPoint {
  id: string;
  position: [number, number, number];
  color: string;
  type: string;
}

export interface LithologyLayer {
  name: string;
  color: string;
  depthStart: number;
  depthEnd: number;
  displacement: number; // For fault logic
}

interface GeoDataState {
  points: GeoDataPoint[];
  layers: LithologyLayer[];
  faultActive: boolean;
  faultPositionX: number;
  setPoints: (points: GeoDataPoint[]) => void;
  addPoint: (point: GeoDataPoint) => void;
  clearPoints: () => void;
  setFaultActive: (active: boolean) => void;
  setFaultPositionX: (x: number) => void;
  setLayers: (layers: LithologyLayer[]) => void;
}

export const useGeoDataStore = create<GeoDataState>((set) => ({
  points: [
    { id: 'p1', position: [-2, 1, -2], color: '#ff4444', type: 'seismic' },
    { id: 'p2', position: [2, 0.5, 1], color: '#44ff44', type: 'well' },
    { id: 'p3', position: [0, -1, 3], color: '#4444ff', type: 'geochem' },
    { id: 'p4', position: [-3, 2, 4], color: '#ffff44', type: 'gravity' },
    { id: 'p5', position: [4, -2, -3], color: '#ff44ff', type: 'em' },
  ],
  layers: [
    { name: 'Clay & Ocean Deposits', color: '#3b82f6', depthStart: 0, depthEnd: -10, displacement: 0 },
    { name: 'Green Shale Stratum', color: '#10b981', depthStart: -10, depthEnd: -20, displacement: 0 },
    { name: 'Yellow Sandstone', color: '#f59e0b', depthStart: -20, depthEnd: -30, displacement: 0 },
    { name: 'Orange Limestone Silts', color: '#f97316', depthStart: -30, depthEnd: -40, displacement: 0 },
    { name: 'Crimson Basalt Fold', color: '#dc2626', depthStart: -40, depthEnd: -50, displacement: 0 },
    { name: 'Purple Metamorphic Basement', color: '#7c3aed', depthStart: -50, depthEnd: -60, displacement: 0 },
  ],
  faultActive: true,
  faultPositionX: 0,
  setPoints: (points) => set({ points }),
  addPoint: (point) => set((state) => ({ points: [...state.points, point] })),
  clearPoints: () => set({ points: [] }),
  setFaultActive: (active) => set({ faultActive: active }),
  setFaultPositionX: (x) => set({ faultPositionX: x }),
  setLayers: (layers) => set({ layers }),
}));
