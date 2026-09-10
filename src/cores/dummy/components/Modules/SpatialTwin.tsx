import { processIncomingData } from '../Shared/SwarmRoom';
import { Fallback3D } from '../Shared/Fallback3D';
// src/components/Modules/SpatialTwin.tsx
import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
const SpatialTwinEngine = React.lazy(() => import('./SpatialTwinEngine'));

import { Layers, Maximize, Settings } from 'lucide-react';
import { useGeoDataStore, LithologyLayer, GeoDataPoint } from '../../store/GeoDataStore';
import SpatialControlPanel from './SpatialControlPanel';
import { BRANDING } from '../../constants/BrandingConstants';
import GeoAILogo from '../Shared/GeoAILogo';

const parseInputData = (rawText: string): any => {
  if (!rawText || rawText.trim() === "") return null;
  try {
    return JSON.parse(rawText);
  } catch (e) {
    const lines = rawText.trim().split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    const isCsv = lines.some((line: string) => line.includes(','));
    if (isCsv) {
      const features = lines.map((line: string) => {
        const parts = line.split(',').map((p: string) => p.trim());
        return {
          x: parseFloat(parts[0]) || 0,
          y: parseFloat(parts[1]) || 0,
          z: parseFloat(parts[2]) || 0,
          color: parts[3] || '#00E5FF'
        };
      });
      return { geometry_type: "Raw Point Cloud 3D", source: "Auto-Parsed CSV", data_points: features.length, features: features };
    }
    return null;
  }
};

