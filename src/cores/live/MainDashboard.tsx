/**
 * @license
 * Copyright 2026 GeoAI Pro Coordinator
 * Licensed under the Apache License, Version 2.0
 * LICENSE LOCK VERIFIED: IVAN HUTABARAT (SECURED SEAL)
 * SYSTEM REBOOT SIGNATURE: CACHE_BUST_v4.0.4_GEOAI
 */

import React, { useState, useEffect, Component, ReactNode, Suspense, lazy } from 'react';
import { verifyLicenseLock } from './lib/identityValidator';
// validateIdentity from './lib/identityValidator';

console.log("App mounted successfully");

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 font-mono text-red-500 bg-black min-h-screen">
          <h1 className="text-2xl font-bold mb-4">CRITICAL SYSTEM FAILURE</h1>
          <p className="mb-4">The application crashed while rendering.</p>
          <pre className="text-xs bg-[#111] p-4 rounded border border-red-900 block overflow-auto">
            {this.state.error?.message}
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-900 text-white hover:bg-red-800 rounded"
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

import { 
  Activity, 
  Map as MapIcon, 
  Zap, 
  Waves, 
  Wind, 
  Thermometer, 
  Gem, 
  Bot, 
  Upload, 
  Shield,
  LayoutDashboard,
  Search,
  Sliders,
  Cpu,
  Unplug,
  Users,
  Share2,
  Clock,
  Terminal,
  Loader2,
  Droplets,
  TestTube,
  Radio,
  Mountain,
  Book,
  Anchor,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { 
  GeoModule, 
  GeoFile 
} from './types';
import { cn } from './lib/utils';
import { ModuleErrorBoundary } from '../../components/ModuleErrorBoundary';
import { ModuleSkeleton } from '../../components/ModuleSkeleton';

// Core Imports
const CentralCommand = lazy(() => import('./components/Modules/CentralCommand'));
const SeismicModule = lazy(() => import('./components/Modules/SeismicModule'));
const WellLoggingModule = lazy(() => import('./components/Modules/WellLoggingModule'));
const SpatialTwin = lazy(() => import('./components/Modules/SpatialTwin'));
const SimulationModule = lazy(() => import('./components/Modules/SimulationModule'));
const SystemDiagnostics = lazy(() => import('./components/Modules/SystemDiagnostics'));
const MasterGeoSynthesizer = lazy(() => import('./components/Modules/AIConsultantModule'));
const ManualBookSuite = lazy(() => import('./components/Modules/ManualBookSuite'));

// Activated Spatial Modules
const GravityMagModule = lazy(() => import('./components/Modules/GravityMagModule'));
const SecurityAndWhatsAppPanel = lazy(() => import('./components/Modules/SecurityAndWhatsAppPanel'));
const ElectricalEMModule = lazy(() => import('./components/Modules/ElectricalEMModule'));
const GPRModule = lazy(() => import('./components/Modules/GPRModule'));
const GeochemModule = lazy(() => import('./components/Modules/GeochemModule'));
const MeteorologyModule = lazy(() => import('./components/Modules/MeteorologyModule'));
const GroundwaterModule = lazy(() => import('./components/Modules/GroundwaterModule'));
const SoilPHModule = lazy(() => import('./components/Modules/SoilPHModule'));
const BoreholeRadiometricModule = lazy(() => import('./components/Modules/BoreholeRadiometricModule'));
const GeotechnicalTiltExtensoModule = lazy(() => import('./components/Modules/GeotechnicalTiltExtensoModule'));
const GasAirQualityModule = lazy(() => import('./components/Modules/GasAirQualityModule'));
const MiroFishModule = lazy(() => import('./components/Modules/MiroFishModule'));
const GeoOSINTModule = lazy(() => import('./components/Modules/GeoOSINTModule'));

// Shared Components
import SwarmRoom from './components/Shared/SwarmRoom';
import SeismicRadar from './components/Shared/SeismicRadar';
import FileUploader from './components/Shared/FileUploader';
import ApiHealthMonitor from './components/Shared/ApiHealthMonitor';
import AnalyticsDrawer from './components/Modules/AnalyticsDrawer';
import GeoAILogo from './components/Shared/GeoAILogo';
import LogoPhilosophyModal from './components/Shared/LogoPhilosophyModal';
import ShareWorkspaceModal from './components/Shared/ShareWorkspaceModal';
import SystemControlDrawer from './components/Shared/SystemControlDrawer';
import { WhatsAppBotMenu } from './components/Shared/WhatsAppBotMenu';
import AgentCompanion from '../../components/Shared/AgentCompanion';

// Hooks
import { useApiQueue } from './hooks/useApiQueue';
import { useApiMonitorStore } from './store/ApiMonitorStore';
import { BRANDING } from './constants/BrandingConstants';

import { AppContext, AppProvider, useAppContext, ApiMode } from './context/AppContext';
import { GlobalGeoProvider, useGlobalGeoContext } from './context/GlobalGeoContext';
import { fetchHistoricalState } from '../../lib/geoSync';

// --- Components ---
const SidebarItem = ({ 
  icon: Icon, 
  label, 
  to
}: { 
  icon: any, 
  label: string, 
  to: string
}) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 border-l-2 text-left cursor-pointer",
      isActive 
        ? "bg-white/5 border-[#FF5722] text-white" 
        : "border-transparent text-[#888888] hover:text-white hover:bg-white/5"
    )}
  >
    {({ isActive }) => (
      <>
        <Icon size={16} className={isActive ? "text-[#FF5722]" : ""} />
        <span className="text-xs font-semibold tracking-tight">{label}</span>
      </>
    )}
  </NavLink>
);

const ModuleHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-6">
    <h1 className="text-xl font-bold tracking-tight text-white mb-0.5 uppercase italic font-mono">{title}</h1>
    {subtitle && <p className="text-[11px] text-[#888888]">{subtitle}</p>}
  </div>
);

// --- App Content ---
import { useAuth } from '../../context/AuthContext';

const WithError = ({ Component, name }: { Component: React.ComponentType<any>, name: string }) => (
  <ModuleErrorBoundary moduleName={name}>
    <Suspense fallback={<ModuleSkeleton name={name} />}>
      <Component />
    </Suspense>
  </ModuleErrorBoundary>
);

function MainDashboard() {
  const { isAuthenticated, requireAuth } = useAuth();
  
  const handleDashboardClickCapture = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.stopPropagation();
      e.preventDefault();
      requireAuth(() => {});
    }
  };

  const location = useLocation();
  const activeModulePath = location.pathname === '/' ? GeoModule.DASHBOARD : location.pathname.slice(1) as GeoModule;

  const { overwriteAllState } = useGlobalGeoContext();
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);

  useEffect(() => {
    let active = true;
    const runAutoRestore = async () => {
      if (overwriteAllState) {
        setIsTimeTraveling(true);
        try {
          console.log("[TIME-TRAVEL] Auto-reverting system to May 30 18:21 checkpoint...");
          const data = await fetchHistoricalState();
          if (data && data.globalData && data.rawPayloads && active) {
            overwriteAllState(data.globalData, data.rawPayloads);
          }
        } catch (e) {
          console.error("[TIME-TRAVEL] Auto-restore boot failed:", e);
        } finally {
          if (active) setIsTimeTraveling(false);
        }
      }
    };
    runAutoRestore();
    return () => {
      active = false;
    };
  }, [overwriteAllState]);

  const [isCompromised, setIsCompromised] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navAltText, setNavAltText] = useState(false);
  const [reseedKey, setReseedKey] = useState(0);

  useEffect(() => {
    const handleReseed = () => {
      setReseedKey(prev => prev + 1);
    };
    window.addEventListener('mfa_reseed_success', handleReseed);
    return () => window.removeEventListener('mfa_reseed_success', handleReseed);
  }, []);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, BRANDING.TRANSITION_DELAY_MS);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setNavAltText(prev => !prev);
    }, Math.floor(BRANDING.TRANSITION_DELAY_MS / 3));
    return () => clearInterval(interval);
  }, [isNavigating]);

  const [licenseLocked, setLicenseLocked] = useState(false);

  useEffect(() => {
    try {
      const isLicenseValid = verifyLicenseLock();
      if (!isLicenseValid) {
        console.error("[LICENSE ERROR] Security Lock Violation. Invalid Licensee signature.");
        setLicenseLocked(true);
      } else {
        console.log("[LICENSE VERIFICATION] Success. Licensed to IVAN HUTABARAT.");
      }
    } catch (err) {
      console.error("[Integrity Error] failed validation check:", err);
      setIsCompromised(true);
    }
  }, []);

  const [files, setFiles] = useState<GeoFile[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSystemDrawerOpen, setIsSystemDrawerOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportText, setSupportText] = useState("");
  const [supportSending, setSupportSending] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [supportErr, setSupportErr] = useState("");

  const handleSupportSubmit = async () => {
    if (!supportText.trim()) return;
    setSupportSending(true);
    setSupportErr("");
    try {
      const res = await fetch("/api/support/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: supportText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setSupportSuccess(true);
        setSupportText("");
        setTimeout(() => {
          setSupportSuccess(false);
          setIsSupportOpen(false);
        }, 2200);
      } else {
        setSupportErr(data.error || "Transmission fail.");
      }
    } catch (e) {
      setSupportErr("Failed connecting to proxy server.");
    } finally {
      setSupportSending(false);
    }
  };

  const [drillCoords, setDrillCoords] = useState<{ x: number; y: number; z: number } | null>({x: 120, y: 340, z: 450});

  const [systemClock, setSystemClock] = useState("");
  useEffect(() => {
    setSystemClock(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setSystemClock(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [lang, setLang] = useState<'ID' | 'EN'>(() => {
    try {
      return (localStorage.getItem('geoai_lang') as 'ID' | 'EN') || 'ID';
    } catch {
      return 'ID';
    }
  });

  const toggleLang = () => {
    const nextLang = lang === 'ID' ? 'EN' : 'ID';
    try {
      localStorage.setItem('geoai_lang', nextLang);
    } catch {}
    setLang(nextLang);
    window.dispatchEvent(new Event('geoai_lang_change'));
  };

  const t = (en: string, id: string) => (lang === 'ID' ? id : en);

  const { isProcessing, statusMessage, queueLength } = useApiQueue();
  const { apiMode, toggleApiMode, dimensionMode, toggleDimensionMode, performanceMode, themeMode, fps } = useAppContext();

  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [isSwitchingMode, setIsSwitchingMode] = useState<string | null>(null);
  const [blurPhase, setBlurPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5; // Reaches 100 in exactly 4.0 seconds
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleToggleModeIntercept = () => {
    setIsSwitchingMode('API');
    setBlurPhase(0);

    setTimeout(() => setBlurPhase(1), 1200);
    setTimeout(() => setBlurPhase(2), 2600);
    setTimeout(() => {
      setIsSwitchingMode(null);
      toggleApiMode();
    }, 4000);
  };

  const handleDimensionModeIntercept = () => {
    setIsSwitchingMode('DIMENSION');
    setBlurPhase(0);

    setTimeout(() => setBlurPhase(1), 3000);
    setTimeout(() => setBlurPhase(2), 7000);
    setTimeout(() => {
      setIsSwitchingMode(null);
      toggleDimensionMode();
    }, 10000);
  };

  const handleUpload = (newFiles: File[]) => {
    const geoFiles: GeoFile[] = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: f.size,
      type: f.name.split('.').pop() as any,
      module: getModuleFromExtension(f.name.split('.').pop() || ""),
      uploadedAt: new Date(),
      status: 'raw'
    }));
    setFiles(prev => [...prev, ...geoFiles]);
  };

  const getModuleFromExtension = (ext: string): GeoModule => {
    const lower = ext.toLowerCase();
    if (lower === 'sgy' || lower === 'segy') return GeoModule.SEISMIC;
    if (lower === 'las') return GeoModule.WELL_LOGGING;
    if (lower === 'shp' || lower === 'kml' || lower === 'tiff') return GeoModule.SPATIAL;
    return GeoModule.DASHBOARD;
  };

  if (isCompromised) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-red-500 font-mono z-[99999] p-8 select-none">
        <div className="max-w-md text-center space-y-4">
          <span className="text-5xl animate-pulse">☠</span>
          <h1 className="text-lg font-bold uppercase tracking-widest border-b border-red-900 pb-2">CRITICAL EXCEPTION</h1>
          <p className="text-sm text-gray-400 font-bold leading-relaxed">
            System Integrity Compromised. Unauthorized modification detected.
          </p>
          <span className="text-[10px] text-gray-600 block pt-1 font-semibold">ERROR_CODE: FATAL_INTEGRITY_EXCEPTION</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {isBooting && (
        <div 
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center text-white select-none" 
          style={{ backdropFilter: 'blur(25px) brightness(40%)', background: 'radial-gradient(circle, rgba(16,16,24,0.8) 0%, rgba(10,10,12,1) 100%)' }}
        >
          <div className="mb-6 scale-110">
            <GeoAILogo size={140} layout="vertical" glow={true} />
          </div>
          <p className="font-mono text-sm tracking-wider text-cyan-400 mb-2 text-center px-4">
            [BOOT] Progress: {Math.floor(bootProgress)}%
          </p>
          <p className="font-mono text-[11px] text-gray-500 mb-6 text-center px-4 uppercase tracking-widest">
            {bootProgress < 100 ? 'Initializing telemetry framework...' : 'System calibration completed successfully'}
          </p>
          <div className="w-64 h-1.5 bg-[#111] overflow-hidden rounded mb-5 border border-white/5">
             <div className="h-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] transition-all duration-100" style={{ width: `${bootProgress}%` }} />
          </div>
          <button 
            disabled={bootProgress < 100}
            onClick={(e) => { e.stopPropagation(); if (bootProgress >= 100) setIsBooting(false); }} 
            className={`px-6 py-3 font-mono text-[11px] font-bold tracking-widest transition-all rounded uppercase border ${
              bootProgress < 100
                ? "bg-gray-800/20 border-gray-700/30 text-gray-500 cursor-not-allowed"
                : "bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.15)]"
            }`}
          >
            {bootProgress < 100 ? 'SYSTEM INITIALIZING...' : 'ENTER WORKSPACE'}
          </button>
        </div>
      )}
      <div id="dashboard-root" className="flex h-screen bg-[#111111] text-white overflow-hidden font-sans" onClickCapture={handleDashboardClickCapture}>

      <AnimatePresence>
        {isSwitchingMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[88888] flex flex-col items-center justify-center"
            style={{ backdropFilter: 'blur(16px)', background: 'rgba(10,10,12,0.75)' }}
          >
            <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-[#222] bg-[#0c0c0d]/95 shadow-[0_0_30px_rgba(0,255,204,0.15)] text-center w-full max-w-lg relative">
              {/* Geological geometric corner accents - #00ffcc */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00ffcc]"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00ffcc]"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00ffcc]"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00ffcc]"></div>
              
              <GeoAILogo size={56} className="mb-4 drop-shadow-[0_0_10px_rgba(0,255,204,0.8)]" />
              
              <h3 className="text-sm font-extrabold text-[#00ffcc] tracking-widest font-mono uppercase mb-0.5">
                {BRANDING.APP_NAME} {BRANDING.APP_VERSION}
              </h3>
              <p className="text-[9px] font-mono text-gray-500 tracking-wider mb-2">
                {import.meta.env.VITE_SECURITY_CORE}
              </p>
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#00ffcc]/50 to-transparent mb-3.5"></div>
              
              {/* 10-Second Terminal cascade logging console */}
              <div className="w-full bg-[#111] border border-[#222] p-4 text-left font-mono rounded h-48 overflow-y-auto mt-2">
                <div className="flex items-center gap-2 mb-2">
                   <Loader2 size={12} className="animate-spin text-green-500" />
                   <span className="text-[10px] text-green-500 uppercase opacity-80">&gt; CALIBRATING SYSTEM MODALITIES...</span>
                </div>
                <div className="text-[10px] text-green-400 leading-relaxed break-words">
                  {blurPhase >= 0 && (
                    <p className="mb-2 uppercase opacity-80">&gt; Tracking core hashes initialization: {import.meta.env.VITE_DEV_SIGNATURE || "0xGEOAI_C0D3"}...]</p>
                  )}
                  {blurPhase >= 1 && (
                    <div className="mb-2">
                      <p className="uppercase opacity-90 font-bold">&gt; {isSwitchingMode === 'API' ? (apiMode === "LIVE" ? "TEARING DOWN 500+ LIVE AGENT NEURAL NETWORKS..." : "ESTABLISHING MASS MIGRATION OF 500+ AGENT PIPELINES INTO TARGET PROCESSING BRAIN...") : (dimensionMode === '3D' ? "FLATTENING 3D VOLUMETRIC MESH TO 2D CROSS-SECTIONAL PROFILES..." : "UPSCALE 2D TO COMPLEX 3D VOLUMETRIC CUBE MESH...")}</p>
                      <div className="pl-2 space-y-0.5 opacity-70">
                         <p>[OK] Toggling Swarm Matrix Core Context hook...</p>
                         <p>[OK] Migrating 500+ concurrent analytical simulation nodes...</p>
                         <p>[OK] Flush existing Memory Dumps & Vectors.</p>
                         <p>[OK] Re-routing Seismic (.segy) operational pipelines.</p>
                         <p>[OK] Re-routing Well Logging (.las) - Top-to-Bottom depth matrix.</p>
                         <p>[OK] Spatial Twin (.shp) agent synchronization established.</p>
                         <p>[OK] Electrical & EM arrays swarm routing successful.</p>
                         <p>[OK] Gravity & Magnetic cognitive clusters initialized.</p>
                         <p>[OK] GPR Waveform array computational nodes scaling.</p>
                         <p>[OK] Rock Geochem matrices mapped to localized subsets.</p>
                         <p>[OK] Meteorology, Groundwater and Geotech arrays successfully bound.</p>
                         <p>[OK] Flushing stale database queues...</p>
                      </div>
                    </div>
                  )}
                  {blurPhase >= 2 && (
                    <div className="mt-2 text-[#fff]">
                      <p className="font-bold text-[12px] uppercase tracking-widest break-words whitespace-pre-wrap">{isSwitchingMode === 'API' ? (apiMode === "LIVE" ? "✦ RUNTIME NUMERICAL INVERSION // LOCAL COMPUTATIONAL ENGINE ACTIVATED SUCCESSFUL" : "✦ LIVE INFERENCE // EXTERNAL COGNITIVE HUB CONNECTED SUCCESSFUL") : (dimensionMode === '3D' ? "✦ 2D PROFILER RENDER ACTIVATED" : "✦ 3D VOXEL CLOUD RENDER INJECTED")}</p>
                      <p className="text-[9px] text-green-500 mt-1">&gt; SECURE TERMINATION: {import.meta.env.VITE_DEV_SIGNATURE || "0xGEOAI_C0D3"}</p>
                    </div>
                  )}
                  <span className="inline-block w-2.5 h-3 bg-green-500 animate-pulse ml-1 align-middle mt-1" />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar navigation */}
      <aside className="w-56 border-r border-[#333333] flex flex-col pt-4 bg-[#141414] shrink-0">
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <GeoAILogo size={24} glow={true} />
            <span className="text-md font-bold tracking-tighter uppercase italic text-white flex items-center">{BRANDING.APP_NAME}</span>
          </div>
          <p className="text-[9px] text-[#FF5722] font-mono leading-none font-bold uppercase tracking-widest mb-2">Digital Twin {BRANDING.APP_VERSION}</p>
          <div className="text-[8px] font-mono text-[#777] uppercase leading-tight select-none border-t border-[#222] pt-2 mb-1">
            🔒 License Lock:
            <span className="text-[#00E5FF] block mt-0.5 font-bold">BY IVAN HUTABARAT</span>
          </div>
          <button
            onClick={async () => {
              if (overwriteAllState) {
                setIsTimeTraveling(true);
                try {
                  const data = await fetchHistoricalState();
                  if (data && data.globalData && data.rawPayloads) {
                    overwriteAllState(data.globalData, data.rawPayloads);
                  }
                } catch (e) {
                  console.error("Manual time-travel sync failed:", e);
                } finally {
                  setIsTimeTraveling(false);
                }
              }
            }}
            disabled={isTimeTraveling}
            title="Restore state to May 30 18:21"
            className="w-full text-left py-1.5 px-2 rounded-md bg-[#FF5722]/10 hover:bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/30 uppercase tracking-widest text-[8px] font-mono font-black transition-all flex items-center justify-between cursor-pointer"
          >
            <span>{isTimeTraveling ? '⏳ SYNCING...' : '⚡ TIME-TRAVEL (18:21)'}</span>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto font-mono scrollbar-thin">
          <SidebarItem icon={LayoutDashboard} label={t("Command Center", "Pusat Komando")} to={`/${GeoModule.DASHBOARD}`} />
          
          <div className="px-4 py-2">
            <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">{t("Primary Arrays", "Array Utama")}</span>
          </div>
          <SidebarItem icon={Waves} label={t("Seismic (.segy)", "Seismik (.segy)")} to={`/${GeoModule.SEISMIC}`} />
          <SidebarItem icon={Activity} label={t("Well Logging (.las)", "Log Sumur (.las)")} to={`/${GeoModule.WELL_LOGGING}`} />
          <SidebarItem icon={MapIcon} label={t("Spatial Twin (.shp)", "Kembaran Spasial (.shp)")} to={`/${GeoModule.SPATIAL}`} />
          <SidebarItem icon={Anchor} label={t("MiroFish Sonar", "Sonar MiroFish")} to={`/${GeoModule.MIROFISH}`} />
          
          <div className="px-4 py-2">
            <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">{t("Sensing Modules", "Modul Sensor")}</span>
          </div>
          <SidebarItem icon={Gem} label={t("Gravity & Magnetic", "Gravitasi & Magnetik")} to={`/${GeoModule.GRAVITY_MAG}`} />
          <SidebarItem icon={Zap} label={t("Electrical & EM", "Elektrik & Elektromagnet")} to={`/${GeoModule.ELECTRICAL}`} />
          <SidebarItem icon={Unplug} label={t("GPR Waveform", "Gelombang GPR")} to={`/${GeoModule.GPR}`} />
          <SidebarItem icon={Thermometer} label={t("Rock Geochem", "Geokimia Batuan")} to={`/${GeoModule.GEOCHEM}`} />
          <SidebarItem icon={Wind} label={t("Meteorology", "Meteorologi")} to={`/${GeoModule.METEO}`} />
          
          <div className="px-4 py-2 mt-2">
            <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">{t("Instruments", "Instrumen Lapangan")}</span>
          </div>
          <SidebarItem icon={Droplets} label={t("Groundwater & Hydro", "Air Tanah & Hidro")} to={`/${GeoModule.GROUNDWATER}`} />
          <SidebarItem icon={TestTube} label={t("Soil pH & Env", "pH Tanah & Lingkungan")} to={`/${GeoModule.SOIL_PH}`} />
          <SidebarItem icon={Radio} label={t("Borehole Radiometric", "Radiometrik Bor")} to={`/${GeoModule.BOREHOLE_RADIOMETRIC}`} />
          <SidebarItem icon={Mountain} label={t("Geotech Tilt & Extenso", "Kemiringan Geoteknis")} to={`/${GeoModule.GEOTECHNICAL_TILT}`} />
          <SidebarItem icon={Wind} label={t("Gas & Air Quality", "Gas & Kualitas Udara")} to={`/${GeoModule.GAS_AIR_QUALITY}`} />
          
          <div className="px-4 py-2 mt-2">
            <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">{t("Cognitive Lab", "Lab Kognitif")}</span>
          </div>
          <SidebarItem icon={Globe} label={t("Geo-OSINT Radar", "Radar Geo-OSINT")} to={`/${GeoModule.OSINT}`} />
          <SidebarItem icon={Bot} label={t("Master Geo-Synthesizer", "Master Geo-Sintetis")} to={`/${GeoModule.AI_CONSULTANT}`} />
          <SidebarItem icon={Users} label={t("Simulation Sandbox", "Sandbox Simulasi")} to={`/${GeoModule.SIMULATION}`} />
          <SidebarItem icon={Terminal} label={t("Diagnostics Console", "Konsol Diagnostik")} to={`/${GeoModule.DIAGNOSTICS}`} />
          <SidebarItem icon={Shield} label={t("Security & WA Bot", "Keamanan & Bot WA")} to={`/${GeoModule.SECURITY}`} />
          <SidebarItem icon={Book} label={t("Enterprise Manual Book", "Buku Manual Perusahaan")} to={`/${GeoModule.MANUAL_BOOK}`} />
        </nav>

        {/* Embedded Radar Warning Scan Widget */}
        <div className="p-3 border-t border-[#222] flex justify-center bg-black/40 h-48 overflow-hidden">
          <SeismicRadar drillCoords={drillCoords} setDrillCoords={setDrillCoords} />
        </div>
      </aside>

      {/* Main Workspace and Right Panel Container for PDF Export Capture */}
      <div id="dashboard-capture-zone" className="flex-1 flex overflow-hidden">
        {/* Center workspace frame */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0B]">
          {/* High-Focus Navigation and Menu Transition Intercept Overlay */}
        <AnimatePresence>
          {isNavigating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center"
              style={{ backdropFilter: 'blur(16px)', background: 'rgba(10,10,12,0.75)' }}
            >
              <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-[#222] bg-[#0c0c0d]/95 shadow-2xl text-center max-w-xs relative">
                {/* Geological geometric corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00ffcc]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00ffcc]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00ffcc]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00ffcc]"></div>
                
                <GeoAILogo size={56} className="mb-4 drop-shadow-[0_0_10px_rgba(0,255,204,0.8)]" />
                
                <h3 className="text-sm font-extrabold text-[#00ffcc] tracking-widest font-mono uppercase mb-0.5">
                  {BRANDING.APP_NAME} {BRANDING.APP_VERSION}
                </h3>
                <p className="text-[9px] font-mono text-gray-500 tracking-wider mb-2">
                  {BRANDING.APP_CREDIT.toUpperCase()}
                </p>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#00ffcc]/50 to-transparent mb-3.5"></div>
                <div className="py-1 px-3 bg-[#111] rounded border border-[#222] text-[8px] font-mono tracking-widest text-[#00ffcc] animate-pulse">
                  {navAltText ? "RECALCULATING STRATA" : `SOLVING VOLUMETRICS... ${BRANDING.APP_SHORT_CREDIT.toUpperCase()}`}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top telemetry control bar */}
        <header className="h-13 border-b border-[#333333] flex items-center justify-between px-4 sm:px-6 bg-[#141416] shrink-0 z-20 gap-3">
          {/* Left section: Logo & Status Tag */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Main Header Title/Logo */}
            <div 
              onClick={() => setIsLogoModalOpen(true)}
              className="flex items-center gap-2 shrink-0 select-none cursor-pointer hover:opacity-90 active:scale-98 transition-all group"
              title="Click to decode Logo Philosophy & Sonification"
            >
              <GeoAILogo size={26} layout="horizontal" glow={true} />
              <span className="hidden sm:inline-block text-[8px] text-[#00E5FF] font-mono border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 rounded tracking-tight uppercase group-hover:border-cyan-500/40 transition-all">
                {t("Philosophy", "Filosofi")}
              </span>
              <span className="text-[10px] font-mono text-[#444] font-bold hidden sm:inline">/</span>
              <span className="text-[9px] text-[#888] font-mono uppercase tracking-widest font-semibold shrink-0 hidden md:inline">
                TWIN {BRANDING.APP_VERSION.toUpperCase()}
              </span>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-[#2a2a2e] font-mono text-[9px] select-none shrink-0">
              <span className={cn(
                "w-2 h-2 rounded-full",
                apiMode === 'LIVE' ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-amber-400 animate-pulse"
              )} />
              <span className={cn(
                "font-bold uppercase tracking-wider",
                apiMode === 'LIVE' ? "text-emerald-400" : "text-amber-400"
              )}>
                {apiMode === 'LIVE' ? "LIVE SWARM" : "LOCAL SIM"}
              </span>
              <span className="text-gray-600 font-bold">|</span>
              <span className={cn(
                "font-bold uppercase",
                dimensionMode === '3D' ? "text-purple-400" : "text-blue-400"
              )}>
                {dimensionMode}
              </span>
              <span className="text-gray-600 font-bold hidden sm:inline">|</span>
              <span className={cn(
                "font-bold uppercase hidden sm:inline",
                performanceMode === 'ECO_PERFORMANCE' ? "text-amber-300" : "text-cyan-300"
              )}>
                {performanceMode === 'ECO_PERFORMANCE' ? "ECO" : "HI-FI"}
              </span>
              <span className="text-gray-600 font-bold hidden md:inline">|</span>
              <span className={cn(
                "font-bold font-mono hidden md:inline",
                fps >= 55 ? "text-emerald-400" : "text-amber-400"
              )}>
                {fps} FPS
              </span>
            </div>

            {/* System Clock (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-gray-400 font-mono shrink-0 pl-1">
              <span className="text-gray-600 font-bold">//</span>
              <Clock size={11} className="text-gray-500" />
              <span>{systemClock}</span>
            </div>
          </div>
          
          {/* Right section: Action Buttons & Control Drawer Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Share QR Code Button */}
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] transition-all uppercase tracking-wider cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.15)] active:scale-95 shrink-0"
              title={t("Open Share & QR Code Modal", "Buka Modal Share & Kode QR")}
            >
              <Share2 size={13} className="text-[#00E5FF]" />
              <span>{t("Share QR", "Bagikan QR")}</span>
            </button>

            {/* Import Button */}
            <button 
              onClick={() => setIsUploaderOpen(true)}
              className="flex items-center gap-1.5 bg-[#FF5722] text-black px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold hover:bg-[#ff7043] transition-all uppercase tracking-wider cursor-pointer shadow-[0_0_12px_rgba(255,87,34,0.3)] active:scale-95 shrink-0"
              title={t("Import Geophysical Data (.las, .segy)", "Impor Data Geofisika")}
            >
              <Upload size={13} />
              <span>{t("Import", "Impor")}</span>
            </button>

            {/* Analytics Drawer Trigger */}
            <button 
              onClick={() => setIsAnalyticsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-[#1a1a1d] text-gray-300 border border-[#333338] px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold hover:bg-white/5 hover:border-gray-500 transition-colors uppercase tracking-wider cursor-pointer shrink-0"
            >
              <Sliders size={13} className="text-[#00E5FF]" />
              <span>{t("Analytics", "Analitik")}</span>
            </button>

            {/* System Control Drawer Trigger Button (Laci Kontrol) */}
            <button 
              onClick={() => setIsSystemDrawerOpen(prev => !prev)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border shrink-0 active:scale-95",
                isSystemDrawerOpen
                  ? "bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  : "bg-[#1d1d21] text-gray-200 border-[#38383e] hover:border-[#00E5FF]/60 hover:bg-[#25252b]"
              )}
              title={t("Open System & Telemetry Control Drawer", "Buka Laci Kontrol Sistem & Telemetri")}
            >
              <Sliders size={13} className={isSystemDrawerOpen ? "text-black" : "text-[#00E5FF]"} />
              <span className="hidden sm:inline">{t("System Controls", "Laci Kontrol")}</span>
              <span className="sm:hidden">{t("Controls", "Laci")}</span>
              <span className="hidden md:inline-block text-[8px] px-1 py-0.5 rounded bg-black/40 text-gray-300 font-mono">
                {apiMode}/{dimensionMode}
              </span>
            </button>
          </div>
        </header>

        {/* Module Render Container */}
        <section id="geoscience-module-view" className="flex-1 flex flex-col p-4 sm:p-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModulePath}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex-1 w-full h-full relative"
            >
              <Routes key={reseedKey}>
                <Route path="/" element={<Navigate to={`/${GeoModule.DASHBOARD}`} replace />} />
                <Route path={`/${GeoModule.DASHBOARD}`} element={<WithError Component={CentralCommand} name="Central Command" />} />
                <Route path={`/${GeoModule.SEISMIC}`} element={<WithError Component={SeismicModule} name="Seismic Module" />} />
                <Route path={`/${GeoModule.WELL_LOGGING}`} element={<WithError Component={WellLoggingModule} name="Well Logging" />} />
                <Route path={`/${GeoModule.SPATIAL}`} element={<WithError Component={SpatialTwin} name="Spatial Twin 3D" />} />
                <Route path={`/${GeoModule.MIROFISH}`} element={<WithError Component={MiroFishModule} name="MiroFish Analytics" />} />
                <Route path={`/${GeoModule.GRAVITY_MAG}`} element={<WithError Component={GravityMagModule} name="Gravity & Magnetic" />} />
                <Route path={`/${GeoModule.ELECTRICAL}`} element={<WithError Component={ElectricalEMModule} name="Electrical & EM" />} />
                <Route path={`/${GeoModule.GPR}`} element={<WithError Component={GPRModule} name="GPR Radar" />} />
                <Route path={`/${GeoModule.GEOCHEM}`} element={<WithError Component={GeochemModule} name="Geochemistry" />} />
                <Route path={`/${GeoModule.METEO}`} element={<WithError Component={MeteorologyModule} name="Meteorology" />} />
                <Route path={`/${GeoModule.GROUNDWATER}`} element={<WithError Component={GroundwaterModule} name="Groundwater" />} />
                <Route path={`/${GeoModule.SOIL_PH}`} element={<WithError Component={SoilPHModule} name="Soil & pH" />} />
                <Route path={`/${GeoModule.BOREHOLE_RADIOMETRIC}`} element={<WithError Component={BoreholeRadiometricModule} name="Borehole Radiometric" />} />
                <Route path={`/${GeoModule.GEOTECHNICAL_TILT}`} element={<WithError Component={GeotechnicalTiltExtensoModule} name="Geotechnical Tilt & Extenso" />} />
                <Route path={`/${GeoModule.GAS_AIR_QUALITY}`} element={<WithError Component={GasAirQualityModule} name="Gas & Air Quality" />} />
                <Route path={`/${GeoModule.OSINT}`} element={<WithError Component={GeoOSINTModule} name="Geo-OSINT Radar" />} />
                <Route path={`/${GeoModule.AI_CONSULTANT}`} element={<WithError Component={MasterGeoSynthesizer} name="Master Geo-Synthesizer" />} />
                <Route path={`/${GeoModule.SIMULATION}`} element={<WithError Component={SimulationModule} name="Simulation Engine" />} />
                <Route path={`/${GeoModule.DIAGNOSTICS}`} element={<WithError Component={SystemDiagnostics} name="System Diagnostics" />} />
                <Route path={`/${GeoModule.SECURITY}`} element={<WithError Component={SecurityAndWhatsAppPanel} name="Security & WhatsApp Panel" />} />
                <Route path={`/${GeoModule.MANUAL_BOOK}`} element={<WithError Component={ManualBookSuite} name="Manual Book Suite" />} />
                {/* Fallback routes for unbuilt components, just in case */}
                <Route path="*" element={<div className="p-8 text-[#888] font-mono">Module UI Construction...</div>} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Core System Footer status */}
        <footer className="h-6 border-t border-[#333333] bg-[#0E0E0F] px-4 flex items-center justify-between font-mono text-[9px] text-[#555555] shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[#00E5FF] font-bold tracking-wider mr-2 border-r border-[#222222] pr-4 uppercase">{import.meta.env.VITE_CHART_WATERMARK}</span>
            <span>MEM: 14.8GB / 32GB</span>
            <span>GPU_TEMP: 41.5°C</span>
            <span>API_LATENCY: 110ms</span>
          </div>
          <div className="flex items-center gap-3 italic">
            {isProcessing ? (
               <>
                 <Loader2 size={10} className="text-[#FF5722] animate-spin" />
                 <span className="text-[#FF5722] font-bold">{statusMessage.toUpperCase()} {queueLength > 0 && `(+${queueLength} IN QUEUE)`}</span>
               </>
            ) : (
               <>
                 <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                 <span>SWARM DEBATERS READY FOR INFERENCE</span>
               </>
            )}
            <span className="text-[8px] font-sans text-neutral-500 hover:text-neutral-300 transition-colors uppercase not-italic font-bold tracking-widest px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded select-none shrink-0 ml-1">
              {import.meta.env.VITE_DEV_SIGNATURE || "0xGEOAI_C0D3"}
            </span>
          </div>
        </footer>
      </main>

      {/* Right panel docked Swarm Debate Meeting Room */}
      {activeModulePath !== "simulation" && (
<div className="flex flex-col shrink-0 h-full border-l border-[#2e2e30] max-h-screen overflow-y-auto">
  {/* Target Coordinates Sliders */}
      <div className="p-3 bg-[#111] border-b border-[#333] flex flex-col gap-2">
         <span className="text-[10px] font-mono text-[#ff5722] font-bold">TARGET XYZ COORDINATES</span>
         <div className="flex gap-4">
            <div className="flex-1">
               <label className="text-[9px] font-mono text-gray-500 uppercase">X (Easting) : {drillCoords?.x || 120}</label>
               <input type="range" min="0" max="1000" value={drillCoords?.x || 120} onChange={(e) => setDrillCoords({...drillCoords, x: Number(e.target.value), y: drillCoords?.y || 340, z: drillCoords?.z || 450})} className="w-full h-1" />
            </div>
            <div className="flex-1">
               <label className="text-[9px] font-mono text-gray-500 uppercase">Y (Northing) : {drillCoords?.y || 340}</label>
               <input type="range" min="0" max="1000" value={drillCoords?.y || 340} onChange={(e) => setDrillCoords({...drillCoords, x: drillCoords?.x || 120, y: Number(e.target.value), z: drillCoords?.z || 450})} className="w-full h-1" />
            </div>
            <div className="flex-1">
               <label className="text-[9px] font-mono text-gray-500 uppercase">Z (Depth) : {drillCoords?.z || 450}</label>
               <input type="range" min="0" max="1000" value={drillCoords?.z || 450} onChange={(e) => setDrillCoords({...drillCoords, x: drillCoords?.x || 120, y: drillCoords?.y || 340, z: Number(e.target.value)})} className="w-full h-1" />
            </div>
         </div>
      </div>
      <SwarmRoom 
          activeModule={activeModulePath as string} 
          drillCoordinates={drillCoords} 
          onClearCoordinates={() => setDrillCoords(null)} />
</div>
)}
      </div>

      {/* Cloud Store Importer modal */}
      <WhatsAppBotMenu />
      <FileUploader 
        isOpen={isUploaderOpen} 
        onClose={() => setIsUploaderOpen(false)} 
        onUpload={handleUpload} 
      />

      {/* Analytics Master Drawer */}
      <AnalyticsDrawer
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* ANONYMOUS SUPPORT PROXY MODAL */}
      <AnimatePresence>
        {isSupportOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[4000] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#121214] border border-[#00E5FF]/30 rounded-xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden font-mono text-[10px] text-gray-300 relative"
            >
              {/* Corner tech accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00E5FF]"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00E5FF]"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00E5FF]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00E5FF]"></div>

              {/* Modal Header */}
              <div className="p-4 border-b border-[#00E5FF]/20 bg-[#00E5FF]/5 flex justify-between items-center shrink-0">
                <span className="text-[#00E5FF] font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  🛡 SECURE PROXY COMMUNICATION BRIDGE
                </span>
                <button 
                  onClick={() => setIsSupportOpen(false)}
                  className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 font-mono">
                <p className="text-[9px] text-[#888] leading-relaxed font-sans text-left">
                  This secure routing terminal masks your IP, location, and metadata. Submissions are transmitted anonymously via the **Van-Botz Secure Proxy Network** directly to {BRANDING.DEVELOPER_NAME} ({BRANDING.SUPPORT_TARGET_NUMBER}).
                </p>

                {supportSuccess ? (
                  <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-center space-y-2 py-6">
                    <span className="text-xl font-bold">✓ DISPATCH SUCCESS</span>
                    <p className="text-[8px] text-gray-400 font-sans">
                      Payload successfully packetized and transmitted through anonymous bridge layers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-left">
                    <label className="text-white uppercase font-bold text-[8px] block">
                      QUERY MESSAGE TRANSMISSION
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Enter details of your submission, issue code, or raw data query..."
                      value={supportText}
                      onChange={(e) => setSupportText(e.target.value)}
                      className="w-full bg-black/40 border border-[#2e2e30] rounded p-2.5 hover:border-[#444] focus:border-[#00E5FF] focus:outline-none font-mono text-[10px] leading-relaxed resize-none text-white placeholder:text-neutral-600 focus:placeholder:text-neutral-500"
                    />

                    {supportErr && (
                      <div className="p-2 bg-red-950/40 border border-red-500/20 text-red-400 rounded text-[9px]">
                        Error: {supportErr}
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSupportOpen(false)}
                        className="py-2 px-4 rounded bg-neutral-800 text-gray-400 border border-neutral-700 hover:text-white hover:bg-neutral-700 font-bold uppercase tracking-wider transition-colors cursor-pointer text-[8px]"
                      >
                        CLOSE TERMINAL
                      </button>
                      <button
                        type="button"
                        disabled={supportSending || !supportText.trim()}
                        onClick={handleSupportSubmit}
                        className="py-2 px-5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-[#00E5FF] hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none text-[8px]"
                      >
                        {supportSending ? "TRANSMITTING OVER PROXY..." : "SECURE TRANSMIT"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo Philosophy Modal Decoder */}
      <LogoPhilosophyModal 
        isOpen={isLogoModalOpen} 
        onClose={() => setIsLogoModalOpen(false)} 
      />

      <ShareWorkspaceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* System & Telemetry Control Drawer */}
      <SystemControlDrawer
        isOpen={isSystemDrawerOpen}
        onClose={() => setIsSystemDrawerOpen(false)}
        apiMode={apiMode}
        onToggleApiMode={handleToggleModeIntercept}
        dimensionMode={dimensionMode}
        onToggleDimensionMode={handleDimensionModeIntercept}
        lang={lang}
        onToggleLang={toggleLang}
        systemClock={systemClock}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenImportModal={() => setIsUploaderOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenLogoPhilosophy={() => setIsLogoModalOpen(true)}
      />

      {/* Exquisite 30-Motion AI Agent Companion */}
      <AgentCompanion isLoading={isNavigating || isTimeTraveling} />
    </div>
    </>
  );
}


import { AuthProvider } from '../../context/AuthContext';
import { AuthModal } from '../../components/Shared/AuthModal';
import SettingsButton from '../../components/Shared/SettingsButton';
import { CommandPalette } from '../../components/Shared/CommandPalette';

export default function MainDashboardWrapper() { return <HashRouter><AuthProvider><GlobalGeoProvider><AppProvider><AuthModal /><SettingsButton /><CommandPalette /><MainDashboard /></AppProvider></GlobalGeoProvider></AuthProvider></HashRouter>; }
