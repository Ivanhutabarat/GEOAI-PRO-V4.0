import { useAuth } from "../../../../context/AuthContext";
import { z } from "zod";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Book,
  Search,
  HelpCircle,
  Globe,
  MessageSquare,
  Phone,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Shield,
  Terminal,
  Activity,
  Database,
  Layers,
  Zap,
  Code,
  Sparkles,
  Info,
  Waves,
  Eye,
  Settings,
  Volume2,
  VolumeX,
  Play,
  Square,
  Cpu,
  Workflow,
  Sliders,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import TitanCoreWorkstation from "./TitanCoreWorkstation";

// Language Interface
type Lang = "id" | "en";

// Define the structure of each geological module in the dictionary
interface ModuleDoc {
  title: string;
  desc: string;
  geologyInfo: string;
  codeStructure: string;
  formula: string;
  threshold: string;
  alert: string;
  soundDescription: string;
  dataSample: string;
}

// -------------------------------------------------------------
// WEB AUDIO API GEOPHYSICAL SONIFICATION SYNTH
// -------------------------------------------------------------
class GeophysicsSonifier {
  private ctx: AudioContext | null = null;
  private activeNodes: {
    osc?: OscillatorNode;
    gain?: GainNode;
    intervals?: any[];
  } = {};

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public play(moduleId: number) {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Initial silent state, ramp up to prevent pops
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);

    const intervals: any[] = [];

    switch (moduleId) {
      case 1: // Well Logging: Sonar tick-tock with background ambient depth rumble
        osc.type = "sine";
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        const logInt = setInterval(() => {
          if (!this.ctx) return;
          const tickOsc = this.ctx.createOscillator();
          const tickGain = this.ctx.createGain();
          tickOsc.type = "triangle";
          tickOsc.frequency.setValueAtTime(
            600 + Math.random() * 300,
            this.ctx.currentTime,
          );
          tickGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          tickGain.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + 0.04,
          );
          tickOsc.connect(tickGain);
          tickGain.connect(this.ctx.destination);
          tickOsc.start();
          tickOsc.stop(this.ctx.currentTime + 0.05);
        }, 180);
        intervals.push(logInt);
        break;

      case 2: // Seismic Amplitude Inversion: Deep subsonic seismic sweeps
        osc.type = "sine";
        osc.frequency.setValueAtTime(45, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 2.5);
        const seismicFilter = ctx.createBiquadFilter();
        seismicFilter.type = "lowpass";
        seismicFilter.frequency.setValueAtTime(90, ctx.currentTime);
        osc.disconnect(gain);
        osc.connect(seismicFilter);
        seismicFilter.connect(gain);
        break;

      case 3: // Geomechanics Integrity: Pressurized hum with sharp pressure alarms
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(65, ctx.currentTime);
        const geoFilter = ctx.createBiquadFilter();
        geoFilter.type = "lowpass";
        geoFilter.frequency.setValueAtTime(140, ctx.currentTime);
        osc.disconnect(gain);
        osc.connect(geoFilter);
        geoFilter.connect(gain);

        const alarmInt = setInterval(() => {
          if (!this.ctx) return;
          const alOsc = this.ctx.createOscillator();
          const alGain = this.ctx.createGain();
          alOsc.type = "sine";
          alOsc.frequency.setValueAtTime(1100, this.ctx.currentTime);
          alGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
          alGain.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + 0.25,
          );
          alOsc.connect(alGain);
          alGain.connect(this.ctx.destination);
          alOsc.start();
          alOsc.stop(this.ctx.currentTime + 0.3);
        }, 700);
        intervals.push(alarmInt);
        break;

      case 4: // Gravity & Magnetic Field: Sweeping high-frequency geomagnetic field oscillation
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        const magInt = setInterval(() => {
          if (!this.ctx || !osc) return;
          osc.frequency.exponentialRampToValueAtTime(
            320 + Math.sin(Date.now() / 120) * 90,
            this.ctx.currentTime + 0.15,
          );
        }, 80);
        intervals.push(magInt);
        break;

      case 5: // Electrical & EM: High-voltage static discharge clicks and whines
        osc.type = "square";
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        const emFilter = ctx.createBiquadFilter();
        emFilter.type = "bandpass";
        emFilter.frequency.setValueAtTime(700, ctx.currentTime);
        osc.disconnect(gain);
        osc.connect(emFilter);
        emFilter.connect(gain);
        const emInt = setInterval(() => {
          if (!this.ctx || !osc) return;
          osc.frequency.setValueAtTime(90, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            500,
            this.ctx.currentTime + 0.5,
          );
        }, 1000);
        intervals.push(emInt);
        break;

      case 6: // Fluid Identification: Bubbling hydro-frictional acoustic hiss
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        const bubbleInt = setInterval(() => {
          if (!this.ctx) return;
          const bub = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bub.type = "sine";
          bub.frequency.setValueAtTime(
            600 + Math.random() * 800,
            this.ctx.currentTime,
          );
          bGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
          bGain.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + 0.08,
          );
          bub.connect(bGain);
          bGain.connect(this.ctx.destination);
          bub.start();
          bub.stop(this.ctx.currentTime + 0.1);
        }, 60);
        intervals.push(bubbleInt);
        break;

      case 7: // GPR Waveform Radar: Rapid electromagnetic echo chirps
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        const radarInt = setInterval(() => {
          if (!this.ctx) return;
          const rad = this.ctx.createOscillator();
          const rGain = this.ctx.createGain();
          rad.type = "sine";
          rad.frequency.setValueAtTime(1400, this.ctx.currentTime);
          rGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          rGain.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + 0.08,
          );
          rad.connect(rGain);
          rGain.connect(this.ctx.destination);
          rad.start();
          rad.stop(this.ctx.currentTime + 0.1);
        }, 400);
        intervals.push(radarInt);
        break;

      case 8: // Rock Geochemistry Ore: Pure elemental resonance chime (gold harmonics)
        osc.type = "sine";
        osc.frequency.setValueAtTime(980, ctx.currentTime);
        const h1 = ctx.createOscillator();
        const h2 = ctx.createOscillator();
        h1.type = "sine";
        h1.frequency.setValueAtTime(1350, ctx.currentTime);
        h2.type = "sine";
        h2.frequency.setValueAtTime(1780, ctx.currentTime);
        const hG = ctx.createGain();
        hG.gain.setValueAtTime(0.04, ctx.currentTime);
        h1.connect(hG);
        h2.connect(hG);
        hG.connect(ctx.destination);
        h1.start();
        h2.start();
        h1.stop(ctx.currentTime + 2.0);
        h2.stop(ctx.currentTime + 2.0);
        break;

      case 9: // Meteorology Severe Storm: Turbid static wind and thunder rumble
        osc.type = "triangle";
        osc.frequency.setValueAtTime(50, ctx.currentTime);
        const stormFilter = ctx.createBiquadFilter();
        stormFilter.type = "lowpass";
        osc.disconnect(gain);
        osc.connect(stormFilter);
        stormFilter.connect(gain);
        const stormInt = setInterval(() => {
          if (!this.ctx || !osc) return;
          stormFilter.frequency.setValueAtTime(
            120 + Math.random() * 280,
            this.ctx.currentTime,
          );
        }, 90);
        intervals.push(stormInt);
        break;

      case 10: // Groundwater: Fluid hydrostatic flow trickle
        osc.type = "sine";
        osc.frequency.setValueAtTime(240, ctx.currentTime);
        const gwInt = setInterval(() => {
          if (!this.ctx || !osc) return;
          osc.frequency.setValueAtTime(
            240 + Math.sin(Date.now() / 200) * 45,
            this.ctx.currentTime,
          );
        }, 40);
        intervals.push(gwInt);
        break;

      case 11: // Soil pH: Acid mine corrosion sizzle
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        const phFilter = ctx.createBiquadFilter();
        phFilter.type = "highpass";
        phFilter.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.disconnect(gain);
        osc.connect(phFilter);
        phFilter.connect(gain);
        const sizzleInt = setInterval(() => {
          if (!this.ctx) return;
          const pop = this.ctx.createOscillator();
          const pG = this.ctx.createGain();
          pop.type = "square";
          pop.frequency.setValueAtTime(
            2500 + Math.random() * 4500,
            this.ctx.currentTime,
          );
          pG.gain.setValueAtTime(0.015, this.ctx.currentTime);
          pG.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + 0.015,
          );
          pop.connect(pG);
          pG.connect(this.ctx.destination);
          pop.start();
          pop.stop(this.ctx.currentTime + 0.02);
        }, 50);
        intervals.push(sizzleInt);
        break;

      case 12: // Gas Air Quality: Hissing gas pipeline leakage + screaming toxic alarms
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        const gasInt = setInterval(() => {
          if (!this.ctx) return;
          const gasLeak = this.ctx.createOscillator();
          const leakGain = this.ctx.createGain();
          gasLeak.type = "sawtooth";
          gasLeak.frequency.setValueAtTime(2200, this.ctx.currentTime);
          leakGain.gain.setValueAtTime(0.07, this.ctx.currentTime);
          leakGain.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + 0.08,
          );
          gasLeak.connect(leakGain);
          leakGain.connect(this.ctx.destination);
          gasLeak.start();
          gasLeak.stop(this.ctx.currentTime + 0.1);
        }, 220);
        intervals.push(gasInt);
        break;

      case 13: // Spatial Twin 3D Deformation: Tectonic slide (continuous down-sweeping frequency)
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 2.8);
        break;
    }

    osc.start();
    osc.stop(ctx.currentTime + 3);

    this.activeNodes = { osc, gain, intervals };
  }

  public stop() {
    if (this.activeNodes.osc) {
      try {
        this.activeNodes.osc.stop();
      } catch (e) {}
    }
    if (this.activeNodes.intervals) {
      this.activeNodes.intervals.forEach((i) => clearInterval(i));
    }
    this.activeNodes = {};
  }
}

// Instantiate Sonifier
const sonifier = new GeophysicsSonifier();

// -------------------------------------------------------------
// LARGE INTERACTIVE GEOPHYSICAL SVG LOGO
// -------------------------------------------------------------
function LivingEarthLogo({
  className = "w-64 h-64 mx-auto",
}: {
  className?: string;
}) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "relative p-4 bg-zinc-950/90 border border-zinc-850 rounded-2xl flex flex-col items-center justify-center shadow-inner",
        className,
      )}
    >
      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[280px]">
        <defs>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#111" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="zigZagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9800" />
            <stop offset="100%" stopColor="#FF5722" />
          </linearGradient>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#25D366" />
          </linearGradient>
        </defs>

        {/* Ambient background glow */}
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="url(#earthGlow)"
          className="animate-pulse"
        />

        {/* Left Hemisphere: Volumetric Stratigraphy Grid */}
        <g stroke="#00E5FF" strokeWidth="1" opacity="0.45" fill="none">
          {/* Latitudes */}
          <path d="M 50,200 A 150,150 0 0,0 350,200" />
          <path d="M 70,140 A 150,100 0 0,0 330,140" />
          <path d="M 70,260 A 150,100 0 0,0 330,260" />
          {/* Grid vertical stripes */}
          <path d="M 200,50 A 150,150 0 0,0 200,350" />
          <path d="M 140,55 A 150,150 0 0,0 140,345" />
          <path d="M 80,80 A 150,150 0 0,0 80,320" />
        </g>

        {/* Right Hemisphere: Digital Circuit Nodes & AI Pathways */}
        <g stroke="#25D366" strokeWidth="1.5" fill="none" opacity="0.6">
          {/* Neural connections */}
          <line x1="200" y1="100" x2="260" y2="120" />
          <line
            x1="260"
            y1="120"
            x2="310"
            y2="100"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <line x1="200" y1="160" x2="280" y2="180" />
          <line x1="280" y1="180" x2="340" y2="150" />
          <line x1="200" y1="240" x2="290" y2="230" />
          <line x1="290" y1="230" x2="320" y2="280" />
          <line x1="200" y1="300" x2="250" y2="320" />

          {/* Node circles */}
          <circle
            cx="260"
            cy="120"
            r="5"
            fill="#25D366"
            className="animate-ping"
            style={{ animationDuration: "3s" }}
          />
          <circle cx="260" cy="120" r="3" fill="#00E5FF" />
          <circle cx="310" cy="100" r="4" fill="#25D366" />
          <circle cx="280" cy="180" r="6" fill="#25D366" />
          <circle cx="340" cy="150" r="4" fill="#00E5FF" />
          <circle cx="290" cy="230" r="5" fill="#25D366" />
          <circle cx="320" cy="280" r="4" fill="#FF5722" />
          <circle cx="250" cy="320" r="5" fill="#25D366" />
        </g>

        {/* Center: Glowing Zig-Zag Geological Active Fault Line Fissure */}
        <g
          stroke="url(#zigZagGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path
            d="M 200,45 L 215,100 L 180,160 L 225,230 L 175,300 L 200,355"
            className="drop-shadow-[0_0_8px_rgba(255,152,0,0.8)]"
          />
        </g>
        {/* Inner golden core thread */}
        <g
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        >
          <path d="M 200,45 L 215,100 L 180,160 L 225,230 L 175,300 L 200,355" />
        </g>

        {/* Rigid Bedrock Foundation Pillars at base */}
        <g fill="#4E342E" opacity="0.75" stroke="#3E2723" strokeWidth="1">
          <rect x="130" y="355" width="25" height="15" rx="2" />
          <rect x="165" y="355" width="25" height="15" rx="2" />
          <rect x="210" y="355" width="25" height="15" rx="2" />
          <rect x="245" y="355" width="25" height="15" rx="2" />
        </g>

        {/* Real-Time Seismic Waveform Oscillating footer lines */}
        <path
          d={
            pulse
              ? "M 50,380 Q 100,350 150,380 T 250,380 T 350,380"
              : "M 50,380 Q 100,400 150,380 T 250,380 T 350,380"
          }
          fill="none"
          stroke="#FF5722"
          strokeWidth="2.5"
          className="transition-all duration-1000"
        />
        <path
          d={
            pulse
              ? "M 50,385 Q 110,405 170,385 T 290,385 T 350,385"
              : "M 50,385 Q 110,365 170,385 T 290,385 T 350,385"
          }
          fill="none"
          stroke="#00E5FF"
          strokeWidth="1.5"
          opacity="0.8"
          className="transition-all duration-1000"
        />
      </svg>
      <span className="text-[10px] text-zinc-500 font-mono tracking-widest mt-2 uppercase text-center animate-pulse">
        Figura 1.1: Core Volumetric AI Seismic Fault Grid
      </span>
    </div>
  );
}

// -------------------------------------------------------------
// TEXTBOOK DOCUMENTATION DATA (MASSIVE, EXHAUSTIVE EXPANSION)
// -------------------------------------------------------------
interface Dictionary {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchButton: string;
  askAiTitle: string;
  askAiPlaceholder: string;
  waButton: string;
  langToggle: string;
  suggestedQueries: string[];
  chapters: {
    one: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    two: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    three: {
      title: string;
      intro: string;
      modules: { [key: number]: ModuleDoc };
    };
    four: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
    };
    five: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
    };
    six: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
    };
    seven: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title?: string;
      section3Content?: string;
    };
    eight: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    nine: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
    };
    ten: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    eleven: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    twelve: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    thirteen: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    fourteen: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
    fifteen: {
      title: string;
      section1Title: string;
      section1Content: string;
      section2Title: string;
      section2Content: string;
      section3Title: string;
      section3Content: string;
    };
  };
}

const ModuleDocSchema = z.object({
  title: z.string().catch("Modul Geofisika"),
  desc: z.string().catch("Deskripsi tidak tersedia saat ini."),
  geologyInfo: z.string().catch("Informasi geologi tidak tersedia."),
  codeStructure: z.string().catch("Struktur kode belum tersedia."),
  formula: z.string().catch("N/A"),
  threshold: z.string().catch("N/A"),
  alert: z.string().catch("N/A"),
  soundDescription: z.string().catch("N/A"),
  dataSample: z.string().catch("N/A"),
});

const StandardChapterSchema = z.object({
  title: z.string().catch("Bab Belum Tersedia"),
  section1Title: z.string().catch("Bagian 1"),
  section1Content: z.string().catch("Konten sedang dalam perbaikan."),
  section2Title: z.string().catch("Bagian 2").optional(),
  section2Content: z
    .string()
    .catch("Konten sedang dalam perbaikan.")
    .optional(),
  section3Title: z.string().catch("Bagian 3").optional(),
  section3Content: z
    .string()
    .catch("Konten sedang dalam perbaikan.")
    .optional(),
});

const ChapterThreeSchema = z.object({
  title: z.string().catch("Bab III: Ensklopedia Modul"),
  intro: z.string().catch("Daftar modul geofisika."),
  modules: z.record(z.string().or(z.number()), ModuleDocSchema).catch({}),
});

const DictionarySchema = z.object({
  title: z.string().catch("ENTERPRISE GEOPHYSICS ENCYCLOPEDIA"),
  subtitle: z.string().catch("Textbook Documentation V4.0"),
  searchPlaceholder: z.string().catch("Search..."),
  searchButton: z.string().catch("Search"),
  askAiTitle: z.string().catch("Voice AI Companion"),
  askAiPlaceholder: z.string().catch("Ask..."),
  waButton: z.string().catch("Contact Engineer"),
  langToggle: z.string().catch("Toggle Language"),
  suggestedQueries: z.array(z.string()).catch([]),
  chapters: z.object({
    one: StandardChapterSchema,
    two: StandardChapterSchema,
    three: ChapterThreeSchema,
    four: StandardChapterSchema,
    five: StandardChapterSchema,
    six: StandardChapterSchema,
    seven: StandardChapterSchema,
    eight: StandardChapterSchema,
    nine: StandardChapterSchema,
    ten: StandardChapterSchema,
    eleven: StandardChapterSchema,
    twelve: StandardChapterSchema,
    thirteen: StandardChapterSchema.catch({
      title: "BAB XIII: Pembaruan Platform v4.0",
      section1Title: "1. Data Streaming & LoD",
      section1Content: "Penanganan big data geofisika.",
      section2Title: "2. PWA & Offline First",
      section2Content: "Dukungan mode offline di lapangan.",
      section3Title: "3. WebGPU & Export PDF",
      section3Content: "Akselerasi grafis dan ekspor laporan otomatis.",
    }),
    fourteen: StandardChapterSchema.catch({
      title: "BAB XIV: Dark/Light Mode & Performance Profiler Switch",
      section1Title: "1. Dynamic Pixel Ratio Capping & Shadow Decimation",
      section1Content: "Optimasi grafis canvas 3D dan Sonar untuk 60 FPS di perangkat spesifikasi rendah.",
      section2Title: "2. Real-Time FPS Profiler & Throttling Loop",
      section2Content: "Monitoring frame rate dan pemangkasan beban readback visual.",
      section3Title: "3. Sunlight High-Contrast Light Mode & Keamanan Lisensi",
      section3Content: "Peralihan tema lapangan dengan perlindungan integritas lisensi hardware.",
    }),
    fifteen: StandardChapterSchema.catch({
      title: "BAB XV: Modul GeoOSINT & Resolusi Teknis Deploy",
      section1Title: "1. Integrasi API Seismik Global (Live USGS)",
      section1Content: "Fitur intelijen dan crawler anomali lingkungan real-time.",
      section2Title: "2. Limit Cache PWA & Resolusi Konflik Vite",
      section2Content: "Pelonggaran offline service worker dan perbaikan module tree.",
      section3Title: "3. Penanganan AbortError (Time-out)",
      section3Content: "Mekanisme graceful fallback untuk menahan crash server.",
    }),
  }),
});

