import React, { useState, useMemo } from 'react';
import { Droplets, Cpu, Send, ShieldAlert, BarChart } from 'lucide-react';
import { useGeoDataStore } from '../../store/GeoDataStore';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function GroundwaterModule() {
  const addPoint = useGeoDataStore((state) => state.addPoint);
  const layers = useGeoDataStore((state) => state.layers);
  const { globalData } = useGlobalGeoContext();

  // Split Form Fields (defaults to empty string to trigger auto-assessment)
  const [extractionRate, setExtractionRate] = useState<string>('');
  const [porePressure, setPorePressure] = useState<string>('');
  const [compressibility, setCompressibility] = useState<string>('');

  // Auto-inference logic from Electrical EM & layer profiles
  const inferredExtractionRate = useMemo(() => {
    if (globalData?.electricalData && globalData.electricalData.length > 0) {
      const avgResistivity = globalData.electricalData.reduce((sum: number, item: any) => sum + (item.resistivity || 100), 0) / globalData.electricalData.length;
      return Math.min(10000, Math.max(10, Math.round(50000 / (avgResistivity + 10))));
    }
    return 450;
  }, [globalData?.electricalData]);

  const inferredPorePressure = useMemo(() => {
    if (globalData?.electricalData && globalData.electricalData.length > 0) {
      const avgCharge = globalData.electricalData.reduce((sum: number, item: any) => sum + (item.chargeability || 10), 0) / globalData.electricalData.length;
      return parseFloat((avgCharge * 0.2).toFixed(1));
    }
    return 2.8;
  }, [globalData?.electricalData]);

  const inferredCompressibility = useMemo(() => {
    if (layers && layers.length > 2) {
      return parseFloat((0.15 + (Math.abs(layers[2].depthEnd || 60) * 0.0005)).toFixed(2));
    }
    return 0.18;
  }, [layers]);

  const isManual = extractionRate !== '' || porePressure !== '' || compressibility !== '';

  // Local chart simulations
  const [simulationTimeline, setSimulationTimeline] = useState<any[]>([
    { day: 1, drawdown: 0.1, pressure: 2.8 },
    { day: 5, drawdown: 0.4, pressure: 2.72 },
    { day: 10, drawdown: 1.1, pressure: 2.58 },
    { day: 15, drawdown: 1.8, pressure: 2.41 },
    { day: 20, drawdown: 2.6, pressure: 2.24 },
  ]);

  const [validationError, setValidationError] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    const finalExtraction = extractionRate === '' ? inferredExtractionRate : parseFloat(extractionRate);
    const finalPressure = porePressure === '' ? inferredPorePressure : parseFloat(porePressure);
    const finalCompressibility = compressibility === '' ? inferredCompressibility : parseFloat(compressibility);

    if (isNaN(finalExtraction) || finalExtraction < 0 || finalExtraction > 10000) {
      setValidationError('Extraction Rate must be a valid number between 0 and 10000 m³/day.');
      return;
    }
    if (isNaN(finalPressure) || finalPressure < 0 || finalPressure > 100) {
      setValidationError('Pore Water Pressure must be a valid number between 0 and 100 MPa.');
      return;
    }
    if (isNaN(finalCompressibility) || finalCompressibility < 0.001 || finalCompressibility > 2.0) {
      setValidationError('Compressibility Index (Cc) must be a float between 0.001 and 2.0.');
      return;
    }

    setIsTransmitting(true);

    setTimeout(() => {
      // 1. Unify into JSON block format
      const payloadData = {
        instrument: "Aquifer Drawdown & Geotechnical Consolidation Sensor",
        status: isManual ? "MANUAL_OVERRIDE_ACTIVE" : "AUTO_ASSESSING_FROM_ARRAYS",
        rawTelemetry: {
          extractionRateM3Day: finalExtraction,
          poreWaterPressureMpa: finalPressure,
          compressibilityCc: finalCompressibility,
          sedimentationRiskFactor: (finalExtraction * finalCompressibility * 0.1).toFixed(3)
        },
        hydrodynamics: {
          aquiferType: "CONFINED_INTERSTRATIFIED_SANDSTONE",
          effectiveStressMpa: (finalPressure * 1.5).toFixed(2)
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
      const xCoord = (finalExtraction % 12) - 6;
      const yCoord = (finalPressure * 3) - 5;
      const zCoord = -2.5 - (finalCompressibility * 2);

      addPoint({
        id: `gw-${Date.now()}`,
        position: [xCoord, yCoord, zCoord],
        color: '#00E5FF', // cyan for groundwater
        type: 'groundwater'
      });

      // Update local telemetry forecast metrics list
      setSimulationTimeline(prev => [
        ...prev,
        { day: prev.length * 5 + 1, drawdown: (finalExtraction * 0.005).toFixed(2), pressure: finalPressure.toFixed(2) }
      ].slice(-8));

      setSuccessMsg(`HYDROGEOLOGY METRICS TRANSMITTED SUCCESSFULLY! Using ${isManual ? 'Manual Overridden Values' : 'Electrical Sounding Inference'}.`);
      setIsTransmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Droplets className="text-[#00E5FF] animate-pulse" />
            Groundwater & Hydrogeology
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">
            Piezometric Pressure Monitoring & Aquifer Subsidence Analysis
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Cpu className="text-[#00E5FF]" size={14} />
          <span className="font-mono">PRESSURE TRANSDUCERS LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Form Panel */}
        <form onSubmit={handleTransmit} className="col-span-12 lg:col-span-5 bg-black/40 border border-[#333333] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isManual ? "bg-amber-500" : "bg-[#00E5FF] animate-pulse"}`}></span>
              Hydrologic Inputs
            </h2>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${isManual ? "text-amber-500" : "text-[#00E5FF]"}`}>
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
            <div className="bg-green-950/40 border border-green-900/60 p-3 rounded text-[11px] text-[#00E5FF] font-mono">
              {successMsg}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Extraction Rate (m³/day)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={extractionRate}
                  onChange={(e) => setExtractionRate(e.target.value)}
                  placeholder={`Inferred: ${inferredExtractionRate}`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#00E5FF] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">M³/DAY</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Pore Water Pressure (MPa)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={porePressure}
                  onChange={(e) => setPorePressure(e.target.value)}
                  placeholder={`Inferred: ${inferredPorePressure}`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#00E5FF] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">MPA</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Compressibility Index (Cc)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={compressibility}
                  onChange={(e) => setCompressibility(e.target.value)}
                  placeholder={`Inferred: ${inferredCompressibility}`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#00E5FF] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">INDEX (CC)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isTransmitting}
            className="w-full py-2 bg-[#00E5FF] hover:bg-cyan-400 active:bg-cyan-500 disabled:bg-cyan-950 text-black font-bold uppercase text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Send size={12} />
            {isTransmitting ? 'SEQUENCING DRAWDOWN MODEL...' : 'TRANSMIT TO SWARM'}
          </button>
        </form>

        {/* Right Panel: Drawdown simulation chart */}
        <div className="col-span-12 lg:col-span-7 bg-black/40 border border-[#333333] rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart size={14} className="text-[#00E5FF]" />
              Expected Drawdown Decline Curves
            </h2>
            <span className="text-[9px] font-mono bg-[#1c1c1f] px-2 py-0.5 rounded text-[#888]">HYDRAULIC MATH model</span>
          </div>

          <div className="h-44 w-full bg-black/60 rounded border border-[#222] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="day" stroke="#555" fontSize={9} tickLine={false} label={{ value: 'Days In Production', position: 'insideBottom', offset: -2, fill: '#555', fontSize: 8 }} />
                <YAxis stroke="#555" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: 10, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="drawdown" name="Decline Drawdown (m)" stroke="#00E5FF" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] font-mono uppercase text-[#666]">HYDROLOGIC DRAWDOWN</span>
              <p className="text-sm font-mono font-bold text-white mt-1">
                {simulationTimeline[simulationTimeline.length - 1]?.drawdown || 0} METERS
              </p>
            </div>
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] font-mono uppercase text-[#666]">SETTLEMENT SUBSIDENCE RISK</span>
              <p className="text-sm font-mono font-bold text-[#FF5722] mt-1">
                {(parseFloat(extractionRate) * parseFloat(compressibility) * 0.1).toFixed(3)} mm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
