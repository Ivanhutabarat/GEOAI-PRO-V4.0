import React, { useState } from 'react';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { Zap, ShieldCheck, Activity, ChevronDown, ListFilter, Trash2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ApiHealthMonitor() {
  const { 
    activeEngine, 
    apiMode,
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
            <span className="text-amber-400 font-bold shrink-0 font-mono tracking-tight animate-pulse">
              [SYSTEM: SIMULATED DUMMY ACTIVE]
            </span>
          ) : (
            <span className={`${engineLabelClass} shrink-0`}>
              {activeEngine === 'Gemini Primary' ? 'Gemini [ONLINE]' : 'OpenAI [ACTIVE]'}
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
              className="absolute left-0 mt-2 w-96 bg-[#161617] border border-[#2e2e30] rounded shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-3 border-b border-[#2e2e30] bg-[#1c1c1e] flex justify-between items-center">
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
              <div className="p-3 bg-black/20 grid grid-cols-2 gap-2 text-[9px] border-b border-[#2e2e30]">
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

              {/* Real-time Logs Feed */}
              <div className="max-h-48 overflow-y-auto p-3 space-y-2 bg-black/40 scrollbar-thin">
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
                      <div key={log.id} className="text-[9px] leading-relaxed border-b border-[#1c1c1e] pb-1.5 text-left">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`${typeColor} uppercase font-bold tracking-tight`}>
                            {labelPrefix}{log.type}
                          </span>
                          <span className="text-[8px] text-[#444]">{log.timestamp}</span>
                        </div>
                        <p className="text-[#aaa] font-sans break-words">{log.label}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Explanatory Footer */}
              <div className="p-2.5 bg-[#1c1c1e] border-t border-[#2e2e30] text-[8px] text-[#636366] leading-normal font-sans">
                Active resilient telemetry pipeline automatically routes around rate-limits (429) & gateway issues (500) via high-performance backup OpenAI keys securely configured.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
