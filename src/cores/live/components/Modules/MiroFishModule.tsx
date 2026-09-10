import React, { useState, useEffect, useRef } from 'react';
import { 
  Anchor, 
  Fish, 
  Activity, 
  Sliders, 
  Play, 
  Pause, 
  RefreshCw, 
  Layers, 
  AlertCircle, 
  CheckCircle, 
  Compass, 
  Cpu,
  Database,
  Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { useAppContext } from '../../context/AppContext';

interface EchoTarget {
  id: string;
  depth: number;
  sizeCm: number;
  type: 'Biomass' | 'Sub-bottom' | 'Debris' | 'Thermocline Anomaly';
  confidence: number;
  timestamp: string;
}

export default function MiroFishModule() {
  const { addLog } = useGlobalGeoContext();
  const { apiMode, performanceMode } = useAppContext();

  // Sonar operational states
  const [isActive, setIsActive] = useState(true);
  const [frequencyKhz, setFrequencyKhz] = useState(200); // 50kHz for deep, 200kHz for high-res shallow
  const [gainDb, setGainDb] = useState(42);
  const [rangeMaxM, setRangeMaxM] = useState(150);
  const [scanningMode, setScanningMode] = useState<'AUTO' | 'SPLIT' | 'ZOOM'>('SPLIT');
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Targets log
  const [targets, setTargets] = useState<EchoTarget[]>([
    { id: 'TRG-091', depth: 32.4, sizeCm: 45, type: 'Biomass', confidence: 94, timestamp: '10:12:45' },
    { id: 'TRG-092', depth: 89.1, sizeCm: 12, type: 'Biomass', confidence: 81, timestamp: '10:14:12' },
    { id: 'TRG-093', depth: 142.0, sizeCm: 210, type: 'Sub-bottom', confidence: 97, timestamp: '10:15:30' },
    { id: 'TRG-094', depth: 65.5, sizeCm: 8, type: 'Debris', confidence: 73, timestamp: '10:16:02' }
  ]);

  // Thermocline Layer & Bottom Sediment composition
  const [bottomComposition, setBottomComposition] = useState({
    sandPct: 45,
    mudPct: 35,
    coralPct: 15,
    rockPct: 5,
    hardnessIndex: 0.78
  });

  const [waterTemperatureC, setWaterTemperatureC] = useState(24.5);
  const [biomassDensityScore, setBiomassDensityScore] = useState(82);

  // Canvas refs for Sonar echogram and sweep radar
  const echogramRef = useRef<HTMLCanvasElement | null>(null);
  const radarRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation variables
  const simulationFrame = useRef<number>(0);
  const sweepAngle = useRef<number>(0);

  // Update echogram animation
  useEffect(() => {
    if (!isActive) return;

    const canvas = echogramRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;
    const isEco = performanceMode === 'ECO_PERFORMANCE';
    let frameSkip = 0;

    const draw = () => {
      // In Eco mode, throttle update rate to preserve 60 FPS and reduce GPU/RAM bandwidth
      if (isEco) {
        frameSkip++;
        if (frameSkip % 2 !== 0) {
          animId = requestAnimationFrame(draw);
          return;
        }
      }

      simulationFrame.current += 1;
      
      // Shift existing image to the left
      const step = isEco ? 4 : 2;
      const imgData = ctx.getImageData(step, 0, width - step, height);
      ctx.putImageData(imgData, 0, 0);

      // Generate new vertical column of sonar data on the far right
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(width - step, 0, step, height);

      // Draw acoustic layers
      const noise = Math.sin(simulationFrame.current * 0.05) * 5;
      
      // Surface noise layer
      ctx.fillStyle = `rgba(0, 229, 255, ${0.4 + Math.random() * 0.2})`;
      ctx.fillRect(width - step, 0, step, 10 + Math.random() * 4);

      // Thermocline (depth transition zone)
      const thermoclineY = height * 0.4 + noise;
      ctx.fillStyle = `rgba(168, 85, 247, ${0.3 + Math.random() * 0.1})`;
      ctx.fillRect(width - step, thermoclineY, step, 8);

      // Fish Biomass simulation
      if (simulationFrame.current % 45 < 12) {
        const fishY = height * 0.25 + Math.sin(simulationFrame.current * 0.1) * 20;
        ctx.fillStyle = '#10B981'; // Lime fish target backscatter
        ctx.fillRect(width - step, fishY, step, 4 + Math.random() * 3);
      }
      
      if (simulationFrame.current % 120 < 25) {
        const bigFishY = height * 0.55 + Math.cos(simulationFrame.current * 0.04) * 30;
        ctx.fillStyle = '#EF4444'; // Red large fish cluster backscatter
        ctx.fillRect(width - step, bigFishY, step, 8 + Math.random() * 4);
      }

      // Bottom Bed sediment backscatter (with slope)
      const slope = Math.sin(simulationFrame.current * 0.01) * 25 + (height * 0.8);
      
      // Draw hard bottom layer (Orange/Yellow high backscatter)
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(width - step, slope, step, 10);
      
      // Sub-bottom bedrock layer (Purple/Grey low backscatter)
      ctx.fillStyle = '#6366F1';
      ctx.fillRect(width - step, slope + 10, step, height - slope - 10);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, frequencyKhz, gainDb, scanningMode, performanceMode]);

  // Update radar sweep animation
  useEffect(() => {
    if (!isActive) return;

    const canvas = radarRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    const drawRadar = () => {
      // Clear with slight trailing opacity
      ctx.fillStyle = 'rgba(11, 19, 43, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Draw concentric radar grids
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Sweep line
      sweepAngle.current = (sweepAngle.current + 0.02) % (Math.PI * 2);
      const sweepX = centerX + radius * Math.cos(sweepAngle.current);
      const sweepY = centerY + radius * Math.sin(sweepAngle.current);

      // Sweep glow gradient
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // Draw glowing targets on sweep intersections
      targets.forEach((t, idx) => {
        const angle = (idx * 1.5 + 0.8) % (Math.PI * 2);
        const dist = radius * (0.3 + (idx * 0.15));
        const tx = centerX + dist * Math.cos(angle);
        const ty = centerY + dist * Math.sin(angle);

        // check if sweep line is near the target angle
        const diff = Math.abs(sweepAngle.current - angle);
        const isNearSweep = diff < 0.15 || diff > (Math.PI * 2 - 0.15);

        if (isNearSweep) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = t.type === 'Biomass' ? '#10B981' : t.type === 'Sub-bottom' ? '#F59E0B' : '#EF4444';
          ctx.fillStyle = t.type === 'Biomass' ? 'rgba(16, 185, 129, 0.9)' : t.type === 'Sub-bottom' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)';
          ctx.beginPath();
          ctx.arc(tx, ty, t.sizeCm / 20 + 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        } else {
          // fade out target marker
          ctx.fillStyle = t.type === 'Biomass' ? 'rgba(16, 185, 129, 0.25)' : t.type === 'Sub-bottom' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)';
          ctx.beginPath();
          ctx.arc(tx, ty, t.sizeCm / 20 + 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, targets]);

  const calibrateSonar = () => {
    setIsCalibrating(true);
    addLog({
      type: 'INFO',
      source: 'MIROFISH',
      message: 'MiroFish sound velocity profile calibrating to 1540 m/s water density index.'
    });
    setTimeout(() => {
      setIsCalibrating(false);
      setGainDb(45);
      setBottomComposition(prev => ({ ...prev, hardnessIndex: 0.78 }));
      addLog({
        type: 'INFO',
        source: 'MIROFISH',
        message: 'MiroFish automatic thermal echo profiling calibration complete.'
      });
    }, 2000);
  };

  const clearTargetLogs = () => {
    setTargets([]);
    addLog({
      type: 'INFO',
      source: 'MIROFISH',
      message: 'MiroFish echogram history and identified biomass targets cleared.'
    });
  };

  return (
    <div className="space-y-6" id="mirofish-module">
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222] pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF]">
            <Anchor className="w-5 h-5" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              MiroFish Acoustic Hydro-Sonar & Marine Geophysics
            </h2>
          </div>
          <p className="text-[11px] font-mono text-[#666] mt-1">
            Real-time sub-bottom sediment echograms, marine thermal stratification analysis, and multi-spectral biomass density metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/60 border border-[#222] px-3 py-1.5 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className="text-[10px] font-mono font-bold uppercase text-white">
              SONAR SENSING: {isActive ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <button
            onClick={() => setIsActive(!isActive)}
            className={`p-2 border rounded-lg transition-all cursor-pointer ${
              isActive 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
            title={isActive ? 'Deactivate Sonar Beam' : 'Activate Sonar Beam'}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Dual View Dashboard Container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Interactive Controller Column */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-[#222] pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase">Acoustic Beam Modifiers</h3>
          </div>

          <div className="space-y-4">
            {/* Frequency Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-gray-400 uppercase">Acoustic Frequency:</span>
                <span className="text-cyan-400 font-bold">{frequencyKhz} kHz</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[50, 83, 200].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFrequencyKhz(f);
                      addLog({
                        type: 'INFO',
                        source: 'MIROFISH',
                        message: `MiroFish hydrophone beam frequency switched to ${f}kHz.`
                      });
                    }}
                    className={`py-1.5 text-[9px] font-mono rounded uppercase border font-bold cursor-pointer transition-all ${
                      frequencyKhz === f
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-[#111] border-[#222] text-gray-500 hover:text-white hover:border-[#333]'
                    }`}
                  >
                    {f} kHz
                  </button>
                ))}
              </div>
              <span className="text-[8px] font-mono text-gray-600">
                {frequencyKhz === 50 ? 'Deep sub-bottom sedimentary layer penetrative scan.' : 
                 frequencyKhz === 83 ? 'Balanced wide-angle marine habitat discovery.' : 
                 'Ultra-high resolution biomass and shallow bathymetric profiler.'}
              </span>
            </div>

            {/* Slider Gain Control */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-gray-400 uppercase">Receiver Gain (Sensitivity):</span>
                <span className="text-orange-400 font-bold">{gainDb} dB</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={gainDb}
                onChange={(e) => setGainDb(Number(e.target.value))}
                className="w-full accent-orange-400 h-1 bg-neutral-900 rounded-lg cursor-pointer"
              />
              <span className="text-[8px] font-mono text-gray-600">Alters decibel amplifications to segment bottom hardness from acoustic noise.</span>
            </div>

            {/* Range controls */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-gray-400 uppercase">Max Sweeping Range:</span>
                <span className="text-emerald-400 font-bold">{rangeMaxM} Meters</span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="50"
                value={rangeMaxM}
                onChange={(e) => setRangeMaxM(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-neutral-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Scanning Modalities */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono uppercase text-gray-500 font-bold">Scanning View Options</span>
              <div className="grid grid-cols-3 gap-2">
                {['AUTO', 'SPLIT', 'ZOOM'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setScanningMode(m as any)}
                    className={`py-1 text-[9px] font-mono rounded border font-bold cursor-pointer transition-all ${
                      scanningMode === m
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-[#111] border-[#222] text-gray-500 hover:text-white'
                    }`}
                  >
                    {m} MODE
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-auto space-y-2 pt-4 border-t border-[#222]">
            <button
              onClick={calibrateSonar}
              disabled={isCalibrating || !isActive}
              className={`w-full py-2 border rounded-lg font-mono text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isCalibrating
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400 animate-pulse'
                  : 'bg-[#18232c] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isCalibrating ? 'animate-spin' : ''}`} />
              {isCalibrating ? 'CALIBRATING WATER PROFILE...' : 'CALIBRATE ACOUSTIC DENSITY'}
            </button>
            
            <button
              onClick={clearTargetLogs}
              className="w-full py-1.5 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/20 text-[9px] font-mono font-bold uppercase tracking-widest rounded-lg cursor-pointer"
            >
              Flush Identified Targets
            </button>
          </div>
        </div>

        {/* Center Canvas Echogram & Sub-bed Visualizer Column */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 xl:col-span-2 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">Acoustic echogram / sub-bottom backscatter</h3>
            </div>
            <span className="text-[8px] font-mono text-gray-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 uppercase font-bold tracking-widest">
              Live Sweep Scroll
            </span>
          </div>

          {/* Echogram Canvas wrapper */}
          <div className="relative bg-[#060A13] border border-[#162744]/40 rounded-xl overflow-hidden h-[240px] flex items-center justify-center">
            {/* Overlay grid lines */}
            <div className="absolute inset-0 bg-grid-lines pointer-events-none opacity-10" />
            
            {/* Depth Markers */}
            <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-between text-[8px] font-mono text-cyan-400/70 select-none py-2 z-10 pointer-events-none">
              <span>0m</span>
              <span>{Math.floor(rangeMaxM * 0.25)}m</span>
              <span>{Math.floor(rangeMaxM * 0.5)}m</span>
              <span>{Math.floor(rangeMaxM * 0.75)}m</span>
              <span>{rangeMaxM}m (Seabed)</span>
            </div>

            <canvas 
              ref={echogramRef}
              width={540} 
              height={240} 
              className="w-full h-full object-cover block"
            />
            
            {!isActive && (
              <div className="absolute inset-0 bg-[#060a13]/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="w-8 h-8 text-cyan-400/50 mb-2 animate-pulse" />
                <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">Sonar Ping Offline</span>
                <span className="text-[9px] font-mono text-gray-600 mt-1">Activate the sonar beam to begin geological backscatter.</span>
              </div>
            )}
          </div>

          {/* Sub-bottom Interpretation Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#111] border border-[#222] rounded-lg p-2.5 font-mono text-center flex flex-col justify-center">
              <span className="text-[8px] text-gray-500 uppercase block">Seabed Hardness</span>
              <span className="text-xs font-bold text-orange-400 block mt-0.5">{bottomComposition.hardnessIndex.toFixed(2)} / 1.00</span>
              <span className="text-[7px] text-gray-600 uppercase block mt-1">Consolidated Clay / Gravel</span>
            </div>
            
            <div className="bg-[#111] border border-[#222] rounded-lg p-2.5 font-mono text-center flex flex-col justify-center">
              <span className="text-[8px] text-gray-500 uppercase block">Biomass Target Count</span>
              <span className="text-xs font-bold text-emerald-400 block mt-0.5">{targets.filter(t => t.type === 'Biomass').length} Identified</span>
              <span className="text-[7px] text-gray-600 uppercase block mt-1">Sustained Habitats</span>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-lg p-2.5 font-mono text-center flex flex-col justify-center">
              <span className="text-[8px] text-gray-500 uppercase block">Avg Surface Temp</span>
              <span className="text-xs font-bold text-purple-400 block mt-0.5">{waterTemperatureC.toFixed(1)}°C</span>
              <span className="text-[7px] text-gray-600 uppercase block mt-1">Thermocline at {Math.floor(rangeMaxM * 0.4)}m</span>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-lg p-2.5 font-mono text-center flex flex-col justify-center">
              <span className="text-[8px] text-gray-500 uppercase block">Acoustic Biomass Index</span>
              <span className="text-xs font-bold text-[#00E5FF] block mt-0.5">{biomassDensityScore} / 100</span>
              <span className="text-[7px] text-gray-600 uppercase block mt-1">Medium-High Density Area</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Interactive Radar Sweep & Targets Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Circular Sweep Widget */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#222] pb-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase">MiroFish Circular Sonar (360° Sweep)</h3>
          </div>

          <div className="relative bg-[#060a13] border border-[#162744]/40 rounded-xl overflow-hidden p-2 flex items-center justify-center">
            <canvas 
              ref={radarRef}
              width={220} 
              height={220} 
              className="w-full max-w-[220px] aspect-square block rounded-full"
            />
            {!isActive && (
              <div className="absolute inset-0 bg-[#060a13]/90 backdrop-blur-xs flex items-center justify-center text-center">
                <span className="text-[9px] font-mono text-gray-600 uppercase font-extrabold tracking-widest">Sweep offline</span>
              </div>
            )}
          </div>
          <span className="text-[8px] font-mono text-center text-gray-500 uppercase tracking-widest">Rotating circular hydrophone telemetry array</span>
        </div>

        {/* Real-Time Identified Target Log Table */}
        <div className="bg-black/40 border border-[#222] rounded-xl p-5 lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">Acoustic Echo Target Registry</h3>
            </div>
            <button
              onClick={() => {
                const id = 'TRG-' + Math.floor(Math.random() * 900 + 100);
                const depth = Number((Math.random() * (rangeMaxM - 10) + 10).toFixed(1));
                const sizeCm = Math.floor(Math.random() * 80 + 5);
                const types: any[] = ['Biomass', 'Debris', 'Thermocline Anomaly'];
                const type = types[Math.floor(Math.random() * types.length)];
                const newTrg: EchoTarget = {
                  id,
                  depth,
                  sizeCm,
                  type,
                  confidence: Math.floor(Math.random() * 25 + 75),
                  timestamp: new Date().toTimeString().split(' ')[0]
                };
                setTargets(prev => [newTrg, ...prev]);
                addLog({
                  type: 'INFO',
                  source: 'MIROFISH',
                  message: `MiroFish backscatter detected candidate target ${id} (${sizeCm}cm) at ${depth}m depth.`
                });
              }}
              className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded hover:bg-emerald-500/20 uppercase font-bold"
            >
              + Inject Test Biomass Target
            </button>
          </div>

          {/* Table list */}
          <div className="flex-1 overflow-y-auto max-h-[220px] scrollbar-thin">
            <table className="w-full text-left font-mono text-[9px] border-collapse">
              <thead>
                <tr className="border-b border-[#222] text-gray-500 uppercase text-[8px] tracking-wider pb-1.5">
                  <th className="py-1">Target ID</th>
                  <th>Classification</th>
                  <th>Depth</th>
                  <th>Reflective Size</th>
                  <th>Confidence</th>
                  <th className="text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181a]">
                {targets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-600 italic">No acoustic targets identified in the current water column.</td>
                  </tr>
                ) : (
                  targets.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-2.5 font-bold text-gray-300">{t.id}</td>
                      <td>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          t.type === 'Biomass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          t.type === 'Sub-bottom' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="text-[#00E5FF] font-bold">{t.depth.toFixed(1)} m</td>
                      <td className="text-gray-300">{t.sizeCm} cm</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">{t.confidence}%</span>
                          <div className="w-10 bg-[#111] h-1 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-cyan-400" style={{ width: `${t.confidence}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="text-right text-gray-500">{t.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
