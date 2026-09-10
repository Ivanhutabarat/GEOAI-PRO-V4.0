import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Smile, 
  Compass, 
  Phone, 
  ShieldAlert, 
  Keyboard, 
  Coffee, 
  Zap, 
  Award, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  RotateCcw, 
  Heart, 
  Flame, 
  RefreshCw, 
  Sliders, 
  MessageSquare,
  Grab,
  AlertTriangle,
  FileText,
  Search,
  BookOpen
} from 'lucide-react';

import MrGeo3D from "./MrGeo3D";
// Enum for all 32 gestures and emotes (including idle/scroll/type/loading/route)
export type AgentGesture = 
  | 'IDLE'
  | 'GREETING'
  | 'THUMBS_UP'
  | 'HEAD_SCRATCH'
  | 'CHECK_WATCH'
  | 'BOW'
  | 'SHRUG'
  | 'READ_TABLET'
  | 'ADJUST_GLASSES'
  | 'VICTORY_FLEX'
  | 'CLAP'
  | 'DANCE'
  | 'FACEPALM'
  | 'YAWN_SLEEP'
  | 'SHOCKED'
  | 'SALUTE'
  | 'COFFEE_BREAK'
  | 'POINT_LEFT'
  | 'POINT_RIGHT'
  | 'POINT_UP'
  | 'POINT_DOWN'
  | 'ADJUST_TIE'
  | 'WHISTLE'
  | 'CROSS_ARMS'
  | 'SIGH'
  | 'HEART_EYES'
  | 'LAUGH'
  | 'ANGRY'
  | 'SAD'
  | 'MEDITATE'
  | 'SCANNING'
  | 'WARNING_ALERT'
  | 'SCROLLING'
  | 'TYPING'
  | 'LOADING_PHONE'
  | 'ROUTE_CLICK';

interface GestureDefinition {
  name: string;
  category: 'Greeting' | 'Professional' | 'Celebration' | 'Emotion' | 'Special' | 'Auto-Trigger';
  emoji: string;
  description: string;
  comment: string;
}

