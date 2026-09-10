// src/components/Modules/SpatialTwin.tsx
import React, { useRef, useState, useMemo, Component, ReactNode, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Layers, Maximize, Settings } from 'lucide-react';
import { useGeoDataStore, LithologyLayer } from '../../store/GeoDataStore';
import SpatialControlPanel from './SpatialControlPanel';

class SceneErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-[#111] text-red-500 font-mono text-xs border border-red-900 rounded p-4 text-center z-50">
          <div>
            <p className="font-bold mb-2 uppercase">3D Scene Mount Failure</p>
            <p className="text-[#888]">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function VolumetricLayerMesh({ layer, faultActive, faultPositionX, planes, index }: { layer: LithologyLayer, faultActive: boolean, faultPositionX: number, planes: THREE.Plane[], index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const thickness = (layer.depthStart - layer.depthEnd) * 0.2; // absolute scale factor
    // Box structure to represent a volumetric mesh (Finite Element Style)
    // using multiple segments to allow for smooth deformation
    const geo = new THREE.BoxGeometry(24, thickness, 24, 64, 4, 64);
    
    // Default Y offset for the layer block (centering it)
    const yCenter = (layer.depthStart + layer.depthEnd) * 0.1;
    geo.translate(0, yCenter, 0);

    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      
      // Natural stratigraphic waviness
      let yDisp = Math.sin(v.x * 0.4) * 0.15 + Math.cos(v.z * 0.4) * 0.15;
      
      // Sharp Tectonic Fault Displacement
      if (faultActive) {
        const distanceToFault = v.x - faultPositionX;
        
        // Right side drops down by 1.8 units (Normal Fault Simulation)
        if (distanceToFault > 0) {
          yDisp -= 1.8;
          // Drag fold / Plastic deformation near the fault zone
          if (distanceToFault < 2.0) {
            yDisp += Math.sin((distanceToFault / 2.0) * Math.PI) * 0.6;
          }
        } else {
           // Footwall drag upward
           if (distanceToFault > -2.0) {
              yDisp += Math.sin((distanceToFault / 2.0) * Math.PI) * 0.6;
           }
        }
      }
      
      pos.setY(i, v.y + yDisp);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [layer, faultActive, faultPositionX]);

  return (
    <group>
       <mesh ref={meshRef} geometry={geometry}>
         <meshStandardMaterial color={layer.color} side={THREE.DoubleSide} flatShading roughness={0.8} metalness={0.1} clippingPlanes={planes} />
       </mesh>
       <mesh geometry={geometry}>
         <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.08} clippingPlanes={planes} />
       </mesh>
    </group>
  );
}

