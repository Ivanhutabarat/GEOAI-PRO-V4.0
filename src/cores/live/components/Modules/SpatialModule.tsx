import { processIncomingData } from '../Shared/SwarmRoom';
import { forceMapData, DebugDump } from '../../../../lib/forceRenderMapper';
import { Fallback3D } from '../Shared/Fallback3D';
import { useAppContext } from '../../context/AppContext';
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
import { useApiMonitorStore } from '../../store/ApiMonitorStore';

import UniversalIngestionPort from '../Shared/UniversalIngestionPort';
import { spatialPayload } from '../../../../data/mocks/spatial';

interface SpatialModuleProps {
  onInteractCoords?: (coords: { x: number; y: number; z: number }) => void;
}

export default function SpatialModule({ onInteractCoords }: SpatialModuleProps) {
  const { globalData,   rawPayloads, activeFileName  } = useGlobalGeoContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTerrain, setShowTerrain] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [webglError, setWebglError] = useState<string | null>(null);
  
  // Interactive Timeline controls
  const [timeIndex, setTimeIndex] = useState<number>(2026);
  const timeIndexRef = useRef(timeIndex);

  // Maintain coordinates in local HUD
  const [selectedCoords, setSelectedCoords] = useState<{ x: number; y: number; z: number } | null>(null);
  
  const [anomalyDataState, setAnomalyDataState] = useState<any[]>([]);

  const { apiMode, dimensionMode } = useAppContext();
  useEffect(() => {
    
    const updateData = () => {
      let generatedPoints = [];
      if (globalData.spatialData && globalData.spatialData.length > 0) {
        generatedPoints = globalData.spatialData.map((row: any) => ({
          x: parseFloat(row.grid_x || row.Grid_X || row[0] || 0),
          y: parseFloat(row.grid_y || row.Grid_Y || row[1] || 0),
          z: parseFloat(row.elevation_z || row.Elevation_Z || row[2] || 0),
          fault: parseFloat(row.fault_probability || row.Fault_Probability || row[3] || 0)
        }));
      } else {
        generatedPoints = spatialPayload.map(p => ({
          x: p.lon,
          y: p.lat,
          z: p.elevation,
          fault: p.risk_index > 0.5 ? 1 : 0
        }));
      }
      setAnomalyDataState(generatedPoints);
    };
    
    updateData(); // initial Update

  }, [activeFileName, apiMode]);

  // Sync state year value to ref for non-blocking animate-loop integration
  useEffect(() => {
    timeIndexRef.current = timeIndex;
  }, [timeIndex]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let rendererInstance: THREE.WebGLRenderer | null = null;
    let controlsInstance: any = null;
    let reqId: number | null = null;
    let isCleanedUp = false;

    // Placeholders for callbacks so they are accessible in scoping
    let handleCanvasClick: ((event: MouseEvent) => void) | null = null;
    let handleResize: (() => void) | null = null;

    try {
      // Scene Setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(16, 16, 24);

      const webGlRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      if (!webGlRenderer || !webGlRenderer.domElement) {
        throw new Error("Three.js WebGLRenderer domElement is null or undefined");
      }
      rendererInstance = webGlRenderer;
      rendererInstance.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(rendererInstance.domElement);

      controlsInstance = new OrbitControls(camera, rendererInstance.domElement);
      controlsInstance.enableDamping = true;
      controlsInstance.dampingFactor = 0.05;

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

      handleCanvasClick = (event: MouseEvent) => {
        if (!rendererInstance || !rendererInstance.domElement || !rendererInstance.domElement.parentNode) return;
        const rect = rendererInstance.domElement.getBoundingClientRect();
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

      if (rendererInstance && rendererInstance.domElement && rendererInstance.domElement.parentNode) {
        rendererInstance.domElement.addEventListener('click', handleCanvasClick);
      }

      // Animation frames controller
      const animate = () => {
        if (isCleanedUp) return;
        reqId = requestAnimationFrame(animate);
        if (controlsInstance) controlsInstance.update();

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

        if (rendererInstance) rendererInstance.render(scene, camera);
      };
      animate();

      handleResize = () => {
        if (!container || !rendererInstance) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        rendererInstance.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);
      setWebglError(null);
    } catch (err: any) {
      console.warn("WebGL Spatial twin fails initialization:", err);
      setWebglError(err?.message || "WebGL initialization failure");
    }

    return () => {
      isCleanedUp = true;
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (rendererInstance && rendererInstance.domElement) {
        // Component Dismount Guard: check element and its parent
        if (rendererInstance.domElement && rendererInstance.domElement.parentNode) {
          if (handleCanvasClick) {
            try {
              rendererInstance.domElement.removeEventListener('click', handleCanvasClick);
            } catch (e) {}
          }
          if (container.contains(rendererInstance.domElement)) {
            try {
              container.removeChild(rendererInstance.domElement);
            } catch (e) {}
          }
        }
      }
      if (reqId) cancelAnimationFrame(reqId);
      if (controlsInstance) {
        try {
          controlsInstance.dispose();
        } catch (e) {}
      }
      if (rendererInstance) {
        try {
          rendererInstance.dispose();
        } catch (e) {}
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
            {dimensionMode === '1D' ? (
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
                    {webglError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0f] p-4 text-center">
                            <span className="text-sm font-bold font-mono text-red-500 uppercase mb-2">3D Graphic Pipeline Offline</span>
                            <p className="text-xs font-mono text-[#888] max-w-sm leading-relaxed mb-4">
                                {webglError}. Please verify WebGL is enabled in your browser settings.
                            </p>
                            <div className="p-3 bg-black/40 border border-[#222] rounded text-[10px] text-gray-400 font-mono text-left max-w-md w-full">
                                <span className="text-yellow-500 font-bold block mb-1">DATA RECOVERY MODE ACTIVATED //</span>
                                {anomalyDataState.length > 0 ? (
                                    <span>Successfully parsed {anomalyDataState.length} geo-spatial lithology nodes. Context recovered.</span>
                                ) : (
                                    <span>Waiting for valid geological .las or spatial .shp data payload.</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div ref={containerRef} className="w-full h-full cursor-pointer" />
                    )}
                    
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
                    <p className="absolute bottom-[80px] right-6 text-[9px] text-[#555] font-mono z-30">{import.meta.env.VITE_CHART_WATERMARK}</p>

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
