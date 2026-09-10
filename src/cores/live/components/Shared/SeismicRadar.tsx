// src/components/Shared/SeismicRadar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  Network, 
  Map as MapIcon, 
  Maximize2, 
  Minimize2, 
  Search, 
  Compass, 
  Layers, 
  Activity, 
  Sparkles, 
  AlertCircle, 
  Info, 
  MapPin, 
  ChevronRight, 
  FileText,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Markdown from 'react-markdown';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

// Read API Key from environment (exposed via vite.config.ts define block)
const STATIC_GOOGLE_MAPS_KEY = (process.env as any).GOOGLE_MAPS_PLATFORM_KEY || '';
const STATIC_hasValidKey = Boolean(STATIC_GOOGLE_MAPS_KEY) && STATIC_GOOGLE_MAPS_KEY !== 'YOUR_API_KEY' && STATIC_GOOGLE_MAPS_KEY.trim().length > 10;

interface SeismicRadarProps {
  drillCoords?: { x: number; y: number; z: number } | null;
  setDrillCoords?: (coords: { x: number; y: number; z: number } | null) => void;
}

// Preset volcanic, fault, and geothermal hotspots around the world for rapid flight simulation
const PRESET_HOTSPOTS = [
  { name: 'Kamojang Geothermal Field, Indonesia', lat: -7.1465, lng: 107.7884, desc: 'Active volcanic caldera with high heat flow and thin cap-rock.', type: 'Geothermal' },
  { name: 'Mount Merapi Volcanic Arc, Indonesia', lat: -7.5407, lng: 110.4457, desc: 'Highly active stratovolcano sitting on subduction compression zone.', type: 'Volcanic' },
  { name: 'Lake Toba Supervolcano Caldera, Indonesia', lat: 2.6845, lng: 98.8351, desc: 'Massive quaternary collapse structure with thick ash fall layers.', type: 'Caldera' },
  { name: 'San Andreas Strike-Slip Fault, USA', lat: 35.1167, lng: -119.6500, desc: 'Major transform fault interface prone to shallow shear stress.', type: 'Fault Line' },
  { name: 'Yellowstone Supervolcano Caldera, USA', lat: 44.4280, lng: -110.5885, desc: 'Continental hotspot rhyolitic caldera with extreme thermal flux.', type: 'Caldera' },
  { name: 'Surtsey Basaltic Volcano, Iceland', lat: 63.3033, lng: -20.6047, desc: 'Sub-aquatic explosive basaltic vent on spreading oceanic ridge.', type: 'Spreading Ridge' }
];

