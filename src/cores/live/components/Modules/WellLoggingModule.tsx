import { processIncomingData } from '../Shared/SwarmRoom';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { normalizeRawData } from '../../../../lib/dynamicParser';
import { 
  Activity, 
  Settings2, 
  Download, 
  BarChart, 
  Ruler, 
  Database,
  Search,
  Filter,
  Maximize2,
  Trash2,
  Volume2,
  Radio
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { wellLoggingPayload } from '../../../../data/mocks/wellLogging';

const CURVE_COLORS = ['#f97316', '#22c55e', '#0ea5e9', '#eab308', '#a855f7', '#9ca3af'];

export default function WellLoggingModule() {

  const { apiMode, dimensionMode } = useAppContext();
  
  const { globalData, rawPayloads, activeFileName } = useGlobalGeoContext();
  const [visibleCurves, setVisibleCurves] = useState({ gr: true, res: true, rhob: true, nphi: true, dt: true, cal: true });
  
  const [grCutoff, setGrCutoff] = useState<number>(65);
  const [resCutoff, setResCutoff] = useState<number>(15);

  // --- Acoustic Sonification System States & Refs ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [oscType, setOscType] = useState<'sine' | 'sawtooth' | 'triangle' | 'square'>('sine');
  const [volume, setVolume] = useState(0.12);
  const [scanSpeed, setScanSpeed] = useState(150); // Speed in ms
  const [selectedAudioCurve, setSelectedAudioCurve] = useState('');
  
  // Use isolated mock
  const chartData = useMemo(() => {
    if (rawPayloads && rawPayloads.wellLoggingData) {
      const result = processIncomingData(rawPayloads.wellLoggingData);
      if (result && result.data && result.data.length > 0) {
        return result.data;
      }
    }
    return (globalData.wellLoggingData && globalData.wellLoggingData.length > 0) 
      ? globalData.wellLoggingData 
      : wellLoggingPayload;
  }, [globalData.wellLoggingData, rawPayloads?.wellLoggingData]);
  
  const depthKeyObj = useMemo(() => normalizeRawData(chartData, 'well_logging'), [chartData]);
  const depthKey = depthKeyObj.xAxisKey;
  
  const firstRow = chartData && chartData.length > 0 ? chartData[0] : {};
  const availableKeys = Object.keys(firstRow).filter(key => key !== depthKey); 
  const activeCurves = availableKeys.slice(0, 6);

  let minDepth = 0;
  let maxDepth = 0;
  if (chartData && chartData.length > 0 && depthKey) {
    const depths = chartData.map((d: any) => Number(d[depthKey])).filter((n: number) => !isNaN(n));
    if (depths.length > 0) {
      minDepth = Math.min(...depths);
      maxDepth = Math.max(...depths);
    }
  }

  useEffect(() => {
    // REMOVED MOCK UPDATE
  }, [activeFileName]);

  // Dynamic calculations
  const { sandstonePct, carbonatePct, shalePct, crossoverDetected } = useMemo(() => {
    let litho = { sandstone: 0, shale: 0, carbonate: 0 };
    let crossover = false;

    if (chartData && chartData.length > 0) {
      const grKey = availableKeys.find(k => k.toLowerCase().includes('gamma') || k.toLowerCase() === 'gr');
      if (grKey) {
        let sand = 0, shale = 0, carb = 0;
        chartData.forEach(row => {
          const val = Number(row[grKey]);
          if (!isNaN(val)) {
            if (val > 75) shale++;
            else if (val > 40) sand++;
            else carb++;
          }
        });
        const total = sand + shale + carb;
        if (total > 0) {
          litho.sandstone = Math.round((sand / total) * 100);
          litho.shale = Math.round((shale / total) * 100);
          litho.carbonate = Math.round((carb / total) * 100);
        }
      }

      chartData.forEach(row => {
        if (row.res !== undefined && row.rhob !== undefined) {
          if (row.res > 100 && row.rhob < 2.2) {
            crossover = true;
          }
        }
      });
    }

    return {
      sandstonePct: litho.sandstone,
      carbonatePct: litho.carbonate,
      shalePct: litho.shale,
      crossoverDetected: crossover
    };
  }, [chartData, availableKeys]);

  const petroMetrics = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { netSand: 0, netPay: 0, ntg: 0, avgPorosity: 0, avgSw: 0 };
    }
    const grKey = availableKeys.find(k => k.toLowerCase().includes('gamma') || k.toLowerCase() === 'gr' || k.toLowerCase().includes('gr_api') || k.toLowerCase().includes('gamma_ray_api'));
    const resKey = availableKeys.find(k => k.toLowerCase().includes('resistivity') || k.toLowerCase() === 'res' || k.toLowerCase().includes('res_ohmm') || k.toLowerCase().includes('resistivity_ohm_m'));
    const rhobKey = availableKeys.find(k => k.toLowerCase().includes('density') || k.toLowerCase() === 'rhob' || k.toLowerCase().includes('density_g_cc') || k.toLowerCase().includes('rhob_gcm3'));
    
    let netSandCount = 0;
    let netPayCount = 0;
    let sumPorosity = 0;
    let porosityCount = 0;
    let sumResistivityForSw = 0;
    let payResistivityCount = 0;

    chartData.forEach(row => {
      const grVal = grKey ? Number(row[grKey]) : NaN;
      const resVal = resKey ? Number(row[resKey]) : NaN;
      const rhobVal = rhobKey ? Number(row[rhobKey]) : NaN;

      if (!isNaN(grVal)) {
        const isSand = grVal < grCutoff;
        if (isSand) {
          netSandCount++;
          
          let phi = 0.15;
          if (!isNaN(rhobVal)) {
            const calcPhi = (2.65 - rhobVal) / 1.65;
            phi = Math.max(0.05, Math.min(0.40, calcPhi));
          }
          sumPorosity += phi;
          porosityCount++;

          const isPay = !isNaN(resVal) && resVal > resCutoff;
          if (isPay) {
            netPayCount++;
            sumResistivityForSw += resVal;
            payResistivityCount++;
          }
        }
      }
    });

    const totalIntervals = chartData.length;
    const ntg = totalIntervals > 0 ? (netSandCount / totalIntervals) : 0;
    const avgPorosity = porosityCount > 0 ? (sumPorosity / porosityCount) : 0.18;
    
    const rw = 0.05;
    let avgSw = 1.0;
    if (payResistivityCount > 0 && avgPorosity > 0) {
      const avgRt = sumResistivityForSw / payResistivityCount;
      const swSq = rw / (Math.pow(avgPorosity, 2) * avgRt);
      avgSw = Math.max(0.12, Math.min(1.0, Math.sqrt(swSq)));
    }

    return {
      netSand: netSandCount * 10,
      netPay: netPayCount * 10,
      ntg: Math.round(ntg * 100),
      avgPorosity: Math.round(avgPorosity * 100),
      avgSw: Math.round(avgSw * 100)
    };
  }, [chartData, grCutoff, resCutoff, availableKeys]);

  // --- Acoustic Sonification Handlers & Effects ---
  useEffect(() => {
    if (activeCurves.length > 0 && !selectedAudioCurve) {
      setSelectedAudioCurve(activeCurves[0]);
    }
  }, [activeCurves, selectedAudioCurve]);

  useEffect(() => {
    return () => {
      // Complete cleanup on unmount
      stopSonification();
    };
  }, []);

  const startSonification = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const analyser = audioCtx.createAnalyser();

      osc.type = oscType;
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      analyser.fftSize = 256;

      osc.connect(gain);
      gain.connect(analyser);
      analyser.connect(audioCtx.destination);

      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      analyserRef.current = analyser;
      setIsScanning(true);
    } catch (e) {
      console.error("Failed to start sonification:", e);
    }
  };

  const stopSonification = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (err) {}
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  const handleToggleScan = () => {
    if (isScanning) {
      stopSonification();
    } else {
      startSonification();
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.type = oscType;
    }
  }, [oscType]);

  useEffect(() => {
    if (isScanning && chartData.length > 0) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      
      scanIntervalRef.current = setInterval(() => {
        setScanIndex(prev => {
          const nextIndex = (prev + 1) % chartData.length;
          
          if (oscillatorRef.current && audioContextRef.current) {
            const curveKey = selectedAudioCurve || activeCurves[0];
            if (curveKey) {
              const activeRow = chartData[nextIndex];
              const val = activeRow ? Number(activeRow[curveKey]) : NaN;
              if (!isNaN(val)) {
                const vals = chartData.map((r: any) => Number(r[curveKey])).filter((n: number) => !isNaN(n));
                const minVal = vals.length > 0 ? Math.min(...vals) : 0;
                const maxVal = vals.length > 0 ? Math.max(...vals) : 100;
                const range = maxVal - minVal || 1;
                
                const normalized = (val - minVal) / range;
                const freq = 150 + normalized * 700;
                
                oscillatorRef.current.frequency.setTargetAtTime(freq, audioContextRef.current.currentTime, 0.05);
              }
            }
          }
          
          return nextIndex;
        });
      }, scanSpeed);
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    }
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isScanning, scanSpeed, selectedAudioCurve, chartData, activeCurves]);

  useEffect(() => {
    if (isScanning) {
      const t = setTimeout(() => {
        if (!analyserRef.current || !canvasRef.current) return;
        const analyser = analyserRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          analyser.getByteTimeDomainData(dataArray);

          ctx.fillStyle = '#0f0f0f';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = '#1a2e1a';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();

          ctx.lineWidth = 2;
          ctx.strokeStyle = '#39FF14'; 
          ctx.beginPath();

          const sliceWidth = canvas.width * 1.0 / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();

          ctx.fillStyle = '#39FF14';
          ctx.globalAlpha = 0.2;
          for (let gx = 30; gx < canvas.width; gx += 30) {
            for (let gy = 15; gy < canvas.height; gy += 15) {
              ctx.fillRect(gx, gy, 1, 1);
            }
          }
          ctx.globalAlpha = 1.0;

          ctx.font = '9px monospace';
          ctx.fillStyle = '#39FF14';
          const curveKey = selectedAudioCurve || activeCurves[0] || 'GR';
          const activeVal = chartData[scanIndex]?.[curveKey];
          ctx.fillText(`SWEEP: ${curveKey} = ${activeVal ? Number(activeVal).toFixed(1) : 'N/A'}`, 6, 12);
          ctx.fillText(`DEPTH: ${chartData[scanIndex]?.[depthKey] || 'N/A'} m`, 6, 22);

          animationFrameId.current = requestAnimationFrame(draw);
        };

        draw();
      }, 50);

      return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }
  }, [isScanning, scanIndex, selectedAudioCurve, chartData, activeCurves]);

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] border border-[#333333] rounded-lg overflow-hidden">
        {/* Module Toolbar */}
        <div className="h-12 border-b border-[#333333] flex items-center justify-between px-4 bg-[#222222]">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#03A9F4]" />
                    <span className="text-xs font-bold uppercase font-mono tracking-tight text-white">{activeFileName} // DYNAMIC VIEWER</span>
                </div>
                <div className="h-4 w-px bg-[#333333]"></div>
                <div className="flex items-center gap-2 text-[10px] text-[#888888]">
                    <span className="bg-[#03A9F4] px-1.5 py-0.5 rounded text-white font-bold">NORMALIZED</span>
                    <span>MD: AUTO // STEP: AUTO</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#888888] hover:text-white">
                    <Filter size={12} />
                    Auto-Alias
                </button>
                <div className="h-4 w-px bg-[#333333]"></div>
                <button className="p-2 hover:bg-white/5 text-[#888888] rounded"><Download size={14} /></button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Log Track Selector */}
            <div className="w-48 border-r border-[#333333] p-4 bg-[#111111]/50 space-y-4">
                <UniversalIngestionPort 
                  moduleName="wellLoggingData" 
                  contextKey="wellLoggingData" 
                  onParsed={(p) => {}} 
                  parserType="matrix"
                  presetLog={`Depth_m,GR_API,RES_Ohmm,RHOB_gcm3,NPHI_v_v,DT_us_ft,CAL_in\n1000,85,2.1,2.65,0.15,65,8.5\n1001,84,2.2,2.64,0.14,64,8.5\n1002,38,105,2.15,0.05,55,8.5\n1003,35,110,2.1,0.06,54,8.5\n1004,36,90,2.2,0.05,55,8.5\n1005,90,1.8,2.7,0.18,70,8.5`}
                />
                
                <h4 className="text-[10px] font-bold uppercase text-[#555555] tracking-widest mb-4 mt-6">Available Curves</h4>
                <div className="space-y-1">
                    <CurveToggle label="Gamma Ray (GR)" color="#FF5722" active={visibleCurves.gr} onClick={() => setVisibleCurves(v => ({ ...v, gr: !v.gr }))} />
                    <CurveToggle label="Resistivity (RES)" color="#4CAF50" active={visibleCurves.res} onClick={() => setVisibleCurves(v => ({ ...v, res: !v.res }))} />
                    <CurveToggle label="Density (RHOB)" color="#03A9F4" active={visibleCurves.rhob} onClick={() => setVisibleCurves(v => ({ ...v, rhob: !v.rhob }))} />
                    <CurveToggle label="Neutron (NPHI)" color="#FFD700" active={visibleCurves.nphi} onClick={() => setVisibleCurves(v => ({ ...v, nphi: !v.nphi }))} />
                    <CurveToggle label="Sonic (DT)" color="#9C27B0" active={visibleCurves.dt} onClick={() => setVisibleCurves(v => ({ ...v, dt: !v.dt }))} />
                    <CurveToggle label="Caliper (CAL)" color="#9E9E9E" active={visibleCurves.cal} onClick={() => setVisibleCurves(v => ({ ...v, cal: !v.cal }))} />
                </div>

                <div className="pt-6">
                    <h4 className="text-[10px] font-bold uppercase text-[#555555] tracking-widest mb-4">Depth Control</h4>
                    <div className="space-y-4">
                        <div className="bg-black/20 border border-[#333333] p-2 rounded">
                            <span className="text-[10px] text-[#555555] block mb-1">Total Depth Span</span>
                            <span className="text-xl font-mono font-bold text-white tracking-tighter">
                                {minDepth}m - {maxDepth}m
                            </span>
                        </div>
                        <input type="range" className="w-full accent-[#03A9F4]" />
                    </div>
                </div>
            </div>

            {/* Log Display */}
            {dimensionMode !== '1D' && chartData.length > 0 ? (
                 <div className="flex-1 bg-black p-4 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <span className="text-xl font-bold font-mono text-[#03A9F4] animate-pulse">Auto-Detected {dimensionMode} Data Structure</span>
                    <span className="text-sm font-mono text-[#888]">Dynamically splitting view for multi-well spatial overlay analysis...</span>
                    <div className="w-full h-[600px] overflow-x-auto mt-4 rounded border border-[#333]">
                      <div 
                        className="grid gap-1 h-full min-w-[900px] p-1 bg-black/40"
                        style={{ gridTemplateColumns: `repeat(${activeCurves.length + 1}, minmax(0, 1fr))` }}
                      >
                        {activeCurves.map((curve, idx) => (
                          <div key={curve} className="h-full border border-[#444] bg-black/60 rounded flex flex-col p-1">
                            <div className="text-center text-[10px] font-bold uppercase truncate pb-1" style={{ color: CURVE_COLORS[idx % CURVE_COLORS.length] }}>
                              {curve.replace(/_/g, ' ')}
                            </div>
                            <ResponsiveContainer height="100%" width="100%">
                              <LineChart data={chartData} layout="vertical" margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                <XAxis dataKey={curve} type="number" orientation="top" stroke={CURVE_COLORS[idx % CURVE_COLORS.length]} tick={{fontSize: 9}} domain={['auto', 'auto']} />
                                <YAxis dataKey={depthKey} type="number" stroke="#666" reversed={true} domain={['dataMin', 'dataMax']} tick={{fontSize: 9}} hide={idx > 0} width={idx === 0 ? 40 : 0}/>
                                <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', fontSize: '10px'}} />
                                <Line type="linear" dataKey={curve} stroke={CURVE_COLORS[idx % CURVE_COLORS.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
                                {isScanning && (
                                  <ReferenceLine 
                                    y={Number(chartData[scanIndex]?.[depthKey])} 
                                    stroke="#39FF14" 
                                    strokeWidth={2} 
                                    strokeDasharray="4 4"
                                  />
                                )}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ))}

                        {/* Borehole Stratum & Fluids Track */}
                        <div key="stratigraphy" className="h-full border border-[#444] bg-[#0c0c0c] rounded flex flex-col p-1 relative overflow-hidden">
                          <div className="text-center text-[10px] font-bold uppercase truncate pb-1 text-[#FF5722]">
                            Borehole Stratum
                          </div>
                          <div className="flex-1 flex flex-col justify-stretch overflow-hidden relative rounded border border-[#222]">
                            {chartData.slice(0, 12).map((row: any, rIdx: number) => {
                              const grKey = availableKeys.find(k => k.toLowerCase().includes('gamma') || k.toLowerCase() === 'gr' || k.toLowerCase().includes('gr_api') || k.toLowerCase().includes('gamma_ray_api')) || 'gr';
                              const resKey = availableKeys.find(k => k.toLowerCase().includes('resistivity') || k.toLowerCase() === 'res' || k.toLowerCase().includes('res_ohmm') || k.toLowerCase().includes('resistivity_ohm_m')) || 'res';
                              
                              const grVal = Number(row[grKey] || 0);
                              const resVal = Number(row[resKey] || 0);
                              
                              let bgColor = 'bg-gray-600/60'; 
                              let patternText = 'SHALE';
                              let textColor = 'text-gray-300';
                              
                              if (grVal < grCutoff) {
                                bgColor = 'bg-yellow-500/80'; 
                                patternText = 'SAND';
                                textColor = 'text-yellow-950';
                              } else if (grVal > 75) {
                                bgColor = 'bg-stone-800'; 
                                patternText = 'CLAY';
                                textColor = 'text-stone-400';
                              } else {
                                bgColor = 'bg-blue-900/60'; 
                                patternText = 'LIME';
                                textColor = 'text-blue-200';
                              }
                              
                              const isPay = resVal > resCutoff;
                              const isSand = grVal < grCutoff;
                              let showFluid = false;
                              let fluidColor = '';
                              let fluidLabel = '';
                              
                              if (isSand && isPay) {
                                showFluid = true;
                                fluidColor = 'bg-red-500 animate-pulse';
                                fluidLabel = 'OIL';
                              } else if (isSand) {
                                showFluid = true;
                                fluidColor = 'bg-blue-500';
                                fluidLabel = 'WTR';
                              }

                              const isActiveScan = isScanning && scanIndex === rIdx;

                              return (
                                <div 
                                  key={rIdx} 
                                  className={cn(
                                    "flex-1 flex flex-col justify-center items-center text-[8px] font-mono border-b border-[#222]/30 relative transition-all duration-150", 
                                    bgColor,
                                    isActiveScan ? "ring-2 ring-[#39FF14] z-10 scale-[1.02]" : ""
                                  )}
                                  title={`Depth: ${row[depthKey]}m | GR: ${grVal.toFixed(1)} | RES: ${resVal.toFixed(1)}`}
                                >
                                  <span className={cn("font-bold", textColor)}>{row[depthKey] || row.depth || row.Depth_m}m</span>
                                  <span className="text-[7px] font-semibold opacity-75">{patternText}</span>
                                  {showFluid && (
                                    <span className={cn("text-[6px] font-extrabold text-white px-1 py-0.2 rounded mt-0.5", fluidColor)}>
                                      {fluidLabel}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="absolute bottom-4 right-4 text-[9px] text-[#555] font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>
                 </div>
            ) : (
                <div className="flex-1 bg-black overflow-hidden relative border-r border-[#333] p-1">
                    <div className="w-full h-[600px] overflow-x-auto mt-4 rounded border border-[#333]">
                      <div 
                        className="grid gap-1 h-full min-w-[900px] p-1 bg-black/40"
                        style={{ gridTemplateColumns: `repeat(${activeCurves.length + 1}, minmax(0, 1fr))` }}
                      >
                        {activeCurves.map((curve, idx) => (
                          <div key={curve} className="h-full border border-[#444] bg-black/60 rounded flex flex-col p-1">
                            <div className="text-center text-[10px] font-bold uppercase truncate pb-1" style={{ color: CURVE_COLORS[idx % CURVE_COLORS.length] }}>
                              {curve.replace(/_/g, ' ')}
                            </div>
                            <ResponsiveContainer height="100%" width="100%">
                              <LineChart data={chartData} layout="vertical" margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                <XAxis dataKey={curve} type="number" orientation="top" stroke={CURVE_COLORS[idx % CURVE_COLORS.length]} tick={{fontSize: 9}} domain={['auto', 'auto']} />
                                <YAxis dataKey={depthKey} type="number" stroke="#666" reversed={true} domain={['dataMin', 'dataMax']} tick={{fontSize: 9}} hide={idx > 0} width={idx === 0 ? 40 : 0}/>
                                <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', fontSize: '10px'}} />
                                <Line type="linear" dataKey={curve} stroke={CURVE_COLORS[idx % CURVE_COLORS.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
                                {isScanning && (
                                  <ReferenceLine 
                                    y={Number(chartData[scanIndex]?.[depthKey])} 
                                    stroke="#39FF14" 
                                    strokeWidth={2} 
                                    strokeDasharray="4 4"
                                  />
                                )}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ))}

                        {/* Borehole Stratum & Fluids Track */}
                        <div key="stratigraphy" className="h-full border border-[#444] bg-[#0c0c0c] rounded flex flex-col p-1 relative overflow-hidden">
                          <div className="text-center text-[10px] font-bold uppercase truncate pb-1 text-[#FF5722]">
                            Borehole Stratum
                          </div>
                          <div className="flex-1 flex flex-col justify-stretch overflow-hidden relative rounded border border-[#222]">
                            {chartData.slice(0, 12).map((row: any, rIdx: number) => {
                              const grKey = availableKeys.find(k => k.toLowerCase().includes('gamma') || k.toLowerCase() === 'gr' || k.toLowerCase().includes('gr_api') || k.toLowerCase().includes('gamma_ray_api')) || 'gr';
                              const resKey = availableKeys.find(k => k.toLowerCase().includes('resistivity') || k.toLowerCase() === 'res' || k.toLowerCase().includes('res_ohmm') || k.toLowerCase().includes('resistivity_ohm_m')) || 'res';
                              
                              const grVal = Number(row[grKey] || 0);
                              const resVal = Number(row[resKey] || 0);
                              
                              let bgColor = 'bg-gray-600/60'; 
                              let patternText = 'SHALE';
                              let textColor = 'text-gray-300';
                              
                              if (grVal < grCutoff) {
                                bgColor = 'bg-yellow-500/80'; 
                                patternText = 'SAND';
                                textColor = 'text-yellow-950';
                              } else if (grVal > 75) {
                                bgColor = 'bg-stone-800'; 
                                patternText = 'CLAY';
                                textColor = 'text-stone-400';
                              } else {
                                bgColor = 'bg-blue-900/60'; 
                                patternText = 'LIME';
                                textColor = 'text-blue-200';
                              }
                              
                              const isPay = resVal > resCutoff;
                              const isSand = grVal < grCutoff;
                              let showFluid = false;
                              let fluidColor = '';
                              let fluidLabel = '';
                              
                              if (isSand && isPay) {
                                showFluid = true;
                                fluidColor = 'bg-red-500 animate-pulse';
                                fluidLabel = 'OIL';
                              } else if (isSand) {
                                showFluid = true;
                                fluidColor = 'bg-blue-500';
                                fluidLabel = 'WTR';
                              }

                              const isActiveScan = isScanning && scanIndex === rIdx;

                              return (
                                <div 
                                  key={rIdx} 
                                  className={cn(
                                    "flex-1 flex flex-col justify-center items-center text-[8px] font-mono border-b border-[#222]/30 relative transition-all duration-150", 
                                    bgColor,
                                    isActiveScan ? "ring-2 ring-[#39FF14] z-10 scale-[1.02]" : ""
                                  )}
                                  title={`Depth: ${row[depthKey]}m | GR: ${grVal.toFixed(1)} | RES: ${resVal.toFixed(1)}`}
                                >
                                  <span className={cn("font-bold", textColor)}>{row[depthKey] || row.depth || row.Depth_m}m</span>
                                  <span className="text-[7px] font-semibold opacity-75">{patternText}</span>
                                  {showFluid && (
                                    <span className={cn("text-[6px] font-extrabold text-white px-1 py-0.2 rounded mt-0.5", fluidColor)}>
                                      {fluidLabel}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="absolute bottom-4 right-4 text-[9px] text-[#555] font-mono z-50">{import.meta.env.VITE_CHART_WATERMARK}</p>
                </div>
            )}

            {/* Interpretation Pane */}
            <div className="w-64 border-l border-[#333333] p-4 bg-[#111111]/50 space-y-4 overflow-y-auto scrollbar-thin">
                <h4 className="text-[10px] font-bold uppercase text-[#888888] mb-2 flex items-center gap-2">
                    <BarChart size={12} className="text-[#03A9F4]" />
                    Auto-Lithology
                </h4>
                <div className="space-y-2">
                    <LithologyZone color="bg-yellow-500" label="Sandstone" percentage={sandstonePct} />
                    <LithologyZone color="bg-gray-500" label="Shale" percentage={shalePct} />
                    <LithologyZone color="bg-blue-300" label="Carbonate" percentage={carbonatePct} />
                </div>

                {/* CUTOFF PETROPHYSICAL SOLVER */}
                <div className="pt-4 border-t border-[#222]">
                    <h4 className="text-[10px] font-bold uppercase text-[#FF5722] mb-3 flex items-center gap-2">
                        <Settings2 size={12} />
                        Petrophysical Cutoffs
                    </h4>
                    
                    <div className="space-y-3">
                        {/* Gamma Ray Cutoff Slider */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono uppercase text-[#888]">
                                <span>GR Cutoff (Sand)</span>
                                <span className="text-[#FF5722] font-bold">{grCutoff} API</span>
                            </div>
                            <input 
                                type="range" 
                                min={30} 
                                max={110} 
                                value={grCutoff} 
                                onChange={(e) => setGrCutoff(Number(e.target.value))}
                                className="w-full bg-[#222] h-1 rounded-full appearance-none cursor-pointer accent-[#FF5722]"
                            />
                        </div>

                        {/* Resistivity Cutoff Slider */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono uppercase text-[#888]">
                                <span>Resistivity Cutoff (Pay)</span>
                                <span className="text-[#03A9F4] font-bold">{resCutoff} Ω·m</span>
                            </div>
                            <input 
                                type="range" 
                                min={2} 
                                max={60} 
                                value={resCutoff} 
                                onChange={(e) => setResCutoff(Number(e.target.value))}
                                className="w-full bg-[#222] h-1 rounded-full appearance-none cursor-pointer accent-[#03A9F4]"
                            />
                        </div>
                    </div>

                    {/* Calculated Metrics Readout */}
                    <div className="mt-4 space-y-2 bg-black/40 border border-[#222] p-2.5 rounded font-mono">
                        <div className="text-[9px] text-[#555] uppercase font-bold tracking-wider mb-2 border-b border-[#222] pb-1">Petrophysical Evaluation</div>
                        
                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">Net Sand:</span>
                            <span className="text-yellow-400 font-bold">{petroMetrics.netSand} m</span>
                        </div>

                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">Net Pay:</span>
                            <span className="text-green-400 font-bold">{petroMetrics.netPay} m</span>
                        </div>

                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">NTG Ratio:</span>
                            <span className="text-white font-bold">{petroMetrics.ntg}%</span>
                        </div>

                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">Avg Porosity (Φ):</span>
                            <span className="text-cyan-400 font-bold">{petroMetrics.avgPorosity}%</span>
                        </div>

                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-400">Avg Saturation (Sw):</span>
                            <span className="text-orange-400 font-bold">{petroMetrics.avgSw}%</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-[#222]">
                    <h4 className="text-[10px] font-bold uppercase text-[#888888] mb-3 flex items-center gap-2">
                        <Search size={12} className="text-[#03A9F4]" />
                        Fluid Identification
                    </h4>
                    {chartData.length === 0 ? (
                        <div className="p-3 bg-neutral-900 border border-[#333] rounded">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 font-mono">NO DATA</p>
                            <p className="text-[11px] text-[#888888] leading-tight">[STANDBY - IDLE STATE]</p>
                        </div>
                    ) : crossoverDetected ? (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded animate-pulse">
                            <p className="text-[10px] text-red-500 font-bold uppercase mb-1 font-mono">CROSSOVER DETECTED</p>
                            <p className="text-[11px] text-[#FF5722] leading-tight">Potential HYDROCARBON Show Identified at Target Zone!</p>
                        </div>
                    ) : (
                        <div className="p-3 bg-neutral-900 border border-[#333] rounded">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 font-mono">No crossover</p>
                            <p className="text-[11px] text-[#888888] leading-tight">Water saturation dominant. No obvious hydrocarbon zones detected.</p>
                        </div>
                    )}
                </div>

                {/* IVAN-CORE ACOUSTIC SONIFICATION PANEL */}
                <div className="pt-4 border-t border-[#222] pb-2">
                    <h4 className="text-[10px] font-bold uppercase text-[#39FF14] mb-3 flex items-center gap-2">
                        <Volume2 size={12} />
                        Acoustic Sonification Synth
                    </h4>
                    <div className="bg-black/60 border border-[#39FF14]/20 p-3 rounded-md space-y-3 font-mono text-[10px]">
                        {/* Toggle Button */}
                        <button
                            onClick={handleToggleScan}
                            className={cn(
                                "w-full py-2 rounded text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 border",
                                isScanning 
                                    ? "bg-red-950/40 border-red-500/50 text-red-400 hover:bg-red-900/60" 
                                    : "bg-[#39FF14]/10 border-[#339922]/40 text-[#39FF14] hover:bg-[#39FF14]/20"
                            )}
                        >
                            <Radio size={12} className={isScanning ? "animate-pulse text-[#39FF14]" : "text-[#888]"} />
                            {isScanning ? "STOP SWEEP SCAN" : "START SONIFIED SWEEP"}
                        </button>

                        {/* Oscilloscope Viewport */}
                        <div className="relative h-20 bg-[#070707] rounded border border-[#222] overflow-hidden flex items-center justify-center">
                            {isScanning ? (
                                <canvas 
                                    ref={canvasRef} 
                                    width={220} 
                                    height={80} 
                                    className="w-full h-full block"
                                />
                            ) : (
                                <div className="text-center p-2 text-neutral-600 text-[9px] select-none">
                                    <p className="font-bold uppercase tracking-widest mb-1 text-[#39FF14]/60">SYNTH STANDBY</p>
                                    <p className="text-[8px] text-[#555]">Click START to sonify subsurface curves with real-time audio sweep</p>
                                </div>
                            )}
                        </div>

                        {/* Parameters & Adjustments */}
                        <div className="space-y-2 text-[9px] text-[#888]">
                            {/* Curve selector */}
                            <div className="flex items-center justify-between">
                                <span>TARGET WAVE:</span>
                                <select 
                                    value={selectedAudioCurve} 
                                    onChange={(e) => setSelectedAudioCurve(e.target.value)}
                                    className="bg-[#111] border border-[#333] text-white rounded px-1.5 py-0.5 text-[9px] font-mono focus:outline-none"
                                >
                                    {activeCurves.map(c => (
                                        <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Soundwave wave type selection */}
                            <div className="flex items-center justify-between">
                                <span>OSC SYNTH:</span>
                                <div className="flex gap-1">
                                    {(['sine', 'triangle', 'sawtooth'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setOscType(type)}
                                            className={cn(
                                                "px-1 py-0.5 rounded text-[8px] uppercase font-bold border transition-colors",
                                                oscType === type 
                                                    ? "bg-[#39FF14]/20 border-[#39FF14]/50 text-white" 
                                                    : "bg-black border-[#222] hover:border-[#444] text-[#666]"
                                            )}
                                        >
                                            {type.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scan interval slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>SWEEP RATE:</span>
                                    <span className="text-white font-bold">{scanSpeed} ms</span>
                                </div>
                                <input 
                                    type="range" 
                                    min={50} 
                                    max={400} 
                                    step={25}
                                    value={scanSpeed} 
                                    onChange={(e) => setScanSpeed(Number(e.target.value))}
                                    className="w-full bg-[#222] h-1 rounded-full appearance-none cursor-pointer accent-[#39FF14]"
                                />
                            </div>

                            {/* Volume slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>VOLUME LEVEL:</span>
                                    <span className="text-white font-bold">{Math.round(volume * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min={0.01} 
                                    max={0.3} 
                                    step={0.01}
                                    value={volume} 
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="w-full bg-[#222] h-1 rounded-full appearance-none cursor-pointer accent-[#39FF14]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

function CurveToggle({ label, color, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between p-2 rounded text-[11px] font-bold transition-all border",
                active ? "bg-[#222] border-[#333] text-white opacity-100" : "border-transparent text-[#555] hover:text-[#888] opacity-50"
            )}
        >
            <div className="flex items-center gap-2">
                <div className="w-1 h-3 rounded-full" style={{ backgroundColor: active ? color : '#555' }}></div>
                <span>{label}</span>
            </div>
            {active && <div className="w-1 h-1 rounded-full bg-[#03A9F4]" />}
        </button>
    );
}

function LithologyZone({ color, label, percentage }: any) {
    return (
        <div className="p-3 bg-black/20 border border-[#222] rounded flex items-center gap-3">
            <div className={cn("w-1.5 h-8 rounded-full", color)}></div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-bold text-[#AAAAAA]">{label}</span>
                    <span className="text-[10px] text-green-500 font-mono">{percentage}%</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-1 bg-[#222] mt-1 rounded-full overflow-hidden">
                    <div className={cn("h-full", color)} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    );
}

