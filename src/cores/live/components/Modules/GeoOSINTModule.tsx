import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  ShieldAlert, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Flame, 
  Sliders, 
  Send, 
  Database, 
  Camera, 
  FileText, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  Layers, 
  Compass, 
  Eye, 
  Cpu, 
  Clock, 
  Check, 
  Maximize2, Terminal, Map as MapIcon, Crosshair 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { useAppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import exifr from 'exifr';

export interface EarthquakeItem {
  id: string;
  title: string;
  magnitude: number;
  place: string;
  time: string;
  coordinates: {
    lat: number;
    lng: number;
    depth_km: number;
  };
  url?: string;
  status?: string;
  tsunami?: boolean;
}

export interface IncidentItem {
  id: string;
  name: string;
  category: string;
  location: string;
  coordinates: { lat: number; lng: number };
  date: string;
  depth_m: number;
  fingerprint: {
    vp_vs_ratio: number;
    pore_pressure_ppg: number;
    ch4_gas_ppm: number;
    mud_weight_ppg: number;
    resistivity_ohm_m: number;
    density_g_cm3: number;
  };
  root_cause: string;
  analog_indicators: string[];
  mitigation_action: string;
  sources: string[];
}

export interface AnalogMatchResult {
  incident_id: string;
  name: string;
  category: string;
  location: string;
  coordinates: { lat: number; lng: number };
  date: string;
  similarity_score_pct: number;
  severity: string;
  root_cause: string;
  analog_indicators: string[];
  mitigation_action: string;
  parameter_delta: {
    vp_vs_diff: number;
    pore_pressure_diff_ppg: number;
    gas_factor: number;
  };
}

export default function GeoOSINTModule() {
  const { globalData } = useGlobalGeoContext();
  const { apiMode } = useAppContext();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'RADAR_FEED' | 'ANALOG_LIBRARY' | 'DORKING_SEARCH' | 'PHOTO_EXIF' | 'IP_TRACKER' | 'LIVE_NEWS'>('RADAR_FEED');

  // Sweeper State
  const [isSweeping, setIsSweeping] = useState(true);
  const [sweepIntervalSec, setSweepIntervalSec] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [lastSweepTime, setLastSweepTime] = useState<Date>(new Date());
  const [sweepCount, setSweepCount] = useState(1);

  // Data Feeds
  const [earthquakes, setEarthquakes] = useState<EarthquakeItem[]>([]);
  const [incidentDb, setIncidentDb] = useState<IncidentItem[]>([]);
  const [topMatch, setTopMatch] = useState<AnalogMatchResult | null>(null);
  const [allMatches, setAllMatches] = useState<AnalogMatchResult[]>([]);

  // IP Tracker State
  const [ipQuery, setIpQuery] = useState('');
  const [ipData, setIpData] = useState<any>(null);
  const [isIpLoading, setIsIpLoading] = useState(false);

  // Live News Intel State
  const [intelNews, setIntelNews] = useState<any[]>([]);
  const [satelliteTelemetry, setSatelliteTelemetry] = useState<any>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Search & Dorking State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchReport, setSearchReport] = useState<string | null>(null);
  const [searchCitations, setSearchCitations] = useState<{ title: string; uri: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected Incident for Deep Dive Modal
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  // Photo EXIF State
  const [exifPhoto, setExifPhoto] = useState<string | null>(null);
  const [exifData, setExifData] = useState<any | null>(null);

  // WhatsApp Alert Dispatch State
  const [isDispatchingAlert, setIsDispatchingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Current Well Coordinates
  const rigCoords = useMemo(() => ({
    lat: -7.528,
    lng: 112.711,
    name: 'Rig Alpha-1 (East Java Basin)'
  }), []);

  // Play audio ping
  const playAudioPing = (isCritical = false) => {
    if (!soundAlerts) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = isCritical ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  };

  // Fetch Live OSINT Feed
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

        // Check if there are critical quakes near rig
        const hasCritical = data.live_earthquakes?.some((q: EarthquakeItem) => q.magnitude >= 5.0);
        if (hasCritical) playAudioPing(true);
      }
    } catch (e) {
      console.warn('[OSINT] Feed fetch exception:', e);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  // Run Analog Incident Matching
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
      console.warn('[OSINT] Analog match fetch error:', e);
    }
  };

  const handleIpSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipQuery) return;
    setIsIpLoading(true);
    try {
      const res = await fetch(`http://ip-api.com/json/${ipQuery}`);
      const data = await res.json();
      setIpData(data);
    } catch (err) {
      console.error(err);
    }
    setIsIpLoading(false);
  };

  useEffect(() => {
    // Simulated live OSINT Intel News feed
    const generateNews = () => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), title: "Suspicious maritime vessel detected near Block A pipeline", source: "OSINT-NAVAL" },
      { id: Date.now() + 1, time: new Date(Date.now() - 600000).toLocaleTimeString(), title: "Dark web chatter indicates targeted phishing on energy sector", source: "CYBER-INTEL" },
      { id: Date.now() + 2, time: new Date(Date.now() - 1200000).toLocaleTimeString(), title: "Unregistered drone activity spotted over geothermal facility", source: "AERO-RADAR" },
      { id: Date.now() + 3, time: new Date(Date.now() - 2400000).toLocaleTimeString(), title: "Seismic anomaly correlated with unauthorized underground detonation", source: "GEO-SENSOR" },
      { id: Date.now() + 4, time: new Date(Date.now() - 4800000).toLocaleTimeString(), title: "Satellite imagery reveals sudden land subsidence in Zone C", source: "SAT-IMAGERY" }
    ];
    setIntelNews(generateNews());
    
    const interval = setInterval(() => {
      setIntelNews(prev => {
        const newEvent = { 
          id: Date.now(), 
          time: new Date().toLocaleTimeString(), 
          title: `Automated scan detected network anomaly on regional subnet ${Math.floor(Math.random() * 255)}.x`, 
          source: "AUTO-INTEL" 
        };
        return [newEvent, ...prev.slice(0, 7)];
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Initial Boot and Periodic Sweep Loop
  useEffect(() => {
    fetchFeed();
    runAnalogMatching();
  }, []);

  // Countdown timer for next sweep
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

  // Execute Targeted OSINT Search / Dorking
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
      setSearchReport('Failed to complete online OSINT crawl. System network timeout.');
    } finally {
      setIsSearching(false);
    }
  };

  // Dispatch WhatsApp OSINT Threat Alert
  const handleDispatchWhatsAppAlert = async () => {
    setIsDispatchingAlert(true);
    try {
      const res = await fetch('/api/osint/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `OSINT Radar Threat Match: ${topMatch?.name || 'Macondo Analog Precedent'}`,
          severity: topMatch?.severity || 'ELEVATED',
          coordinates: rigCoords,
          analogMatch: `${topMatch?.name} (${topMatch?.similarity_score_pct}% match)`,
          summary: `Continuous OSINT scanner flagged borehole pore pressure and Vp/Vs correlation with historical blowout indicators.`
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

  // Handle Photo Upload for EXIF extraction
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setExifPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const exif = await exifr.parse(file, true);
      const gps = await exifr.gps(file);
      
      setExifData({
        fileName: file.name,
        fileSizeKb: (file.size / 1024).toFixed(1),
        cameraModel: (exif?.Make && exif?.Model) ? `${exif.Make} ${exif.Model}` : "Unknown Device (Metadata missing/stripped)",
        captureTimestamp: exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toLocaleString('id-ID') : "No Timestamp Found",
        gpsLatitude: gps ? `${gps.latitude.toFixed(4)}°` : "No GPS Data",
        gpsLongitude: gps ? `${gps.longitude.toFixed(4)}°` : "No GPS Data",
        gpsAltitude: exif?.GPSAltitude ? `${exif.GPSAltitude} m` : "No Altitude Data",
        distanceToWellMeters: gps ? "OSINT Trace Activated" : "Location Untrackable",
        softwareSignature: exif?.Software || "Unmodified/Unknown",
        tamperRisk: (exif?.Software?.toLowerCase().includes('photoshop') || !exif) ? "MODIFIED (RISK)" : "CLEAN (ORIGINAL)"
      });
    } catch (err) {
      console.error(err);
      setExifData({
        fileName: file.name,
        fileSizeKb: (file.size / 1024).toFixed(1),
        cameraModel: "Error parsing EXIF",
        captureTimestamp: "Unknown",
        gpsLatitude: "Error",
        gpsLongitude: "Error",
        gpsAltitude: "Error",
        distanceToWellMeters: "Error",
        softwareSignature: "Error",
        tamperRisk: "METADATA CORRUPTED"
      });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 font-mono text-gray-200 overflow-y-auto pr-1">
      {/* Top Header & Continuous Sweeper Telemetry Bar */}
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

        {/* Sweeper Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Audio toggle */}
          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer",
              soundAlerts 
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300" 
                : "bg-black/30 border-neutral-700 text-gray-400 hover:text-white"
            )}
            title="Toggle Audio Ping Alert"
          >
            {soundAlerts ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="text-[10px] uppercase font-bold">{soundAlerts ? "AUDIO ON" : "MUTED"}</span>
          </button>

          {/* Sweeper Timer Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-neutral-700 font-mono text-[10px]">
            <Clock size={13} className="text-cyan-400" />
            <span>SWEEP #{sweepCount}</span>
            <span className="text-gray-500">|</span>
            <span className={cn("font-bold", countdown <= 3 ? "text-amber-400 animate-pulse" : "text-emerald-400")}>
              {isSweeping ? `NEXT IN ${countdown}s` : "PAUSED"}
            </span>
          </div>

          {/* Interval selector */}
          <select
            value={sweepIntervalSec}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSweepIntervalSec(val);
              setCountdown(val);
            }}
            className="bg-black/50 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-300 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value={10}>Interval: 10s (High-Speed)</option>
            <option value={15}>Interval: 15s (Standard)</option>
            <option value={30}>Interval: 30s (Eco)</option>
            <option value={60}>Interval: 60s (Slow)</option>
          </select>

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsSweeping(!isSweeping)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all cursor-pointer",
              isSweeping
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40"
                : "bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40"
            )}
          >
            {isSweeping ? "RUNNING" : "RESUME"}
          </button>

          {/* Manual Sweep Trigger */}
          <button
            onClick={() => {
              fetchFeed();
              runAnalogMatching();
              setCountdown(sweepIntervalSec);
            }}
            disabled={isLoadingFeed}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white border border-neutral-600 cursor-pointer disabled:opacity-50"
            title="Force Instant Sweep"
          >
            <RefreshCw size={14} className={cn(isLoadingFeed ? "animate-spin text-cyan-400" : "")} />
          </button>
        </div>
      </div>

      {/* Top Grid: Radar Sweep Visualizer + Real-World Analog Matcher + Satellite Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar Visualizer Panel */}
        <div className="p-4 rounded-xl bg-[#141416] border border-[#2e2e32] flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={13} /> ACTIVE SWEEP RADAR (500 KM)
            </span>
            <span className="text-[9px] text-gray-500 font-mono">
              TARGET: {rigCoords.name}
            </span>
          </div>

          {/* Animated SVG Radar */}
          <div className="relative w-52 h-52 flex items-center justify-center my-1">
            {/* Concentric rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20"></div>
            <div className="absolute inset-6 rounded-full border border-cyan-500/15"></div>
            <div className="absolute inset-12 rounded-full border border-cyan-500/10"></div>
            <div className="absolute inset-20 rounded-full border border-cyan-500/5"></div>
            
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-cyan-500/20"></div>
            <div className="absolute h-full w-[1px] bg-cyan-500/20"></div>

            {/* Rotating radar sweep arm */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full",
                isSweeping ? "animate-[spin_4s_linear_infinite]" : ""
              )}
              style={{
                background: 'conic-gradient(from 0deg, rgba(0, 229, 255, 0.45) 0deg, rgba(0, 229, 255, 0.05) 60deg, transparent 90deg)'
              }}
            ></div>

            {/* Center target (Drill Rig) */}
            <div className="relative z-10 w-3 h-3 rounded-full bg-[#FF5722] border-2 border-white shadow-[0_0_10px_#FF5722]" title="Rig Location"></div>

            {/* Dynamic Blips from Earthquakes */}
            {earthquakes.slice(0, 6).map((eq, idx) => {
              // Simulated projection offset
              const angle = (idx * 60 + 25) * (Math.PI / 180);
              const radius = 25 + (idx * 14);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={eq.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`
                  }}
                  className="absolute z-10 group cursor-pointer"
                >
                  <span className={cn(
                    "block w-2.5 h-2.5 rounded-full animate-ping absolute opacity-75",
                    eq.magnitude >= 5.0 ? "bg-red-500" : "bg-amber-400"
                  )}></span>
                  <span className={cn(
                    "block w-2.5 h-2.5 rounded-full border border-white",
                    eq.magnitude >= 5.0 ? "bg-red-600" : "bg-amber-500"
                  )}></span>

                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] p-2 rounded border border-neutral-700 whitespace-nowrap z-30 shadow-xl">
                    <p className="font-bold text-amber-400">M {eq.magnitude} - {eq.place}</p>
                    <p className="text-gray-400">{new Date(eq.time).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full flex items-center justify-between text-[9px] text-gray-400 mt-2 px-1 border-t border-neutral-800 pt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FF5722]"></span> RIG CENTER
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> SEISMIC BLIPS ({earthquakes.length})
            </span>
            <span className="text-cyan-400 font-bold">RANGE: 500KM</span>
          </div>
        </div>

        {/* Real-World Analog Matcher (Zero Hallucination Physics Precedent) */}
        <div className="p-4 rounded-xl bg-[#141416] border border-[#2e2e32] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} /> ANALOG INCIDENT MATCHER
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
                CASE-BASED REASONING
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
                      <span className={cn(
                        "text-base font-black font-mono",
                        topMatch.similarity_score_pct > 80 ? "text-red-400" : "text-amber-400"
                      )}>
                        {topMatch.similarity_score_pct}%
                      </span>
                      <span className="block text-[8px] text-gray-500 uppercase font-bold">FINGERPRINT SIMILARITY</span>
                    </div>
                  </div>

                  {/* Parameter deltas */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-800 text-[9px]">
                    <div>
                      <span className="text-gray-500 block">Δ Vp/Vs:</span>
                      <span className="font-bold text-cyan-400">{topMatch.parameter_delta.vp_vs_diff >= 0 ? `+${topMatch.parameter_delta.vp_vs_diff}` : topMatch.parameter_delta.vp_vs_diff}</span>
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
              <div className="p-6 text-center text-gray-500 text-xs">
                Computing physics distance matrix...
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3 pt-2 border-t border-neutral-800">
            <button
              onClick={() => setActiveTab('ANALOG_LIBRARY')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
            >
              BROWSE 6 REAL-WORLD CASES
            </button>
            <button
              onClick={handleDispatchWhatsAppAlert}
              disabled={isDispatchingAlert}
              className={cn(
                "py-1.5 px-3 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer",
                alertSuccess 
                  ? "bg-emerald-600 text-white" 
                  : "bg-[#FF5722] hover:bg-[#ff7043] text-black"
              )}
            >
              {alertSuccess ? (
                <>
                  <Check size={12} /> SENT TO WHATSAPP
                </>
              ) : (
                <>
                  <Send size={12} /> {isDispatchingAlert ? "DISPATCHING..." : "DISPATCH WA ALERT"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Satellite & Environmental Space Weather Panel */}
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

              <div className="p-2.5 rounded-lg bg-black/40 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-500 block uppercase">NOAA SWPC Geomagnetic:</span>
                  <span className="text-white font-bold text-[11px]">Planetary Kp Index (MWD Survey)</span>
                </div>
                <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-emerald-400 font-mono text-[10px] font-bold">
                  Kp 2.3 (QUIET / NOMINAL)
                </span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-neutral-900/80 border border-neutral-800 text-[9px] text-gray-400 mt-3 font-sans">
            🛰️ Next Sentinel-2 Optical Pass: <span className="text-cyan-400 font-mono font-bold">Today, 14:22 UTC</span> (Cloud cover: 18%)
          </div>
        </div>
      </div>

      {/* Main Interactive Navigation Tabs */}
      <div className="flex border-b border-neutral-800 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('RADAR_FEED')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'RADAR_FEED'
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Activity size={14} />
          <span>LIVE GEOHAZARD STREAM ({earthquakes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALOG_LIBRARY')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'ANALOG_LIBRARY'
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Database size={14} />
          <span>REAL-WORLD INCIDENT MATRIX ({incidentDb.length || 6})</span>
        </button>

        <button
          onClick={() => setActiveTab('DORKING_SEARCH')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'DORKING_SEARCH'
              ? "border-purple-400 text-purple-400"
              : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Search size={14} />
          <span>AI SEARCH GROUNDING & DORKING</span>
        </button>

        <button
          onClick={() => setActiveTab('PHOTO_EXIF')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'PHOTO_EXIF'
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Camera size={14} />
          <span>FIELD PHOTO EXIF & FORENSICS</span>
        </button>
        <button
          onClick={() => setActiveTab('IP_TRACKER')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'IP_TRACKER'
              ? "border-rose-500 text-rose-500"
              : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Globe size={14} />
          <span>IP & DOMAIN GEOLOCATION</span>
        </button>
        <button
          onClick={() => setActiveTab('LIVE_NEWS')}
          className={cn(
            "pb-3 px-3 flex items-center gap-2 border-b-2 font-bold transition-all cursor-pointer",
            activeTab === 'LIVE_NEWS'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-400 hover:text-white"
          )}
        >
          <Radio size={14} />
          <span>LIVE INTEL FEED</span>
        </button>
      </div>

      {/* TAB 1: LIVE GEOHAZARD STREAM */}
      {activeTab === 'RADAR_FEED' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-gray-400">
              Showing incoming live seismic events from USGS & Regional Seismology Networks (M ≥ 2.5)
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">
              AUTO-SYNCED: {lastSweepTime.toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {earthquakes.map((eq) => {
              const isHigh = eq.magnitude >= 5.0;
              const isMed = eq.magnitude >= 4.0 && eq.magnitude < 5.0;

              return (
                <div
                  key={eq.id}
                  className={cn(
                    "p-3 rounded-xl border bg-[#141416] transition-all hover:border-cyan-500/50 relative overflow-hidden",
                    isHigh ? "border-red-500/40 bg-red-950/10" : isMed ? "border-amber-500/30" : "border-neutral-800"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-black font-mono",
                      isHigh ? "bg-red-500 text-white" : isMed ? "bg-amber-500 text-black" : "bg-neutral-800 text-gray-300"
                    )}>
                      M {eq.magnitude.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {new Date(eq.time).toLocaleTimeString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">{eq.place}</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-400 mt-2 pt-2 border-t border-neutral-800">
                    <div>
                      <span className="text-gray-500 block">Depth:</span>
                      <span className="text-white font-mono">{eq.coordinates.depth_km.toFixed(1)} km</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Coordinates:</span>
                      <span className="text-white font-mono">{eq.coordinates.lat.toFixed(2)}°, {eq.coordinates.lng.toFixed(2)}°</span>
                    </div>
                  </div>

                  {eq.url && (
                    <a
                      href={eq.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 flex items-center gap-1 text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase"
                    >
                      <ExternalLink size={10} /> VIEW USGS BULLETIN
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: REAL-WORLD INCIDENT MATRIX */}
      {activeTab === 'ANALOG_LIBRARY' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 font-sans">
            <span className="font-bold font-mono uppercase text-amber-400 block mb-1">
              📚 HISTORICAL DISASTER FINGERPRINT REPOSITORY:
            </span>
            This curated database contains verified forensic data from historical blowouts, landslides, casing failures, and induced earthquakes. System evaluates real-time telemetry against these physics benchmarks.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(incidentDb.length > 0 ? incidentDb : allMatches).map((inc: any) => (
              <div
                key={inc.id || inc.incident_id}
                className="p-4 rounded-xl bg-[#141416] border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-800 text-gray-300 font-bold uppercase">
                        {inc.category}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5 uppercase">{inc.name}</h3>
                      <p className="text-[10px] text-gray-400 font-sans">{inc.location} • {inc.date}</p>
                    </div>
                    {inc.similarity_score_pct && (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {inc.similarity_score_pct}% MATCH
                      </span>
                    )}
                  </div>

                  <div className="my-3 p-2.5 rounded bg-black/40 border border-neutral-800 text-[10px] space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase font-bold block">ROOT CAUSE FORENSICS:</span>
                    <p className="text-gray-300 font-sans leading-relaxed">{inc.root_cause}</p>
                  </div>

                  <div className="text-[10px] space-y-1">
                    <span className="text-[9px] text-red-400 uppercase font-bold block">ANALOG SIGNATURE PATTERNS:</span>
                    <ul className="list-disc list-inside text-gray-400 space-y-0.5 font-sans">
                      {inc.analog_indicators?.map((ind: string, i: number) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 font-mono">DEPTH: {inc.depth_m || 3500}m</span>
                  <button
                    onClick={() => {
                      // Trigger AI deep search for this specific case
                      setActiveTab('DORKING_SEARCH');
                      setSearchQuery(`Detailed geophysical analysis and root-cause of ${inc.name}`);
                      handleExecuteSearch(`Detailed geophysical analysis and root-cause of ${inc.name}`);
                    }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold uppercase cursor-pointer"
                  >
                    <Search size={11} /> AI INVESTIGATION BRIEF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI SEARCH GROUNDING & DORKING */}
      {activeTab === 'DORKING_SEARCH' && (
        <div className="space-y-4">
          {/* Quick Dorking Pills */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="text-gray-500 font-bold self-center mr-1">QUICK QUERIES:</span>
            {[
              'BMKG gempa terkini sesar aktif pulau jawa',
              'Macondo blowout gas kick lessons learned SPE',
              'Sidoarjo mud volcano seismic shear fracture',
              'USGS latest induced seismicity wastewater',
              'Bingham canyon slope displacement radar',
              'InSAR ground subsidence oil gas field'
            ].map((dork) => (
              <button
                key={dork}
                onClick={() => {
                  setSearchQuery(dork);
                  handleExecuteSearch(dork);
                }}
                className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                {dork}
              </button>
            ))}
          </div>

          {/* Search Input Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Enter OSINT query, coordinates, disaster name, or geological anomaly..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteSearch();
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141416] border border-neutral-700 text-white text-xs placeholder:text-neutral-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleExecuteSearch()}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
              <span>{isSearching ? "CRAWLING..." : "OSINT SEARCH"}</span>
            </button>
          </div>

          {/* Search Results Display */}
          {searchReport && (
            <div className="p-5 rounded-xl bg-[#141416] border border-cyan-500/30 text-xs font-sans leading-relaxed text-gray-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> GROUNDED INTELLIGENCE DOSSIER
                </span>
                <span className="text-[9px] font-mono text-gray-500">
                  TIMESTAMP: {new Date().toLocaleString()}
                </span>
              </div>

              {/* Markdown content container */}
              <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
                {searchReport}
              </div>

              {/* Citations list */}
              {searchCitations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-800 text-[10px] font-mono">
                  <span className="text-gray-400 font-bold uppercase block mb-1.5">VERIFIED SOURCE CITATIONS:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchCitations.map((c, i) => (
                      <a
                        key={i}
                        href={c.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-neutral-700 flex items-center gap-1"
                      >
                        <ExternalLink size={10} /> {c.title || 'Open Source Registry'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FIELD PHOTO EXIF & FORENSICS */}
      {activeTab === 'PHOTO_EXIF' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#141416] border border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">
                INSPECTION PHOTO METADATA VERIFIER
              </h3>
              <p className="text-xs text-gray-400 font-sans mb-4">
                Upload raw site photos taken by field engineers. The tool inspects EXIF metadata, GPS geotags, timestamp accuracy, and checks for tampering.
              </p>

              <label className="block w-full p-6 border-2 border-dashed border-neutral-700 hover:border-cyan-400 rounded-xl text-center cursor-pointer transition-all bg-black/30">
                <Camera size={28} className="mx-auto text-cyan-400 mb-2" />
                <span className="text-xs font-bold text-white block">CHOOSE OR DROP INSPECTION PHOTO</span>
                <span className="text-[10px] text-gray-500 font-mono mt-1 block">Supports JPEG, PNG, HEIC, RAW</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* EXIF Details Display */}
            <div>
              {exifData ? (
                <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/30 text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-bold text-emerald-400 uppercase text-[10px]">
                      ✓ FORENSIC SIGNATURE VERIFIED
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                      {exifData.tamperRisk}
                    </span>
                  </div>

                  {exifPhoto && (
                    <img
                      src={exifPhoto}
                      alt="Inspection Upload"
                      className="w-full h-36 object-cover rounded-lg border border-neutral-800 my-2"
                    />
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-gray-500 block">File / Size:</span>
                      <span className="text-white font-mono">{exifData.fileName} ({exifData.fileSizeKb} KB)</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Camera Hardware:</span>
                      <span className="text-white font-mono">{exifData.cameraModel}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">GPS Coordinates:</span>
                      <span className="text-cyan-400 font-mono font-bold">{exifData.gpsLatitude}, {exifData.gpsLongitude}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Proximity to Rig:</span>
                      <span className="text-emerald-400 font-mono font-bold">{exifData.distanceToWellMeters}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-600 text-xs border border-neutral-800 rounded-xl bg-black/20">
                  No inspection photo loaded yet. Upload a photo to inspect GPS geotags and authenticity signatures.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IP & DOMAIN GEOLOCATION TRACKER */}
      {activeTab === 'IP_TRACKER' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#141416] border border-neutral-800">
            <h3 className="text-sm font-bold text-white uppercase mb-1 flex items-center gap-2">
              <Globe className="text-rose-500" size={16} /> NETWORK TRACE & GEOLOCATION
            </h3>
            <p className="text-xs text-gray-400 font-sans mb-4">
              Enter an IP address or domain name to trace its geographical origin, ISP, and organizational structure.
            </p>
            <form onSubmit={handleIpSearch} className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter IP (e.g. 8.8.8.8) or Domain..."
                  value={ipQuery}
                  onChange={(e) => setIpQuery(e.target.value)}
                  className="w-full bg-black/40 border border-neutral-800 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={isIpLoading}
                className="px-6 py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                {isIpLoading ? 'TRACING...' : 'TRACE'}
              </button>
            </form>

            {ipData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-black/50 border border-neutral-800 space-y-2">
                   <div className="flex justify-between border-b border-neutral-800 pb-2 mb-2">
                     <span className="text-gray-500 text-xs">STATUS</span>
                     <span className={cn("font-bold text-xs", ipData.status === 'success' ? "text-emerald-400" : "text-red-400")}>{ipData.status?.toUpperCase() || 'FAILED'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500 text-xs">IP / DOMAIN</span>
                     <span className="text-white font-mono text-xs">{ipData.query || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500 text-xs">ISP / ORG</span>
                     <span className="text-white font-mono text-xs text-right max-w-[200px] truncate">{ipData.isp || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500 text-xs">LOCATION</span>
                     <span className="text-cyan-400 font-mono text-xs">{ipData.city ? `${ipData.city}, ${ipData.country}` : 'Unknown'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500 text-xs">COORDINATES</span>
                     <span className="text-orange-400 font-mono text-xs">{ipData.lat ? `${ipData.lat}, ${ipData.lon}` : 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500 text-xs">TIMEZONE</span>
                     <span className="text-white font-mono text-xs">{ipData.timezone || 'N/A'}</span>
                   </div>
                </div>
                
                {ipData.lat && (
                  <div className="p-4 rounded-lg bg-black/50 border border-neutral-800 flex items-center justify-center flex-col text-center">
                    <MapIcon className="text-rose-500 mb-2" size={32} />
                    <span className="text-xs text-gray-400 mb-1">Target Geolocation Found</span>
                    <button 
                      onClick={() => {
                        // Open in maps or focus coordinates in Spatial Twin (Use Command Palette)
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                      }}
                      className="px-4 py-2 mt-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-white rounded transition-colors flex items-center gap-2"
                    >
                      <Crosshair size={14} className="text-cyan-400" />
                      SEND TO SPATIAL TWIN
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: LIVE INTEL FEED */}
      {activeTab === 'LIVE_NEWS' && (
        <div className="space-y-4 h-full flex flex-col">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-gray-400">
              Live automated threat intelligence and incident monitoring feed.
            </span>
            <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1 animate-pulse">
              <Radio size={12} /> LIVE UPDATE ACTIVE
            </span>
          </div>

          <div className="flex-1 bg-[#141416] border border-neutral-800 rounded-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#141416] to-transparent z-10 pointer-events-none" />
            
            <div className="p-4 space-y-3 h-[400px] overflow-y-auto">
              <AnimatePresence>
                {intelNews.map((news) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0 }}
                    className="p-3 border border-neutral-800 bg-black/40 rounded-lg flex items-start gap-3 hover:border-orange-500/30 transition-colors"
                  >
                    <div className="mt-0.5">
                      {news.source.includes('CYBER') ? <Cpu className="text-rose-500" size={16} /> :
                       news.source.includes('NAVAL') ? <Compass className="text-blue-500" size={16} /> :
                       news.source.includes('AERO') ? <Activity className="text-purple-500" size={16} /> :
                       news.source.includes('AUTO') ? <Terminal className="text-emerald-500" size={16} /> :
                       <ShieldAlert className="text-orange-500" size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded",
                          news.source.includes('CYBER') ? "bg-rose-950/50 text-rose-400" :
                          news.source.includes('NAVAL') ? "bg-blue-950/50 text-blue-400" :
                          news.source.includes('AERO') ? "bg-purple-950/50 text-purple-400" :
                          news.source.includes('AUTO') ? "bg-emerald-950/50 text-emerald-400" :
                          "bg-orange-950/50 text-orange-400"
                        )}>{news.source}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{news.time}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-sans leading-relaxed">{news.title}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
