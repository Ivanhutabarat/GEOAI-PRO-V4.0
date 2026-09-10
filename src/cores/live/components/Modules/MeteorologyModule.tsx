import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useEffect, useMemo } from 'react';
import { meteorologyPayload } from '../../../../data/mocks/meteorology';
import DynamicChart from '../Shared/DynamicChart';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { 
  Wind, 
  Activity, 
  CloudRain, 
  AlertTriangle, 
  Sun, 
  Compass, 
  Cpu 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';

export default function MeteorologyModule() {

  const { apiMode, engine, dimensionMode } = useAppContext();
  

  const { globalData, rawPayloads,  activeFileName } = useGlobalGeoContext();
  const [activeStation, setActiveStation] = useState<string>("Alpine-North");
  const [pressureThreshold, setPressureThreshold] = useState<number>(1010); // mb
  const [radarLoop, setRadarLoop] = useState<boolean>(true);

  // 24-hour climate log data for meteorological stations
  const [weatherLogs, setWeatherLogs] = useState<Record<string, {
    stationName: string,
    elev: number,
    humidity: number,
    windDir: string,
    hourlyData: { time: string, temp: number, pressure: number, windSpeed: number, rainProb: number }[]
  }>>({
    "Alpine-North": {
      stationName: "Alpine North Ridge Summit",
      elev: 2840,
      humidity: 78,
      windDir: "NNE",
      hourlyData: [
        { time: '00:00', temp: 2, pressure: 1008, windSpeed: 24, rainProb: 15 },
        { time: '04:00', temp: 0, pressure: 1002, windSpeed: 28, rainProb: 40 },
        { time: '08:00', temp: 1, pressure: 996, windSpeed: 38, rainProb: 85 },
        { time: '12:00', temp: 4, pressure: 993, windSpeed: 45, rainProb: 90 },
        { time: '16:00', temp: 3, pressure: 1001, windSpeed: 32, rainProb: 65 },
        { time: '20:00', temp: 1, pressure: 1007, windSpeed: 21, rainProb: 20 },
      ]
    },
    "Coastal-Basin": {
      stationName: "Coastal Mud-Flat Estuary",
      elev: 12,
      humidity: 92,
      windDir: "SW",
      hourlyData: [
        { time: '00:00', temp: 18, pressure: 1014, windSpeed: 12, rainProb: 45 },
        { time: '04:00', temp: 17, pressure: 1012, windSpeed: 14, rainProb: 50 },
        { time: '08:00', temp: 20, pressure: 1011, windSpeed: 18, rainProb: 30 },
        { time: '12:00', temp: 24, pressure: 1010, windSpeed: 15, rainProb: 10 },
        { time: '16:00', temp: 25, pressure: 1009, windSpeed: 12, rainProb: 15 },
        { time: '20:00', temp: 21, pressure: 1013, windSpeed: 9, rainProb: 5 },
      ]
    },
    "Inland-Desert": {
      stationName: "Inland Gobi Seismic Basin",
      elev: 610,
      humidity: 24,
      windDir: "E",
      hourlyData: [
        { time: '00:00', temp: 28, pressure: 1021, windSpeed: 8, rainProb: 0 },
        { time: '04:00', temp: 22, pressure: 1022, windSpeed: 11, rainProb: 0 },
        { time: '08:00', temp: 31, pressure: 1020, windSpeed: 14, rainProb: 0 },
        { time: '12:00', temp: 39, pressure: 1018, windSpeed: 22, rainProb: 0 },
        { time: '16:00', temp: 41, pressure: 1016, windSpeed: 19, rainProb: 0 },
        { time: '20:00', temp: 34, pressure: 1019, windSpeed: 12, rainProb: 0 },
      ]
    }
  });

  const presetLog = `# Climate Station Imports
# Hour, Temp, Pressure, Wind
0, 20, 1010, 10
4, 18, 1008, 12
8, 22, 1005, 18
12, 28, 1001, 24
16, 30, 998, 20
20, 25, 1004, 15`;

  const [meteorologyData, setMeteorologyData] = useState<any[]>([]);

  useEffect(() => {
    // Generate data around the baseline pressure and temp
    const baseTemp = activeStation === "Inland-Desert" ? 35 : activeStation === "Coastal-Basin" ? 22 : 5;
    // REMOVED MOCK UPDATE
  }, [activeFileName, activeStation, pressureThreshold]);

  const currentStation = weatherLogs[activeStation];

  const chartData = useMemo(() => {
    if (rawPayloads && rawPayloads.meteorologyData) {
      const result = processIncomingData(rawPayloads.meteorologyData);
      if (result && result.data && result.data.length > 0) {
        return result.data;
      }
    }
    return (globalData.meteorologyData && globalData.meteorologyData.length > 0) 
      ? globalData.meteorologyData 
      : meteorologyPayload;
  }, [globalData.meteorologyData, rawPayloads?.meteorologyData]);

  // Determine if core meteorological drop signals flash tornado/storm warnings
  const lowestPressure = meteorologyData.length > 0 ? Math.min(...meteorologyData.map(d => d.pressure)) : pressureThreshold;
  const triggerStormWarning = lowestPressure < 1005;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold uppercase italic font-mono text-white flex items-center gap-3">
            <Wind className="text-[#FF5722]" />
            Meteorology & Climate Modeling Center
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1 uppercase">ERA5 Climatology Time-Series Atmospheric Scenarios // .nc .grib</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#333] px-3 py-1.5 rounded text-[#888]">
          <Cpu className="text-[#FF5722]" size={14} />
          <span className="font-mono">NVIDIA A100 // ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Climate station selector widgets */}
        <div className="col-span-4 space-y-4">
          <UniversalIngestionPort 
            moduleName="meteo"
            contextKey="meteorologyData"
            onParsed={(d) => console.log(d)}
            presetLog={presetLog}
          />
          <div className="geo-card">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-4 font-bold">Climate Stations</h3>
            <div className="space-y-3">
              {Object.keys(weatherLogs).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveStation(key)}
                  className={`w-full flex justify-between items-center p-3 rounded border text-left font-mono text-xs transition-with-colors ${activeStation === key ? 'bg-[#FF5722]/10 border-[#FF5722] text-white' : 'bg-black/20 border-[#222] text-[#888] hover:border-[#333]'}`}
                >
                  <div>
                    <div className="font-bold">{key}</div>
                    <div className="text-[10px] text-[#555] italic">{weatherLogs[key].stationName}</div>
                  </div>
                  <div className="text-[#FF5722] font-semibold">{weatherLogs[key].elev}m</div>
                </button>
              ))}
            </div>
          </div>

          <div className="geo-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888]">Atmospheric Risk Threshold</h3>
              <AlertTriangle className={triggerStormWarning ? "text-yellow-500 animate-bounce" : "text-[#333]"} size={16} />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-white mb-1">
                  <span>Barometric Threshold</span>
                  <span className="text-[#FF5722]">{pressureThreshold} millibars</span>
                </div>
                <input 
                  type="range" 
                  min="990" 
                  max="1030" 
                  step="1"
                  value={pressureThreshold} 
                  onChange={(e) => setPressureThreshold(Number(e.target.value))}
                  className="w-full accent-[#FF5722] bg-[#222] h-1 rounded"
                />
              </div>

              {/* Warnings Indicator Alert flash */}
              {triggerStormWarning ? (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-start gap-2 text-xs text-yellow-500 leading-normal font-mono animate-pulse">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase">STSTORM WARNING ACTIVE</span>
                    <p className="text-[10px] text-yellow-500/80 mt-1">Pressure dropped below safety parameters ({lowestPressure} mb). Deploy backup seismic geophone shields immediately.</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded flex items-start gap-2 text-xs text-green-500 leading-normal font-mono">
                  <Sun size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase">STABLE MET METRICS</span>
                    <p className="text-[10px] text-green-500/80 mt-1">Local atmospheric stability represents low hazard values. Survey runs approved.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Climate Graphs and Station statistics panels */}
        <div className="col-span-8 space-y-6">
        {dimensionMode === '3D' && <div className="fixed inset-0 z-50 md:left-56 top-12 bg-black flex p-6"><Fallback3D /></div>}

          <div className="geo-card bg-[#0e0e0e] grid grid-cols-4 gap-4 text-center border-[#222]">
            <div className="p-2 border border-[#222] rounded bg-black/40">
              <div className="text-[9px] font-mono text-[#555] mb-1">STATION WIND VECTOR</div>
              <div className="text-sm font-mono text-white flex items-center justify-center gap-1">
                <Compass size={14} className="text-[#FF5722]" />
                {currentStation.windDir}
              </div>
            </div>
            <div className="p-2 border border-[#222] rounded bg-black/40">
              <div className="text-[9px] font-mono text-[#555] mb-1">RELATIVE HUMIDITY</div>
              <div className="text-sm font-mono text-white">{currentStation.humidity}%</div>
            </div>
            <div className="p-2 border border-[#222] rounded bg-black/40">
              <div className="text-[9px] font-mono text-[#555] mb-1">LOW PRESSURE PIVOT</div>
              <div className="text-sm font-mono text-white text-yellow-500">{lowestPressure} mb</div>
            </div>
            <div className="p-2 border border-[#222] rounded bg-black/40">
              <div className="text-[9px] font-mono text-[#555] mb-1">GRID RESOLUTION</div>
              <div className="text-sm font-mono text-green-500">0.25° Mesh</div>
            </div>
          </div>

          <div className="geo-card">
            <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#888] mb-6">24-Hour Diurnal Climatological Profile</h3>
            <div className="h-56 w-full">
              <DebugDump data={chartData} />
              <DynamicChart data={chartData} type="area" moduleType="meteorology" />
            </div>
            <p className="text-[9px] text-[#555] mt-4 text-right font-mono">{import.meta.env.VITE_CHART_WATERMARK}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