const getGestureList = (userName: string): Record<AgentGesture, GestureDefinition> => ({
  IDLE: { name: "Standby / Idle", category: "Auto-Trigger", emoji: "👔", description: "Standard professional breathing state", comment: `Ready for your commands, ${userName}!` },
  GREETING: { name: "Executive Wave", category: "Greeting", emoji: "👋", description: "Waves formally with a confident smile", comment: `Welcome back, ${userName}!` },
  THUMBS_UP: { name: "Thumbs Up", category: "Professional", emoji: "👍", description: "Approval and confidence boost", comment: "Excellent work! Data calculations look absolute." },
  HEAD_SCRATCH: { name: "Deep Analysis", category: "Professional", emoji: "🤔", description: "Scratches head, analyzing formulas", comment: "Hmm... This geological strata looks highly anomalous." },
  CHECK_WATCH: { name: "Time Check", category: "Professional", emoji: "⌚", description: "Taps Rolex, awaiting telemetry data", comment: "Time is money. Waiting for live sensors to establish." },
  BOW: { name: "Respectful Bow", category: "Greeting", emoji: "🙇", description: "Polite corporate greeting", comment: "A true pleasure working with a mastermind like you." },
  SHRUG: { name: "Uncertain Strata", category: "Professional", emoji: "🤷", description: "Palms up, puzzled posture", comment: "No signal on that sensor segment, let's calibrate!" },
  READ_TABLET: { name: "Holo-Tablet Study", category: "Professional", emoji: "📟", description: "Pulls out holographic iPad and scrolls", comment: "Let's review the cross-sectional sub-surface matrix." },
  ADJUST_GLASSES: { name: "Sunglasses Shine", category: "Professional", emoji: "😎", description: "Pushes up dark glasses with a bright sparkle", comment: "That calculation was slick. GeoAI is fully dialed." },
  VICTORY_FLEX: { name: "Executive Flex", category: "Celebration", emoji: "💪", description: "Biceps flex with fiery orange aura", comment: "Raw processing power! This is high-level engineering." },
  CLAP: { name: "Corporate Claps", category: "Celebration", emoji: "👏", description: "Claps hands with sound-waves", comment: `Outstanding dataset, ${userName}! That report is flawless.` },
  DANCE: { name: "Victory Dance", category: "Celebration", emoji: "🕺", description: "Slick corporate dance slide", comment: "We found the reservoir! Cue the celebration!" },
  FACEPALM: { name: "Loss of Connection", category: "Emotion", emoji: "🤦", description: "Hand slap to sunglasses, head down", comment: "Wait... Did we forget to configure the API key?" },
  YAWN_SLEEP: { name: "Power Nap", category: "Emotion", emoji: "😴", description: "Stretches, snoozes with floating Zzz", comment: "Analyzing 10,000 meters of core samples makes one sleepy..." },
  SHOCKED: { name: "Sunglasses Slip", category: "Emotion", emoji: "😱", description: "Glasses slide down, jaw drops open", comment: "Unbelievable! A seismic spike of magnitude 8.5?!" },
  SALUTE: { name: "Honor Salute", category: "Greeting", emoji: "🫡", description: "Crisp professional hand salute", comment: "Reporting for duty! Standing by for geological scan." },
  COFFEE_BREAK: { name: "Coffee Sip", category: "Special", emoji: "☕", description: "Sips hot coffee from a GeoAI mug", comment: "Ah, the sweet taste of raw data and caffeine." },
  POINT_LEFT: { name: "Point Left", category: "Professional", emoji: "👈", description: "Points to left border with target ring", comment: "Keep your eyes on the left telemetry rail." },
  POINT_RIGHT: { name: "Point Right", category: "Professional", emoji: "👉", description: "Points to right panel with laser vector", comment: "There! Look at that spike on the right database feed!" },
  POINT_UP: { name: "Point Up", category: "Professional", emoji: "👆", description: "Points up with a bright lightbulb", comment: "Wait, I just had a breakthrough in sub-surface imaging!" },
  POINT_DOWN: { name: "Point Down", category: "Professional", emoji: "👇", description: "Points to the ground with target sonar", comment: "Drilling target located directly beneath this point!" },
  ADJUST_TIE: { name: "Tie Adjust", category: "Professional", emoji: "👔", description: "Straightens tie, sparkles surround", comment: "A businessman must look flawless, even deep in the field." },
  WHISTLE: { name: "Whistle Tune", category: "Celebration", emoji: "😗", description: "Whistles with musical notes rising", comment: "Things are going smoothly. Let's enjoy the scan." },
  CROSS_ARMS: { name: "Folded Arms", category: "Professional", emoji: "🙅", description: "Crosses arms confidently", comment: "I've reviewed the structural model. It is completely safe." },
  SIGH: { name: "Exhaustion Puff", category: "Emotion", emoji: "😮‍💨", description: "Sighs with gray puff of air", comment: "Rough day. So many seismic lines to inspect..." },
  HEART_EYES: { name: "Love / Praise", category: "Emotion", emoji: "😍", description: "Hearts on sunglasses, hearts bubble", comment: `This UI design is absolutely beautiful, ${userName}!` },
  LAUGH: { name: "Executive Chuckle", category: "Emotion", emoji: "😆", description: "Shakes laughing with Haha text", comment: "Haha! Those competitors don't stand a chance against us!" },
  ANGRY: { name: "Fuming / Red", category: "Emotion", emoji: "😡", description: "Red face, steam puffs from ears", comment: "Who cut the fiber-optic link to the borehole sensors?!" },
  SAD: { name: "Sinking Stock", category: "Emotion", emoji: "😢", description: "Cries with cascading blue tears", comment: "The API rate exceeded... It hurts my server processors." },
  MEDITATE: { name: "Zen Hover", category: "Special", emoji: "🧘", description: "Levitates with cross-legged glow", comment: "Clear the cache... Purge the stack... Achieve true data zen." },
  SCANNING: { name: "Borehole Sweep", category: "Special", emoji: "🔍", description: "Magnifying glass with scanning matrix", comment: "Scanning the screen for data micro-anomalies..." },
  WARNING_ALERT: { name: "Siren Alert", category: "Special", emoji: "🚨", description: "Siren light rotates, red overlay", comment: "Critical pressure alert! Core ventilation is blocked!" },
  SCROLLING: { name: "Holo-Scroll", category: "Auto-Trigger", emoji: "✨", description: "Generates light hologram from arm", comment: "Scrolling detected! Projecting secondary interface coordinates." },
  TYPING: { name: "Holo-Keyboard", category: "Auto-Trigger", emoji: "⌨️", description: "Types furiously on green laser keys", comment: "Input detected! Compiling executive directives..." },
  LOADING_PHONE: { name: "CEO Hotline", category: "Auto-Trigger", emoji: "📞", description: "Makes phone call, projects 5 holograms", comment: "One moment... Conferencing with the board about this load state." },
  ROUTE_CLICK: { name: "Module Hop", category: "Auto-Trigger", emoji: "🚀", description: "Points virtual laser to active selection", comment: "Module shifted! Initializing specific sub-surface datasets." }
});

