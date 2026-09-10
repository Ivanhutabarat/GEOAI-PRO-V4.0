import React, { useState, useMemo, useEffect } from 'react';
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

export default function ElectricalEMModule() {
  const { activeFileName, dataDimensions } = useGlobalGeoContext();
  const [currentInjection, setCurrentInjection] = useState<number>(500); // mx
  const [frequency, setFrequency] = useState<number>(32); // Hz
  const [electrodeSpacing, setElectrodeSpacing] = useState<number>(10); // m

  const [viewMode, setViewMode] = useState<'1D' | '2D' | '3D'>('2D');

  // Synchronize incoming data dimension format autonomously to default viewMode
  useEffect(() => {
    if (dataDimensions === '1D' || dataDimensions === '2D' || dataDimensions === '3D') {
        setViewMode(dataDimensions);
    }
  }, [dataDimensions]);

  const [soundingData, setSoundingData] = useState([
    { depth: 1.5, resistivity: 145, chargeability: 6.9 },
    { depth: 3, resistivity: 120, chargeability: 8.3 },
    { depth: 5, resistivity: 75, chargeability: 13.3 },
    { depth: 10, resistivity: 38, chargeability: 26.3 },
    { depth: 20, resistivity: 55, chargeability: 18.2 },
    { depth: 40, resistivity: 110, chargeability: 9.1 },
    { depth: 80, resistivity: 240, chargeability: 4.2 },
    { depth: 150, resistivity: 410, chargeability: 2.4 },
  ]);

  const [resistivityMatrix, setResistivityMatrix] = useState([
    [120, 115, 130, 140, 145, 150, 240, 290, 310, 180, 140, 120],
    [105, 95, 80, 55, 42, 35, 65, 110, 195, 230, 210, 140],
    [98, 85, 45, 12, 8, 14, 25, 68, 140, 180, 190, 150],
    [115, 98, 70, 35, 15, 22, 48, 92, 160, 210, 240, 180],
    [145, 180, 220, 240, 280, 310, 340, 390, 420, 380, 310, 240]
  ]);

  const gridColumns = 12;
  const gridRows = 5;

  const presetSoundingLog = `# Schlumberger Resistivity Sounding Log\n1.5,   210,   4.7\n3.0,   185,   5.4\n5.0,   130,   7.6\n10.0,  50,    22.0\n20.0,  25,    25.0\n40.0,  70,    14.2\n80.0,  190,   5.2\n150.0, 330,   3.0`;

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
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={soundingData}>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
