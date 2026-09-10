import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useMemo, useEffect } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { 
  Zap, 
  Activity, 
  Sliders, 
  RefreshCw, 
  BatteryCharging, 
  CheckCircle2,
  Upload,
  FileSpreadsheet,
  Database,
  Layers,
  Box,
  LineChart as LineChartIcon
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { electricalEmPayload } from '../../../../data/mocks/electricalEm';

export default function ElectricalEMModule() {

  const { apiMode, dimensionMode } = useAppContext();
  

  const { globalData, rawPayloads,   activeFileName } = useGlobalGeoContext();
  const [currentInjection, setCurrentInjection] = useState<number>(500); // mx
  const [frequency, setFrequency] = useState<number>(32); // Hz
  const [electrodeSpacing, setElectrodeSpacing] = useState<number>(10); // m

  const [viewMode, setViewMode] = useState<'1D' | '2D' | '3D'>('2D');

  // Synchronize incoming data dimension format autonomously to default viewMode
  useEffect(() => {
    if (dimensionMode === '1D' || dimensionMode === '2D' || dimensionMode === '3D') {
        setViewMode(dimensionMode);
    }
  }, [dimensionMode]);

  const [soundingData, setSoundingData] = useState<any[]>([]);
  const [resistivityMatrix, setResistivityMatrix] = useState<number[][]>([]);

  useEffect(() => {
    if (!globalData.electricalData || globalData.electricalData.length === 0) {
      setSoundingData(electricalEmPayload);
    } else {
      setSoundingData(globalData.electricalData);
    }
  }, [activeFileName, electrodeSpacing, currentInjection]);

  // Dynamic 2D/3D pseudo-section inversion and resistivity simulator
  useEffect(() => {
    const baseMatrix: number[][] = [];
    for (let r = 0; r < 5; r++) {
      const row: number[] = [];
      for (let c = 0; c < 12; c++) {
        // Base geologic structure: shallower beds have lower resistivity, deeper bedrock has higher resistivity
        let baseRes = 90 + r * 30 - (c * 1.5);
        
        // High frequency limits electromagnetic signal depth (attenuates deep signals)
        const depthFactor = Math.exp(-r * (frequency / 35));
        
        // High current injection excites the deeper zones (increases amplitude of features)
        const injectionFactor = currentInjection / 500;
        
        // Water-bearing fault (conductive anomaly / low resistivity) at cols 3-5, depths 1-3
        if (c >= 3 && c <= 5 && r >= 1 && r <= 3) {
          baseRes = Math.max(12, baseRes - 75 * depthFactor * injectionFactor);
        }
        
        // Dense granite bedrock dome (high resistivity anomaly) at cols 7-9, depth 3-4
        if (c >= 7 && c <= 9 && r >= 2) {
          baseRes = baseRes + 160 * (electrodeSpacing / 10) * injectionFactor;
        }

        const noise = Math.sin((c + r) * 0.9) * 8;
        const finalVal = Math.round(Math.max(8, Math.min(650, baseRes + noise)));
        row.push(finalVal);
      }
      baseMatrix.push(row);
    }
    setResistivityMatrix(baseMatrix);
  }, [currentInjection, frequency, electrodeSpacing]);

  const gridColumns = 12;
  const gridRows = 5;

  const presetSoundingLog = electricalEmPayload.slice(0,10).map(d => `${d.profile_m},${d.apparent_resistivity_ohm_m},${d.chargeability_mv_v}`).join("\n");

  const presetMatrixLog = `# Bedrock Pseudo-Section Target 2D\n150, 142, 138, 144, 155, 180, 290, 310, 340, 210, 160, 135\n120, 110, 95,  72,  58,  38,  82,  134, 220, 260, 230, 165\n110, 98,  62,  18,  12,  28,  42,  88,  162, 210, 220, 180\n130, 115, 85,  48,  32,  45,  72,  115, 190, 240, 270, 210\n160, 195, 240, 270, 310, 350, 380, 420, 450, 410, 340, 280`;

  const getCellChargeability = (val: number) => {
    if (val < 50) return 25; 
    if (val > 100) return 5; 
    return 15;
  };

  const getCellColor = (res: number, charge: number) => {
    if (charge > 20) return '#EF4444'; // Red for high chargeability
    if (res < 20) return '#3B82F6'; // Blue for low resistivity
    if (res > 100) return '#EAB308'; // Yellow for high resistivity bedrock
    return '#10B981'; // Green generic
  };

  const handleParsedData = (parsedData: any[]) => {
    const parsedSoundings: any[] = [];
    const parsedMatrix: number[][] = [];

    for (let parts of parsedData) {
      if (parts.length >= 12) {
        parsedMatrix.push(parts.slice(0, 12).map(Number));
      } else if (parts.length >= 2) {
        parsedSoundings.push({
          depth: Number(parts[0]) || 0,
          resistivity: Number(parts[1]) || 0,
          chargeability: Number(parts[2] || 0)
        });
      }
    }

    if (parsedSoundings.length > 0) setSoundingData(parsedSoundings);
    if (parsedMatrix.length > 0) {
      const formattedMatrix = parsedMatrix.slice(0, 5).map(row => {
        if (row.length < 12) return [...row, ...Array(12 - row.length).fill(100)];
        return row;
      });
      while (formattedMatrix.length < 5) formattedMatrix.push(Array(12).fill(100));
      setResistivityMatrix(formattedMatrix);
    }
  };

  const arrayGeometryText = electrodeSpacing < 15 ? "WENNER D-ALPHA" : "SCHLUMBERGER RECIROCAL";
  const contactImpedance = 150 - (currentInjection / 5);
  
  const avgChargeability = useMemo(() => {
    if (soundingData.length === 0) return 0;
    return soundingData.reduce((acc, curr) => acc + (curr.chargeability || 0), 0) / soundingData.length;
  }, [soundingData]);
  
  const ipPhaseCharge = -(avgChargeability * 0.24);
  const receiverVPP = currentInjection * electrodeSpacing * 0.01;

  return (
    <div className="space-y-6 md:p-1 max-w-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Zap className="text-[#FF5722]" />
            Electrical & EM Resistivity (1D/2D/3D)
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">{activeFileName} // Dynamic Matrix Profiler // Live Transmit</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="font-mono">NVIDIA A100 // ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          
          <UniversalIngestionPort 
            moduleName="electricalData"
            contextKey="electricalData"
            onParsed={handleParsedData}
            presetLog={presetSoundingLog}
            presetMatrix={presetMatrixLog}
          />

          <div className="geo-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888]">IP Transmitter Setup</h3>
              <BatteryCharging size={16} className="text-[#FF5722]" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Current Injection</span>
                  <span className="text-[#FF5722]">{currentInjection} mA</span>
                </div>
                <input 
                  type="range" min="50" max="2000" step="50"
                  value={currentInjection} 
                  onChange={(e) => setCurrentInjection(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded text-[#FF5722]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>EM Operating Frequency</span>
                  <span className="text-[#FF5722]">{frequency} Hz</span>
                </div>
                <input 
                  type="range" min="0.1" max="128" step="0.5"
                  value={frequency} 
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded text-[#FF5722]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Unit Electrode Spacing (a)</span>
                  <span className="text-[#FF5722]">{electrodeSpacing} m</span>
                </div>
                <input 
                  type="range" min="1" max="50" step="1"
                  value={electrodeSpacing} 
                  onChange={(e) => setElectrodeSpacing(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded text-[#FF5722]"
                />
              </div>
            </div>
          </div>

          <div className="geo-card block">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">Electrode Array Status</h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">ARRAY GEOMETRY</span>
                <span className="text-white font-bold">{arrayGeometryText}</span>
              </div>
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">CONTACT IMPEDANCE</span>
                <span className="text-green-500">{contactImpedance.toFixed(1)} Ω (OPTIMAL)</span>
              </div>
              <div className="flex justify-between border-b border-[#222] pb-1">
                <span className="text-[#555]">IP PHASE CHARGE</span>
                <span className="text-white">{ipPhaseCharge.toFixed(2)} mrad</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-[#555]">RECEIVER V_PP</span>
                <span className="text-yellow-500">{receiverVPP.toFixed(2)} Volts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-8 flex flex-col space-y-4">
          
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('1D')} 
              className={`flex-1 p-3 text-xs font-mono font-bold uppercase rounded flex items-center justify-center gap-2 border transition-all duration-200 ${viewMode === '1D' ? 'bg-[#222] text-[#FF5722] border-[#FF5722]' : 'bg-[#111] text-[#777] border-[#333] hover:text-white'}`}
            >
              <LineChartIcon size={16} /> 1D VES Curve
            </button>
            <button 
              onClick={() => setViewMode('2D')} 
              className={`flex-1 p-3 text-xs font-mono font-bold uppercase rounded flex items-center justify-center gap-2 border transition-all duration-200 ${viewMode === '2D' ? 'bg-[#222] text-[#FF5722] border-[#FF5722]' : 'bg-[#111] text-[#777] border-[#333] hover:text-white'}`}
            >
              <Layers size={16} /> 2D Pseudo-section
            </button>
            <button 
              onClick={() => setViewMode('3D')} 
              className={`flex-1 p-3 text-xs font-mono font-bold uppercase rounded flex items-center justify-center gap-2 border transition-all duration-200 ${viewMode === '3D' ? 'bg-[#222] text-[#FF5722] border-[#FF5722]' : 'bg-[#111] text-[#777] border-[#333] hover:text-white'}`}
            >
              <Box size={16} /> 3D Block Grid
            </button>
          </div>

          <div className="flex-1 geo-card flex flex-col relative min-h-[400px]">
            {viewMode === '1D' && (
              <div className="flex-1 flex flex-col">
                <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4">Schlumberger VES sounding profile</h3>
                <div className="flex-1 w-full min-h-[300px]">
                  <DebugDump data={soundingData} />
<ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forceMapData(soundingData)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="depth" label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 9 }} stroke="#555" fontSize={10} />
                      <YAxis yAxisId="left" scale="log" domain={['auto', 'auto']} label={{ value: 'Apparent Resistivity (Ω-m)', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 9 }} stroke="#555" fontSize={10} />
                      <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} label={{ value: 'Chargeability', angle: 90, position: 'insideRight', fill: '#555', fontSize: 9 }} stroke="#555" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                      <Legend verticalAlign="top" height={24} />
                      <Line yAxisId="left" type="linear" dataKey="resistivity" stroke="#FF5722" dot={true} activeDot={{ r: 6 }} name="Apparent Resistivity (Ω-m)" strokeWidth={2} />
                      <Line yAxisId="right" type="linear" dataKey="chargeability" stroke="#00B4FF" dot={true} activeDot={{ r: 6 }} name="Chargeability (mV/V)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[9px] text-[#555] mt-4 text-right">{import.meta.env.VITE_CHART_WATERMARK}</p>
              </div>
            )}

            {viewMode === '2D' && (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    Inverted Bedrock Resistivity Pseudo-Section
                  </h3>
                  <div className="flex gap-2 text-[9px] font-mono">
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#EF4444] rounded-sm"></span> High IP</div>
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#3B82F6] rounded-sm"></span> Low Res</div>
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#EAB308] rounded-sm"></span> High Res</div>
                  </div>
                </div>

                <div className="w-full flex-1 bg-[#111111] p-4 border border-[#222] rounded overflow-hidden flex flex-col justify-center">
                  <div className="grid grid-cols-12 gap-1 bg-[#151515] p-2 rounded w-full flex-1 max-h-[300px]">
                    {resistivityMatrix.map((row, rIdx) => (
                      row.map((val, cIdx) => {
                        const charge = getCellChargeability(val);
                        return (
                          <div 
                            key={`${rIdx}-${cIdx}`}
                            style={{ backgroundColor: getCellColor(val, charge) }}
                            className="w-full h-full relative rounded-sm group cursor-pointer transition-transform hover:scale-[1.03]"
                          >
                            <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 bg-black border border-[#333] text-[9px] text-[#fff] px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-30 font-mono">
                              D:{rIdx*2}m, V:{val}Ωm, IP:{charge}
                            </span>
                          </div>
                      )})
                    ))}
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-[#555] mt-2 px-1">
                    <span>CHAINAGE 0.0m</span>
                    <span>CENTRAL SCAN AREA</span>
                    <span>CHAINAGE {gridColumns * electrodeSpacing}m</span>
                  </div>
                </div>
                <p className="text-[9px] text-[#555] mt-4 text-right">{import.meta.env.VITE_CHART_WATERMARK}</p>
              </div>
            )}

            {viewMode === '3D' && (
              <div className="flex-1 flex flex-col justify-center items-center overflow-hidden bg-[#0a0a0a] rounded border border-[#222] relative min-h-[400px]">
                <h3 className="absolute top-4 left-4 text-xs uppercase font-mono font-bold tracking-widest text-[#888] z-30">3D Voxel Inversion Cube</h3>
                
                <div className="w-full h-full flex items-center justify-center pt-10" style={{ perspective: '1000px' }}>
                  <div className="relative" style={{ transform: 'rotateX(60deg) rotateZ(-45deg)', transformStyle: 'preserve-3d', width: '240px', height: '100px' }}>
                    {resistivityMatrix.map((row, r) => 
                      row.map((val, c) => {
                        const charge = getCellChargeability(val);
                        const boxColor = getCellColor(val, charge);
                        const zOffset = -r * 20; 
                        
                        return (
                          <div 
                            key={`3d-${r}-${c}`}
                            className="absolute border border-black/30 transition-all hover:scale-110 cursor-pointer group"
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: boxColor,
                              left: `${c * 20}px`,
                              top: `${r * 5}px`, 
                              transform: `translateZ(${zOffset}px)`,
                              opacity: val < 50 ? 0.3 : 0.9 
                            }}
                          >
                            <div className="hidden group-hover:block absolute -top-8 -left-8 bg-black text-white text-[10px] p-1 border border-gray-600 z-50 whitespace-nowrap font-mono rounded">
                               Res: {val} | IP: {charge}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                <p className="absolute bottom-4 right-4 text-[9px] text-[#555] z-30 font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
