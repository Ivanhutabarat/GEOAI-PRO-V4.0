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
};

const defaultRaw: Record<keyof GeoDataStore, string> = {
  gravityData: "",
  electricalData: "",
  gprData: "",
  meteorologyData: "",
  seismicData: "",
  geochemData: "",
  wellLoggingData: "",
  spatialData: "",
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
});

export const GlobalGeoProvider = ({ children }: { children: ReactNode }) => {
  const [globalData, setGlobalData] = useState<GeoDataStore>(defaultState);
  const [rawPayloads, setRawPayloads] = useState<Record<keyof GeoDataStore, string>>(defaultRaw);
  const [seismicMode, setSeismicMode] = useState<'exploration' | 'mitigation'>('exploration');
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
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

  const updateModuleData = (moduleName: keyof GeoDataStore, rawText: string, parsedJson: any[]) => {
    setGlobalData(prev => ({ ...prev, [moduleName]: parsedJson }));
    if (moduleName === 'seismicData') {
      setRawPayloads(prev => ({ ...prev, [moduleName]: `[MODE: ${seismicMode.toUpperCase()}]\n${rawText}` }));
    } else {
      setRawPayloads(prev => ({ ...prev, [moduleName]: rawText }));
    }
  };

  return (
    <GlobalGeoContext.Provider value={{ globalData, updateModuleData, rawPayloads, seismicMode, setSeismicMode, systemLogs, addLog, clearLogs, activeFileName, setActiveFileName, dataDimensions, setDataDimensions }}>
      {children}
    </GlobalGeoContext.Provider>
  );
};

export const useGlobalGeoContext = () => useContext(GlobalGeoContext);
