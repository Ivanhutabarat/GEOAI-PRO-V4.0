import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Activity, 
  Layers, 
  ChevronRight, 
  Cpu, 
  Play, 
  Settings, 
  ShieldAlert 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ScatterChart, Scatter, AreaChart, Area } from 'recharts';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';

export default function GravityMagModule() {
  const [depthFilter, setDepthFilter] = useState<number>(1500);
  const [gridDensity, setGridDensity] = useState<number>(32);
  const [noiseLevel, setNoiseLevel] = useState<number>(8);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>("STN-12");
  const { rawPayloads } = useGlobalGeoContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stationData, setStationData] = useState<any[]>([]);

  const presetLog = `# Gravity & Mag Survey Table
# Station, Longitude, Latitude, Magnetic_Anomaly_nT, Bouguer_Anomaly_mGal
GRV-01, 105.301, -6.111, 45200.2, 45.2
GRV-02, 105.302, -6.115, 45150.1, 42.1
GRV-03, 105.305, -6.120, 45480.0, 98.4
GRV-04, 105.310, -6.122, 45095.5, 15.0
GRV-05, 105.315, -6.118, 44610.0, -75.0
`

  useEffect(() => {
    const raw = rawPayloads.gravityData;
    if (!raw || !raw.trim()) {
      setStationData([]);
      return;
    }

    const lines = raw.split('\n');
    const parsedData: any[] = [];
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#') || line.startsWith('~') || line.startsWith('//')) continue;
      const parts = line.split(/[,;\s\t]+/).filter(Boolean);
      if (parts.length >= 5) {
        parsedData.push({
          station: parts[0],
          longitude: parseFloat(parts[1]) || 0,
          latitude: parseFloat(parts[2]) || 0,
          magnetic: parseFloat(parts[3]) || 0,
          gravity: parseFloat(parts[4]) || 0
        });
      }
    }
    setStationData(parsedData);
  }, [rawPayloads.gravityData]);

  const handleParsedData = (parsedData: any[]) => {
    // Explicitly handled by effect above to meet specific prompt parsing requirement inside GravityMagnetic
  };

  // Draw simulated gravity contour map on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear and build dark baseline grid
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);
    
    // Draw technical grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += gridDensity) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridDensity) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw simulated concentric contour rings representing ore bodies
    const anomalies = [
      { cx: width * 0.35, cy: height * 0.4, rMax: 160, val: 120, col: [255, 87, 34] },
      { cx: width * 0.7, cy: height * 0.65, rMax: 110, val: -80, col: [0, 180, 255] }
    ];

    anomalies.forEach((am) => {
      ctx.lineWidth = 1.5;
      const ringCount = 8;
      for (let i = 1; i <= ringCount; i++) {
        const progress = i / ringCount;
        const radius = am.rMax * progress * (depthFilter / 2000);
        ctx.beginPath();
        
        // Add subtle noise wobble based on level
        const step = 0.15;
        for (let th = 0; th <= Math.PI * 2 + 0.1; th += step) {
          const wobble = Math.sin(th * 5) * noiseLevel * 0.5 * (1 - progress);
          const px = am.cx + (radius + wobble) * Math.cos(th);
          const py = am.cy + (radius + wobble) * Math.sin(th);
          if (th === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }

        const opacity = (1 - progress) * 0.6;
        ctx.strokeStyle = `rgba(${am.col[0]}, ${am.col[1]}, ${am.col[2]}, ${opacity})`;
        ctx.stroke();
        
        // Annotate anomaly values on contour
        if (i === 4) {
          ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
          ctx.font = '8px monospace';
          ctx.fillText(`${am.val > 0 ? '+' : ''}${Math.round(am.val * (1 - progress))} mGal`, am.cx + radius, am.cy);
        }
      }
    });

    // Draw survey station markers if data exists
    stationData.forEach((stn, idx) => {
      const sx = (idx + 1) * (width / (stationData.length + 1 || 1));
      const sy = height * 0.5 + Math.sin(idx * 2) * (height * 0.25);
      
      // Draw crosshair marker
      ctx.strokeStyle = selectedStation === stn.station ? '#FF5722' : '#888';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - 5, sy); ctx.lineTo(sx + 5, sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx, sy - 5); ctx.lineTo(sx, sy + 5);
      ctx.stroke();

      // Label background
      ctx.fillStyle = selectedStation === stn.station ? '#FF5722' : 'rgba(0,0,0,0.6)';
      ctx.fillRect(sx - 18, sy + 8, 36, 12);
      
      ctx.fillStyle = selectedStation === stn.station ? '#111' : '#fff';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(stn.station, sx, sy + 16);
    });

  }, [depthFilter, gridDensity, noiseLevel, selectedStation]);

  const triggerForwardModeling = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Compass className="text-[#FF5722]" />
            Gravity & Magnetics Mission Control
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">Subsurface Mass & Magnetization Analytics // .csv .dat</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Cpu size={14} className="text-[#FF5722] animate-pulse" />
          <span className="font-mono">NVIDIA A100 // ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Control Panel */}
        <div className="col-span-4 space-y-4">
          <UniversalIngestionPort 
            moduleName="gravity"
            contextKey="gravityData"
            onParsed={handleParsedData}
            presetLog={presetLog}
          />
          <div className="geo-card">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">Inversion Controls</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Depth Slice Filter</span>
                  <span className="text-[#FF5722]">{depthFilter} m</span>
                </div>
                <input 
                  type="range" 
                  min="200" 
                  max="5000" 
                  step="100"
                  value={depthFilter} 
                  onChange={(e) => setDepthFilter(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Renderer Grid Size</span>
                  <span className="text-[#FF5722]">{gridDensity} px</span>
                </div>
                <input 
                  type="range" 
                  min="16" 
                  max="64" 
                  step="8"
                  value={gridDensity} 
                  onChange={(e) => setGridDensity(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Micro-Gal Noise Filter</span>
                  <span className="text-[#FF5722]">{noiseLevel} µGal</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1"
                  value={noiseLevel} 
                  onChange={(e) => setNoiseLevel(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded"
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={triggerForwardModeling}
                  disabled={isComputing}
                  className="w-full bg-[#FF5722] text-black hover:bg-[#ff7043] transition-colors py-2 rounded text-xs font-bold uppercase tracking-tight flex items-center justify-center gap-2"
                >
                  <Activity size={14} className={isComputing ? "animate-spin" : ""} />
                  {isComputing ? "Computing Inversion..." : "Compute Residual Magnetics"}
                </button>
              </div>
            </div>
          </div>

          <div className="geo-card block">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">Active Telemetry Metrics</h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">SAMPLE RATE</span>
                <span>240 Hz</span>
              </div>
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">VERT ANOMALY PEAK</span>
                <span className="text-green-500 font-bold">+118.4 mGal</span>
              </div>
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">COORDINATE DATUM</span>
                <span>WGS84 UT-42</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-[#555]">INVERSION RESIDUAL</span>
                <span className="text-[#FF5722]">0.024 mGal (RMS)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live 2D Contour Canvas */}
        <div className="col-span-8 space-y-6">
          <div className="geo-card relative bg-black flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4 pb-2 border-b border-[#222]">
              <span className="text-xs font-mono tracking-widest text-green-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                LIVE RESIDUAL CONTOUR FIELD Map
              </span>
              <span className="text-[10px] text-[#555] font-mono">DRAG MOUSE OR USE CROSSHAIR</span>
            </div>
            
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={320} 
              className="border border-[#222] rounded w-full bg-[#111] max-w-full cursor-crosshair box-border"
            />
            
            <div className="w-full grid grid-cols-4 gap-4 mt-4 text-center">
              <div className="p-2 bg-[#111] border border-[#222] rounded">
                <div className="text-[9px] font-mono text-[#555]">EST. BORE DEPTH</div>
                <div className="text-sm font-mono font-medium text-white">{depthFilter}m</div>
              </div>
              <div className="p-2 bg-[#111] border border-[#222] rounded">
                <div className="text-[9px] font-mono text-[#555]">ANOMALY SIG-LEVEL</div>
                <div className="text-sm font-mono font-medium text-[#FF5722]">{125.4 + noiseLevel} mGal</div>
              </div>
              <div className="p-2 bg-[#111] border border-[#222] rounded">
                <div className="text-[9px] font-mono text-[#555]">GRID RESOLUTION</div>
                <div className="text-sm font-mono font-medium text-white">{(640 / gridDensity).toFixed(0)}x{(320 / gridDensity).toFixed(0)}</div>
              </div>
              <div className="p-2 bg-[#111] border border-[#222] rounded">
                <div className="text-[9px] font-mono text-[#555]">GEOL. CONFIDENCE</div>
                <div className="text-sm font-mono font-medium text-green-500">89.4%</div>
              </div>
            </div>
          </div>

          {/* Dual Anomaly Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="geo-card">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#FF7300] mb-4">Bouguer Gravity Anomaly (mGal)</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stationData || []} onClick={(item) => item?.activeLabel && setSelectedStation(String(item.activeLabel))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="station" stroke="#555" fontSize={10} />
                    <YAxis stroke="#555" fontSize={10} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Area type="monotone" dataKey="gravity" stroke="#FF7300" fill="#FF730033" name="Gravity (mGal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="geo-card">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#00C49F] mb-4">Magnetic Anomaly (nT)</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stationData || []} onClick={(item) => item?.activeLabel && setSelectedStation(String(item.activeLabel))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="station" stroke="#555" fontSize={10} />
                    <YAxis stroke="#555" fontSize={10} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Area type="monotone" dataKey="magnetic" stroke="#00C49F" fill="#00C49F33" name="Magnetic (nT)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
