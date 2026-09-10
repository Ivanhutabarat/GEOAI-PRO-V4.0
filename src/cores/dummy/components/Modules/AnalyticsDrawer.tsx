import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { generateReport } from '../../utils/reportGenerator';
import { useAppContext } from '../../context/AppContext';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { 
  X, 
  Sliders, 
  ShieldAlert, 
  FileDown, 
  Check, 
  TrendingUp, 
  Layers,
  Sparkles,
  Activity,
  Cpu,
  Database,
  Award,
  Zap
} from 'lucide-react';
import { useOptimizerStore } from '../../store/OptimizerStore';
import { useApiMonitorStore } from '../../store/ApiMonitorStore';
import { cn } from '../../lib/utils';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { usePerformanceStore } from '../../store/PerformanceStore';
import { validateIdentity } from '../../lib/identityValidator';
import GeoAILogo from '../Shared/GeoAILogo';
import { BRANDING } from '../../constants/BrandingConstants';

interface AnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsDrawer({ isOpen, onClose }: AnalyticsDrawerProps) {
  const { fullName, userEmail } = useAuth();
  const userName = fullName || 'Operator';
  const displayEmail = userEmail || 'operator@geoai.pro';
  const { globalData, rawPayloads,   activeFileName, systemLogs, addLog } = useGlobalGeoContext();
  const { apiMode, engine, dimensionMode } = useAppContext();
  const { metricsList, clearMetrics } = usePerformanceStore();
  
  const { 
    anomalyDetectionActive, 
    toggleAnomalyDetection,
    scenarioA,
    scenarioB,
    activeScenario,
    setScenarioA,
    setScenarioB,
    setActiveScenario,
    optimizedParams
  } = useOptimizerStore();

  const [activeTab, setActiveTab] = useState<'compare' | 'performance' | 'settings'>('compare');
  const [fallbackReportHtml, setFallbackReportHtml] = useState<string | null>(null);