export default function SeismicRadar({ drillCoords, setDrillCoords }: SeismicRadarProps) {
  const [mapsKey, setMapsKey] = useState<string>(STATIC_GOOGLE_MAPS_KEY);
  const [hasValidKey, setHasValidKey] = useState<boolean>(STATIC_hasValidKey);

  useEffect(() => {
    // Dynamic runtime key fetching from express backend to bridge secret managers perfectly
    fetch('/api/config/maps-key')
      .then(res => res.json())
      .then(data => {
        if (data && data.key) {
          const freshKey = data.key.trim();
          if (freshKey && freshKey !== 'YOUR_API_KEY' && freshKey.length > 10) {
            setMapsKey(freshKey);
            setHasValidKey(true);
          }
        }
      })
      .catch(err => console.warn('Failed to fetch runtime maps-key:', err));
  }, []);

  const [isMaximized, setIsMaximized] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('satellite');
  
  // Coordinate State (Default to Kamojang, ID)
  const [lat, setLat] = useState(-7.18);
  const [lng, setLng] = useState(107.72);
  
  // AI Grounded Report State
  const [isScanning, setIsScanning] = useState(false);
  const [aiReport, setAiReport] = useState<string>('');
  const [citations, setCitations] = useState<Array<{ title: string; uri: string }>>([]);
  const [scanningMessage, setScanningMessage] = useState('Initiating sonar sweep...');

  // Mock Map interactions when GOOGLE_MAPS_KEY is missing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepAngle = useRef(0);
  const pulseRadius = useRef(0);

  // Sync from Command Center Sliders (X, Y, Z) to Map Lat/Lng
  useEffect(() => {
    if (drillCoords) {
      const { x, y } = drillCoords;
      // Map standard grid coordinates (0-1000) to latitude/longitude in the Kamojang bounds
      const mappedLng = 107.7 + (x / 1000) * 0.2;
      const mappedLat = -7.25 + (y / 1000) * 0.2;
      
      // Only sync if the change is significant to avoid infinite feedback loops
      if (Math.abs(lat - mappedLat) > 0.0001 || Math.abs(lng - mappedLng) > 0.0001) {
        setLat(mappedLat);
        setLng(mappedLng);
      }
    }
  }, [drillCoords]);

  // Sync from Map click/drag back to Command Center Sliders (X, Y, Z)
  const handleCoordinateChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    
    // Map latitude/longitude back to the local X, Y exploration grid
    const mappedX = Math.max(0, Math.min(1000, Math.round((newLng - 107.7) / 0.2 * 1000)));
    const mappedY = Math.max(0, Math.min(1000, Math.round((newLat - (-7.25)) / 0.2 * 1000)));
    
    if (setDrillCoords) {
      setDrillCoords({
        x: mappedX,
        y: mappedY,
        z: drillCoords?.z || 450
      });
    }
  };

  // Run AI Grounding Scan utilizing Gemini & Google Maps Grounding Tool
  const handleGroundingScan = async () => {
    setIsScanning(true);
    setAiReport('');
    setCitations([]);
    
    const messages = [
      'Sending high-frequency seismic ping...',
      'Mapping sub-surface gravitational anomalies...',
      'Accessing real-time Google Maps geological grounding layer...',
      'Synthesizing lithology and fault boundaries with Gemini flash...',
      'Compiling final professional geothermal assessment...'
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length - 1) {
        msgIdx++;
        setScanningMessage(messages[msgIdx]);
      }
    }, 1500);

    try {
      // Find place name matching presets or default to generic coordinate label
      const matchedPreset = PRESET_HOTSPOTS.find(
        p => Math.abs(p.lat - lat) < 0.05 && Math.abs(p.lng - lng) < 0.05
      );
      const placeName = matchedPreset ? matchedPreset.name : `Exploration Zone (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;

      const res = await fetch('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, placeName })
      });

      const data = await res.json();
      setAiReport(data.report || '');
      if (data.citations) setCitations(data.citations);
    } catch (err: any) {
      console.error('Error conducting maps grounding scan:', err);
      setAiReport('Failed to load grounded AI report. Please verify connection and try again.');
    } finally {
      clearInterval(interval);
      setIsScanning(false);
    }
  };

  // HTML5 Interactive Canvas Animation (Renders if Google Maps Key is missing)
  useEffect(() => {
    if (hasValidKey) return; // Only run animation if we use the fallback canvas
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const drawMockMap = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      // Deep Space background with cyber grid lines
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, w, h);

      // Draw Grid
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      // Draw simulated contour lines
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.08)';
      ctx.lineWidth = 1.5;
      for (let r = 30; r < w; r += 45) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r + Math.sin(sweepAngle.current + r) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radar Sweep
      sweepAngle.current = (sweepAngle.current + 0.03) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(sweepAngle.current) * (w / 1.4), h / 2 + Math.sin(sweepAngle.current) * (h / 1.4));
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sweep Gradient Fan
      const gradient = ctx.createLinearGradient(w / 2, h / 2, w / 2 + Math.cos(sweepAngle.current) * 120, h / 2 + Math.sin(sweepAngle.current) * 120);
      gradient.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.arc(w / 2, h / 2, w / 1.4, sweepAngle.current - 0.5, sweepAngle.current, false);
      ctx.lineTo(w / 2, h / 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Seismic expanding wave pulse from current target center
      pulseRadius.current = (pulseRadius.current + 1.5) % 80;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, pulseRadius.current, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0, 1 - pulseRadius.current / 80) * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Crosshair Center Target
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(w / 2 - 15, h / 2); ctx.lineTo(w / 2 + 15, h / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - 15); ctx.lineTo(w / 2, h / 2 + 15); ctx.stroke();
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2); ctx.stroke();

      // Core Target Dot
      ctx.fillStyle = '#ff5722';
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 2.5, 0, Math.PI * 2); ctx.fill();

      animationId = requestAnimationFrame(drawMockMap);
    };

    drawMockMap();
    return () => cancelAnimationFrame(animationId);
  }, [hasValidKey]);

  return (
    <>
      {/* 1. Embedded Sidebar Widget View */}
      <div className="w-full h-full flex flex-col justify-between relative text-gray-300">
        <div className="absolute top-1 left-1 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-white/5">
          <Network size={12} className="text-[#00E5FF] animate-pulse" />
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-200">ACTIVE GIS SCAN</span>
        </div>

        <button 
          onClick={() => setIsMaximized(true)}
          className="absolute top-1 right-1 z-10 bg-[#FF5722] hover:bg-[#ff784e] text-white p-1 rounded hover:scale-105 transition-all shadow-md cursor-pointer"
          title="Open Master GIS Control Board"
        >
          <Maximize2 size={12} />
        </button>

        {/* Dynamic map viewport */}
        <div className="flex-1 flex items-center justify-center bg-black overflow-hidden rounded-lg border border-[#333]">
          {hasValidKey ? (
            <APIProvider apiKey={mapsKey}>
              <div className="w-full h-full min-h-[140px] relative">
                <Map
                  defaultCenter={{ lat, lng }}
                  center={{ lat, lng }}
                  zoom={12}
                  mapTypeId={mapType}
                  disableDefaultUI={true}
                  gestureHandling={'cooperative'}
                  style={{ width: '100%', height: '100%' }}
                />
                {/* Visual center indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 border-2 border-[#FF5722] rounded-full flex items-center justify-center animate-ping absolute opacity-60" />
                  <div className="w-2 h-2 bg-[#FF5722] rounded-full shadow-[0_0_8px_#FF5722]" />
                </div>
              </div>
            </APIProvider>
          ) : (
            <div className="w-full h-full relative cursor-pointer" onClick={() => setIsMaximized(true)}>
              <canvas ref={canvasRef} width={220} height={140} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 right-2 text-center bg-black/80 border border-yellow-500/20 rounded px-1.5 py-1 backdrop-blur-sm">
                <p className="text-[8px] font-mono text-yellow-500 leading-tight">🛰️ Simulated GIS Active (Key Offline)</p>
              </div>
            </div>
          )}
        </div>

        {/* Location / Navigation Info HUD */}
        <div className="mt-1.5 flex justify-between items-center text-[9px] font-mono text-gray-500 select-none border-t border-[#222] pt-1">
          <div className="truncate pr-1">
            LAT: <span className="text-white font-bold">{lat.toFixed(4)}</span> | LNG: <span className="text-white font-bold">{lng.toFixed(4)}</span>
          </div>
          <div className="text-[#00E5FF] font-bold shrink-0">UTM-48S</div>
        </div>
      </div>

      {/* 2. Fullscreen Immersive GIS Control Board Modal */}
      {isMaximized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-fade-in">
          <div className="w-full max-w-6xl h-[90vh] bg-[#0c0c0e] border border-[#2d2d35] rounded-xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            
            {/* Cyberpunk edge corner lines */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00ffcc]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#ff5722]"></div>

            {/* Modal Header */}
            <div className="p-4 border-b border-[#2d2d35] flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-2.5">
                <MapIcon className="text-[#00E5FF] animate-pulse" size={20} />
                <div>
                  <h2 className="text-sm font-black font-mono tracking-wider text-white uppercase flex items-center gap-1.5">
                    Master GIS Tectonic Explorer
                    <span className="text-[9px] bg-[#FF5722]/10 border border-[#FF5722]/30 px-1.5 py-0.5 rounded text-[#FF5722] font-black animate-pulse">COGNITIVE TWIN</span>
                  </h2>
                  <p className="text-[10px] font-mono text-gray-500">Real-time Satellite, Lithology, and Earth-Grounding Dashboard</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMaximized(false)}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-all"
              >
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Split Screen Workspace */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Side: Interactive Map Pane */}
              <div className="w-full md:w-3/5 border-r border-[#2d2d35] flex flex-col relative h-[45vh] md:h-full bg-black">
                
                {/* Floating Map Theme Controls */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5 bg-black/85 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10 shadow-lg">
                  <button 
                    onClick={() => setMapType('satellite')} 
                    className={`text-[9px] font-mono font-bold px-2 py-1 rounded transition-colors cursor-pointer ${mapType === 'satellite' ? 'bg-[#FF5722] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    Satellite
                  </button>
                  <button 
                    onClick={() => setMapType('hybrid')} 
                    className={`text-[9px] font-mono font-bold px-2 py-1 rounded transition-colors cursor-pointer ${mapType === 'hybrid' ? 'bg-[#FF5722] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    Hybrid
                  </button>
                  <button 
                    onClick={() => setMapType('roadmap')} 
                    className={`text-[9px] font-mono font-bold px-2 py-1 rounded transition-colors cursor-pointer ${mapType === 'roadmap' ? 'bg-[#FF5722] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    Roadmap
                  </button>
                  <button 
                    onClick={() => setMapType('terrain')} 
                    className={`text-[9px] font-mono font-bold px-2 py-1 rounded transition-colors cursor-pointer ${mapType === 'terrain' ? 'bg-[#FF5722] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    Terrain
                  </button>
                </div>

                {/* Main Map Component */}
                <div className="flex-1 w-full h-full relative">
                  {hasValidKey ? (
                    <APIProvider apiKey={mapsKey}>
                      <Map
                        defaultCenter={{ lat, lng }}
                        center={{ lat, lng }}
                        zoom={13}
                        mapTypeId={mapType}
                        disableDefaultUI={false}
                        onClick={(e) => {
                          if (e.detail.latLng) {
                            handleCoordinateChange(e.detail.latLng.lat, e.detail.latLng.lng);
                          }
                        }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <AdvancedMarker 
                          position={{ lat, lng }} 
                          draggable={true}
                          onDragEnd={(e) => {
                            if (e.latLng) {
                              handleCoordinateChange(e.latLng.lat(), e.latLng.lng());
                            }
                          }}
                        >
                          <Pin background={'#FF5722'} borderColor={'#ffffff'} glyphColor={'#000000'} scale={1.2}>
                            <div className="text-[9px] text-white font-bold whitespace-nowrap mt-1 bg-black/80 px-1 py-0.5 rounded border border-white/10">TARGET DRILL</div>
                          </Pin>
                        </AdvancedMarker>
                      </Map>
                      
                      {/* Active scan sonar animation overlaid on real map */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[30vw] h-[30vw] border border-[#00E5FF]/20 rounded-full flex items-center justify-center animate-ping opacity-40" />
                        <div className="w-[10vw] h-[10vw] border border-[#00E5FF]/40 rounded-full flex items-center justify-center animate-pulse opacity-50" />
                      </div>
                    </APIProvider>
                  ) : (
                    <div className="w-full h-full relative flex flex-col items-center justify-center bg-[#070709] p-6 text-center select-none">
                      <canvas ref={canvasRef} className="w-[85%] h-[80%] rounded-lg border border-[#222]" />
                      
                      {/* Interaction Area for Mock map click */}
                      <div 
                        className="absolute inset-0 cursor-crosshair" 
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percentX = (e.clientX - rect.left) / rect.width;
                          const percentY = (e.clientY - rect.top) / rect.height;
                          
                          // Convert click percentages back to a localized delta Lat/Lng
                          const clickedLng = 107.7 + percentX * 0.2;
                          const clickedLat = -7.05 - percentY * 0.2;
                          handleCoordinateChange(clickedLat, clickedLng);
                        }}
                      />

                      <div className="absolute top-16 left-1/2 -translate-x-1/2 max-w-sm bg-black/90 p-4 rounded-xl border border-yellow-500/20 backdrop-blur-md shadow-2xl pointer-events-auto">
                        <h3 className="text-xs font-mono font-black text-yellow-500 uppercase flex items-center gap-1.5 justify-center mb-1">
                          <AlertCircle size={14} /> Interactive Simulation Active
                        </h3>
                        <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                          Real-time satellite tiles are offline. Add your Google Maps Platform key in <strong className="text-white">Settings &gt; Secrets</strong> to unlock real-time mapping.
                        </p>
                        <div className="text-[9px] font-mono text-gray-500 bg-white/5 p-1.5 rounded text-left border border-white/5">
                          Click anywhere on the radar above or choose a preset to simulate sub-surface inversion scan!
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preset hot-keys row */}
                <div className="p-3 border-t border-[#2d2d35] bg-[#0c0c0e] flex flex-col gap-1.5 select-none">
                  <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-widest">RAPID EXPLORATION presets</span>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                    {PRESET_HOTSPOTS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCoordinateChange(preset.lat, preset.lng)}
                        className={`text-[9px] font-mono py-1.5 px-3 rounded-md shrink-0 border transition-all cursor-pointer flex items-center gap-1.5 ${Math.abs(preset.lat - lat) < 0.05 && Math.abs(preset.lng - lng) < 0.05 ? 'bg-[#FF5722]/20 border-[#FF5722]/50 text-white font-bold' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                      >
                        <Compass size={10} className={Math.abs(preset.lat - lat) < 0.05 ? 'text-[#FF5722] animate-spin-slow' : 'text-gray-500'} />
                        {preset.name.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Side: Geophysics & Earth Grounding Analysis Pane */}
              <div className="w-full md:w-2/5 flex flex-col overflow-y-auto p-4 bg-[#0a0a0c] font-mono">
                
                {/* 1. Dynamic Coordinate Indicators */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg border border-[#2d2d35] bg-black/40">
                    <span className="text-[9px] text-gray-500 block uppercase">LATITUDE DEGREE</span>
                    <span className="text-sm font-bold text-white tracking-tight">{lat.toFixed(6)}° N</span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#2d2d35] bg-black/40">
                    <span className="text-[9px] text-gray-500 block uppercase">LONGITUDE DEGREE</span>
                    <span className="text-sm font-bold text-white tracking-tight">{lng.toFixed(6)}° E</span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#2d2d35] bg-black/40">
                    <span className="text-[9px] text-gray-500 block uppercase">UTM EASTING (M)</span>
                    <span className="text-xs font-bold text-[#00E5FF]">{(788000 + (lng - 107.7) * 111000).toFixed(1)} m E</span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#2d2d35] bg-black/40">
                    <span className="text-[9px] text-gray-500 block uppercase">UTM NORTHING (M)</span>
                    <span className="text-xs font-bold text-[#00E5FF]">{(9210000 + (lat - (-7.2)) * 110500).toFixed(1)} m N</span>
                  </div>
                </div>

                {/* 2. Scanning trigger bar */}
                <button
                  onClick={handleGroundingScan}
                  disabled={isScanning}
                  className="w-full bg-[#FF5722] hover:bg-[#ff784e] disabled:bg-gray-800 text-white py-3 px-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF5722]/10 cursor-pointer active:scale-[0.98]"
                >
                  {isScanning ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>{scanningMessage}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                      <span>RUN AI EARTH GROUNDING SCAN</span>
                    </>
                  )}
                </button>

                {/* 3. Analysis Display / Report Terminal */}
                <div className="flex-1 mt-4 border border-[#2d2d35] rounded-lg bg-black/50 p-4 relative overflow-hidden flex flex-col min-h-[300px]">
                  
                  {/* Decorative terminal header */}
                  <div className="flex items-center justify-between border-b border-[#2d2d35] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Activity size={12} className="text-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">COGNITIVE GEOLINK TERMINAL</span>
                    </div>
                    <span className="text-[8px] text-gray-500">READY</span>
                  </div>

                  {isScanning ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-[#00E5FF]/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#00E5FF] rounded-full border-t-transparent animate-spin" />
                      </div>
                      <p className="text-xs text-[#00E5FF] font-bold animate-pulse">{scanningMessage}</p>
                      <p className="text-[9px] text-gray-500 mt-2 max-w-xs">Connecting to Gemini with GIS Grounding parameters to analyze tectonic and lithological profiles...</p>
                    </div>
                  ) : aiReport ? (
                    <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
                      
                      {/* Markdown Assessment Output */}
                      <div className="text-xs text-gray-300 space-y-4 markdown-body leading-relaxed max-w-none">
                        <Markdown>{aiReport}</Markdown>
                      </div>

                      {/* Grounding Source Citations (Strict Google Maps Policy rule verification) */}
                      {citations.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-[#222]">
                          <h4 className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Info size={11} /> Grounded Map Sources Checked
                          </h4>
                          <div className="flex flex-col gap-1.5">
                            {citations.map((cite, idx) => (
                              <a
                                key={idx}
                                href={cite.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-[#00E5FF] hover:underline flex items-center gap-1 bg-[#00E5FF]/5 px-2 py-1 rounded border border-[#00E5FF]/10 hover:bg-[#00E5FF]/10 transition-all truncate"
                              >
                                <ExternalLink size={10} className="shrink-0" />
                                {cite.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 select-none">
                      <FileText size={32} className="text-gray-700 mb-3 animate-pulse" />
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Analytical Report Empty</p>
                      <p className="text-[10px] max-w-xs">Click the <strong className="text-white">Run AI Earth Grounding Scan</strong> button above to synthesize real-time geological reports for these coordinates with Gemini and Google Maps!</p>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
