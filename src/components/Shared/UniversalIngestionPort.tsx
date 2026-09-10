import React, { useState } from 'react';
import { Database, Upload, RefreshCw } from 'lucide-react';
import { useGlobalGeoContext, GeoDataStore } from '../../context/GlobalGeoContext';
import { useNavigate } from 'react-router-dom';
import { GeoModule } from '../../types';

interface UniversalIngestionPortProps {
  moduleName: string;
  contextKey: keyof GeoDataStore;
  onParsed: (parsedData: any[]) => void;
  presetLog?: string;
  presetMatrix?: string;
  parserType?: 'matrix' | 'objects';
}

export default function UniversalIngestionPort({
  moduleName,
  contextKey,
  onParsed,
  presetLog,
  presetMatrix,
  parserType = 'matrix'
}: UniversalIngestionPortProps) {
  const { updateModuleData, setActiveFileName, activeFileName, setDataDimensions, addLog } = useGlobalGeoContext();
  const [rawText, setRawText] = useState("");
  const [transmitMessage, setTransmitMessage] = useState<string | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const navigate = useNavigate();

  const parseDataInput = (text: string) => {
    if (!text.trim()) return { parsedData: [], headers: [] };
    const lines = text.split('\n');
    const parsedData: any[] = [];
    let detectedHeaders: string[] = [];
    
    if (parserType === 'objects') {
      let headers: string[] | null = null;
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.startsWith('~') || line.startsWith('//')) {
          continue;
        }
        const parts = line.split(/[\s,;\t]+/).filter(Boolean);
        if (!headers) {
          headers = parts.map(h => h.toLowerCase());
          detectedHeaders = parts;
          continue;
        }
        const obj: any = {};
        headers.forEach((h, i) => {
          const val = parseFloat(parts[i]);
          obj[h] = isNaN(val) ? parts[i] : val;
        });
        parsedData.push(obj);
      }
    } else {
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.startsWith('~') || line.startsWith('//')) {
          // Check if this line is header-like
          if (!detectedHeaders.length && line.match(/[a-zA-Z]/)) {
            detectedHeaders = line.split(/[\s,;\t]+/).filter(Boolean);
          }
          continue;
        }
        
        const parts = line.split(/[\s,;\t]+/).filter(Boolean).map(n => parseFloat(n)).filter(n => !isNaN(n));
        if (parts.length > 0) {
          parsedData.push(parts);
        }
      }
    }
    
    return { parsedData, headers: detectedHeaders };
  };

  const detectAndRoute = (fileName: string, headers: string[], rowCount: number, colCount: number) => {
    const lowerName = fileName.toLowerCase();
    const joinedHeaders = headers.map(h => h.toLowerCase()).join(' ');

    let detectedDim: '1D' | '2D' | '3D' = '1D';
    if (joinedHeaders.includes('grid_x') || joinedHeaders.includes('elevation_z') || colCount >= 4) {
      if (joinedHeaders.includes('grid_x') && joinedHeaders.includes('elevation_z')) {
        detectedDim = '3D';
      } else if (colCount > 4) {
        detectedDim = '2D'; // likely a matrix
      } else {
        detectedDim = '1D'; // Multi-curve 1D
      }
    } else {
      detectedDim = '1D';
    }
    setDataDimensions(detectedDim);

    let targetRoute = "";
    
    const isWellLog = lowerName.endsWith('.las') || joinedHeaders.includes('depth_m') || joinedHeaders.includes('gr_api');
    const isSeismic = lowerName.endsWith('.segy') || joinedHeaders.includes('time_ms') || joinedHeaders.includes('amplitude');
    const isSpatial = lowerName.endsWith('.shp') || lowerName.endsWith('.tiff') || (joinedHeaders.includes('grid_x') && joinedHeaders.includes('elevation_z'));

    if (isWellLog) {
      targetRoute = `/${GeoModule.WELL_LOGGING}`;
      if (!lowerName.endsWith('.las') && !lowerName.endsWith('.csv') && !lowerName.endsWith('.txt')) {
         addLog({ type: 'WARN', source: 'Ingestion Engine', message: `Filename extension mismatch in ${fileName}. Auto-routed based on internal data matrix to Well Logging.` });
      }
    } else if (isSeismic) {
      targetRoute = `/${GeoModule.SEISMIC}`;
      if (!lowerName.endsWith('.segy') && !lowerName.endsWith('.csv') && !lowerName.endsWith('.txt')) {
         addLog({ type: 'WARN', source: 'Ingestion Engine', message: `Filename extension mismatch in ${fileName}. Auto-routed based on internal data matrix to Seismic.` });
      }
    } else if (isSpatial) {
      targetRoute = `/${GeoModule.SPATIAL}`;
      if (!lowerName.endsWith('.shp') && !lowerName.endsWith('.tiff') && !lowerName.endsWith('.csv') && !lowerName.endsWith('.txt')) {
         addLog({ type: 'WARN', source: 'Ingestion Engine', message: `Filename extension mismatch in ${fileName}. Auto-routed based on internal data matrix to Spatial Twin.` });
      }
    }

    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const processAndTransmit = (text: string, fileName: string = "PASTED_DATA.txt") => {
    setRawText(text);
    setActiveFileName(fileName);
    const { parsedData, headers } = parseDataInput(text);
    if (parsedData.length > 0) {
      const colCount = Array.isArray(parsedData[0]) ? parsedData[0].length : Object.keys(parsedData[0]).length;
      detectAndRoute(fileName, headers, parsedData.length, colCount);
      onParsed(parsedData);
      updateModuleData(contextKey, text, parsedData);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processAndTransmit(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleTransmit = () => {
    if (!rawText.trim()) {
      alert("Please paste tabular data or import a field log file first.");
      return;
    }
    
    setIsMeasuring(true);
    processAndTransmit(rawText);

    // Broadcast transmit event to the Swarm Intelligence engine
    const event = new CustomEvent('geoai:transmit', {
      detail: {
        payload: rawText,
        module: moduleName
      }
    });
    window.dispatchEvent(event);

    setTransmitMessage("TRANSMITTED TO SWARM CORE");
    setTimeout(() => {
      setTransmitMessage(null);
      setIsMeasuring(false);
    }, 3000);
  };

  return (
    <div className="geo-card border border-[#333] hover:border-[#FF5722]/40 transition-colors">
      <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-2">
        <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#FF5722] flex items-center gap-1.5">
          <Database size={13} />
          Universal Data Ingestion
        </h3>
        <span className="text-[9px] font-mono text-gray-500">TEXT/RAW MODE</span>
      </div>

      <div className="space-y-3">
        {(presetLog || presetMatrix) && (
          <div className="flex gap-2 text-[9px] font-mono">
            {presetLog && (
              <button 
                onClick={() => processAndTransmit(presetLog)}
                className="flex-1 bg-black/40 hover:bg-[#FF5722]/10 border border-[#222] hover:border-[#FF5722]/30 py-1 rounded text-gray-400 hover:text-white transition-all text-center"
              >
                Prefill 1D/Line Log
              </button>
            )}
            {presetMatrix && (
              <button 
                onClick={() => processAndTransmit(presetMatrix)}
                className="flex-1 bg-black/40 hover:bg-[#FF5722]/10 border border-[#222] hover:border-[#FF5722]/30 py-1 rounded text-gray-400 hover:text-white transition-all text-center"
              >
                Prefill 2D Grid
              </button>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              // We could automatically parse, but let's wait for transmit or do it instantly.
              // To be safe and instantly responsive as requested:
              const { parsedData } = parseDataInput(e.target.value);
              if (parsedData.length > 0) {
                 onParsed(parsedData);
                 updateModuleData(contextKey, e.target.value, parsedData);
              }
            }}
            placeholder="# Paste tabular/ASCII data logs here...&#10;1.5, 210, 4.7&#10;3.0, 185, 5.4"
            className="w-full h-28 bg-black/80 border border-[#222] text-[10px] font-mono p-2.5 rounded text-gray-300 focus:border-[#FF5722]/60 focus:outline-none resize-none scrollbar-thin placeholder-gray-700"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label 
            className="flex-1 bg-black/40 hover:bg-neutral-800 border border-[#222] text-gray-400 hover:text-white transition-colors p-2 rounded text-[10px] font-mono text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Upload size={12} />
            Upload File (.csv, .txt, .las)
            <input 
              type="file" 
              accept=".txt,.csv,.las" 
              onChange={handleFileUpload}
              className="hidden" 
            />
          </label>
        </div>

        <div>
          <button
            type="button"
            onClick={handleTransmit}
            className="w-full bg-[#FF5722] hover:bg-[#ff7043] text-black font-bold uppercase font-mono tracking-tight text-[11px] py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={12} className={isMeasuring ? "animate-spin" : ""} />
            {transmitMessage ? transmitMessage : "TRANSMIT FIELD DATA"}
          </button>
        </div>
      </div>
    </div>
  );
}
