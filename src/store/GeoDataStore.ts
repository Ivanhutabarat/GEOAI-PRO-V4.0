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
    { name: 'Yellow Sandstone', color: '#d4c919', depthStart: 0, depthEnd: -15, displacement: 0 },
    { name: 'Orange Limestone', color: '#c93c1e', depthStart: -15, depthEnd: -35, displacement: 0 },
    { name: 'Blue Basement', color: '#1e3cc9', depthStart: -35, depthEnd: -60, displacement: 0 },
  ],
  faultActive: true,
  faultPositionX: 0,
  setPoints: (points) => set({ points }),
  addPoint: (point) => set((state) => ({ points: [...state.points, point] })),
  clearPoints: () => set({ points: [] }),
  setFaultActive: (active) => set({ faultActive: active }),
  setFaultPositionX: (x) => set({ faultPositionX: x }),
}));
