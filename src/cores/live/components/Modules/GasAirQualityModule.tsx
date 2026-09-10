import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useMemo, useEffect } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { Wind, Cpu, Send, ShieldAlert, Activity } from 'lucide-react';
import { useGeoDataStore } from '../../store/GeoDataStore';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function GasAirQualityModule() {

  const { apiMode, engine, dimensionMode } = useAppContext();
  

  const { globalData, rawPayloads,  activeFileName } = useGlobalGeoContext();
  const addPoint = useGeoDataStore((state) => state.addPoint);

  // Split Form Fields (defaults to empty string to trigger auto-assessment)
  const [h2s, setH2s] = useState<string>('');
  const [ch4, setCh4] = useState<string>('');
  const [co, setCo] = useState<string>('');

  // Auto-inference calculations based on Electrical (EM) and Seismic arrays
  const inferredH2s = useMemo(() => {
    if (globalData?.electricalData && globalData.electricalData.length > 0) {
      // High EM resistivity usually means low rock porosity, while sulfide veins (low resistivity) emit sulfurous gases
      const avgResistivity = globalData.electricalData.reduce((sum: number, item: any) => sum + (item.resistivity || 100), 0) / globalData.electricalData.length;
      return Math.min(500, Math.max(0, Math.round(180 - avgResistivity * 0.5)));
    }
    return 14; // Default safe level in ppm
  }, [globalData?.electricalData]);

  const inferredCh4 = useMemo(() => {
    if (globalData?.seismicData && globalData.seismicData.length > 0) {
      // Methane gas accumulations are often found in seismic fracture regions or fault seals
      return parseFloat(Math.min(100, Math.max(0.1, 1.2 + (globalData.seismicData.length * 0.15))).toFixed(1));
    }
    return 2.5; // Default normal level in % LEL
  }, [globalData?.seismicData]);

  const inferredCo = useMemo(() => {
    if (globalData?.electricalData && globalData.electricalData.length > 0) {
      const avgCharge = globalData.electricalData.reduce((sum: number, item: any) => sum + (item.chargeability || 10), 0) / globalData.electricalData.length;
      return Math.round(5 + avgCharge * 1.2);
    }
    return 8; // Default normal level in ppm
  }, [globalData?.electricalData]);

  const isManual = h2s !== '' || ch4 !== '' || co !== '';

  const [gasTimeline, setGasTimeline] = useState<any[]>([]);

  useEffect(() => {
    const finalH2s = h2s === '' ? inferredH2s : parseFloat(h2s);
    const finalCh4 = ch4 === '' ? inferredCh4 : parseFloat(ch4);
    // REMOVED MOCK UPDATE
  }, [activeFileName, h2s, ch4, inferredH2s, inferredCh4]);

  const [validationError, setValidationError] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    const finalH2s = h2s === '' ? inferredH2s : parseFloat(h2s);
    const finalCh4 = ch4 === '' ? inferredCh4 : parseFloat(ch4);
    const finalCo = co === '' ? inferredCo : parseFloat(co);

    if (isNaN(finalH2s) || finalH2s < 0 || finalH2s > 1000) {
      setValidationError('H2S Gas Concentration must be a valid number between 0 and 1000 ppm.');
      return;
    }
    if (isNaN(finalCh4) || finalCh4 < 0 || finalCh4 > 100) {
      setValidationError('CH4 Methane Level must be a valid percentage between 0% and 100% LEL.');
      return;
    }
    if (isNaN(finalCo) || finalCo < 0 || finalCo > 5000) {
      setValidationError('Carbon Monoxide (CO) concentration must be a valid number between 0 and 5000 ppm.');
      return;
    }

    setIsTransmitting(true);

    setTimeout(() => {
      // 1. Packetize into unified JSON block format for consensus loop
      const payloadData = {
        instrument: "Electrochemical Gas Sensor array & Fugitive Emission GC",
        status: isManual ? "MANUAL_OVERRIDE_ACTIVE" : "AUTO_ASSESSING_FROM_ARRAYS",
        rawTelemetry: {
          hydrogenSulfidePpm: finalH2s,
          methaneLelPercent: finalCh4,
          carbonMonoxidePpm: finalCo,
          safetyState: (finalH2s > 100 || finalCh4 > 10 || finalCo > 50) ? "HAZARDOUS_ATMOSPHERE_WARNING" : "ATMOSPHERE_PERMISSIBLE"
        },
        atmosphericRemediation: {
          ventilationCommand: (finalCh4 > 5 || finalH2s > 10) ? "TRIGGER_EXHAUST_SYS_MAX_SPEED" : "MONITOR_FLOW_CONTROL"
        }
      };

      const payloadString = JSON.stringify(payloadData, null, 2);

      // 2. Dispatch event to trigger <SwarmRoom> consensus loop
      window.dispatchEvent(
        new CustomEvent('geoai:transmit', {
          detail: { payload: payloadString },
        })
      );

      // 3. Update Zustand Store with 3D Volumetric Mesh point
      const xCoord = (finalH2s % 10) - 5;
      const yCoord = (finalCh4 * 2) - 5;
      const zCoord = -3.2;

      addPoint({
        id: `gas-${Date.now()}`,
        position: [xCoord, yCoord, zCoord],
        color: '#FF9100', // orange/amber for warning gases
        type: 'gas-air'
      });

      setSuccessMsg(`GAS CHROMATOGRAPHY REPORT COMPILATION TRANSMITTED! ${isManual ? 'Manual parameters forced.' : 'Seismological & EM metrics inferred fallback values.'}`);
      setIsTransmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Wind className="text-[#FF9100] animate-pulse" />
            Gas & Air Quality Workspace
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">
            Sulfide Concentrates, Methane LEL Leak Detection & Fugitive CO Profiling
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Cpu className="text-[#FF9100]" size={14} />
          <span className="font-mono">ELECTROCHEMICAL CORES ARMED</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Side: Telemetry Field Input Panel */}
        <form onSubmit={handleTransmit} className="col-span-12 lg:col-span-5 bg-black/40 border border-[#333333] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isManual ? "bg-amber-500" : "bg-[#00E676] animate-pulse"}`}></span>
              Gas Telemetry Inputs
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
                H2S Gas Concentration (ppm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={h2s}
                  onChange={(e) => setH2s(e.target.value)}
                  placeholder={`Inferred: ${inferredH2s} ppm`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#FF9100] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">ppm</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                CH4 Methane Level (% LEL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={ch4}
                  onChange={(e) => setCh4(e.target.value)}
                  placeholder={`Inferred: ${inferredCh4}% LEL`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#FF9100] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">% LEL</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Carbon Monoxide / CO (ppm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={co}
                  onChange={(e) => setCo(e.target.value)}
                  placeholder={`Inferred: ${inferredCo} ppm`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#FF9100] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">ppm</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isTransmitting}
            className="w-full py-2 bg-[#FF9100] hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-950 text-black font-bold uppercase text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Send size={12} />
            {isTransmitting ? 'EMISSIONS MAPPINGS...' : 'TRANSMIT TO SWARM'}
          </button>
        </form>

        {/* Right Side: Visual Graph */}
        <div className="col-span-12 lg:col-span-7 bg-black/40 border border-[#333333] rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-[#FF9100]" />
              Toxic Gas Gas-Chromatography Emissions
            </h2>
            <span className="text-[9px] font-mono bg-[#1c1c1f] px-2 py-0.5 rounded text-[#888]">SENSOR STREAM</span>
          </div>

          <div className="h-44 w-full bg-black/60 rounded border border-[#222] p-2">
            <DebugDump data={gasTimeline} />
<ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forceMapData(gasTimeline)}>
                <defs>
                  <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9100" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF9100" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="time" stroke="#555" fontSize={9} tickLine={false} label={{ value: 'Survey Time (Seconds)', position: 'insideBottom', offset: -2, fill: '#555', fontSize: 8 }} />
                <YAxis stroke="#555" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: 10, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="h2s" name="H2S (ppm)" stroke="#FF5722" fillOpacity={1} fill="url(#gasGrad)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="ch4" name="CH4 (% LEL)" stroke="#FFB300" fillOpacity={0} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-[#555] mt-1 text-right font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>

          <div className="grid grid-cols-2 gap-3 text-left font-mono">
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] uppercase text-[#666]">LATEST TOXIN ACCUMULATION</span>
              <p className="text-sm font-bold text-white mt-1">
                {gasTimeline[gasTimeline.length - 1]?.h2s || 0} ppm H2S
              </p>
            </div>
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] uppercase text-[#666]">SAFETY CLASSIFICATION</span>
              <p className="text-sm font-bold text-[#FF9100] mt-1">
                {(gasTimeline[gasTimeline.length - 1]?.h2s > 30 || gasTimeline[gasTimeline.length - 1]?.ch4 > 5) ? 'CRITICAL VENT REQUIRED' : 'SAFE ATMOSPHERE'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