export default function SpatialTwin() {
  const [sliceZ, setSliceZ] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [isLoaderActive, setIsLoaderActive] = useState(true);
  const [altText, setAltText] = useState(false);
  const [activePayload, setActivePayload] = useState<any>(null);
  
  const layers = useGeoDataStore(state => state.layers);
  const faultActive = useGeoDataStore(state => state.faultActive);
  const setFaultActive = useGeoDataStore(state => state.setFaultActive);
  const setFaultPositionX = useGeoDataStore(state => state.setFaultPositionX);
  const setPoints = useGeoDataStore(state => state.setPoints);
  const setLayers = useGeoDataStore(state => state.setLayers);

  // Keep track of the processing timeout
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [eventSource, setEventSource] = useState<HTMLDivElement | null>(null);

  // Auto-dismiss the initial loader after configured initial boot delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaderActive(false);
    }, BRANDING.INITIAL_BOOT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Cycle the loader alert subtext based on transition delay constants
  useEffect(() => {
    const interval = setInterval(() => {
      setAltText(prev => !prev);
    }, BRANDING.TRANSITION_DELAY_MS);
    return () => clearInterval(interval);
  }, []);

  // Synchronize telemetry with the digital twin component on geoai:transmit events
  useEffect(() => {
    const handleTelemetryIngested = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent?.detail?.payload) return;

      // Trigger the high-focus blur loader immediately on updates for real-time mesh recalculation
      setIsLoaderActive(true);
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      processingTimeoutRef.current = setTimeout(() => {
        setIsLoaderActive(false);
      }, BRANDING.TRANSITION_DELAY_MS);

      const rawText = customEvent.detail.payload;
      const parsedPayload = parseInputData(rawText);
      setActivePayload(parsedPayload);
      
      // Handle structured JSON point cloud directly
      if (rawText.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(rawText.trim());
          if (parsed.features && Array.isArray(parsed.features)) {
            const simulatedPoints: GeoDataPoint[] = parsed.features.map((f: any, i: number) => ({
              id: `telemetry_scatter_${i}`,
              position: [f.x ?? 0, f.y ?? 0, f.z ?? 0],
              color: f.color || '#00E5FF',
              type: 'telemetry'
            }));
            if (simulatedPoints.length > 0) {
              setPoints(simulatedPoints);
              setIsLoaderActive(false);
              return;
            }
          }
          if (parsed.x && parsed.y && parsed.z) {
            const simulatedPoints: GeoDataPoint[] = [];
            for (let i = 0; i < parsed.x.length; i++) {
              simulatedPoints.push({
                id: `telemetry_scatter_${i}`,
                position: [parsed.x[i], parsed.y[i], parsed.z[i]],
                color: parsed.color?.[i] || '#00E5FF',
                type: 'telemetry'
              });
            }
            if (simulatedPoints.length > 0) {
              setPoints(simulatedPoints);
              setIsLoaderActive(false);
              return;
            }
          }
        } catch (e) {
          // fallback
        }
      }

      const lines = rawText.split('\n');
      
      const parsedRows: number[][] = [];
      let headers: string[] = [];
      
      // Splitting multiple format matrices & telemetry streams
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        // Detect headers
        if (line.startsWith('#') || line.startsWith('~') || line.startsWith('//') || line.toLowerCase().includes('depth') || line.toLowerCase().includes('grid')) {
          const stripped = line.replace(/^[#~/]+/, '').trim();
          if (!headers.length && stripped.match(/[a-zA-Z]/)) {
            headers = stripped.split(/[\s,;\t]+/).filter(Boolean);
          }
          continue;
        }

        const parts = line.split(/[\s,;\t]+/).filter(Boolean);
        const numbers = parts.map((n: string) => parseFloat(n));
        const validNumbers = numbers.filter((n: number) => !isNaN(n));
        
        if (validNumbers.length > 0) {
          parsedRows.push(numbers);
        }
      }

      if (parsedRows.length === 0) return;

      // Coordinate matching index flags
      let xIdx = -1;
      let yIdx = -1;
      let zIdx = -1;
      let valIdx = -1;
      let faultIdx = -1;

      const lowerHeaders = headers.map(h => h.toLowerCase());
      
      lowerHeaders.forEach((h, i) => {
        if (h.includes('grid_x') || h === 'x' || h.includes('east') || h.includes('longitude') || h.includes('coord_x')) {
          xIdx = i;
        } else if (h.includes('grid_y') || h === 'y' || h.includes('north') || h.includes('latitude') || h.includes('coord_y')) {
          yIdx = i;
        } else if (h.includes('elevation_z') || h === 'z' || h.includes('depth') || h.includes('elev') || h === 'altitude' || h === 'height') {
          zIdx = i;
        } else if (h.includes('fault') || h.includes('slip') || h.includes('rupture') || h.includes('stress')) {
          faultIdx = i;
        } else if (valIdx === -1 && !h.includes('id') && !h.includes('name')) {
          valIdx = i;
        }
      });

      const colCount = parsedRows[0].length;
      if (xIdx === -1 && colCount >= 3) {
        // Assume first 3 columns are spatial offsets
        xIdx = 0;
        yIdx = 1;
        zIdx = 2;
        if (colCount >= 4) valIdx = 3;
      } else if (xIdx === -1 && colCount === 2) {
        zIdx = 0;
        valIdx = 1;
      } else if (xIdx === -1) {
        valIdx = 0;
      }

      // Convert coordinates scale-proportionally to fit inside digital twin layout bounds
      const rawCoords = parsedRows.map((row, idx) => {
        const rx = xIdx !== -1 && row[xIdx] !== undefined ? row[xIdx] : (idx - parsedRows.length / 2) * 1.2;
        const ry = yIdx !== -1 && row[yIdx] !== undefined ? row[yIdx] : 0;
        const rz = zIdx !== -1 && row[zIdx] !== undefined ? row[zIdx] : idx * 1.5;
        const rVal = valIdx !== -1 && row[valIdx] !== undefined ? row[valIdx] : 0;
        const rFault = faultIdx !== -1 && row[faultIdx] !== undefined ? row[faultIdx] : 0;

        return { rx, ry, rz, rVal, rFault };
      });

      const rawXs = rawCoords.map(c => c.rx);
      const rawYs = rawCoords.map(c => c.ry);
      const rawZs = rawCoords.map(c => c.rz);
      const rawVals = rawCoords.map(c => c.rVal);

      const minX = Math.min(...rawXs);
      const maxX = Math.max(...rawXs);
      const minY = Math.min(...rawYs);
      const maxY = Math.max(...rawYs);
      const minZ = Math.min(...rawZs);
      const maxZ = Math.max(...rawZs);
      const minVal = Math.min(...rawVals);
      const maxVal = Math.max(...rawVals);

      const xSpan = maxX - minX || 1.0;
      const ySpan = maxY - minY || 1.0;
      const zSpan = maxZ - minZ || 1.0;
      const valSpan = maxVal - minVal || 1.0;

      // 1. Map to interactive floating sphere meshes (bola-bola kecil)
      const maxVisualPoints = 80;
      const stride = Math.max(1, Math.ceil(rawCoords.length / maxVisualPoints));
      const simulatedPoints: GeoDataPoint[] = [];

      for (let i = 0; i < rawCoords.length; i += stride) {
        const c = rawCoords[i];
        
        // Map relative offsets scaling smoothly within [-8, 8] horizontally and [-4, 4] vertically
        const mappedX = xIdx !== -1 ? -10 + ((c.rx - minX) / xSpan) * 20 : (i / rawCoords.length) * 20 - 10;
        const mappedZ = yIdx !== -1 ? -10 + ((c.ry - minY) / ySpan) * 20 : Math.sin(i * 0.4) * 6;
        const mappedY = zIdx !== -1 ? -5 + ((c.rz - minZ) / zSpan) * 10 : (i / rawCoords.length) * 10 - 5;

        const rangeFraction = valSpan > 0 ? (c.rVal - minVal) / valSpan : 0.5;
        // Sci-Fi glow colors (low = electric cyan, high = energetic magnetic orange)
        const pointColor = rangeFraction < 0.33 
          ? "#00ffcc" 
          : rangeFraction < 0.66 
            ? "#ffff33" 
            : "#ff4411";

        simulatedPoints.push({
          id: `telemetry_scatter_${i}`,
          position: [mappedX, mappedY, mappedZ],
          color: pointColor,
          type: 'telemetry'
        });
      }

      setPoints(simulatedPoints);

      // 2. Drive Lithology Strata thicknesses dynamically based on average/variation ratio of core physical variables 
      let meanParam = 1.0;
      let stdDevParam = 0.5;
      if (rawVals.length > 0) {
        meanParam = rawVals.reduce((sum, v) => sum + v, 0) / rawVals.length;
        const totalSq = rawVals.reduce((sum, v) => sum + Math.pow(v - meanParam, 2), 0);
        stdDevParam = Math.sqrt(totalSq / rawVals.length) || 0.5;
      }
      
      const deviationCoeff = meanParam > 0 ? (stdDevParam / meanParam) : 0.5;
      const sizeMod = 1.0 + Math.max(-0.6, Math.min(0.9, deviationCoeff * 0.7));

      // Re-configure strata boundaries dynamically based on raw parameters
      const bounds1 = -12 * sizeMod;
      const bounds2 = -32 * sizeMod;
      const bounds3 = -60 * sizeMod;

      const dynamicStrataLayers: LithologyLayer[] = [
        { 
          name: `Upper Porous Sandstone [D: X${sizeMod.toFixed(2)}]`, 
          color: '#d4c919', 
          depthStart: 0, 
          depthEnd: bounds1, 
          displacement: 0.8 + deviationCoeff * 2.0 
        },
        { 
          name: `Middle Shale Barrier [V_Avg: ${meanParam.toFixed(1)}]`, 
          color: '#c93c1e', 
          depthStart: bounds1, 
          depthEnd: bounds2, 
          displacement: 1.2 + deviationCoeff * 2.5 
        },
        { 
          name: `Base Basement Granites`, 
          color: '#1e3cc9', 
          depthStart: bounds2, 
          depthEnd: bounds3, 
          displacement: 1.6 + deviationCoeff * 3.0 
        }
      ];

      setLayers(dynamicStrataLayers);

      // 3. Drive structural Fault Active state and placement dynamically matching peak stresses
      const maxFaultProb = rawCoords.reduce((max, c) => Math.max(max, c.rFault), 0);
      const isFaultTriggered = maxFaultProb > 0.45 || deviationCoeff > 0.15;
      setFaultActive(isFaultTriggered);

      const maxValIndex = rawVals.indexOf(Math.max(...rawVals));
      if (maxValIndex !== -1 && xIdx !== -1) {
        const peakXVal = rawCoords[maxValIndex].rx;
        const mappedPeakX = -8 + ((peakXVal - minX) / xSpan) * 16;
        setFaultPositionX(mappedPeakX);
      } else {
        setFaultPositionX((Math.cos(parsedRows.length) * 3));
      }
    };

    window.addEventListener('geoai:transmit', handleTelemetryIngested);
    return () => window.removeEventListener('geoai:transmit', handleTelemetryIngested);
  }, [setPoints, setLayers, setFaultActive, setFaultPositionX]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] overflow-hidden rounded-md border border-[#333] shadow-lg relative font-sans">
      {/* Immersive High-Focus Intro Overlay (Background Blur) */}
      {isLoaderActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-[#333] bg-[#0d0d0f]/90 shadow-2xl max-w-sm text-center animate-fade-in relative overflow-hidden">
            {/* Geometric Sci-Fi Corner elements */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FF5722]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FF5722]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FF5722]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FF5722]"></div>
            
            {/* Unified Project Emblem Logo featuring KrissCross theme */}
            <div className="mb-5 relative">
              <GeoAILogo size={80} glow={true} className="animate-pulse" />
            </div>
            
            <h2 className="text-xl font-extrabold text-white tracking-widest font-mono mb-1 uppercase">
              {BRANDING.APP_NAME} {BRANDING.APP_VERSION}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-0.5 w-6 bg-[#FF5722]/50"></span>
              <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">Multi-Agent Volumetric Model</span>
              <span className="h-0.5 w-6 bg-[#FF5722]/50"></span>
            </div>
            
            {/* Explicit, clean credit subtext */}
            <p className="text-xs font-mono font-medium text-gray-300 tracking-wider mb-2">
              System Designed & Engineered
            </p>
            <p className="text-[#FF5722] font-mono text-xs font-bold tracking-widest uppercase mb-4">
              {BRANDING.APP_CREDIT}
            </p>
            
            {/* Cycling status loader indicator */}
            <div className="py-2.5 px-4 rounded bg-[#151517] border border-[#222] w-full mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] font-black animate-pulse">
                {altText ? `${BRANDING.APP_NAME.toUpperCase()} ${BRANDING.APP_VERSION} // SOLVING STRATA` : `CREATED ${BRANDING.APP_SHORT_CREDIT.toUpperCase()} // ENGINES ONLINE`}
              </span>
            </div>

            <button 
              onClick={() => setIsLoaderActive(false)}
              className="px-5 py-2 border border-[#444] hover:border-[#FF5722] bg-[#1a1a1c] text-[#ccc] hover:text-white rounded text-[10px] tracking-widest uppercase font-mono transition-all duration-200 cursor-pointer w-full focus:outline-none"
            >
              Access Digital Twin
            </button>
          </div>
        </div>
      )}

      {/* Sci-Fi Header Panel */}
      <div className="flex justify-between items-center px-5 py-3 bg-[#111112] border-b border-[#222] z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#FF5722]/10 text-[#FF5722] rounded border border-[#FF5722]/30">
            <Layers size={16} />
          </div>
          <div>
            <span className="font-bold text-white text-xs tracking-widest flex items-center gap-2 uppercase font-mono">
              3D VOLUMETRIC DIGITAL TWIN
            </span>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
               <span className="text-[9px] text-[#00E5FF] uppercase tracking-widest font-mono font-bold">Mesh Rendering Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest font-bold">Fault Tectonics</label>
            <button 
              onClick={() => setFaultActive(!faultActive)}
              className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border ${faultActive ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-[#222] text-[#555] border-[#333]'}`}
            >
              {faultActive ? 'ENGAGED' : 'DISABLED'}
            </button>
          </div>
          <div className="h-6 w-px bg-[#333]"></div>
          <div className="flex flex-col gap-1 items-end">
            <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest font-bold">Z-Slice Depth (%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliceZ} 
              onChange={(e) => setSliceZ(Number(e.target.value))}
              className="accent-[#FF5722] w-32 outline-none h-1 bg-[#222] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#FF5722] [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
          <div className="h-6 w-px bg-[#333]"></div>
          <button onClick={() => setShowPanel(!showPanel)} className={`p-1.5 rounded transition-colors focus:outline-none ${showPanel ? 'bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/50' : 'bg-[#1a1a1a] text-[#888] border border-[#333] hover:bg-[#222] hover:text-white'}`}>
            <Settings size={14} />
          </button>
          <button className="p-1.5 bg-[#1a1a1a] text-[#888] border border-[#333] hover:bg-[#222] hover:text-white rounded transition-colors focus:outline-none">
            <Maximize size={14} />
          </button>
        </div>
      </div>

      <div ref={setEventSource} className="flex-1 relative cursor-crosshair w-full bg-gradient-to-b from-[#050505] to-[#121214]">
        {showPanel && <SpatialControlPanel onClose={() => setShowPanel(false)} />}
        
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[#ff5722] font-mono text-xs">Booting 3D Render Engine...</div>}>
          <SpatialTwinEngine sliceZ={sliceZ} activePayload={activePayload} eventSource={eventSource} />
        </Suspense>
        
        {/* Continuous Color Scale Legend */}
        <div className="absolute bottom-6 left-6 pointer-events-none z-10">
          <div className="bg-[#111112]/90 backdrop-blur-md border border-[#333] p-4 rounded-lg shadow-2xl font-mono text-xs min-w-[240px]">
             <div className="font-bold text-[#aaa] text-[10px] uppercase tracking-widest mb-3 border-b border-[#222] pb-2 flex justify-between items-center">
               <span>Lithology Strata</span>
               <span className="text-[#00E5FF]">FEM MESH</span>
             </div>
             
             <div className="flex flex-col gap-3">
               {layers.map((layer) => (
                 <div key={layer.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-sm shadow-inner" style={{ backgroundColor: layer.color }}></div>
                     <span className="text-[#ddd] text-[10px] tracking-tight">{layer.name}</span>
                   </div>
                   <span className="text-[#555] text-[9px]">D: {Math.abs(layer.depthStart)}m</span>
                 </div>
               ))}
             </div>

             <div className="mt-4 pt-3 border-t border-[#222]">
                <div className="w-full h-1.5 rounded-full bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${layers[0].color}, ${layers[1].color}, ${layers[2].color})` }}></div>
             </div>

             <div className="mt-3 flex items-center justify-between text-[8px] text-[#555] uppercase tracking-widest font-bold">
               <span>XYZ INTERPOLATION: SHARP</span>
               <span>v4.0.0</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
