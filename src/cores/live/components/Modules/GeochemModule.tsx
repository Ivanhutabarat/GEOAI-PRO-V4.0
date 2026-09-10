import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useEffect, useMemo } from 'react';
import { geochemPayload } from '../../../../data/mocks/geochem';
import DynamicChart from '../Shared/DynamicChart';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { 
  Thermometer, 
  Activity, 
  Layers, 
  Filter, 
  Atom, 
  Download, 
  Cpu,
  Plus,
  X,
  FlaskConical
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';

export default function GeochemModule() {

  const { apiMode, engine, dimensionMode } = useAppContext();
  

  const { globalData, rawPayloads,  activeFileName } = useGlobalGeoContext();
  const [activeSample, setActiveSample] = useState<string>("SMP-104");
  const [acidInflow, setAcidInflow] = useState<number>(3.5); // pH value
  const [acidType, setAcidType] = useState<string>("Aqua Regia");
  const [elementalView, setElementalView] = useState<string>("oxides");

  // New Custom Sample form states
  const [showCreator, setShowCreator] = useState(false);
  const [newSmpName, setNewSmpName] = useState("Custom Borehole Sand");
  const [newSmpDepth, setNewSmpDepth] = useState(620);
  const [newSmpSiO2, setNewSmpSiO2] = useState(65);
  const [newSmpAl2O3, setNewSmpAl2O3] = useState(15);
  const [newSmpFe2O3, setNewSmpFe2O3] = useState(10);
  const [newSmpMgO, setNewSmpMgO] = useState(5);
  const [newSmpCaO, setNewSmpCaO] = useState(5);

  // Rock core sample elemental composition (oxides & rare earth metals)
  const [samplesData, setSamplesData] = useState<Record<string, {
    name: string,
    depth: number,
    SiO2: number,
    Al2O3: number,
    Fe2O3: number,
    MgO: number,
    CaO: number,
    alkalies: number, // Quartz (SiO2), Feldspar (Al2O3 + alkalies), Lithic (Fe + Mg + Ca)
    rareEarths: { element: string, ppm: number }[]
  }>>({
    "SMP-102": {
      name: "Upper Sandstone Segment",
      depth: 210,
      SiO2: 82.4, Al2O3: 8.1, Fe2O3: 2.3, MgO: 1.1, CaO: 2.1, alkalies: 4.0,
      rareEarths: [
        { element: "Nd", ppm: 28 }, { element: "Sm", ppm: 6.2 }, { element: "Eu", ppm: 1.4 },
        { element: "Gd", ppm: 5.8 }, { element: "Tb", ppm: 0.9 }, { element: "Dy", ppm: 5.1 }
      ]
    },
    "SMP-104": {
      name: "Syenite Intrusion Boundary",
      depth: 450,
      SiO2: 58.2, Al2O3: 17.4, Fe2O3: 6.5, MgO: 3.4, CaO: 5.2, alkalies: 9.3,
      rareEarths: [
        { element: "Nd", ppm: 54 }, { element: "Sm", ppm: 11.8 }, { element: "Eu", ppm: 2.9 },
        { element: "Gd", ppm: 9.7 }, { element: "Tb", ppm: 1.6 }, { element: "Dy", ppm: 8.4 }
      ]
    },
    "SMP-106": {
      name: "Ultramafic Basaltic Sill",
      depth: 820,
      SiO2: 44.1, Al2O3: 12.3, Fe2O3: 14.8, MgO: 12.5, CaO: 11.2, alkalies: 5.1,
      rareEarths: [
        { element: "Nd", ppm: 14 }, { element: "Sm", ppm: 4.1 }, { element: "Eu", ppm: 1.1 },
        { element: "Gd", ppm: 3.9 }, { element: "Tb", ppm: 0.7 }, { element: "Dy", ppm: 3.8 }
      ]
    }
  });

  const handleCreateSample = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `SMP-${Math.floor(Math.random() * 899) + 100}`;
    setSamplesData(prev => ({
      ...prev,
      [id]: {
        name: newSmpName,
        depth: newSmpDepth,
        SiO2: newSmpSiO2,
        Al2O3: newSmpAl2O3,
        Fe2O3: newSmpFe2O3,
        MgO: newSmpMgO,
        CaO: newSmpCaO,
        alkalies: 4.5,
        rareEarths: [
          { element: "Nd", ppm: Math.round(Math.random() * 40 + 10) },
          { element: "Sm", ppm: Math.round(Math.random() * 10 + 2) },
          { element: "Eu", ppm: Math.round(Math.random() * 3 + 1) },
          { element: "Gd", ppm: Math.round(Math.random() * 8 + 2) },
          { element: "Tb", ppm: Math.round(Math.random() * 2) },
          { element: "Dy", ppm: Math.round(Math.random() * 6 + 1) }
        ]
      }
    }));
    setActiveSample(id);
    setShowCreator(false);
  };

  // Simulate leach rate based on acid strength (pH) and type
  const calculatedLeachIndex = useMemo(() => {
    const baseLeach = (8.0 - acidInflow) * 12.5;
    const modifier = acidType === "HF" ? 1.35 : acidType === "Aqua Regia" ? 1.2 : acidType === "HCl" ? 0.95 : 0.7;
    return Math.min(100, Math.max(1, Math.round(baseLeach * modifier)));
  }, [acidInflow, acidType]);

  const presetLog = `# Core Sample Oxide Table
# SampleID, Depth, SiO2, Al2O3, Fe2O3, MgO, CaO, Alkalies
SMP-108, 900, 38.4, 15.2, 18.3, 14.2, 12.1, 4.0
SMP-110, 1050, 41.2, 11.5, 16.4, 15.5, 10.4, 3.8`;

  const [geochemData, setGeochemData] = useState<any[]>([]);

  const chartData = useMemo(() => {
    if (rawPayloads && rawPayloads.geochemData) {
      const result = processIncomingData(rawPayloads.geochemData);
      if (result && result.data && result.data.length > 0) {
        return result.data;
      }
    }
    return (globalData.geochemData && globalData.geochemData.length > 0) 
      ? globalData.geochemData 
      : geochemPayload;
  }, [globalData.geochemData, rawPayloads?.geochemData]);

  useEffect(() => {
    // REMOVED MOCK UPDATE
  }, [activeFileName, acidInflow]);

  const currentData = samplesData[activeSample];

  // Ternary calculations for QFL classification:
  // normalized sum: SiO2 (Quartz) + Alkalies/Al2O3 (Feldspar) + Fe/Mg/Ca (Lithic)
  const totalQFL = currentData.SiO2 + currentData.Al2O3 + currentData.Fe2O3;
  const qPct = (currentData.SiO2 / totalQFL) * 100;
  const fPct = (currentData.Al2O3 / totalQFL) * 100;
  const lPct = (currentData.Fe2O3 / totalQFL) * 100;

  // Transform 3 co-ords (Q, F, L) to 2D SVG pixels inside dynamic triangle
  // Vertexes of equilateral triangle: Top = Q(0, 10), Left = F(-100, 190), Right = L(100, 190)
  const getTernaryXY = (q: number, f: number, l: number) => {
    const size = 180;
    const h = size * Math.sqrt(3) / 2;
    const cx = 120;
    const cy = 25 + size * Math.sqrt(3) / 3; // centroid

    // Vertex points:
    // Top (Q = 100%): x = cx, y = cy - dY (where dY = size * sqrt(3)/3)
    // Left (F = 100%): x = cx - size/2, y = cy + dY/2
    // Right (L = 100%): x = cx + size/2, y = cy + dY/2
    const total = q + f + l;
    const nQ = q / total;
    const nF = f / total;
    const nL = l / total;

    const x = cx + (nL - nF) * (size / 2);
    const y = (cy - (size * Math.sqrt(3) / 3)) + (nF + nL) * h;
    return { x, y };
  };

  const pointXY = getTernaryXY(qPct, fPct, lPct);

  // Classify lithology name based on SiO2 / MgO / Al2O3
  const getSubsurfaceClassification = () => {
    if (currentData.SiO2 > 70) return "Felsic Quartzite / Quartz Sandstone";
    if (currentData.SiO2 > 55) return "Intermediate Syenite / Andesitical Core";
    return "Mafic Basalt / Peridotite Ore";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Atom className="text-[#FF5722]" />
            Geochemical Lithology Classification
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">X-Ray Fluorescence & Rare Earth Metal Chromatography // .xlsx .csv</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Cpu className="text-[#FF5722]" size={14} />
          <span className="font-mono">XRF COMPUTER // ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Core Sample Selection Controls */}
        <div className="col-span-4 space-y-4">
          <UniversalIngestionPort 
            moduleName="geochem"
            contextKey="geochemData"
            onParsed={(d) => console.log(d)}
            presetLog={presetLog}
          />
          
          <div className="geo-card animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888]">Borehole Core Samples</h3>
              <button 
                onClick={() => setShowCreator(!showCreator)}
                className="flex items-center gap-1 text-[10px] bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/40 px-2 py-0.5 rounded font-mono uppercase font-bold hover:bg-[#FF5722]/30 transition"
              >
                {showCreator ? <X size={10} /> : <Plus size={10} />}
                {showCreator ? "Cancel" : "Add Core"}
              </button>
            </div>

            {/* Core Sample Creator Form */}
            {showCreator && (
              <form onSubmit={handleCreateSample} className="bg-black/60 border border-[#FF5722]/30 p-3 rounded mb-4 space-y-3 animate-slide-in">
                <div className="text-[10px] font-mono text-[#FF5722] uppercase font-bold border-b border-[#FF5722]/20 pb-1">Create Core Spec</div>
                
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <label className="text-[9px] font-mono text-gray-400 uppercase">Core Name</label>
                    <input 
                      type="text" 
                      value={newSmpName} 
                      onChange={(e) => setNewSmpName(e.target.value)}
                      className="bg-[#222] border border-[#333] text-white px-2 py-1 text-xs rounded font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-mono text-gray-400 uppercase">Depth (m)</label>
                      <input 
                        type="number" 
                        value={newSmpDepth} 
                        onChange={(e) => setNewSmpDepth(Number(e.target.value))}
                        className="bg-[#222] border border-[#333] text-white px-2 py-1 text-xs rounded font-mono"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] font-mono text-gray-400 uppercase">Quartz (SiO2 %)</label>
                      <input 
                        type="number" 
                        value={newSmpSiO2} 
                        onChange={(e) => setNewSmpSiO2(Number(e.target.value))}
                        className="bg-[#222] border border-[#333] text-white px-2 py-1 text-xs rounded font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="flex flex-col">
                      <label className="text-[8px] font-mono text-gray-400 uppercase">Al2O3 %</label>
                      <input 
                        type="number" 
                        value={newSmpAl2O3} 
                        onChange={(e) => setNewSmpAl2O3(Number(e.target.value))}
                        className="bg-[#222] border border-[#333] text-white px-1.5 py-1 text-[10px] rounded font-mono"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[8px] font-mono text-gray-400 uppercase">Fe2O3 %</label>
                      <input 
                        type="number" 
                        value={newSmpFe2O3} 
                        onChange={(e) => setNewSmpFe2O3(Number(e.target.value))}
                        className="bg-[#222] border border-[#333] text-white px-1.5 py-1 text-[10px] rounded font-mono"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[8px] font-mono text-gray-400 uppercase">MgO %</label>
                      <input 
                        type="number" 
                        value={newSmpMgO} 
                        onChange={(e) => setNewSmpMgO(Number(e.target.value))}
                        className="bg-[#222] border border-[#333] text-white px-1.5 py-1 text-[10px] rounded font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#FF5722] hover:bg-[#FF6E40] text-black font-bold uppercase font-mono py-1.5 rounded text-xs transition"
                >
                  Generate Core Sample
                </button>
              </form>
            )}

            <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
              {Object.keys(samplesData).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveSample(key)}
                  className={`w-full flex justify-between items-center p-3 rounded border text-left font-mono text-xs transition-all ${activeSample === key ? 'bg-[#FF5722]/10 border-[#FF5722] text-white' : 'bg-black/20 border-[#222] text-[#888] hover:border-[#333]'}`}
                >
                  <div>
                    <div className="font-bold">{key}</div>
                    <div className="text-[10px] text-[#555] italic">{samplesData[key].name}</div>
                  </div>
                  <div className="text-[#FF5722] font-semibold">{samplesData[key].depth}m</div>
                </button>
              ))}
            </div>
          </div>

          {/* ACID REACTION CHAMBER SOLVER */}
          <div className="geo-card block bg-[#111]/40">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#FF5722] mb-3 flex items-center gap-2">
              <FlaskConical size={12} />
              Acid Digest Solver
            </h3>
            
            <div className="space-y-4">
              {/* Solvent Tabs */}
              <div>
                <span className="text-[9px] font-mono text-gray-400 uppercase block mb-1.5">Solvent Chemical Digestant</span>
                <div className="grid grid-cols-4 gap-1">
                  {["HCl", "HNO3", "Aqua Regia", "HF"].map((acid) => (
                    <button
                      key={acid}
                      type="button"
                      onClick={() => setAcidType(acid)}
                      className={`text-[9px] font-mono py-1 rounded border text-center transition ${acidType === acid ? "bg-[#FF5722] text-black border-[#FF5722] font-bold" : "bg-black/40 text-gray-400 border-[#222] hover:border-[#333]"}`}
                    >
                      {acid}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Acid Solution pH</span>
                  <span className="text-[#FF5722] font-bold">pH {acidInflow}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="7" 
                  step="0.1"
                  value={acidInflow} 
                  onChange={(e) => setAcidInflow(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded"
                />
              </div>

              <div className="space-y-1.5 font-mono text-[10px] text-[#888] bg-black/40 border border-[#222] p-2.5 rounded">
                <div className="flex justify-between border-b border-[#222] pb-1">
                  <span>SOLVENT:</span>
                  <span className="text-white font-bold">{acidType} Buffer</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-1">
                  <span>SOLUBILITY YIELD:</span>
                  <span className="text-green-400 font-bold">{calculatedLeachIndex}%</span>
                </div>
                <div className="flex justify-between">
                  <span>DESORPTION POTENTIAL:</span>
                  <span className={calculatedLeachIndex > 65 ? "text-red-400 animate-pulse font-bold" : "text-gray-400"}>
                    {calculatedLeachIndex > 80 ? "CRITICAL" : calculatedLeachIndex > 50 ? "MODERATE" : "STABLE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive Ternary lithium classification diagram (Quartz-Feldspar-Lithic) */}
        <div className="col-span-8 grid grid-cols-2 gap-6">
        {dimensionMode === '3D' && <div className="fixed inset-0 z-50 md:left-56 top-12 bg-black flex p-6"><Fallback3D /></div>}

          {/* Triangular Ternary Diagram Frame */}
          <div className="geo-card bg-black flex flex-col items-center">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-green-500 mb-4 text-left w-full">
              QFL MINERAL CLASSIFICATION TRIANGLE
            </h3>
            
            <svg viewBox="0 0 240 210" className="w-full max-w-[280px] bg-black/40 border border-[#222] p-2 rounded">
              {/* Triangular Outer Border */}
              <polygon points="120,20 20,185 220,185" fill="none" stroke="#444" strokeWidth="1.5" />
              
              {/* Interior grid lines representing 20% spacings */}
              <line x1="120" y1="20" x2="20" y2="185" stroke="#222" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="120" y1="20" x2="220" y2="185" stroke="#222" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="185" x2="220" y2="185" stroke="#222" strokeWidth="1" strokeDasharray="3 3" />

              {/* Grid guide for quartz, feldspar, lithic divisions */}
              <line x1="70" y1="102.5" x2="170" y2="102.5" stroke="#333" strokeWidth="0.8" />
              <line x1="120" y1="185" x2="120" y2="20" stroke="#333" strokeWidth="0.8" />

              {/* Apex Labels */}
              <text x="120" y="14" fill="#ff5722" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">QUARTZ (SiO2)</text>
              <text x="14" y="196" fill="#00b4ff" fontSize="9" fontFamily="monospace" textAnchor="start" fontWeight="bold">FELDSPAR (Al)</text>
              <text x="226" y="196" fill="#ff9900" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">LITHIC (Fe+Mg)</text>

              {/* Shaded boundaries / Zone labels inside SVG */}
              <text x="120" y="70" fill="#333" fontSize="7" fontFamily="monospace" textAnchor="middle">Quartzose Arena</text>
              <text x="75" y="145" fill="#333" fontSize="7" fontFamily="monospace" textAnchor="middle">Arkose</text>
              <text x="165" y="145" fill="#333" fontSize="7" fontFamily="monospace" textAnchor="middle">Wacke</text>

              {/* Target Chemical Point of Core Sample */}
              <circle cx={pointXY.x} cy={pointXY.y} r="5" fill="#FF5722" stroke="#fff" strokeWidth="1.5" />
              
              {/* Highlight cross lines */}
              <line x1={pointXY.x - 8} y1={pointXY.y} x2={pointXY.x + 8} y2={pointXY.y} stroke="#fff" strokeWidth="0.8" />
              <line x1={pointXY.x} y1={pointXY.y - 8} x2={pointXY.x} y2={pointXY.y + 8} stroke="#fff" strokeWidth="0.8" />
            </svg>

            {/* Classification readout card */}
            <div className="w-full bg-[#111] p-3 border border-[#222] rounded mt-4">
              <div className="text-[10px] font-mono text-[#555] uppercase">Normalized QFL Lithology Model</div>
              <div className="text-xs font-mono font-bold text-white mt-1">
                {getSubsurfaceClassification()}
              </div>
              <div className="grid grid-cols-3 gap-1 mt-3 text-[10px] font-mono text-center">
                <div className="bg-black py-1 rounded text-orange-400">Q: {qPct.toFixed(1)}%</div>
                <div className="bg-black py-1 rounded text-blue-400">F: {fPct.toFixed(1)}%</div>
                <div className="bg-black py-1 rounded text-amber-500">L: {lPct.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* RARE EARTHS CHROMATOGRAPHY GRAPH PROFILE */}
          <div className="geo-card flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2 border-b border-[#222] pb-2">
                <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-orange-500">
                  Rare Earth Mass Spectrogram
                </h3>
                <span className="text-[9px] text-[#555] font-mono">ICP-MS PROFILE</span>
              </div>
              <p className="text-[11px] text-[#888] leading-tight mb-3">
                Trace element rare-earth distribution in ppm for active specimen: <span className="text-white font-bold">{activeSample}</span>.
              </p>
            </div>

            {/* Recharts BarChart plotting Nd, Sm, Eu, Gd, Tb, Dy in ppm */}
            <div className="h-40 w-full bg-black/30 rounded border border-[#222]/60 p-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.rareEarths} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="element" stroke="#555" fontSize={9} tickLine={false} />
                  <YAxis stroke="#555" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }} 
                    labelStyle={{ color: "#FF5722", fontFamily: "monospace", fontSize: "10px" }}
                    itemStyle={{ color: "#fff", fontFamily: "monospace", fontSize: "10px" }}
                  />
                  <Bar dataKey="ppm" fill="#FF5722" radius={[2, 2, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1 text-[9px] font-mono text-center text-gray-500 bg-black/20 p-1.5 rounded">
              <div>∑ REE: {currentData.rareEarths.reduce((acc, c) => acc + c.ppm, 0)} ppm</div>
              <div>Light REE: {currentData.rareEarths.slice(0, 3).reduce((acc, c) => acc + c.ppm, 0)} ppm</div>
              <div>Heavy REE: {currentData.rareEarths.slice(3).reduce((acc, c) => acc + c.ppm, 0)} ppm</div>
            </div>
          </div>

          {/* Standard Geochem Line Graph Panel */}
          <div className="col-span-2 geo-card flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-2">
                <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888]">pH Degradation vs Sulfate/Chloride Concentration</h3>
                <span className="text-[10px] text-[#FF5722] font-mono">XRF MASS SPEC</span>
              </div>
              <p className="text-[11px] text-[#555] leading-relaxed mb-4">
                Tracking pH degradation against sulfate and chloride concentration spikes across varying depth horizons.
              </p>
            </div>

            <div className="h-44 w-full">
              <DebugDump data={chartData} />
              <DynamicChart data={chartData} type="line" moduleType="geochem" />
            </div>
            <p className="text-[9px] text-[#555] mt-4 text-right font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
