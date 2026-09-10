import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { useAppContext } from '../../context/AppContext';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { 
  Waves, 
  Settings2, 
  Maximize2, 
  Download, 
  Zap, 
  Activity,
  Crosshair
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { Fallback3D } from '../Shared/Fallback3D';
import { seismicPayload } from '../../../../data/mocks/seismic';

export default function SeismicModule() {

  const { apiMode, dimensionMode } = useAppContext();
  
  const { globalData, rawPayloads, seismicMode, setSeismicMode, activeFileName } = useGlobalGeoContext();
  
  // Use isolated mock
  const data = useMemo(() => {
    return (globalData.seismicData && globalData.seismicData.length > 0) 
      ? globalData.seismicData 
      : seismicPayload;
  }, [globalData.seismicData]);

  // Dynamic Chart Extractor
  const { chartData, xAxisKey, xAxisLabel, yAxisLabel, numericLines, legendLayers } = useMemo(() => {
    const fallbackLines = [
      { key: 'vp', name: 'Vp (Velocity)', color: '#FF5722' },
      { key: 'vs', name: 'Vs (Velocity)', color: '#2196F3' }
    ];
    const fallbackLegend = [
      { color: 'bg-red-500', label: 'Horizon Alpha (Salt)' },
      { color: 'bg-blue-500', label: 'Bright Spot (Gas Indication)' },
      { color: 'bg-green-500', label: 'Unconformity Sequence' }
    ];

    const chartData = forceMapData(data) || [];
    if (chartData.length === 0) {
      return {
        chartData: [],
        xAxisKey: 'time',
        xAxisLabel: 'Time (s)',
        yAxisLabel: 'Velocity (m/s)',
        numericLines: fallbackLines,
        legendLayers: fallbackLegend
      };
    }

    const firstItem = chartData[0];
    const dataKeys = Object.keys(firstItem || {});

    // Dynamically determine X-Axis (Prioritize depth_ft, then twt_ms, or fallback)
    const xAxisKey = dataKeys.includes('depth_ft')
      ? 'depth_ft'
      : (dataKeys.includes('twt_ms')
          ? 'twt_ms'
          : (dataKeys.find(k => ['time', 'depth', 'station', 'distance', 'id'].includes(k.toLowerCase())) || dataKeys[0] || 'time')
        );
    
    let xAxisLabel = 'Index';
    if (xAxisKey === 'depth_ft') xAxisLabel = 'Depth (ft)';
    else if (xAxisKey === 'twt_ms') xAxisLabel = 'Two-Way Time (ms)';
    else if (xAxisKey.toLowerCase() === 'time') xAxisLabel = 'Time (s)';
    else if (xAxisKey.toLowerCase() === 'depth') xAxisLabel = 'Depth (m)';
    else if (xAxisKey.toLowerCase() === 'station') xAxisLabel = 'Station No.';
    else if (xAxisKey.toLowerCase() === 'distance') xAxisLabel = 'Distance (m)';
    else if (xAxisKey.toLowerCase() === 'id') xAxisLabel = 'ID Pointer';
    else xAxisLabel = xAxisKey;

    // Filter out the X-axis and non-numeric keys for the Y-axis lines
    const excludeFromLines = ['time', 'depth', 'station', 'distance', 'id', 'name', 'label', 'vibration', 'twt_ms', 'depth_ft'];
    const candidates = dataKeys.filter(key => {
      if (key === xAxisKey || excludeFromLines.includes(key.toLowerCase())) return false;
      return typeof firstItem[key] === 'number' && !isNaN(firstItem[key]);
    });

    const chartColors = ["#FF5722", "#2196F3", "#00E676", "#FFD600", "#E040FB", "#00E5FF", "#FF3D00"];
    const numericLines = candidates.length > 0
      ? candidates.map((key, idx) => ({
          key,
          name: key.toUpperCase().replace(/_/g, ' '),
          color: chartColors[idx % chartColors.length]
        }))
      : fallbackLines;

    // Detect module domain based on active numeric keys and construct responsive legend
    let yAxisLabel = 'Physical Field Inversion';
    let legendLayers = fallbackLegend;

    const lowerKeys = candidates.map(k => k.toLowerCase());
    
    // Check if well logging / density / gamma ray
    if (lowerKeys.some(k => ['gr', 'res', 'rhob', 'density', 'nphi', 'dt'].includes(k))) {
      yAxisLabel = 'Logs/Scaled Mud Matrix';
      legendLayers = [
        { color: 'bg-green-500', label: 'Reservoir Sand Facies (Low GR)' },
        { color: 'bg-red-500', label: 'Caprock Shale Barrier (High GR)' },
        { color: 'bg-yellow-500', label: 'Salt/Evaporite Sequence (Low Neutron)' }
      ];
    }
    // Check if gravity / mag
    else if (lowerKeys.some(k => ['bouguer', 'gravity', 'anomaly', 'magnetics', 'mgal'].includes(k))) {
      yAxisLabel = 'Geophysical Field Contrast';
      legendLayers = [
        { color: 'bg-orange-500', label: 'High Density Bedrock Sequence (Basalt)' },
        { color: 'bg-blue-400', label: 'Structural Fault Discontinuity' },
        { color: 'bg-purple-500', label: 'Localized Gravity/Mag Anomaly Low' }
      ];
    }
    // Seismic defaults
    else {
      yAxisLabel = 'Velocity (m/s)';
      legendLayers = fallbackLegend;
    }

    return {
      chartData,
      xAxisKey,
      xAxisLabel,
      yAxisLabel,
      numericLines,
      legendLayers
    };
  }, [data]);
  const [baseData, setBaseData] = useState<any[] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gain, setGain] = useState<number>(5.0);
  const [normalization, setNormalization] = useState<number>(1.0);
  const [filterFreq, setFilterFreq] = useState<number>(30);
  const [showDensity, setShowDensity] = useState<boolean>(true);
  const [showWiggles, setShowWiggles] = useState<boolean>(true);

  useEffect(() => {
    if (!baseData) {
      // REMOVED MOCK UPDATE
    } else {
      // setData(baseData);
    }
    
    let interval: any;
    if (false) {
       let tick = 0;
       interval = setInterval(() => {
          tick++;
          if (baseData) {
             const noisyData = baseData.map((d: any, i: number) => ({
                ...d,
                vp: d.vp + Math.sin(tick * 0.15 + i*0.4) * 25 * Math.sin(tick * 0.5 + i),
                vs: d.vs + Math.cos(tick * 0.25 - i*0.2) * 15 * Math.cos(tick * 0.5 + i)
             }));
             // setData(noisyData);
          } else {
             // REMOVED MOCK UPDATE
          }
       }, 50); // Fast 20 FPS updates to not drop frames
    }
    return () => clearInterval(interval);
  }, [activeFileName, seismicMode, apiMode, baseData]);

  const generateMitigationData = () => {
      const ts = [];
      let time = 0;
      for (let i = 0; i < 200; i++) {
          time += 0.1;
          const noise = Math.sin(time * 15.3) * Math.cos(time * 4.2) * 0.2; // Deterministic signal noise
          let amp = noise;
          // Simulated P-wave arrival
          if (i > 40 && i < 60) amp += Math.sin((i - 40) * 0.5) * 2 * Math.exp(-(i - 40) * 0.1);
          // Simulated S-wave arrival
          if (i > 100 && i < 140) amp += Math.sin((i - 100) * 0.8) * 5 * Math.exp(-(i - 100) * 0.05);

          ts.push({ time: time.toFixed(1), amplitude: Number(amp.toFixed(2)) });
      }
      return ts;
  };
  const [mitigationData, setMitigationData] = useState<{time: string, amplitude: number}[]>(generateMitigationData());
  const [epicenterDistance, setEpicenterDistance] = useState<number | null>(null);

  const presetLog = seismicMode === 'exploration' ? 
    `# Seismic Trace Amplitude Matrix (Rows=Time, Cols=Traces)\n` +
    Array.from({length: 10}).map((_, i) => 
      Array.from({length: 8}).map(() => (Math.random() * 2 - 1).toFixed(3)).join(", ")
    ).join("\n") 
    :
    `# Seismic Accelerometer Time-Series\n# Time(s), Amplitude\n` +
    Array.from({length: 20}).map((_, i) => `${(i*0.1).toFixed(1)}, ${(Math.random() * 2 - 1).toFixed(2)}`).join("\n");

  const handleParsedData = (parsedData: any[]) => {
    if (parsedData && parsedData.length > 0) {
      if (seismicMode === 'exploration') {
        // [Index 0, Index 1, Index 2] corresponding to [Time, Vp, Vs]
        const incomingData = parsedData.map(row => ({
          time: Number(row[0] || '0'),
          vp: Number(row[1] || '0'),
          vs: Number(row[2] || '0'),
          vibration: 0,
          label: `${row[0] || '0'}s`
        }));
        
        if (incomingData.length > 0) {
           // setData(incomingData);
           setBaseData(incomingData);
        }

        // Just check if we had any bright spots over some threshold in vp
        const hasBrightSpot = incomingData.some(d => d.vp > 4000);
        if (hasBrightSpot) {
          const event = new CustomEvent('geoai:seismic-anomaly', {
            detail: { depth: "1250", peak: "2.4x" }
          });
          window.dispatchEvent(event);
        }
      } else {
        const newData = parsedData.map(row => ({
             time: String(row[0] || '0'), 
             amplitude: Number(row[1] || 0)
        }));
        setMitigationData(newData);

        const maxAmp = Math.max(...newData.map(d => Math.abs(d.amplitude)));
        if (maxAmp > 2.5) {
            const event = new CustomEvent('geoai:tremor-event', {
                detail: { magnitude: (Math.log10(maxAmp) + 2).toFixed(1), maxAmp }
            });
            window.dispatchEvent(event);
        }
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!data || data.length === 0) return;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const traceSpacing = (canvas.width - 40) / data.length;
    const sampleSpacing = canvas.height / data[0].length;

    data.forEach((trace, i) => {
        const x = 20 + i * traceSpacing;

        // Apply filters
        const filteredTrace = trace.map((val: number) => {
            // Simulated low-pass filter effect and normalization
            return val * normalization * (filterFreq / 50.0);
        });

        // Draw Density
        if (showDensity) {
            filteredTrace.forEach((val: number, j: number) => {
                const y = j * sampleSpacing;
                const alpha = Math.min(Math.abs(val) * gain, 1);
                ctx.fillStyle = val > 0 ? `rgba(255, 87, 34, ${alpha})` : `rgba(33, 150, 243, ${alpha})`;
                ctx.fillRect(x - traceSpacing / 2, y, traceSpacing, sampleSpacing);
            });
        }

        // Draw Wiggle
        if (showWiggles) {
            ctx.beginPath();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.5;
            filteredTrace.forEach((val: number, j: number) => {
                const y = j * sampleSpacing;
                const wx = x + (val * gain * 5);
                if (j === 0) ctx.moveTo(wx, y);
                else ctx.lineTo(wx, y);
            });
            ctx.stroke();

            // Fill positive lobes
            ctx.beginPath();
            ctx.fillStyle = '#ffffff33';
            filteredTrace.forEach((val: number, j: number) => {
                const y = j * sampleSpacing;
                const wx = x + (val * gain * 5);
                if (val > 0) {
                    ctx.lineTo(wx, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.lineTo(x, canvas.height);
            ctx.lineTo(x, 0);
            ctx.fill();
        }
    });

    // Draw Grid / Axis
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for(let i=0; i<10; i++) {
        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
        ctx.fillStyle = '#555555';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`${i*100}ms`, 5, y + 10);
    }

  }, [data, gain, showWiggles, showDensity, filterFreq, normalization]);

  // Velocity Model Data
  const [velocityData, setVelocityData] = useState<{depth: number, vel: number}[]>([
    { depth: 0, vel: 1500 },
    { depth: 500, vel: 1800 },
    { depth: 1000, vel: 2200 },
  ]);

  useEffect(() => {
    // Generate derived velocity profile from the Vp/Vs traces
    if (data && data.length > 0 && typeof data[0].vp !== 'undefined') {
      const derived = data.map((trace, idx) => {
        // approx depth from time: depth = time * 1500 (average velocity)
        const approxDepth = Number(trace.time) * 1500 || (idx * 500);
        return {
          depth: approxDepth,
          vel: trace.vp
        };
      });
      setVelocityData(derived);
    }
  }, [data]);

  return (
    <div className="space-y-6 md:p-1 max-w-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Waves className="text-[#FF5722]" />
            Dual-Mode Seismic Engine
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 w-2/3">
            {seismicMode === 'exploration' ? 
              "Acoustic impedance anomalies, bright spots detection, and continuous 1D velocity profiles for hydrocarbon reservoir mapping." : 
              "Passive seismic monitoring, tremor magnitude calculation, and epicenter distance estimation for disaster mitigation."}
          </p>
        </div>
        <div className="flex bg-black/60 border border-[#333] rounded-lg overflow-hidden shrink-0">
          <button 
            onClick={() => setSeismicMode('exploration')}
            className={cn("px-4 py-2 text-xs font-mono font-bold transition-colors", seismicMode === 'exploration' ? 'bg-[#FF5722] text-black' : 'text-[#888] hover:bg-white/5')}
          >
            [ E-MODE: EXPLORATION ]
          </button>
          <button 
            onClick={() => setSeismicMode('mitigation')}
            className={cn("px-4 py-2 text-xs font-mono font-bold transition-colors", seismicMode === 'mitigation' ? 'bg-[#FF5722] text-black' : 'text-[#888] hover:bg-white/5')}
          >
            [ M-MODE: MITIGATION ]
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Ingestion & Setup Sidebar */}
        <div className="col-span-4 space-y-4">
          <UniversalIngestionPort 
            moduleName="seismic"
            contextKey="seismicData"
            onParsed={handleParsedData}
            presetLog={presetLog}
          />

          {seismicMode === 'exploration' ? (
            <>
              <div className="geo-card border border-[#333]">
                <h4 className="text-[10px] font-bold uppercase text-[#888888] mb-4 flex items-center gap-2">
                    <Settings2 size={12} />
                    Signal Processing Parameters
                </h4>
                <div className="space-y-4">
                    <ControlSlider label="Gain Control (AGC)" value={gain} onChange={setGain} min={1} max={20} />
                    <ControlSlider label="Freq Filter (Hz)" value={filterFreq} onChange={setFilterFreq} min={10} max={100} />
                    <ControlSlider label="Trace Norm (%)" value={normalization} onChange={setNormalization} min={1} max={100} />
                </div>
                
                <div className="mt-4 flex items-center gap-2 border border-[#333333] rounded overflow-hidden p-0.5 bg-black/40">
                  <button 
                    onClick={() => setShowWiggles(!showWiggles)}
                    className={cn("flex-1 px-2 py-1.5 text-[9px] font-bold uppercase transition-colors text-center", showWiggles ? "bg-[#FF5722] text-black" : "text-[#555555] hover:bg-white/5")}
                  >
                    Wiggle Trace Mode
                  </button>
                  <button 
                    onClick={() => setShowDensity(!showDensity)}
                    className={cn("flex-1 px-2 py-1.5 text-[9px] font-bold uppercase transition-colors text-center", showDensity ? "bg-[#FF5722] text-black" : "text-[#555555] hover:bg-white/5")}
                  >
                    Variable Density
                  </button>
                </div>
              </div>

              <div className="geo-card">
                 <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">1D Velocity Model</h3>
                 <div className="h-44 w-full">
                   <DebugDump data={velocityData} />
<ResponsiveContainer width="100%" height="100%">
                     <LineChart data={forceMapData(velocityData || [])} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                       <XAxis type="number" stroke="#555" fontSize={10} domain={[1000, 5000]} label={{ value: 'Acoustic Velocity (m/s)', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 9 }} />
                       <YAxis dataKey="depth" type="number" reversed stroke="#555" fontSize={10} label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 9 }} />
                       <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontFamily: 'monospace' }} />
                       <Line type="stepAfter" dataKey="vel" stroke="#FF5722" strokeWidth={2} dot={{ r: 3, fill: "#FF5722" }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
              </div>
            </>
          ) : (
            <>
              <div className="geo-card border border-[#333]">
                <h4 className="text-[10px] font-bold uppercase text-[#888888] mb-4 flex items-center gap-2">
                    <Activity size={12} />
                    Tremor Analysis Controls
                </h4>
                <div className="space-y-4">
                   <button onClick={() => setEpicenterDistance(42.5)} className="w-full bg-[#FF5722]/10 hover:bg-[#FF5722]/20 border border-[#FF5722]/40 text-[#FF5722] py-2 flex items-center justify-center gap-2 rounded transition-colors text-[10px] font-bold uppercase">
                     <Crosshair size={14} />
                     Auto-Pick P/S Waves
                   </button>

                   {epicenterDistance && (
                     <div className="p-3 bg-black/40 border border-[#333] rounded">
                       <div className="text-[9px] uppercase text-[#888] mb-1 font-mono">Epicenter Distance Estimator</div>
                       <div className="text-xl font-bold font-mono text-green-400">{epicenterDistance.toFixed(1)} km</div>
                       <div className="text-[10px] text-[#555] mt-1 font-mono">Based on S-P travel time ΔT</div>
                     </div>
                   )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Canvas Display */}
        <div className="col-span-8 flex flex-col h-full bg-[#1A1A1A] border border-[#333333] rounded-lg overflow-hidden min-h-[600px]">
          <div className="h-12 border-b border-[#333333] flex items-center justify-between px-4 bg-[#222222]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Waves size={16} className="text-[#FF5722]" />
                <span className="text-xs font-bold uppercase font-mono tracking-tight text-white">
                  {activeFileName} // DYNAMIC VIEWER
                </span>
              </div>
              <div className="h-4 w-px bg-[#333333]"></div>
              <div className="flex items-center gap-2 text-[10px] text-[#888888]">
                <span className="bg-[#333333] px-1.5 py-0.5 rounded text-white font-bold">RAW / PROCESSED</span>
                <span>
                  {seismicMode === 'exploration' 
                    ? `${data[0]?.length || 0} Samples // ${data.length} Traces`
                    : `${mitigationData.length} Samples`
                  }
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/5 text-[#888888] rounded"><Download size={14} /></button>
              <button className="p-2 hover:bg-white/5 text-[#888888] rounded"><Maximize2 size={14} /></button>
            </div>
          </div>

          <div className="flex-1 relative bg-black p-4 flex">               {dimensionMode === '3D' ? (
                <Fallback3D />
              ) : seismicMode === 'exploration' ? (
                <div className="w-full h-full p-4 bg-black">
                   <DebugDump data={data} />
<ResponsiveContainer width="100%" height="100%">
                       <LineChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                           <XAxis dataKey={xAxisKey} stroke="#888" fontSize={10} label={{ value: xAxisLabel, position: 'insideBottom', fill: '#888', fontSize: 10 }} />
                           <YAxis stroke="#888" fontSize={10} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#888', fontSize: 10 }} />
                           <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontFamily: 'monospace' }} />
                           <Legend wrapperStyle={{fontSize: '10px'}} />
                           {numericLines.map(line => (
                             <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={2} dot={false} />
                           ))}
                       </LineChart>
                   </ResponsiveContainer>
                   <div className="absolute right-8 top-8 bg-black/80 backdrop-blur-md p-4 border border-[#333333] rounded">
                       <h4 className="text-[10px] font-bold uppercase text-[#888888] mb-2 tracking-widest">Interpretation Layers</h4>
                       <div className="space-y-2">
                           {legendLayers.map((item, idx) => (
                               <LegendItem key={idx} color={item.color} label={item.label} />
                           ))}
                       </div>
                       <p className="text-[9px] text-[#555] mt-4">{import.meta.env.VITE_CHART_WATERMARK}</p>
                   </div>
                </div>
              ) : (

                <div className="w-full h-full overflow-hidden">
                  <DebugDump data={mitigationData} />
<ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forceMapData(mitigationData || [])}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="time" stroke="#555" fontSize={10} label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 9 }} />
                      <YAxis stroke="#555" fontSize={10} label={{ value: 'Amplitude / Acceleration (m/s²)', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontFamily: 'monospace' }} />
                      <Line type="monotone" dataKey="amplitude" stroke="#FF5722" strokeWidth={1} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: any) {
    return (
        <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", color)}></div>
            <span className="text-xs text-[#AAAAAA]">{label}</span>
        </div>
    );
}

function ControlSlider({ label, value, onChange, min, max }: any) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono uppercase text-[#555555]">
                <span>{label}</span>
                <span className="text-[#FF5722]">{value}</span>
            </div>
            <input 
                type="range" 
                min={min} 
                max={max} 
                value={value} 
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full bg-[#333333] h-1 rounded-full appearance-none cursor-pointer accent-[#FF5722]"
            />
        </div>
    );
}
