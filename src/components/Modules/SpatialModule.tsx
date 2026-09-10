import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Box, 
  Map as MapIcon, 
  Layers, 
  Maximize2, 
  Download, 
  Zap, 
  Globe, 
  Mountain,
  Calendar,
  Compass
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';

import UniversalIngestionPort from '../Shared/UniversalIngestionPort';

interface SpatialModuleProps {
  onInteractCoords?: (coords: { x: number; y: number; z: number }) => void;
}

export default function SpatialModule({ onInteractCoords }: SpatialModuleProps) {
  const { rawPayloads, activeFileName, dataDimensions } = useGlobalGeoContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTerrain, setShowTerrain] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  
  // Interactive Timeline controls
  const [timeIndex, setTimeIndex] = useState<number>(2026);
  const timeIndexRef = useRef(timeIndex);

  // Maintain coordinates in local HUD
  const [selectedCoords, setSelectedCoords] = useState<{ x: number; y: number; z: number } | null>(null);
  
  const [anomalyDataState, setAnomalyDataState] = useState<any[]>([]);

  useEffect(() => {
    const raw = rawPayloads.spatialData;
    if (!raw || !raw.trim()) {
      setAnomalyDataState([]);
      return;
    }
    const lines = raw.split('\n');
    const parsedData = [];
    let hasHeader = false;
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#') || line.startsWith('~') || line.startsWith('//')) continue;
      const parts = line.split(/[,;\s\t]+/).filter(Boolean);
      if (!hasHeader && isNaN(Number(parts[0]))) {
        hasHeader = true;
        continue;
      }
      if (parts.length >= 4) {
        parsedData.push({
          x: Number(parts[0]),
          y: Number(parts[1]),
          z: Number(parts[2]),
          fault: Number(parts[3])
        });
      }
    }
    setAnomalyDataState(parsedData);
  }, [rawPayloads.spatialData]);

  // Sync state year value to ref for non-blocking animate-loop integration
  useEffect(() => {
    timeIndexRef.current = timeIndex;
  }, [timeIndex]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(16, 16, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(15, 25, 15);
    scene.add(directionalLight);

    // Terrain Geometry (Grid representing Spatial DEM/GeoTIFF)
    const geometry = new THREE.PlaneGeometry(30, 30, 48, 48);
    const material = new THREE.MeshPhongMaterial({
      color: 0x1c1c1e,
      wireframe: true,
      side: THREE.DoubleSide,
      flatShading: true
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Dynamic wave elevation logic
    const updateTerrainY = (tVal: number) => {
      const vertices = geometry.attributes.position;
      const waveShift = (tVal - 2026) * 0.25;
      
      for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);
        // Sinusoidal terrain curves responding dynamically to the Temporal year index
        const z = Math.sin(x * 0.15 + waveShift) * Math.cos(y * 0.15 + waveShift) * 2.2 + Math.cos(x * 0.05) * 1.5;
        vertices.setZ(i, z);
      }
      vertices.needsUpdate = true;
    };
    updateTerrainY(timeIndex);

    // Geological Anomalies group
    const anomalyGroup = new THREE.Group();
    const anomaliesList: THREE.Mesh[] = [];

    anomalyDataState.forEach((an, index) => {
      const height = Math.max(0.1, Math.abs(an.z));
      const anomalyGeom = new THREE.BoxGeometry(1.5, height, 1.5);
      
      const col = an.fault > 0.8 ? 0xFF0000 : 0x00FF00;
      
      const anomalyMat = new THREE.MeshPhongMaterial({ 
        color: col, 
        transparent: true, 
        opacity: 0.65,
        emissive: col,
        emissiveIntensity: 0.4
      });
      const mesh = new THREE.Mesh(anomalyGeom, anomalyMat);
      mesh.position.set(an.x, an.z / 2, an.y); // Set Position: [row.Grid_X, row.Elevation_Z / 2, row.Grid_Y]
      mesh.userData = { id: `DATAPOINT-${index + 1}`, value: an.fault };
      anomalyGroup.add(mesh);
      anomaliesList.push(mesh);
    });
    scene.add(anomalyGroup);

    // Dynamic marker mesh representing active drill target spot
    const drillMarkerGeom = new THREE.SphereGeometry(0.5, 16, 16);
    const drillMarkerMat = new THREE.MeshBasicMaterial({ color: 0x22C55E });
    const drillMarker = new THREE.Mesh(drillMarkerGeom, drillMarkerMat);
    drillMarker.visible = false;
    scene.add(drillMarker);

    // Tech grid floors
    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Raycast clicking targets logic
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      // Let user click on either the terrain plane or the anomalies
      const intersects = raycaster.intersectObjects([terrain, ...anomaliesList]);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        
        // Reposition drill marker sphere to point coordinates
        drillMarker.position.copy(point);
        drillMarker.visible = true;

        setSelectedCoords({ x: point.x, y: point.y, z: point.z });

        // Trigger parent callback instantly if registered
        if (onInteractCoords) {
          onInteractCoords({ x: point.x, y: point.y, z: point.z });
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation frames controller
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();

      const yearProgress = timeIndexRef.current;
      updateTerrainY(yearProgress);

      // Animate ore cubes: fluctuate sizing based on time and index speeds
      anomaliesList.forEach((mesh, index) => {
        mesh.visible = showAnomalies;
        const speed = 0.002 * (index + 1);
        const amp = 0.4 * ((yearProgress - 2024) / 5);
        mesh.scale.y = 1 + Math.sin(Date.now() * speed) * amp;
      });

      terrain.visible = showTerrain;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(reqId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [showTerrain, showAnomalies, onInteractCoords, anomalyDataState]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-[#1A1A1A] border border-[#333333] rounded-lg overflow-hidden">
        {/* Module Toolbar */}
        <div className="h-12 border-b border-[#333333] flex items-center justify-between px-4 bg-[#222222]">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <MapIcon size={16} className="text-[#FF5722]" />
                    <span className="text-xs font-bold uppercase font-mono tracking-tight text-white">{activeFileName} // DYNAMIC VIEWER</span>
                </div>
                <div className="h-4 w-px bg-[#333333]"></div>
                <div className="flex items-center gap-2 text-[10px] text-[#888888]">
                    <span className="bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 rounded text-green-400 font-bold font-mono">DIGITAL TWIN ONLINE</span>
                    <span className="font-mono">CRS: WGS-84 // ROT 360°</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-[#333333] rounded overflow-hidden p-0.5 bg-black/40">
                    <button 
                        onClick={() => setShowTerrain(!showTerrain)}
                        className={cn("px-2 py-1 text-[9px] font-bold uppercase transition-colors", showTerrain ? "bg-white/10 text-white" : "text-[#555555]")}
                    >
                        Terrain Contour
                    </button>
                    <button 
                        onClick={() => setShowAnomalies(!showAnomalies)}
                        className={cn("px-2 py-1 text-[9px] font-bold uppercase transition-colors", showAnomalies ? "bg-[#FF5722]/20 text-[#FF5722]" : "text-[#555555]")}
                    >
                        Anomalies Nodes
                    </button>
                </div>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
            {dataDimensions === '1D' ? (
                <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center bg-[#111] border border-[#333] m-4">
                    <span className="text-xl font-bold font-mono text-[#03A9F4] animate-pulse mb-2">Auto-Detected 1D Data Structure</span>
                    <span className="text-sm font-mono text-[#888] mb-4">Rendering Profiler View inside Spatial context...</span>
                    <div className="text-[10px] font-mono p-4 border border-[#444] bg-black text-gray-500">
                        {anomalyDataState.length > 0 ? (
                            anomalyDataState.map((d, i) => (
                                <div key={i}>{Object.values(d).join(', ')}</div>
                            )).slice(0, 10)
                        ) : 'NO DATA'}
                    </div>
                </div>
            ) : (
                <div className="flex-1 h-full relative">
                    <div ref={containerRef} className="w-full h-full cursor-pointer" />
                    
                    {/* Embedded raycast drilling selection coordinates popup */}
                    {selectedCoords && (
                      <div className="absolute right-6 top-6 bg-black/80 border border-[#FF5722]/40 p-3 rounded shadow-xl font-mono text-[10px] space-y-1 block max-w-xs animate-fade-in z-20">
                        <span className="text-[#FF5722] font-bold uppercase flex items-center gap-1">
                          <Compass size={12} className="text-[#FF5722] animate-spin" />
                          Active DrillCursor target
                        </span>
                        <div className="text-white/80">X: {selectedCoords.x.toFixed(3)}</div>
                        <div className="text-white/80">Y: {selectedCoords.y.toFixed(3)}</div>
                        <div className="text-white/80">Z: {selectedCoords.z.toFixed(3)} (Bore Depth)</div>
                        <p className="text-[8.5px] text-[#555] italic leading-tight mt-1">Clicked coordinate dispatched instantly to multi-agent swarm discussion boards.</p>
                      </div>
                    )}

                    {/* Left corner render diagnostic HUD */}
                    <div className="absolute left-6 bottom-16 space-y-1">
                        <div className="bg-black/60 backdrop-blur-md p-3 border border-[#333333] rounded font-mono">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase mb-1">
                                <Zap size={10} className="text-green-500" />
                                Render active
                            </div>
                            <p className="text-sm font-bold text-white tracking-tighter">FPS: 60.0 // GL_MESH_TWIN</p>
                        </div>
                    </div>

                    {/* Subsurface Phenomena Year Slide overlay */}
                    <div className="absolute inset-x-0 bottom-4 px-6 z-20">
                      <div className="bg-[#111]/90 border border-[#333] p-3 rounded-lg flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase shrink-0">
                          <Calendar size={14} className="text-[#FF5722]" />
                          <span>Temporal Slide</span>
                        </div>
                        <input 
                          type="range" 
                          min="2026" 
                          max="2035" 
                          step="1"
                          value={timeIndex} 
                          onChange={(e) => setTimeIndex(Number(e.target.value))}
                          className="flex-1 accent-[#FF5722] bg-[#222] h-1.5 rounded cursor-pointer"
                        />
                        <div className="text-xs font-mono font-black text-white px-2.5 py-1 bg-black rounded border border-[#222]">
                          YEAR {timeIndex}
                        </div>
                      </div>
                    </div>
                </div>
            )}

            {/* Spatial Layers sidebar indices */}
            <div className="w-56 border-l border-[#333333] p-4 bg-[#111111]/90 space-y-6">
                <UniversalIngestionPort 
                  moduleName="spatialData" 
                  contextKey="spatialData" 
                  onParsed={(p) => console.log('spatial parsed', p)} 
                  parserType="matrix"
                  presetLog={`Grid_X,Grid_Y,Elevation_Z,Fault_Probability\n-5,-4,2,0.9\n0,2,4,0.3\n5,6,6,0.1`}
                />
                
                <div>
                   <h4 className="text-[9px] font-bold uppercase text-[#555555] tracking-widest mb-3 mt-2">Subsurface Catalog</h4>
                   <div className="space-y-1.5">
                        <LayerItem icon={Mountain} label="Digital Elevation Model" active />
                        <LayerItem icon={Globe} label="Geostationary Imagery" />
                        <LayerItem icon={Layers} label="Subsurface Strata" active />
                        <LayerItem icon={Box} label="SHP Spatial Boundaries" />
                   </div>
                </div>

                <div>
                    <h4 className="text-[9px] font-bold uppercase text-[#555555] tracking-widest mb-3">Model metrics</h4>
                    <div className="bg-[#222]/40 p-3 rounded space-y-2 border border-[#333] font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-[#555]">MODEL BOUND</span>
                          <span>30x30m Grid</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#555]">MAX BORE DEPTH</span>
                          <span>-5.0m Normal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#555]">VERT ANOMALIES</span>
                          <span className="text-[#FF5722]">3 Active</span>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-[#FF5722]/5 border border-[#FF5722]/20 rounded text-[10px] font-mono text-[#888] leading-normal leading-normal">
                    <span className="font-bold text-white block mb-1">DRILLING SIMULATION</span>
                    Click on the terrain mesh or subsurface anomaly block to simulate virtual drilling cursor logging.
                </div>
            </div>
        </div>
    </div>
  );
}

function LayerItem({ icon: Icon, label, active = false }: any) {
    return (
        <label className="flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-2">
                <Icon size={12} className={active ? "text-[#FF5722]" : "text-[#444]"} />
                <span className={cn("text-[10.5px] font-semibold transition-colors uppercase tracking-tight", active ? "text-white" : "text-[#555] group-hover:text-[#888]")}>{label}</span>
            </div>
            <div className={cn("w-3 h-3 rounded border flex items-center justify-center transition-colors", active ? "bg-[#FF5722] border-[#FF5722]" : "border-[#333]")}>
                {active && <div className="w-1 h-1 bg-black rounded-full" />}
            </div>
        </label>
    );
}
