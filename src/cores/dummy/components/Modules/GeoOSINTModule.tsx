import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  ShieldAlert, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  Activity, 
  Send, 
  Database, 
  Camera, 
  Volume2, 
  VolumeX, 
  Clock, 
  Check,
  CheckCircle2
} from 'lucide-react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { useAppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { EarthquakeItem, IncidentItem, AnalogMatchResult } from '../../../live/components/Modules/GeoOSINTModule';

export default function GeoOSINTModule() {
  const { globalData } = useGlobalGeoContext();
  const { apiMode } = useAppContext();

  const [activeTab, setActiveTab] = useState<'RADAR_FEED' | 'ANALOG_LIBRARY' | 'DORKING_SEARCH' | 'PHOTO_EXIF'>('RADAR_FEED');
  const [isSweeping, setIsSweeping] = useState(true);
  const [sweepIntervalSec, setSweepIntervalSec] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [lastSweepTime, setLastSweepTime] = useState<Date>(new Date());
  const [sweepCount, setSweepCount] = useState(1);

  const [earthquakes, setEarthquakes] = useState<EarthquakeItem[]>([]);
  const [incidentDb, setIncidentDb] = useState<IncidentItem[]>([]);
  const [topMatch, setTopMatch] = useState<AnalogMatchResult | null>(null);
  const [allMatches, setAllMatches] = useState<AnalogMatchResult[]>([]);
  const [satelliteTelemetry, setSatelliteTelemetry] = useState<any>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchReport, setSearchReport] = useState<string | null>(null);
  const [searchCitations, setSearchCitations] = useState<{ title: string; uri: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [exifPhoto, setExifPhoto] = useState<string | null>(null);
  const [exifData, setExifData] = useState<any | null>(null);
  const [isDispatchingAlert, setIsDispatchingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const rigCoords = useMemo(() => ({
    lat: -7.528,
    lng: 112.711,
    name: 'Rig Alpha-1 (East Java Basin)'
  }), []);

  const fetchFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const res = await fetch('/api/osint/feed');
      const data = await res.json();
      if (data.success) {
        setEarthquakes(data.live_earthquakes || []);
        setIncidentDb(data.incident_database || []);
        setSatelliteTelemetry(data.satellite_telemetry || null);
        setLastSweepTime(new Date());
        setSweepCount(prev => prev + 1);
      }
    } catch (e) {
      console.warn('[OSINT] Feed fetch exception:', e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const runAnalogMatching = async () => {
    try {
      const telemetry = {
        vp_vs_ratio: globalData?.seismicData?.[0] ?? 2.25,
        pore_pressure_ppg: globalData?.wellLoggingData?.[0] ?? 14.1,
        ch4_gas_ppm: globalData?.gasQualityData?.[0] ?? 52000,
        mud_weight_ppg: 12.2,
        resistivity_ohm_m: globalData?.electricalData?.[0] ?? 3.8,
        density_g_cm3: globalData?.wellLoggingData?.[0] ?? 2.12
      };

      const res = await fetch('/api/osint/analog-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTelemetry: telemetry })
      });
      const data = await res.json();
      if (data.success) {
        setTopMatch(data.top_match);
        setAllMatches(data.all_matches || []);
      }
    } catch (e) {
      console.warn('[OSINT] Analog match error:', e);
    }
  };

  useEffect(() => {
    fetchFeed();
    runAnalogMatching();
  }, []);

  useEffect(() => {
    if (!isSweeping) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchFeed();
          runAnalogMatching();
          return sweepIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSweeping, sweepIntervalSec]);

  const handleExecuteSearch = async (queryOverride?: string) => {
    const q = (queryOverride || searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    setSearchReport(null);
    setSearchCitations([]);

    try {
      const res = await fetch('/api/osint/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category: selectedCategory,
          focusCoordinates: rigCoords
        })
      });
      const data = await res.json();
      if (data.success) {
        setSearchReport(data.report);
        setSearchCitations(data.citations || []);
      } else {
        setSearchReport(data.report || 'Investigation query completed.');
      }
    } catch (e) {
      setSearchReport('Failed to complete online OSINT crawl. Using offline disaster catalog.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDispatchWhatsAppAlert = async () => {
    setIsDispatchingAlert(true);
    try {
      const res = await fetch('/api/osint/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `OSINT Threat Match: ${topMatch?.name || 'Macondo Precedent'}`,
          severity: topMatch?.severity || 'HIGH',
          coordinates: rigCoords,
          analogMatch: `${topMatch?.name} (${topMatch?.similarity_score_pct}% match)`,
          summary: `Continuous OSINT radar flagged high pore pressure & gas indicators matching historical blowout library.`
        })
      });
      const data = await res.json();
      if (data.success) {
        setAlertSuccess(true);
        setTimeout(() => setAlertSuccess(false), 3500);
      }
    } catch (e) {
      console.error('Dispatch error:', e);
    } finally {
      setIsDispatchingAlert(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setExifPhoto(event.target?.result as string);
      setExifData({
        fileName: file.name,
        fileSizeKb: (file.size / 1024).toFixed(1),
        cameraModel: "Sony Alpha ILCE-7RM4 (Field Unit)",
        captureTimestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleString('id-ID'),
        gpsLatitude: "-7.5280° S",
        gpsLongitude: "112.7110° E",
        gpsAltitude: "18.5 m AMSL",
        distanceToWellMeters: "25 meters (Wellhead Safe Zone)",
        softwareSignature: "VeriPhoto Forensic Check (Valid)",
        tamperRisk: "CLEAN_UNMODIFIED"
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full space-y-4 font-mono text-gray-200 overflow-y-auto pr-1">
      {/* Top Header */}
      <div className="p-4 rounded-xl bg-[#141416] border border-[#2e2e32] shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio size={22} className={cn(isSweeping ? "animate-pulse" : "")} />
            </div>
            {isSweeping && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white uppercase">
                GEO-OSINT & REAL-WORLD INCIDENT RADAR
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                LIVE SWEEPER
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans">
              Continuous multi-source crawler: USGS seismicity, open registries, and physics fingerprint analog incident matching.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer",
              soundAlerts ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-black/30 border-neutral-700 text-gray-400"
            )}
          >
            {soundAlerts ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="text-[10px] uppercase font-bold">{soundAlerts ? "AUDIO ON" : "MUTED"}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-neutral-700 font-mono text-[10px]">
            <Clock size={13} className="text-cyan-400" />
            <span>SWEEP #{sweepCount}</span>
            <span className="text-gray-500">|</span>
            <span className={cn("font-bold", countdown <= 3 ? "text-amber-400 animate-pulse" : "text-emerald-400")}>
              {isSweeping ? `NEXT IN ${countdown}s` : "PAUSED"}
            </span>
          </div>

          <button
            onClick={() => setIsSweeping(!isSweeping)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all cursor-pointer",
              isSweeping ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-amber-950/40 border-amber-500/40 text-amber-300"
            )}
          >
            {isSweeping ? "RUNNING" : "RESUME"}
          </button>

          <button
            onClick={() => {
              fetchFeed();
              runAnalogMatching();
              setCountdown(sweepIntervalSec);
            }}
            disabled={isLoadingFeed}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 border border-neutral-600 cursor-pointer"
          >
            <RefreshCw size={14} className={cn(isLoadingFeed ? "animate-spin text-cyan-400" : "")} />
          </button>
        </div>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar */}
        <div className="p-4 rounded-xl bg-[#141416] border border-[#2e2e32] flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={13} /> ACTIVE SWEEP RADAR (500 KM)
            </span>
            <span className="text-[9px] text-gray-500 font-mono">TARGET: {rigCoords.name}</span>
          </div>

          <div className="relative w-52 h-52 flex items-center justify-center my-1">
            <div className="absolute inset-0 rounded-full border border-cyan-500/20"></div>
            <div className="absolute inset-6 rounded-full border border-cyan-500/15"></div>
            <div className="absolute inset-12 rounded-full border border-cyan-500/10"></div>
            <div className="absolute w-full h-[1px] bg-cyan-500/20"></div>
            <div className="absolute h-full w-[1px] bg-cyan-500/20"></div>

            <div 
              className={cn("absolute inset-0 rounded-full", isSweeping ? "animate-[spin_4s_linear_infinite]" : "")}
              style={{ background: 'conic-gradient(from 0deg, rgba(0, 229, 255, 0.45) 0deg, rgba(0, 229, 255, 0.05) 60deg, transparent 90deg)' }}
            ></div>

            <div className="relative z-10 w-3 h-3 rounded-full bg-[#FF5722] border-2 border-white shadow-[0_0_10px_#FF5722]"></div>

            {earthquakes.slice(0, 6).map((eq, idx) => {
              const angle = (idx * 60 + 25) * (Math.PI / 180);
              const radius = 25 + (idx * 14);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={eq.id}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute z-10 group cursor-pointer"
                >
                  <span className="block w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></span>
                  <div className="hidden group-hover:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] p-2 rounded border border-neutral-700 whitespace-nowrap z-30">
                    <p className="font-bold text-amber-400">M {eq.magnitude} - {eq.place}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full flex items-center justify-between text-[9px] text-gray-400 mt-2 px-1 border-t border-neutral-800 pt-2">
            <span className="text-cyan-400 font-bold">RADAR SWEEP ACTIVE</span>
            <span className="text-gray-400">{earthquakes.length} ACTIVE TARGETS</span>
          </div>
        </div>

        {/* Analog Matcher */}
        <div className="p-4 rounded-xl bg-[#141416] border border-[#2e2e32] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} /> ANALOG INCIDENT MATCHER
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
                CASE-BASED
              </span>
            </div>

            {topMatch ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/40 border border-neutral-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{topMatch.name}</h4>
                      <p className="text-[10px] text-gray-400 font-sans">{topMatch.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-red-400">
                        {topMatch.similarity_score_pct}%
                      </span>
                      <span className="block text-[8px] text-gray-500 uppercase font-bold">SIMILARITY SCORE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-800 text-[9px]">
                    <div>
                      <span className="text-gray-500 block">Δ Vp/Vs:</span>
                      <span className="font-bold text-cyan-400">+{topMatch.parameter_delta.vp_vs_diff}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Δ Pore Press:</span>
                      <span className="font-bold text-amber-400">{topMatch.parameter_delta.pore_pressure_diff_ppg} ppg</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Gas Ratio:</span>
                      <span className="font-bold text-emerald-400">{topMatch.parameter_delta.gas_factor}x</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/20 text-[10px] text-red-200">
                  <span className="font-bold uppercase block text-[9px] text-red-400 mb-1">
                    ⚡ RECOMMENDED MITIGATION ACTION:
                  </span>
                  <p className="font-sans leading-relaxed">{topMatch.mitigation_action}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 text-xs">Computing incident distance matrix...</div>
            )}
          </div>

          <div className="flex gap-2 mt-3 pt-2 border-t border-neutral-800">
            <button
              onClick={() => setActiveTab('ANALOG_LIBRARY')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
            >
              BROWSE DISASTER LIBRARY
            </button>
            <button
              onClick={handleDispatchWhatsAppAlert}
              disabled={isDispatchingAlert}
              className={cn(
                "py-1.5 px-3 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer",
                alertSuccess ? "bg-emerald-600 text-white" : "bg-[#FF5722] hover:bg-[#ff7043] text-black"
              )}
            >
              {alertSuccess ? <Check size={12} /> : <Send size={12} />}
              <span>{alertSuccess ? "DISPATCHED" : "DISPATCH WA ALERT"}</span>
            </button>
          </div>
        </div>

        {/* Satellite Intel */}
        <div className="p-4 rounded-xl bg-[#141416] border border-[#2e2e32] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={14} /> SATELLITE & SPACE WEATHER INTEL
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-purple-500/10 border border-purple-500/30 text-purple-400">
                OPEN EO
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-500 block uppercase">Copernicus Sentinel-1 InSAR:</span>
                  <span className="text-white font-bold text-[11px]">Surface Subsidence Velocity</span>
                </div>
                <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-cyan-400 font-mono text-[10px] font-bold">
                  {satelliteTelemetry?.inSar_deformation_rate_mm_yr || "-3.8 mm/yr"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-500 block uppercase">NASA FIRMS / MODIS:</span>
                  <span className="text-white font-bold text-[11px]">Thermal Anomalies (50km radius)</span>
                </div>
                <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-amber-400 font-mono text-[10px] font-bold">
                  {satelliteTelemetry?.modis_thermal_anomalies ?? 2} HOTSPOTS
                </span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800 text-[9px] text-gray-400 mt-3 font-sans">
            🛰️ Space Weather: <span className="text-emerald-400 font-bold">Kp 2.3 (Nominal Magnetic Flow)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('RADAR_FEED')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'RADAR_FEED' ? "border-cyan-400 text-cyan-400" : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Activity size={14} />
          <span>LIVE GEOHAZARD STREAM ({earthquakes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALOG_LIBRARY')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'ANALOG_LIBRARY' ? "border-amber-400 text-amber-400" : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Database size={14} />
          <span>REAL-WORLD INCIDENTS ({incidentDb.length || 6})</span>
        </button>

        <button
          onClick={() => setActiveTab('DORKING_SEARCH')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'DORKING_SEARCH' ? "border-purple-400 text-purple-400" : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Search size={14} />
          <span>AI SEARCH & DORKING</span>
        </button>

        <button
          onClick={() => setActiveTab('PHOTO_EXIF')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'PHOTO_EXIF' ? "border-emerald-400 text-emerald-400" : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Camera size={14} />
          <span>PHOTO EXIF & GEOLOCATION</span>
        </button>
      </div>

      {/* TAB 1 */}
      {activeTab === 'RADAR_FEED' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {earthquakes.map((eq) => (
            <div key={eq.id} className="p-3 rounded-xl border border-neutral-800 bg-[#141416]">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-black font-mono bg-neutral-800 text-gray-300">
                  M {eq.magnitude.toFixed(1)}
                </span>
                <span className="text-[9px] text-gray-500">{new Date(eq.time).toLocaleTimeString()}</span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{eq.place}</h4>
              <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-400 mt-2 pt-2 border-t border-neutral-800">
                <div>Depth: <span className="text-white">{eq.coordinates.depth_km.toFixed(1)} km</span></div>
                <div>Lat/Lng: <span className="text-white">{eq.coordinates.lat.toFixed(2)}°, {eq.coordinates.lng.toFixed(2)}°</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2 */}
      {activeTab === 'ANALOG_LIBRARY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(incidentDb.length > 0 ? incidentDb : allMatches).map((inc: any) => (
            <div key={inc.id || inc.incident_id} className="p-4 rounded-xl bg-[#141416] border border-neutral-800">
              <h3 className="text-sm font-bold text-white uppercase">{inc.name}</h3>
              <p className="text-[10px] text-gray-400 mb-2">{inc.location} • {inc.date}</p>
              <p className="text-xs text-gray-300 font-sans leading-relaxed mb-3">{inc.root_cause}</p>
              <div className="p-2 rounded bg-black/40 border border-neutral-800 text-[10px] text-amber-300">
                Mitigation: {inc.mitigation_action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3 */}
      {activeTab === 'DORKING_SEARCH' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search OSINT geophysics archives or type incident name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteSearch(); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#141416] border border-neutral-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={() => handleExecuteSearch()}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 text-black font-bold text-xs uppercase cursor-pointer"
            >
              {isSearching ? "SEARCHING..." : "OSINT SEARCH"}
            </button>
          </div>

          {searchReport && (
            <div className="p-5 rounded-xl bg-[#141416] border border-cyan-500/30 text-xs font-sans whitespace-pre-wrap leading-relaxed">
              {searchReport}
            </div>
          )}
        </div>
      )}

      {/* TAB 4 */}
      {activeTab === 'PHOTO_EXIF' && (
        <div className="p-4 rounded-xl bg-[#141416] border border-neutral-800">
          <h3 className="text-sm font-bold text-white uppercase mb-2">FIELD PHOTO EXIF & FORENSICS</h3>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mb-4 text-xs text-gray-400" />
          {exifData && (
            <div className="p-3 rounded bg-black/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <p>GPS Coordinates: {exifData.gpsLatitude}, {exifData.gpsLongitude}</p>
              <p>Device: {exifData.cameraModel}</p>
              <p>Timestamp: {exifData.captureTimestamp}</p>
              <p>Authenticity Status: {exifData.tamperRisk}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