interface AgentCompanionProps {
  isLoading?: boolean;
}

export default function AgentCompanion({ isLoading = false }: AgentCompanionProps) {
  const { fullName } = useAuth();
  const userName = fullName || 'Operator';
  const location = useLocation();
  
  // States
  const [activeGesture, setActiveGesture] = useState<AgentGesture>('IDLE');
  const [chatOpen, setChatOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customText, setCustomText] = useState("");
  const [dialogText, setDialogText] = useState(`Hello ${userName}! Ready to conquer geological anomalies today? Tap any emote to play with my movements!`);
  const [dragged, setDragged] = useState(false);
  const [speechBubbleActive, setSpeechBubbleActive] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Greeting' | 'Professional' | 'Celebration' | 'Emotion' | 'Special'>('All');

  // References for timers
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Synth Effect
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (!soundEnabled) {
        setIsSpeaking(false);
        return;
      }

      // Strip markdown, bracket headers, and emojis for super smooth TTS delivery
      const cleanText = text
        .replace(/\[[^\]]+\]/g, "")
        .replace(/[^\w\s\d.,!?'"\-]/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const lower = text.toLowerCase();
      const isIndo = lower.includes("halo") || lower.includes("selamat") || lower.includes("aman") || lower.includes("kunci") || lower.includes("kembali") || lower.includes("bocor") || lower.includes("sistem") || lower.includes("siapa") || lower.includes("apa");

      if (isIndo) {
        utterance.lang = 'id-ID';
      } else {
        utterance.lang = 'en-US';
      }

      // Find suitable matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech Synthesis Error:", err);
      setIsSpeaking(false);
    }
  };

  // Sync vocal speech on dialogText changes when soundEnabled is true
  useEffect(() => {
    if (soundEnabled && dialogText) {
      speakText(dialogText);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [dialogText, soundEnabled]);

  // Set gesture with timeout to revert back to IDLE
  const triggerGesture = (gesture: AgentGesture, duration: number = 3500) => {
    if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
    setActiveGesture(gesture);
    setDialogText(getGestureList(userName)[gesture]?.comment || `Ready, ${userName}!`);
    setSpeechBubbleActive(true);

    if (gesture !== 'IDLE') {
      gestureTimeoutRef.current = setTimeout(() => {
        setActiveGesture('IDLE');
      }, duration);
    }
  };

  // Sound Synth Effect
  const playSound = (type: 'beep' | 'laser' | 'sparkle' | 'success' | 'alert') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'beep') {
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'laser') {
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'sparkle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.setValueAtTime(2400, now + 0.05);
        osc.frequency.setValueAtTime(2800, now + 0.1);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1);
        osc.frequency.setValueAtTime(659, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.2);
        osc.frequency.linearRampToValueAtTime(150, now + 0.4);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn("Audio Context block", e);
    }
  };

  // 1. Loading Trigger (Hotline / Phone Hologram)
  useEffect(() => {
    if (isLoading) {
      setActiveGesture('LOADING_PHONE');
      setDialogText(`Hold on! Re-routing our primary satellites and calling ${userName}'s remote line...`);
      setSpeechBubbleActive(true);
      playSound('alert');
    } else {
      if (activeGesture === 'LOADING_PHONE') {
        setActiveGesture('IDLE');
        setDialogText("Link cleared! Telemetry dashboard is fully updated.");
        playSound('success');
      }
    }
  }, [isLoading]);

  // 2. Typing Monitor
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore functional keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(e.key)) return;
      
      // Don't interrupt loading/warning state
      if (activeGesture === 'LOADING_PHONE' || activeGesture === 'WARNING_ALERT') return;

      setIsTyping(true);
      setActiveGesture('TYPING');
      setDialogText("Transmitting keystrokes to GeoAI core processors!");
      setSpeechBubbleActive(true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setActiveGesture('IDLE');
      }, 1500);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeGesture]);

  // 3. Scroll Monitor
  useEffect(() => {
    const handleGlobalScroll = () => {
      if (activeGesture === 'LOADING_PHONE' || activeGesture === 'TYPING' || activeGesture === 'WARNING_ALERT') return;

      setIsScrolling(true);
      setActiveGesture('SCROLLING');
      setDialogText("Vertical scan scroll registered. Modulating display viewport coordinates.");
      setSpeechBubbleActive(true);

      if (scrollingTimeoutRef.current) clearTimeout(scrollingTimeoutRef.current);
      scrollingTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setActiveGesture('IDLE');
      }, 1500);
    };

    window.addEventListener('scroll', handleGlobalScroll, true);
    return () => window.removeEventListener('scroll', handleGlobalScroll, true);
  }, [activeGesture]);

  // 4. Route Monitor (Pointer Click)
  useEffect(() => {
    if (activeGesture === 'LOADING_PHONE') return;

    setActiveGesture('ROUTE_CLICK');
    playSound('beep');
    const pathName = location.pathname.split('/').pop() || 'DASHBOARD';
    setDialogText(`Accessing [${pathName.toUpperCase()}] matrix. Loading sub-surface sensors...`);
    setSpeechBubbleActive(true);

    const t = setTimeout(() => {
      setActiveGesture('IDLE');
    }, 2500);

    return () => clearTimeout(t);
  }, [location.pathname]);

  // Custom User Input Form Submission
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    
    const userMsg = customText;
    setCustomText("");
    
    setDialogText(`Analyzing instruction: "${userMsg}"...`);
    setActiveGesture("TYPING");
    setSpeechBubbleActive(true);
    playSound("beep");
    
    try {
      const response = await fetch("/api/master-synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("geoai_token")}`
        },
        body: JSON.stringify({
          message: userMsg,
          globalData: "User is asking Mr. Geo a direct question. Keep it concise, friendly, and in character as Mr. Geo (a clever, slightly sarcastic male AI geophysics assistant). Reply in Indonesian if asked in Indonesian."
        })
      });
      
      const data = await response.json();
      const reply = data.reply || `I encountered a sub-space error, ${userName}. Try again.`;
      
      setDialogText(reply);
      triggerGesture("POINT_RIGHT", 5000);
      playSound("success");
    } catch (e) {
      setDialogText("Transmission failed. Sub-space relay is down.");
      triggerGesture("WARNING_ALERT", 3000);
      playSound("alert");
    }
  };

  const filteredGestures = Object.entries(getGestureList(userName)).filter(([key, def]) => {
    if (key === 'IDLE' || def.category === 'Auto-Trigger') return false;
    if (categoryFilter === 'All') return true;
    return def.category === categoryFilter;
  });

  return (
    <>
      {/* Draggable Agent Puppet Container */}
      <motion.div
        drag
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 15 }}
        onDragStart={() => {
          setDragged(true);
          setDialogText("Whoa, gravity stabilizer disengaged! Wheee!");
          setSpeechBubbleActive(true);
          playSound('laser');
        }}
        onDragEnd={() => {
          setDragged(false);
          setDialogText(`Safely repositioned at new coordinates, ${userName}!`);
        }}
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center select-none cursor-grab active:cursor-grabbing"
        initial={{ opacity: 0, scale: 0.5, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        id="mr-geo-companion"
      >
        {/* Interactive Speech Bubble */}
        <AnimatePresence>
          {speechBubbleActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-40 right-[-10px] w-64 bg-neutral-950/95 border border-[#00E5FF]/40 rounded-xl p-3 shadow-[0_4px_24px_rgba(0,229,255,0.25)] text-white backdrop-blur-md"
            >
              {/* Close bubble */}
              <button 
                onClick={() => setSpeechBubbleActive(false)}
                className="absolute top-1.5 right-1.5 text-neutral-500 hover:text-white transition-colors"
                title="Hide Speech Bubble"
              >
                <X size={12} />
              </button>

              <div className="flex items-center gap-1 mb-1 text-[8px] font-mono font-bold text-[#00E5FF] tracking-wider uppercase">
                <Smile size={10} className="animate-spin" style={{ animationDuration: '6s' }} />
                <span>MR. GEO // FIELD AGENT</span>
              </div>

              <p className="text-[10px] text-gray-200 leading-normal font-sans pr-3">
                {dialogText}
              </p>

              {/* Action Indicators */}
              <div className="mt-2 pt-1.5 border-t border-neutral-800 flex justify-between items-center">
                <span className="text-[8px] font-mono text-neutral-400">
                  ACT: <span className="text-[#FF5722] font-bold">{activeGesture}</span>
                </span>
                
                {/* Audio Toggle button */}
                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    setTimeout(() => playSound('beep'), 100);
                  }}
                  className={`p-1 rounded text-[8px] flex items-center gap-1 font-mono transition-colors border ${
                    soundEnabled 
                      ? "bg-[#00E5FF]/20 border-[#00E5FF]/40 text-[#00E5FF]" 
                      : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-400"
                  }`}
                  title={soundEnabled ? "Mute Companion" : "Enable Sound Effects"}
                >
                  {soundEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
                  <span>{soundEnabled ? "AUDIO ON" : "MUTED"}</span>
                </button>
              </div>

              {/* Small tail */}
              <div className="absolute bottom-[-6px] right-8 w-3 h-3 bg-neutral-950 border-r border-b border-[#00E5FF]/40 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Aura / Holographic Platform */}
        <div className="relative w-28 h-32 flex items-center justify-center">
          
          {/* Holographic floor ring */}
          <div className="absolute bottom-0 w-24 h-4 bg-[#00E5FF]/5 border border-[#00E5FF]/30 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-16 h-2 bg-[#00E5FF]/15 rounded-full filter blur-[1px]"></div>
            <div className="absolute w-20 h-20 border border-[#00E5FF]/20 rounded-full transform -rotate-x-12 animate-spin" style={{ animationDuration: '10s' }}></div>
          </div>

          {/* Levitation shadows & light lines */}
          <div className="absolute bottom-1 w-10 h-0.5 bg-cyan-500 filter blur-[3px] opacity-60 animate-ping"></div>

          {/* --- ACTIVE VISUAL SPECIAL OVERLAYS --- */}
          
          {/* A. Scanning Sweep Overlay */}
          {activeGesture === 'SCANNING' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-24 h-24 border border-emerald-500/40 rounded-full animate-ping absolute"></div>
              <div className="w-24 h-0.5 bg-emerald-500/80 absolute shadow-[0_0_8px_#10b981] animate-bounce"></div>
              <Search className="text-emerald-400 absolute animate-pulse right-2 top-2" size={16} />
            </div>
          )}

          {/* B. Warning Alert / Emergency Red overlay */}
          {activeGesture === 'WARNING_ALERT' && (
            <div className="absolute inset-x-0 top-[-20px] pointer-events-none flex flex-col items-center">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]"
              >
                <AlertTriangle size={18} />
              </motion.div>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping mt-1"></div>
            </div>
          )}

          {/* C. Thinking Question Marks */}
          {activeGesture === 'HEAD_SCRATCH' && (
            <div className="absolute top-0 left-2 pointer-events-none text-cyan-400 text-xs font-mono font-bold animate-bounce flex gap-1">
              <span>?</span><span className="delay-100">?</span><span className="delay-200">?</span>
            </div>
          )}

          {/* D. Love / Heart Floating bubble */}
          {activeGesture === 'HEART_EYES' && (
            <div className="absolute top-[-25px] pointer-events-none flex gap-1 justify-center w-full">
              <motion.span 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: -20, opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-red-500 text-xs"
              >
                ❤️
              </motion.span>
              <motion.span 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: -25, opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                className="text-pink-500 text-[10px]"
              >
                💖
              </motion.span>
            </div>
          )}

          {/* E. Sleepy Zzz */}
          {activeGesture === 'YAWN_SLEEP' && (
            <div className="absolute top-[-20px] right-2 pointer-events-none flex flex-col text-[10px] text-purple-400 font-mono font-bold">
              <motion.span animate={{ y: [-5, -20], x: [0, 5], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-xs">Z</motion.span>
              <motion.span animate={{ y: [-5, -20], x: [0, -5], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}>z</motion.span>
              <motion.span animate={{ y: [-5, -15], x: [0, 2], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1.2 }} className="text-[8px]">z</motion.span>
            </div>
          )}

          {/* F. Angry Fuming Overlay */}
          {activeGesture === 'ANGRY' && (
            <div className="absolute top-[-15px] pointer-events-none flex justify-between w-full px-4 text-red-500 font-mono text-[9px] font-bold">
              <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity }}>💨</motion.span>
              <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, delay: 0.5 }}>💨</motion.span>
            </div>
          )}

          {/* G. Whistle Music Notes */}
          {activeGesture === 'WHISTLE' && (
            <div className="absolute top-0 right-1 pointer-events-none flex gap-1 text-[10px] text-cyan-400">
              <motion.span animate={{ y: [10, -20], x: [0, 10], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>🎶</motion.span>
              <motion.span animate={{ y: [10, -15], x: [0, -10], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>🎵</motion.span>
            </div>
          )}

          {/* H. Flexing Fire Aura */}
          {activeGesture === 'VICTORY_FLEX' && (
            <div className="absolute inset-0 bg-[#FF5722]/5 filter blur-[15px] rounded-full animate-ping border border-[#FF5722]/20"></div>
          )}

          {/* I. Coffee Break Mug Steam */}
          {activeGesture === 'COFFEE_BREAK' && (
            <div className="absolute top-10 right-[-10px] pointer-events-none flex flex-col items-center">
              <div className="w-3 h-3 bg-[#a16207]/30 border border-[#a16207]/50 rounded p-0.5 text-[6px] text-white font-bold font-mono">CUP</div>
              <motion.span animate={{ y: [0, -12], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-[6px] text-gray-400 font-mono">~</motion.span>
              <motion.span animate={{ y: [0, -15], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="text-[6px] text-gray-500 font-mono">~</motion.span>
            </div>
          )}

          {/* J. Clapping Wave Rays */}
          {activeGesture === 'CLAP' && (
            <div className="absolute top-12 pointer-events-none flex gap-12 w-full justify-center">
              <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-ping"></span>
              <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-ping"></span>
            </div>
          )}

          {/* K. Scrolling Matrix Hologram Projection */}
          {activeGesture === 'SCROLLING' && (
            <div className="absolute bottom-12 right-[-20px] w-24 h-16 pointer-events-none bg-[#00E5FF]/10 border border-[#00E5FF]/40 rounded transform rotate-12 flex flex-col p-1 overflow-hidden font-mono text-[5px] text-[#00E5FF]">
              <div className="text-[6px] font-bold border-b border-[#00E5FF]/30 pb-0.5 uppercase">SCROLL ANALYZER</div>
              <motion.div animate={{ y: [-40, 10] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <div>Y-OFFSET: {window.scrollY}</div>
                <div>VELOCITY: ACTIVE</div>
                <div>PROX_DEC: TRUE</div>
                <div>MATRIX_S: 0x4FF8</div>
                <div>SWARM_ID: MrGeo</div>
                <div>GEO_LAYER: EEM</div>
              </motion.div>
              {/* Beam line from hand */}
              <div className="absolute bottom-[-15px] left-2 w-px h-24 bg-gradient-to-t from-cyan-400 to-transparent transform -rotate-45"></div>
            </div>
          )}

          {/* L. Typing Futuristic Keyboard */}
          {activeGesture === 'TYPING' && (
            <div className="absolute bottom-4 left-[-20px] w-32 h-6 pointer-events-none bg-emerald-950/90 border border-emerald-500/40 rounded flex flex-col items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.3)] transform -rotate-x-30 select-none">
              <div className="text-[5px] font-mono font-bold text-emerald-400">HOLO-KEYBOARD [TYPING]</div>
              <div className="flex gap-1.5 mt-0.5">
                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></span>
                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping delay-100"></span>
                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping delay-200"></span>
                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping delay-300"></span>
              </div>
            </div>
          )}

          {/* M. CEO Call with 4 floating geological holograms (LOADING) */}
          {activeGesture === 'LOADING_PHONE' && (
            <>
              {/* Hotline logo */}
              <div className="absolute top-[-30px] w-8 h-8 rounded-full bg-orange-950 border border-orange-500 flex items-center justify-center animate-bounce text-orange-400 shadow-[0_0_10px_#f97316]">
                <Phone size={12} className="animate-pulse" />
              </div>

              {/* Holograms floating left/right/up */}
              <div className="absolute left-[-45px] top-4 w-12 h-12 bg-cyan-950/90 border border-cyan-500/40 rounded p-0.5 flex flex-col justify-between font-mono text-[4px] text-[#00E5FF] animate-pulse">
                <div className="font-bold border-b border-cyan-500/30">SEISMIC</div>
                <div className="w-full h-4 border-b border-cyan-500/20 bg-cyan-400/10"></div>
                <div>CH-18 LIVE</div>
              </div>

              <div className="absolute right-[-45px] top-4 w-12 h-12 bg-[#FF5722]/10 border border-[#FF5722]/40 rounded p-0.5 flex flex-col justify-between font-mono text-[4px] text-white animate-pulse">
                <div className="font-bold border-b border-[#FF5722]/30 text-[#FF5722]">GEOCHEM</div>
                <div className="flex justify-between">
                  <span>pH: 4.2</span>
                  <span className="bg-red-500 text-black px-0.5">WARN</span>
                </div>
                <div>DE_1050M</div>
              </div>

              <div className="absolute left-[-35px] top-18 w-12 h-10 bg-purple-950/80 border border-purple-500/40 rounded p-0.5 flex flex-col justify-between font-mono text-[4px] text-purple-300 animate-pulse">
                <div className="font-bold border-b border-purple-500/20">METEO</div>
                <div>PRES: 1013</div>
                <div>HUM: 84%</div>
              </div>

              <div className="absolute right-[-35px] top-18 w-12 h-10 bg-emerald-950/80 border border-emerald-500/40 rounded p-0.5 flex flex-col justify-between font-mono text-[4px] text-emerald-400 animate-pulse">
                <div className="font-bold border-b border-emerald-500/20">ROCK ID</div>
                <div>Q: 42% F: 15%</div>
                <div>L: 43% [LITHIC]</div>
              </div>
            </>
          )}

          {/* --- MAIN CHARACTER EXQUISITE 3D NATIVE (Three.js) --- */}
          <div onClick={() => {
              setChatOpen(true);
              setSpeechBubbleActive(true);
              triggerGesture("GREETING", 3000);
              playSound("beep");
            }} className="cursor-pointer">
            <MrGeo3D activeGesture={activeGesture} isSpeaking={isSpeaking} dragged={dragged} />
          </div>
          
        </div>

        {/* Collapsible Action control tag */}
        <button
          onClick={() => {
            setChatOpen(!chatOpen);
            playSound('beep');
          }}
          className="mt-1 flex items-center gap-1 bg-[#1a1a1c]/90 hover:bg-neutral-900 border border-[#333] px-2.5 py-1 rounded-full text-[8px] font-mono font-bold text-gray-300 hover:text-white hover:border-[#00E5FF]/40 shadow-lg transition-all cursor-pointer select-none"
        >
          <Grab size={9} className="text-[#FF5722] animate-bounce" />
          <span>DRAG ME OR TAP CONTROLLER</span>
        </button>
      </motion.div>

      {/* Interactive Action Controller Overlay Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-gray-200"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-lg bg-[#0e0e10] border border-[#222] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col h-[550px] sm:h-[600px]"
            >
              {/* Panel Header */}
              <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-900 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                    MR. GEO INTERACTIVE COMPANION HUB // v4.0.0
                  </span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Status Section */}
              <div className="bg-[#141416] p-4 border-b border-neutral-900 flex flex-col gap-2 shrink-0">
                <div className="flex gap-3 items-start">
                  {/* Quick Avatar Thumbnail */}
                  <div className="w-10 h-10 rounded bg-[#1f1f22] border border-neutral-800 flex items-center justify-center relative overflow-hidden shrink-0">
                    <span className="text-xl">👔</span>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-neutral-950"></span>
                  </div>

                  <div className="flex-1">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      Mr. Geo{" "}
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#2a2a2d] text-cyan-400">
                        EXECUTIVE COMPANION
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-normal italic">
                      "I have 30 manual gestures, visual overlays, sound synthesis triggers, and automatic tracking for scroll, keystrokes, navigation, and API loading states. Let's play!"
                    </p>
                  </div>
                </div>

                {/* Simulated instruction transmitter */}
                <form onSubmit={handleCustomSubmit} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Send custom field instruction to Mr. Geo..."
                    className="flex-1 bg-black/50 border border-neutral-800 rounded px-2.5 py-1 text-[10px] text-gray-300 focus:outline-none focus:border-cyan-500/50 font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded text-[10px] font-bold font-mono hover:text-white transition-colors cursor-pointer"
                  >
                    TRANSMIT
                  </button>
                </form>
              </div>

              {/* Category selector */}
              <div className="px-4 py-2 border-b border-neutral-900 bg-neutral-950 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                {(['All', 'Greeting', 'Professional', 'Celebration', 'Emotion', 'Special'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                      categoryFilter === cat
                        ? "bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]"
                        : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-gray-300"
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* 30 Actions & Emotes Grid */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-black/20">
                {filteredGestures.map(([key, def]) => {
                  const isActive = activeGesture === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        triggerGesture(key as AgentGesture);
                        if (key === 'WARNING_ALERT') playSound('alert');
                        else if (key === 'ADJUST_GLASSES') playSound('sparkle');
                        else if (key === 'THUMBS_UP' || key === 'VICTORY_FLEX') playSound('success');
                        else playSound('laser');
                      }}
                      className={`group flex flex-col justify-between items-start p-2.5 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer h-20 ${
                        isActive
                          ? "bg-cyan-950/40 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                          : "bg-[#111112] border-neutral-800/80 hover:bg-[#161619] hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-lg group-hover:scale-125 transition-transform">{def.emoji}</span>
                        <span className="text-[7px] font-mono font-bold text-neutral-500 uppercase">
                          {def.category}
                        </span>
                      </div>

                      <div className="w-full mt-1.5">
                        <div className={`text-[10px] font-bold leading-tight ${isActive ? "text-[#00E5FF]" : "text-gray-200"}`}>
                          {def.name}
                        </div>
                        <div className="text-[8px] text-gray-400 truncate mt-0.5" title={def.description}>
                          {def.description}
                        </div>
                      </div>

                      {/* Sparkle background overlay on active */}
                      {isActive && (
                        <div className="absolute inset-0 bg-cyan-400/5 animate-pulse pointer-events-none"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Panel */}
              <div className="bg-neutral-950 border-t border-neutral-900 p-3 flex justify-between items-center shrink-0 text-[9px] font-mono text-neutral-500">
                <span>GEOAI FIELD LABS CO.</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGesture('IDLE');
                      setDialogText("Purged all active gesture override cues. Standing by!");
                      playSound('beep');
                    }}
                    className="text-[8px] px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-gray-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
                  >
                    RESET IDLE
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    className="text-[8px] px-3 py-1 rounded bg-[#FF5722] text-black font-bold hover:bg-[#ff7043] transition-colors cursor-pointer"
                  >
                    CLOSE CONTROLLER
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
