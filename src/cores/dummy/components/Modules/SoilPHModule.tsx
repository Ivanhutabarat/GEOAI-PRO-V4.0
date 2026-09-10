import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useMemo, useEffect } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { TestTube, Cpu, Send, ShieldAlert, Activity } from 'lucide-react';
import { useGeoDataStore } from '../../store/GeoDataStore';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function SoilPHModule() {

  const { apiMode, engine, dimensionMode } = useAppContext();
  

  const addPoint = useGeoDataStore((state) => state.addPoint);
  const { globalData, rawPayloads } = useGlobalGeoContext();

  // Split Form Fields (defaults to empty string to trigger auto-assessment)
  const [phValue, setPhValue] = useState<string>('');
  const [heavyMetalConcentration, setHeavyMetalConcentration] = useState<string>('');

  // Auto-inference from Electrical EM resistivity profiles
  const inferredPhValue = useMemo(() => {
    if (globalData?.electricalData && globalData.electricalData.length > 0) {
      const avgResistivity = globalData.electricalData.reduce((sum: number, item: any) => sum + (item.resistivity || 100), 0) / globalData.electricalData.length;
      // Lower resistivity -> higher acidity (lower pH)
      return parseFloat(Math.min(14, Math.max(0, 3.5 + (avgResistivity * 0.012))).toFixed(2));
    }
    return 6.5;
  }, [globalData?.electricalData]);

  const inferredHeavyMetalConcentration = useMemo(() => {
    if (globalData?.electricalData && globalData.electricalData.length > 0) {
      const avgCharge = globalData.electricalData.reduce((sum: number, item: any) => sum + (item.chargeability || 10), 0) / globalData.electricalData.length;
      // Chargeability can relate to heavy metal ionization density
      return parseFloat((avgCharge * 1.55).toFixed(1));
    }
    return 12.5;
  }, [globalData?.electricalData]);

  const isManual = phValue !== '' || heavyMetalConcentration !== '';

  const [plumeData, setPlumeData] = useState<any[]>([]);

  useEffect(() => {
    const finalMetal = heavyMetalConcentration === '' ? inferredHeavyMetalConcentration : parseFloat(heavyMetalConcentration);
    // REMOVED MOCK UPDATE // scaling up to get a nice visual
  }, [globalData, heavyMetalConcentration, inferredHeavyMetalConcentration]);

  const [validationError, setValidationError] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    const finalPh = phValue === '' ? inferredPhValue : parseFloat(phValue);
    const finalMetal = heavyMetalConcentration === '' ? inferredHeavyMetalConcentration : parseFloat(heavyMetalConcentration);

    if (isNaN(finalPh) || finalPh < 0 || finalPh > 14) {
      setValidationError('Measured pH Value must be a valid float between 0.00 and 14.00.');
      return;
    }
    if (isNaN(finalMetal) || finalMetal < 0 || finalMetal > 10000) {
      setValidationError('Heavy Metal Ion Concentration must be a valid number between 0 and 10000 ppm.');
      return;
    }

    setIsTransmitting(true);

    setTimeout(() => {
      // 1. Unify into JSON block format
      const payloadData = {
        instrument: "Electrochemical soil pH & ICP-MS Spectrogram",
        status: isManual ? "MANUAL_OVERRIDE_ACTIVE" : "AUTO_ASSESSING_FROM_ARRAYS",
        rawTelemetry: {
          soilPhValue: finalPh,
          heavyMetalsPpm: finalMetal,
          acidityLevelClassification: finalPh < 5.0 ? "CRITICAL_ACID_SULFATE_RUNOFF" : (finalPh > 8.5 ? "ALKALINE_SALT_ACCUMULATION" : "NEUTRAL_AGRICULTURAL_RANGE"),
          toxicConcentrationSafetyRating: finalMetal > 50 ? "UNSAFE_HAZARDOUS_ACCUMULATION" : "PERMISSIBLE_ECOLOGICAL_THRESHOLD"
        },
        remediationDirective: {
          recommendedAction: finalPh < 5.0 ? "DISSOLVABLE_AGRICULTURAL_LIME_DOSING" : (finalPh > 8.5 ? "ELEMENTAL_SULFUR_INJECTION" : "MONITOR_RUNOFF_ONLY")
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
      const xCoord = (finalPh % 7) - 3.5;
      const yCoord = (finalMetal % 10) - 5;
      const zCoord = -1.2;

      addPoint({
        id: `ph-${Date.now()}`,
        position: [xCoord, yCoord, zCoord],
        color: '#00E676', // green for soil pH & environmental
        type: 'soil_ph'
      });

      setSuccessMsg(`SOIL & ECOLOGICAL ASSESSMENT DISPATCHED TO SWARM NODES! Using ${isManual ? 'Manual Override parameters' : 'EM Conductivity auto-inference'}.`);
      setIsTransmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <TestTube className="text-[#00E676] animate-pulse" />
            Soil pH & Environmental Spec
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">
            Heavy Metal Pollutant Tracking & Soil Remediation Bio-Inversion
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Cpu className="text-[#00E676]" size={14} />
          <span className="font-mono">ICP-MS SPECTROMETER LINK</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Form Panel */}
        <form onSubmit={handleTransmit} className="col-span-12 lg:col-span-5 bg-black/40 border border-[#333333] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isManual ? "bg-amber-500" : "bg-[#00E676] animate-pulse"}`}></span>
              Ecological Panel
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
                Measured pH Value (0.00 - 14.00 float)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={phValue}
                  onChange={(e) => setPhValue(e.target.value)}
                  placeholder={`Inferred: ${inferredPhValue}`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#00E676] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">pH scale</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Heavy Metal Ion Concentration (ppm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={heavyMetalConcentration}
                  onChange={(e) => setHeavyMetalConcentration(e.target.value)}
                  placeholder={`Inferred: ${inferredHeavyMetalConcentration}`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#00E676] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">PPM</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isTransmitting}
            className="w-full py-2 bg-[#00E676] hover:bg-emerald-450 active:bg-emerald-500 disabled:bg-emerald-950 text-black font-bold uppercase text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Send size={12} />
            {isTransmitting ? 'SPECTRAL PARSING...' : 'TRANSMIT TO SWARM'}
          </button>
        </form>

        {/* Right Panel: Chart metrics */}
        <div className="col-span-12 lg:col-span-7 bg-black/40 border border-[#333333] rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-[#00E676]" />
              Inductor Ion Mass Spectrometry
            </h2>
            <span className="text-[9px] font-mono bg-[#1c1c1f] px-2 py-0.5 rounded text-[#888]">ICP-MS READINGS</span>
          </div>

          <div className="h-44 w-full bg-black/60 rounded border border-[#222] p-2">
            <DebugDump data={plumeData} />
<ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forceMapData(plumeData || [])}>
                <defs>
                  <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="distance" stroke="#555" fontSize={9} tickLine={false} label={{ value: 'Distance from Source (m)', position: 'insideBottom', offset: -2, fill: '#555', fontSize: 8 }} />
                <YAxis stroke="#555" fontSize={9} tickLine={false} label={{ value: 'Plume Density', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 8 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: 10, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="concentration" name="Contaminant Spread (ppm)" stroke="#00E676" fill="url(#colorCon)" strokeWidth={2} />
                <Area type="step" dataKey="residentialLimit" name="Safe Residential Limit" stroke="#FF5722" fill="none" strokeWidth={1} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-[#555] mt-1 text-right font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] font-mono uppercase text-[#666]">CHEMICAL pH LEVEL</span>
              <p className="text-sm font-mono font-bold text-white mt-1">
                {phValue} ({parseFloat(phValue) < 7 ? 'ACIDIC' : (parseFloat(phValue) > 7 ? 'ALKALINE' : 'NEUTRAL')})
              </p>
            </div>
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] font-mono uppercase text-[#666]">REMEDIATION CONSTRAINTS</span>
              <p className="text-sm font-mono font-bold text-[#00E676] mt-1">
                {parseFloat(phValue) < 5.0 ? 'LIME AGENT DOSING' : (parseFloat(phValue) > 8.5 ? 'SULFUR DOSING' : 'STABLE ECO-BASIN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
