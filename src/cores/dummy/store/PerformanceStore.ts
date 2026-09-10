import { create } from 'zustand';

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  executionTimeMs: number;
  memoryUsageMb: string;
  accuracyScore: number; // e.g. 98.2 (Calculated delta raw vs optimized result)
  confidenceLevel: number; // e.g. 94.5 (8-Agent variance consensus strength)
  recalled: boolean; // loaded via Intelligent Recall from GlobalKnowledgeRepository
  isDummy: boolean; // triggered Simulated Performance Load
  activeModule: string;
}

interface PerformanceState {
  metricsList: PerformanceMetric[];
  latestMetric: PerformanceMetric | null;
  addMetric: (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => void;
  clearMetrics: () => void;
  intelligentRecallMatch: any | null; // Holds the matched RepositoryEntry
  setIntelligentRecallMatch: (match: any | null) => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => {
  // Try loading from localStorage if possible
  let initialMetrics: PerformanceMetric[] = [];
  try {
    const saved = localStorage.getItem('geoai_performance_metrics_v4');
    if (saved) {
      initialMetrics = JSON.parse(saved);
    }
  } catch (_) {}

  return {
    metricsList: initialMetrics,
    latestMetric: initialMetrics[0] || null,
    intelligentRecallMatch: null,

    addMetric: (metric) => set((state) => {
      const newMetric: PerformanceMetric = {
        ...metric,
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        timestamp: new Date().toLocaleTimeString()
      };
      const updatedList = [newMetric, ...state.metricsList].slice(0, 50); // limit to last 50 entries
      try {
        localStorage.setItem('geoai_performance_metrics_v4', JSON.stringify(updatedList));
      } catch (_) {}
      return {
        metricsList: updatedList,
        latestMetric: newMetric
      };
    }),

    clearMetrics: () => set(() => {
      try {
        localStorage.removeItem('geoai_performance_metrics_v4');
      } catch (_) {}
      return {
        metricsList: [],
        latestMetric: null
      };
    }),

    setIntelligentRecallMatch: (match) => set({ intelligentRecallMatch: match })
  };
});
