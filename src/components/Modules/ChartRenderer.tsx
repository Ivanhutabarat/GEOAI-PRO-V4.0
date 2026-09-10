// src/components/Modules/ChartRenderer.tsx
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { scaleLinear, scaleLog } from 'd3-scale';
import { line, area } from 'd3-shape';
import { min, max } from 'd3-array';
import { cn } from '../../lib/utils';
import { useOptimizerStore } from '../../store/OptimizerStore';

interface ChartRendererProps {
  data: any[];
  visibleCurves: {
    gr: boolean;
    res: boolean;
    rhob: boolean;
    nphi: boolean;
    dt: boolean;
    cal: boolean;
  };
}

export default function ChartRenderer({ data, visibleCurves }: ChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { optimizedParams, anomalyDetectionActive, scenarioA, scenarioB, activeScenario } = useOptimizerStore();
  const activeParams = optimizedParams || (activeScenario === 'A' ? scenarioA : scenarioB);

  useEffect(() => {
    let animationFrameId: number;
    const observe = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
          setDimensions(prev => {
            if (Math.abs(prev.width - width) < 2 && Math.abs(prev.height - height) < 2) {
              return prev;
            }
            return { width, height };
          });
        });
      }
    });
    if (containerRef.current) observe.observe(containerRef.current);
    return () => {
      observe.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Use a fixed track width with horizontal scrolling, or divide available width
  const visibleCount = [visibleCurves.gr, visibleCurves.res, visibleCurves.rhob, visibleCurves.nphi, visibleCurves.dt, visibleCurves.cal].filter(Boolean).length;
  
  // Base dimensions
  const trackWidth = Math.max(160, dimensions.width / (visibleCount || 1));
  const trackHeight = Math.max(dimensions.height, 600); // Allow vertical scrolling if data is huge, but here let's fit the height 

  const minDepth = min(data, d => d.depth) || 0;
  const maxDepth = max(data, d => d.depth) || 1000;

  // Shared Depth Scale (Linear)
  const yScale = useMemo(() => {
    return scaleLinear().domain([minDepth, maxDepth]).range([10, trackHeight - 10]);
  }, [minDepth, maxDepth, trackHeight]);

  // Compute Z-Scores of Gamma Ray and Resistivity values for anomaly detection shading
  const zScoreStats = useMemo(() => {
    if (!data || data.length === 0) return { grMean: 0, grStd: 1, resMean: 0, resStd: 1 };
    
    const grs = data.map(d => d.gr).filter((v): v is number => typeof v === 'number' && !isNaN(v));
    const ress = data.map(d => d.res).filter((v): v is number => typeof v === 'number' && !isNaN(v) && v > 0);
    
    const grMean = grs.length > 0 ? grs.reduce((a, b) => a + b, 0) / grs.length : 60;
    const grStd = grs.length > 0 ? Math.max(1, Math.sqrt(grs.map(v => Math.pow(v - grMean, 2)).reduce((a, b) => a + b, 0) / grs.length)) : 15;
    
    const logRess = ress.map(v => Math.log10(v));
    const resMean = logRess.length > 0 ? logRess.reduce((a, b) => a + b, 0) / logRess.length : 1.5;
    const resStd = logRess.length > 0 ? Math.max(0.1, Math.sqrt(logRess.map(v => Math.pow(v - resMean, 2)).reduce((a, b) => a + b, 0) / logRess.length)) : 0.5;
    
    return { grMean, grStd, resMean, resStd };
  }, [data]);

  // Curve Scales
  const scales = useMemo(() => {
    return {
      gr: scaleLinear().domain([0, 150]).range([10, trackWidth - 10]),
      res: scaleLog().domain([0.2, 2000]).range([10, trackWidth - 10]).clamp(true), // Log Scale!
      rhob: scaleLinear().domain([1.95, 2.95]).range([10, trackWidth - 10]),
      nphi: scaleLinear().domain([0.45, -0.15]).range([10, trackWidth - 10]), // Reversed scale
      dt: scaleLinear().domain([140, 40]).range([10, trackWidth - 10]), // Reversed scale
      cal: scaleLinear().domain([6, 16]).range([10, trackWidth - 10]),
    };
  }, [trackWidth]);

  // Generators
  const generators = useMemo(() => {
    const createLine = (xScale: any, key: string, isLog = false) => line<any>()
      .defined(d => d[key] !== undefined && (!isLog || d[key] > 0))
      .x(d => xScale(isLog ? Math.max(0.2, d[key]) : d[key]))
      .y(d => yScale(d.depth));

    // Shading generator for RHOB and NPHI crossover (Density-Neutron)
    const dtArea = area<any>()
      .defined(d => d.rhob !== undefined && d.nphi !== undefined)
      .x0(d => scales.nphi(d.nphi))
      .x1(d => scales.rhob(d.rhob))
      .y(d => yScale(d.depth));

    // Shading for CAL vs Bit Size (Assume 8.5)
    const calHole = area<any>()
      .defined(d => d.cal !== undefined)
      .x0(scales.cal(8.5))
      .x1(d => scales.cal(d.cal))
      .y(d => yScale(d.depth));

    // Shading for GR Baseline (Sand vs Shale, baseline 60)
    const grSand = area<any>()
      .defined(d => d.gr !== undefined && d.gr <= 60)
      .x0(scales.gr(60))
      .x1(d => scales.gr(d.gr))
      .y(d => yScale(d.depth));
      
    const grShale = area<any>()
      .defined(d => d.gr !== undefined && d.gr > 60)
      .x0(scales.gr(60))
      .x1(d => scales.gr(d.gr))
      .y(d => yScale(d.depth));

    return {
      gr: createLine(scales.gr, 'gr'),
      res: createLine(scales.res, 'res', true),
      rhob: createLine(scales.rhob, 'rhob'),
      nphi: createLine(scales.nphi, 'nphi'),
      dt: createLine(scales.dt, 'dt'),
      cal: createLine(scales.cal, 'cal'),
      rhobNphiCrossover: dtArea,
      calWashout: calHole,
      grSand,
      grShale
    };
  }, [scales, yScale]);

  if (!data || data.length === 0) return <div className="flex-1 flex items-center justify-center p-4"><span className="text-sm font-mono text-[#888]">No dynamic data ingested to plot.</span></div>;

  return (
    <div className="flex-1 w-full h-full relative bg-black flex overflow-hidden">
      <div className="absolute inset-0 pointer-events-none invisible" ref={containerRef} />
      <div className="flex-1 w-full h-full relative overflow-y-auto overflow-x-auto bg-transparent scrollbar-thin flex">
        {dimensions.width > 0 && (
          <div className="flex shrink-0 min-h-full">
            {/* Depth Axis (Global) */}
            <div className="w-16 border-r border-[#333] shrink-0 sticky left-0 bg-[#111] z-10 flex flex-col items-center">
              <div className="w-full text-center py-2 text-[10px] font-bold text-white bg-[#222]">DEPT(M)</div>
              <div className="relative flex-1 w-full" style={{ height: trackHeight }}>
                {yScale.ticks(10).map(tick => (
                  <div key={tick} className="absolute w-full text-center text-[9px] text-[#888]" style={{ top: yScale(tick) - 5 }}>
                    {tick}
                  </div>
                ))}
              </div>
            </div>

            {/* Track 1: GR & SP */}
            {visibleCurves.gr && (
              <Track width={trackWidth} height={trackHeight} label="Gamma Ray" range="0 - 150 GAPI">
                 <svg width={trackWidth} height={trackHeight} className="w-full h-full">
                   <Grid xScale={scales.gr} ticks={4} height={trackHeight} />
                   {/* Shading */}
                   <path d={generators.grSand(data) || ''} fill="rgba(255, 215, 0, 0.4)" />
                   <path d={generators.grShale(data) || ''} fill="rgba(128, 128, 128, 0.4)" />
                   {/* Curve */}
                   <path d={generators.gr(data) || ''} fill="none" stroke="#FF5722" strokeWidth={1.5} />

                   {/* Anomaly Detection Highlights (where res > threshold, gr < threshold) */}
                   {anomalyDetectionActive && data.map((d, idx) => {
                     const isAnomalous = d.res !== undefined && d.gr !== undefined && d.res > activeParams.resistivityThreshold && (d.gr < activeParams.shaleCutoff * 1.5);
                     const z_gr = (d.gr - zScoreStats.grMean) / zScoreStats.grStd;
                     const isZAnomaly = Math.abs(z_gr) > 1.6;
                     if (isAnomalous || isZAnomaly) {
                       const y_pos = yScale(d.depth);
                       return (
                         <rect 
                           key={`anomaly-gr-${idx}`}
                           x={0} 
                           y={y_pos - 3} 
                           width={trackWidth} 
                           height={6} 
                           fill={isAnomalous ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.1)"} 
                         />
                       );
                     }
                     return null;
                   })}

                   {/* Active Cutoff Visual */}
                   <g>
                     <line 
                       x1={scales.gr(activeParams.shaleCutoff * 1.5)} 
                       x2={scales.gr(activeParams.shaleCutoff * 1.5)} 
                       y1={0} 
                       y2={trackHeight} 
                       stroke={optimizedParams ? "#FF9800" : "#B0BEC5"} 
                       strokeWidth={1.2} 
                       strokeDasharray="4 3" 
                     />
                     <rect 
                       x={Math.max(0, scales.gr(activeParams.shaleCutoff * 1.5) - 60)} 
                       y={10} 
                       width={60} 
                       height={14} 
                       fill="rgba(0, 0, 0, 0.75)"
                       stroke={optimizedParams ? "#FF9800" : "#455A64"}
                       strokeWidth={0.5}
                     />
                     <text 
                       x={Math.max(4, scales.gr(activeParams.shaleCutoff * 1.5) - 56)} 
                       y={19} 
                       fill={optimizedParams ? "#FF9800" : "#B0BEC5"} 
                       fontSize="7px" 
                       fontFamily="monospace"
                     >
                       {optimizedParams ? "OPT GR" : `SCEN ${activeScenario} GR`}: {activeParams.shaleCutoff}%
                     </text>
                   </g>
                 </svg>
              </Track>
            )}

            {/* Track 2: Resistivity */}
            {visibleCurves.res && (
              <Track width={trackWidth} height={trackHeight} label="Resistivity" range="0.2 - 2000 OHMM (Log)">
                 <svg width={trackWidth} height={trackHeight} className="w-full h-full">
                   <Grid xScale={scales.res} ticks={4} height={trackHeight} isLog />
                   <path d={generators.res(data) || ''} fill="none" stroke="#4CAF50" strokeWidth={1.5} />

                   {/* Anomaly Detection Highlights */}
                   {anomalyDetectionActive && data.map((d, idx) => {
                     const isAnomalous = d.res !== undefined && d.gr !== undefined && d.res > activeParams.resistivityThreshold && (d.gr < activeParams.shaleCutoff * 1.5);
                     const log_val = Math.log10(d.res || 0.2);
                     const z_res = (log_val - zScoreStats.resMean) / zScoreStats.resStd;
                     const isZAnomaly = Math.abs(z_res) > 1.6;
                     if (isAnomalous || isZAnomaly) {
                       const y_pos = yScale(d.depth);
                       return (
                         <rect 
                           key={`anomaly-res-${idx}`}
                           x={0} 
                           y={y_pos - 3} 
                           width={trackWidth} 
                           height={6} 
                           fill={isAnomalous ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.1)"} 
                         />
                       );
                     }
                     return null;
                   })}

                   {/* Active Cutoff Visual */}
                   <g>
                     <line 
                       x1={scales.res(activeParams.resistivityThreshold)} 
                       x2={scales.res(activeParams.resistivityThreshold)} 
                       y1={0} 
                       y2={trackHeight} 
                       stroke={optimizedParams ? "#8BC34A" : "#B0BEC5"} 
                       strokeWidth={1.2} 
                       strokeDasharray="4 3" 
                     />
                     <rect 
                       x={scales.res(activeParams.resistivityThreshold)} 
                       y={10} 
                       width={62} 
                       height={14} 
                       fill="rgba(0, 0, 0, 0.75)"
                       stroke={optimizedParams ? "#8BC34A" : "#455A64"}
                       strokeWidth={0.5}
                     />
                     <text 
                       x={scales.res(activeParams.resistivityThreshold) + 4} 
                       y={19} 
                       fill={optimizedParams ? "#8BC34A" : "#B0BEC5"} 
                       fontSize="7px" 
                       fontFamily="monospace"
                     >
                       {optimizedParams ? "OPT RES" : `SCEN ${activeScenario} RES`}: {activeParams.resistivityThreshold}Ωm
                     </text>
                   </g>
                 </svg>
              </Track>
            )}

            {/* Track 3: Density + Neutron Crossover */}
            {visibleCurves.rhob && visibleCurves.nphi && (
              <Track width={trackWidth} height={trackHeight} label="Den-Neu Overlay" range="RHOB(1.95-2.95) NPHI(0.45--0.15)">
                 <svg width={trackWidth} height={trackHeight} className="w-full h-full">
                   <Grid xScale={scales.rhob} ticks={4} height={trackHeight} />
                   {/* Crossover shading (yellow for gas/oil) => RHOB < NPHI visually, meaning NPHI - RHOB */}
                   <clipPath id="rhob-clip">
                     <path d={area<any>().defined(d => d.rhob !== undefined).x0(trackWidth).x1(d => scales.rhob(d.rhob)).y(d => yScale(d.depth))(data) || ''} />
                   </clipPath>
                   <clipPath id="nphi-clip">
                     <path d={area<any>().defined(d => d.nphi !== undefined).x0(0).x1(d => scales.nphi(d.nphi)).y(d => yScale(d.depth))(data) || ''} />
                   </clipPath>
                   <rect width={trackWidth} height={trackHeight} fill="rgba(255, 215, 0, 0.5)" clipPath="url(#rhob-clip) url(#nphi-clip)" />
                   
                   <path d={generators.rhob(data) || ''} fill="none" stroke="#03A9F4" strokeWidth={1.5} />
                   <path d={generators.nphi(data) || ''} fill="none" stroke="#FFD700" strokeWidth={1.5} strokeDasharray="4 2" />
                 </svg>
              </Track>
            )}

            {/* Single Density if Neutron not visible */}
            {visibleCurves.rhob && !visibleCurves.nphi && (
               <Track width={trackWidth} height={trackHeight} label="Density" range="1.95 - 2.95 G/CC">
                 <svg width={trackWidth} height={trackHeight} className="w-full h-full">
                   <Grid xScale={scales.rhob} ticks={4} height={trackHeight} />
                   <path d={generators.rhob(data) || ''} fill="none" stroke="#03A9F4" strokeWidth={1.5} />
                 </svg>
               </Track>
            )}

            {/* Single Neutron if Density not visible */}
            {!visibleCurves.rhob && visibleCurves.nphi && (
               <Track width={trackWidth} height={trackHeight} label="Neutron" range="0.45 - -0.15 V/V">
                 <svg width={trackWidth} height={trackHeight} className="w-full h-full">
                   <Grid xScale={scales.nphi} ticks={4} height={trackHeight} />
                   <path d={generators.nphi(data) || ''} fill="none" stroke="#FFD700" strokeWidth={1.5} />
                 </svg>
               </Track>
            )}

            {/* Track 5: Sonic */}
            {visibleCurves.dt && (
              <Track width={trackWidth} height={trackHeight} label="Sonic" range="140 - 40 US/FT">
                 <svg width={trackWidth} height={trackHeight} className="w-full h-full">
                   <Grid xScale={scales.dt} ticks={4} height={trackHeight} />
                   <path d={generators.dt(data) || ''} fill="none" stroke="#9C27B0" strokeWidth={1.5} />
                 </svg>
              </Track>
            )}

            {/* Track 6: Caliper */}
            {visibleCurves.cal && (
              <Track width={trackWidth} height={trackHeight} label="Caliper" range="6 - 16 IN">
                 <svg width={trackWidth} height={trackHeight} className="w-full h-full">
                   <Grid xScale={scales.cal} ticks={4} height={trackHeight} />
                   <path d={generators.calWashout(data) || ''} fill="rgba(158, 158, 158, 0.3)" />
                   {/* Bit Size Line at 8.5in */}
                   <line x1={scales.cal(8.5)} x2={scales.cal(8.5)} y1={0} y2={trackHeight} stroke="white" strokeWidth={1} strokeDasharray="5 5" />
                   <path d={generators.cal(data) || ''} fill="none" stroke="#9E9E9E" strokeWidth={1.5} />
                 </svg>
              </Track>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Track({ width, height, label, range, children }: any) {
  return (
    <div className="shrink-0 border-r border-[#333] flex flex-col relative bg-[#0a0a0a]" style={{ width }}>
      <div className="absolute top-0 left-0 w-full p-2 text-center bg-[#222]/80 backdrop-blur z-20 border-b border-[#333]">
        <span className="text-[10px] font-bold text-white block uppercase tracking-tighter">{label}</span>
        <span className="text-[8px] text-[#888] block">{range}</span>
      </div>
      <div className="flex-1 mt-10">
        {children}
      </div>
    </div>
  );
}

function Grid({ xScale, ticks, height, isLog }: any) {
  const tickVals = isLog ? [0.2, 2, 20, 200, 2000] : xScale.ticks(ticks);
  return (
    <g className="grid-lines">
      {tickVals.map((t: any, i: number) => (
        <line key={i} x1={xScale(t)} x2={xScale(t)} y1={0} y2={height} stroke="#333" strokeWidth={1} strokeDasharray="2 2" />
      ))}
    </g>
  );
}