function GeologicalModel({ sliceZ }: { sliceZ: number }) {
  const points = useGeoDataStore(state => state.points);
  const layers = useGeoDataStore(state => state.layers);
  const faultActive = useGeoDataStore(state => state.faultActive);
  const faultPositionX = useGeoDataStore(state => state.faultPositionX);

  const planes = useMemo(() => {
    // Z translation mapping
    const zOffset = 12 - (sliceZ / 100) * 24;
    return [new THREE.Plane(new THREE.Vector3(0, 0, -1), zOffset)];
  }, [sliceZ]);

  return (
    <group>
      {layers.map((layer, idx) => (
        <VolumetricLayerMesh 
          key={layer.name} 
          layer={layer} 
          faultActive={faultActive} 
          faultPositionX={faultPositionX} 
          planes={planes} 
          index={idx} 
        />
      ))}

      {points.length > 0 && (
         <group>
          {points.map((pt) => {
            const [x, y, z] = pt.position;
            return (
              <mesh key={pt.id} position={[x, y, z]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color={pt.color} emissive={pt.color} emissiveIntensity={0.8} clippingPlanes={planes} />
              </mesh>
            );
          })}
         </group>
      )}
    </group>
  );
}

export default function SpatialTwin() {
  const [sliceZ, setSliceZ] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const layers = useGeoDataStore(state => state.layers);
  const faultActive = useGeoDataStore(state => state.faultActive);
  const setFaultActive = useGeoDataStore(state => state.setFaultActive);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] overflow-hidden rounded-md border border-[#333] shadow-lg relative font-sans">
      {/* Sci-Fi Header Panel */}
      <div className="flex justify-between items-center px-5 py-3 bg-[#111112] border-b border-[#222] z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#FF5722]/10 text-[#FF5722] rounded border border-[#FF5722]/30">
            <Layers size={16} />
          </div>
          <div>
            <span className="font-bold text-white text-xs tracking-widest flex items-center gap-2 uppercase font-mono">
              3D VOLUMETRIC DIGITAL TWIN
            </span>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
               <span className="text-[9px] text-[#00E5FF] uppercase tracking-widest font-mono font-bold">Mesh Rendering Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest font-bold">Fault Tectonics</label>
            <button 
              onClick={() => setFaultActive(!faultActive)}
              className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border ${faultActive ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-[#222] text-[#555] border-[#333]'}`}
            >
              {faultActive ? 'ENGAGED' : 'DISABLED'}
            </button>
          </div>
          <div className="h-6 w-px bg-[#333]"></div>
          <div className="flex flex-col gap-1 items-end">
            <label className="text-[9px] font-mono text-[#888] uppercase tracking-widest font-bold">Z-Slice Depth (%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliceZ} 
              onChange={(e) => setSliceZ(Number(e.target.value))}
              className="accent-[#FF5722] w-32 outline-none h-1 bg-[#222] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#FF5722] [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
          <div className="h-6 w-px bg-[#333]"></div>
          <button onClick={() => setShowPanel(!showPanel)} className={`p-1.5 rounded transition-colors focus:outline-none ${showPanel ? 'bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/50' : 'bg-[#1a1a1a] text-[#888] border border-[#333] hover:bg-[#222] hover:text-white'}`}>
            <Settings size={14} />
          </button>
          <button className="p-1.5 bg-[#1a1a1a] text-[#888] border border-[#333] hover:bg-[#222] hover:text-white rounded transition-colors focus:outline-none">
            <Maximize size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative cursor-crosshair w-full bg-gradient-to-b from-[#050505] to-[#121214]">
        {showPanel && <SpatialControlPanel onClose={() => setShowPanel(false)} />}
        
        <SceneErrorBoundary>
          <Canvas camera={{ position: [18, 12, 18], fov: 42 }} gl={{ localClippingEnabled: true, antialias: true }}>
            <color attach="background" args={['#070709']} />
            <fog attach="fog" args={['#070709', 20, 60]} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} color="#fff1e6" />
            <pointLight position={[-15, -5, -15]} intensity={1.0} color="#b8c5e6" />
            
            <Center>
              <GeologicalModel sliceZ={sliceZ} />
            </Center>
            
            <Grid infiniteGrid fadeDistance={40} fadeStrength={5} cellColor="#222" sectionColor="#333" position={[0, -5, 0]} />
            
            <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 + 0.1} />
          </Canvas>
        </SceneErrorBoundary>
        
        {/* Continuous Color Scale Legend */}
        <div className="absolute bottom-6 left-6 pointer-events-none z-10">
          <div className="bg-[#111112]/90 backdrop-blur-md border border-[#333] p-4 rounded-lg shadow-2xl font-mono text-xs min-w-[240px]">
             <div className="font-bold text-[#aaa] text-[10px] uppercase tracking-widest mb-3 border-b border-[#222] pb-2 flex justify-between items-center">
               <span>Lithology Strata</span>
               <span className="text-[#00E5FF]">FEM MESH</span>
             </div>
             
             <div className="flex flex-col gap-3">
               {layers.map((layer) => (
                 <div key={layer.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-sm shadow-inner" style={{ backgroundColor: layer.color }}></div>
                     <span className="text-[#ddd] text-[10px] tracking-tight">{layer.name}</span>
                   </div>
                   <span className="text-[#555] text-[9px]">D: {Math.abs(layer.depthStart)}m</span>
                 </div>
               ))}
             </div>

             <div className="mt-4 pt-3 border-t border-[#222]">
                <div className="w-full h-1.5 rounded-full bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${layers[0].color}, ${layers[1].color}, ${layers[2].color})` }}></div>
             </div>

             <div className="mt-3 flex items-center justify-between text-[8px] text-[#555] uppercase tracking-widest font-bold">
               <span>XYZ INTERPOLATION: SHARP</span>
               <span>v4.0.0</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
