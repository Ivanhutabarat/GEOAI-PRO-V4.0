import { processIncomingData } from '../Shared/SwarmRoom';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useEffect, useMemo } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { normalizeRawData } from '../../../../lib/dynamicParser';
import { 
  Activity, 
  Settings2, 
  Download, 
  BarChart, 
  Ruler, 
  Database,
  Search,
  Filter,
  Maximize2,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { wellLoggingPayload } from '../../../../data/mocks/wellLogging';

const CURVE_COLORS = ['#f97316', '#22c55e', '#0ea5e9', '#eab308', '#a855f7', '#9ca3af'];

export default function WellLoggingModule() {

  const { apiMode, dimensionMode } = useAppContext();
  
  const { globalData, rawPayloads, activeFileName } = useGlobalGeoContext();
  const [visibleCurves, setVisibleCurves] = useState({ gr: true, res: true, rhob: true, nphi: true, dt: true, cal: true });
  
  // Use isolated mock
  const chartData = useMemo(() => {
    if (rawPayloads && rawPayloads.wellLoggingData) {
      const result = processIncomingData(rawPayloads.wellLoggingData);
      if (result && result.data && result.data.length > 0) {
        return result.data;
      }
    }
    return (globalData.wellLoggingData && globalData.wellLoggingData.length > 0) 
      ? globalData.wellLoggingData 
      : wellLoggingPayload;
  }, [globalData.wellLoggingData, rawPayloads?.wellLoggingData]);
  
  const depthKeyObj = useMemo(() => normalizeRawData(chartData, 'well_logging'), [chartData]);
  const depthKey = depthKeyObj.xAxisKey;
  
  const firstRow = chartData && chartData.length > 0 ? chartData[0] : {};
  const availableKeys = Object.keys(firstRow).filter(key => key !== depthKey); 
  const activeCurves = availableKeys.slice(0, 6);

  let minDepth = 0;
  let maxDepth = 0;
  if (chartData && chartData.length > 0 && depthKey) {
    const depths = chartData.map((d: any) => Number(d[depthKey])).filter((n: number) => !isNaN(n));
    if (depths.length > 0) {
      minDepth = Math.min(...depths);
      maxDepth = Math.max(...depths);
    }
  }

  useEffect(() => {
    // REMOVED MOCK UPDATE
  }, [activeFileName]);

  // Dynamic calculations
  const { sandstonePct, carbonatePct, shalePct, crossoverDetected } = useMemo(() => {
    let litho = { sandstone: 0, shale: 0, carbonate: 0 };
    let crossover = false;

    if (chartData && chartData.length > 0) {
      const grKey = availableKeys.find(k => k.toLowerCase().includes('gamma') || k.toLowerCase() === 'gr');
      if (grKey) {
        let sand = 0, shale = 0, carb = 0;
        chartData.forEach(row => {
          const val = Number(row[grKey]);
          if (!isNaN(val)) {
            if (val > 75) shale++;
            else if (val > 40) sand++;
            else carb++;
          }
        });
        const total = sand + shale + carb;
        if (total > 0) {
          litho.sandstone = Math.round((sand / total) * 100);
          litho.shale = Math.round((shale / total) * 100);
          litho.carbonate = Math.round((carb / total) * 100);
        }
      }

      chartData.forEach(row => {
        if (row.res !== undefined && row.rhob !== undefined) {
          if (row.res > 100 && row.rhob < 2.2) {
            crossover = true;
          }
        }
      });
    }

    return {
      sandstonePct: litho.sandstone,
      carbonatePct: litho.carbonate,
      shalePct: litho.shale,
      crossoverDetected: crossover
    };
  }, [chartData, availableKeys]);

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] border border-[#333333] rounded-lg overflow-hidden">
        {/* Module Toolbar */}
        <div className="h-12 border-b border-[#333333] flex items-center justify-between px-4 bg-[#222222]">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#03A9F4]" />
                    <span className="text-xs font-bold uppercase font-mono tracking-tight text-white">{activeFileName} // DYNAMIC VIEWER</span>
                </div>
                <div className="h-4 w-px bg-[#333333]"></div>
                <div className="flex items-center gap-2 text-[10px] text-[#888888]">
                    <span className="bg-[#03A9F4] px-1.5 py-0.5 rounded text-white font-bold">NORMALIZED</span>
                    <span>MD: AUTO // STEP: AUTO</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#888888] hover:text-white">
                    <Filter size={12} />
                    Auto-Alias
                </button>
                <div className="h-4 w-px bg-[#333333]"></div>
                <button className="p-2 hover:bg-white/5 text-[#888888] rounded"><Download size={14} /></button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Log Track Selector */}
            <div className="w-48 border-r border-[#333333] p-4 bg-[#111111]/50 space-y-4">
                <UniversalIngestionPort 
                  moduleName="wellLoggingData" 
                  contextKey="wellLoggingData" 
                  onParsed={(p) => {}} 
                  parserType="matrix"
                  presetLog={`Depth_m,GR_API,RES_Ohmm,RHOB_gcm3,NPHI_v_v,DT_us_ft,CAL_in\n1000,85,2.1,2.65,0.15,65,8.5\n1001,84,2.2,2.64,0.14,64,8.5\n1002,38,105,2.15,0.05,55,8.5\n1003,35,110,2.1,0.06,54,8.5\n1004,36,90,2.2,0.05,55,8.5\n1005,90,1.8,2.7,0.18,70,8.5`}
                />
                
                <h4 className="text-[10px] font-bold uppercase text-[#555555] tracking-widest mb-4 mt-6">Available Curves</h4>
                <div className="space-y-1">
                    <CurveToggle label="Gamma Ray (GR)" color="#FF5722" active={visibleCurves.gr} onClick={() => setVisibleCurves(v => ({ ...v, gr: !v.gr }))} />
                    <CurveToggle label="Resistivity (RES)" color="#4CAF50" active={visibleCurves.res} onClick={() => setVisibleCurves(v => ({ ...v, res: !v.res }))} />
                    <CurveToggle label="Density (RHOB)" color="#03A9F4" active={visibleCurves.rhob} onClick={() => setVisibleCurves(v => ({ ...v, rhob: !v.rhob }))} />
                    <CurveToggle label="Neutron (NPHI)" color="#FFD700" active={visibleCurves.nphi} onClick={() => setVisibleCurves(v => ({ ...v, nphi: !v.nphi }))} />
                    <CurveToggle label="Sonic (DT)" color="#9C27B0" active={visibleCurves.dt} onClick={() => setVisibleCurves(v => ({ ...v, dt: !v.dt }))} />
                    <CurveToggle label="Caliper (CAL)" color="#9E9E9E" active={visibleCurves.cal} onClick={() => setVisibleCurves(v => ({ ...v, cal: !v.cal }))} />
                </div>

                <div className="pt-6">
                    <h4 className="text-[10px] font-bold uppercase text-[#555555] tracking-widest mb-4">Depth Control</h4>
                    <div className="space-y-4">
                        <div className="bg-black/20 border border-[#333333] p-2 rounded">
                            <span className="text-[10px] text-[#555555] block mb-1">Total Depth Span</span>
                            <span className="text-xl font-mono font-bold text-white tracking-tighter">
                                {minDepth}m - {maxDepth}m
                            </span>
                        </div>
                        <input type="range" className="w-full accent-[#03A9F4]" />
                    </div>
                </div>
            </div>

            {/* Log Display */}
            {dimensionMode !== '1D' && chartData.length > 0 ? (
                 <div className="flex-1 bg-black p-4 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <span className="text-xl font-bold font-mono text-[#03A9F4] animate-pulse">Auto-Detected {dimensionMode} Data Structure</span>
                    <span className="text-sm font-mono text-[#888]">Dynamically splitting view for multi-well spatial overlay analysis...</span>
                    <div className="w-full h-[600px] overflow-x-auto mt-4 rounded border border-[#333]">
                      <div className="grid grid-cols-6 gap-1 h-full min-w-[800px] p-1 bg-black/40">
                        {activeCurves.map((curve, idx) => (
                          <div key={curve} className="h-full border border-[#444] bg-black/60 rounded flex flex-col p-1">
                            <div className="text-center text-[10px] font-bold uppercase truncate pb-1" style={{ color: CURVE_COLORS[idx % CURVE_COLORS.length] }}>
                              {curve.replace(/_/g, ' ')}
                            </div>
                            <ResponsiveContainer height="100%" width="100%">
                              <LineChart data={chartData} layout="vertical" margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                <XAxis dataKey={curve} type="number" orientation="top" stroke={CURVE_COLORS[idx % CURVE_COLORS.length]} tick={{fontSize: 9}} domain={['auto', 'auto']} />
                                <YAxis dataKey={depthKey} type="number" stroke="#666" reversed={true} domain={['dataMin', 'dataMax']} tick={{fontSize: 9}} hide={idx > 0} width={idx === 0 ? 40 : 0}/>
                                <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', fontSize: '10px'}} />
                                <Line type="linear" dataKey={curve} stroke={CURVE_COLORS[idx % CURVE_COLORS.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="absolute bottom-4 right-4 text-[9px] text-[#555] font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>
                 </div>
            ) : (
                <div className="flex-1 bg-black overflow-hidden relative border-r border-[#333] p-1">
                    <div className="w-full h-[600px] overflow-x-auto mt-4 rounded border border-[#333]">
                      <div className="grid grid-cols-6 gap-1 h-full min-w-[800px] p-1 bg-black/40">
                        {activeCurves.map((curve, idx) => (
                          <div key={curve} className="h-full border border-[#444] bg-black/60 rounded flex flex-col p-1">
                            <div className="text-center text-[10px] font-bold uppercase truncate pb-1" style={{ color: CURVE_COLORS[idx % CURVE_COLORS.length] }}>
                              {curve.replace(/_/g, ' ')}
                            </div>
                            <ResponsiveContainer height="100%" width="100%">
                              <LineChart data={chartData} layout="vertical" margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                <XAxis dataKey={curve} type="number" orientation="top" stroke={CURVE_COLORS[idx % CURVE_COLORS.length]} tick={{fontSize: 9}} domain={['auto', 'auto']} />
                                <YAxis dataKey={depthKey} type="number" stroke="#666" reversed={true} domain={['dataMin', 'dataMax']} tick={{fontSize: 9}} hide={idx > 0} width={idx === 0 ? 40 : 0}/>
                                <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', fontSize: '10px'}} />
                                <Line type="linear" dataKey={curve} stroke={CURVE_COLORS[idx % CURVE_COLORS.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="absolute bottom-4 right-4 text-[9px] text-[#555] font-mono z-50">{import.meta.env.VITE_CHART_WATERMARK}</p>
                </div>
            )}

            {/* Interpretation Pane */}
            <div className="w-64 border-l border-[#333333] p-4 bg-[#111111]/50 space-y-4">
                <h4 className="text-[10px] font-bold uppercase text-[#888888] mb-4 flex items-center gap-2">
                    <BarChart size={12} className="text-[#03A9F4]" />
                    Auto-Lithology
                </h4>
                <div className="space-y-2">
                    <LithologyZone color="bg-yellow-500" label="Sandstone" percentage={sandstonePct} />
                    <LithologyZone color="bg-gray-500" label="Shale" percentage={shalePct} />
                    <LithologyZone color="bg-blue-300" label="Carbonate" percentage={carbonatePct} />
                </div>

                <div className="pt-6">
                    <h4 className="text-[10px] font-bold uppercase text-[#888888] mb-4 flex items-center gap-2">
                        <Search size={12} className="text-[#03A9F4]" />
                        Fluid Identification
                    </h4>
                    {chartData.length === 0 ? (
                        <div className="p-3 bg-neutral-900 border border-[#333] rounded">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">NO DATA</p>
                            <p className="text-[11px] text-[#888888] leading-tight">[STANDBY - IDLE STATE]</p>
                        </div>
                    ) : crossoverDetected ? (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded animate-pulse">
                            <p className="text-[10px] text-red-500 font-bold uppercase mb-1">CROSSOVER DETECTED</p>
                            <p className="text-[11px] text-[#FF5722] leading-tight">Potential HYDROCARBON Show Identified at Target Zone!</p>
                        </div>
                    ) : (
                        <div className="p-3 bg-neutral-900 border border-[#333] rounded">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">No crossover</p>
                            <p className="text-[11px] text-[#888888] leading-tight">Water saturation dominant. No obvious hydrocarbon zones detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

function CurveToggle({ label, color, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between p-2 rounded text-[11px] font-bold transition-all border",
                active ? "bg-[#222] border-[#333] text-white opacity-100" : "border-transparent text-[#555] hover:text-[#888] opacity-50"
            )}
        >
            <div className="flex items-center gap-2">
                <div className="w-1 h-3 rounded-full" style={{ backgroundColor: active ? color : '#555' }}></div>
                <span>{label}</span>
            </div>
            {active && <div className="w-1 h-1 rounded-full bg-[#03A9F4]" />}
        </button>
    );
}

function LithologyZone({ color, label, percentage }: any) {
    return (
        <div className="p-3 bg-black/20 border border-[#222] rounded flex items-center gap-3">
            <div className={cn("w-1.5 h-8 rounded-full", color)}></div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-bold text-[#AAAAAA]">{label}</span>
                    <span className="text-[10px] text-green-500 font-mono">{percentage}%</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-1 bg-[#222] mt-1 rounded-full overflow-hidden">
                    <div className={cn("h-full", color)} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    );
}

