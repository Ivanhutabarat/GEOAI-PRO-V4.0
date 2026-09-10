import React, { useState, useMemo } from 'react';
import { Mountain, Cpu, Send, ShieldAlert, Compass } from 'lucide-react';
import { useGeoDataStore } from '../../store/GeoDataStore';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function GeotechnicalTiltExtensoModule() {
  const addPoint = useGeoDataStore((state) => state.addPoint);
  const layers = useGeoDataStore((state) => state.layers);
  const faultActive = useGeoDataStore((state) => state.faultActive);
  const { globalData } = useGlobalGeoContext();

  // Split Form Fields (defaults to empty string to trigger auto-assessment)
  const [tilt, setTilt] = useState<string>('');
  const [strain, setStrain] = useState<string>('');
  const [rmr, setRmr] = useState<string>('');

  // Auto-inference calculations based on Stratigraphic Fault Displacement & Seismic parameters
  const inferredTilt = useMemo(() => {
    const baseDisplacement = layers && layers[0] ? Math.abs(layers[0].displacement || 2.0) : 2.0;
    if (faultActive) {
      return parseFloat((0.85 + baseDisplacement * 0.35).toFixed(2)); // degrees
    }
    return 0.12;
  }, [layers, faultActive]);

  const inferredStrain = useMemo(() => {
    const baseDisplacement = layers && layers[0] ? Math.abs(layers[0].displacement || 2.0) : 2.0;
    if (faultActive) {
      return parseFloat((0.45 + baseDisplacement * 0.18).toFixed(3)); // mm
    }
    return 0.015;
  }, [layers, faultActive]);

  const inferredRmr = useMemo(() => {
    const baseDisplacement = layers && layers[0] ? Math.abs(layers[0].displacement || 2.0) : 2.0;
    // RMR scale goes from 0-100 (Rock Mass Rating). Highly fractured faults lower this score.
    const score = Math.round(85 - baseDisplacement * 6.5);
    return Math.min(100, Math.max(0, score));
  }, [layers]);

  const isManual = tilt !== '' || strain !== '' || rmr !== '';

  // Local Visualizer Slip-Vector Coordinates
  // To present a physical ground displacement map, coordinates show 2D slip vector displacements (dx, dy)
  const [vectors, setVectors] = useState<any[]>([
    { dx: 0.15, dy: 0.08, magnitude: 12, name: "Basal Anchor-01" },
    { dx: -0.32, dy: 0.41, magnitude: 24, name: "North Face Crest" },
    { dx: 0.55, dy: -0.22, magnitude: 18, name: "Fault Block Footwall" },
    { dx: -0.05, dy: -0.15, magnitude: 8, name: "South Bench" },
    { dx: 0.82, dy: 0.75, magnitude: 35, name: "Rig Support Column C" },
  ]);

  const [validationError, setValidationError] = useState<string>('');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    const finalTilt = tilt === '' ? inferredTilt : parseFloat(tilt);
    const finalStrain = strain === '' ? inferredStrain : parseFloat(strain);
    const finalRmr = rmr === '' ? inferredRmr : parseFloat(rmr);

    if (isNaN(finalTilt) || finalTilt < -90 || finalTilt > 90) {
      setValidationError('Borehole Angular Displacement (Tilt) must be a float between -90 and 90 degrees.');
      return;
    }
    if (isNaN(finalStrain) || finalStrain < 0 || finalStrain > 50) {
      setValidationError('Extensometer Micro-Slip Strain must be a valid float between 0.000 and 50.000 mm.');
      return;
    }
    if (isNaN(finalRmr) || finalRmr < 0 || finalRmr > 100) {
      setValidationError('Rock Mass Rating (RMR Index) must be an integer between 0 and 100.');
      return;
    }

    setIsTransmitting(true);

    setTimeout(() => {
      // 1. Packetize into unified JSON block format for consensus loop
      const payloadData = {
        instrument: "Biaxial MEMS Inclinometer & Linear Potentiometric Extensometer",
        status: isManual ? "MANUAL_OVERRIDE_ACTIVE" : "AUTO_ASSESSING_FROM_ARRAYS",
        rawTelemetry: {
          angularDisplacementDegrees: finalTilt,
          potentiometricStrainMm: finalStrain,
          rockMassRatingScore: finalRmr,
          shearDisplacementRater: (finalTilt * finalStrain).toFixed(4),
          structuralSafetyStatus: finalRmr < 40 ? "HIGH_COLLAPSE_RISK_SUSPEND_OPS" : (finalRmr < 60 ? "MARGINAL_STABILITY_MONITOR" : "SECURE_BASEMENT_PROFILE")
        },
        slopeInversionMetrics: {
          instabilityTriggerIndex: (finalStrain / 10).toFixed(4),
          shearPlaneInterflowDeg: (finalTilt * 1.05).toFixed(2)
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
      // Map geotechnical warning coordinates into 3D space
      const xCoord = finalTilt;
      const yCoord = finalStrain * 4;
      const zCoord = -2.8;

      addPoint({
        id: `geotech-${Date.now()}`,
        position: [xCoord, yCoord, zCoord],
        color: finalRmr < 50 ? '#EF5350' : '#00E5FF', // red if critical, neon-blue check if normal
        type: 'geotech-tilt'
      });

      // Update local vectors list
      setVectors(prev => [
        ...prev,
        { dx: finalTilt, dy: finalStrain, magnitude: Math.round(finalRmr / 2), name: "Active Drill Core Anchor" }
      ].slice(-8));

      setSuccessMsg(`GEOPHYSICAL SLOPE TELEMETRY DISTRIBUTED! ${isManual ? 'Manual overriding coordinates updated.' : 'Borehole stratigraphic faulting calculated fallback parameters.'}`);
      setIsTransmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Mountain className="text-[#00E5FF] animate-pulse" />
            Geotech Tilt & Extenso Workspace
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">
            Borehole Inclining Scans, Tectonic Slips & Rock Mass Structural Rating Index
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Compass className="text-[#00E5FF]" size={14} />
          <span className="font-mono">MEMS GYROS UNLOCKED</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Side: Telemetry Field Input Panel */}
        <form onSubmit={handleTransmit} className="col-span-12 lg:col-span-5 bg-black/40 border border-[#333333] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isManual ? "bg-amber-500" : "bg-[#00E5FF] animate-pulse"}`}></span>
              Geotech Telemetry Panel
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
                Borehole Angular Displacement / Tilt (deg °)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={tilt}
                  onChange={(e) => setTilt(e.target.value)}
                  placeholder={`Inferred: ${inferredTilt}°`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#00E5FF] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">degrees °</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Extensometer Micro-Slip Strain (mm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  value={strain}
                  onChange={(e) => setStrain(e.target.value)}
                  placeholder={`Inferred: ${inferredStrain} mm`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#00E5FF] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">mm</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1.5">
                Rock Mass Rating / RMR Index
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rmr}
                  onChange={(e) => setRmr(e.target.value)}
                  placeholder={`Inferred: ${inferredRmr}`}
                  className="w-full bg-[#111112] border border-[#2c2c2e] focus:border-[#00E5FF] rounded p-2 text-xs font-mono text-white placeholder:text-[#555] focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2 text-[9px] font-mono text-[#555]">Index (0-100)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isTransmitting}
            className="w-full py-2 bg-[#00E5FF] hover:bg-cyan-500 active:bg-cyan-600 disabled:bg-cyan-950 text-black font-bold uppercase text-xs tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Send size={12} />
            {isTransmitting ? 'EMBEDDING DEFORMATION VECTOR...' : 'TRANSMIT TO SWARM'}
          </button>
        </form>

        {/* Right Side: Slip Vector Scatter Displacement Chart */}
        <div className="col-span-12 lg:col-span-7 bg-black/40 border border-[#333333] rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-[#222] pb-3">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass size={14} className="text-[#00E5FF]" />
              Structural Slope Stability Slip-Vector
            </h2>
            <span className="text-[9px] font-mono bg-[#1c1c1f] px-2 py-0.5 rounded text-[#00E5FF] font-bold">STABILITY MATRIX</span>
          </div>

          <div className="h-44 w-full bg-black/60 rounded border border-[#222] p-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis type="number" dataKey="dx" name="Tilt DX" unit="°" stroke="#555" fontSize={9} domain={[-2, 2]} />
                <YAxis type="number" dataKey="dy" name="Strain DY" unit="mm" stroke="#555" fontSize={9} domain={[-2, 2]} />
                <ZAxis type="number" dataKey="magnitude" range={[60, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: 10, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Scatter name="Geotech Anchors" data={vectors}>
                  {vectors.map((entry, index) => {
                    const isHazardous = entry.magnitude > 25 || Math.abs(entry.dx) > 1.0;
                    return <Cell key={`cell-${index}`} fill={isHazardous ? '#EF5350' : '#00E5FF'} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left font-mono">
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] uppercase text-[#666]">MAX SLIP SLOPE MAGNITUDE</span>
              <p className="text-sm font-bold text-white mt-1">
                {Math.max(...vectors.map(v => v.magnitude))} mm-deg
              </p>
            </div>
            <div className="bg-[#111112] border border-[#222] p-3 rounded">
              <span className="block text-[8px] uppercase text-[#666]">SAFETY EVALUATION</span>
              <p className="text-sm font-bold text-[#00E5FF] mt-1">
                {vectors.some(v => v.magnitude > 28) ? 'CRITICAL DISPLACEMENT CRACK' : 'STRUCTURALLY SECURE'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
