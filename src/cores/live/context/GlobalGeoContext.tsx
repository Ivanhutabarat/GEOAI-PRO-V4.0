import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define structures for parsed data from different modules
export interface GeoDataStore {
  gravityData: any[];
  electricalData: any[];
  gprData: any[];
  meteorologyData: any[];
  seismicData: any[];
  geochemData: any[];
  wellLoggingData: any[];
  spatialData: any[];
  radiometricData: any[];
  gasQualityData: any[];
  tiltExtensoData: any[];
  groundwaterData: any[];
  soilPhData: any[];
  lastUpdate?: string;
  modules?: {
    seismic?: any;
    gas?: any;
    geomechanics?: any;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'ERROR' | 'INFO' | 'WARN';
  source: string;
  message: string;
  rawData?: any;
}

interface GlobalGeoContextType {
  globalData: GeoDataStore;
  updateModuleData: (moduleName: keyof GeoDataStore, rawText: string, parsedJson: any[]) => void;
  rawPayloads: Record<keyof GeoDataStore, string>;
  seismicMode: 'exploration' | 'mitigation';
  setSeismicMode: (mode: 'exploration' | 'mitigation') => void;
  systemLogs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  activeFileName: string;
  setActiveFileName: (name: string) => void;
  dataDimensions: '1D' | '2D' | '3D';
  setDataDimensions: (dim: '1D' | '2D' | '3D') => void;
  overwriteAllState?: (global: GeoDataStore, raw: Record<keyof GeoDataStore, string>) => void;
  setDrillCoordinates?: (coords: {x: number, y: number, z: number}) => void;
}

const defaultState: GeoDataStore = {
  gravityData: [],
  electricalData: [],
  gprData: [],
  meteorologyData: [],
  seismicData: [],
  geochemData: [],
  wellLoggingData: [],
  spatialData: [],
  radiometricData: [],
  gasQualityData: [],
  tiltExtensoData: [],
  groundwaterData: [],
  soilPhData: [],
};

const defaultRaw: Record<string, string> = {
  gravityData: "",
  electricalData: "",
  gprData: "",
  meteorologyData: "",
  seismicData: "",
  geochemData: "",
  wellLoggingData: "",
  spatialData: "",
  radiometricData: "",
  gasQualityData: "",
  tiltExtensoData: "",
  groundwaterData: "",
  soilPhData: "",
};

const GlobalGeoContext = createContext<GlobalGeoContextType>({
  globalData: defaultState,
  updateModuleData: () => {},
  rawPayloads: defaultRaw,
  seismicMode: 'exploration',
  setSeismicMode: () => {},
  systemLogs: [],
  addLog: () => {},
  clearLogs: () => {},
  activeFileName: "UNNAMED_DATATRACK",
  setActiveFileName: () => {},
  dataDimensions: '1D',
  setDataDimensions: () => {},
  overwriteAllState: () => {},
});

export const GlobalGeoProvider = ({ children }: { children: ReactNode }) => {
  const [globalData, setGlobalData] = useState<GeoDataStore>(defaultState);
  const [rawPayloads, setRawPayloads] = useState<Record<string, string>>(defaultRaw as any);
  const [seismicMode, setSeismicMode] = useState<'exploration' | 'mitigation'>('exploration');
  const [systemLogs, setSystemLogs] = useState([] as LogEntry[]);
  const [activeFileName, setActiveFileName] = useState<string>("UNNAMED_DATATRACK");
  const [dataDimensions, setDataDimensions] = useState<'1D' | '2D' | '3D'>('1D');

  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setSystemLogs(prev => [...prev, {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearLogs = () => setSystemLogs([]);

  const overwriteAllState = (global: GeoDataStore, raw: Record<keyof GeoDataStore, string>) => {
    setGlobalData(global);
    setRawPayloads(raw);
    addLog({
      type: 'INFO',
      source: 'TIME-TRAVEL',
      message: 'System Global State & Raw Payloads reverted to May 30 18:21 checkpoint successfully.'
    });
  };

  const updateModuleData = (moduleName: keyof GeoDataStore, rawText: string, parsedJson: any[]) => {
    // 1. STATE BUFFERING: Pause updates if a PDF export is running to prevent race conditions & UI tearing
    if (typeof window !== 'undefined' && (window as any).isExportingPDF) {
      console.warn(`[STREAM BUFFERED] Update for ${moduleName} paused during PDF generation.`);
      return; 
    }

    // Immutable structural state update pattern to prevent White Screen of Death
    setGlobalData(prevState => {
      if (!prevState) return prevState;
      return {
        ...prevState,
        lastUpdate: new Date().toISOString(),
        modules: {
          ...prevState.modules,
          seismic: moduleName === 'seismicData' ? [...parsedJson] : prevState.modules?.seismic,
          gas: moduleName === 'gasQualityData' ? [...parsedJson] : prevState.modules?.gas,
          geomechanics: moduleName === 'geochemData' ? [...parsedJson] : prevState.modules?.geomechanics
        },
        [moduleName]: [...parsedJson] // retain old structure for backward compat
      };
    });
    if (moduleName === 'seismicData') {
      setRawPayloads(prev => ({ ...prev, [moduleName]: `[MODE: ${seismicMode.toUpperCase()}]\n${rawText}` }));
    } else {
      setRawPayloads(prev => ({ ...prev, [moduleName]: rawText }));
    }
  };

  return (
    <GlobalGeoContext.Provider value={{ globalData, updateModuleData, rawPayloads, seismicMode, setSeismicMode, systemLogs, addLog, clearLogs, activeFileName, setActiveFileName, dataDimensions, setDataDimensions, overwriteAllState }}>
      {children}
    </GlobalGeoContext.Provider>
  );
};

export const useGlobalGeoContext = () => useContext(GlobalGeoContext);
