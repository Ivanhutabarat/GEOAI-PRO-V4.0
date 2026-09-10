import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { dummyEngine } from '../cores/live/utils/dummyEngine';
import { liveEngine } from '../cores/live/utils/liveEngine';
import { SimulationRow } from '../cores/live/utils/dummyEngine';

export type ApiMode = 'LIVE' | 'DUMMY';
export type DimensionMode = '1D' | '2D' | '3D';
export type PerformanceMode = 'HIGH_FIDELITY' | 'ECO_PERFORMANCE';
export type ThemeMode = 'DARK' | 'LIGHT';

export interface EngineType {
  generateSeismicData: (frequency?: number, damp?: number) => SimulationRow[];
  generateWellLoggingData: (shaleCutoff?: number, resThreshold?: number) => SimulationRow[];
  generateGeotechData: (anchorOffset?: number, slopeAngle?: number) => SimulationRow[];
  generateTiltExtensoTrack: (baseDx: number, baseDy: number) => SimulationRow[];
  generateResistivityTrack: (distance: number, resistance: number) => SimulationRow[];
  generateResistivityMatrix: () => number[][];
  generateGprTrack: (depth: number, velocity: number) => SimulationRow[];
  generateGravityTrack: (elevation: number, lat: number) => SimulationRow[];
  generateGeochemTrack: (concentrate: number) => SimulationRow[];
  generateMeteorologyTrack: (temp: number, pressure: number) => SimulationRow[];
  generateGroundwaterTrack: (rate: number, trans: number) => SimulationRow[];
  generateSoilPlumeDiffusion: (conc: number) => SimulationRow[];
  generateSoilPhTrack: (ph: number, sulfur: number) => SimulationRow[];
  generateRadiometricTrack: (u: number, th: number) => SimulationRow[];
  generateGasTrack: (h2s: number, ch4: number) => SimulationRow[];
  generateSpatialTrack: (eastOffset: number, northOffset: number) => SimulationRow[];
  generateElectricalData: (spacing?: number, current?: number) => SimulationRow[];
  generateGPRData: (frequency?: number, dielectricConstant?: number) => SimulationRow[];
  generateGravityData: (latitude?: number, density?: number) => SimulationRow[];
}

export interface AppContextType {
  apiMode: ApiMode;
  setApiMode: React.Dispatch<React.SetStateAction<ApiMode>>;
  toggleApiMode: () => void;
  dimensionMode: DimensionMode;
  setDimensionMode: React.Dispatch<React.SetStateAction<DimensionMode>>;
  toggleDimensionMode: () => void;
  performanceMode: PerformanceMode;
  setPerformanceMode: React.Dispatch<React.SetStateAction<PerformanceMode>>;
  togglePerformanceMode: () => void;
  themeMode: ThemeMode;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  toggleThemeMode: () => void;
  fps: number;
  engine: EngineType;
  engineKey: number;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiMode, setApiMode] = useState<ApiMode>(() => {
    try {
      const saved = localStorage.getItem('geoai_mode');
      return (saved === 'LIVE' || saved === 'DUMMY') ? saved : 'LIVE';
    } catch (e) {
      return 'LIVE';
    }
  });
  const [dimensionMode, setDimensionMode] = useState<DimensionMode>('2D');
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(() => {
    try {
      const saved = localStorage.getItem('geoai_perf_mode');
      return (saved === 'ECO_PERFORMANCE' || saved === 'HIGH_FIDELITY') ? saved : 'HIGH_FIDELITY';
    } catch (e) {
      return 'HIGH_FIDELITY';
    }
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('geoai_theme_mode');
      return (saved === 'LIGHT' || saved === 'DARK') ? saved : 'DARK';
    } catch (e) {
      return 'DARK';
    }
  });
  const [fps, setFps] = useState<number>(60);
  const [engineKey, setEngineKey] = useState<number>(0);

  // Live lightweight FPS profiler
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.min(60, Math.round((frameCount * 1000) / (now - lastTime))));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggleApiMode = () => {
    const nextMode = apiMode === 'LIVE' ? 'DUMMY' : 'LIVE';
    try {
      localStorage.setItem('geoai_mode', nextMode);
    } catch (e) {}
    setApiMode(nextMode);
    window.location.reload();
  };

  const toggleDimensionMode = () => {
    setDimensionMode(prev => prev === '3D' ? '2D' : '3D');
  };

  const togglePerformanceMode = () => {
    setPerformanceMode(prev => {
      const next = prev === 'HIGH_FIDELITY' ? 'ECO_PERFORMANCE' : 'HIGH_FIDELITY';
      try {
        localStorage.setItem('geoai_perf_mode', next);
      } catch (e) {}
      return next;
    });
  };

  const toggleThemeMode = () => {
    setThemeMode(prev => {
      const next = prev === 'DARK' ? 'LIGHT' : 'DARK';
      try {
        localStorage.setItem('geoai_theme_mode', next);
      } catch (e) {}
      return next;
    });
  };

  const engine = useMemo(() => {
    return apiMode === 'LIVE' ? liveEngine : dummyEngine;
  }, [apiMode]);

  return (
    <AppContext.Provider 
      value={{ 
        apiMode, 
        setApiMode, 
        toggleApiMode, 
        dimensionMode, 
        setDimensionMode, 
        toggleDimensionMode,
        performanceMode,
        setPerformanceMode,
        togglePerformanceMode,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        fps,
        engine, 
        engineKey 
      }}
    >
      <div 
        key={engineKey} 
        className={themeMode === 'LIGHT' ? 'theme-light' : 'theme-dark'} 
        style={{ width: '100%', height: '100%', display: 'flex', flex: 1 }}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
