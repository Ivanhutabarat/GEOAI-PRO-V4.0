import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useEffect, useRef } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { 
  Unplug, 
  Settings, 
  SlidersHorizontal, 
  Download, 
  Layers, 
  Cpu 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { gprPayload } from '../../../../data/mocks/gpr';

export default function GPRModule() {

  const { apiMode, dimensionMode } = useAppContext();
  

  const { globalData, rawPayloads,  activeFileName } = useGlobalGeoContext();
  const [antennaFreq, setAntennaFreq] = useState<number>(500); // in MHz
  const [dielectric, setDielectric] = useState<number>(6.0); // Soil dielectric constant
  const [timeWindow, setTimeWindow] = useState<number>(40); // in ns
  const [activeTrace, setActiveTrace] = useState<number>(24);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [rawWiggleTrace, setRawWiggleTrace] = useState<any[]>([]);

  useEffect(() => {
    if (!globalData.gprData || globalData.gprData.length === 0) setRawWiggleTrace(gprPayload); else setRawWiggleTrace(globalData.gprData);
  }, [activeFileName, activeTrace, antennaFreq, timeWindow, dielectric]);

  const presetLog = gprPayload.map(d => `${d.distance_m},${d.two_way_time_ns},${d.amplitude}`).join("\n");

  const handleParsedData = (parsedData: any[]) => {
    if (parsedData && parsedData.length > 0) {
      const mapped = parsedData.map((row) => ({
        depth: (row[0] || 0).toFixed(2),
        timeNs: (row[1] || 0).toFixed(0),
        amplitude: row[2] || 0
      }));
      setRawWiggleTrace(mapped);
    }
  };

  // Render continuous radargram on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background (dark radar scan atmosphere)
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, width, height);

    // Draw grid horizontal timestamps
    ctx.strokeStyle = 'rgba(255, 87, 34, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillStyle = '#555';
      ctx.font = '7px monospace';
      ctx.fillText(`${Math.round((y / height) * timeWindow)} ns`, 5, y - 4);
    }

    // Draw some simulated hyperbola radar reflections representing buried pipes / bedrock edges
    const hyperbolaPoints = [
      { xc: width * 0.3, ts: 120, col: '#ff5722' },
      { xc: width * 0.65, ts: 180, col: '#ffff00' },
      { xc: width * 0.45, ts: 60, col: '#00b4ff' }
    ];

    hyperbolaPoints.forEach((hp) => {
      ctx.lineWidth = 1.5;
      
      // Draw 5 envelope concentric hyperbolic arcs
      const layers = 6;
      for (let layer = 1; layer <= layers; layer++) {
        ctx.beginPath();
        const aFactor = 0.15 * (layer / layers + 0.3) * (dielectric / 4);
        
        for (let x = hp.xc - 120; x <= hp.xc + 120; x += 4) {
          const dx = x - hp.xc;
          const dy = Math.sqrt(hp.ts * hp.ts + dx * dx * aFactor) - (5 - layer) * 5;
          const mapY = (dy / timeWindow) * height;
          
          if (x === hp.xc - 120) {
            ctx.moveTo(x, mapY);
          } else {
            ctx.lineTo(x, mapY);
          }
        }
        
        const opacity = (1 - layer / layers) * 0.7;
        ctx.strokeStyle = hp.col === '#ff5722' ? `rgba(255, 87, 34, ${opacity})` : (hp.col === '#ffff00' ? `rgba(255, 230, 0, ${opacity})` : `rgba(0, 180, 255, ${opacity})`);
        ctx.stroke();
      }
    });

    // Vertical sweep marker representing the active selected trace line
    const sx = (activeTrace / 48) * width;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshair intersection node
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx, height * 0.42, 4, 0, Math.PI*2);
    ctx.fill();

  }, [antennaFreq, dielectric, timeWindow, activeTrace]);

  // Translate dielectric constant to electromagnetic velocity (c / sqrt(er)) 
  const emVelocity = (0.2998 / Math.sqrt(dielectric)).toFixed(4); // m/ns

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Unplug className="text-[#FF5722]" />
            High-Frequency Ground Penetrating Radar
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">Continuous Radargram & Wiggle Trace Analyzer // .dzx .rd3</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Cpu className="text-[#FF5722] animate-pulse" size={14} />
          <span className="font-mono">NVIDIA A100 // ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Antenna Setup Panel */}
        <div className="col-span-4 space-y-4">
          <UniversalIngestionPort 
            moduleName="gpr"
            contextKey="gprData"
            onParsed={handleParsedData}
            presetLog={presetLog}
          />
          <div className="geo-card">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">Radar Antenna Parameters</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Antenna Center Freq</span>
                  <span className="text-[#FF5722]">{antennaFreq} MHz</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[200, 500, 1000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAntennaFreq(val)}
                      className={`text-[10px] py-1.5 font-mono rounded font-bold uppercase ${antennaFreq === val ? 'bg-[#FF5722] text-black' : 'bg-[#1a1a1a] border border-[#2c2c2c]'}`}
                    >
                      {val} MHz
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Dielectric (Medium er)</span>
                  <span className="text-[#FF5722]">{dielectric} (Sandy Clay)</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="0.5"
                  value={dielectric} 
                  onChange={(e) => setDielectric(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Time Window Depth</span>
                  <span className="text-[#FF5722]">{timeWindow} ns</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  step="5"
                  value={timeWindow} 
                  onChange={(e) => setTimeWindow(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Select Active Scan Trace</span>
                  <span className="text-[#FF5722]">Trace #{activeTrace}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="48" 
                  step="1"
                  value={activeTrace} 
                  onChange={(e) => setActiveTrace(Number(e.target.value))}
                  className="w-full accent-white bg-[#222] h-1 rounded"
                />
              </div>
            </div>
          </div>

          <div className="geo-card block bg-[#111]/40">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">Electromagnetic Velocity</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">PROPR VELOCITY (v)</span>
                <span className="text-green-500 font-bold">{emVelocity} m/ns</span>
              </div>
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">ATTENUATION LEVEL</span>
                <span>4.8 dB/m</span>
              </div>
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">RESOLUBILITY (λ/4)</span>
                <span>{((0.2998 / (antennaFreq / 1000)) / (4 * Math.sqrt(dielectric)) * 100).toFixed(1)} cm</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-[#555]">SENSING RANGE</span>
                <span className="text-[#FF5722]">~8.5 Meters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Continuous radargram & Single wiggle trace graph */}
        <div className="col-span-8 space-y-6">
        {dimensionMode === '3D' && <div className="fixed inset-0 z-50 md:left-56 top-12 bg-black flex p-6"><Fallback3D /></div>}

          <div className="geo-card relative bg-[#0a0a0a]">
            <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-2">
              <span className="text-xs font-mono tracking-widest text-orange-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Antenna Scan B-Scan Radargram
              </span>
              <span className="text-[10px] text-[#555] font-mono">X-AXIS: SURFACE STATIONS / Y-AXIS: DEPTH TIME</span>
            </div>

            <canvas 
              ref={canvasRef} 
              width={640} 
              height={280} 
              className="border border-[#222] rounded w-full bg-[#111] max-w-full"
            />
          </div>

          {/* Trace A-Scan Wiggle Waveform Plot */}
          <div className="geo-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888]">Trace #{activeTrace} A-Scan Waveform</h3>
              <span className="text-[10px] bg-white/5 border border-[#333] px-2 py-0.5 rounded text-white font-mono">TIME RESIDUAL REFLECTANCE</span>
            </div>
            
            <div className="h-44 w-full">
              <DebugDump data={rawWiggleTrace} />
<ResponsiveContainer width="100%" height="100%">
                <LineChart data={forceMapData(rawWiggleTrace || [])}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="depth" stroke="#555" fontSize={10} label={{ value: 'Subsurface Depth (m)', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 9 }} />
                  <YAxis stroke="#555" fontSize={10} name="Reflection Amp" domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                  <Line type="monotone" dataKey="amplitude" stroke="#FF5722" dot={false} strokeWidth={2} name="EM Wavelet Echo" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-[#555] mt-4 text-right font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