  // Hardened 4-Tier Purge Security State
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeTarget, setPurgeTarget] = useState<'knowledge_base' | 'identity_lock'>('knowledge_base');
  const [isUiFrozen, setIsUiFrozen] = useState(false);
  const [purgeStep, setPurgeStep] = useState<1 | 2 | 3 | 4>(1);
  const [purgeMathChallenge, setPurgeMathChallenge] = useState({ q: '', ans: 0 });
  const [purgeMathInput, setPurgeMathInput] = useState('');
  const [purgeEnglishInput, setPurgeEnglishInput] = useState('');
  const [purgeIdentityInput, setPurgeIdentityInput] = useState('');
  const [purgeOtpInput, setPurgeOtpInput] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpSentSuccess, setOtpSentSuccess] = useState(false);
  const [transientOtp, setTransientOtp] = useState('');
  const [purgeError, setPurgeError] = useState('');
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  // High-Security OTP handshakes
  const [currentHandshakeId, setCurrentHandshakeId] = useState('');
  const [handshakeStatus, setHandshakeStatus] = useState<'pending' | 'approved' | 'rejected' | 'used' | ''>('');
  const [revealedOtp, setRevealedOtp] = useState('');
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Emergency local bypass configuration states
  const [emergencyPin, setEmergencyPin] = useState('');
  const [showEmergencyInput, setShowEmergencyInput] = useState(false);
  const [emergencyError, setEmergencyError] = useState('');
  const [isBypassing, setIsBypassing] = useState(false);

  // Polling server for Ivan's email approval
  useEffect(() => {
    if (!currentHandshakeId || handshakeStatus !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/security/otp/status?id=${currentHandshakeId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.status === 'approved') {
          clearInterval(interval);
          setHandshakeStatus('approved');
          setRevealedOtp(data.otp);
          setShowNotificationPopup(true);
          addLog({
            type: 'INFO',
            source: 'SECURITY',
            message: `GEOAI PRO SHIELD: Otorisasi tindakan \"${purgeTarget === 'identity_lock' ? 'Destruct Security Lock' : 'Purge AI Knowledge'}\" disetujui oleh ${userName}. OTP aman dilepaskan.`
          });
        } else if (data.status === 'rejected') {
          clearInterval(interval);
          setHandshakeStatus('rejected');
          setPurgeError('Otorisasi ditolak oleh Pemilik Lisensi.');
        }
      } catch (err) {
        console.error('Error polling handshake status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentHandshakeId, handshakeStatus, purgeTarget]);

  const startPurgeWorkflow = (target: 'knowledge_base' | 'identity_lock' = 'knowledge_base') => {
    setPurgeTarget(target);
    setIsUiFrozen(target === 'identity_lock');
    const num1 = Math.floor(Math.random() * 8) + 3;
    const num2 = Math.floor(Math.random() * 8) + 3;
    setPurgeMathChallenge({
      q: `Berapa ${num1} x ${num2}?`,
      ans: num1 * num2
    });
    setPurgeStep(1);
    setPurgeMathInput('');
    setPurgeEnglishInput('');
    setPurgeIdentityInput('');
    setPurgeOtpInput('');
    setOtpSentSuccess(false);
    setIsOtpSending(false);
    setPurgeError('');
    setPurgeSuccess(false);
    setCurrentHandshakeId('');
    setHandshakeStatus('');
    setRevealedOtp('');
    setShowNotificationPopup(false);
    setEmergencyPin('');
    setShowEmergencyInput(false);
    setEmergencyError('');
    setIsBypassing(false);
    setIsPurgeModalOpen(true);
  };

  const handleVerifyStep = async () => {
    setPurgeError('');
    if (purgeStep === 1) {
      if (parseInt(purgeMathInput) !== purgeMathChallenge.ans) {
        setPurgeError('Perhitungan salah. Verifikasi gagal.');
        return;
      }
      setPurgeStep(2);
    } else if (purgeStep === 2) {
      if (purgeEnglishInput.trim().toUpperCase() !== 'DELETE FOREVER') {
        setPurgeError('Input tidak cocok. Anda harus mengetik "DELETE FOREVER" dengan tepat.');
        return;
      }
      setPurgeStep(3);
    } else if (purgeStep === 3) {
      const expectedName = BRANDING.DEVELOPER_NAME;
      const val = purgeIdentityInput.trim().toUpperCase();
      // Allow flexible matches for Ivan / Administrator / Ivan
      if (!val.includes("IVAN") && !val.includes("HUTABARAT")) {
        setPurgeError(`Identitas tidak sah. Anda harus mengetik nama "${expectedName}" atau "IVAN HUTABARAT" untuk memverifikasi.`);
        return;
      }
      
      setIsOtpSending(true);
      try {
        const res = await fetch('/api/security/otp/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: purgeTarget === 'identity_lock' ? 'destruct_identity_lock' : 'purge_ai_knowledge' })
        });
        if (!res.ok) throw new Error('Server returned error status');
        const data = await res.json();
        if (data.success) {
          setCurrentHandshakeId(data.handshakeId);
          setHandshakeStatus('pending');
          setRevealedOtp('');
          setShowNotificationPopup(false);
          setOtpSentSuccess(true);
          setPurgeStep(4);
        } else {
          setPurgeError(data.error || 'Gagal mengirimkan permintaan otorisasi.');
        }
      } catch (err) {
        setPurgeError('Gagal menghubungi server otorisasi. Silakan periksa jaringan Anda.');
      } finally {
        setIsOtpSending(false);
      }
    } else if (purgeStep === 4) {
      if (!purgeOtpInput.trim()) {
        setPurgeError('Kode verifikasi OTP tidak boleh kosong.');
        return;
      }
      
      try {
        const res = await fetch('/api/security/otp/consume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentHandshakeId, otp: purgeOtpInput.trim() })
        });
        const data = await res.json();
        if (data.success) {
          setHandshakeStatus('used');
          setShowNotificationPopup(false);
          setPurgeSuccess(true);
          addLog({
            type: 'WARN',
            source: 'SECURITY',
            message: purgeTarget === 'identity_lock'
              ? `CRITICAL EVENT: Vessel Security Lock was securely authorized and re-seeded smoothly by ${userName}.`
              : `CRITICAL EVENT: AI Knowledge Base was securely authorized and re-seeded smoothly by ${userName}.`
          });
          // Fire event to reseed other charts if they listen to it, wait for 4s
          window.dispatchEvent(new Event('mfa_reseed_success'));
          setTimeout(() => {
            setPurgeSuccess(false);
            setPurgeStep(1);
            setPurgeMathChallenge({ q: '', ans: 0 });
            setPurgeMathInput('');
            setPurgeEnglishInput('');
            setPurgeIdentityInput('');
            setPurgeOtpInput('');
            setEmergencyPin('');
            setShowEmergencyInput(false);
            setEmergencyError('');
            setIsBypassing(false);
            setIsPurgeModalOpen(false);
          }, 4000);
        } else {
          setPurgeError(data.error || 'Akses Ditolak: Token Autentikasi tidak valid.');
        }
      } catch (err) {
        setPurgeError('Error saat memverifikasi OTP ke server.');
      }
    }
  };

  const handleEmergencyBypass = async () => {
    if (!emergencyPin.trim()) return;
    setIsBypassing(true);
    setEmergencyError('');
    try {
      const res = await fetch('/api/security/otp/emergency-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentHandshakeId, pin: emergencyPin.trim() })
      });
      const data = await res.ok ? await res.json() : null;
      if (data && data.success) {
        setHandshakeStatus('approved');
        setRevealedOtp(data.otp);
        setShowNotificationPopup(true);
        addLog({
          type: 'INFO',
          source: 'SECURITY',
          message: `GEOAI PRO SHIELD: Otorisasi darurat disetujui menggunakan PIN Pengembang. OTP aman dirilis.`
        });
      } else {
        const errData = res.status !== 200 ? await res.json().catch(() => ({})) : {};
        setEmergencyError(errData.error || 'PIN Otorisasi Darurat salah.');
      }
    } catch (err) {
      setEmergencyError('Gagal menghubungi server otorisasi.');
    } finally {
      setIsBypassing(false);
    }
  };

  const exportToPDF = () => { generateReport(); };

  if (!isOpen) return null;

  return (
    <>
      {/* Fallback Report modal if popup blocker triggered */}
      {fallbackReportHtml && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#2e2e30] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-[10px] text-gray-300">
            <div className="p-4 border-b border-[#2e2e30] bg-[#161617] flex justify-between items-center shrink-0">
              <span className="text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                ⚠ POP-UP BLOCKER TRIGGERED: BRIEF RETRIEVED
              </span>
              <button 
                onClick={() => setFallbackReportHtml(null)}
                className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] rounded leading-relaxed">
                Your browser restricted pop-ups inside this iframe preview. The complete surveyed geophysics summary has been safely compiled below.
              </div>
              <div 
                className="bg-white text-black p-4 rounded border border-neutral-300 overflow-x-auto select-all max-h-96"
                style={{ fontFamily: "monospace" }}
              >
                <pre className="whitespace-pre-wrap text-[9px] select-text">
                  {fallbackReportHtml.replace(/<[^>]*>/g, '')}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-[#2e2e30] bg-[#161617] flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(fallbackReportHtml.replace(/<[^>]*>/g, ''));
                }}
                className="flex-1 bg-[#FF5722] hover:bg-orange-500 text-black py-2 font-bold uppercase rounded text-[10px] transition-all cursor-pointer"
              >
                Copy Raw Text Report
              </button>
              <button
                type="button"
                onClick={() => setFallbackReportHtml(null)}
                className="px-4 py-2 border border-neutral-700 text-gray-400 hover:text-white hover:bg-neutral-800 rounded text-[10px] transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[999] transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />

      <div className="fixed top-0 left-0 bottom-0 w-80 bg-[#121214] border-r border-[#2e2e30] flex flex-col z-[1000] shadow-2xl overflow-hidden font-sans">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#2e2e30] bg-[#161617] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <GeoAILogo size={20} glow={false} />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">📊 Analytic Master Suite</h2>
              <p className="text-[8px] font-mono text-gray-500">{activeFileName} // {BRANDING.APP_SHORT_CREDIT}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 text-center border-b border-[#2e2e30] text-[9px] font-mono tracking-tight font-bold shrink-0">
          <button 
            onClick={() => setActiveTab('compare')}
            className={cn(
              "p-2.5 border-b-2 uppercase transition-colors cursor-pointer",
              activeTab === 'compare' ? "border-[#00E5FF] text-[#00E5FF] bg-black/10" : "border-transparent text-gray-500 hover:text-white"
            )}
          >
            A/B Tool
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={cn(
              "p-2.5 border-b-2 uppercase transition-colors cursor-pointer",
              activeTab === 'performance' ? "border-[#00E5FF] text-[#00E5FF] bg-black/10" : "border-transparent text-gray-500 hover:text-white"
            )}
          >
            Perf Log
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "p-2.5 border-b-2 uppercase transition-colors cursor-pointer",
              activeTab === 'settings' ? "border-[#00E5FF] text-[#00E5FF] bg-black/10" : "border-transparent text-gray-500 hover:text-white"
            )}
          >
            Tuning
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
          
          {/* Section 1: Anomaly Detection Toggle */}
          <div className="bg-black/20 border border-[#2e2e30] p-4 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-gray-400 font-mono flex items-center gap-1.5">
                <ShieldAlert size={12} className={cn(anomalyDetectionActive ? "text-red-500" : "text-gray-500")} />
                Anomaly Signal Mask
              </span>
              
              <button
                onClick={toggleAnomalyDetection}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  anomalyDetectionActive ? "bg-red-950 border-red-500/30" : "bg-neutral-800 border-neutral-700"
                )}
                title="Toggle Active Well anomalies"
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out mt-[2px]",
                    anomalyDetectionActive ? "translate-x-4 bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "translate-x-0.5 bg-neutral-400"
                  )}
                />
              </button>
            </div>
            <p className="text-[9px] text-[#888] leading-normal font-sans">
              Isomorphic filtering monitors. Highlights depth sections where resistivity spikes over your threshold in sandstone gaps (GR low crossover) on charts in red alarms.
            </p>
          </div>

          {activeTab === 'compare' ? (
            /* TAB 1: COMPARE */
            <div className="space-y-6">
              
              {/* Scenario selector */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 font-mono">Active Comparative Model</span>
                <div className="grid grid-cols-2 gap-2 bg-black/45 p-1 rounded-lg border border-[#2e2e30]">
                  <button
                    onClick={() => setActiveScenario('A')}
                    className={cn(
                      "py-1.5 text-[10px] rounded font-mono font-bold uppercase transition-colors cursor-pointer",
                      activeScenario === 'A' 
                        ? "bg-[#00E5FF] text-black" 
                        : "text-gray-400 hover:text-white hover:bg-neutral-800/40"
                    )}
                  >
                    Scenario A (Mitigation)
                  </button>
                  <button
                    onClick={() => setActiveScenario('B')}
                    className={cn(
                      "py-1.5 text-[10px] rounded font-mono font-bold uppercase transition-colors cursor-pointer",
                      activeScenario === 'B' 
                        ? "bg-[#00E5FF] text-black" 
                        : "text-gray-400 hover:text-white hover:bg-neutral-800/40"
                    )}
                  >
                    Scenario B (Exploration)
                  </button>
                </div>
              </div>

              {/* Scenario A Inputs */}
              <div className="bg-black/10 border border-[#2e2e30]/50 p-3 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 border-b border-[#2e2e30] pb-2">
                  <Layers size={12} className="text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-300 font-mono uppercase">Scenario A boundaries</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Acoustic impedance ({scenarioA.acousticImpedance} GPa*s/m)</label>
                    <input 
                      type="range" 
                      min="2.0" 
                      max="10.0" 
                      step="0.1"
                      value={scenarioA.acousticImpedance} 
                      onChange={(e) => setScenarioA({ acousticImpedance: parseFloat(e.target.value) })}
                      className="w-full accent-[#00E5FF] h-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Resistivity Threshold ({scenarioA.resistivityThreshold} Ωm)</label>
                    <input 
                      type="range" 
                      min="5" 
                      max="200" 
                      step="1.0"
                      value={scenarioA.resistivityThreshold} 
                      onChange={(e) => setScenarioA({ resistivityThreshold: parseFloat(e.target.value) })}
                      className="w-full accent-[#4CAF50] h-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Shale Cut-off ({scenarioA.shaleCutoff}%)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="1"
                      value={scenarioA.shaleCutoff} 
                      onChange={(e) => setScenarioA({ shaleCutoff: parseInt(e.target.value) })}
                      className="w-full accent-[#FF5722] h-1" 
                    />
                  </div>
                </div>
              </div>

              {/* Scenario B Inputs */}
              <div className="bg-black/10 border border-[#2e2e30]/50 p-3 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 border-b border-[#2e2e30] pb-2">
                  <Layers size={12} className="text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-300 font-mono uppercase">Scenario B boundaries</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Acoustic impedance ({scenarioB.acousticImpedance} GPa*s/m)</label>
                    <input 
                      type="range" 
                      min="2.0" 
                      max="10.0" 
                      step="0.1"
                      value={scenarioB.acousticImpedance} 
                      onChange={(e) => setScenarioB({ acousticImpedance: parseFloat(e.target.value) })}
                      className="w-full accent-[#00E5FF] h-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Resistivity Threshold ({scenarioB.resistivityThreshold} Ωm)</label>
                    <input 
                      type="range" 
                      min="5" 
                      max="200" 
                      step="1.0"
                      value={scenarioB.resistivityThreshold} 
                      onChange={(e) => setScenarioB({ resistivityThreshold: parseFloat(e.target.value) })}
                      className="w-full accent-[#4CAF50] h-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Shale Cut-off ({scenarioB.shaleCutoff}%)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="1"
                      value={scenarioB.shaleCutoff} 
                      onChange={(e) => setScenarioB({ shaleCutoff: parseInt(e.target.value) })}
                      className="w-full accent-[#FF5722] h-1" 
                    />
                  </div>
                </div>
              </div>

              {/* Comparison table view */}
              <div className="bg-neutral-900 border border-[#2e2e30] rounded-lg p-3 font-sans !mt-6 space-y-2 shrink-0">
                <span className="text-[9px] font-mono text-gray-500 font-bold block uppercase border-b border-[#2e2e30] pb-1">Comparison Matrix Summary</span>
                <div className="text-[9px] space-y-1.5">
                  <div className="flex justify-between border-b border-neutral-900 pb-1">
                    <span className="text-gray-400 font-mono">Bound</span>
                    <span className="text-center font-bold text-gray-400">Model A</span>
                    <span className="text-center font-bold text-gray-400">Model B</span>
                    <span className="text-right font-bold text-[#FF9800]">Optimized</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800">
                    <span className="text-gray-300 font-mono">ACOUSTIC</span>
                    <span>{scenarioA.acousticImpedance}</span>
                    <span>{scenarioB.acousticImpedance}</span>
                    <span className="text-[#FF9800] break-keep">{optimizedParams ? optimizedParams.acousticImpedance : "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800">
                    <span className="text-gray-300 font-mono">RESISTIVITY</span>
                    <span>{scenarioA.resistivityThreshold}</span>
                    <span>{scenarioB.resistivityThreshold}</span>
                    <span className="text-[#FF9800] break-keep">{optimizedParams ? optimizedParams.resistivityThreshold : "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-300 font-mono">SHALE_CUT</span>
                    <span>{scenarioA.shaleCutoff}%</span>
                    <span>{scenarioB.shaleCutoff}%</span>
                    <span className="text-[#FF9800] break-keep">{optimizedParams ? `${optimizedParams.shaleCutoff}%` : "N/A"}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : activeTab === 'performance' ? (
            /* TAB 2: PERFORMANCE MONITOR PANEL */
            <div className="space-y-4 font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block font-mono">⚡ Performance Analytics Log</span>
              
              {metricsList.length === 0 ? (
                <div className="bg-black/25 rounded-lg border border-[#2e2e30] p-6 text-center text-[9px] text-[#666]">
                  [STANDBY - IDLE STATE]
                </div>
              ) : (
                <>
                  {/* Summary Metric Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-neutral-900 border border-[#2e2e30] p-2 rounded text-center">
                      <span className="text-[7px] text-gray-500 uppercase block">Last Execution</span>
                      <span className="text-xs font-bold text-[#00E5FF]">{metricsList[metricsList.length - 1].executionTimeMs.toLocaleString()} ms</span>
                    </div>
                    <div className="bg-neutral-900 border border-[#2e2e30] p-2 rounded text-center">
                      <span className="text-[7px] text-gray-500 uppercase block">Browser Heap</span>
                      <span className="text-xs font-bold text-gray-300">{metricsList[metricsList.length - 1].memoryUsageMb}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-neutral-900 border border-[#2e2e30] p-2 rounded text-center">
                      <span className="text-[7px] text-gray-500 uppercase block">Accuracy delta</span>
                      <span className="text-xs font-bold text-green-400">{metricsList[metricsList.length - 1].accuracyScore}%</span>
                    </div>
                    <div className="bg-neutral-900 border border-[#2e2e30] p-2 rounded text-center">
                      <span className="text-[7px] text-gray-500 uppercase block">Council Conviction</span>
                      <span className="text-xs font-bold text-orange-400">{metricsList[metricsList.length - 1].confidenceLevel}%</span>
                    </div>
                  </div>

                  {/* Historical log list */}
                  <div className="border border-[#2e2e30] rounded-lg p-2 bg-neutral-950/40 space-y-1.5">
                    <div className="flex justify-between text-[7px] text-[#555] font-bold border-b border-[#2e2e30] pb-1 uppercase">
                      <span>Module</span>
                      <span>Telemetry/Size</span>
                      <span>Result</span>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {metricsList.slice(-10).reverse().map((m, idx) => (
                        <div key={idx} className="flex justify-between text-[8px] py-1 border-b border-[#222] last:border-b-0 text-[#888]">
                          <span className="text-gray-300 uppercase shrink-0 truncate max-w-24">{m.activeModule}</span>
                          <span>
                            {m.executionTimeMs}ms | {m.memoryUsageMb.replace(' MB','')}M
                          </span>
                          <span className={cn(
                            "text-[7px] font-bold px-1 rounded-sm",
                            m.recalled 
                              ? "bg-cyan-950/40 text-cyan-400 border border-cyan-800/30" 
                              : "bg-neutral-800 text-gray-400"
                          )}>
                            {m.recalled ? "RECALLED" : "COMPUTE"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clean stats metrics logs button */}
                  <button
                    onClick={clearMetrics}
                    className="w-full py-1 text-center bg-transparent border border-neutral-800 text-gray-500 hover:text-red-500 hover:border-red-500/30 text-[8px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer"
                  >
                    Clear Performance History
                  </button>
                </>
              )}
            </div>
          ) : (
            /* TAB 3: SETTINGS (Grad Descent Settings) */
            <div className="space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono block">Optimizer Tuning Controls</span>
              
              <div className="bg-black/35 rounded-lg border border-[#2e2e30] p-3 space-y-4 font-mono text-[9px] text-gray-400 leading-normal">
                <div className="space-y-1">
                  <p className="font-bold text-white uppercase text-[8px]">gradient learn weight (rate)</p>
                  <p>Multiplier defining displacement velocity of variables along saddle surface slopes.</p>
                  <input type="range" defaultValue={15} className="w-full accent-cyan-400 h-1 mt-1" />
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-white uppercase text-[8px]">tolerance limit (e-7)</p>
                  <p>Absolute numerical difference bound under which convergence solution stops loop iterations automatically.</p>
                  <input type="range" defaultValue={60} className="w-full accent-cyan-400 h-1 mt-1" />
                </div>
              </div>

              {optimizedParams && (
                <div className="bg-green-500/5 border border-green-500/15 p-3 rounded-lg flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-green-300 uppercase block font-mono">Saddle Minima Locked</span>
                    <p className="text-[9px] text-[#888] font-sans leading-relaxed">
                      Auto-Optimize solver successfully converged at tolerance limit. Visual parameters overlaying Gamma Ray and Resistivity traces.
                    </p>
                  </div>
                </div>
              )}

              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono block">AI Learned Swarm Knowledge</span>
              <div className="bg-black/35 rounded-lg border border-red-500/20 p-3 space-y-3 font-mono text-[9px] text-[#888] leading-normal">
                <p>
                  As you compute optimizations and coordinate debates, the sequential orchestrator saves parameters and debate consensus into a physical learned knowledge file <code className="text-gray-300">knowledge_base.json</code> on the server's file system for Intelligent Recall matching.
                </p>
                <button
                  type="button"
                  onClick={() => startPurgeWorkflow('knowledge_base')}
                  className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white rounded text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer font-mono"
                >
                  ⚠ PURGE AI KNOWLEDGE
                </button>
                <div className="border-t border-[#2e2e30] pt-2 mt-2 space-y-1">
                  <span className="text-[7.5px] text-[#666] uppercase block">Security Heartbeat Core Layer</span>
                  <button
                    type="button"
                    onClick={() => startPurgeWorkflow('identity_lock')}
                    className="w-full py-1.5 bg-neutral-900 hover:bg-red-950 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 text-neutral-500 rounded text-[8px] uppercase font-mono tracking-wider transition-all cursor-pointer"
                  >
                    🔒 DESTRUCT SECURITY LOCK (.identity_lock)
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Export Brief Button */}
        <div className="p-4 border-t border-[#2e2e30] bg-[#161617] shrink-0">
          <button
            onClick={exportToPDF}
            className="w-full flex items-center justify-center gap-2 bg-[#FF5722] hover:bg-[#ff7043] text-black font-bold uppercase py-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all select-none shadow-lg cursor-pointer"
          >
            <FileDown size={14} />
            Export Analytical PDF
          </button>
        </div>

      </div>

      {/* HARDENED QUAD-TIER SECURITY PURGE MODAL */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[3000] flex items-center justify-center p-4 text-left font-mono">
          <div className="bg-[#121214] border border-red-500/30 rounded-xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden font-mono text-[10px] text-gray-300">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-red-500/20 bg-red-950/20 flex justify-between items-center shrink-0">
              <span className="text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">{import.meta.env.VITE_SECURITY_CORE}</span>
              {!purgeSuccess && !isUiFrozen && (
                <button 
                  onClick={() => setIsPurgeModalOpen(false)}
                  className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 font-mono">
              {purgeSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center font-bold text-lg border border-red-500/20 animate-pulse">
                    ⚠️
                  </div>
                  <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                    {purgeTarget === 'identity_lock' ? "Security Seal Permanently Wiped" : "AI Knowledge Purged"}
                  </h3>
                  <p className="text-[9px] text-[#888] leading-relaxed max-w-sm mx-auto font-sans">
                    {purgeTarget === 'identity_lock' 
                      ? "The license signature verification file (config/.identity_lock) has been physically deleted. The system is unstable and will reject boot signatures recursively."
                      : "The file knowledge_base.json was physically deleted. Memory systems have been entirely returned to primitive defaults."}
                  </p>
                  <button
                    onClick={() => {
                      if (purgeTarget === 'identity_lock') {
                        window.location.reload();
                      } else {
                        setIsPurgeModalOpen(false);
                        onClose();
                      }
                    }}
                    className="mt-4 px-6 py-2 bg-red-650 hover:bg-red-700 text-white rounded font-mono text-xs uppercase tracking-wider cursor-pointer animate-pulse"
                  >
                    {purgeTarget === 'identity_lock' ? "TRIGGER RUNTIME REBOOT" : "Close Session Securely"}
                  </button>
                </div>
              ) : (
                <>
                  {purgeTarget === 'identity_lock' ? (
                    <div className="p-3 bg-red-950/40 border border-red-500 text-red-400 text-[9px] rounded leading-relaxed font-sans text-left animate-pulse">
                      <strong>SYSTEM CORE SHIELD ACTIVE:</strong> A core security destruction query was lodged targeting the system-wide <code className="text-white">identity_lock</code> component. Human interface features are permanently frozen. Proceed with 4-Tier Authenticated Handshake to execute or reboot.
                    </div>
                  ) : (
                    <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-[9px] rounded leading-relaxed font-sans text-left">
                      <strong>CRITICAL DANGER:</strong> This operation deletes all AI learned swarm models parameters and boardroom debate caches permanently from the filesystem container. This operation cannot be undone.
                    </div>
                  )}

                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded border border-[#2e2e30]">
                    <span className="text-[#888]">Verification Stage:</span>
                    <div className="flex gap-1.5 text-[8px]">
                      <span className={`px-1 rounded-sm font-bold ${purgeStep >= 1 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-[#555]'}`}>1. MATH</span>
                      <span className={`px-1 rounded-sm font-bold ${purgeStep >= 2 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-[#555]'}`}>2. TEXT</span>
                      <span className={`px-1 rounded-sm font-bold ${purgeStep >= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-[#555]'}`}>3. ID</span>
                      <span className={`px-1 rounded-sm font-bold ${purgeStep >= 4 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-[#555]'}`}>4. OTP</span>
                    </div>
                  </div>

                  {/* STEP 1: MATH CHALLENGE */}
                  {purgeStep === 1 && (
                    <div className="space-y-2 text-left">
                      <label className="text-white uppercase font-bold text-[8px] block">{import.meta.env.VITE_SECURITY_CORE}</label>
                      <p className="text-gray-400 text-[9px] leading-relaxed font-sans">{import.meta.env.VITE_SECURITY_CORE}</p>
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-bold text-cyan-400 font-mono tracking-widest">
                        {purgeMathChallenge.q}
                      </div>
                      <input
                        type="number"
                        placeholder="Compute and enter product..."
                        value={purgeMathInput}
                        onChange={(e) => setPurgeMathInput(e.target.value)}
                        className="w-full bg-black/40 border border-[#2e2e30] rounded p-2.5 hover:border-[#444] focus:border-red-500 focus:outline-none font-mono text-[10px]"
                      />
                    </div>
                  )}

                  {/* STEP Stage 2: ENGLISH CONFIRMATION WORD */}
                  {purgeStep === 2 && (
                    <div className="space-y-2 text-left">
                      <label className="text-white uppercase font-bold text-[8px] block">{import.meta.env.VITE_SECURITY_CORE}</label>
                      <p className="text-gray-400 text-[9px] leading-relaxed font-sans">{import.meta.env.VITE_SECURITY_CORE}</p>
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-bold text-red-500 font-mono tracking-widest select-all">
                        DELETE FOREVER
                      </div>
                      <input
                        type="text"
                        placeholder="Type 'DELETE FOREVER' exactly as shown..."
                        value={purgeEnglishInput}
                        onChange={(e) => setPurgeEnglishInput(e.target.value)}
                        className="w-full bg-black/40 border border-[#2e2e30] rounded p-2.5 hover:border-[#444] focus:border-red-500 focus:outline-none font-mono text-[10px] uppercase placeholder:normal-case"
                      />
                    </div>
                  )}

                  {/* STEP Stage 3: THE IDENTITY */}
                  {purgeStep === 3 && (
                    <div className="space-y-2 text-left">
                      <label className="text-white uppercase font-bold text-[8px] block">{import.meta.env.VITE_SECURITY_CORE}</label>
                      <p className="text-gray-400 text-[9px] leading-relaxed font-sans">{import.meta.env.VITE_SECURITY_CORE}</p>
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-center text-xs font-bold text-orange-400 font-mono tracking-widest select-all">
                        {BRANDING.DEVELOPER_NAME}
                      </div>
                      <input
                        type="text"
                        placeholder="Enter full legal name..."
                        value={purgeIdentityInput}
                        onChange={(e) => setPurgeIdentityInput(e.target.value)}
                        className="w-full bg-black/40 border border-[#2e2e30] rounded p-2.5 hover:border-[#444] focus:border-red-500 focus:outline-none font-mono text-[10px]"
                      />
                    </div>
                  )}

                  {/* STEP 4: WHATSAPP/EMAIL OTP */}
                  {purgeStep === 4 && (
                    <div className="space-y-3 text-left">
                      <label className="text-white uppercase font-bold text-[8px] block tracking-wider">MFA SECURITY INTEGRITY SHIELD</label>
                      
                      {handshakeStatus === 'pending' ? (
                        <div className="p-3 bg-neutral-900/80 border border-amber-500/30 rounded-lg space-y-2 text-center">
                          <div className="flex items-center justify-center gap-2 text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider font-mono animate-pulse">Menunggu Persetujuan Email...</span>
                          </div>
                          <p className="text-gray-400 text-[8.5px] leading-relaxed font-sans">
                            Permintaan otorisasi aman telah dikirimkan ke email terdaftar {userName} (<strong className="text-gray-200">{displayEmail}</strong>).
                            Silakan buka kotak masuk email Anda dan klik tombol <strong className="text-emerald-400">Setujui</strong> untuk merilis kode OTP dinamis di layar ini.
                          </p>

                          {/* Emergency Dev Bypass Expander */}
                          <div className="mt-3 pt-3 border-t border-neutral-800 text-left">
                            {!showEmergencyInput ? (
                              <button
                                type="button"
                                onClick={() => setShowEmergencyInput(true)}
                                className="text-amber-500/80 hover:text-amber-400 font-mono text-[8px] uppercase font-bold tracking-wider underline cursor-pointer w-full text-center transition-colors"
                              >
                                ✉ Gagal menerima email? Masukkan PIN Darurat
                              </button>
                            ) : (
                              <div className="space-y-1.5">
                                <span className="text-gray-500 font-mono text-[8px] block uppercase font-bold tracking-wider">PIN OTORISASI DARURAT</span>
                                <div className="flex gap-1.5">
                                  <input
                                    type="password"
                                    placeholder="Masukkan PIN Pengembang..."
                                    value={emergencyPin}
                                    onChange={(e) => setEmergencyPin(e.target.value)}
                                    className="flex-1 bg-black/60 border border-neutral-800 rounded px-2 py-1 font-mono text-[9px] focus:outline-none focus:border-amber-500 text-amber-400"
                                  />
                                  <button
                                    type="button"
                                    disabled={isBypassing}
                                    onClick={handleEmergencyBypass}
                                    className="px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-mono text-[8px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                                  >
                                    {isBypassing ? 'Loading' : 'Bypass'}
                                  </button>
                                </div>
                                {emergencyError && (
                                  <span className="text-red-400 font-mono text-[8px] block leading-tight">{emergencyError}</span>
                                )}
                                <p className="text-gray-600 font-sans text-[7.5px] leading-relaxed">
                                  Masukkan PIN Keamanan Otorisasi Darurat yang dikonfigurasi secara aman pada server (Environment: SECURITY_PIN).
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : handshakeStatus === 'approved' ? (
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-center space-y-1">
                          <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-1.5">
                            ✓ OTORISASI DISETUJUI
                          </div>
                          <p className="text-gray-300 text-[8.5px] leading-relaxed font-sans">
                            Persetujuan {userName} diterima! Kode OTP aman dilepaskan pada pop-up layar. Silakan masukkan di bawah ini:
                          </p>
                        </div>
                      ) : handshakeStatus === 'rejected' ? (
                        <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-center">
                          <div className="text-red-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                            ✕ OTORISASI DITOLAK
                          </div>
                          <p className="text-gray-400 text-[8.5px] leading-relaxed font-sans mt-1">
                            Tindakan ini dibatalkan secara permanen oleh Pemilik Lisensi.
                          </p>
                        </div>
                      ) : null}

                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Masukkan 6-digit OTP..."
                        value={purgeOtpInput}
                        disabled={handshakeStatus === 'pending' || handshakeStatus === 'rejected'}
                        onChange={(e) => setPurgeOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-black/40 border border-[#2e2e30] rounded p-2.5 hover:border-[#444] focus:border-red-500 focus:outline-none font-mono text-center tracking-[0.5em] text-cyan-400 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                      <div className="text-[8px] text-neutral-500 font-sans leading-normal text-center uppercase tracking-wider">SECURE ONE-TIME PORT INTERFACE</div>
                    </div>
                  )}

                  {purgeError && (
                    <div className="p-2.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 font-mono text-[9px] leading-relaxed text-left animate-shake">
                      Error: {purgeError}
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isUiFrozen}
                      onClick={() => setIsPurgeModalOpen(false)}
                      className="flex-1 py-2 rounded bg-neutral-800 text-gray-400 border border-neutral-700 hover:text-white hover:bg-neutral-700 font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isUiFrozen ? "ABORT PROHIBITED" : "ABORT DESTRUCTION"}
                    </button>
                    <button
                      type="button"
                      disabled={isOtpSending}
                      onClick={handleVerifyStep}
                      className="flex-1 py-2 rounded bg-red-900 hover:bg-red-800 disabled:opacity-50 text-white font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {isOtpSending 
                        ? "DISPATCHING OTP..." 
                        : purgeStep === 4 
                          ? "CONFIRM & PURGE" 
                          : purgeStep === 3 
                            ? "SEND OTP PROTOCOL" 
                            : "VERIFY CHALLENGE"}
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Floating Notification Popup - Triggered once Ivan approves the handshake */}
      {showNotificationPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm bg-[#09140f] border-2 border-emerald-500 text-emerald-400 rounded-xl p-4 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-bounce font-mono text-[10px]">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400 text-xs animate-pulse">
              ⚡ NOTIFIKASI SECURITY OTP
            </span>
            <button
              onClick={() => setShowNotificationPopup(false)}
              className="text-emerald-500/60 hover:text-emerald-400 p-0.5 cursor-pointer text-xs font-bold font-mono"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 font-sans leading-relaxed mb-3">
            Halo <strong className="text-emerald-300">{userName}</strong>, otorisasi Anda berhasil diterima! Kode OTP dinamis di bawah ini berlaku untuk sesi ini:
          </p>
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3 text-center">
            <span className="text-[9px] text-emerald-500 block uppercase tracking-widest font-semibold mb-1">Kode OTP Anda</span>
            <span className="text-2xl font-bold tracking-[0.25em] text-emerald-300 select-all font-mono animate-pulse">{revealedOtp}</span>
          </div>
          <p className="text-[8px] text-emerald-500/60 text-center mt-2.5 uppercase tracking-wider font-semibold">
            SEAL CODE CHANGE DETECTED • SECURE PROTOCOL
          </p>
        </div>
      )}
    </>
  );
}
