import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useMemo, useEffect } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { Radio, Cpu, Send, ShieldAlert, Layers } from 'lucide-react';
import { useGeoDataStore } from '../../store/GeoDataStore';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function BoreholeRadiometricModule() {

  const { apiMode, engine, dimensionMode } = useAppContext();
  

  const addPoint = useGeoDataStore((state) => state.addPoint);
  const layers = useGeoDataStore((state) => state.layers);
  const { globalData, rawPayloads } = useGlobalGeoContext();

  // Split Form Fields (defaults to empty string to trigger auto-assessment)
  const [gammaIntensity, setGammaIntensity] = useState<string>('');
  const [oreDensity, setOreDensity] = useState<string>('');
  const [depthTarget, setDepthTarget] = useState<string>('');

  // Auto-inference calculations
  const inferredGamma = useMemo(() => {
    if (globalData?.seismicData && globalData.seismicData.length > 0) {
      return Math.min(2000, Math.max(0, Math.round(globalData.seismicData.length * 15 + 180)));
    }
    const midDepth = layers && layers[1] ? Math.abs(layers[1].depthEnd) : 35;
    return Math.round(midDepth * 6.8); // 238 cps as default
  }, [globalData?.seismicData, layers]);

  const inferredOreDensity = useMemo(() => {
    if (globalData?.seismicData && globalData.seismicData.length > 0) {
      return parseFloat((2.0 + (globalData.seismicData.length * 0.05)).toFixed(2));
    }
    const baseDisplacement = layers && layers[0] ? Math.abs(layers[0].displacement || 2) : 2;
    return parseFloat((2.5 + (baseDisplacement * 0.25)).toFixed(2)); // 3.0 g/cm³ default
  }, [globalData?.seismicData, layers]);

  const inferredDepthTarget = useMemo(() => {
    if (layers && layers.length > 0) {
      return Math.abs(layers[layers.length - 1].depthEnd) * 3; // 180 meters default
    }
    return 120;
  }, [layers]);

  const isManual = gammaIntensity !== '' || oreDensity !== '' || depthTarget !== '';

  const [radiometricData, setRadiometricData] = useState<any[]>([]);

  useEffect(() => {
    const finalUranium = isManual ? parseFloat(gammaIntensity) / 20 : inferredGamma / 20;
    const finalThorium = isManual ? parseFloat(oreDensity) * 10 : inferredOreDensity * 10;
    // REMOVED MOCK UPDATE
  }, [globalData, gammaIntensity, oreDensity, inferredGamma, inferredOreDensity, isManual]);

  const [validationError, setValidationError] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    const finalGamma = gammaIntensity === '' ? inferredGamma : parseFloat(gammaIntensity);
    const finalOreDensity = oreDensity === '' ? inferredOreDensity : parseFloat(oreDensity);
    const finalDepthTarget = depthTarget === '' ? inferredDepthTarget : parseFloat(depthTarget);

    if (isNaN(finalGamma) || finalGamma < 0 || finalGamma > 2000) {
      setValidationError('Gamma Radiation Intensity must be a valid number between 0 and 2000 cps.');
      return;
    }
    if (isNaN(finalOreDensity) || finalOreDensity < 0.1 || finalOreDensity > 20) {
      setValidationError('Ore Deposit Density must be a valid number between 0.1 and 20 g/cm³.');
      return;
    }
    if (isNaN(finalDepthTarget) || finalDepthTarget < 1 || finalDepthTarget > 5000) {
      setValidationError('Drill Core Depth Target must be a valid number between 1 and 5000 meters.');
      return;
    }

    setIsTransmitting(true);

    setTimeout(() => {
      // 1. Unify into JSON block format
      const payloadData = {
        instrument: "Borehole Radiometric Profiler",
        status: isManual ? "MANUAL_OVERRIDE_ACTIVE" : "AUTO_ASSESSING_FROM_ARRAYS",
        rawTelemetry: {
          gammaIntensityCps: finalGamma,
          oreDensityGcm3: finalOreDensity,
          drillDepthMeters: finalDepthTarget,
          energySpectrumClassification: finalGamma > 250 ? "POTENTIAL_URANIUM_THORIUM_ANOMALY" : "BASE_SEDIMENTARY_BACKGROUND"
        },
        systemContext: {
          scintillometerGain: 1.0,
          calibratedMultiplier: 1.045
        }
      };

      const payloadString = JSON.stringify(payloadData, null, 2);

      // 2. Dispatch event to trigger <SwarmRoom> consensus loop
      window.dispatchEvent(
        new CustomEvent('geoai:transmit', {
          detail: { payload: payloadString },
        })
      );

      // 3. Update Zustand Store with a new 3D Volumetric Mesh Point
      const xCoord = (finalGamma % 10) - 5;
      const yCoord = (finalOreDensity * 2) - 5;
      const zCoord = -1 * (finalDepthTarget / 50);
      
      addPoint({
        id: `rad-${Date.now()}`,
        position: [xCoord, yCoord, zCoord],
        color: '#E040FB', // magenta for radiometric
        type: 'radiometric'
      });

      setSuccessMsg(`TELEMETRY SECURELY PACKETIZED AND TRANSMITTED TO SWARM NODES! Using ${isManual ? 'Manual Input Override' : 'Automated Layer Inference'}.`);
      setIsTransmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Radio className="text-[#E040FB] animate-pulse" />
            Borehole Radiometric Profiler
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">
            Gamma-Ray Spectroscopy & Ore Core Density Demarcation
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Cpu className="text-[#E040FB]" size={14} />
          <span className="font-mono">SCINTILLOMETER CALIBRATED</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Side: Telemetry Field Input Panel */}
        <form onSubmit={handleTransmit} className="col-span-12 lg:col-span-5 bg-black/40 border border-[#333333] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isManual ? "bg-amber-500" : "bg-[#00E676] animate-pulse"}`}></span>
              Telemetry Panel
            </h2>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${isManual ? "text-amber-500" : "text-[#00E676]"}`}>
              {isManual ? '[MANUAL OVERRIDE ACTIVE]' : '[AUTO-ASSESSING FROM ARRAYS]'}
            </span>
          </div>

          {validationError && (
            <div className="bg-red-950/40 border border-red-900/60 p-3 rounded flex items-start gap-2.5 text-[11px] text-red-400 font-mono">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-950/40 border border-green-900/60 p-3 rounded text-[11px] text-[#00E676] font-mono">
              {successMsg}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Gamma Radiation Intensity (cps / API)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={gammaIntensity}
                  onChange={(e) => setGammaIntensity(e.target.value)}
                  placeholder={`Inferred: ${inferredGamma} (seismic/bedrock)`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#E040FB] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">CPS</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Ore Deposit Density (g/cm³)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={oreDensity}
                  onChange={(e) => setOreDensity(e.target.value)}
                  placeholder={`Inferred: ${inferredOreDensity}`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#E040FB] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">G/CM³</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Drill Core Depth Target (meters)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depthTarget}
                  onChange={(e) => setDepthTarget(e.target.value)}
                  placeholder={`Inferred: ${inferredDepthTarget}m`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#E040FB] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">METERS</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isTransmitting}
            className="w-full py-2 bg-[#E040FB] hover:bg-fuchsia-600 active:bg-fuchsia-700 disabled:bg-fuchsia-950 text-black font-bold uppercase text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Send size={12} />
            {isTransmitting ? 'INLINING SYSTEM MATRIX...' : 'TRANSMIT TO SWARM'}
          </button>
        </form>

        {/* Right Side: Active Spectral Response Visuals */}
        <div className="col-span-12 lg:col-span-7 bg-black/40 border border-[#333333] rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-[#E040FB]" />
              Spectral Logging Waveforms
            </h2>
            <span className="text-[9px] font-mono bg-[#1c1c1f] px-2 py-0.5 rounded text-[#888]">LIVE STREAM</span>
          </div>

          {/* Graph visual */}
          <div className="h-56 w-full bg-black/60 rounded border border-[#222] p-2">
            <DebugDump data={radiometricData} />
<ResponsiveContainer width="100%" height="100%">
              <LineChart data={forceMapData(radiometricData || [])} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis type="number" stroke="#555" fontSize={9} tickLine={false} />
                <YAxis dataKey="depth" type="category" stroke="#555" fontSize={9} reversed tickLine={false} label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 8 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: 10, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="top" height={24} />
                <Line dataKey="uranium" name="U (ppm)" stroke="#E040FB" strokeWidth={2} dot={false} />
                <Line dataKey="thorium" name="Th (ppm)" stroke="#FF5722" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                <Line dataKey="potassium" name="K (%)" stroke="#00b4ff" strokeWidth={2} dot={false} />
                <Line dataKey="clayVolume" name="Clay Vol %" stroke="#00E676" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-[#555] mt-1 text-right font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] font-mono uppercase text-[#666]">LATEST CLAY FRACTION PEAK</span>
              <p className="text-sm font-mono font-bold text-[#00E676] mt-1">
                {radiometricData[radiometricData.length - 1]?.clayVolume || 0}%
              </p>
            </div>
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] font-mono uppercase text-[#666]">U/Th ANOMALY CROSSOVER</span>
              <p className="text-sm font-mono font-bold text-[#E040FB] mt-1">
                {radiometricData[radiometricData.length - 1]?.uranium > radiometricData[radiometricData.length - 1]?.thorium ? 'HIGH LODE DEPOSIT' : 'STABLE BASE'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
