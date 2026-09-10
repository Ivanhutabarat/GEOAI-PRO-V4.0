import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Grid, Text } from '@react-three/drei';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, ShieldCheck, Flame, Droplet, Layers, Cpu, Compass, Binary, AlertTriangle } from 'lucide-react';
import { Coordinates } from '../types';

// ==========================================
// SPATIAL TWIN (Three.js 3D Canvas)
// ==========================================

const AnimatedMesh = ({ position, color, type }: { position: [number, number, number], color: string, type: 'box' | 'sphere' }) => {
  const meshRef = useRef<any>();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  if (type === 'sphere') {
    return (
      <Sphere ref={meshRef} position={position} args={[1, 32, 32]}>
        <meshStandardMaterial color={color} wireframe />
      </Sphere>
    );
  }
  return (
    <Box ref={meshRef} position={position} args={[1, 1, 1]}>
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </Box>
  );
};

export const SpatialTwin = ({ coordinates }: { coordinates: Coordinates }) => {
  return (
    <div className="flex-1 min-h-[400px] bg-stone-950 border border-stone-850 rounded relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 z-10 bg-stone-900/80 p-3 rounded backdrop-blur border border-stone-800">
        <h3 className="text-orange-550 font-mono text-[11px] font-bold tracking-widest uppercase mb-1">Spatial Twin Core</h3>
        <p className="text-stone-300 font-mono text-[10px]">X: {coordinates.x} | Y: {coordinates.y} | Z: {coordinates.depth}</p>
      </div>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <color attach="background" args={['#0c0a09']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Grid args={[20, 20]} sectionColor="#ea580c" cellColor="#44403c" fadeDistance={30} />
        <AnimatedMesh position={[0, Math.sin((coordinates.depth || 0) * 0.01), 0]} color="#ea580c" type="box" />
        <AnimatedMesh position={[-2, -1, 2]} color="#14b8a6" type="sphere" />
        <AnimatedMesh position={[2, -2, -2]} color="#8b5cf6" type="sphere" />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
};

// ==========================================
// WELL LOGGING (Recharts + Auto-Lithology)
// ==========================================

const WELL_DATA = Array.from({ length: 30 }).map((_, i) => ({
  depth: i * 10,
  gamma: 20 + Math.random() * 80 + (i > 15 ? 50 : 0),
  resistivity: 100 - Math.random() * 40 - (i > 15 ? 20 : 0),
  porosity: 10 + Math.random() * 20
}));

export const WellLogging = () => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-[400px]">
      <div className="flex-1 bg-stone-950 border border-stone-850 rounded p-4 flex flex-col items-center justify-center">
        <h3 className="text-orange-550 font-mono text-[11px] font-bold tracking-widest uppercase mb-4 self-start">Dynamic Well Logging</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={WELL_DATA} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
            <XAxis dataKey="depth" stroke="#a8a29e" fontSize={10} />
            <YAxis yAxisId="gamma" stroke="#a8a29e" fontSize={10} domain={[0, 200]} />
            <YAxis yAxisId="res" stroke="#eab308" fontSize={10} domain={[0, 150]} orientation="right" />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#f5f5f4', fontSize: '11px', fontFamily: 'monospace' }} />
            <Line yAxisId="gamma" dataKey="gamma" stroke="#ea580c" strokeWidth={2} dot={false} name="Gamma Ray (API)" />
            <Line yAxisId="res" dataKey="resistivity" stroke="#eab308" strokeWidth={2} dot={false} name="Resistivity (Ohmm)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Auto-Lithology Side Panel */}
      <div className="w-full lg:w-64 bg-stone-950 border border-stone-850 rounded p-4">
        <h3 className="text-orange-550 font-mono text-[11px] font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Auto-Lithology
        </h3>
        <div className="space-y-2">
          <div className="p-3 bg-stone-900 border border-stone-800 rounded">
            <span className="text-[10px] font-mono text-stone-400">SURFACE LAYER (0-150m)</span>
            <div className="text-stone-200 text-sm font-semibold mt-1">Alluvium Sandstone</div>
            <div className="text-[10px] text-emerald-500 font-mono mt-1">Porosity Normal</div>
          </div>
          <div className="p-3 bg-stone-900 border border-stone-800 rounded">
            <span className="text-[10px] font-mono text-stone-400">DEEP STRAT (151-300m)</span>
            <div className="text-stone-200 text-sm font-semibold mt-1">Shale / Mudstone</div>
            <div className="text-[10px] text-red-500 font-mono mt-1">High Gamma Marker</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// GAS & AIR QUALITY
// ==========================================

const GAS_DATA = [
  { time: '08:00', ch4: 400, h2s: 10, co2: 1200 },
  { time: '09:00', ch4: 800, h2s: 15, co2: 1300 },
  { time: '10:00', ch4: 1500, h2s: 40, co2: 1400 },
  { time: '11:00', ch4: 3200, h2s: 85, co2: 2100 },
  { time: '12:00', ch4: 2800, h2s: 60, co2: 1900 },
  { time: '13:00', ch4: 1100, h2s: 25, co2: 1500 }
];

export const GasAirQuality = () => {
  return (
    <div className="flex-1 flex flex-col min-h-[400px] bg-stone-950 border border-stone-850 rounded p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-orange-550 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2">
          <Flame className="w-4 h-4" /> Hazard Gas Emissions
        </h3>
        <span className="text-[10px] bg-red-950/40 text-red-500 border border-red-900/50 px-2 py-1 rounded font-mono animate-pulse flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> H2S PLUME DETECTED
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={GAS_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
          <XAxis dataKey="time" stroke="#a8a29e" fontSize={10} />
          <YAxis stroke="#a8a29e" fontSize={10} domain={[0, 4000]} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#f5f5f4', fontSize: '11px', fontFamily: 'monospace' }} />
          <Area type="monotone" dataKey="ch4" stroke="#eab308" fill="#eab308" fillOpacity={0.2} name="Metane (CH4)" />
          <Area type="monotone" dataKey="h2s" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} name="Hydrogen Sulfide (H2S)" />
          <Area type="monotone" dataKey="co2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} name="Carbon Dioxide (CO2)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==========================================
// GENERIC DASHBOARD FALLBACK
// ==========================================

export const GenericDashboard = ({ moduleName }: { moduleName: string }) => {
  return (
    <div className="flex-1 min-h-[400px] bg-stone-950 border border-stone-850 rounded p-6 flex flex-col justify-center items-center text-center">
      <Activity className="w-12 h-12 text-stone-700 mb-4 animate-pulse" />
      <h3 className="text-stone-300 font-mono text-lg font-bold tracking-widest uppercase mb-2">{moduleName} Online</h3>
      <p className="text-stone-500 text-xs font-mono max-w-sm">
        Diagnostics for {moduleName} are actively streaming from field nodes. Awaiting trigger consensus for deeper sub-analysis.
      </p>
    </div>
  );
};
