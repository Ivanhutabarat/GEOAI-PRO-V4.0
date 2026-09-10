import { useAppContext } from '../../context/AppContext';
// src/components/Shared/ApiHealthMonitor.tsx
import React, { useState } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  ChevronDown, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Database,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { encryptKey, decryptKey, scrubTelemetryLogs } from '../../lib/cryptoShield';

export default function ApiHealthMonitor() {
  const { apiMode } = useAppContext();
  const {  
    activeEngine, 
    
    glowingDot, 
    successCount, 
    retryCount, 
    isExhaustionSimulated,
    activeOpenAiKeyIndex,
    logChannel,
    clearLogChannel,
    latencyHistory
   } = useApiMonitorStore();

  const [isOpen, setIsOpen] = useState(false);

  // Secure Cryptographic State Ingestion
  const [geminiKey, setGeminiKey] = useState(() => {
    try {
      const saved = localStorage.getItem("_vanbotz_encrypted_gemini_key");
      return saved ? decryptKey(saved) : "";
    } catch { return ""; }
  });

  const [swarmToken, setSwarmToken] = useState(() => {
    try {
      const saved = localStorage.getItem("_vanbotz_encrypted_swarm_token");
      return saved ? decryptKey(saved) : "";
    } catch { return ""; }
  });

  const [provider, setProvider] = useState(() => {
    return localStorage.getItem("_vanbotz_provider_label") || "Google";
  });

  const [showKey, setShowKey] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isSynced, setIsSynced] = useState(() => {
    return !!localStorage.getItem("_vanbotz_encrypted_gemini_key");
  });

  // Handle Dynamic Key Synchronization
  const handleIngestCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (geminiKey.trim()) {
        const encryptedKey = encryptKey(geminiKey.trim());
        localStorage.setItem("_vanbotz_encrypted_gemini_key", encryptedKey);
      } else {
        localStorage.removeItem("_vanbotz_encrypted_gemini_key");
      }

      if (swarmToken.trim()) {
        const encryptedToken = encryptKey(swarmToken.trim());
        localStorage.setItem("_vanbotz_encrypted_swarm_token", encryptedToken);
      } else {
        localStorage.removeItem("_vanbotz_encrypted_swarm_token");
      }

      localStorage.setItem("_vanbotz_provider_label", provider);
      setIsSynced(true);

      // Add a clean, securely redacted log event to the pipeline
      const safeConfirmation = scrubTelemetryLogs(
        `SUCCESS: Secure credentials coupled. Provider label "${provider}" bound on the fly with encrypted key mask.`
      );
      useApiMonitorStore.getState().addLog('success', safeConfirmation);

    } catch (err) {
      useApiMonitorStore.getState().addLog('error', 'Failed securely coupling environment encryption shield.');
    }
  };

  // Clear Overrides
  const handleResetBridge = () => {
    localStorage.removeItem("_vanbotz_encrypted_gemini_key");
    localStorage.removeItem("_vanbotz_encrypted_swarm_token");
    localStorage.removeItem("_vanbotz_provider_label");
    setGeminiKey("");
    setSwarmToken("");
    setProvider("Google");
    setIsSynced(false);
    useApiMonitorStore.getState().addLog('exhaust', 'Credentials override released. Resetting back to default environment pool.');
  };

  // Computed classes for the glowing indicator
  const dotColorClass = 
    glowingDot === 'green' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]' : 
    glowingDot === 'orange' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]' : 
    'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]';

  const engineLabelClass = 
    activeEngine === 'Gemini Primary' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold';

  const strokeColor = 
    glowingDot === 'green' ? '#10b981' : 
    glowingDot === 'orange' ? '#f59e0b' : 
    '#ef4444';

  const minVal = Math.min(...latencyHistory);
  const maxVal = Math.max(...latencyHistory);
  const range = maxVal - minVal || 1;
  const pointsStr = latencyHistory.map((val, idx) => {
    const x = (idx / 9) * 36 + 2;
    const y = 12 - ((val - minVal) / range) * 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative z-50 font-mono">
      {/* Trigger Row */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-2.5 py-1 rounded bg-[#1c1c1e] border border-[#2e2e30] hover:bg-[#242426] cursor-pointer transition-all select-none text-[10px]"
      >
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`w-2 h-2 rounded-full ${dotColorClass} animate-pulse shrink-0`} />
          
          {/* Miniature Sparkline Chart */}
          <div className="flex items-center shrink-0" title={`API Latency Sparkline: ${latencyHistory.join(', ')}ms`}>
            <svg className="w-10 h-3.5" viewBox="0 0 40 14">
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsStr}
              />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[#888] shrink-0 font-bold">API:</span>
          {apiMode === 'DUMMY' ? (
            <span className="text-amber-400 font-bold shrink-0 font-mono tracking-tight animate-pulse flex items-center gap-1">
              [SYSTEM: SIMULATED INVERSION ACTIVE]
              {isSynced && <Lock className="w-3 h-3 text-emerald-400 shrink-0 inline-block" />}
            </span>
          ) : (
            <span className={`${engineLabelClass} shrink-0 flex items-center gap-1`}>
              {activeEngine === 'Gemini Primary' ? 'Gemini [ONLINE]' : 'OpenAI [ACTIVE]'}
              {isSynced && <Lock className="w-3 h-3 text-emerald-400 shrink-0 inline-block" />}
            </span>
          )}
          <span className="text-[9px] text-[#555] font-mono shrink-0 hidden lg:inline">
            {apiMode === 'DUMMY' ? '[Simulated zero-cost sandbox]' : '[Pool: GEMINI (4) | OPENAI (3)]'}
          </span>
        </div>

        {isExhaustionSimulated && (
          <span className="px-1.5 py-0.5 rounded text-[8px] bg-red-950/40 border border-red-900/60 text-red-400 font-bold tracking-tight shrink-0 animate-pulse">
            SIMULATED FAIL
          </span>
        )}

        <div className="h-3 w-px bg-[#2e2e30] shrink-0" />

        <div className="flex items-center gap-1.5 text-[#bbb] shrink-0">
          <ShieldCheck size={11} className="text-emerald-500" />
          <span>{successCount}</span>
        </div>

        <div className="flex items-center gap-1 text-[#bbb] shrink-0">
          <Activity size={11} className="text-amber-400" />
          <span>{retryCount}</span>
        </div>

        <ChevronDown size={10} className={`text-[#636366] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Popover Logs Box */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay click-away background */}
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-[#161617] border border-[#2e2e30] rounded shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-3 border-b border-[#2e2e30] bg-[#1c1c1e] flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                  <Zap size={12} className="text-amber-500" />
                  API Routing Failover Monitor
                </span>
                <button 
                  onClick={clearLogChannel}
                  className="text-[9px] text-[#FF5722] hover:text-white uppercase font-bold flex items-center gap-1"
                >
                  <Trash2 size={10} />
                  Clear Logs
                </button>
              </div>

              {/* Status Section */}
              <div className="p-3 bg-black/20 grid grid-cols-2 gap-2 text-[9px] border-b border-[#2e2e30] shrink-0">
                <div className="bg-[#1c1c1e] p-2 rounded border border-[#222]">
                  <span className="text-[#555] block mb-0.5">CURRENT LINK</span>
                  <span className={`${engineLabelClass} text-xs block`}>{activeEngine}</span>
                  <span className="text-[7px] text-[#666] block">Using Model: {activeEngine === 'Gemini Primary' ? 'gemini-3.5-flash' : 'gpt-4o-mini'}</span>
                </div>
                <div className="bg-[#1c1c1e] p-2 rounded border border-[#222]">
                  <span className="text-[#555] block mb-0.5">BACKUP CHANNELS</span>
                  <span className="text-white block text-xs font-bold font-mono">
                    Channel #{activeOpenAiKeyIndex + 1} Selected
                  </span>
                  <span className="text-[7px] text-[#666] block">Automated multi-key rotation standby</span>
                </div>
              </div>

              {/* Secure Credentials Integration Form */}
              <div className="p-3 border-b border-[#2e2e30] bg-[#121213]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Key size={10} className="text-emerald-400" />
                    Security Credentials Bridge
                  </span>
                  
                  {/* Status Indicator (Lock / Unlock Animation Toggle) */}
                  <div className="flex items-center gap-1">
                    {isSynced ? (
                      <span className="text-[8px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/60 px-1 py-0.5 rounded flex items-center gap-1">
                        <Lock size={9} className="animate-pulse" />
                        COUPLED
                      </span>
                    ) : (
                      <span className="text-[8px] text-amber-500 font-bold bg-amber-950/40 border border-amber-900/60 px-1 py-0.5 rounded flex items-center gap-1">
                        <Unlock size={9} />
                        STANDBY
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleIngestCredentials} className="space-y-2 text-[9px]">
                  {/* Dynamic API Key Field based on Provider */}
                  <div>
                    <label className="text-[#888] font-mono block mb-1">
                      {provider === "OpenRouter" ? "OPENROUTER_API_KEY" : provider === "Custom Proxy" ? "PROXY_API_KEY" : "GEMINI_API_KEY"}
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder={provider === "OpenRouter" ? "sk-or-v1-..." : provider === "Custom Proxy" ? "Enter custom key..." : "AIzaSy..."}
                        className="w-full bg-[#1c1c1e] border border-[#2e2e30] rounded px-2 py-1 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 pr-8 font-mono text-[9px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showKey ? <EyeOff size={10} /> : <Eye size={10} />}
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM_SWARM_TOKEN */}
                  <div>
                    <label className="text-[#888] font-mono block mb-1">CUSTOM_SWARM_TOKEN</label>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        value={swarmToken}
                        onChange={(e) => setSwarmToken(e.target.value)}
                        placeholder="swarm-token-..."
                        className="w-full bg-[#1c1c1e] border border-[#2e2e30] rounded px-2 py-1 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 pr-8 font-mono text-[9px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showToken ? <EyeOff size={10} /> : <Eye size={10} />}
                      </button>
                    </div>
                  </div>

                  {/* Provider label & Trigger Button */}
                  <div className="grid grid-cols-12 gap-1.5 items-end">
                    <div className="col-span-6">
                      <label className="text-[#888] font-mono block mb-1">Provider Label</label>
                      <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full bg-[#1c1c1e] border border-[#2e2e30] rounded px-1.5 py-1 text-white focus:outline-none focus:border-emerald-500/50 text-[9px] font-mono h-[19px] leading-none"
                      >
                        <option value="Google">Google (Gemini)</option>
                        <option value="OpenRouter">OpenRouter</option>
                        <option value="Custom Proxy">Custom Proxy</option>
                      </select>
                    </div>

                    <div className="col-span-6 flex gap-1 justify-end">
                      {isSynced && (
                        <button
                          type="button"
                          onClick={handleResetBridge}
                          className="px-2 py-1 bg-red-950/50 border border-red-900/50 hover:bg-red-900/60 text-red-400 font-bold uppercase rounded text-[8px] transition-all"
                        >
                          RELEASE
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-2 py-1 bg-[#10b981]/20 border border-[#10b981]/40 hover:bg-[#10b981]/30 text-emerald-400 font-bold uppercase rounded text-[8px] transition-all flex items-center gap-1"
                      >
                        COUPLE
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Real-time Logs Feed */}
              <div className="max-h-36 overflow-y-auto p-3 space-y-2 bg-black/40 scrollbar-thin grow">
                {logChannel.length === 0 ? (
                  <div className="text-center py-6 text-[9px] text-[#555] italic">
                    Log pipe empty. Standing by for API events...
                  </div>
                ) : (
                  logChannel.map((log) => {
                    let typeColor = 'text-gray-400';
                    let labelPrefix = '';
                    if (log.type === 'success') {
                      typeColor = 'text-emerald-400';
                      labelPrefix = '✓ ';
                    } else if (log.type === 'retry') {
                      typeColor = 'text-amber-400';
                      labelPrefix = '↺ ';
                    } else if (log.type === 'fallback') {
                      typeColor = 'text-amber-500 font-bold';
                      labelPrefix = '⚡ [FALLBACK] ';
                    } else if (log.type === 'exhaust') {
                      typeColor = 'text-red-400 font-bold';
                      labelPrefix = '🚨 [SIM] ';
                    } else if (log.type === 'error') {
                      typeColor = 'text-red-500 font-bold';
                      labelPrefix = '⚠ [ERROR] ';
                    }

                    return (
                      <div key={log.id} className="text-[9px] leading-relaxed border-b border-[#1c1c1e] pb-1.5 text-left font-mono">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`${typeColor} uppercase font-bold tracking-tight`}>
                            {labelPrefix}{log.type}
                          </span>
                          <span className="text-[8px] text-[#444]">{log.timestamp}</span>
                        </div>
                        <p className="text-[#aaa] font-sans break-words">
                          {scrubTelemetryLogs(log.label)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Explanatory Footer */}
              <div className="p-2.5 bg-[#1c1c1e] border-t border-[#2e2e30] text-[8px] text-[#636366] leading-normal font-sans shrink-0">
                Active resilient telemetry pipeline automatically routes around rate-limits (429) & gateway issues (500) via high-performance backup OpenAI keys securely configured.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
