import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sliders, 
  Cpu, 
  Box, 
  Globe, 
  Search, 
  Share2, 
  Upload, 
  Clock, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Server,
  Sun,
  Moon,
  Gauge,
  Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ApiHealthMonitor from './ApiHealthMonitor';
import { DimensionMode, PerformanceMode, ThemeMode, useAppContext } from '../../context/AppContext';
import { verifyLicenseLock, LICENSE_LOCK_INFO } from '../../lib/identityValidator';

interface SystemControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiMode: 'LIVE' | 'DUMMY';
  onToggleApiMode: () => void;
  dimensionMode: DimensionMode;
  onToggleDimensionMode: () => void;
  lang: 'ID' | 'EN';
  onToggleLang: () => void;
  systemClock: string;
  onOpenShareModal: () => void;
  onOpenImportModal: () => void;
  onOpenAnalytics: () => void;
  onOpenLogoPhilosophy: () => void;
}

export default function SystemControlDrawer({
  isOpen,
  onClose,
  apiMode,
  onToggleApiMode,
  dimensionMode,
  onToggleDimensionMode,
  lang,
  onToggleLang,
  systemClock,
  onOpenShareModal,
  onOpenImportModal,
  onOpenAnalytics,
  onOpenLogoPhilosophy,
}: SystemControlDrawerProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { performanceMode, togglePerformanceMode, themeMode, toggleThemeMode, fps } = useAppContext();

  const isEco = performanceMode === 'ECO_PERFORMANCE';
  const isLight = themeMode === 'LIGHT';
  const isLicenseValid = verifyLicenseLock();

  const t = (en: string, id: string) => (lang === 'ID' ? id : en);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9990] bg-black/75 backdrop-blur-sm"
          />

          {/* Top Slide-down Drawer Panel */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 left-0 right-0 z-[9995] bg-[#121214] border-b border-[#333333] shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto"
          >
            {/* Drawer Header Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#242426] bg-[#18181b]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                  <Sliders size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                    {t('System, Performance & Telemetry Control Center', 'Laci Kontrol Sistem, Performa & Telemetri')}
                    <span className="text-[9px] text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                      GEOAI V4.0
                    </span>
                  </h2>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {t('Manage GPU rendering profiles, light/dark themes, API engines, health pools, and security locks', 'Kelola profil render GPU, tema terang/gelap, mesin AI, health pool, dan keamanan')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Live FPS Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-gray-800 font-mono text-[10px]">
                  <Gauge size={12} className={fps >= 55 ? "text-emerald-400" : "text-amber-400"} />
                  <span className="text-gray-400">{t('PROFILER:', 'PROFILER:')}</span>
                  <span className={cn("font-bold", fps >= 55 ? "text-emerald-400" : "text-amber-400")}>
                    {fps} FPS
                  </span>
                </div>

                {/* System Clock Pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-black/50 border border-[#333] font-mono text-[10px] text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-gray-500 font-bold">{t('RIG TIME:', 'JAM SISTEM:')}</span>
                  <span className="text-white font-bold">{systemClock}</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
                  title={t('Close Drawer', 'Tutup Laci')}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Content Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Performance Profiler & Eco Mode */}
              <div className="bg-[#18181a] border border-[#28282b] rounded-xl p-4 flex flex-col justify-between hover:border-[#38383c] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-300 flex items-center gap-1.5">
                      <Gauge size={14} className={isEco ? "text-amber-400" : "text-cyan-400"} />
                      {t('Performance Mode', 'Mode Performa')}
                    </span>
                    <span className={cn(
                      "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase",
                      isEco ? "bg-amber-950/60 text-amber-300 border-amber-500/40" : "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                    )}>
                      {isEco ? 'ECO 60 FPS' : 'HI-FIDELITY'}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-300 font-mono mb-3 leading-relaxed">
                    {isEco
                      ? t('Eco Mode active: 1.0x pixel ratio cap, shadows disabled, throttled loop for smooth 60 FPS on low-spec/mobile.', 'Mode Eco aktif: pembatasan pixel ratio 1.0x, shadow nonaktif, 60 FPS mulus di laptop/ponsel.')
                      : t('High-Fidelity active: Multi-sample antialiasing, dynamic volumetric lighting & full point-cloud density.', 'Kualitas tinggi: Antialiasing multi-sampel, pencahayaan volumetrik dinamis & densitas penuh.')}
                  </p>

                  <div className="bg-black/50 border border-gray-800 rounded-lg p-2 font-mono text-[9px] text-gray-400 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span>Pixel Ratio:</span>
                      <span className="text-white font-bold">{isEco ? '1.0x (Capped)' : 'Native (2.0x+)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frame Latency:</span>
                      <span className="text-emerald-400 font-bold">~{(1000 / (fps || 60)).toFixed(1)} ms</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={togglePerformanceMode}
                  className={cn(
                    "w-full py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer",
                    isEco
                      ? "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                      : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/40"
                  )}
                >
                  <Gauge size={13} />
                  {isEco ? t('Switch to High-Fidelity', 'Ubah ke High-Fidelity') : t('Switch to Eco (60 FPS)', 'Ubah ke Mode Eco (60 FPS)')}
                </button>
              </div>

              {/* Card 2: Theme (Dark / Light Field Mode) */}
              <div className="bg-[#18181a] border border-[#28282b] rounded-xl p-4 flex flex-col justify-between hover:border-[#38383c] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-300 flex items-center gap-1.5">
                      {isLight ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-cyan-400" />}
                      {t('Visual Field Theme', 'Tema Ruang Visual')}
                    </span>
                    <span className={cn(
                      "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase",
                      isLight ? "bg-amber-950/60 text-amber-300 border-amber-500/40" : "bg-neutral-800 text-gray-300 border-neutral-700"
                    )}>
                      {isLight ? 'LIGHT' : 'DARK'}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-300 font-mono mb-3 leading-relaxed">
                    {isLight
                      ? t('Sunlight High-Contrast Light Mode: Optimized for outdoor rig operations under direct bright sunlight.', 'Mode Terang Kontras Tinggi: Dioptimalkan untuk operasi rig di luar ruangan di bawah terik matahari.')
                      : t('Operations Dark Mode: Low-emission deep dark palette to eliminate eye fatigue in control room shifts.', 'Mode Gelap Operasional: Palet gelap rendah emisi cahaya untuk kenyamanan mata shift ruang kontrol.')}
                  </p>

                  <div className="bg-black/50 border border-gray-800 rounded-lg p-2 font-mono text-[9px] text-gray-400 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span>Contrast Ratio:</span>
                      <span className="text-white font-bold">{isLight ? '18:1 (Sunlight Safe)' : '14:1 (Zero Glare)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment:</span>
                      <span className="text-cyan-400 font-bold">{isLight ? 'Field / Rig Deck' : 'Command Center'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleThemeMode}
                  className={cn(
                    "w-full py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer",
                    isLight
                      ? "bg-neutral-800 hover:bg-neutral-700 text-gray-200 border-neutral-600"
                      : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/40"
                  )}
                >
                  {isLight ? <Moon size={13} /> : <Sun size={13} />}
                  {isLight ? t('Switch to Dark Room', 'Ubah ke Mode Gelap') : t('Switch to Sunlight Light', 'Ubah ke Mode Terang')}
                </button>
              </div>

              {/* Card 3: AI Inference Engine & Dimension */}
              <div className="bg-[#18181a] border border-[#28282b] rounded-xl p-4 flex flex-col justify-between hover:border-[#38383c] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-300 flex items-center gap-1.5">
                      <Cpu size={14} className="text-emerald-400" />
                      {t('AI Core Engine', 'Mesin AI & Dimensi')}
                    </span>
                    <span className={cn(
                      "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase",
                      apiMode === 'LIVE' ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30" : "bg-amber-950/60 text-amber-400 border-amber-500/30"
                    )}>
                      {apiMode} / {dimensionMode}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-300 font-mono mb-3 leading-relaxed">
                    {apiMode === 'LIVE'
                      ? t('Gemini 2.5 Multi-Agent Swarm with real-time subsurface reasoning.', 'Swarm AI Gemini 2.5 terhubung dengan penalaran real-time.')
                      : t('Local Synthetic Core active with deterministic simulated physics.', 'Core sintetis lokal aktif dengan simulasi fisika deterministik.')}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={onToggleDimensionMode}
                      className={cn(
                        "py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer flex items-center justify-center gap-1",
                        dimensionMode === '3D' ? "bg-purple-950/60 text-purple-300 border-purple-500/40" : "bg-blue-950/60 text-blue-300 border-blue-500/40"
                      )}
                    >
                      <Box size={11} />
                      {dimensionMode}
                    </button>

                    <button
                      onClick={onToggleLang}
                      className="py-1.5 px-2 rounded text-[10px] font-mono font-bold uppercase border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      🌐 {lang}
                    </button>
                  </div>
                </div>

                <button
                  onClick={onToggleApiMode}
                  className={cn(
                    "w-full py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer",
                    apiMode === 'LIVE'
                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/40"
                  )}
                >
                  <Zap size={13} />
                  {apiMode === 'LIVE' ? t('Switch to Dummy', 'Ubah ke Dummy') : t('Switch to Live', 'Ubah ke Live AI')}
                </button>
              </div>

              {/* Card 4: Health & Server Telemetry */}
              <div className="bg-[#18181a] border border-[#28282b] rounded-xl p-4 flex flex-col justify-between hover:border-[#38383c] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-gray-300 flex items-center gap-1.5">
                      <Server size={14} className="text-[#00E5FF]" />
                      {t('API & Node Health', 'Kesehatan API & Server')}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="mb-3">
                    <ApiHealthMonitor />
                  </div>

                  <div className="bg-black/50 border border-gray-800 rounded-lg p-2 font-mono text-[9px] space-y-1 mb-2">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="flex items-center gap-1">
                        <Lock size={10} className="text-emerald-400" />
                        {t('Security Seal:', 'Segel Keamanan:')}
                      </span>
                      <span className={isLicenseValid ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {isLicenseValid ? 'VERIFIED LOCK' : 'DEV BYPASS'}
                      </span>
                    </div>
                    <div className="text-[8px] text-gray-500 truncate">
                      {LICENSE_LOCK_INFO.watermark}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenLogoPhilosophy}
                  className="w-full py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors cursor-pointer"
                >
                  <Sparkles size={12} className="text-[#00E5FF]" />
                  {t('Logo Philosophy', 'Filosofi Logo')}
                </button>
              </div>

              {/* Card 5: Quick Action Desk & Search */}
              <div className="bg-[#18181a] border border-[#28282b] rounded-xl p-4 flex flex-col justify-between hover:border-[#38383c] transition-colors">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-gray-300 flex items-center gap-1.5 mb-2">
                    <Activity size={14} className="text-[#FF5722]" />
                    {t('Data & Quick Tools', 'Alat Kerja Cepat')}
                  </span>

                  {/* Raw Data Search Bar */}
                  <div className="relative mb-3">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('Filter nodes...', 'Cari matriks data...')}
                      className="w-full bg-black/60 border border-[#333] rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF] transition-colors"
                    />
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenShareModal();
                      }}
                      className="py-2 px-2 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 size={12} />
                      {t('Share QR', 'Bagikan QR')}
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenImportModal();
                      }}
                      className="py-2 px-2 rounded-lg bg-[#FF5722]/10 hover:bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload size={12} />
                      {t('Import', 'Impor')}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAnalytics();
                  }}
                  className="w-full mt-3 py-2 px-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-[#1a1a2e] hover:bg-[#252542] text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
                >
                  <Sliders size={12} />
                  {t('Open Analytics', 'Buka Analitik')}
                </button>
              </div>
            </div>

            {/* Bottom Tray Indicator */}
            <div className="px-6 py-2 bg-[#0d0d0e] border-t border-[#202022] flex items-center justify-between text-[9px] font-mono text-gray-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={11} className="text-emerald-400" />
                {t('Hardware License Anchor & Session Security Integrity Active', 'Segel Lisensi Perangkat & Integritas Sesi Aktif Terlindungi')}
              </span>
              <span className="text-gray-400">GeoAI Pro v4.0 Industrial Standard</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
