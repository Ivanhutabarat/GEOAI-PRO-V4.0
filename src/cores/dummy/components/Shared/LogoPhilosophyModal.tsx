import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe2, Cpu, Zap, Volume2, VolumeX, Shield, Activity, HelpCircle, Sparkles, AlertTriangle } from 'lucide-react';
import GeoAILogo from './GeoAILogo';

interface LogoPhilosophyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoPhilosophyModal({ isOpen, onClose }: LogoPhilosophyModalProps) {
  const [activeElement, setActiveElement] = useState<string>('globe');
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [seismicFrequency, setSeismicFrequency] = useState(120); // Low frequency hum
  const [seismicActivity, setSeismicActivity] = useState(40); // Pulse speed

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop audio on unmount or close
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
  }, [isOpen]);

  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 1. Tectonic Sub-Bass Hum Oscillator
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(seismicFrequency / 2, ctx.currentTime); // Low tectonic frequency

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime); // Safe, ambient volume

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      oscillatorRef.current = osc;
      biquadFilterRef.current = filter;
      gainNodeRef.current = gain;
      setIsAudioActive(true);

      // 2. Continuous telemetry bleep-pulse generator
      triggerPulseLoop(ctx);

    } catch (e) {
      console.error("Web Audio API not supported or blocked:", e);
    }
  };

  const triggerPulseLoop = (ctx: AudioContext) => {
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    
    const interval = Math.max(300, 2000 - (seismicActivity * 18));
    
    pulseIntervalRef.current = setInterval(() => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
      try {
        const pulseOsc = ctx.createOscillator();
        const pulseGain = ctx.createGain();
        
        pulseOsc.type = 'triangle';
        // Pitch changes based on selected element
        let pitch = 220;
        if (activeElement === 'circuit') pitch = 440;
        if (activeElement === 'arrow') pitch = 330;
        if (activeElement === 'seismic') pitch = 180;

        pulseOsc.frequency.setValueAtTime(pitch, ctx.currentTime);
        
        pulseGain.gain.setValueAtTime(0.06, ctx.currentTime);
        pulseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        
        pulseOsc.connect(pulseGain);
        pulseGain.connect(ctx.destination);
        
        pulseOsc.start();
        pulseOsc.stop(ctx.currentTime + 0.3);
      } catch (err) {
        // ignore audio errors during teardown
      }
    }, interval);
  };

  const stopAudio = () => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      setIsAudioActive(false);
    } catch (e) {
      console.warn("Audio stop error:", e);
    }
  };

  const toggleAudio = () => {
    if (isAudioActive) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Adjust audio parameters dynamically when sliders change
  useEffect(() => {
    if (isAudioActive && oscillatorRef.current && audioCtxRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(seismicFrequency / 2, audioCtxRef.current.currentTime);
    }
  }, [seismicFrequency, isAudioActive]);

  useEffect(() => {
    if (isAudioActive && audioCtxRef.current) {
      triggerPulseLoop(audioCtxRef.current);
    }
  }, [seismicActivity, activeElement, isAudioActive]);

  const elements = [
    {
      id: 'globe',
      title: 'BENTUK: BOLA BUMI 3D (Spherical Globe)',
      subtitle: 'Geologi Alami & Struktur Bawah Permukaan',
      desc: 'Gradasi 3D radial biru melambangkan Bumi nyata dengan volume dan kedalaman struktural. Garis lintang dan bujur yang melengkung melambangkan pemetaan presisi parameter geofisika global secara spasial. Ini menegaskan kedalaman dan ketebalan formasi batuan sebelum operasi dimulai.',
      icon: <Globe2 className="text-[#00E5FF]" size={16} />,
      metric: 'Crustal Depth: 45km | Spherical Radius: 6,371km'
    },
    {
      id: 'circuit',
      title: 'FUSI: SIRKUIT DIGITAL (Digital Motherboard)',
      subtitle: 'Kecerdasan Buatan & Sistem Swarm Otomatis',
      desc: 'Belapan kanan yang dihiasi sirkuit tembaga neon blue dan green melambangkan AI Multi-Dimensi (Core GeoAI Pro). Lintasan data mengalir seperti energi cair, memvisualisasikan bagaimana AI memproses miliaran data sensor dari lapangan dalam hitungan milidetik secara real-time.',
      icon: <Cpu className="text-[#00FFCC]" size={16} />,
      metric: 'Latency: 1.4ms | Processing Rate: 4.8 GB/s'
    },
    {
      id: 'arrow',
      title: 'ARAH: PANAH EMAS (Rotational Orbital Ring)',
      subtitle: 'Kepatuhan Regulasi, Keberlanjutan & Profitabilitas',
      desc: 'Ring orbit emas miring dengan mata panah melambangkan kesinambungan, siklus energi panas bumi, dan kepatuhan mutlak terhadap HSE/Regulator. Arah putaran melingkar melambangkan tameng perlindungan operasional yang memitigasi bahaya sembari menjaga amortisasi modal (CAPEX) tetap optimal.',
      icon: <Shield className="text-[#FFB300]" size={16} />,
      metric: 'HSE Compliance: 100% | Ring Velocity: 360°/16s'
    },
    {
      id: 'seismic',
      title: 'DENYUT: GELOMBANG SEISMOGRAP (Telemetry Waveform)',
      subtitle: 'Living Telemetry & Pemantauan Sesar Patahan',
      desc: 'Gelombang telemetry seismik berwarna jingga menyala yang melintasi batuan melambangkan denyut dinamis geofisika aktif. Ini mewakili kemampuan deteksi patahan sesar, bencana badai, kebocoran gas, hingga pergeseran tanah secara instan sebelum mencapai batas kritis runtuh.',
      icon: <Activity className="text-[#FF3D00]" size={16} />,
      metric: 'Vibration Freq: 120Hz | Shear Failure Margin: 1.8x'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl bg-[#0a0d16] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.15)] flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh] z-10 font-mono text-xs text-gray-300"
          >
            {/* Header / Title bar */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-500/50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Left Column: Big Interactive Logo Render & Audio Synth */}
            <div className="w-full md:w-[45%] bg-[#06080e] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-cyan-500/10">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-1 rounded border border-[#00E5FF]/20 inline-block">
                  System Blueprint Decoder
                </span>
                <h2 className="text-lg font-bold text-white tracking-wider">MAKNA FILOSOFI LOGO GEOAI PRO</h2>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Analisis struktur logo berdasarkan geometri multi-dimensi, teori fusi digital geologi, serta spektrum mitigasi risiko bawah permukaan bumi.
                </p>
              </div>

              {/* Central Logo Showcase */}
              <div className="my-8 flex justify-center items-center relative py-6">
                <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 to-transparent blur-2xl rounded-full" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.02, 1],
                    rotate: [0, 0.5, -0.5, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative cursor-pointer"
                >
                  <GeoAILogo size={180} glow={true} layout="icon" />
                </motion.div>
              </div>

              {/* Web Audio Sonification Controller */}
              <div className="bg-black/60 border border-cyan-500/20 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[10px] uppercase flex items-center gap-1.5">
                    <Activity size={12} className="text-[#FF5722] animate-pulse" />
                    Seismic Sonification Engine
                  </span>
                  <button
                    onClick={toggleAudio}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-all ${
                      isAudioActive 
                        ? 'bg-red-500/25 text-red-400 border border-red-500/40' 
                        : 'bg-cyan-500/25 text-[#00E5FF] border border-cyan-500/40'
                    }`}
                  >
                    {isAudioActive ? <Volume2 size={11} className="animate-bounce" /> : <VolumeX size={11} />}
                    {isAudioActive ? 'Mute Hum' : 'Sonify Wave'}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>Tectonic Pitch (Frequency)</span>
                    <span className="text-[#00E5FF]">{seismicFrequency} Hz</span>
                  </div>
                  <input 
                    type="range" 
                    min="60" 
                    max="300" 
                    value={seismicFrequency}
                    onChange={(e) => setSeismicFrequency(Number(e.target.value))}
                    className="w-full h-1 bg-[#111] rounded accent-cyan-400 focus:outline-none"
                    disabled={!isAudioActive}
                  />

                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>Telemetry Beep Speed</span>
                    <span className="text-[#00FFCC]">{seismicActivity} %</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="90" 
                    value={seismicActivity}
                    onChange={(e) => setSeismicActivity(Number(e.target.value))}
                    className="w-full h-1 bg-[#111] rounded accent-emerald-400 focus:outline-none"
                    disabled={!isAudioActive}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Element breakdown lists */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#080b12] flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase block">
                  Click below to decode specific logo vector layers:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {elements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setActiveElement(el.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        activeElement === el.id 
                          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.05)]' 
                          : 'bg-black/30 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {el.icon}
                        <span className={`text-[10px] font-bold ${activeElement === el.id ? 'text-white' : 'text-gray-400'}`}>
                          {el.id.toUpperCase()} LAYER
                        </span>
                      </div>
                      <div className="text-[9px] text-gray-500 truncate">{el.subtitle}</div>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeElement && (
                    <motion.div
                      key={activeElement}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-4 bg-black/50 border border-cyan-500/15 rounded-lg space-y-3"
                    >
                      {elements.find(e => e.id === activeElement)?.icon && (
                        <div className="flex items-center gap-2 pb-1.5 border-b border-white/5">
                          {elements.find(e => e.id === activeElement)?.icon}
                          <span className="font-bold text-white text-[11px] uppercase">
                            {elements.find(e => e.id === activeElement)?.title}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        {elements.find(e => e.id === activeElement)?.desc}
                      </p>

                      <div className="pt-2 flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5 font-mono">
                        <span className="flex items-center gap-1">
                          <Sparkles size={10} className="text-yellow-400" />
                          Scientific Vector Metric:
                        </span>
                        <span className="text-cyan-400 font-semibold">
                          {elements.find(e => e.id === activeElement)?.metric}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom summary / sign-off */}
              <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-500 leading-normal space-y-2">
                <div className="flex items-center gap-2 text-yellow-500/70 font-mono">
                  <AlertTriangle size={12} />
                  <span>DECODED METRIC MATCHED AT LATITUDE 0.789° S // LONGITUDE 120.456° E</span>
                </div>
                <p>
                  Dengan refaktor ini, logo GeoAI Pro v4.0 bukan sekadar hiasan kosmetik, melainkan representasi fisik dari fusi teknologi Geofisika Bumi, integritas Geomekanika batuan, visualisasi Seismologi, serta kecerdasan Swarm AI yang strictly neutral dalam memitigasi bahaya operasional.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
