import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useEffect } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { 
  Thermometer, 
  Activity, 
  Layers, 
  Filter, 
  Atom, 
  Download, 
  Cpu 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';

export default function GeochemModule() {

  const { apiMode, engine, dimensionMode } = useAppContext();
  

  const { globalData, rawPayloads,  activeFileName } = useGlobalGeoContext();
  const [activeSample, setActiveSample] = useState<string>("SMP-104");
  const [acidInflow, setAcidInflow] = useState<number>(3.5); // pH value
  const [elementalView, setElementalView] = useState<string>("oxides");

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

  const presetLog = `# Core Sample Oxide Table
# SampleID, Depth, SiO2, Al2O3, Fe2O3, MgO, CaO, Alkalies
SMP-108, 900, 38.4, 15.2, 18.3, 14.2, 12.1, 4.0
SMP-110, 1050, 41.2, 11.5, 16.4, 15.5, 10.4, 3.8`;

  const currentData = samplesData[activeSample];

  const [geochemData, setGeochemData] = useState<any[]>([]);

  useEffect(() => {
    // Check if we have global uploaded data
    if (globalData && globalData.geochemData && globalData.geochemData.length > 0) {
      setGeochemData(globalData.geochemData);
      return;
    }
    if (rawPayloads && rawPayloads.geochemData) {
      const result = processIncomingData(rawPayloads.geochemData);
      if (result && result.data && result.data.length > 0) {
        setGeochemData(result.data);
        return;
      }
    }

    // Otherwise, generate 10 depth levels around currentData.depth
    const sampleDepth = currentData?.depth || 500;
    const basePh = acidInflow; // use current pH slider value
    const depths = Array.from({ length: 10 }, (_, i) => {
      const depth = sampleDepth - 100 + i * 25;
      // Sulfate and chloride concentrations are inversely related to pH
      const sulfate = Math.round(150 + (7 - basePh) * 45 + Math.random() * 15);
      const chloride = Math.round(80 + (7 - basePh) * 25 + Math.random() * 10);
      const ph = Number((basePh + (i - 5) * 0.1 + Math.random() * 0.1).toFixed(2));
      return {
        depth,
        sulfate,
        chloride,
        ph: Math.min(7, Math.max(1, ph))
      };
    });
    setGeochemData(depths);
  }, [activeFileName, acidInflow, activeSample, globalData?.geochemData, rawPayloads?.geochemData, currentData]);

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
          <span className="font-mono">NVIDIA A100 // ACTIVE</span>
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
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">Core Core Samples</h3>
            <div className="space-y-3">
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

          <div className="geo-card block bg-[#111]/40">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">Acid Digest & Leach Index</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Solvent Acid PH</span>
                  <span className="text-[#FF5722]">pH {acidInflow}</span>
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

              <div className="space-y-2 font-mono text-[11px] text-[#888]">
                <div className="flex justify-between border-b border-[#222] pb-1">
                  <span>OXIDATION STATE</span>
                  <span>Fe2+ / Fe3+ BUFFER</span>
                </div>
                <div className="flex justify-between border-b border-[#222] pb-1">
                  <span>SOLUBILITY METRIC</span>
                  <span className="text-green-500">OPTIMAL RANGE</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span>CURRENT LIQUID LATENCY</span>
                  <span>14.2 µS/cm</span>
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
                <div className="bg-black py-1 rounded">Q: {qPct.toFixed(1)}%</div>
                <div className="bg-black py-1 rounded">F: {fPct.toFixed(1)}%</div>
                <div className="bg-black py-1 rounded">L: {lPct.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Rare earth chromatography graph profile */}
          <div className="geo-card flex flex-col justify-between">
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
              <DebugDump data={geochemData} />
<ResponsiveContainer width="100%" height="100%">
                <BarChart data={forceMapData(geochemData || [])}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="depth" stroke="#555" fontSize={10} label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 9 }} />
                  <YAxis yAxisId="left" stroke="#555" fontSize={10} label={{ value: 'Concentration (ppm)', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#555" fontSize={10} domain={[0, 14]} label={{ value: 'pH', angle: 90, position: 'insideRight', fill: '#555', fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                  <Legend verticalAlign="top" height={24} />
                  <Bar yAxisId="left" dataKey="sulfate" fill="#ff9900" name="Sulfate (ppm)" />
                  <Bar yAxisId="left" dataKey="chloride" fill="#00b4ff" name="Chloride (ppm)" />
                  <Line yAxisId="right" type="monotone" dataKey="ph" stroke="#FF5722" strokeWidth={3} dot={{ stroke: '#FF5722', strokeWidth: 2, r: 4 }} name="pH Level" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-[#555] mt-4 text-right font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
