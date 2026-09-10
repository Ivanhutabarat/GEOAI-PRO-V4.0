import React from 'react';

interface GeoAILogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
  layout?: 'icon' | 'horizontal' | 'vertical';
}

export default function GeoAILogo({ 
  className = '', 
  size = 48, 
  glow = true,
  layout = 'icon'
}: GeoAILogoProps) {
  
  const renderLogoSVG = () => (
    <div 
      className={`relative flex items-center justify-center transition-all ${className}`} 
      style={{ width: size, height: size }}
      id="geo-ai-logo-emblem"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full geoai-logo-svg"
      >
        <defs>
          {/* Hardware-accelerated CSS keyframe definitions */}
          <style>{`
            .geoai-logo-svg {
              filter: drop-shadow(0 0 15px rgba(0, 229, 255, 0.1));
            }
            .animate-orbit-ring {
              transform-origin: 100px 95px;
              animation: rotateOrbit 16s linear infinite;
              will-change: transform;
            }
            @keyframes rotateOrbit {
              0% { transform: rotate(0deg) translate3d(0,0,0); }
              100% { transform: rotate(360deg) translate3d(0,0,0); }
            }
            .circuit-pulse {
              stroke-dasharray: 20, 40;
              animation: pulseFlow 3s linear infinite;
              will-change: stroke-dashoffset;
            }
            @keyframes pulseFlow {
              0% { stroke-dashoffset: 60; }
              100% { stroke-dashoffset: 0; }
            }
            .seismic-wave-line {
              stroke-dasharray: 300;
              stroke-dashoffset: 300;
              animation: drawSeismic 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              will-change: stroke-dashoffset;
            }
            @keyframes drawSeismic {
              0% { stroke-dashoffset: 300; }
              40% { stroke-dashoffset: 0; }
              80% { stroke-dashoffset: -300; }
              100% { stroke-dashoffset: -300; }
            }
            .globe-glow-pulse {
              animation: globeGlow 4s ease-in-out infinite alternate;
            }
            @keyframes globeGlow {
              0% { opacity: 0.6; }
              100% { opacity: 1; }
            }
          `}</style>

          {/* 3D Spherical Blue Globe Gradient */}
          <radialGradient id="globeBlueGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#c1f0ff" />
            <stop offset="25%" stopColor="#40c4ff" />
            <stop offset="65%" stopColor="#1565c0" />
            <stop offset="100%" stopColor="#081b4f" />
          </radialGradient>

          {/* Spherical Inner Shading for Glossy Luster */}
          <radialGradient id="sphereShading" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(4,10,33,0.9)" />
          </radialGradient>

          {/* Gold Gradient for Orbital Containment Ring */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="25%" stopColor="#FFB300" />
            <stop offset="60%" stopColor="#FF8F00" />
            <stop offset="85%" stopColor="#8D6E63" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>

          {/* Neon Blue Gradient for Circuit Pathways */}
          <linearGradient id="neonBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#2979FF" />
          </linearGradient>

          {/* Neon Green Gradient for Secondary Circuit Pathways */}
          <linearGradient id="neonGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFCC" />
            <stop offset="100%" stopColor="#00E676" />
          </linearGradient>

          {/* Rocky Topography Layer Gradient */}
          <linearGradient id="rockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A1887F" />
            <stop offset="40%" stopColor="#6D4C41" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>

          {/* Seismic Telemetry Waveform Gradient */}
          <linearGradient id="seismicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB300" />
            <stop offset="50%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FF3D00" />
          </linearGradient>

          {/* Neon Glow Filters */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Back Glow */}
        {glow && (
          <circle 
            cx="100" 
            cy="95" 
            r="80" 
            fill="rgba(0, 229, 255, 0.04)" 
            className="globe-glow-pulse" 
          />
        )}

        {/* ========================================================= */}
        {/* LEFT HEMISPHERE: 3D Spherical Blue Globe & Grid Lines     */}
        {/* ========================================================= */}
        <g clipPath="url(#leftHemiClip)">
          {/* Base sphere body */}
          <circle cx="100" cy="95" r="65" fill="url(#globeBlueGrad)" />
          
          {/* Volumetric Spherical Longitude Grid lines */}
          <path d="M 100,30 A 22,65 0 0,0 100,160" stroke="#00E5FF" strokeWidth="1.2" fill="none" opacity="0.8" />
          <path d="M 100,30 A 44,65 0 0,0 100,160" stroke="#00E5FF" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M 100,30 A 58,65 0 0,0 100,160" stroke="#00E5FF" strokeWidth="1.0" fill="none" opacity="0.35" />

          {/* Volumetric Spherical Latitude Grid lines */}
          <path d="M 35,95 A 65,22 0 0,0 165,95" stroke="#00E5FF" strokeWidth="1.0" fill="none" opacity="0.7" />
          <path d="M 35,65 A 65,18 0 0,0 165,65" stroke="#00E5FF" strokeWidth="0.8" fill="none" opacity="0.5" />
          <path d="M 35,125 A 65,18 0 0,0 165,125" stroke="#00E5FF" strokeWidth="0.8" fill="none" opacity="0.5" />
          
          {/* Glossy overlay shading */}
          <circle cx="100" cy="95" r="65" fill="url(#sphereShading)" />
        </g>

        {/* Clip definition for Left Hemisphere (Jagged split divider) */}
        <clipPath id="leftHemiClip">
          <path d="M 100,30 A 65,65 0 0,0 100,160 Z" />
        </clipPath>

        {/* ========================================================= */}
        {/* RIGHT HEMISPHERE: Digital Circuit Pathways & Core Board  */}
        {/* ========================================================= */}
        <g clipPath="url(#rightHemiClip)">
          {/* Dark tech motherboard background */}
          <circle cx="100" cy="95" r="65" fill="#0b0e1b" />
          
          {/* Static Circuit Traces (Green & Blue) */}
          <path d="M 100,45 L 125,45 L 140,60 L 155,60" stroke="url(#neonGreenGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M 100,70 L 115,70 L 130,85 L 150,85" stroke="url(#neonBlueGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M 100,95 L 120,95 L 135,110 L 155,110" stroke="url(#neonGreenGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M 100,120 L 115,120 L 125,130 L 145,130" stroke="url(#neonBlueGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />

          {/* Animated flowing data pulses */}
          <path d="M 100,45 L 125,45 L 140,60 L 155,60" stroke="#00FFCC" strokeWidth="2.0" fill="none" strokeLinecap="round" className="circuit-pulse" />
          <path d="M 100,70 L 115,70 L 130,85 L 150,85" stroke="#00E5FF" strokeWidth="2.0" fill="none" strokeLinecap="round" className="circuit-pulse" style={{ animationDelay: '0.7s' }} />
          <path d="M 100,95 L 120,95 L 135,110 L 155,110" stroke="#00FFCC" strokeWidth="2.0" fill="none" strokeLinecap="round" className="circuit-pulse" style={{ animationDelay: '1.4s' }} />
          <path d="M 100,120 L 115,120 L 125,130 L 145,130" stroke="#00E5FF" strokeWidth="2.0" fill="none" strokeLinecap="round" className="circuit-pulse" style={{ animationDelay: '2.1s' }} />

          {/* Glossy overlay shading right hemisphere */}
          <circle cx="100" cy="95" r="65" fill="url(#sphereShading)" />
        </g>

        {/* Clip definition for Right Hemisphere */}
        <clipPath id="rightHemiClip">
          <path d="M 100,30 A 65,65 0 0,1 100,160 Z" />
        </clipPath>

        {/* Sharp Glowing Jagged Center Divider (Fuses Grid and Circuits) */}
        <path 
          d="M 100,30 L 100,60 L 115,72 L 105,88 L 115,102 L 95,122 L 100,160" 
          stroke="#00E5FF" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
          filter="url(#neonGlow)" 
        />

        {/* Glowing Solder Junction Joint Pads */}
        <circle cx="155" cy="60" r="2.5" fill="#00FFCC" filter="url(#neonGlow)" />
        <circle cx="150" cy="85" r="2.5" fill="#00E5FF" filter="url(#neonGlow)" />
        <circle cx="155" cy="110" r="2.5" fill="#00FFCC" filter="url(#neonGlow)" />
        <circle cx="145" cy="130" r="2.5" fill="#00E5FF" filter="url(#neonGlow)" />

        {/* ========================================================= */}
        {/* ROCKY TOPOGRAPHY & ACTIVE SEISMIC TELEMETRY WAVEFORM      */}
        {/* ========================================================= */}
        {/* Rocky structure at the base */}
        <path 
          d="M 90,135 Q 115,125 135,140 T 170,134 L 165,160 L 90,160 Z" 
          fill="url(#rockGrad)" 
          stroke="#3E2723" 
          strokeWidth="1.5" 
        />
        
        {/* Glowing Seismograph Waveform Overlay */}
        <path 
          d="M 70,145 L 105,145 L 110,135 L 115,160 L 120,120 L 125,170 L 130,135 L 135,152 L 140,142 L 145,145 L 175,145" 
          stroke="url(#seismicGrad)" 
          strokeWidth="3.5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="seismic-wave-line" 
          filter="url(#neonGlow)" 
        />

        {/* ========================================================= */}
        {/* ORBITING DYNAMIC CORES & ROTATIONAL containment ARROWS   */}
        {/* ========================================================= */}
        <g className="animate-orbit-ring">
          {/* Tilted Orbital Ring */}
          <ellipse cx="100" cy="95" rx="92" ry="24" stroke="url(#goldGrad)" strokeWidth="3" fill="none" transform="rotate(-20 100 95)" />
          
          {/* Directional Golden Arrowheads wrapped along the orbit */}
          <g transform="rotate(-20 100 95)">
            {/* Top-Right Arrowhead */}
            <path d="M 192,95 L 202,90 L 197,102 Z" fill="url(#goldGrad)" />
            {/* Bottom-Left Arrowhead */}
            <path d="M 8,95 L -2,100 L 3,88 Z" fill="url(#goldGrad)" />
          </g>
        </g>
      </svg>
    </div>
  );

  if (layout === 'icon') {
    return renderLogoSVG();
  }

  if (layout === 'horizontal') {
    return (
      <div className="flex items-center gap-3">
        {renderLogoSVG()}
        <div className="flex flex-col justify-center select-none">
          <div className="flex items-center gap-1">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent uppercase font-sans">
              GeoAI
            </span>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-500 bg-clip-text text-transparent uppercase font-sans">
              Pro
            </span>
          </div>
          <span className="text-[8px] font-mono text-gray-500 tracking-[0.2em] uppercase font-semibold">
            Geophysics Intelligence Suite v4.0
          </span>
        </div>
      </div>
    );
  }

  // vertical layout (typically for loaders / splash screens)
  return (
    <div className="flex flex-col items-center text-center">
      {renderLogoSVG()}
      <div className="mt-4 flex flex-col items-center select-none">
        <div className="flex items-center gap-1.5">
          <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent uppercase font-sans">
            GeoAI
          </span>
          <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-500 bg-clip-text text-transparent uppercase font-sans">
            Pro
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 tracking-[0.25em] uppercase font-semibold mt-1">
          Multi-Dimensional Geophysics Intelligence Suite v4.0
        </span>
      </div>
    </div>
  );
}
