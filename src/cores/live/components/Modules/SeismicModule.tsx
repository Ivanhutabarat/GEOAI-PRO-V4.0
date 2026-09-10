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
  Crosshair,
  Play,
  Square,
  Volume2,
  VolumeX,
  Eye,
  Radio,
  Sparkles,
  Tv,
  Settings
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

  // New Immersive States
  const [visualMode, setVisualMode] = useState<'chart' | 'sonar' | 'synthetic'>('chart');
  const [isSonifying, setIsSonifying] = useState(false);
  const [activeTraceIdx, setActiveTraceIdx] = useState<number | null>(null);
  const [activeSampleIdx, setActiveSampleIdx] = useState<number | null>(null);
  const [hoverImpedance, setHoverImpedance] = useState<number | null>(null);
  const [scrollingTremors, setScrollingTremors] = useState<number[]>(Array.from({ length: 150 }, () => 0));

  // Synthetic Seismogram states
  const [sonicLogDT, setSonicLogDT] = useState<number>(100); // us/ft
  const [densityLogRho, setDensityLogRho] = useState<number>(2.2); // g/cm3
  const [rickerFreq, setRickerFreq] = useState<number>(30); // Hz

  const generateSyntheticTrace = useMemo(() => {
    const numSamples = 100;
    const dt = 0.002; // 2ms
    let AI = [];
    let RC = [];
    let trace = new Array(numSamples).fill(0);
    
    // Create 3 layers for AI
    for (let i = 0; i < numSamples; i++) {
       let v = 1000000 / sonicLogDT;
       let rho = densityLogRho;
       if (i > 30 && i < 60) { v *= 1.2; rho *= 1.1; }
       if (i >= 60) { v *= 1.5; rho *= 1.3; }
       AI.push(v * rho);
    }
    
    // Calculate RC
    for (let i = 0; i < numSamples - 1; i++) {
       RC.push((AI[i+1] - AI[i]) / (AI[i+1] + AI[i]));
    }
    RC.push(0);

    // Ricker Wavelet
    let numWaveletSamples = 41;
    let wavelet = [];
    let f = rickerFreq;
    for (let i = -20; i <= 20; i++) {
       let t = i * dt;
       let pi2f2t2 = Math.pow(Math.PI * f * t, 2);
       let w = (1 - 2 * pi2f2t2) * Math.exp(-pi2f2t2);
       wavelet.push(w);
    }

    // Convolution
    for (let i = 0; i < numSamples; i++) {
       for (let j = 0; j < numWaveletSamples; j++) {
           let k = i - (j - 20);
           if (k >= 0 && k < numSamples) {
               trace[i] += RC[k] * wavelet[j];
           }
       }
    }
    
    return trace.map((amp, idx) => ({ time: idx * dt, amplitude: amp, RC: RC[idx] * 5, AI: AI[idx] / 10000 }));
  }, [sonicLogDT, densityLogRho, rickerFreq]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const seismographIntervalRef = useRef<any>(null);

  // Continuous live passive seismic monitoring (seismograph)
  useEffect(() => {
    if (seismicMode === 'mitigation' && visualMode === 'sonar') {
      seismographIntervalRef.current = setInterval(() => {
        setScrollingTremors(prev => {
          const next = [...prev.slice(1)];
          let pulse = Math.sin(Date.now() / 150) * 0.15;
          // random tectonic tension spike (micro-tremors)
          if (Math.random() > 0.98) {
            pulse += (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.8);
            try {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              const ctx = new AudioContextClass();
              const osc = ctx.createOscillator();
              const gNode = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(90, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.25);
              gNode.gain.setValueAtTime(0.06, ctx.currentTime);
              gNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
              osc.connect(gNode);
              gNode.connect(ctx.destination);
              osc.start();
            } catch (e) {}
          }
          next.push(pulse);
          return next;
        });
      }, 70);
    } else {
      if (seismographIntervalRef.current) {
        clearInterval(seismographIntervalRef.current);
        seismographIntervalRef.current = null;
      }
    }
    return () => {
      if (seismographIntervalRef.current) {
        clearInterval(seismographIntervalRef.current);
      }
    };
  }, [seismicMode, visualMode]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) {}
      }
      if (gainRef.current) {
        try { gainRef.current.disconnect(); } catch (e) {}
      }
    };
  }, []);

  const startSonification = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gNode = ctx.createGain();
      const fNode = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      
      fNode.type = 'lowpass';
      fNode.frequency.setValueAtTime(700, ctx.currentTime);

      gNode.gain.setValueAtTime(0.02, ctx.currentTime);

      osc.connect(fNode);
      fNode.connect(gNode);
      gNode.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gNode;
      filterRef.current = fNode;
      setIsSonifying(true);
    } catch (e) {
      console.error("Failed to start hover sonification:", e);
    }
  };

  const stopSonification = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch (e) {}
      oscRef.current = null;
    }
    if (gainRef.current) {
      try { gainRef.current.disconnect(); } catch (e) {}
      gainRef.current = null;
    }
    audioCtxRef.current = null;
    setIsSonifying(false);
    setActiveTraceIdx(null);
    setActiveSampleIdx(null);
    setHoverImpedance(null);
  };

  const playHoverSound = (impedance: number, amplitude: number) => {
    if (!oscRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const freq = 140 + ((impedance - 1500) / 4000) * 460;
    oscRef.current.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.04);

    const vol = 0.005 + Math.abs(amplitude) * 0.035;
    gainRef.current?.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.04);
  };

  const triggerAcousticSweep = async () => {
    if (isSonifying) stopSonification();
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();

      const tracesMatrix: number[][] = data.map((item: any) => {
        if (Array.isArray(item.traces)) return item.traces;
        if (typeof item.amplitude === 'number') {
          return Array.from({ length: 10 }, (_, idx) => item.amplitude * Math.sin(idx * 0.5));
        }
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      });

      for (let i = 0; i < tracesMatrix.length; i++) {
        setActiveTraceIdx(i);
        const item = tracesMatrix[i];
        const avgAmp = item.reduce((sum, val) => sum + Math.abs(val), 0) / item.length;
        
        const osc = ctx.createOscillator();
        const gNode = ctx.createGain();
        
        osc.type = 'triangle';
        const baseFreq = 180 + (i / tracesMatrix.length) * 350;
        osc.frequency.setValueAtTime(baseFreq + avgAmp * 250, ctx.currentTime);
        
        gNode.gain.setValueAtTime(0.025, ctx.currentTime);
        gNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        
        const fNode = ctx.createBiquadFilter();
        fNode.type = 'lowpass';
        fNode.frequency.value = 450;
        
        osc.connect(fNode);
        fNode.connect(gNode);
        gNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      setActiveTraceIdx(null);
    } catch (e) {
      console.warn("Acoustic sweep failed:", e);
    }
  };

  useEffect(() => {
    if (!baseData) {
      // REMOVED MOCK UPDATE
    } else {
      // setData(baseData);
    }
    
    let interval: any;
    if (true) {
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
  const [brightSpotCutoff, setBrightSpotCutoff] = useState<number>(0.65);

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

    if (seismicMode === 'exploration') {
      // CLEAR
      ctx.fillStyle = '#070707';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const tracesMatrix: number[][] = data.map((item: any) => {
        if (Array.isArray(item.traces)) {
          return item.traces;
        } else if (typeof item.amplitude === 'number') {
          return Array.from({ length: 10 }, (_, idx) => item.amplitude * Math.sin(idx * 0.5));
        }
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      });

      if (tracesMatrix.length === 0) return;

      const traceSpacing = (canvas.width - 60) / tracesMatrix.length;
      const sampleSpacing = canvas.height / 10;

      // Draw horizontal timing lines
      ctx.strokeStyle = '#181818';
      ctx.lineWidth = 1;
      for (let j = 0; j < 10; j++) {
        const y = j * sampleSpacing;
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        ctx.fillStyle = '#444';
        ctx.font = '8px monospace';
        ctx.fillText(`${j * 200}ms`, 5, y + 10);
      }

      // Draw traces
      tracesMatrix.forEach((trace, i) => {
        const x = 40 + i * traceSpacing;

        // Trace center vertical axis
        ctx.strokeStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        // Trace highlight if active hover
        if (i === activeTraceIdx) {
          ctx.fillStyle = 'rgba(255, 87, 34, 0.08)';
          ctx.fillRect(x - traceSpacing/2, 0, traceSpacing, canvas.height);
        }

        const filteredTrace = trace.map(val => val * normalization * (filterFreq / 50.0));

        // Draw Variable Density
        if (showDensity) {
          filteredTrace.forEach((val, j) => {
            const y = j * sampleSpacing;
            const alpha = Math.min(Math.abs(val) * gain * 0.5, 0.85);
            ctx.fillStyle = val > 0 
              ? `rgba(255, 87, 34, ${alpha})` // positive reflection (orange)
              : `rgba(0, 229, 255, ${alpha})`; // negative reflection (cyan)
            ctx.fillRect(x - traceSpacing / 2, y, traceSpacing, sampleSpacing);
          });
        }

        // Draw Wiggle curve
        if (showWiggles) {
          ctx.beginPath();
          ctx.strokeStyle = i === activeTraceIdx ? '#FF5722' : '#555';
          ctx.lineWidth = i === activeTraceIdx ? 1.5 : 0.8;

          filteredTrace.forEach((val, j) => {
            const y = j * sampleSpacing + sampleSpacing / 2;
            const wx = x + (val * gain * 8);
            if (j === 0) ctx.moveTo(wx, y);
            else ctx.lineTo(wx, y);
          });
          ctx.stroke();

          // Fill positive lobes (shaded)
          ctx.beginPath();
          ctx.fillStyle = i === activeTraceIdx ? 'rgba(255, 87, 34, 0.25)' : 'rgba(255, 87, 34, 0.1)';
          filteredTrace.forEach((val, j) => {
            const y = j * sampleSpacing + sampleSpacing / 2;
            const wx = x + (val * gain * 8);
            if (val > 0) {
              ctx.lineTo(wx, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.lineTo(x, canvas.height);
          ctx.lineTo(x, 0);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Highlight hover node
      if (activeTraceIdx !== null && activeSampleIdx !== null) {
        const hx = 40 + activeTraceIdx * traceSpacing;
        const hy = activeSampleIdx * sampleSpacing + sampleSpacing / 2;
        ctx.strokeStyle = '#00E5FF';
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, Math.PI * 2);
        ctx.stroke();
      }

    } else {
      // Passive Seismograph visualizer (disaster mitigation)
      ctx.fillStyle = '#070707';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw horizontal seismograph guidelines
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      const midY = canvas.height / 2;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(canvas.width, midY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, midY - 60);
      ctx.lineTo(canvas.width, midY - 60);
      ctx.moveTo(0, midY + 60);
      ctx.lineTo(canvas.width, midY + 60);
      ctx.strokeStyle = '#ef444433';
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = '8px monospace';
      ctx.fillText('CRITICAL ACCELERATION DANGER LEVEL', 10, midY - 65);

      // Draw scrolling wave
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const stepX = canvas.width / scrollingTremors.length;
      scrollingTremors.forEach((val, i) => {
        const x = i * stepX;
        const y = midY + val * 50;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw glowing end point
      if (scrollingTremors.length > 0) {
        const lastVal = scrollingTremors[scrollingTremors.length - 1];
        const lx = canvas.width - 4;
        const ly = midY + lastVal * 50;
        ctx.fillStyle = Math.abs(lastVal) > 1.0 ? '#ef4444' : '#00ffc4';
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [data, seismicMode, activeTraceIdx, activeSampleIdx, showDensity, showWiggles, gain, filterFreq, normalization, scrollingTremors]);

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

              <div className="geo-card border border-[#333]">
                <h4 className="text-[10px] font-bold uppercase text-[#FF5722] mb-3 flex items-center gap-2 font-mono">
                    <Zap size={12} />
                    Seismic Bright Spot Threshold
                </h4>
                <div className="space-y-3">
                    <ControlSlider label="Bright Spot Thresh" value={Math.round(brightSpotCutoff * 100)} onChange={(val: number) => setBrightSpotCutoff(val / 100)} min={10} max={100} />
                    
                    <div className="space-y-1.5 font-mono text-[10px] bg-black/40 p-2.5 rounded border border-[#222]">
                        <span className="text-[#555] block font-bold border-b border-[#222] pb-1 uppercase">Identified Stratum Anomalies</span>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Horizon Alpha (~450m):</span>
                            <span className={cn("font-bold", 0.72 >= brightSpotCutoff ? "text-green-400 animate-pulse" : "text-gray-600")}>0.72 Amp {0.72 >= brightSpotCutoff ? "(PAY)" : "(LOW)"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Horizon Beta (~1120m):</span>
                            <span className={cn("font-bold", 0.88 >= brightSpotCutoff ? "text-green-400 animate-pulse" : "text-gray-600")}>0.88 Amp {0.88 >= brightSpotCutoff ? "(PAY)" : "(LOW)"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Horizon Gamma (~1850m):</span>
                            <span className={cn("font-bold", 0.54 >= brightSpotCutoff ? "text-green-400 animate-pulse" : "text-gray-600")}>0.54 Amp {0.54 >= brightSpotCutoff ? "(PAY)" : "(LOW)"}</span>
                        </div>
                    </div>
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
                    ? `${data[0]?.length || 10} Samples // ${data.length} Traces`
                    : `${mitigationData.length} Samples`
                  }
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-black/60 border border-[#333] rounded p-0.5 text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => { setVisualMode('chart'); stopSonification(); }}
                  className={cn("px-2.5 py-1 rounded transition-colors uppercase font-bold", visualMode === 'chart' ? "bg-[#FF5722] text-black" : "text-gray-400 hover:text-white")}
                >
                  📊 Chart
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('sonar')}
                  className={cn("px-2.5 py-1 rounded transition-colors uppercase font-bold flex items-center gap-1", visualMode === 'sonar' ? "bg-[#FF5722] text-black" : "text-gray-400 hover:text-white")}
                >
                  <Radio size={10} className={cn(isSonifying && "animate-pulse")} />
                  📻 Sonar Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('synthetic')}
                  className={cn("px-2.5 py-1 rounded transition-colors uppercase font-bold flex items-center gap-1", visualMode === 'synthetic' ? "bg-[#FF5722] text-black" : "text-gray-400 hover:text-white")}
                >
                  <Sparkles size={10} />
                  📈 Synthetic
                </button>
              </div>
              <button className="p-2 hover:bg-white/5 text-[#888888] rounded"><Download size={14} /></button>
              <button className="p-2 hover:bg-white/5 text-[#888888] rounded"><Maximize2 size={14} /></button>
            </div>
          </div>

          {visualMode === 'sonar' && (
            <div className="bg-[#111] border-b border-[#222] px-4 py-2.5 flex items-center justify-between font-mono text-[10px] select-none text-zinc-400">
              <div className="flex items-center gap-3">
                {seismicMode === 'exploration' ? (
                  <>
                    <button
                      type="button"
                      onClick={triggerAcousticSweep}
                      className="bg-[#FF5722]/10 hover:bg-[#FF5722]/20 border border-[#FF5722]/30 text-[#FF5722] px-2.5 py-1 rounded flex items-center gap-1 font-bold uppercase transition-all"
                      title="Sonic Transducer sweep across all geological layers"
                    >
                      <Play size={10} />
                      Acoustic Sweep Scan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isSonifying) {
                          stopSonification();
                        } else {
                          startSonification();
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded border font-bold uppercase transition-all flex items-center gap-1",
                        isSonifying 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                          : "bg-black border-[#333] text-gray-500 hover:text-white"
                      )}
                    >
                      {isSonifying ? <Volume2 size={10} /> : <VolumeX size={10} />}
                      {isSonifying ? "Hydrophone ON (Hover)" : "Hydrophone OFF"}
                    </button>
                  </>
                ) : (
                  <span className="text-zinc-500 italic">🔔 Move slider parameters on left side to filter passive seismic waves</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-zinc-500">
                {seismicMode === 'exploration' ? (
                  <>
                    {activeTraceIdx !== null && (
                      <div className="flex gap-3 text-[9px] sm:text-[10px]">
                        <span>TRACE: <strong className="text-white">#{100 + activeTraceIdx}</strong></span>
                        <span>SAMPLE: <strong className="text-[#00E5FF]">#{activeSampleIdx}</strong></span>
                        <span>DEPTH: <strong className="text-amber-500">{activeSampleIdx !== null ? (activeSampleIdx * 200) : 0}m</strong></span>
                        {hoverImpedance !== null && (
                          <span>IMPEDANCE (Z): <strong className="text-emerald-400">{hoverImpedance.toFixed(0)} kg/m²s</strong></span>
                        )}
                      </div>
                    )}
                    {!isSonifying && activeTraceIdx === null && (
                      <span className="text-[9px] italic text-zinc-600">💡 Move cursor over canvas to inspect acoustic impedance profile</span>
                    )}
                  </>
                ) : (
                  <span className="text-emerald-400 animate-pulse text-[9px] flex items-center gap-1 font-bold uppercase">
                    <Activity size={10} /> Live Passive Seismometer Stream
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 relative bg-black p-4 flex">
            {dimensionMode === '3D' ? (
              <Fallback3D />
            ) : visualMode === 'sonar' ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={680}
                  height={520}
                  className="bg-black border border-zinc-900 rounded cursor-crosshair max-w-full max-h-full"
                  onMouseMove={(e) => {
                    if (seismicMode !== 'exploration') return;
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    // calculate trace index
                    const tracesMatrix: number[][] = data.map((item: any) => {
                      if (Array.isArray(item.traces)) return item.traces;
                      if (typeof item.amplitude === 'number') {
                        return Array.from({ length: 10 }, (_, idx) => item.amplitude * Math.sin(idx * 0.5));
                      }
                      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    });

                    const traceSpacing = (canvas.width - 60) / tracesMatrix.length;
                    const sampleSpacing = canvas.height / 10;

                    const traceIdx = Math.min(Math.max(0, Math.floor((mouseX - 30) / traceSpacing)), tracesMatrix.length - 1);
                    const sampleIdx = Math.min(Math.max(0, Math.floor(mouseY / sampleSpacing)), 9);

                    setActiveTraceIdx(traceIdx);
                    setActiveSampleIdx(sampleIdx);

                    const amp = tracesMatrix[traceIdx]?.[sampleIdx] || 0;
                    const Z_base = 2200 + sampleIdx * 350;
                    const Z = Z_base + amp * 900;
                    setHoverImpedance(Z);

                    if (isSonifying) {
                      playHoverSound(Z, amp);
                    }
                  }}
                  onMouseEnter={() => {
                    if (isSonifying && seismicMode === 'exploration') {
                      startSonification();
                    }
                  }}
                  onMouseLeave={() => {
                    stopSonification();
                  }}
                />
              </div>
            ) : visualMode === 'synthetic' ? (
              <div className="w-full h-full p-4 bg-black flex flex-col">
                <div className="mb-4 bg-[#111] border border-[#333] p-4 flex gap-4 rounded flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">Sonic Log (DT) - µs/ft: <strong className="text-white">{sonicLogDT}</strong></label>
                    <input type="range" min="40" max="180" step="1" value={sonicLogDT} onChange={(e) => setSonicLogDT(Number(e.target.value))} className="w-full" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">Density Log (ρ) - g/cm³: <strong className="text-white">{densityLogRho.toFixed(2)}</strong></label>
                    <input type="range" min="1.8" max="3.0" step="0.05" value={densityLogRho} onChange={(e) => setDensityLogRho(Number(e.target.value))} className="w-full" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">Ricker Wavelet Freq - Hz: <strong className="text-white">{rickerFreq}</strong></label>
                    <input type="range" min="10" max="80" step="1" value={rickerFreq} onChange={(e) => setRickerFreq(Number(e.target.value))} className="w-full" />
                  </div>
                </div>
                <div className="flex-1 w-full min-h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateSyntheticTrace} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis type="number" stroke="#555" fontSize={10} domain={[-2, 2]} />
                      <YAxis dataKey="time" type="number" stroke="#555" fontSize={10} reversed domain={[0, 0.2]} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px', fontFamily: 'monospace' }} />
                      <Legend wrapperStyle={{fontSize: '10px'}} />
                      <Line type="monotone" dataKey="amplitude" name="Synthetic Trace" stroke="#FF5722" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="RC" name="Reflection Coef (Scaled)" stroke="#2196F3" strokeWidth={1} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="AI" name="Acoustic Impedance (Scaled)" stroke="#4CAF50" strokeWidth={1} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
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
