import React, { useState, useEffect, useMemo } from 'react';
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
import ChartRenderer from './ChartRenderer';

export default function WellLoggingModule() {
  const { rawPayloads, activeFileName, dataDimensions } = useGlobalGeoContext();
  const [visibleCurves, setVisibleCurves] = useState({ gr: true, res: true, rhob: true, nphi: true, dt: true, cal: true });
  
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const raw = rawPayloads.wellLoggingData;
    if (!raw || !raw.trim()) {
      setChartData([]);
      return;
    }

    const lines = raw.split('\n');
    const parsedData: any[] = [];
    
    let hasHeader = false;
    let headerIndices: any = { depth: 0, gr: 1, res: 2, rhob: 3, nphi: 4, dt: 5, cal: 6 };

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#') || line.startsWith('~') || line.startsWith('//')) {
        continue;
      }
      
      const parts = line.split(/[,;\s\t]+/).filter(Boolean);
      
      if (!hasHeader && isNaN(Number(parts[0]))) {
        hasHeader = true;
        
        // Dynamically detect column indices from header
        const upperParts = parts.map(p => p.toUpperCase());
        headerIndices = {
            depth: upperParts.findIndex(p => p.includes('DEP') || p.includes('MD')),
            gr: upperParts.findIndex(p => p.includes('GR') || p.includes('GAMMA')),
            res: upperParts.findIndex(p => p.includes('RES') || p.includes('RT') || p.includes('ILD')),
            rhob: upperParts.findIndex(p => p.includes('RHOB') || p.includes('DEN')),
            nphi: upperParts.findIndex(p => p.includes('NPHI') || p.includes('NEU')),
            dt: upperParts.findIndex(p => p.includes('DT') || p.includes('SON')),
            cal: upperParts.findIndex(p => p.includes('CAL'))
        };
        
        // Fallback for missing standard names
        if (headerIndices.depth === -1) headerIndices.depth = 0;
        continue;
      }
      
      if (parts.length >= 2) {
        parsedData.push({
          depth: Number(parts[headerIndices.depth !== -1 ? headerIndices.depth : 0]),
          gr: headerIndices.gr !== -1 && parts[headerIndices.gr] ? Number(parts[headerIndices.gr]) : undefined,
          res: headerIndices.res !== -1 && parts[headerIndices.res] ? Number(parts[headerIndices.res]) : undefined,
          rhob: headerIndices.rhob !== -1 && parts[headerIndices.rhob] ? Number(parts[headerIndices.rhob]) : undefined,
          nphi: headerIndices.nphi !== -1 && parts[headerIndices.nphi] ? Number(parts[headerIndices.nphi]) : undefined,
          dt: headerIndices.dt !== -1 && parts[headerIndices.dt] ? Number(parts[headerIndices.dt]) : undefined,
          cal: headerIndices.cal !== -1 && parts[headerIndices.cal] ? Number(parts[headerIndices.cal]) : undefined
        });
      }
    }
    
    // Sort array by depth ensuring proper plotting
    parsedData.sort((a, b) => a.depth - b.depth);
    setChartData([...parsedData]);
  }, [rawPayloads.wellLoggingData]);

  // Dynamic calculations
  const { sandstonePct, carbonatePct, shalePct, crossoverDetected } = useMemo(() => {
    if (chartData.length === 0) {
      return { sandstonePct: 0, carbonatePct: 0, shalePct: 0, crossoverDetected: false };
    }

    let sandstoneCount = 0;
    let carbonateCount = 0;
    let shaleCount = 0;
    let crossover = false;
    let hasGrData = false;

    chartData.forEach(row => {
      if (row.gr !== undefined) {
          hasGrData = true;
          if (row.gr < 40) sandstoneCount++;
          else if (row.gr >= 40 && row.gr <= 75) carbonateCount++;
          else if (row.gr > 75) shaleCount++;
      }

      if (row.res !== undefined && row.rhob !== undefined) {
          if (row.res > 100 && row.rhob < 2.2) {
            crossover = true;
          }
      }
    });

    const total = hasGrData ? chartData.filter((r) => r.gr !== undefined).length : chartData.length || 1;
    return {
      sandstonePct: Math.round((sandstoneCount / total) * 100) || 0,
      carbonatePct: Math.round((carbonateCount / total) * 100) || 0,
      shalePct: Math.round((shaleCount / total) * 100) || 0,
      crossoverDetected: crossover
    };
  }, [chartData]);

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
                                {chartData.length > 0 ? `${chartData[0].depth}m - ${chartData[chartData.length-1].depth}m` : '0m'}
                            </span>
                        </div>
                        <input type="range" className="w-full accent-[#03A9F4]" />
                    </div>
                </div>
            </div>

            {/* Log Display */}
            {dataDimensions !== '1D' && chartData.length > 0 ? (
                 <div className="flex-1 bg-black p-4 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <span className="text-xl font-bold font-mono text-[#03A9F4] animate-pulse">Auto-Detected {dataDimensions} Data Structure</span>
                    <span className="text-sm font-mono text-[#888]">Dynamically splitting view for multi-well spatial overlay analysis...</span>
                    <div className="w-11/12 h-2/3 border border-[#333] bg-[#111] mt-4 flex items-center justify-center p-4">
                       <ChartRenderer data={chartData} visibleCurves={visibleCurves} />
                    </div>
                 </div>
            ) : (
                <div className="flex-1 bg-black overflow-hidden relative border-r border-[#333]">
                    <ChartRenderer data={chartData} visibleCurves={visibleCurves} />
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
                            <p className="text-[11px] text-[#888888] leading-tight">Awaiting Field Data Ingestion...</p>
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