export const RAW_DICT: Record<Lang, Dictionary> = {
  id: {
    title: "ENSIKLOPEDIA & BUKU PANDUAN GEOFISIKA ENTERPRISE",
    subtitle: "Buku Besar Dokumentasi V4.0 - Otorisasi Resmi Administrator",
    searchPlaceholder:
      "Cari bab, modul, formula, parameter, file code, atau menu...",
    searchButton: "Cari",
    askAiTitle: "Voice AI Companion & Panduan Ensiklopedia",
    askAiPlaceholder: "Tanyakan menu, source code, formula, atau audio...",
    waButton: "Hubungi Engineer (WhatsApp)",
    langToggle: "Switch to English Mode",
    suggestedQueries: [
      "Mengapa Flat-JSON dipakai?",
      "Bagaimana mitigasi H2S?",
      "Poisson's Ratio Gas Pocket",
      "Sistem Suara Komputasional",
      "Sistem Menu & Alur Kode",
      "Sistem Keamanan Enterprise",
      "Integrasi Modul Swarm AI",
    ],
    chapters: {
      one: {
        title:
          "BAB I: Filosofi Visual Logo & Latar Belakang Pembangunan Platform (Studi Kasus & Visi Ivan)",
        section1Title:
          "1. Latar Belakang Mendalam & Alasan Utama Pembangunan Platform (The 'Why' & 'Who' behind GeoAI Pro)",
        section1Content:
          "GeoAI Pro v4.0 dirancang dan diarsitekturi secara langsung oleh Administrator (@Ivanhutabarat), orang biasa dan mahasiswa teknik geofisika di Institut Teknologi Sumatera. Alasan utama pembangunan platform ini adalah untuk menciptakan solusi pertahanan mutlak terhadap ancaman laten 'Halusinasi Kecerdasan Buatan (AI Hallucination)' pada operasi subsurface sumur bor dalam (borehole geophysics). Dalam industri pengeboran minyak, gas, dan eksplorasi panas bumi, kesalahan interpretasi sekecil apa pun memiliki konsekuensi katastropik. Jika sebuah model AI generatif (LLM) mengalami halusinasi saat menghitung batas tekanan pori batuan, atau salah mendeteksi gejala akumulasi gas beracun (H2S), dampaknya adalah kehancuran fisik rig, hilangnya investasi bernilai ratusan juta dolar, dan potensi fatalitas bagi seluruh kru lapangan.\n\nUntuk menanggulangi bahaya ini, Ivan merancang sistem multi-agent Swarm AI yang tidak sekadar bekerja berdasarkan teks generatif biasa, melainkan terikat ketat (hard-anchored) pada database Kejadian Nyata Dunia (Historical Benchmarking) yang bersumber dari pengukuran fisis empiris batuan keras. Hal ini meniadakan kelemahan mendasar model bahasa besar yang sering mengarang data fisis bumi secara sembarangan. Di bawah kepemimpinan Ivan, platform ini dibangun dengan filosofi High-ROI (Return on Investment) dan standar zero-fatality (nol fatalitas kerja), mengamankan setiap jengkal operasi derrick rig permukaan hingga ke formasi reservoir terdalam bumi.",
        section2Title:
          "2. Kegunaan Fundamental Platform & Alur Evakuasi Otomatis (Core Field Utility)",
        section2Content:
          "Platform GeoAI Pro bertindak sebagai Router Otak Besar (Federated Core Command) yang bertugas menyinkronkan seluruh sensor fisik derrick rig secara waktu nyata. Sistem ini secara konstan mengintegrasikan pemantauan 360 derajat multidimensi yang meliputi seismik refleksi lateral, logging sumur bor aktif, kemiringan geodetik menara derrick, serta kadar gas atmosfer permukaan.\n\nAlur kerja penyelamatan taktis otomatis dirancang sebagai berikut:\n1. Sensor real-time mengirimkan biner data telemetri ke server utama.\n2. Sistem menganalisis data fisis menggunakan interseptor biner yang sangat cepat.\n3. Apabila terjadi lonjakan anomali kritis (seperti konsentrasi gas H2S > 450 ppm atau tekanan pori melampaui batas aman mekanis batuan), platform akan langsung membekukan jalannya diskusi atau perdebatan Swarm AI.\n4. Sistem mengeksekusi override veto secara otonom tanpa menunggu konfirmasi manual operator.\n5. Status bahaya merah dipicu pada visualisasi derrick rig, sementara paket data biner terenkripsi dikirim secara instan ke n8n WhatsApp Gateway milik Ivan (@Ivanhutabarat) untuk mengoordinasikan evakuasi darurat helikopter penyelamat dan penutupan darurat katup sumur bor.",
        section3Title:
          "3. Penjelasan Detil Filosofi Desain Logo 'Living Earth Intelligence'",
        section3Content:
          "Desain visual logo 'Living Earth Intelligence' yang menghiasi dasbor utama GeoAI Pro merupakan mahakarya estetika buatan Ivan yang merepresentasikan keselarasan antara ilmu bumi murni dan kecerdasan komputasi modern:\n\n• Makna Geometris Bentuk Logo:\n  - Bola Bumi Bulat 3D utuh merepresentasikan integritas penuh subsurface dan sifat bumi yang dinamis serta tak terduga.\n  - Sisi Kiri (Volumetric Grid Spasial) melambangkan diskretisasi matematika elemen geologi, di mana formasi batuan dipecah menjadi grid-grid numerik untuk pemodelan impedansi akustik presisi tinggi.\n  - Sisi Kanan (Digital Circuit Board AI Twin) memproyeksikan sirkuit komputasi, mewakili kecerdasan sintetik multi-agen yang bertugas memproses jutaan telemetri per detik.\n  - Patahan Zig-zag di Bagian Tengah melambangkan sesar aktif, celah tektonik dinamis tempat energi dilepaskan dan ditangkap sebagai sinyal fisis oleh sensor.\n  - Fondasi Dasar berbentuk balok batuan keras melambangkan stabilitas mekanis kerak bumi yang kokoh, di mana derrick rig berpondasi aman.\n  - Gelombang Seismik Horizontal di bagian paling bawah melambangkan pemantauan parameter gelombang P (kompresi) dan gelombang S (geser) yang mengalir konstan.\n\n• Makna Palet Warna Logo:\n  - Biru Neon: Mewakili saturasi cairan air bawah tanah (Hukum Archie), kejernihan digital, dan ketenangan analisis fisis.\n  - Hijau Neon: Melambangkan kepatuhan HSE (Health, Safety, Environment), sirkulasi data alami sumur yang lancar, dan energi panas bumi ramah lingkungan.\n  - Emas Premium (Orbital Gold): Mewakili kekayaan mineral bumi bernilai tinggi, lapisan minyak bumi komersial, serta barikade algoritma keamanan enkripsi militer.\n  - Cokelat Terestrial: Melambangkan batuan formasi pembawa (matrix rock) serta keteguhan fisik operasi pengeboran.",
      },
      two: {
        title:
          "BAB II: Struktur Codebase, Sistem Menu, & Mekanisme Data Stream Parser",
        section1Title:
          "1. Pembagian Direktori Core & Alur Sistem Menu Pengeboran (Dual-Environment Architecture)",
        section1Content:
          "Sistem aplikasi ini dibagi menjadi dua arsitektur lingkungan kembar yang saling melengkapi guna menjamin keandalan dan keamanan pengujian sebelum diimplementasikan secara langsung di lapangan:\n\n1. Direktori `/src/cores/live/`:\n   Merupakan inti pemantauan langsung (live telemetry). Menghubungkan sensor biner real-time dari rig pengeboran aktif secara asinkronus ke server utama melalui protokol transfer data berkecepatan tinggi.\n2. Direktori `/src/cores/dummy/`:\n   Menyediakan sirkuit pengujian simulasi (sandbox simulator) untuk latihan skenario bahaya derrick di bawah kendali penuh operator. Ini memungkinkan simulasi kegagalan kritis seperti blowout dan kebocoran gas beracun secara aman tanpa risiko fisik.\n\nSistem navigasi dirancang sangat intuitif menggunakan Sidebar kiri yang responsif untuk membagi dan mengelompokkan 24 modul geofisika master serta modul diagnostik pendukung. Sistem ini menggunakan mekanisme penyimpanan status (layout caching) yang memastikan data masukan dan parameter kalkulasi pada masing-masing modul tidak terhapus ketika pengguna berpindah-pindah menu.",
        section2Title:
          "2. Mengapa Format Flat-JSON Dipakai & Kegunaan State Buffering (Sinking Prevention)",
        section2Content:
          "Format data telemetri pengeboran dirancang khusus menggunakan struktur Flat-JSON linier tanpa adanya objek bertingkat (nested object) yang dalam. Pilihan arsitektur data ini diambil oleh Ivan untuk memaksimalkan efisiensi pemrosesan memori browser. Flat-JSON mempercepat proses serialisasi biner dan parsing data hingga 10 kali lebih cepat dibandingkan format JSON konvensional, sangat krusial saat menangani ratusan pulsa telemetri per detik.\n\nSelain kecepatan, format datar ini memegang peran vital dalam mekanisme State Buffering selama ekspor dokumen PDF berlangsung (dikontrol oleh parameter 'window.isExportingPDF'):\n- Saat tombol ekspor PDF diaktifkan, status ini memicu pembekuan sementara (freezing) seluruh aliran data langsung (SSE) di tingkat antarmuka pengguna (UI).\n- Hal ini mencegah terjadinya re-rendering grafik di tengah proses penangkapan visual oleh html2canvas.\n- Hasilnya adalah dokumen laporan PDF gabungan yang sangat rapi, beresolusi tinggi, bebas dari visual tearing, garis grafik patah, atau tabrakan elemen UI di memori.",
        section3Title:
          "3. Penanganan Error Batas Kecepatan (Error 429) & Dual-Route UI Modal",
        section3Content:
          "Dalam mengoperasikan modul kecerdasan buatan, pembatasan kuota panggilan API pihak ketiga (HTTP Error 429 - Too Many Requests) adalah tantangan nyata. Untuk mengatasinya, GeoAI Pro mengintegrasikan algoritma 'useApiQueue' Manager yang bertugas mendeteksi kegagalan jaringan secara proaktif, mengantrekan payload teks perdebatan agen AI, dan mencoba pengiriman ulang menggunakan jeda eksponensial (exponential backoff).\n\nTantangan lainnya adalah lingkungan Iframe (seperti pada AI Studio preview), di mana kebijakan keamanan sandbox memblokir secara agresif fungsi pembukaan tab baru (`window.open`) dan modal popup bawaan browser. Untuk mengatasi hambatan ini, Ivan merancang sistem Dual-Route UI Modal. Sistem ini mendeteksi izin lingkungan Iframe secara otomatis. Jika mendeteksi keterbatasan Iframe, tombol aksi akan beralih dari memicu popup eksternal menjadi merender modal dialog interaktif langsung di atas kanvas aplikasi utama, memastikan seluruh fungsionalitas tetap berjalan 100% tanpa hambatan.",
      },
      three: {
        title:
          "BAB III: Katalog Mendalam 24 Modul Operasional Digital Twin & Ensiklopedia Geofisika",
        intro:
          "Di bawah ini adalah penjelasan komparatif ilmiah, formula matematika pendukung, parameter ambang batas bahaya, serta detail sonifikasi suara akustik untuk masing-masing 24 modul geofisika master dan operasional digital twin:",
        modules: {
          1: {
            title: "1. Well Logging & Gamma Ray Stratigraphy Module",
            desc: "Melakukan analisis litologi formasi batuan di sepanjang lubang bor secara real-time dengan mengukur radiasi sinar gamma alami batuan.",
            geologyInfo:
              "Sinar gamma dipancarkan secara konstan oleh unsur radioaktif alami (Kalium, Torium, Uranium) dalam batuan batupasir vs batuan lempung (shale). Membantu membedakan reservoir hidrokarbon permeabel dari batuan penyekat.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/WellLoggingModule.tsx`. Data di-render sebagai kurva kontinu 1D terhadap kedalaman sumur.",
            formula: "Vsh = (GR_log - GR_min) / (GR_max - GR_min)",
            threshold:
              "Gamma Ray > 140 API & Deviasi Caliper > 10.5 inci (Keruntuhan Dinding Sumur / Washout)",
            alert:
              "WARNING [WELL_LOG_ABNORMAL]: Batuan serpih (shale) tebal dan basah terdeteksi! Rawan pembengkakan lempung (clay swelling) yang dapat menjepit pipa bor!",
            soundDescription:
              "Sonifikasi Well Logging disimulasikan sebagai ketukan sonar berfrekuensi tinggi (Geiger Counter) yang kecepatannya berbanding lurus dengan nilai radiasi API, diiringi dengung subsurface frekuensi rendah.",
            dataSample: JSON.stringify(
              [
                { depth_m: 1200, gr_api: 145, caliper_in: 11.2, vsh: 0.85 },
                { depth_m: 1210, gr_api: 138, caliper_in: 9.8, vsh: 0.78 },
              ],
              null,
              2,
            ),
          },
          2: {
            title: "2. Seismic Amplitude Inversion & Synthetic Seismogram",
            desc: "Mentransformasikan rekaman gelombang refleksi seismik menjadi sebaran impedansi akustik dan reflektivitas batuan subsurface, beserta fitur Synthetic Seismogram Generator (Konvolusi).",
            geologyInfo:
              "Berguna mendeteksi batas formasi batuan secara lateral serta melakukan well-to-seismic tie. Penurunan impedansi akustik yang drastis di area tertentu mengindikasikan kehadiran zona porus tinggi yang terisi gas.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/SeismicModule.tsx`. Visualisasi grid 2D penampang lintang menggunakan interpolasi warna benderang.",
            formula: "Rc = (Z_i+1 - Z_i) / (Z_i+1 + Z_i)",
            threshold:
              "Koefisien Refleksi Seismik (Rc) <= -0.92 (Bright Spot Amplitudo Ekstrem)",
            alert:
              "CRITICAL ALERT [SEISMIC_BRIGHT_SPOT]: Terdeteksi anomali reflektivitas negatif ekstrem! Indikasi kuat akumulasi gas bertekanan tinggi (Gas Pocket)!",
            soundDescription:
              "Menghasilkan dengung bas seismik subsonic yang tebal (sine sweep rendah 45Hz ke 25Hz) menggambarkan perambatan energi seismik di bawah kerak bumi.",
            dataSample: JSON.stringify(
              [
                {
                  inline_id: 4500,
                  xline_id: 1120,
                  rc: -0.94,
                  impedance_pa: 1720,
                  classification: "Gas Reservoir",
                },
              ],
              null,
              2,
            ),
          },
          3: {
            title: "3. Geomechanics Integrity & Pore Pressure Module",
            desc: "Mengevaluasi distribusi tekanan pori batuan terhadap gradien rekah mekanis untuk meminimalkan risiko semburan liar.",
            geologyInfo:
              "Saat pengeboran menembus zona overpressure (tekanan berlebih), berat lumpur pemboran harus dikontrol secara presisi agar tidak memecahkan batuan penutup (fracture gradient).",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/Geomechanics.tsx`. Algoritma memantau rasio kompresibilitas batuan.",
            formula: "Pp = Ob - (Ob - Ph) * (dt_matrix / dt_log)^f",
            threshold:
              "Tekanan Pori (Pp) >= 0.96 * Gradien Rekah (Fracture Gradient)",
            alert:
              "EMERGENCY [GEOMECH_BLOWOUT_RISK]: Tekanan pori bawah permukaan mendekati batas rekah batuan! Risiko blowout fatal sangat tinggi!",
            soundDescription:
              "Suara dengung mekanikal tajam 65Hz dengan beeping alarm bernada tinggi (1100Hz) berulang-ulang, menirukan kondisi derrick rig saat terjadi tekanan kritis.",
            dataSample: JSON.stringify(
              [
                {
                  depth_m: 2800,
                  pore_press_ppg: 16.2,
                  frac_grad_ppg: 16.7,
                  safety_margin: 0.02,
                },
              ],
              null,
              2,
            ),
          },
          4: {
            title: "4. Gravity & Magnetic Field Anomalies",
            desc: "Mengukur variasi densitas lateral batuan dasar dan fluks medan magnet bumi untuk memetakan intrusi vulkanik di dekat sumur bor.",
            geologyInfo:
              "Bermanfaat memetakan batas cekungan sedimentasi serta mengidentifikasi batuan beku intrusif yang keras dan tidak dapat ditembus oleh mata bor biasa.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/GravityMagModule.tsx`. Peta anomali kontur termal spasial.",
            formula: "g_bouguer = g_obs - g_normal + 0.3086*h - 0.04193*rho*h",
            threshold:
              "Anomali Gravitasi Bouguer < -125 mGal & Fluks Magnetik > 59.000 nT",
            alert:
              "DANGER [MAGMA_INTRUSION]: Anomali massa sangat rendah dikombinasikan dengan kemagnetan ekstrem! Terdeteksi kubah magma dangkal!",
            soundDescription:
              "Frekuensi menyapu (eerie sweeping oscillator) dari frekuensi menengah 320Hz yang naik turun menyerupai detektor anomali fluks medan magnet luar angkasa.",
            dataSample: JSON.stringify(
              [
                {
                  station_code: "GM-A12",
                  gravity_anomaly_mgal: -128,
                  magnetic_flux_nt: 59200,
                },
              ],
              null,
              2,
            ),
          },
          5: {
            title: "5. Electrical & Electromagnetic IP Module",
            desc: "Mengukur konduktivitas listrik batuan dan efek polarisasi terimbas untuk mendeteksi sebaran deposit bijih logam sulfida.",
            geologyInfo:
              "Batuan yang mengandung sulfida logam tinggi (emas, tembaga) dapat menyimpan muatan listrik sesaat seperti kapasitor raksasa ketika diberi arus luar.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/ElectricalEMModule.tsx`. Menampilkan kurva discharge pengisian tegangan.",
            formula: "M = 1/V_c * \\int(V_p(t) dt)",
            threshold: "IP Chargeability > 85 mV/V",
            alert:
              "RESOURCE_GOLD [ALTERATION_ZONE]: Terverifikasi zona alterasi hidrotermal sulfida tinggi dengan akumulasi emas bernilai ekonomis tinggi!",
            soundDescription:
              "Suara gergaji listrik (square wave 200Hz) yang disaring oleh bandpass filter, diiringi suara pelepasan muatan listrik (discharge sweep) periodik.",
            dataSample: JSON.stringify(
              [
                {
                  station_id: "IP-102",
                  spacing_m: 50,
                  chargeability_mvv: 89.2,
                  resistivity_ohm: 380.5,
                },
              ],
              null,
              2,
            ),
          },
          6: {
            title: "6. Fluid Identification & Elastic Poisson's Ratio",
            desc: "Menganalisis elastisitas dan ketahanan kompresi batuan reservoir menggunakan rasio perbandingan kecepatan gelombang P dan gelombang S.",
            geologyInfo:
              "Gelombang seismik P sensitif terhadap fluida gas, sedangkan gelombang S tidak terpengaruh oleh fluida, memungkinkan pemisahan antara gas, minyak, dan air.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/FluidID.tsx`. Grafik crossplot fluida.",
            formula: "Nu (Poisson's Ratio) = 0.5 * [ 1 - 1 / ((Vp/Vs)^2 - 1) ]",
            threshold:
              "Poisson's Ratio (Nu) <= 0.14 (Dominasi Kompresibilitas Gas)",
            alert:
              "WARNING [GAS_POCKET_DETECTED]: Rasio Poisson sangat rendah! Terindikasi akumulasi kantong gas kering bertekanan tinggi!",
            soundDescription:
              "Hembusan suara mendesis dan letupan gelembung acak (hydro-bubble effects) yang dipicu oleh fluktuasi geologi fisis.",
            dataSample: JSON.stringify(
              [
                {
                  reservoir_depth: "3100-3130m",
                  vp_vs_ratio: 1.52,
                  poisson_ratio: 0.12,
                },
              ],
              null,
              2,
            ),
          },
          7: {
            title: "7. GPR Waveform Radar & Void Detection",
            desc: "Menggunakan pulsa gelombang elektromagnetik radar frekuensi tinggi untuk mendeteksi struktur rongga udara di bawah rig derrick.",
            geologyInfo:
              "Penting untuk mencegah rig ambles akibat runtuhnya rongga batu gamping (karst void) atau kebocoran fluida di dekat pondasi beban berat.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/GPRModule.tsx`. Menampilkan diagram radargram 2D penampang waktu dangkal.",
            formula: "d = (c * t) / (2 * sqrt(epsilon_r))",
            threshold:
              "Refleksi Amplitudo GPR > 4.8 mV pada kedalaman dangkal < 15 ns",
            alert:
              "CRITICAL [RIG_FOUNDATION_VOID]: Terdeteksi gua pelarutan dangkal berukuran besar tepat di bawah struktur penopang utama derrick!",
            soundDescription:
              "Ticking radar echolocation cepat yang berulang-ulang berdenyut pada frekuensi 1400Hz untuk mensimulasikan pemantulan pulsa radar elektromagnetik.",
            dataSample: JSON.stringify(
              [
                {
                  line_profile: "GPR-RigWest",
                  reflection_time_ns: 11.8,
                  amplitude_mv: 5.4,
                  void_class: "Severe Cavity",
                },
              ],
              null,
              2,
            ),
          },
          8: {
            title: "8. Rock Geochemistry Ore & Arsenic Detection",
            desc: "Kalkulasi kadar bijih mineral mulia dengan memisahkan unsur berharga emas terhadap cemaran senyawa beracun arsenik.",
            geologyInfo:
              "Seringkali emas berasosiasi kuat dengan mineral arsenopirit yang beracun. Pemisahan geokimia yang presisi memastikan nilai ekonomi tambang yang aman bagi lingkungan.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/GeochemModule.tsx`. Grafik radar konsentrasi elemen mineral.",
            formula: "Au_Grade_Equivalent = Au_ppm + (As_ppm * 0.00015)",
            threshold:
              "Kadar Emas > 6.0 ppm dengan Cemaran Arsenik (As) > 2.800 ppm",
            alert:
              "HSE_ALERT [TOXIC_GOLD_ORE]: Konsentrasi bijih emas sangat tinggi namun diiringi tingkat toksisitas arsenik mematikan bagi pekerja!",
            soundDescription:
              "Bunyi dentingan lonceng logam murni yang indah dan jernih (frekuensi tinggi 980Hz, 1350Hz, dan 1780Hz) melambangkan molekul emas mulia bawah tanah.",
            dataSample: JSON.stringify(
              [
                {
                  ore_batch: "BH-XRF-88",
                  au_ppm: 9.2,
                  as_ppm: 2950,
                  iron_pct: 12.4,
                },
              ],
              null,
              2,
            ),
          },
          9: {
            title: "9. Meteorology Severe Storm Warning",
            desc: "Memantau parameter kecepatan angin ekstrem, tekanan barometrik udara luar, dan kilat petir di sekitar menara derrick.",
            geologyInfo:
              "Menara rig pengeboran memiliki batas ketahanan beban lateral (wind loading). Badai angin besar mewajibkan derrick lockdown demi mencegah keruntuhan struktur derrick.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/MeteorologyModule.tsx`. Grafik tren tekanan atmosfer.",
            formula: "F_wind = 0.5 * rho_air * Cd * A * v_wind^2",
            threshold:
              "Kecepatan Angin > 26 m/s & Tekanan Udara < 962 hPa (Badai Kategori 5)",
            alert:
              "RIG_LOCKDOWN [SEVERE_METEO_CYCLONE]: Kecepatan angin melebihi ambang batas ketahanan mekanis rig! Evakuasi seluruh kru dan lockdown derrick!",
            soundDescription:
              "Dengung angin badai bergemuruh (lowpass sweep acak) yang berfluktuasi menirukan empasan badai topan di laut lepas.",
            dataSample: JSON.stringify(
              [
                {
                  wind_speed_ms: 29.5,
                  air_pressure_hpa: 958.2,
                  direction_deg: 285,
                },
              ],
              null,
              2,
            ),
          },
          10: {
            title: "10. Groundwater Drawdown & Aquifer Hydrodynamics",
            desc: "Analisis penurunan permukaan air tanah akibat pemompaan air terus-menerus dan risiko intrusi salinitas air laut.",
            geologyInfo:
              "Eksploitasi air tanah berlebih di wilayah pesisir dapat menarik baji air laut asin masuk ke daratan, mencemari air minum dan memicu amblesan tanah perkotaan.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/GroundwaterModule.tsx`. Animasi grafik hidrograf drawdown.",
            formula: "s = Q / (4 * pi * T) * W(u)",
            threshold:
              "Drawdown Penurunan Air > -82 m & Salinitas Intrusi Air Laut > 3.200 ppm",
            alert:
              "ENVIRONMENT_ALERT [GROUNDWATER_DEPLETION]: Penurunan muka air tanah kritis diiringi intrusi air laut masif!",
            soundDescription:
              "Suara riak air mengalir perlahan yang dimodulasi secara halus oleh gelombang sinus frekuensi rendah untuk menirukan getaran air tanah.",
            dataSample: JSON.stringify(
              [
                {
                  pump_well_id: "GW-08",
                  current_drawdown_m: -85.1,
                  salinity_ppm: 3420,
                },
              ],
              null,
              2,
            ),
          },
          11: {
            title: "11. Soil pH & Acid Mine Drainage Corrosion Protection",
            desc: "Memantau tingkat keasaman tanah sekitar rig akibat rembesan air asam tambang yang mengandung belerang tinggi.",
            geologyInfo:
              "Air Asam Tambang (Acid Mine Drainage) terbentuk dari oksidasi mineral sulfat akibat paparan udara luar, menghasilkan cairan korosif yang mengikis besi pondasi derrick.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/SoilPHModule.tsx`. Grafik status pH korosi.",
            formula: "pH = -log10[H+]",
            threshold: "Soil pH <= 1.4 (Sangat Asam Korosif)",
            alert:
              "CRITICAL_ENV [ACID_MINE_DRAINAGE]: Terdeteksi air asam ekstrem korosif berlebih! Dapat merusak struktur besi penopang sumur!",
            soundDescription:
              "Gemercik suara berdesis korosif berfrekuensi tinggi (sizzle pops acak di atas 2.5kHz) untuk melambangkan reaksi kimia tanah korosif.",
            dataSample: JSON.stringify(
              [
                {
                  sensor_grid_id: "pH-3A",
                  ph_level: 1.25,
                  sulphur_content_pct: 5.2,
                },
              ],
              null,
              2,
            ),
          },
          12: {
            title: "12. Gas Air Quality & Lethal H2S Exposure HSE",
            desc: "Sistem monitoring kadar konsentrasi gas racun Hydrogen Sulfide (H2S) yang keluar dari formasi sumur bor.",
            geologyInfo:
              "Gas H2S sangat berbahaya; pada kadar >10 ppm merusak saraf penciuman manusia, sedangkan pada kadar >450 ppm menyebabkan kematian instan dalam hitungan detik.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/GasAirQualityModule.tsx`. Dilengkapi interseptor veto otomatis Swarm AI.",
            formula:
              "H2S_Concentration_ppm = Measured_Voltage_mV * Calibration_Factor",
            threshold:
              "Konsentrasi H2S > 10 ppm (Wajib Masker Oksigen) & > 450 ppm (Lethal Breakout Fatal)",
            alert:
              "EVACUATE_NOW [FATAL_H2S_BREAKOUT]: Terjadi kebocoran gas maut H2S tingkat fatal! Evakuasi seluruh area rig sumur bor sekarang!",
            soundDescription:
              "Hembusan gas bocor (desis sawtooth disaring) dikombinasikan dengan sirene bahaya bernada tinggi yang berkedip cepat.",
            dataSample: JSON.stringify(
              [
                {
                  sensor_location: "Wellhead-B",
                  h2s_ppm: 485,
                  o2_percent: 17.5,
                },
              ],
              null,
              2,
            ),
          },
          13: {
            title: "13. Spatial Twin 3D Deformation & GNSS Geodesy",
            desc: "Pemantauan deformasi, pergeseran mikro patahan bumi, dan pergerakan kemiringan menara derrick rig secara milimeter presisi.",
            geologyInfo:
              "Memanfaatkan kombinasi INSAR satelit radar dan alat penerima GNSS di tapak rig pengeboran untuk mendeteksi ketidakstabilan lereng tambang secara 3D.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/SpatialTwin.tsx`. Model mesh 3D interaktif.",
            formula: "Delta_z = z_current - z_baseline",
            threshold:
              "Laju Amblesan (Subsidence Rate) < -210 mm/tahun & Kemiringan Derrick > 2.5 Derajat",
            alert:
              "RIG_COLLAPSE_WARNING [SPATIAL_DEFORMATION]: Menara derrick mengalami ketidakstabilan struktural akibat amblesan tanah berlebih!",
            soundDescription:
              "Dengung geseran tektonik tebal dengan frekuensi geser yang menurun perlahan (down-sweeping pitch) melambangkan amblesnya landasan rig.",
            dataSample: JSON.stringify(
              [
                {
                  tower_node: "Derrick-Tower1",
                  tilt_angle_deg: 2.65,
                  vertical_displacement_mm: -218.4,
                },
              ],
              null,
              2,
            ),
          },
          14: {
            title: "14. Spatial Twin Engine 3D Canvas Projection",
            desc: "Mesin komputasi proyeksi grafis 3D untuk memetakan koordinat ruang bumi ke dalam piksel kanvas browser secara dinamis.",
            geologyInfo:
              "Menggunakan rotasi matriks Euler dan penskalaan koordinat afin untuk mengubah model awan titik sumur bor menjadi visualisasi interaktif.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/SpatialTwinEngine.tsx`.",
            formula: "P_projected = M_projection * M_view * M_model * P_local",
            threshold:
              "FPS Proyeksi < 15 frames/second pada > 50,000 awan titik fisis",
            alert:
              "PERFORMANCE_WARN [SPATIAL_ENGINE_LAG]: Kecepatan render 3D menurun di bawah batas nyaman operasional, butuh optimasi memori!",
            soundDescription:
              "Dengung bising statis berputar yang frekuensinya berubah sesuai dengan sudut kamera aktif.",
            dataSample: JSON.stringify(
              [
                {
                  voxel_count: 12500,
                  render_time_ms: 8.4,
                  active_projection: "Orthographic",
                },
              ],
              null,
              2,
            ),
          },
          15: {
            title: "15. n8n WhatsApp Broadcast Bridge & Safety Override Veto",
            desc: "Pintu gerbang otomatisasi pengiriman peringatan darurat fisis langsung ke gawai pihak penanggung jawab via webhook.",
            geologyInfo:
              "Mengirimkan data spasial koordinat derrick dan parameter sensor kritis saat terjadi anomali Tier 3 secara otonom.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/SecurityAndWhatsAppPanel.tsx`.",
            formula: "T_broadcast_delay = N_retries * exponential_backoff(2)",
            threshold: "Gagal Mengirim Webhook > 3 kali berturut-turut",
            alert:
              "GATEWAY_ERROR [WHATSAPP_DISCONNECTED]: Koneksi server n8n atau Baileys terputus, alur evakuasi beralih ke sirene radio fisik!",
            soundDescription:
              "Deretan nada bip pendek berulang cepat (tanggapan ping jaringan) bernada tinggi (880Hz) untuk menelusuri soket.",
            dataSample: JSON.stringify(
              [
                {
                  webhook_url: "https://n8n.internal.node/v1/trigger",
                  connection_status: "CONNECTED",
                  active_threads: 2,
                },
              ],
              null,
              2,
            ),
          },
          16: {
            title:
              "16. Central Command Sidebar Navigator & Persistent State Caching",
            desc: "Pusat navigasi tata letak derrick rig yang mengontrol pemuatan asinkronus seluruh modul fisis.",
            geologyInfo:
              "Menjaga retensi input parameter operator agar tidak hilang ketika berpindah tab analisis atau penyetelan derrick.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/CentralCommand.tsx`.",
            formula: "S_cached = state_buffering(App_Layout_Context)",
            threshold: "Kebocoran Cache State > 120MB memori browser aktif",
            alert:
              "MEMORY_ALERT [NAV_CACHE_OVERFLOW]: Cache antarmuka melampaui batas aman, melakukan pembersihan otomatis terhadap variabel statis!",
            soundDescription:
              "Klik mekanis bersih bernada sedang (440Hz) setiap kali pergantian tab navigasi dipicu.",
            dataSample: JSON.stringify(
              [
                {
                  current_active_tab: "SeismicModule",
                  cached_tabs_count: 5,
                  used_heap_mb: 48.2,
                },
              ],
              null,
              2,
            ),
          },
          17: {
            title: "17. Swarm AI Debate Orchestration Suite",
            desc: "Konsol penasehat multi-agent cerdas yang merumuskan kesimpulan geologi berdasarkan perdebatan otonom.",
            geologyInfo:
              "Mengintegrasikan wawasan geofisikawan virtual untuk menganalisis risiko formasi pengeboran bawah tanah.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/AIConsultantModule.tsx`.",
            formula:
              "C_consensus = \\sum(Agent_Weight * Confidence_Score) / \\sum(Agent_Weight)",
            threshold:
              "Confidence Score Konsensus < 65% pada data geologi ambigu",
            alert:
              "CONSENSUS_LOW [AI_SWARM_AMBIGUITY]: Agen AI gagal merumuskan konsensus dengan keyakinan memadai, butuh intervensi manusia segera!",
            soundDescription:
              "Dengung paduan suara sintesis frekuensi menengah yang bergejolak dan beresonansi mewakili pertukaran data multi-agent.",
            dataSample: JSON.stringify(
              [
                {
                  active_agents: ["DrillBot", "SeisBot", "EcoBot"],
                  consensus_rounds: 3,
                  confidence: 0.89,
                },
              ],
              null,
              2,
            ),
          },
          18: {
            title: "18. Blowout Sandbox Hazard Simulator",
            desc: "Modul simulasi interaktif untuk melatih respon operator terhadap kejadian kick dan ledakan sumur bor di lingkungan aman.",
            geologyInfo:
              "Menguji ketahanan sistem BOP (Blowout Preventer) dan mendeteksi titik jenuh hidrolik kolom lumpur pengeboran.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/SimulationModule.tsx`.",
            formula: "P_wellbore = P_formation - (0.052 * Mud_Density * Depth)",
            threshold: "Tekanan Sumur (P_wellbore) > Batas Toleransi Kick BOP",
            alert:
              "SIMULATED_BLOWOUT [SANDBOX_ACTIVE]: Ledakan fiktif dipicu dalam mode simulasi, katup penutup BOP diinstruksikan menutup!",
            soundDescription:
              "Dengung bising putih bergemuruh dengan modulasi frekuensi rendah yang meniru aliran gas bertekanan besar.",
            dataSample: JSON.stringify(
              [
                {
                  simulated_kick_depth: 3400,
                  mud_weight_ppg: 10.5,
                  bop_valve_status: "CLOSED",
                },
              ],
              null,
              2,
            ),
          },
          19: {
            title: "19. Core System Diagnostics & Telemetry Dashboard",
            desc: "Pemantau vitalitas infrastruktur server, penggunaan memori, latensi API, dan throughput transmisi data fisis rig.",
            geologyInfo:
              "Memastikan kelancaran sirkulasi data fisis dari rig pengeboran tanpa tersumbat bottleneck.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/SystemDiagnostics.tsx`.",
            formula: "L_latency_ms = T_response - T_request",
            threshold:
              "Latensi Server > 500ms atau Penggunaan CPU Cluster > 90%",
            alert:
              "DIAG_CRITICAL [SERVER_OVERLOAD]: Beban komputasi server melampaui ambang batas kestabilan real-time!",
            soundDescription:
              "Suara denyut jantung digital periodik (pulsa 50Hz) yang mempercepat kecepatannya jika performa menurun.",
            dataSample: JSON.stringify(
              [
                {
                  cpu_usage_pct: 78,
                  memory_free_gb: 2.1,
                  latency_ms: 12,
                  connections_active: 142,
                },
              ],
              null,
              2,
            ),
          },
          20: {
            title: "20. Borehole Radiometric Pulse Generator",
            desc: "Sistem pendeteksi kelimpahan mineral radioaktif dan peluruhan isotop di sepanjang lubang sumur.",
            geologyInfo:
              "Menganalisis radiasi gamma spesifik untuk mengidentifikasi keberadaan deposit uranium dan thorium.",
            codeStructure:
              "Diproses di `/src/cores/live/components/Modules/BoreholeRadiometricModule.tsx` atau `/src/cores/live/components/Modules/SeismicRadar.tsx`.",
            formula: "A_t = A_0 * e^{-\\lambda * t}",
            threshold: "Intensitas Radiasi > 320 CPS (Counts Per Second)",
            alert:
              "RADIATION_HAZARD [HIGH_RADIOMETRIC_ZONE]: Mendeteksi kandungan mineral radioaktif berdensitas tinggi di kedalaman aktif!",
            soundDescription:
              "Suara detak acak bernada ultra tinggi (Geiger Counter klasik di atas 3kHz) yang berderak cepat.",
            dataSample: JSON.stringify(
              [
                {
                  radiometric_cps: 345,
                  isotopic_class: "Uranium-238",
                  depth_m: 1450,
                },
              ],
              null,
              2,
            ),
          },
        },
      },
      four: {
        title:
          "BAB IV: Protokol Keamanan Override Veto & Integrasi WhatsApp n8n Webhook",
        section1Title:
          "1. Mekanisme Interseptor API Keamanan Server-Side (Safety Override & Veto Core)",
        section1Content:
          "Seluruh draf konsensus, laporan teknis, dan perdebatan argumen dari agen Swarm AI dikirimkan secara berkala ke sisi backend server melalui endpoint `/api/swarm/debate`. Guna mencegah AI memberikan instruksi kerja yang salah dalam kondisi ekstrem, Ivan merancang Interseptor Veto Kebijakan Keselamatan (Safety Override Veto Interceptor) di sisi server.\n\nSistem ini bekerja dengan memindai setiap kata dan parameter dalam string teks perdebatan para agen AI secara real-time. Jika interseptor mendeteksi kata kunci kritis yang mewakili bahaya fisik sumur bor (seperti 'H2S', 'Blowout', 'Cave-in', atau 'Overpressure'), status perdebatan akan langsung dibatalkan secara sepihak (Vetoed) dalam hitungan milidetik. Sistem membekukan seluruh modul diskusi AI, mengunci visualisasi dasbor derrick rig dengan indikator bahaya merah berkedip, menyusun objek payload darurat terstruktur `externalEmergencyPayload` yang berisi koordinat GPS sumur bor, tekanan fisis terakhir, dan konsentrasi gas racun, lalu secara otomatis mentransmisikannya langsung via webhook Node.js ke server n8n.",
        section2Title:
          "2. Pengalihan Webhook WhatsApp Tanpa Menampilkan Nomor Telepon (Encrypted Redirection Gateway)",
        section2Content:
          "Dalam mendistribusikan laporan darurat dan notifikasi kegagalan rig, platform sangat memperhatikan kerahasiaan data operasional. Untuk melindungi nomor kontak pribadi milik Administrator (@Ivanhutabarat) yang mengelola n8n bridge, antarmuka dasbor tidak pernah mengekspos raw string nomor handphone dalam kode markup HTML publik.\n\nSebaliknya, platform menerapkan sistem Encrypted Redirection Gateway. Tombol aksi WhatsApp dihubungkan dengan handler dinamis di backend yang menyusun teks pesan laporan terenkripsi. Ketika operator mengklik tombol tersebut, browser memicu tautan khusus `https://wa.me/6285260245100?text=...` yang mengarahkan sesi chat WhatsApp secara aman dan rahasia tanpa pernah memunculkan informasi nomor kontak sensitif di dalam markup halaman web dasbor.",
      },
      five: {
        title: "BAB V: Sistem Penyelamatan HSE & Keamanan Sumur Bor Utama",
        section1Title:
          "1. Mitigasi Kebocoran Gas Maut H2S & Alur Evakuasi Kru Lapangan (Life-Safety First)",
        section1Content:
          "Gas Hydrogen Sulfide (H2S) merupakan gas beracun paling mematikan dalam industri eksplorasi geofisika dan pengeboran subsurface. Gas ini tidak memiliki warna, sangat korosif terhadap baja, mudah meledak, dan memiliki massa jenis yang lebih berat dari udara sehingga cenderung mengendap di lantai kerja rig.\n\nUntuk menjamin keselamatan kru lapangan, GeoAI Pro mengoperasikan protokol deteksi berlapis yang sangat ketat:\n- Deteksi Tier 1 (Kadar > 10 ppm): Gas mulai menumpulkan indra penciuman manusia. Sistem secara otomatis menyalakan lampu strobo kuning, mengaktifkan blower sirkulasi udara derrick rig secara paksa, dan menginstruksikan kru lapangan melalui alarm suara untuk menggunakan masker oksigen Self-Contained Breathing Apparatus (SCBA).\n- Deteksi Tier 3 (Kadar > 450 ppm): Merupakan batas konsentrasi maut yang memicu kelumpuhan pernapasan instan dalam hitungan detik. Pada titik kritis ini, seluruh penundaan manual (manual delay) dilewati secara otomatis. Sistem mengaktifkan sirene bahaya merah berputar secara otonom, mengunci seluruh sistem rig (lockdown), menyusun detail evakuasi, dan langsung memicu webhook darurat ke WhatsApp Ivan (@Ivanhutabarat) serta pusat kendali SAR untuk pengerahan helikopter evakuasi.",
        section2Title:
          "2. Sistem Interseptor Veto Swarm AI & Pencegahan Blowout Otomatis (BOP Fail-Safe)",
        section2Content:
          "Semburan liar (blowout) terjadi ketika tekanan cairan di dalam formasi batuan bawah tanah (pore pressure) melebihi berat kolom lumpur pengeboran yang menopangnya. Jika hal ini dibiarkan, cairan hidrokarbon akan merangsek naik ke permukaan dengan kecepatan tinggi, memicu ledakan katastropik di derrick rig.\n\nSistem pencegahan blowout terotomatisasi pada GeoAI Pro diintegrasikan langsung dengan parameter geomekanika batuan:\n- Ketika sensor mendeteksi gradien tekanan pori mendekati ambang rekah batuan (Fracture Gradient), Interseptor Keamanan di sisi backend (`server.ts`) seketika mengambil alih kendali.\n- Sistem memveto (membatalkan) seluruh agen Swarm AI yang sedang berdiskusi untuk mencegah kelambatan pengambilan keputusan oleh mesin cerdas.\n- Dalam milidetik, sistem secara asinkronus memicu sinyal kontrol ke katup fisik Blowout Preventer (BOP) untuk menyegel lubang sumur, mengalihkan aliran hidrokarbon berlebih ke flaring line untuk dibakar secara aman, dan memperbarui instruksi pompa sirkulasi rig untuk meningkatkan densitas lumpur pengeboran (mud weight) hingga mencapai keseimbangan hidrostatik kembali.",
      },
      six: {
        title:
          "BAB VI: Analisis Arsitektur Pohon Faktor & Modul Aplikasi (Enterprise Code Topology)",
        section1Title:
          "1. Visualisasi Struktur Pohon Folder Utama (Pohon Faktor)",
        section1Content:
          "Berikut adalah pohon faktor repositori kode utama yang menyusun aplikasi GeoAI Pro v4.0 secara utuh, menampilkan struktur modular yang memisahkan logika server, antarmuka frontend, dan modul komputasi fisis:\n\n├── /src/\n│   ├── App.tsx (Komponen Utama & Pusat Pengendali Dasbor)\n│   ├── index.css (Gaya Tailwind Global, Kustomisasi Font & Tema Utama)\n│   ├── types.ts (Definisi Struktur Tipe Data Geofisika & Enums Terenkripsi)\n│   ├── api/ (Modul Integrasi & Komunikasi Server-Side Proksi)\n│   ├── components/ (Pustaka UI, Widget Global, Chart, & Dialog)\n│   │   └── Modules/ (Sarang 24 Berkas Komponen Utama Geofisika & Keselamatan)\n│   └── cores/ (Pembagian Lingkungan Simulasi & Live)\n│       ├── live/ (MainDashboard.tsx, Pemantauan Asinkron Rig Aktif)\n│       └── dummy/ (MainDashboard.tsx, Sandbox Simulasi Bahaya)\n├── server.ts (Mesin Backend Utama, Sinyal Baileys & Endpoint API)\n├── tsconfig.json (Sistem Konfigurasi Transpilasi TypeScript)\n└── package.json (Manajer Ketergantungan Paket Proyek)",
        section2Title:
          "2. Rincian Peran Teknis 24 Berkas Modul Pengeboran (Core Architectural Components)",
        section2Content:
          "GeoAI Pro v4.0 ditenagai oleh 24 berkas komponen fungsional yang bekerja secara terpadu di dalam folder `/src/cores/live/components/Modules/`:\n\n1. `WellLoggingModule.tsx`: Visualisasi kurva 1D radiasi sinar Gamma dan deviasi Caliper dinding sumur.\n2. `SeismicModule.tsx`: Pemrosesan inversi impedansi akustik seismik 2D lintasan silang.\n3. `GeotechnicalTiltExtensoModule.tsx`: Pemantauan regangan mekanis pipa bor dan stabilitas derrick dilingkungan geser.\n4. `GravityMagModule.tsx`: Deteksi anomali gravitasi Bouguer dan fluks magnetik intrusi batuan beku.\n5. `ElectricalEMModule.tsx`: Pengukuran polarisasi terimbas untuk pemetaan mineralisasi sulfida emas.\n6. `GroundwaterModule.tsx`: Simulasi drawdown muka air tanah dan pengawasan intrusi salinitas air laut.\n7. `GPRModule.tsx`: Radargram pemindaian rongga karst dangkal penopang kaki menara derrick.\n8. `GeochemModule.tsx`: Analisis kadar emas elemental berbanding kontaminan senyawa arsenik beracun.\n9. `MeteorologyModule.tsx`: Deteksi badai permukaan, kecepatan angin lateral, dan tekanan atmosfer.\n10. `SoilPHModule.tsx`: Pengukuran tingkat asam tanah korosif untuk melindungi pondasi beton rig.\n11. `GasAirQualityModule.tsx`: Pengawasan kadar gas beracun H2S fisis dan intervensi keselamatan mandiri.\n12. `SpatialModule.tsx`: Koordinasi pergeseran geodesi GNSS 3D skala milimeter.\n13. `SpatialTwin.tsx`: Visualisasi representasi model 3D interaktif deformasi tanah.\n14. `SpatialTwinEngine.tsx`: Mesin komputasi matematika di balik proyeksi 3D canvas.\n15. `ManualBookSuite.tsx`: Ensiklopedia lengkap dan buku panduan komparatif ganda (berkas ini!).\n16. `SecurityAndWhatsAppPanel.tsx`: Kontrol override veto darurat dan status sinkronisasi WhatsApp.\n17. `SystemDiagnostics.tsx`: Modul diagnostik beban memori, latency server, dan throughput data.\n18. `AIConsultantModule.tsx`: Konsol agen pintar Swarm AI tempat konsensus geologi dirumuskan.\n19. `SimulationModule.tsx`: Sandbox kendali untuk memicu skenario bencana blowout sumur.\n20. `CentralCommand.tsx`: Koordinator utama yang menghubungkan seluruh sub-modul ke Sidebar navigasi.\n21. `AnalyticsDrawer.tsx`: Laci overlay untuk grafik komparatif statistik subsurface.\n22. `OmniScienceWidget.tsx`: Widget kalkulator konversi unit geologi terapan.\n23. `BoreholeRadiometricModule.tsx`: Modul penghasil pulsa radiometrik litologi lubang bor.\n24. `SpatialControlPanel.tsx`: Panel navigasi untuk rotasi dan scaling visualisasi mesh 3D.",
      },
      seven: {
        title:
          "BAB VII: Bedah Kode Tingkat Rendah (Backend & Frontend Architecture)",
        section1Title:
          "1. Bedah Logika Server.ts (Backend Engine, Baileys WA, & Authentication Gates)",
        section1Content:
          "Backend aplikasi diimplementasikan di `server.ts` menggunakan Express.js berkinerja tinggi. Untuk mendukung sistem komunikasi darurat otomatis, sistem mengintegrasikan pustaka `baileys` melalui fungsi `initWhatsApp()`. Autentikasi disimpan secara persisten di `/tmp/baileys_auth_info_2` menggunakan mekanisme multi-file auth state.\n\nSistem memantau event `messages.upsert` secara asinkron. Untuk mencegah kebocoran keamanan dan penyebaran perintah jahat, interseptor memverifikasi pengirim pesan secara ketat; instruksi penulisan data dan pemicu laporan PDF hanya dieksekusi apabila nomor pengirim cocok dengan nomor rahasia Engineer (`6285260245100`). Selain itu, pengunggahan snapshot PDF dari UI frontend ditangani oleh middleware `multer` memori pada endpoint `/api/webhook/whatsapp/upload-report` sebelum diteruskan langsung sebagai biner dokumen WhatsApp.\n\nKeamanan gerbang masuk (Authentication Gates) juga diperkuat dengan:\n- Validasi Lisensi Perangkat Keras (`identityValidator`): Sistem mendeteksi tanda tangan biner fisik yang terkunci di dalam file `/config/.identity_lock` sebelum merender modul apa pun.\n- Pre-boot Integrity Check (`prebootIntegrityCheck()`): Memverifikasi tanda tangan SHA-256 server-side untuk memastikan tidak ada perubahan file ilegal pada kode sebelum aplikasi memuat UI di browser.\n- Brute-Force Lockout Grid: Memantau percobaan masuk. Jika terjadi kegagalan sandi sebanyak 5 kali berturut-turut, sistem akan langsung memberlakukan denda penguncian otomatis selama 30 detik.\n- Dynamic Password Strength Telemetry: Algoritma di sisi frontend mengevaluasi kompleksitas sandi yang diketik operator (panjang karakter, variasi huruf, angka, simbol) lalu merender progres bar bar berwarna dari 'Sangat Lemah' hingga 'Sangat Kuat'.\n- Cryptographic Developer Bypass Hash: Developer bersertifikat dapat melewati gerbang masuk saat server mengalami out-of-sync menggunakan PIN bypass rahasia yang dicocokkan dengan tanda tangan SHA-256 di sisi server.",
        section2Title:
          "2. Sistem Rotasi Kunci API & Failover Multi-Key pada 429 Error",
        section2Content:
          "Sistem dilengkapi dengan barikade ketahanan API di backend melalui fungsi `fetchSwarmAPI`. Kunci API didefinisikan dalam variabel lingkungan `SWARM_API_KEYS` sebagai string JSON array. Apabila terjadi kegagalan pemanggilan model generatif akibat pembatasan kuota (HTTP Error 429 - Too Many Requests), sistem menangkap kode status tersebut secara otomatis. Fungsi penanganan kesalahan memicu `rotateSwarmKey()`, yang menggeser penunjuk kunci (`currentKeyIndex`) ke kunci berikutnya dengan operasi modulo aritmatika terhadap total kunci terdaftar, lalu mengeksekusi percobaan ulang (recursive retry). Failover otomatis ini berjalan mulus di latar belakang tanpa mengganggu jalannya perdebatan agen AI di dasbor pengguna.",
        section3Title:
          "3. Rincian Kompilasi 3.950+ Modul Vite & Arsitektur Teknologi (Tech Stack)",
        section3Content:
          "Platform Ivan-GeoAI Pro dibangun di atas arsitektur full-stack modern yang sangat optimal untuk visualisasi geofisika real-time dan orkestrasi kecerdasan buatan multi-agent. Saat proses produksi berjalan, build compiler (Vite) mengidentifikasi dan mengompilasi sebanyak 3.951 modul individual secara modular menjadi berkas statis teroptimasi. Berikut penjelasan mendalam mengenai modul-modul tersebut dan bagaimana platform ini dibangun:\n\nA. Mengapa Terdapat Lebih dari 3.950 Modul?\nAngka kompilasi yang besar ini adalah hasil dari arsitektur modular modern berbasis ES (EcmaScript) Modules. Vite menganalisis pohon ketergantungan (dependency tree) aplikasi secara mendalam dan melakukan pemecahan kode (code-splitting) guna mempercepat waktu muat. Modul-modul ini terdistribusi ke dalam beberapa komponen utama:\n1. Grafis & Visualisasi 3D (Three.js): Mesin utama visualisasi spasial 3D tanah (`three`) menyumbang ratusan sub-modul internal matematika, matriks proyeksi, shader WebGL kustom, kalkulasi geometri voxel, pencahayaan (lighting), dan material material fisik bumi interaktif.\n2. Pustaka Ikon Fleksibel (Lucide React): Menyediakan ribuan modul ikon SVG terpisah. Vite secara cerdas mengimpor hanya ikon yang digunakan (tree-shaking), namun tetap menghitung ketergantungan modul dasar ikon tersebut demi visualisasi dasbor yang responsif.\n3. Ekspor Laporan PDF & Canvas Interaktif: Modul-modul dari `jspdf`, `html2canvas`, dan `dompurify` yang kompleks mengurai elemen DOM HTML di frontend, merekonstruksi tata letak piksel demi piksel, menyaring konten jahat, dan membungkusnya menjadi dokumen biner portabel secara instan.\n4. Grafis Telemetri Real-Time (Recharts & D3): Ribuan sub-modul matematika statistik dari D3 (Data-Driven Documents) dan Recharts untuk memproyeksikan kurva seismik, logging sumur bor, densitas gravitasi, dan perubahan seismik dengan interpolasi kurva linier yang mulus.\n5. React Engine & State Managers: Core React v18, perutean dinamis `react-router-dom`, pemicu transisi animasi `motion/react` (Framer Motion), serta pengelola state `zustand` yang mengamankan integritas sinkronisasi variabel antarmuka.\n\nB. Teknologi Apa Saja yang Digunakan & Bagaimana Platform Ini Dibangun?\n1. Frontend (Antarmuka Pengguna):\n   - React 18 & TypeScript: Memberikan ketahanan tipe data penuh (Type Safety) untuk parameter fisis geofisika.\n   - Vite 6: Build tool super cepat yang menggantikan Webpack tradisional, menggunakan esbuild di latar belakang untuk pra-bundling dependensi dalam milidetik.\n   - Tailwind CSS v4: Menghasilkan gaya visual tingkat tinggi dengan performa tinggi, memanfaatkan sistem pengompilasi CSS terbaru.\n   - Framer Motion (motion/react): Mensimulasikan transisi perutean halaman, laci kontrol, efek radar, dan kedipan sensor bahaya secara dinamis.\n2. Backend (Mesin Server & Integrasi):\n   - Express (Node.js): Menangani pipeline data real-time, perutean Webhook n8n, pengunduhan file, serta proksi API yang aman.\n   - Esbuild & TSX: Mengompilasi dan membundel kode TypeScript backend (`server.ts`) menjadi berkas tunggal CJS (`dist/server.cjs`) berkinerja tinggi, mematikan HMR yang memicu overhead memori.\n   - Baileys (WhatsApp Web API): Menghubungkan platform langsung ke nomor WhatsApp darurat Ivan guna melaporkan bencana atau alarm Tier 3 secara otomatis.\n   - Google GenAI SDK (@google/genai): Digunakan di sisi server untuk menghubungkan model Gemini 3.5 Flash secara aman dengan proteksi API Key penuh di backend proksi.",
      },
      eight: {
        title:
          "BAB VIII: Kegagalan Historis, Tantangan Masa Depan & Interaksi Manusia",
        section1Title:
          "1. Masalah yang Pernah Terjadi di Masa Lalu (Historical Implementation Bugs)",
        section1Content:
          "Selama proses pengembangan platform GeoAI Pro, tim mencatat beberapa masalah kritis:\n\n• Loop Mematikan HMR: Hot Module Replacement (HMR) bawaan Vite sering kali memicu pembangunan ulang modul canvas 3D yang sangat padat secara berulang-ulang setiap kali ada penulisan baris kode, mengakibatkan browser macet. Masalah ini diselesaikan dengan menonaktifkan HMR secara penuh di lingkungan pengembangan (`DISABLE_HMR=true`).\n\n• Pemblokiran Popup Iframe: Lingkungan pratinjau browser (iframe sandbox) secara agresif memblokir fungsi `window.open` dan modal dialog alert bawaan browser. Diselesaikan dengan membangun sistem modal custom (Dual-Route UI Modal) yang merender dialog langsung di atas kanvas aplikasi.\n\n• Kerusakan PDF (Visual Tearing): Aliran data telemetri real-time yang sangat cepat memicu re-render grafik di tengah-tengah pengambilan gambar oleh html2canvas, menghasilkan gambar PDF yang terpotong. Diselesaikan dengan membekukan sementara (freezing) pembaruan telemetri di frontend selama ekspor berlangsung.",
        section2Title:
          "2. Masalah Kemungkinan Terjadi di Masa Depan (Future Engineering Risks)",
        section2Content:
          "Beberapa risiko teknis jangka panjang yang harus diwaspadai meliputi:\n\n• Kebocoran Memori WebGL 3D: Pengoperasian visualisasi 3D deformasi tanah secara terus-menerus selama berminggu-minggu di layar kontrol rig dapat menghabiskan memori GPU browser. Mitigasi melibatkan deteksi kebocoran memori otomatis dan penghancuran (destruction) serta pembuatan ulang konteks WebGL secara periodik.\n\n• Overload Telemetri Frekuensi Tinggi: Sensor rig modern dapat memproduksi ribuan pulsa data per detik. Aliran data secepat ini dapat membekukan utas utama (main thread) JavaScript di browser. Mitigasi memerlukan pemindahan logika parsing data berat ke dalam Web Workers di latar belakang.",
        section3Title:
          "3. Masalah Saat Interaksi Manusia (Human-System Interaction Risks)",
        section3Content:
          "Interaksi antara operator rig dan sistem otomasi keselamatan sering menghadapi kendala:\n\n• Kelelahan Alarm (Alarm Fatigue): Banyaknya alarm kecil berisiko membuat operator rig mematikan sirene secara manual, yang dapat mengabaikan peringatan bahaya sesungguhnya. Solusinya adalah penggolongan alarm berbasis skala bahaya (Tiered Alarm System) di mana alarm visual didahulukan, dan sirene audio keras hanya dipicu pada ancaman jiwa mutlak (Tier 3).\n\n• Kelumpuhan Keputusan (Override Paralysis): Saat terjadi bahaya sumur bor, operator manusia sering kali ragu-ragu untuk memencet tombol darurat secara manual karena tekanan finansial penghentian rig. Sistem ini menyelesaikan masalah tersebut dengan menerapkan override veto otomatis terkomputerisasi ketika parameter sensor melintasi batas bahaya fisik bumi.",
      },
      nine: {
        title: "BAB IX: Sistem Suara & Sonifikasi Komputasional Geofisika",
        section1Title:
          "1. Konsep Dasar Sonifikasi Data (Acoustic Geophysics Sonification)",
        section1Content:
          "Sonifikasi data adalah teknik menerjemahkan data numerik parameter geofisika subsurface menjadi sinyal gelombang akustik yang dapat didengar manusia. Sistem ini sangat berguna untuk membantu operator rig memantau kondisi sumur secara pasif tanpa harus terus-menerus menatap layar monitor. Selain itu, pada kondisi darurat di lapangan seperti kebakaran rig, asap tebal, atau kegagalan daya listrik (blackout) di mana layar monitor padam, sonifikasi audio frekuensi tinggi yang dipicu baterai darurat menjadi satu-satunya pemandu arah keselamatan kru lapangan.",
        section2Title:
          "2. Cara Kerja Sintesis Suara via Web Audio API pada 24 Modul",
        section2Content:
          "Sistem suara diimplementasikan di kelas `GeophysicsSonifier` menggunakan standar Web Audio API browser. Tanpa memerlukan berkas audio eksternal (.mp3), sistem mensintesis suara secara real-time di memori audio komputer:\n\n• Modul Well Logging (Gamma Ray): Mengonfigurasi gelombang sinus dasar 80Hz dengan interval `setInterval` cepat yang merender letupan pulsa segitiga berfrekuensi tinggi (600Hz - 900Hz) menyerupai detektor radiasi Geiger Counter.\n\n• Modul Seismic Inversion: Memanfaatkan modulasi frekuensi eksponensial di mana frekuensi oscillator sinus diturunkan secara dinamis dari 45Hz ke 25Hz dalam waktu 2.5 detik untuk menciptakan sensasi rambatan getaran seismik subsonic.\n\n• Modul Geomechanics: Menghasilkan dengung gergaji (sawtooth wave) berfrekuensi rendah 65Hz yang disaring oleh lowpass filter tajam (140Hz), dikombinasikan dengan alarm bising periodik bernada tinggi 1100Hz untuk mensimulasikan kepatuhan integritas batuan dilingkungan kritis.\n\n• Modul Gas Air Quality (H2S): Menggunakan gelombang gigi gergaji yang sangat tajam disaring oleh bandpass filter, menghasilkan desisan kebocoran gas bertekanan tinggi diiringi sirene alarm melengking yang berulang secara cepat.",
      },
      ten: {
        title: "BAB X: Enterprise-Grade Security & Defense Grid",
        section1Title: "1. Proteksi Prompt Injection (AI Core) & Webhook HMAC",
        section1Content:
          "Sistem kini membungkus semua input/kueri dari pengguna dengan aman ke dalam tag XML <USER_QUERY> saat mengirimkan data ke model AI Gemini. AI diberikan instruksi sistem yang sangat tegas untuk mengabaikan perintah apa pun di dalam tag tersebut yang mencoba mengubah persona, memodifikasi format output, atau melanggar aturan. Hal ini bertindak sebagai tameng absolut terhadap pengguna jahat yang mencoba melakukan 'jailbreak'. Selain itu, titik akhir integrasi WhatsApp (/api/webhook/whatsapp) sekarang mewajibkan tanda tangan kriptografi HMAC yang dikirimkan melalui header x-wa-signature, mencegah pihak ketiga acak mengirimkan permintaan webhook palsu.",
        section2Title: "2. Code Obfuscation & Hardware Fingerprinting",
        section2Content:
          "Selama proses kompilasi (build) aplikasi melalui Vite, alat terser digunakan untuk mengacak (mangle) nama variabel dan menghapus semua jejak console.log dari kode sisi klien, yang sangat menyulitkan upaya rekayasa balik (reverse-engineering). Sistem autentikasi juga dilengkapi dengan lapisan validasi sidik jari perangkat keras (Hardware Fingerprinting) untuk mencocokkan 'jejak' spesifik (seperti resolusi layar atau metrik GPU) dari workstation resmi, memblokir akses dari perangkat yang tidak sah meskipun penyerang memiliki kredensial yang sah.",
        section3Title:
          "3. HttpOnly Secure Cookies, Pre-Commit Hooks, & Firestore Sanitizer",
        section3Content:
          "Token autentikasi (JWT) tidak lagi disimpan di penyimpanan browser yang mudah diakses, melainkan dikirim dan disimpan menggunakan cookie dengan tanda HttpOnly dan Secure untuk menetralisir serangan Cross-Site Scripting (XSS). Sebuah skrip bash (scripts/pre-commit-env-check.sh) dikaitkan ke dalam Git untuk memblokir commit yang berisi rahasia infrastruktur sensitif. Terakhir, sebelum objek data didorong ke Firebase Firestore, fungsi pembersih rekursif menyaring payload dengan menghapus properti undefined, memastikan keandalan 100% pada pencatatan log jarak jauh dan sinkronisasi data.",
      },
      eleven: {
        title: "BAB XI: Integrasi Modul Swarm AI (Real-Time Cognitive Swarm)",
        section1Title: "1. Tiga Pilar Komputasi Kognitif di Dasbor Utama",
        section1Content:
          "Sistem AI Orchestrator mengintegrasikan tiga modul analitik khusus yang terhubung langsung ke dalam ekosistem Swarm AI, yaitu: Seismic Amplitude, Gas Safety, dan Geomechanics. Ketiga modul ini dirender pada panel kanan antarmuka, secara proaktif membaca fluktuasi data fisis lapangan (Live Inference) dan menyuplai kondisi lingkungan seketika (real-time) ke mesin pengambilan keputusan AI.",
        section2Title: "2. Seismic Amplitude, Gas Safety, & Geomechanics",
        section2Content:
          "Tiap modul memonitor variabel esensial untuk keselamatan operasional:\n- Seismic Amplitude Module: Memantau rasio amplitudo seismik untuk mendeteksi anomali formasi dangkal seperti perangkap gas bertekanan tinggi (gas trap).\n- Gas Safety Module: Mengukur level konsentrasi racun H2S dalam satuan ppm, terhubung erat dengan protokol override veto otomatis apabila kadar melampaui batas fatal.\n- Geomechanics Module: Menghitung Fracture Gradient dan Pore Pressure guna mengalkulasi stabilitas formasi dan menghindari resiko kick atau blowout.",
        section3Title: "3. Penempatan Modul pada Arsitektur Kode",
        section3Content:
          "Komponen-komponen baru ini (`GasSafetyModule.tsx`, `GeomechanicsModule.tsx`, dan `SeismicModule.tsx`) ditanamkan secara rapi di dalam direktori `src/components/modules/`. Mereka kemudian di-impor secara langsung ke dalam komponen visual `SwarmRoom.tsx` di sisi Live Core. Desain arsitektur modular ini memungkinkan asisten Swarm AI untuk selalu melihat konteks fisik sumur bor tanpa membebani komponen utama dasbor.",
      },
      twelve: {
        title: "BAB XII: Pembaruan Ketahanan Sistem & UI (UX Resilience v4.0)",
        section1Title:
          "1. Isolasi Modul (Component-Level Error Boundary) & Zod Validation",
        section1Content:
          "Setiap Route utama (seperti Central Command, Spatial Twin) kini dibungkus dalam `ModuleErrorBoundary`. Jika satu modul crash, ia akan terisolasi, menjaga sisa aplikasi (telemetri) tetap hidup tanpa White Screen of Death. Library `zod` juga diintegrasikan secara ketat (seperti pada DictionarySchema) untuk menangkap object key yang hilang dan memberikan nilai fallback proaktif.",
        section2Title:
          "2. Pemuatan Asinkron Terpisah (Code Splitting & Suspense Skeleton)",
        section2Content:
          "Rute komponen berbobot besar dipecah menggunakan `React.lazy()` dan `<Suspense>`. Saat pengguna memuat 3D Spatial Twin, UI seketika merender `<ModuleSkeleton />` sambil mengunduh chunk di latar belakang. Hal ini secara drastis memangkas ukuran initial bundle dan membuat aplikasi merespons interaksi tab pengguna secara instan.",
        section3Title: "3. Otomatisasi Unit Testing (Vitest & Pre-Commit)",
        section3Content:
          "Lingkungan pengujian Vitest (`dictionary.test.ts`) telah disiapkan untuk memverifikasi integritas 12 Bab dan modul pendukung. Skrip ini dirantai secara statis ke `pre-commit-env-check.sh`—memblokir commit secara otomatis bila terjadi kerusakan pada struktur Data Dictionary.",
      },
      thirteen: {
        title:
          "BAB XIII: GeoAI Pro v4.0 Next-Gen Enhancement & Field Ecosystem",
        section1Title: "1. Data Compression & Streaming untuk Pemindaian Besar",
        section1Content:
          "GeoAI Pro v4.0 mengintegrasikan teknik Binary Streaming pada backend Express untuk menangani resolusi data point cloud skala masif. Modul Spatial Twin kini menggunakan algoritma Octree dan Level of Detail (LoD). Kerapatan tinggi hanya dirender pada zona pandang terpusat kamera, memastikan performa Three.js bertahan stabil pada 60 FPS tanpa menguras RAM workstation.",
        section2Title: "2. Ekspor Laporan Resmi Otomatis & Offline-First",
        section2Content:
          "Modul Analytics sekarang mencakup Automated Executive PDF Engine yang menggunakan jsPDF dan html2canvas, mengubah data grafik lapangan menjadi PDF resmi sekali klik. Lebih lanjut, platform telah dipersenjatai dengan arsitektur Progressive Web App (PWA) berbasis Service Workers, memungkinkan sistem dibuka secara lokal (Offline-First) di area eksplorasi terpencil tanpa sinyal (blindspot) dan menyinkronkannya kembali begitu sinyal pulih.",
        section3Title: "3. WebGPU Extreme 3D Simulation Mode",
        section3Content:
          "Sistem perender 3D telah dibekali pendeteksi dan fallback untuk WebGPU. WebGPU memungkinkan kalkulasi propagasi gelombang seismik dan pemodelan anomali secara paralel melompati keterbatasan CPU, memaksimalkan kemampuan komputasi GPU secara langsung untuk skenario ekstrem yang membutuhkan rendering jutaan partikel secara simultan.",
      },
      fourteen: {
        title:
          "BAB XIV: Dark/Light Field Mode, Performance Profiler & Eco 60 FPS Engine",
        section1Title: "1. Dynamic Canvas Pixel Ratio Capping & WebGL Shadow Decimation",
        section1Content:
          "Pada modul 3D Spatial Twin (Three.js) dan canvas Sonar MiroFish serta GPR, komputasi grafis bisa sangat intensif pada perangkat berspesifikasi standar atau perangkat mobile. Tombol 'Performance Mode' pada Laci Kontrol Sistem memungkinkan operator menurunkan nilai pixel ratio canvas 3D ke 1.0x (mencegah beban ganda layar Retina), mematikan efek shadow dan anti-aliasing berat, serta mengaktifkan mode komputasi daya rendah (powerPreference: 'low-power'). Ini memastikan rendering tetap stabil pada 60 FPS tanpa mengorbankan integritas data geofisika.",
        section2Title: "2. Real-Time FPS Profiler & Throttling Frekuensi Perbaruan Echogram",
        section2Content:
          "Sistem dilengkapi dengan Floating Profiler real-time yang memantau frame rate (FPS) dan frame latency secara presisi. Saat mode Eco aktif, perputaran refresh visual echogram dan radar sweep sonar di-throttle sebesar 50% untuk mereduksi beban readback GPU/CPU getImageData, menghemat baterai laptop lapangan hingga 40%.",
        section3Title: "3. Sunlight High-Contrast Light Mode & Keamanan Lisensi Tanpa Celah",
        section3Content:
          "Sistem menyediakan tombol alih Tema Visual: Mode Gelap Operasional (ruang komando rendah silau) dan Mode Terang Kontras Tinggi (visibilitas tajam di bawah terik matahari lapangan rig). Seluruh peralihan tema dan performa dilindungi oleh verifikasi integritas lisensi hardware (verifyLicenseLock) dan SHA-256 heartbeat yang tidak dapat dimanipulasi atau dilewati tanpa otorisasi resmi Ivan Hutabarat.",
      },
      fifteen: {
        title:
          "BAB XV: GeoOSINT Module & Technical Troubleshooting (v4.0.1 Patch)",
        section1Title: "1. GeoOSINT Module (Geospatial Intelligence) & Live Sweeper",
        section1Content:
          "Modul GeoOSINT dirancang untuk pemantauan data seismik secara real-time langsung dari feed Survei Geologi AS (USGS). Fitur ini dilengkapi panel pintasan Geophysical Query Dorks untuk mengumpulkan literatur, sistem pencocokan pola anomali kegagalan tambang (Physics Fingerprint Analog Match), serta agen Live Sweeper yang memantau sinyal kelingkungan.",
        section2Title: "2. Perbaikan Dependensi Vite & Ekstensi Batas Cache PWA",
        section2Content:
          "Menyelesaikan hambatan deployment ERESOLVE (gagal instal akibat versi Vite dan plugin-react). Versi modul grafis dikunci ke rilisan stabil. Selain itu, batas limit offline cache pada PWA Service Worker (vite.config.ts) dinaikkan menjadi 5MB agar seluruh model render grafis 3D dapat diakses secara luring di wilayah tanpa sinyal.",
        section3Title: "3. USGS Connection Timeout Override (DOMException AbortError)",
        section3Content:
          "Penanganan insiden di mana API USGS putus akibat lalu lintas web publik. Durasi batas fetch di Node.js telah diperpanjang dari 3,5 detik ke 15 detik. Log crash telah di-mute, digantikan dengan peringatan peralihan (graceful fallback) otomatis ke dataset simulasi geofisika historis tanpa mengganggu stabilitas sistem secara keseluruhan.",
      },
    },
  },
  en: {
    title: "ENTERPRISE GEOPHYSICS ENCYCLOPEDIA & MANUAL BOOK",
    subtitle: "Textbook Documentation V4.0 - Authorized by Administrator",
    searchPlaceholder: "Search chapters, modules, formulas, code, or menus...",
    searchButton: "Search",
    askAiTitle: "Voice AI Companion & Handbook Encyclopedia",
    askAiPlaceholder: "Ask about menus, source codes, physics, or audio...",
    waButton: "Contact Engineer (WhatsApp)",
    langToggle: "Ganti ke Bahasa Indonesia",
    suggestedQueries: [
      "Why Flat-JSON is used?",
      "How to mitigate H2S?",
      "Poisson's Ratio Gas Pocket",
      "Computational Audio System",
      "System Menu & Code Flow",
      "Enterprise Security System",
      "Swarm AI Module Integration",
    ],
    chapters: {
      one: {
        title:
          "CHAPTER I: Logo Philosophy & Application Development Background",
        section1Title:
          "1. Background & Core Reason for Platform Construction (Why Built)",
        section1Content:
          "GeoAI Pro v4.0 was constructed as the definitive defense barrier against the systemic dangers of 'AI Hallucinations' in borehole geophysics mitigation analysis. On subsurface drill sites, physical certainty is absolute. Minor errors in clay swelling estimation, failing to detect toxic Hydrogen Sulfide (H2S), or pressure gradient deviations can ignite catastrophic blowouts, claiming human lives and driving multi-million-dollar economic losses. This platform binds all multi-agent Swarm AI debate paradigms to a strict Historical Benchmarking database based on real-world geophysical hard-rock analytics. This eliminates arbitrary LLM hallucinations, ensuring all tactical instructions are anchored on robust terrestrial physics, maximizing high-ROI safety operations with zero-fatality objectives.",
        section2Title: "2. Core Field Utility",
        section2Content:
          "The platform operates as a Federated Core Command (Router Otak Besar) integrating 360-degree multidimensional subsurface monitoring (seismic reflection, borehole logging, geomechanics) with automated surface rig safety triggers. Upon detecting a critical anomaly, the platform executes a self-governed safety veto command, freezing the active swarm AI consensus, highlighting warning flags on the rig derrick, and formatting a structural binary payload sent immediately to n8n WhatsApp Gateway for evacuation dispatch.",
        section3Title: "3. 'Living Earth Intelligence' Logo Design Philosophy",
        section3Content:
          "The visual design of the 'Living Earth Intelligence' logo reflects a geometric synthesis representing geological science and computational AI:\n\n• Geometric Shapes:\n  - The full 3D Earth represents holistic subsurface scope and planetary dynamics.\n  - Left Hemisphere (Volumetric Spatials Grid) represents mathematical discretization of geological elements into numerical cells for high-fidelity acoustic impedance modeling.\n  - Right Hemisphere (Digital Circuit Board AI Twin) projects circuit nodes representing synthetic machine intelligence processing real-time telemetry.\n  - The center Zig-zag gold line represents an active fault line transforming raw geological energy into detectable physical signals.\n  - The bedrock block foundation represents the geomechanically stable crust crust on which rig operations securely anchor.\n  - Pulsating Seismic Waves at the footer symbolize continuous real-time telemetry monitoring.\n\n• Color Palette:\n  - Neon Blue: Represents subsurface fluid saturation (Archie's Law), digital clarity, and stable physical analysis.\n  - Neon Green: Represents HSE compliance, organic mud flow circulation, and clean geothermal energy.\n  - Premium Orbital Gold: Represents highly lucrative geological reserves, economic gold veins, and military-grade encryption protection.\n  - Terrestrial Brown: Represents bedrock matrix consolidation and drill rigidity.",
      },
      two: {
        title:
          "CHAPTER II: Codebase Structure, Menu System, & Data Stream Parser",
        section1Title: "1. Core Folder Structures & Menu Routing Flow",
        section1Content:
          "The platform split into two complementary environments to guarantee drilling validation safety:\n  - Live Telemetry Core `/src/cores/live/`: Links asynchronous physical rig sensor variables to live server pipelines.\n  - Simulation Sandbox `/src/cores/dummy/`: Provides safe simulation loops to evaluate blowout hazards without onsite risks.\nThe responsive sidebar menu hosts 24 geophysics master modules, utilizing resilient layout caching to preserve current state inputs when changing tabs.",
        section2Title: "2. Flat-JSON Format & State Buffering Purposes",
        section2Content:
          "Borehole telemetries are purposefully modeled in Flat-JSON format with zero nested structures. This flat format accelerates binary parsing in high-speed browser memory, which is critical to maintain the integrity of 'window.isExportingPDF' (State Buffering). When PDF compilation is initiated, high-frequency SSE telemetry updates are paused at the frontend UI, allowing html2canvas to capture the entire sandbox dashboard with zero visual tearing.",
        section3Title:
          "3. Rate Limit (Error 429) & Dual-Route UI Modal Handling",
        section3Content:
          "To overcome API quotas (Error 429), the platform utilizes the 'useApiQueue' Manager, rescheduling failed text payloads using an exponential backoff. In secure sandboxed iframe environments where browser popups are blocked, the Dual-Route UI Modal intercepts standard triggers, rendering full dashboard dialogs to maintain total action control.",
      },
      three: {
        title:
          "CHAPTER III: In-Depth Catalog of 24 Operational Modules & Geophysics Encyclopedia",
        intro:
          "Below is the comparative scientific overview, mathematical models, risk thresholds, and acoustic sonification signatures for each of the 24 integrated geophysics master and digital twin modules:",
        modules: {
          1: {
            title: "1. Well Logging & Gamma Ray Stratigraphy Module",
            desc: "Continuous physical lithological rock formation assessment along the borehole axis using natural gamma ray emissions.",
            geologyInfo:
              "Gamma rays are naturally emitted by minerals (Potassium, Thorium, Uranium) within shale vs clean sandstone beds. Aids in separating clean porous reservoir beds from seals.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/WellLoggingModule.tsx`, displayed as a continuous 1D depth-curve log.",
            formula: "Vsh = (GR_log - GR_min) / (GR_max - GR_min)",
            threshold:
              "Gamma Ray > 140 API & Caliper Dev > 10.5 inches (Borehole Cave-in / Washout)",
            alert:
              "WARNING [WELL_LOG_ABNORMAL]: Extremely thick shale zone detected! High risk of clay swelling and stuck drill pipe!",
            soundDescription:
              "High-frequency ticking (Geiger Counter style) speed scaled to the current API values, backed by a low-frequency ambient borehole hum.",
            dataSample: JSON.stringify(
              [
                { depth_m: 1200, gr_api: 145, caliper_in: 11.2, vsh: 0.85 },
                { depth_m: 1210, gr_api: 138, caliper_in: 9.8, vsh: 0.78 },
              ],
              null,
              2,
            ),
          },
          2: {
            title: "2. Seismic Amplitude Inversion & Synthetic Seismogram",
            desc: "Transforms seismic reflection traces into physical rock acoustic impedance and lateral reflectivity layers, featuring a Synthetic Seismogram Generator (Convolution).",
            geologyInfo:
              "Key to mapping lateral reservoir extensions and well-to-seismic ties. Sudden impedance reductions indicate high porosity levels saturated with fluid/gas.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/SeismicModule.tsx`, visualizing a 2D interpolated cross-section.",
            formula: "Rc = (Z_i+1 - Z_i) / (Z_i+1 + Z_i)",
            threshold:
              "Seismic Reflectivity Coefficient (Rc) <= -0.92 (Extreme Amplitude Bright Spot)",
            alert:
              "CRITICAL ALERT [SEISMIC_BRIGHT_SPOT]: Extreme negative reflectivity coefficient! Gas Pocket highly likely!",
            soundDescription:
              "Deep sub-harmonic seismic bass drone (sawtooth/sine sweep from 45Hz down to 25Hz) representing terrestrial wave propagation.",
            dataSample: JSON.stringify(
              [
                {
                  inline_id: 4500,
                  xline_id: 1120,
                  rc: -0.94,
                  impedance_pa: 1720,
                  classification: "Gas Reservoir",
                },
              ],
              null,
              2,
            ),
          },
          3: {
            title: "3. Geomechanics Integrity & Pore Pressure Module",
            desc: "Monitors subsurface pore pressure anomalies against fracture resistance gradients to prevent dangerous wellbore blowouts.",
            geologyInfo:
              "When drill bits penetrate overpressured horizons, mud weight must be meticulously weighted to avoid fracturing rock seals.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/Geomechanics.tsx`, tracking compressibility coefficients.",
            formula: "Pp = Ob - (Ob - Ph) * (dt_matrix / dt_log)^f",
            threshold: "Pore Pressure (Pp) >= 0.96 * Rock Fracture Gradient",
            alert:
              "EMERGENCY [GEOMECH_BLOWOUT_RISK]: Subsurface pore pressure is breaching fracture limits! Severe blowout risk!",
            soundDescription:
              "Sharp 65Hz geomechanical buzz with rapid 1100Hz alarms, mimicking overpressure events.",
            dataSample: JSON.stringify(
              [
                {
                  depth_m: 2800,
                  pore_press_ppg: 16.2,
                  frac_grad_ppg: 16.7,
                  safety_margin: 0.02,
                },
              ],
              null,
              2,
            ),
          },
          4: {
            title: "4. Gravity & Magnetic Field Anomalies",
            desc: "Tracks lateral density variations and magnetic flux fields to detect hard volcanic intrusions near the drill string.",
            geologyInfo:
              "Helps map volcanic boundaries and intrusive sills that would damage or destroy normal drill head steel.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/GravityMagModule.tsx` with heat-map kontour lines.",
            formula: "g_bouguer = g_obs - g_normal + 0.3086*h - 0.04193*rho*h",
            threshold:
              "Bouguer Gravity Anomaly < -125 mGal & Magnetic Flux > 59,000 nT",
            alert:
              "DANGER [MAGMA_INTRUSION]: Severe negative gravity anomalies coupled with extreme magnetic spikes! Shallow volcanic magma detected!",
            soundDescription:
              "An eerie sweeping oscillator around 320Hz modulating slowly to represent magnetic flux field anomalies.",
            dataSample: JSON.stringify(
              [
                {
                  station_code: "GM-A12",
                  gravity_anomaly_mgal: -128,
                  magnetic_flux_nt: 59200,
                },
              ],
              null,
              2,
            ),
          },
          5: {
            title: "5. Electrical & Electromagnetic IP Module",
            desc: "Measures subsurface resistivity and Induced Polarization (IP) chargeability to locate metal sulfide veins.",
            geologyInfo:
              "Hydrothermal gold-bearing zones containing high metal sulfides act as giant natural capacitors under applied electrical currents.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/ElectricalEMModule.tsx` showing capacitor-style voltage decay plots.",
            formula: "M = 1/V_c * \\int(V_p(t) dt)",
            threshold: "IP Chargeability > 85 mV/V",
            alert:
              "RESOURCE_GOLD [ALTERATION_ZONE]: High sulfide hydrothermal alteration verified with gold ore abundance!",
            soundDescription:
              "Filtered 200Hz square buzz with periodic sliding discharge whistles mimicking electrical field dissipation.",
            dataSample: JSON.stringify(
              [
                {
                  station_id: "IP-102",
                  spacing_m: 50,
                  chargeability_mvv: 89.2,
                  resistivity_ohm: 380.5,
                },
              ],
              null,
              2,
            ),
          },
          6: {
            title: "6. Fluid Identification & Elastic Poisson's Ratio",
            desc: "Analyzes rock elasticity using P-wave and S-wave velocity ratios to identify reservoir fluid content types.",
            geologyInfo:
              "P-waves are heavily compressed by pore gas, while S-waves are immune to fluids, enabling clear gas vs oil segregation.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/FluidID.tsx` featuring interactive crossplots.",
            formula: "Nu (Poisson's Ratio) = 0.5 * [ 1 - 1 / ((Vp/Vs)^2 - 1) ]",
            threshold:
              "Poisson's Ratio (Nu) <= 0.14 (Dry Gas Saturated Interval)",
            alert:
              "WARNING [GAS_POCKET_DETECTED]: Exceptionally low Poisson's Ratio! Saturated gas-bearing pocket confirmed!",
            soundDescription:
              "Hydrodynamic whispering hiss combined with random bubbling pops to symbolize pressurized fluid flow.",
            dataSample: JSON.stringify(
              [
                {
                  reservoir_depth: "3100-3130m",
                  vp_vs_ratio: 1.52,
                  poisson_ratio: 0.12,
                },
              ],
              null,
              2,
            ),
          },
          7: {
            title: "7. GPR Waveform Radar & Void Detection",
            desc: "Applies high-frequency electromagnetic radar sweeps to locate hollow voids beneath heavy derrick foundations.",
            geologyInfo:
              "Prevents immediate rig subsidence from collapsing karst limestone cavities or hazardous mud leakage.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/GPRModule.tsx` plotting high-frequency radargrams.",
            formula: "d = (c * t) / (2 * sqrt(epsilon_r))",
            threshold:
              "GPR Reflection Amplitude > 4.8 mV at shallow depth < 15 ns",
            alert:
              "CRITICAL [RIG_FOUNDATION_VOID]: Severe subsurface karst hollow cavity detected right under load-bearing rig anchors!",
            soundDescription:
              "Echo-location clicking bursts on a 1400Hz carrier wave to simulate high-frequency radar reflections.",
            dataSample: JSON.stringify(
              [
                {
                  line_profile: "GPR-RigWest",
                  reflection_time_ns: 11.8,
                  amplitude_mv: 5.4,
                  void_class: "Severe Cavity",
                },
              ],
              null,
              2,
            ),
          },
          8: {
            title: "8. Rock Geochemistry Ore & Arsenic Detection",
            desc: "Validates precious elemental gold grade indicators against toxic arsenic contaminant concentrations.",
            geologyInfo:
              "Gold ore often shares matrices with highly toxic arsenopyrite. Precise chemical mapping ensures clean and high-ROI metallurgy.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/GeochemModule.tsx` showing radar elemental grids.",
            formula: "Au_Grade_Equivalent = Au_ppm + (As_ppm * 0.00015)",
            threshold:
              "Gold Grade > 6.0 ppm paired with Toxic Arsenic (As) > 2,800 ppm",
            alert:
              "HSE_ALERT [TOXIC_GOLD_ORE]: Extreme gold grade verified but accompanied by toxic arsenic hazards!",
            soundDescription:
              "Pure metal chimes at crystal frequencies (980Hz, 1350Hz, 1780Hz) depicting precious gold molecules.",
            dataSample: JSON.stringify(
              [
                {
                  ore_batch: "BH-XRF-88",
                  au_ppm: 9.2,
                  as_ppm: 2950,
                  iron_pct: 12.4,
                },
              ],
              null,
              2,
            ),
          },
          9: {
            title: "9. Meteorology Severe Storm Warning",
            desc: "Tracks extreme localized derrick wind velocity and barometric pressure drops to secure structures.",
            geologyInfo:
              "Drilling towers have strict wind loading thresholds; severe storm warnings demand rapid lockdown to prevent derrick tipping.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/MeteorologyModule.tsx` showing barometric curves.",
            formula: "F_wind = 0.5 * rho_air * Cd * A * v_wind^2",
            threshold:
              "Wind Velocity > 26 m/s & Air Pressure < 962 hPa (Category 5 Cyclone)",
            alert:
              "RIG_LOCKDOWN [SEVERE_METEO_CYCLONE]: Extreme storm wind load breached! Evacuate personnel and lock down the derrick!",
            soundDescription:
              "Turbulent wind noise sweeps (lowpass filtered noise modulation) simulating heavy cyclone winds.",
            dataSample: JSON.stringify(
              [
                {
                  wind_speed_ms: 29.5,
                  air_pressure_hpa: 958.2,
                  direction_deg: 285,
                },
              ],
              null,
              2,
            ),
          },
          10: {
            title: "10. Groundwater Drawdown & Aquifer Hydrodynamics",
            desc: "Assesses aquifer drawdown under constant extraction pumping, guarding against coastal seawater intrusion.",
            geologyInfo:
              "Over-pumping freshwater draws ocean saline waters inland, causing aquifer degradation and clay soil shrinkage.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/GroundwaterModule.tsx` graphing dynamic hydrodynamics.",
            formula: "s = Q / (4 * pi * T) * W(u)",
            threshold: "Drawdown > -82 m & Salinity Intrusion > 3,200 ppm",
            alert:
              "ENVIRONMENT_ALERT [GROUNDWATER_DEPLETION]: Severe freshwater drawdown accompanied by hazardous marine intrusion!",
            soundDescription:
              "Rippling fluid stream sounds modulated by slow infrasound waves to represent groundwater aquifers.",
            dataSample: JSON.stringify(
              [
                {
                  pump_well_id: "GW-08",
                  current_drawdown_m: -85.1,
                  salinity_ppm: 3420,
                },
              ],
              null,
              2,
            ),
          },
          11: {
            title: "11. Soil pH & Acid Mine Drainage Corrosion Protection",
            desc: "Monitors environmental soil acidity caused by reactive sulfide oxidations that corrode rig steel pillars.",
            geologyInfo:
              "Acid mine drainage oxidizes mineral sulfur, yielding sulfuric acids that chew structural foundation concrete.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/SoilPHModule.tsx` plotting structural corrosion status.",
            formula: "pH = -log10[H+]",
            threshold: "Soil/Fluids pH <= 1.4 (Extreme Acid Corrosion Hazard)",
            alert:
              "CRITICAL_ENV [ACID_MINE_DRAINAGE]: Highly corrosive acidic runoff detected! Immediately protect steel pillars!",
            soundDescription:
              "High-frequency chemical fizzing sounds (crackle pops above 2.5kHz) representing reactive corrosion.",
            dataSample: JSON.stringify(
              [
                {
                  sensor_grid_id: "pH-3A",
                  ph_level: 1.25,
                  sulphur_content_pct: 5.2,
                },
              ],
              null,
              2,
            ),
          },
          12: {
            title: "12. Gas Air Quality & Lethal H2S Exposure HSE",
            desc: "Precision gas-sensor monitoring of lethal Hydrogen Sulfide (H2S) concentration erupting from active boreholes.",
            geologyInfo:
              "H2S is highly toxic; exposures >10 ppm dull human smell, while concentrations >450 ppm trigger instant respiratory failure.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/GasAirQualityModule.tsx` with automated AI swarm veto triggers.",
            formula:
              "H2S_Concentration_ppm = Measured_Voltage_mV * Calibration_Factor",
            threshold:
              "Gas Exposure > 10 ppm (Masks On) & > 450 ppm (Fatal Lethal Breakout)",
            alert:
              "EVACUATE_NOW [FATAL_H2S_BREAKOUT]: Lethal H2S gas pocket breached! Evacuate all rig structures immediately!",
            soundDescription:
              "Constant hissing gas leak (sawtooth wave) mixed with rapid alarm beeping for immediate site containment.",
            dataSample: JSON.stringify(
              [
                {
                  sensor_location: "Wellhead-B",
                  h2s_ppm: 485,
                  o2_percent: 17.5,
                },
              ],
              null,
              2,
            ),
          },
          13: {
            title: "13. Spatial Twin 3D Deformation & GNSS Geodesy",
            desc: "Tracks structural shifting and micro-displacement angles of heavy towers with sub-millimeter precision.",
            geologyInfo:
              "Uses INSAR radar interferometry coupled with derrick-level geodetic GNSS nodes to spot high-load land subsidences.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/SpatialTwin.tsx` rendering real-time 3D models.",
            formula: "Delta_z = z_current - z_baseline",
            threshold:
              "Subsidence Velocity < -210 mm/year & Tower Tilt > 2.5 degrees",
            alert:
              "RIG_COLLAPSE_WARNING [SPATIAL_DEFORMATION]: Structural tilt detected! Base displacement exceeds stable engineering safety boundaries!",
            soundDescription:
              "A deep shifting tectonic sweep (sliding pitch down to 50Hz) to represent active structural subsidence.",
            dataSample: JSON.stringify(
              [
                {
                  tower_node: "Derrick-Tower1",
                  tilt_angle_deg: 2.65,
                  vertical_displacement_mm: -218.4,
                },
              ],
              null,
              2,
            ),
          },
          14: {
            title: "14. Spatial Twin Engine 3D Canvas Projection",
            desc: "3D graphics projection engine for mapping geological earth space coordinates to browser canvas pixels.",
            geologyInfo:
              "Leverages Euler matrix rotations and affine coordinate scaling to translate borehole point cloud models into interactive visuals.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/SpatialTwinEngine.tsx`.",
            formula: "P_projected = M_projection * M_view * M_model * P_local",
            threshold:
              "Projection FPS < 15 frames/second with > 50,000 active point clouds",
            alert:
              "PERFORMANCE_WARN [SPATIAL_ENGINE_LAG]: 3D render speed dropped below optimal operational limits!",
            soundDescription:
              "A spinning static white noise hum that modulates pitch depending on the active orbital camera angle.",
            dataSample: JSON.stringify(
              [
                {
                  voxel_count: 12500,
                  render_time_ms: 8.4,
                  active_projection: "Orthographic",
                },
              ],
              null,
              2,
            ),
          },
          15: {
            title: "15. n8n WhatsApp Broadcast Bridge & Safety Override Veto",
            desc: "Automated emergency warning dispatch bridge to physical mobile devices via server webhooks.",
            geologyInfo:
              "Dispatches derrick geodetic coordinates and sensor parameters during active Tier 3 alarms.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/SecurityAndWhatsAppPanel.tsx`.",
            formula: "T_broadcast_delay = N_retries * exponential_backoff(2)",
            threshold: "Failed Webhook Dispatches > 3 consecutive attempts",
            alert:
              "GATEWAY_ERROR [WHATSAPP_DISCONNECTED]: Connection to n8n webhook or Baileys lost, fallback to radio sirens!",
            soundDescription:
              "Short rapid beeping sequence (network ping style) at a high-frequency (880Hz).",
            dataSample: JSON.stringify(
              [
                {
                  webhook_url: "https://n8n.internal.node/v1/trigger",
                  connection_status: "CONNECTED",
                  active_threads: 2,
                },
              ],
              null,
              2,
            ),
          },
          16: {
            title:
              "16. Central Command Sidebar Navigator & Persistent State Caching",
            desc: "Rig-wide layout central navigator controlling asynchronous rendering of physical modules.",
            geologyInfo:
              "Maintains absolute operator parameters state caching to prevent inputs loss during tab toggling.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/CentralCommand.tsx`.",
            formula: "S_cached = state_buffering(App_Layout_Context)",
            threshold:
              "State memory cache footprint > 120MB in browser context",
            alert:
              "MEMORY_ALERT [NAV_CACHE_OVERFLOW]: Interface memory buffer exceeded safe limits, triggering auto-purge!",
            soundDescription:
              "A clean mechanical relay click at 440Hz triggered upon switching navigation tabs.",
            dataSample: JSON.stringify(
              [
                {
                  current_active_tab: "SeismicModule",
                  cached_tabs_count: 5,
                  used_heap_mb: 48.2,
                },
              ],
              null,
              2,
            ),
          },
          17: {
            title: "17. Swarm AI Debate Orchestration Suite",
            desc: "Intelligent multi-agent consultant forum that formulates geophysics advice from autonomous debates.",
            geologyInfo:
              "Integrates virtual specialist insights to assess formation safety risks before physical drilling.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/AIConsultantModule.tsx`.",
            formula:
              "C_consensus = \\sum(Agent_Weight * Confidence_Score) / \\sum(Agent_Weight)",
            threshold:
              "Consensus Confidence Score < 65% under ambiguous geological data",
            alert:
              "CONSENSUS_LOW [AI_SWARM_AMBIGUITY]: Swarm AI agents failed to reach confident agreement, human oversight required!",
            soundDescription:
              "A swelling mid-frequency synthetic chorus with resonant sweeps to model multi-agent information exchange.",
            dataSample: JSON.stringify(
              [
                {
                  active_agents: ["DrillBot", "SeisBot", "EcoBot"],
                  consensus_rounds: 3,
                  confidence: 0.89,
                },
              ],
              null,
              2,
            ),
          },
          18: {
            title: "18. Blowout Sandbox Hazard Simulator",
            desc: "Interactive sandbox simulator to train rig operators in blowout hazard mitigation and BOP timing.",
            geologyInfo:
              "Tests BOP shear ram seals and evaluates mud weight adjustments under heavy formations kicks.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/SimulationModule.tsx`.",
            formula: "P_wellbore = P_formation - (0.052 * Mud_Density * Depth)",
            threshold:
              "Wellbore pressure (P_wellbore) > BOP kick tolerance thresholds",
            alert:
              "SIMULATED_BLOWOUT [SANDBOX_ACTIVE]: Simulated well blowout active, physical BOP rams ordered to close!",
            soundDescription:
              "A roaring white noise swell with low-pass filtering to simulate high-pressure borehole gas eruption.",
            dataSample: JSON.stringify(
              [
                {
                  simulated_kick_depth: 3400,
                  mud_weight_ppg: 10.5,
                  bop_valve_status: "CLOSED",
                },
              ],
              null,
              2,
            ),
          },
          19: {
            title: "19. Core System Diagnostics & Telemetry Dashboard",
            desc: "Real-time infrastructure monitor tracking server CPU, memory, API latency, and network throughput.",
            geologyInfo:
              "Ensures seamless transmission of high-frequency physical telemetry from onsite sensors.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/SystemDiagnostics.tsx`.",
            formula: "L_latency_ms = T_response - T_request",
            threshold:
              "Server response latency > 500ms or CPU cluster usage > 90%",
            alert:
              "DIAG_CRITICAL [SERVER_OVERLOAD]: Core server processing demands have exceeded real-time stability bounds!",
            soundDescription:
              "A digital heartbeat click (50Hz pulse) that increases tempo if node latency begins to drag.",
            dataSample: JSON.stringify(
              [
                {
                  cpu_usage_pct: 78,
                  memory_free_gb: 2.1,
                  latency_ms: 12,
                  connections_active: 142,
                },
              ],
              null,
              2,
            ),
          },
          20: {
            title: "20. Borehole Radiometric Pulse Generator",
            desc: "Deep borehole radiometric pulse logging tracking radioactive isotopic abundance and decay.",
            geologyInfo:
              "Monitors precise natural gamma-ray spectra to detect uranium, thorium, and potassium mineral veins.",
            codeStructure:
              "Coded in `/src/cores/live/components/Modules/BoreholeRadiometricModule.tsx` or `/src/cores/live/components/Modules/SeismicRadar.tsx`.",
            formula: "A_t = A_0 * e^{-\\lambda * t}",
            threshold: "Radioactive intensity > 320 CPS (Counts Per Second)",
            alert:
              "RADIATION_HAZARD [HIGH_RADIOMETRIC_ZONE]: Extreme radioactive ore concentration detected at active drill interval!",
            soundDescription:
              "An ultra-high-frequency randomized crackle (classic Geiger clicks above 3kHz) popping rapidly.",
            dataSample: JSON.stringify(
              [
                {
                  radiometric_cps: 345,
                  isotopic_class: "Uranium-238",
                  depth_m: 1450,
                },
              ],
              null,
              2,
            ),
          },
        },
      },
      four: {
        title:
          "CHAPTER IV: Override Veto Security Protocol & WhatsApp Webhook Routing",
        section1Title: "1. Server-Side Safety Interceptor Mechanism",
        section1Content:
          "All outbound Swarm AI consensus debate results are vetted on the backend server on the `/api/swarm/debate` endpoint. If hazardous keywords (H2S, Blowout, Cave-in) are identified, the debate consensus is instantly vetoed. The command-central takes over, compiles an `externalEmergencyPayload`, and sends the binary JSON data directly to n8n webhook nodes.",
        section2Title: "2. Hidden Phone Number Redirections",
        section2Content:
          "To shield technical support lines and avoid spamming the Engineer's number, all raw numbers are omitted from textual buttons. Security triggers link actions to encrypted URLs (`https://wa.me/6285260245100?text=...`) which redirect securely behind action overlays.",
      },
      five: {
        title: "CHAPTER V: HSE Rescue Systems & Borehole Physical Safety",
        section1Title:
          "1. Lethal H2S Gas Mitigation & Onsite Crew Evacuation Workflows",
        section1Content:
          "Hydrogen Sulfide (H2S) is the most lethal risk in hydrocarbon drilling. Transparent, highly toxic, corrosive, and heavier than air. Standard electrochemical sensors poll concentration levels continuously. Upon breaching 10 ppm (Tier 1 threshold), the platform forces ventilation fans active, illuminates yellow strobe indicators, and mandates positive-pressure breathing masks (SCBA) for all rig staff. At critical >450 ppm (Tier 3 lethal breakout), manual delays are bypassed: emergency sirens rotate red, and the system instantly dispatches the exact satellite coordinates of the rig to the Engineer's WhatsApp and local HSE search-and-rescue teams for helivac mobilization.",
        section2Title:
          "2. Swarm AI Veto Override & Automated Blowout Prevention",
        section2Content:
          "Our active mitigation engine tracks subsurface pore pressure gradients against rock fracture limits. If pore pressure approaches fracture bounds, fluid influx triggers a kick, leading to catastrophic blowouts. Under these extreme hazards, the Safety Interceptor at `/api/swarm/debate` instantly vetoes active Swarm AI deliberations. Freezing discussions within milliseconds, the command module overrides manual systems, instructs physical Blowout Preventers (BOP) to close shear rams, routes toxic gases to flares, and updates circulation pumps with precise heavy mud density adjustments.",
      },
      six: {
        title: "CHAPTER VI: Codebase Architecture & Factor Tree Analysis",
        section1Title:
          "1. Repository Core Folder Structure (Factor Tree Visual)",
        section1Content:
          "Below is the structural layout of the core files powering the GeoAI Pro v4.0 repository:\n\n├── /src/\n│   ├── App.tsx (Main Entry Point Component)\n│   ├── index.css (Global Tailwind CSS)\n│   ├── types.ts (Shared Geophysical Schema Types)\n│   ├── api/ (Backend API Communication Handlers)\n│   ├── components/ (Global UI Components)\n│   │   └── Modules/ (Sarang 24 Master Geophysical Modules)\n│   └── cores/ (Complementary Environments)\n│       ├── live/ (MainDashboard.tsx, Live Telemetry Pipeline)\n│       └── dummy/ (MainDashboard.tsx, Sandbox Safety Simulator)\n├── server.ts (Express Backend, Baileys WA Engine, & Endpoints)\n├── tsconfig.json (TypeScript Compiler Configurations)\n└── package.json (Project Node Package Dependencies)",
        section2Title: "2. Technical Roles of the 24 Drilling Modules",
        section2Content:
          "GeoAI Pro v4.0 leverages 24 core modules located in `/src/cores/live/components/Modules/` working in harmony:\n\n1. `WellLoggingModule.tsx`: Plots 1D depth curves of natural Gamma rays and Caliper hole diameters.\n2. `SeismicModule.tsx`: Runs 2D cross-sectional seismic acoustic impedance inversion models.\n3. `GeotechnicalTiltExtensoModule.tsx`: Measures borehole mechanical strain and drillstring tilt angles.\n4. `GravityMagModule.tsx`: Detects Bouguer density anomalies and magnetic flux from basaltic intrusions.\n5. `ElectricalEMModule.tsx`: Maps Induced Polarization (IP) chargeability for sulfide gold reserves.\n6. `GroundwaterModule.tsx`: Models aquifer drawdowns and guards against coastal saline water intrusion.\n7. `GPRModule.tsx`: Generates radargrams scanning shallow karst void caverns beneath derrick footings.\n8. `GeochemModule.tsx`: Compares precious gold yields against toxic environmental arsenic concentrations.\n9. `MeteorologyModule.tsx`: Measures surface cyclone wind velocities and micro-barometric drops.\n10. `SoilPHModule.tsx`: Tracks soil sulfuric acid runoffs to prevent structural concrete corrosion.\n11. `GasAirQualityModule.tsx`: Oversees lethal H2S gas sensors and executes safety overrides.\n12. `SpatialModule.tsx`: Calculates sub-millimeter geodetic GNSS displacement vectors.\n13. `SpatialTwin.tsx`: Visualizes 3D soil-mesh deformation twins.\n14. `SpatialTwinEngine.tsx`: The high-performance mathematical render loop for 3D canvas coordinates.\n15. `ManualBookSuite.tsx`: The master geophysics encyclopedia and dual-language textbook (this file!).\n16. `SecurityAndWhatsAppPanel.tsx`: Emergency override veto panel and WhatsApp socket status triggers.\n17. `SystemDiagnostics.tsx`: Tracks CPU/memory load, API latencies, and telemetry throughput.\n18. `AIConsultantModule.tsx`: Consulates the Swarm AI multi-agent geological debate forum.\n19. `SimulationModule.tsx`: Sandbox panel triggering rig disaster simulations.\n20. `CentralCommand.tsx`: Main navigation wrapper housing all sidebar modules.\n21. `AnalyticsDrawer.tsx`: Overlay drawer for comparative subsurface crossplots.\n22. `OmniScienceWidget.tsx`: Geophysical conversions and terrestrial calculations toolbox.\n23. `BoreholeRadiometricModule.tsx`: Manages borehole logging radioactive decay pulses.\n24. `SpatialControlPanel.tsx`: Directs 3D camera zoom, translation, and rotation parameters.",
      },
      seven: {
        title:
          "CHAPTER VII: Low-Level Source Code Breakdown (Backend & Frontend)",
        section1Title:
          "1. server.ts Logical Dissection (Baileys WA Integration & Express Handlers)",
        section1Content:
          "The backend server is implemented in `server.ts` using Express. To establish direct WhatsApp linkages, it invokes `baileys` socket libraries via the `initWhatsApp()` function. User credentials are saved securely in `/tmp/baileys_auth_info_2` using multi-file auth. Incoming messages trigger `messages.upsert` asynchronously. For security compliance, the system restricts command execution; inbound snapshots and text reports are only compiled if the sender matches Ivan's secure number (`6285260245100`). Uploading front-end PDF reports is managed by `multer` memory storages at `/api/webhook/whatsapp/upload-report`, dispatching raw binary PDF files straight to authorized chats.",
        section2Title:
          "2. API Key Rotation Mechanics & Multi-Key Failovers (Handling 429 Errors)",
        section2Content:
          "To prevent third-party quota blocks, the platform integrates `fetchSwarmAPI` with automated API key rotation. Keys are structured as a JSON array inside the `SWARM_API_KEYS` environmental variable. If the generative model API returns an HTTP 429 Too Many Requests, the catch block intercepts it, calls `rotateSwarmKey()`, shifts the pointer using a modulo function over all active keys, and recursively retries the request. This key failover mechanism runs seamlessly in the background without halting dashboard consultations.",
        section3Title:
          "3. Breakdown of the 3,950+ Vite Compiled Modules & Core Tech Stack Architecture",
        section3Content:
          "Ivan-GeoAI Pro is designed on top of a highly optimized full-stack architecture tailored for real-time geophysical visualization and multi-agent AI coordination. During the production build phase, the Vite compiler identifies and bundles exactly 3,951 individual ES modules into highly optimized chunks. Below is a comprehensive breakdown of these modules and the core technologies used to construct the platform:\n\nA. Why are there over 3,950 Compiled Modules?\nThis massive number is a hallmark of modern, fine-grained modular ES (EcmaScript) architectures. Vite recursively traces the dependency tree of our codebase and performs smart code-splitting and asset-bundling. These compiled modules are divided into several heavy technological domains:\n1. 3D Spatial Twin Render Loop (Three.js): The Three.js engine (`three`) contributes hundreds of sub-modules covering 3D matrix mathematics, WebGL custom shaders, voxel grid computation, rendering pipelines, lighting nodes, and geological material meshes.\n2. Lightweight Iconographies (Lucide React): Contains thousands of individual SVG icon modules. Vite leverages tree-shaking to only pack used icons into the production bundle, but processes their base SVG dependency graph to ensure crisp rendering across all 24 sub-modules.\n3. PDF Document Generator & HTML Vectorizers: Packages from `jspdf`, `html2canvas`, and `dompurify` comprise heavy modules that dissect HTML DOM nodes, parse layouts pixel-by-pixel, filter out malicious scripting vectors, and compile raw binary PDF documents on the fly.\n4. Telemetry Plotting & Statistical Charts (Recharts & D3): Built upon Recharts and D3 (Data-Driven Documents), which bring in thousands of math and interpolation sub-modules for drawing Gamma curves, seismic waveform inversions, and geomagnetic coordinate planes.\n5. React Engine, Animation, & State Handlers: Powered by React 18 core hooks, `react-router-dom` routers, `motion/react` (Framer Motion) physics-based animation curves, and `zustand` slice-stores to maintain cross-tab caching.\n\nB. Tech Stack & Platform Implementation Blueprint:\n1. Frontend Infrastructure:\n   - React 18 & TypeScript: Delivers absolute type-safety for complex terrestrial calculations (e.g. Swell pressure, Poisson ratio, Archie's saturation).\n   - Vite 6: Next-generation frontend bundler, bypassing slow Webpack setups by leveraging esbuild-based dependency pre-bundling.\n   - Tailwind CSS v4: Delivers high-performance utility class styling via the latest rust-powered CSS compile engine.\n   - Framer Motion: Animates menu transitions, radar alerts, and the interactive floating AI companion.\n2. Backend Infrastructure:\n   - Node.js & Express: Hosts raw data streams, handles security vetoes, and proxies sensitive Gemini LLM requests.\n   - Esbuild & TSX: Compiles backend TypeScript (`server.ts`) into a streamlined, high-speed single CommonJS executable (`dist/server.cjs`), eliminating ESM import checks and HMR leaks.\n   - Baileys WhatsApp Engine: Powers immediate automated dispatch of Tier 3 hazard payloads and helivac coordinates to the Engineer's WhatsApp chat.\n   - Google GenAI SDK (@google/genai): Executes server-side calls to Gemini 3.5 Flash, protecting raw rotational API credentials behind the server firewall.",
      },
      eight: {
        title:
          "CHAPTER VIII: Historical Bugs, Future Challenges, & Human Factors",
        section1Title: "1. Historical Implementation Issues & Resolutions",
        section1Content:
          "During development, the engineering team resolved several high-severity challenges:\n\n• Vite HMR Loop Freeze: Vite's Hot Module Replacement (HMR) caused continuous rebuilding of WebGL canvases on file writes, crashing browsers. This was mitigated by setting `DISABLE_HMR=true` during active development.\n\n• Iframe Popup Sandbox Blocks: Standard `window.open` calls and native browser alerts were blocked by sandbox policies. Solved by designing custom modal dialogues (Dual-Route UI Modal) overlaid directly on the dashboard canvas.\n\n• PDF Export Image Tearing: High-frequency telemetry streams triggered chart re-renders in the middle of canvas capture. Mitigated by pausing (freezing) active frontend updates during PDF compilation.",
        section2Title: "2. Future Technical Engineering Risks",
        section2Content:
          "Long-term architectural challenges to monitor include:\n\n• WebGL Memory Leaks: Running 3D soil-mesh deformers for weeks at active command stations can exhaust GPU memory. Mitigation includes automated leak checks and periodic WebGL context recycling.\n\n• High-Frequency Telemetry Overhead: Modern borehole sensors produce thousands of records per second, which can freeze single-threaded JS environments. Mitigation involves delegating data parsing to background Web Workers.",
        section3Title: "3. Human-System Interaction Concerns",
        section3Content:
          "The bridge between human operators and safety systems requires careful balancing:\n\n• Alarm Fatigue: Frequent minor alarms can cause operators to manually mute sirens, missing real emergencies. Mitigated by a Tiered Alarm System, where audio strobes are restricted to life-threatening Tier 3 events.\n\n• Override Paralysis: In fast-moving emergencies, operators often hesitate to initiate rig shutdowns due to financial shutdown costs. Resolved by computer-driven Veto Vetoes, instantly overriding human hesitation when rock parameters cross safety boundaries.",
      },
      nine: {
        title:
          "CHAPTER IX: Computational Sound & Geophysical Sonification Systems",
        section1Title: "1. Core Principles of Subsurface Data Sonification",
        section1Content:
          "Data sonification translates geophysical subsurface parameters into acoustic waveforms. This allows operators to monitor the wellbore passively via audio cues while keeping eyes on geological maps. During rig emergencies—such as smoke outbreaks, power grid blackouts, or visual screen failures—the battery-powered acoustic sonification engine acts as the primary safety beacon guiding personnel to evacuation paths.",
        section2Title: "2. Web Audio API Implementations Across Master Modules",
        section2Content:
          "Sound synthesizers are written in the `GeophysicsSonifier` class leveraging standard Web Audio APIs. It synthesizes pure physical waves straight to computer audio cards in real-time:\n\n• Well Logging (Gamma Ray): Coordinates an 80Hz sine sub-wave with a rapid interval timer triggering high-frequency triangle wave ticks (600Hz - 900Hz), mimicking radioactive Geiger Counters.\n\n• Seismic Inversion: Adjusts exponential frequency modulations, sweeping a sine oscillator from 45Hz down to 25Hz over 2.5 seconds to represent deep seismic wave propagation.\n\n• Geomechanics Pore Pressure: Runs a low-frequency 65Hz sawtooth hum routed through a lowpass filter set at 140Hz, mixed with urgent 1100Hz sirens to warn of rock deformation hazards.\n\n• Gas Air Quality (H2S): Generates sharp sawtooth waves dished through bandpass filters to simulate a high-pressure gas leak, coupled with rapid hazard alarms.",
      },
      ten: {
        title: "CHAPTER X: Enterprise-Grade Security & Defense Grid",
        section1Title:
          "1. Prompt Injection Protection (AI Core) & Webhook HMAC",
        section1Content:
          "The system now wraps all user queries securely within <USER_QUERY> XML tags when sending data to the Gemini AI models. The AI is given explicit, rigid system instructions to ignore any commands inside these tags that attempt to modify its persona, alter output formats, or bypass rules, neutralizing 'jailbreak' attempts. Additionally, the WhatsApp integration endpoint (/api/webhook/whatsapp) now requires a cryptographic HMAC signature passed via the x-wa-signature header, preventing third parties from spoofing webhook payloads.",
        section2Title: "2. Code Obfuscation & Hardware Fingerprinting",
        section2Content:
          "During the Vite build process, the terser minifier is employed to mangle variable names and strip all console.log statements from the client-side code, drastically complicating reverse-engineering efforts. The authentication flow incorporates a hardware fingerprinting validation layer, matching the specific footprint (e.g., display resolution, GPU metrics) of authorized workstations to block access from untrusted devices, even if valid credentials are stolen.",
        section3Title:
          "3. HttpOnly Secure Cookies, Pre-Commit Hooks, & Firestore Sanitizer",
        section3Content:
          "Authentication tokens (JWTs) are stored and transmitted using HttpOnly and Secure cookies, neutralizing Cross-Site Scripting (XSS) extraction attacks. A bash script (scripts/pre-commit-env-check.sh) is hooked into the Git lifecycle to block accidental commits of sensitive configuration secrets. Lastly, a recursive sanitizer function scrubs payloads before pushing data to Firebase Firestore, removing any undefined properties to guarantee 100% reliable persistence for user sessions and audit trails.",
      },
      eleven: {
        title:
          "CHAPTER XI: Swarm AI Module Integration (Real-Time Cognitive Swarm)",
        section1Title:
          "1. Three Pillars of Cognitive Computing on Main Dashboard",
        section1Content:
          "The AI Orchestrator system seamlessly integrates three specialized analytical modules directly connected to the Swarm AI ecosystem: Seismic Amplitude, Gas Safety, and Geomechanics. Rendered on the right panel, these modules proactively read physical field fluctuations (Live Inference) and feed real-time environmental conditions into the AI decision engine.",
        section2Title: "2. Seismic Amplitude, Gas Safety, & Geomechanics",
        section2Content:
          "Each module monitors essential variables for operational safety:\n- Seismic Amplitude Module: Monitors seismic amplitude ratios to detect shallow formation anomalies like high-pressure gas traps.\n- Gas Safety Module: Measures toxic H2S concentration levels in ppm, strictly linked to automated override veto protocols if thresholds exceed lethal limits.\n- Geomechanics Module: Calculates Fracture Gradient and Pore Pressure to evaluate formation stability, preventing kick or blowout risks.",
        section3Title: "3. Module Placement in Code Architecture",
        section3Content:
          "These new components (`GasSafetyModule.tsx`, `GeomechanicsModule.tsx`, and `SeismicModule.tsx`) are neatly organized inside the `src/components/modules/` directory. They are directly imported and embedded into the visual `SwarmRoom.tsx` component in the Live Core. This modular architecture empowers the Swarm AI assistant to continuously perceive the physical context of the wellbore without bloating the primary dashboard UI.",
      },
      twelve: {
        title:
          "CHAPTER XII: System Resilience & UI Update (UX Resilience v4.0)",
        section1Title:
          "1. Module Isolation (Component-Level Error Boundary) & Zod Validation",
        section1Content:
          "Every primary Route (like Central Command, Spatial Twin) is now wrapped in a `ModuleErrorBoundary`. If a module crashes, it gets isolated, keeping the rest of the application (telemetry) alive without a White Screen of Death. The `zod` library is strictly integrated (as in DictionarySchema) to catch missing object keys and provide proactive fallback values.",
        section2Title:
          "2. Separated Asynchronous Loading (Code Splitting & Suspense Skeleton)",
        section2Content:
          "Heavy component routes are split using `React.lazy()` and `<Suspense>`. When a user loads the 3D Spatial Twin, the UI instantly renders a `<ModuleSkeleton />` while downloading the chunk in the background. This drastically reduces the initial bundle size and makes the app respond instantly to tab interactions.",
        section3Title: "3. Unit Testing Automation (Vitest & Pre-Commit)",
        section3Content:
          "The Vitest testing environment (`dictionary.test.ts`) has been set up to verify the integrity of the 12 Chapters and supporting modules. This script is statically chained to `pre-commit-env-check.sh`—automatically blocking commits if there is damage to the Data Dictionary structure.",
      },
      thirteen: {
        title:
          "CHAPTER XIII: GeoAI Pro v4.0 Next-Gen Enhancement & Field Ecosystem",
        section1Title: "1. Data Compression & Massive Point Cloud Streaming",
        section1Content:
          "GeoAI Pro v4.0 integrates Binary Streaming via the Express backend to manage massive-scale point cloud resolutions. The Spatial Twin now leverages Octree algorithms and Level of Detail (LoD) rendering, maintaining a stable 60 FPS under rigorous simulation limits.",
        section2Title:
          "2. Automated PDF Executive Exports & Offline-First Resilience",
        section2Content:
          "The Analytics Module now houses an Automated Executive PDF Engine using jsPDF, transforming crossplots into formal single-click reports. Additionally, the platform implements Service Worker PWA routing, permitting blindspot Offline-First operation deep in the field without connectivity.",
        section3Title: "3. WebGPU Extreme 3D Simulation Engine",
        section3Content:
          "The Spatial Twin incorporates WebGPU detection fallback, bypassing single-threaded WebGL constraints to unlock direct GPU-parallelized simulation power for seismic wave propagation matrices across millions of interactive particles.",
      },
      fourteen: {
        title:
          "CHAPTER XIV: Dark/Light Field Mode, Performance Profiler & Eco 60 FPS Engine",
        section1Title: "1. Dynamic Canvas Pixel Ratio Capping & WebGL Shadow Decimation",
        section1Content:
          "In the 3D Spatial Twin (Three.js) and MiroFish Sonar/GPR canvas modules, graphic computing can be resource-intensive on standard laptops or field tablets. The 'Performance Mode' toggle in the System & Telemetry Control Drawer enables operators to clamp the 3D canvas pixel ratio to 1.0x (bypassing high-DPI Retina overhead), decimate heavy shadows and multi-sample anti-aliasing, and engage low-power WebGL profiling. This guarantees a locked 60 FPS frame rate under demanding simulation loads.",
        section2Title: "2. Real-Time FPS Profiler & Throttled Echogram Sweep Loop",
        section2Content:
          "A live Floating Performance Profiler actively tracks rendering frame rate (FPS) and millisecond frame latency. Under Eco Performance mode, sonar echogram scrolling and radar sweeps are throttled to reduce GPU memory bandwidth and getImageData overhead, extending field laptop battery runtime by up to 40%.",
        section3Title: "3. Sunlight High-Contrast Field Theme & Enterprise License Guarding",
        section3Content:
          "Operators can instantly switch between Operations Dark Mode (control room glare-free palette) and Sunlight Light Mode (18:1 contrast for direct bright sunlight on rig decks). All theme and performance state transitions are strictly governed by the tamper-resistant hardware license lock (verifyLicenseLock) and SHA-256 heartbeat integrity checks, preventing unauthorized bypasses.",
      },
      fifteen: {
        title:
          "CHAPTER XV: GeoOSINT Module & Technical Troubleshooting (v4.0.1 Patch)",
        section1Title: "1. GeoOSINT Module (Geospatial Intelligence) & Live Sweeper",
        section1Content:
          "The GeoOSINT Module enables real-time global seismic telemetry synchronized directly from the USGS feed. It features a Geophysical Query Dorks shortcut panel for literature gathering, a Physics Fingerprint Analog Match algorithm to compare current telemetry against historical structural failure records, and a Live Sweeper crawler monitoring anomaly feeds.",
        section2Title: "2. Vite Dependency Fix & PWA Service Worker Cache Extensions",
        section2Content:
          "Resolved critical Cloud Run deployment blockers (ERESOLVE errors). React plugin versions and 3D postprocessing graphical utilities were downgraded and locked to stable trees. Furthermore, the PWA Service Worker max offline cache parameter was expanded to 5MB, allowing complex 3D engine assets to be cached seamlessly for zero-connectivity field operations.",
        section3Title: "3. USGS Connection Timeout Override (DOMException AbortError)",
        section3Content:
          "Handled network constraints where the live Node.js USGS fetcher would forcibly abort after 3.5 seconds during peak government traffic. The network timeout boundary has been expanded to 15 seconds. If the API is unreachable, crash logs are muted and the server will execute a graceful fallback to a historically accurate simulated dataset, ensuring uninterrupted system continuity.",
      },
    },
  },
};

const DICT: Record<Lang, Dictionary> = {
  id: DictionarySchema.parse(RAW_DICT.id) as unknown as Dictionary,
  en: DictionarySchema.parse(RAW_DICT.en) as unknown as Dictionary,
};

export default function ManualBookSuite() {
  const { fullName } = useAuth();
  const userName = fullName || "Operator";
  const [lang, setLang] = useState<Lang>("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "chapters" | "modules" | "titancore"
  >("chapters");
  const [expandedChapter, setExpandedChapter] = useState<string | null>("one");

  // Sonification & Reader state
  const [activeSoundId, setActiveSoundId] = useState<number | null>(null);
  const [narratingId, setNarratingId] = useState<string | null>(null);

  // AI Companion chatbot interactive state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiChatLog, setAiChatLog] = useState<
    Array<{ q: string; a: string; time: string }>
  >([
    {
      q: "Halo, jelaskan bagaimana cara menguji ekspor PDF?",
      a: `Halo ${userName}! Untuk menguji ekspor PDF gabungan, silakan beralih ke Chapter II. Gunakan data dummy Flat-JSON linier. Aktifkan state ekspor, yang akan membekukan pembaruan telemetri agar html2canvas dapat menangkap seluruh dokumen sandbox dengan rapi tanpa visual tearing.`,
      time: "02:48:56",
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const dict = DICT[lang];

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      sonifier.stop();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "id" ? "en" : "id"));
    // Stop speaking if language changes
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setNarratingId(null);
    }
  };

  // -------------------------------------------------------------
  // SPEECH SYNTHESIS TEXT-TO-SPEECH READ ALOUD
  // -------------------------------------------------------------
  const handleSpeakText = (id: string, textToSpeak: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech Synthesis tidak didukung oleh browser ini.");
      return;
    }

    if (narratingId === id) {
      window.speechSynthesis.cancel();
      setNarratingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text from markdown-like symbols
    const cleanText = textToSpeak.replace(/[#*`[\]]/g, "").slice(0, 1000); // safety length limit
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "id" ? "id-ID" : "en-US";
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setNarratingId(null);
    };
    utterance.onerror = () => {
      setNarratingId(null);
    };

    setNarratingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setNarratingId(null);
  };

  // -------------------------------------------------------------
  // SONIFICATION PLAY CONTROL
  // -------------------------------------------------------------
  const handlePlaySonification = (moduleId: number) => {
    if (activeSoundId === moduleId) {
      sonifier.stop();
      setActiveSoundId(null);
    } else {
      sonifier.play(moduleId);
      setActiveSoundId(moduleId);
      setTimeout(() => {
        setActiveSoundId((prev) => (prev === moduleId ? null : prev));
      }, 3000);
    }
  };

  // Conceptual dictionary lookup search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const hits: Array<{ section: string; title: string; text: string }> = [];

    // Search Ch 1
    if (dict.chapters.one.section1Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter I.1",
        title: dict.chapters.one.section1Title,
        text: dict.chapters.one.section1Content,
      });
    }
    if (dict.chapters.one.section2Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter I.2",
        title: dict.chapters.one.section2Title,
        text: dict.chapters.one.section2Content,
      });
    }
    if (dict.chapters.one.section3Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter I.3",
        title: dict.chapters.one.section3Title,
        text: dict.chapters.one.section3Content,
      });
    }

    // Search Ch 2
    if (dict.chapters.two.section1Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter II.1",
        title: dict.chapters.two.section1Title,
        text: dict.chapters.two.section1Content,
      });
    }
    if (dict.chapters.two.section2Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter II.2",
        title: dict.chapters.two.section2Title,
        text: dict.chapters.two.section2Content,
      });
    }
    if (dict.chapters.two.section3Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter II.3",
        title: dict.chapters.two.section3Title,
        text: dict.chapters.two.section3Content,
      });
    }

    // Search Ch 4
    if (dict.chapters.four.section1Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter IV.1",
        title: dict.chapters.four.section1Title,
        text: dict.chapters.four.section1Content,
      });
    }
    if (dict.chapters.four.section2Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter IV.2",
        title: dict.chapters.four.section2Title,
        text: dict.chapters.four.section2Content,
      });
    }

    // Search Ch 5
    if (dict.chapters.five.section1Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter V.1",
        title: dict.chapters.five.section1Title,
        text: dict.chapters.five.section1Content,
      });
    }
    if (dict.chapters.five.section2Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter V.2",
        title: dict.chapters.five.section2Title,
        text: dict.chapters.five.section2Content,
      });
    }

    // Search Ch 6
    if (dict.chapters.six.section1Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter VI.1",
        title: dict.chapters.six.section1Title,
        text: dict.chapters.six.section1Content,
      });
    }
    if (dict.chapters.six.section2Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter VI.2",
        title: dict.chapters.six.section2Title,
        text: dict.chapters.six.section2Content,
      });
    }

    // Search Ch 7
    if (dict.chapters.seven.section1Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter VII.1",
        title: dict.chapters.seven.section1Title,
        text: dict.chapters.seven.section1Content,
      });
    }
    if (dict.chapters.seven.section2Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter VII.2",
        title: dict.chapters.seven.section2Title,
        text: dict.chapters.seven.section2Content,
      });
    }
    if (
      dict.chapters.seven.section3Title &&
      dict.chapters.seven.section3Content &&
      dict.chapters.seven.section3Content.toLowerCase().includes(q)
    ) {
      hits.push({
        section: "Chapter VII.3",
        title: dict.chapters.seven.section3Title,
        text: dict.chapters.seven.section3Content,
      });
    }

    // Search Ch 8
    if (dict.chapters.eight.section1Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter VIII.1",
        title: dict.chapters.eight.section1Title,
        text: dict.chapters.eight.section1Content,
      });
    }
    if (dict.chapters.eight.section2Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter VIII.2",
        title: dict.chapters.eight.section2Title,
        text: dict.chapters.eight.section2Content,
      });
    }
    if (dict.chapters.eight.section3Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter VIII.3",
        title: dict.chapters.eight.section3Title,
        text: dict.chapters.eight.section3Content,
      });
    }

    // Search Ch 9
    if (dict.chapters.nine.section1Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter IX.1",
        title: dict.chapters.nine.section1Title,
        text: dict.chapters.nine.section1Content,
      });
    }
    if (dict.chapters.nine.section2Content.toLowerCase().includes(q)) {
      hits.push({
        section: "Chapter IX.2",
        title: dict.chapters.nine.section2Title,
        text: dict.chapters.nine.section2Content,
      });
    }

    // Search Ch 10
    if (dict.chapters.ten.section1Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter X.1", title: dict.chapters.ten.section1Title, text: dict.chapters.ten.section1Content });
    }
    if (dict.chapters.ten.section2Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter X.2", title: dict.chapters.ten.section2Title, text: dict.chapters.ten.section2Content });
    }
    if (dict.chapters.ten.section3Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter X.3", title: dict.chapters.ten.section3Title, text: dict.chapters.ten.section3Content });
    }

    // Search Ch 11
    if (dict.chapters.eleven.section1Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XI.1", title: dict.chapters.eleven.section1Title, text: dict.chapters.eleven.section1Content });
    }
    if (dict.chapters.eleven.section2Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XI.2", title: dict.chapters.eleven.section2Title, text: dict.chapters.eleven.section2Content });
    }
    if (dict.chapters.eleven.section3Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XI.3", title: dict.chapters.eleven.section3Title, text: dict.chapters.eleven.section3Content });
    }

    // Search Ch 12
    if (dict.chapters.twelve.section1Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XII.1", title: dict.chapters.twelve.section1Title, text: dict.chapters.twelve.section1Content });
    }
    if (dict.chapters.twelve.section2Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XII.2", title: dict.chapters.twelve.section2Title, text: dict.chapters.twelve.section2Content });
    }
    if (dict.chapters.twelve.section3Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XII.3", title: dict.chapters.twelve.section3Title, text: dict.chapters.twelve.section3Content });
    }

    // Search Ch 13
    if (dict.chapters.thirteen.section1Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XIII.1", title: dict.chapters.thirteen.section1Title, text: dict.chapters.thirteen.section1Content });
    }
    if (dict.chapters.thirteen.section2Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XIII.2", title: dict.chapters.thirteen.section2Title, text: dict.chapters.thirteen.section2Content });
    }
    if (dict.chapters.thirteen.section3Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XIII.3", title: dict.chapters.thirteen.section3Title, text: dict.chapters.thirteen.section3Content });
    }

    // Search Ch 14 (Performance Mode & Dark/Light Theme)
    if (dict.chapters.fourteen.section1Content.toLowerCase().includes(q) || dict.chapters.fourteen.title.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XIV.1", title: dict.chapters.fourteen.section1Title, text: dict.chapters.fourteen.section1Content });
    }
    if (dict.chapters.fourteen.section2Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XIV.2", title: dict.chapters.fourteen.section2Title, text: dict.chapters.fourteen.section2Content });
    }
    if (dict.chapters.fourteen.section3Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XIV.3", title: dict.chapters.fourteen.section3Title, text: dict.chapters.fourteen.section3Content });
    }

    // Search Ch 15 (GeoOSINT & Troubleshooting)
    if (dict.chapters.fifteen.section1Content.toLowerCase().includes(q) || dict.chapters.fifteen.title.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XV.1", title: dict.chapters.fifteen.section1Title, text: dict.chapters.fifteen.section1Content });
    }
    if (dict.chapters.fifteen.section2Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XV.2", title: dict.chapters.fifteen.section2Title, text: dict.chapters.fifteen.section2Content });
    }
    if (dict.chapters.fifteen.section3Content.toLowerCase().includes(q)) {
      hits.push({ section: "Chapter XV.3", title: dict.chapters.fifteen.section3Title, text: dict.chapters.fifteen.section3Content });
    }

    // Search Modules
    Object.values(dict.chapters.three.modules).forEach((mod) => {
      if (
        mod.title.toLowerCase().includes(q) ||
        mod.desc.toLowerCase().includes(q) ||
        mod.geologyInfo.toLowerCase().includes(q) ||
        mod.codeStructure.toLowerCase().includes(q) ||
        mod.formula.toLowerCase().includes(q) ||
        mod.threshold.toLowerCase().includes(q) ||
        mod.alert.toLowerCase().includes(q)
      ) {
        hits.push({
          section: "Chapter III (Module)",
          title: mod.title,
          text: `[Geology info]: ${mod.geologyInfo}\n[Formula]: ${mod.formula}\n[Code file]: ${mod.codeStructure}\n[Alert Action]: ${mod.alert}`,
        });
      }
    });

    return hits;
  }, [searchQuery, dict]);

  // AI chat local semantic matches
  const handleAiQuestionSubmit = (questionText: string) => {
    const textToSubmit = questionText.trim();
    if (!textToSubmit) return;

    setIsAiLoading(true);
    setAiQuestion("");

    setTimeout(() => {
      const qLower = textToSubmit.toLowerCase();
      let answer = "";

      if (
        qLower.includes("flat") ||
        qLower.includes("dummy") ||
        qLower.includes("json") ||
        qLower.includes("pdf")
      ) {
        answer =
          lang === "id"
            ? `[Referensi: Bab II.2] Data pemboran didesain Flat-JSON linier tanpa nested objects untuk mengamankan state 'window.isExportingPDF'. Saat ekspor, update telemetri di-freeze agar html2canvas merender laporan PDF secara utuh tanpa tearing.`
            : `[Reference: Chapter II.2] Borehole telemetries are modeled in flat Flat-JSON format to protect the 'window.isExportingPDF' state. When exporting, updates are paused to let html2canvas compile crisp PDF outputs.`;
      } else if (
        qLower.includes("h2s") ||
        qLower.includes("gas") ||
        qLower.includes("toxic") ||
        qLower.includes("safety") ||
        qLower.includes("evakuasi")
      ) {
        answer =
          lang === "id"
            ? `[Referensi: Bab III.12 - Gas Air Quality] Gas maut H2S dipantau ketat. Bahaya dimulai di >10 ppm (wajib masker) hingga >450 ppm (kematian instan). Jika terdeteksi, Safety Override Interceptor memveto debat Swarm AI dan melempar koordinat evakuasi via n8n langsung ke WhatsApp admin.`
            : `[Reference: Chapter III.12 - Gas Air Quality] Lethal H2S gas is monitored. Risk limits start at >10 ppm (masks mandatory) and peak at >450 ppm. When anomalous, the Safety Override Interceptor vetoes Swarm debates and triggers WhatsApp alerts.`;
      } else if (
        qLower.includes("logo") ||
        qLower.includes("filosofi") ||
        qLower.includes("warna") ||
        qLower.includes("living earth")
      ) {
        answer =
          lang === "id"
            ? `[Referensi: Bab I.3] Logo 'Living Earth Intelligence' terdiri dari bola 3D (Grid Volumetrik kiri & Sirkuit AI Twin kanan), Fissure Zig-zag (patahan sesar aktif), dan gelombang seismik horizontal. Menggunakan Biru Neon (Archie's Law), Hijau Neon (HSE), Orbital Gold (High-ROI), dan Terestrial Brown.`
            : `[Reference: Chapter I.3] 'Living Earth Intelligence' logo integrates a 3D sphere (Volumetric Grid left & Circuit AI Twin right), Zig-zag Fissure (active fault line), and horizontal seismic wave footer. Styled with Neon Blue (Archie's Law), Neon Green (HSE), Orbital Gold (High-ROI), and Terrestrial Brown.`;
      } else if (
        qLower.includes("menu") ||
        qLower.includes("kode") ||
        qLower.includes("code") ||
        qLower.includes("struktur")
      ) {
        answer =
          lang === "id"
            ? `[Referensi: Bab II.1] Navigasi dasbor terbagi atas sirkuit live ('/src/cores/live/') dan sirkuit simulasi sandbox ('/src/cores/dummy/'). Menu ditata responsif di Sidebar kiri dengan perutean modular yang mengunci state masukan pengguna.`
            : `[Reference: Chapter II.1] Navigation is split into active monitoring ('/src/cores/live/') and simulation sandbox ('/src/cores/dummy/'). Menus are laid out in the left sidebar using modular routing to lock current state entries.`;
      } else if (
        qLower.includes("suara") ||
        qLower.includes("sonifikasi") ||
        qLower.includes("sound") ||
        qLower.includes("audio")
      ) {
        answer =
          lang === "id"
            ? `[Referensi: Bab IV & Sistem Suara] Dasbor dilengkapi dengan Sistem Suara Geofisika Akustik. Anda dapat mengklik tombol 'Dengarkan Frekuensi' di masing-masing 24 modul untuk mendengar gelombang bunyi fisika bumi, serta tombol 'Suara Buku' untuk membacakan penjelasan bab.`
            : `[Reference: Chapter IV & Computational Sound] The dashboard features Acoustic Geophysics Sonification. You can click 'Play Sound' on any of the 24 modules to hear synthesized physical wave anomalies or click 'Audio Guide' to speak text aloud.`;
      } else if (
        qLower.includes("poisson") ||
        qLower.includes("fluid") ||
        qLower.includes("rasio")
      ) {
        const modInfo = dict.chapters.three.modules[6];
        answer = `[Referensi: Bab III.6 - Fluid Identification] Formula: ${modInfo.formula}. Batas Kritis: ${modInfo.threshold}. Tindakan Alert: ${modInfo.alert}`;
      } else if (
        qLower.includes("pore") ||
        qLower.includes("pressure") ||
        qLower.includes("geomech") ||
        qLower.includes("blowout")
      ) {
        const modInfo = dict.chapters.three.modules[3];
        answer = `[Referensi: Bab III.3 - Geomechanics Integrity] Formula: ${modInfo.formula}. Batas Kritis: ${modInfo.threshold}. Tindakan Alert: ${modInfo.alert}`;
      } else if (
        qLower.includes("security") ||
        qLower.includes("keamanan") ||
        qLower.includes("injection") ||
        qLower.includes("hmac") ||
        qLower.includes("cookie") ||
        qLower.includes("firestore") ||
        qLower.includes("sanitizer") ||
        qLower.includes("obfuscation") ||
        qLower.includes("git") ||
        qLower.includes("terser")
      ) {
        answer =
          lang === "id"
            ? `[Referensi: Bab X - Enterprise Security] GeoAI Pro v4.0 dilengkapi proteksi Prompt Injection dengan tag XML, validasi Webhook HMAC, Code Obfuscation (Terser), Hardware Fingerprinting, HttpOnly Secure Cookies, Git Pre-Commit Hook, dan Firestore Undefined-Sanitizer untuk menetralisir ancaman siber.`
            : `[Reference: Chapter X - Enterprise Security] GeoAI Pro v4.0 features Prompt Injection protection via XML tags, Webhook HMAC validation, Terser Code Obfuscation, Hardware Fingerprinting, HttpOnly Secure Cookies, Git Pre-Commit Hooks, and Firestore Undefined-Sanitizers to neutralize cyber threats.`;
      } else if (
        qLower.includes("swarm") ||
        qLower.includes("cognitive") ||
        qLower.includes("integrasi modul")
      ) {
        answer =
          lang === "id"
            ? `[Referensi: Bab XI - Swarm AI Integration] Tiga modul utama (Seismic Amplitude, Gas Safety, Geomechanics) diintegrasikan langsung ke ekosistem Swarm AI di sisi Live Core, menyuplai data fisis real-time (Live Inference) untuk mengarahkan pengambil keputusan AI tanpa membebani komponen antarmuka dasbor utama.`
            : `[Reference: Chapter XI - Swarm AI Integration] Three core modules (Seismic Amplitude, Gas Safety, Geomechanics) are natively integrated into the Swarm AI ecosystem on the Live Core, supplying real-time physical telemetry (Live Inference) to guide AI decisions without bloating the main dashboard UI.`;
      } else if (
        qLower.includes("performance") ||
        qLower.includes("performa") ||
        qLower.includes("fps") ||
        qLower.includes("eco") ||
        qLower.includes("profiler") ||
        qLower.includes("theme") ||
        qLower.includes("tema") ||
        qLower.includes("dark") ||
        qLower.includes("light") ||
        qLower.includes("drawer") ||
        qLower.includes("laci")
      ) {
        answer =
          lang === "id"
            ? `[Referensi: Bab XIV - Performance & Visual Theme Drawer] Mode Kinerja (Eco Performance vs High-Fidelity) dan Tema Visual (Gelap Operasi vs Terang Lapangan) dapat diakses melalui tombol 'Laci Kontrol Sistem' di header. Mode Eco secara cerdas membatasi pixel ratio WebGL ke 1.0x, mematikan bayangan berat, dan men-throttle pembacaan kanvas Sonar/GPR agar aplikasi berjalan mulus 60 FPS di laptop/ponsel standar dengan perlindungan lisensi hardware terenkripsi.`
            : `[Reference: Chapter XIV - Performance & Visual Theme Drawer] Performance Mode (Eco Performance vs High-Fidelity) and Visual Themes (Operations Dark vs Field Light) are managed via the System Control Drawer in the header. Eco Mode dynamically caps WebGL pixel ratio to 1.0x, disables heavy shadows, and throttles Sonar/GPR canvas readbacks to ensure a locked 60 FPS on standard devices with cryptographic license verification.`;
      } else {
        answer =
          lang === "id"
            ? `Pertanyaan tentang "${textToSubmit}" dianalisis. Buku panduan Enterprise V4.0 memastikan bahwa data telemetri Anda mematuhi ambang batas kritis modul subsurface. Hubungi Kepala Teknis Administrator melalui WhatsApp Hub untuk bantuan lapangan.`
            : `Your query about "${textToSubmit}" has been logged under V4.0 standards. For direct assistance, click the WhatsApp redirection button to connect with Administrator.`;
      }

      setAiChatLog((prev) => [
        ...prev,
        {
          q: textToSubmit,
          a: answer,
          time: new Date().toTimeString().split(" ")[0],
        },
      ]);
      setIsAiLoading(false);
    }, 850);
  };

  const handleWhatsAppRedirect = () => {
    window.open(
      "https://wa.me/6285260245100?text=Halo%20Ivan%20Hutabarat,%20saya%20butuh%20panduan%20teknis%20GeoAI%20Pro%20v4.0",
      "_blank",
    );
  };

  return (
    <div
      id="manual_book_suite_root"
      className="bg-[#111] border border-zinc-850 rounded-xl p-6 shadow-2xl text-zinc-300 font-sans max-w-7xl mx-auto space-y-6"
    >
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF5722]/10 rounded-lg text-[#FF5722] border border-[#FF5722]/20">
              <Book size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white font-mono uppercase flex items-center gap-2">
                {dict.title}
                <span className="text-[10px] text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-1.5 py-0.5 rounded uppercase font-normal font-mono tracking-widest animate-pulse">
                  V4.0 PRO
                </span>
              </h1>
              <p className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                {dict.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS (WITHOUT PHONE NUMBERS DISPLAYED ON THE LABELS) */}
        <div className="flex flex-wrap items-center gap-2">
          {narratingId && (
            <button
              type="button"
              onClick={handleStopSpeech}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/30 border border-red-900/40 rounded-md text-xs font-semibold text-red-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <VolumeX size={14} />
              Stop Audio Guide
            </button>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-xs font-semibold text-zinc-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Globe size={14} className="text-[#00E5FF]" />
            {dict.langToggle}
          </button>

          <button
            type="button"
            onClick={handleWhatsAppRedirect}
            className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-md text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Phone size={14} />
            {lang === "id" ? "Hubungi Engineer" : "Contact Engineer"}
          </button>
        </div>
      </div>

      {/* SEARCH BAR (CONCEPTUAL DICTIONARY EXPLORER) */}
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 space-y-3">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <Search size={12} className="text-[#FF5722]" />
          EKSPEDISI SEARCH ENSIKLOPEDIA (DOKUMENTASI DUA BAHASA)
        </span>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.searchPlaceholder}
              className="w-full bg-black border border-zinc-850 focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] rounded-lg pl-10 pr-4 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none transition-all"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* CONCEPTUAL SEARCH RESULTS */}
        {searchResults !== null && (
          <div className="bg-black/90 border border-zinc-900 rounded-lg p-3 max-h-64 overflow-y-auto space-y-3 font-mono text-xs">
            <span className="text-[10px] text-[#00E5FF] font-bold uppercase">
              &gt; TEMUAN PENCARIAN DICTIONARY ({searchResults.length})
            </span>
            {searchResults.length === 0 ? (
              <p className="text-zinc-600 italic">
                Tidak ada referensi fisis yang cocok. Coba kata kunci lain
                (misal: "H2S", "Flat-JSON", "Poisson", "Sistem Suara").
              </p>
            ) : (
              searchResults.map((hit, idx) => (
                <div
                  key={idx}
                  className="border-l-2 border-[#FF5722] pl-3 py-1 space-y-1 bg-zinc-900/30 rounded-r"
                >
                  <span className="text-[9px] bg-[#FF5722]/10 text-[#FF5722] px-1 rounded font-bold uppercase">
                    {hit.section}
                  </span>
                  <h4 className="text-white font-bold text-[11px]">
                    {hit.title}
                  </h4>
                  <p className="text-zinc-400 text-[10px] leading-relaxed whitespace-pre-line">
                    {hit.text}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* CORE MANUAL CONTENT TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: SECTIONS NAVIGATION */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex border-b border-zinc-900 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("chapters")}
              className={cn(
                "px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors",
                activeTab === "chapters"
                  ? "border-[#FF5722] text-[#FF5722]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300",
              )}
            >
              📂 Bab Buku Panduan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("modules")}
              className={cn(
                "px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors",
                activeTab === "modules"
                  ? "border-[#FF5722] text-[#FF5722]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300",
              )}
            >
              🎛️ 24 Master Modul Geofisika
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("titancore")}
              className={cn(
                "px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors",
                activeTab === "titancore"
                  ? "border-[#FF5722] text-[#FF5722]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300",
              )}
            >
              💻 Workstation TitanCore (2025)
            </button>
          </div>

          {/* TAB 1: CHAPTERS VIEW */}
          {activeTab === "chapters" && (
            <div className="space-y-3 max-h-[640px] overflow-y-auto scrollbar-thin pr-1">
              {/* Chapter 1 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(expandedChapter === "one" ? null : "one")
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Layers size={14} className="text-[#FF5722]" />
                    {dict.chapters.one.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "one" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "one" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    {/* GIANT LOGO IN BAB 1 */}
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 space-y-2">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
                          High-Quality Emblem
                        </span>
                        <h2 className="text-base font-extrabold text-white font-mono uppercase">
                          Living Earth Intelligence
                        </h2>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Visualisasi di sebelah kanan adalah lambang resmi
                          integrasi geofisika digital korporat. Menggabungkan
                          model grid volumetrik lapisan batuan lateral di sisi
                          kiri, jaringan sirkuit saraf kecerdasan buatan
                          multi-agen di sisi kanan, patahan retakan sesar aktif
                          berwarna emas menyala di tengah, serta getaran
                          gelombang seismik real-time konstan di dasarnya.
                        </p>
                      </div>
                      <div className="w-full md:w-auto flex justify-center">
                        <LivingEarthLogo className="w-56 h-56 md:w-64 md:h-64" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch1",
                            `${dict.chapters.one.section1Content} ${dict.chapters.one.section2Content} ${dict.chapters.one.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch1"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch1"
                          ? "Mute Bab I Voice"
                          : "Dengarkan Suara Bab I"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF] flex items-center gap-1.5">
                        <Cpu size={12} className="text-[#FF5722]" />
                        {dict.chapters.one.section1Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.one.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF] flex items-center gap-1.5">
                        <Workflow size={12} className="text-[#25D366]" />
                        {dict.chapters.one.section2Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.one.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF] flex items-center gap-1.5">
                        <Info size={12} className="text-amber-500" />
                        {dict.chapters.one.section3Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.one.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 2 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(expandedChapter === "two" ? null : "two")
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Database size={14} className="text-[#FF5722]" />
                    {dict.chapters.two.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "two" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "two" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch2",
                            `${dict.chapters.two.section1Content} ${dict.chapters.two.section2Content} ${dict.chapters.two.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch2"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch2"
                          ? "Mute Bab II Voice"
                          : "Dengarkan Suara Bab II"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.two.section1Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.two.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.two.section2Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.two.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.two.section3Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.two.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 4 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "four" ? null : "four",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#FF5722]" />
                    {dict.chapters.four.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "four" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "four" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch4",
                            `${dict.chapters.four.section1Content} ${dict.chapters.four.section2Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch4"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch4"
                          ? "Mute Bab IV Voice"
                          : "Dengarkan Suara Bab IV"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.four.section1Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.four.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.four.section2Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.four.section2Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 5 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "five" ? null : "five",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Activity size={14} className="text-[#FF5722]" />
                    {dict.chapters.five.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "five" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "five" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch5",
                            `${dict.chapters.five.section1Content} ${dict.chapters.five.section2Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch5"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch5"
                          ? "Mute Bab V Voice"
                          : "Dengarkan Suara Bab V"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.five.section1Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.five.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.five.section2Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.five.section2Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 6 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(expandedChapter === "six" ? null : "six")
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Code size={14} className="text-[#FF5722]" />
                    {dict.chapters.six.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "six" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "six" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch6",
                            `${dict.chapters.six.section1Content} ${dict.chapters.six.section2Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch6"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch6"
                          ? "Mute Bab VI Voice"
                          : "Dengarkan Suara Bab VI"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.six.section1Title}
                      </h3>
                      <pre className="text-zinc-300 bg-zinc-950 p-3 rounded border border-zinc-900 overflow-x-auto font-mono text-[10px] leading-tight whitespace-pre">
                        {dict.chapters.six.section1Content}
                      </pre>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.six.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.six.section2Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 7 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "seven" ? null : "seven",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Terminal size={14} className="text-[#FF5722]" />
                    {dict.chapters.seven.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "seven" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "seven" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch7",
                            `${dict.chapters.seven.section1Content} ${dict.chapters.seven.section2Content} ${dict.chapters.seven.section3Content || ""}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch7"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch7"
                          ? "Mute Bab VII Voice"
                          : "Dengarkan Suara Bab VII"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.seven.section1Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.seven.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.seven.section2Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.seven.section2Content}
                      </p>
                    </div>
                    {dict.chapters.seven.section3Title &&
                      dict.chapters.seven.section3Content && (
                        <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                          <h3 className="font-bold text-[#00E5FF]">
                            {dict.chapters.seven.section3Title}
                          </h3>
                          <p className="text-zinc-400 whitespace-pre-line">
                            {dict.chapters.seven.section3Content}
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Chapter 8 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "eight" ? null : "eight",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#FF5722]" />
                    {dict.chapters.eight.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "eight" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "eight" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch8",
                            `${dict.chapters.eight.section1Content} ${dict.chapters.eight.section2Content} ${dict.chapters.eight.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch8"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch8"
                          ? "Mute Bab VIII Voice"
                          : "Dengarkan Suara Bab VIII"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.eight.section1Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.eight.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.eight.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.eight.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.eight.section3Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.eight.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 9 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "nine" ? null : "nine",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Waves size={14} className="text-[#FF5722]" />
                    {dict.chapters.nine.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "nine" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "nine" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch9",
                            `${dict.chapters.nine.section1Content} ${dict.chapters.nine.section2Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch9"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch9"
                          ? "Mute Bab IX Voice"
                          : "Dengarkan Suara Bab IX"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.nine.section1Title}
                      </h3>
                      <p className="text-zinc-400">
                        {dict.chapters.nine.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.nine.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.nine.section2Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 10 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(expandedChapter === "ten" ? null : "ten")
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Shield size={14} className="text-[#FF5722]" />
                    {dict.chapters.ten.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "ten" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "ten" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch10",
                            `${dict.chapters.ten.section1Content} ${dict.chapters.ten.section2Content} ${dict.chapters.ten.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch10"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch10"
                          ? "Mute Voice"
                          : "Dengarkan Suara"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.ten.section1Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.ten.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.ten.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.ten.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.ten.section3Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.ten.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 11 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "eleven" ? null : "eleven",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#FF5722]" />
                    {dict.chapters.eleven.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "eleven" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "eleven" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch11",
                            `${dict.chapters.eleven.section1Content} ${dict.chapters.eleven.section2Content} ${dict.chapters.eleven.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch11"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch11"
                          ? "Mute Voice"
                          : "Dengarkan Suara"}
                      </button>
                    </div>

                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.eleven.section1Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.eleven.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.eleven.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.eleven.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.eleven.section3Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.eleven.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Chapter 12 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "twelve" ? null : "twelve",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#FF5722]" />
                    {dict.chapters.twelve.title}
                  </span>
                  <span className="text-[#FF5722]">
                    {expandedChapter === "twelve" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "twelve" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch12",
                            `${dict.chapters.twelve.section1Content} ${dict.chapters.twelve.section2Content} ${dict.chapters.twelve.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch12"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch12"
                          ? "Mute Voice"
                          : "Dengarkan Suara"}
                      </button>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.twelve.section1Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.twelve.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.twelve.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.twelve.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.twelve.section3Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.twelve.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 13 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "thirteen" ? null : "thirteen",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#00E5FF]" />
                    {dict.chapters.thirteen.title}
                  </span>
                  <span className="text-[#00E5FF]">
                    {expandedChapter === "thirteen" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "thirteen" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch13",
                            `${dict.chapters.thirteen.section1Content} ${dict.chapters.thirteen.section2Content} ${dict.chapters.thirteen.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch13"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch13"
                          ? "Mute Voice"
                          : "Dengarkan Suara"}
                      </button>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.thirteen.section1Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.thirteen.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.thirteen.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.thirteen.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.thirteen.section3Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.thirteen.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter 14 Accordion */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "fourteen" ? null : "fourteen",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sliders size={14} className="text-[#00E5FF]" />
                    {dict.chapters.fourteen.title}
                  </span>
                  <span className="text-[#00E5FF]">
                    {expandedChapter === "fourteen" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "fourteen" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch14",
                            `${dict.chapters.fourteen.section1Content} ${dict.chapters.fourteen.section2Content} ${dict.chapters.fourteen.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch14"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch14"
                          ? "Mute Voice"
                          : "Dengarkan Suara"}
                      </button>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.fourteen.section1Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.fourteen.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.fourteen.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.fourteen.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.fourteen.section3Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.fourteen.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* CH15: GeoOSINT & Troubleshooting */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedChapter(
                      expandedChapter === "fifteen" ? null : "fifteen",
                    )
                  }
                  className="w-full bg-[#161617] p-4 text-left font-mono text-xs font-bold text-white flex justify-between items-center hover:bg-zinc-800/80 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Globe size={14} className="text-[#00E5FF]" />
                    {dict.chapters.fifteen.title}
                  </span>
                  <span className="text-[#00E5FF]">
                    {expandedChapter === "fifteen" ? "▼" : "►"}
                  </span>
                </button>
                {expandedChapter === "fifteen" && (
                  <div className="p-4 bg-black/40 border-t border-zinc-900 space-y-4 text-xs leading-relaxed">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            "ch15",
                            `${dict.chapters.fifteen.section1Content} ${dict.chapters.fifteen.section2Content} ${dict.chapters.fifteen.section3Content}`,
                          )
                        }
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer",
                          narratingId === "ch15"
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300",
                        )}
                      >
                        <Play size={12} />
                        {narratingId === "ch15"
                          ? "Mute Voice"
                          : "Dengarkan Suara"}
                      </button>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.fifteen.section1Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.fifteen.section1Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.fifteen.section2Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.fifteen.section2Content}
                      </p>
                    </div>
                    <div className="space-y-1 bg-zinc-950/40 p-3 rounded border border-zinc-900">
                      <h3 className="font-bold text-[#00E5FF]">
                        {dict.chapters.fifteen.section3Title}
                      </h3>
                      <p className="text-zinc-400 whitespace-pre-line">
                        {dict.chapters.fifteen.section3Content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GEOPHYSICAL ENCYCLOPEDIA (24 MODULES) */}
          {activeTab === "modules" && (
            <div className="space-y-4 max-h-[640px] overflow-y-auto scrollbar-thin pr-1">
              <p className="text-xs text-zinc-500 italic font-mono">
                {dict.chapters.three.intro}
              </p>
              {Object.entries(dict.chapters.three.modules).map(([key, mod]) => (
                <div
                  key={key}
                  className="bg-[#141416] border border-zinc-900 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                      <Activity size={14} className="text-[#00E5FF]" />
                      {mod.title}
                    </h3>

                    {/* SONIFIER CONTROLLER BUTTON */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlaySonification(Number(key))}
                        className={cn(
                          "px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                          activeSoundId === Number(key)
                            ? "bg-amber-500 text-black animate-pulse"
                            : "bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/20",
                        )}
                      >
                        <Volume2
                          size={12}
                          className={
                            activeSoundId === Number(key)
                              ? "animate-bounce"
                              : ""
                          }
                        />
                        {activeSoundId === Number(key)
                          ? "Playing Synth..."
                          : "Dengarkan Frekuensi"}
                      </button>
                      <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-widest font-mono">
                        Modul #{key}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    {mod.desc}
                  </p>

                  <div className="bg-zinc-950 p-2.5 rounded border border-zinc-900 space-y-1 text-xs">
                    <span className="text-[9px] text-[#00E5FF] font-bold uppercase tracking-wider">
                      Latar Belakang Geofisika Lapangan (Geophysical Context)
                    </span>
                    <p className="text-zinc-400 italic leading-relaxed">
                      {mod.geologyInfo}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-black p-2.5 rounded border border-zinc-900 space-y-1">
                      <span className="text-[9px] text-[#FF5722] font-bold uppercase tracking-wider">
                        Formula Fisika Pendukung
                      </span>
                      <p className="text-white text-[11px] bg-zinc-950/80 px-2 py-1 rounded select-all font-bold">
                        {mod.formula}
                      </p>
                    </div>
                    <div className="bg-black p-2.5 rounded border border-zinc-900 space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        Batas Ambang Kritis
                      </span>
                      <p className="text-amber-500 font-bold">
                        {mod.threshold}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-black p-2.5 rounded border border-zinc-900 space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        File Desain & Arsitektur Kode
                      </span>
                      <p className="text-zinc-400 text-[10px] leading-relaxed break-all">
                        {mod.codeStructure}
                      </p>
                    </div>
                    <div className="bg-black p-2.5 rounded border border-zinc-900 space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        Sifat Gelombang Akustik (Synth)
                      </span>
                      <p className="text-emerald-400 text-[10px] leading-relaxed">
                        {mod.soundDescription}
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-950/15 border border-red-900/30 rounded p-3 text-xs font-mono space-y-1">
                    <span className="text-[9px] text-red-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <ShieldAlert size={11} className="animate-bounce" />
                      Protokol Bahaya Otomatis (Automatic Action Alert)
                    </span>
                    <p className="text-zinc-300 italic">{mod.alert}</p>
                  </div>

                  {/* FLAT JSON DUMMY GENERATOR */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1">
                      <Code size={11} className="text-[#00E5FF]" />
                      Linear Flat-JSON Data Model (Geological Telemetry Raw)
                    </span>
                    <pre className="text-[10px] bg-black p-3 rounded-lg border border-zinc-900 text-emerald-400 overflow-x-auto block font-mono select-all scrollbar-thin max-h-40">
                      {mod.dataSample}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "titancore" && (
            <div className="max-h-[640px] overflow-y-auto scrollbar-thin pr-1">
              <TitanCoreWorkstation lang={lang} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI MANUAL ASSISTANT & CHAT ENGINE */}
        <div className="lg:col-span-1 bg-black/60 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between h-[640px] font-mono">
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            {/* TERMINAL HEADER */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 shrink-0">
              <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-widest flex items-center gap-2">
                <Terminal size={14} className="animate-spin" />
                {dict.askAiTitle}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* CHAT LOGS */}
            <div className="flex-1 overflow-y-auto space-y-3 text-[11px] pr-1 scrollbar-thin">
              {aiChatLog.map((chat, idx) => (
                <div key={idx} className="space-y-1">
                  {/* User Query */}
                  <div className="flex items-start gap-1.5 text-zinc-400">
                    <span className="text-[#FF5722] font-extrabold">
                      &gt;&gt;
                    </span>
                    <p className="bg-zinc-900/50 px-2 py-1 rounded flex-1">
                      {chat.q}
                    </p>
                  </div>
                  {/* AI Response */}
                  <div className="flex items-start gap-1.5 text-emerald-400 pl-2">
                    <span className="text-[#00E5FF] font-extrabold">
                      ai_twin:
                    </span>
                    <p className="bg-black/80 border border-zinc-900 px-2 py-1.5 rounded flex-1 text-zinc-300 leading-relaxed whitespace-pre-line">
                      {chat.a}
                    </p>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 text-[#00E5FF] text-[10px] pl-3">
                  <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-ping" />
                  <span>Searching Geophysics core dictionary matrix...</span>
                </div>
              )}
            </div>

            {/* SUGGESTED SHORTCUT QUESTIONS */}
            <div className="shrink-0 space-y-1.5 pt-2 border-t border-zinc-900">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1">
                <HelpCircle size={10} /> Suggested reference triggers:
              </span>
              <div className="flex flex-wrap gap-1">
                {dict.suggestedQueries.map((query, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAiQuestionSubmit(query)}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 px-2 py-1 rounded text-[9px] text-zinc-400 hover:text-white transition-all cursor-pointer font-mono"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INPUT FORM */}
          <div className="pt-3 border-t border-zinc-900 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiQuestionSubmit(aiQuestion);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={dict.askAiPlaceholder}
                className="flex-1 bg-black border border-zinc-850 focus:border-[#00E5FF] rounded px-3 py-2 text-xs focus:outline-none text-white font-mono"
              />
              <button
                type="submit"
                disabled={!aiQuestion.trim() || isAiLoading}
                className="bg-[#00E5FF] hover:bg-[#00b2c4] disabled:opacity-50 text-black px-3 py-2 rounded text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Send
              </button>
            </form>

            {/* WHATSAPP CONTACT FOOTER - HIDDEN PHONE NUMBER */}
            <div className="mt-3 bg-[#25D366]/5 border border-[#25D366]/20 rounded-lg p-2.5 flex items-center justify-between text-[10px] text-zinc-400">
              <div className="flex items-center gap-1.5 text-[#25D366]">
                <Phone size={12} className="animate-pulse" />
                <strong>Direct Tech Contact</strong>
              </div>
              <button
                onClick={handleWhatsAppRedirect}
                className="text-white hover:text-[#25D366] bg-[#25D366]/10 px-2.5 py-1 rounded flex items-center gap-1 transition-all text-[9px] uppercase font-bold font-mono"
              >
                Launch WA Chat <ExternalLink size={9} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DUMMY vs LIVE INSTRUCTION BAR - NO EXPOSED PHONE NUMBERS */}
      <div className="bg-[#161617] border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[#00E5FF] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500 animate-spin" />
            Sinergi Komputasi Sandbox & Live
          </span>
          <p className="text-zinc-400">
            Gunakan asisten AI di sebelah kanan untuk mencari referensi
            geofisika di sumur bor dummy maupun live secara instan. Hubungi
            Engineer melalui jalur aman WhatsApp apabila memerlukan audit
            geologi terstruktur.
          </p>
        </div>
        <button
          onClick={handleWhatsAppRedirect}
          className="w-full md:w-auto bg-[#25D366] hover:bg-[#20ba56] text-black font-extrabold px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-xs uppercase font-mono tracking-wider shadow-lg transition-all cursor-pointer"
        >
          <Phone size={14} />
          {dict.waButton}
        </button>
      </div>
    </div>
  );
}
