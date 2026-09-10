import { processIncomingData } from '../Shared/SwarmRoom';
import React, { useRef, useState, useMemo, Component, ReactNode, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Center, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGeoDataStore, LithologyLayer, GeoDataPoint } from '../../store/GeoDataStore';
import { useGlobalGeoContext } from '../../context/GlobalGeoContext';
import { DebugDump } from '../../../../lib/forceRenderMapper';


function MountainVisualization({ payload, planes }: { payload: any, planes: THREE.Plane[] }) {
  const { geometry } = useMemo(() => {
    const segments = 128;
    const geo = new THREE.PlaneGeometry(20, 20, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    let pts: Array<any> = [];
    if (payload?.features && Array.isArray(payload.features)) {
      pts = payload.features;
    } else if (payload?.x && payload?.y && payload?.z) {
      const len = Math.min(payload.x.length, payload.y.length, payload.z.length);
      for(let i=0; i<len; i++) pts.push({x: payload.x[i], y: payload.y[i], z: parseFloat(payload.z[i])||0});
    }

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let yDisp = 0;
      if (pts.length > 0) {
         let distToCenter = Math.sqrt(x*x + z*z);
         let mountainFactor = Math.max(0, 10 - distToCenter) / 10;
         yDisp = (Math.sin(x*1.2) * Math.cos(z*1.2) * 2 + Math.cos(x*2.5)*0.5) * mountainFactor;
         yDisp += Math.max(0, 4 - distToCenter*0.5); 
      } else {
         yDisp = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2 + Math.cos(x * 1.5) * Math.sin(z * 1.5) * 0.5;
         yDisp += Math.max(0, (1 - Math.sqrt(x*x + z*z)/10) * 4); // central peak
      }

      pos.setY(i, yDisp);

      const colorVal = new THREE.Color();
      if (yDisp > 2.5) {
         colorVal.setHex(0xffffff);
      } else if (yDisp > 1.0) {
         colorVal.setHex(0x554433);
      } else if (yDisp > 0.0) {
         colorVal.setHex(0x33aa33);
      } else {
         colorVal.setHex(0x225522);
      }

      colors[i * 3] = colorVal.r;
      colors[i * 3 + 1] = colorVal.g;
      colors[i * 3 + 2] = colorVal.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return { geometry: geo };
  }, [payload]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} flatShading roughness={0.8} metalness={0.1} clippingPlanes={planes} />
      </mesh>
    </group>
  );
}

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

function PointCloudVisualization({ payload, planes }: { payload: any, planes: THREE.Plane[] }) {
  const pointsData = useMemo(() => {
    let pts: { x: number, y: number, z: number, color: string }[] = [];

    if (payload.features && Array.isArray(payload.features)) {
      pts = payload.features.map((f: any) => ({
        x: Number(f.x) || 0,
        y: Number(f.y) || 0,
        z: Number(f.z) || 0,
        color: f.color || '#00E5FF'
      }));
    } else if (payload.x && payload.y && payload.z) {
      const len = Math.min(payload.x.length, payload.y.length, payload.z.length);
      for (let i = 0; i < len; i++) {
        pts.push({
          x: Number(payload.x[i]) || 0,
          y: Number(payload.y[i]) || 0,
          z: Number(payload.z[i]) || 0,
          color: payload.color?.[i] || '#00E5FF'
        });
      }
    }

    if (pts.length === 0) return { positions: new Float32Array(0), colors: new Float32Array(0), count: 0 };

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const zs = pts.map(p => p.z);

    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const minZ = Math.min(...zs), maxZ = Math.max(...zs);

    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const spanZ = maxZ - minZ || 1;

    const positions = new Float32Array(pts.length * 3);
    const colors = new Float32Array(pts.length * 3);

    pts.forEach((p, idx) => {
      const mx = -8 + ((p.x - minX) / spanX) * 16;
      const my = -4 + ((p.y - minY) / spanY) * 8;
      const mz = -8 + ((p.z - minZ) / spanZ) * 16;

      positions[idx * 3] = mx;
      positions[idx * 3 + 1] = my;
      positions[idx * 3 + 2] = mz;

      const c = new THREE.Color(p.color);
      colors[idx * 3] = c.r;
      colors[idx * 3 + 1] = c.g;
      colors[idx * 3 + 2] = c.b;
    });

    return { positions, colors, count: pts.length };
  }, [payload]);

  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    if (geometryRef.current && pointsData.count > 0) {
      geometryRef.current.setAttribute('position', new THREE.BufferAttribute(pointsData.positions, 3));
      geometryRef.current.setAttribute('color', new THREE.BufferAttribute(pointsData.colors, 3));
      geometryRef.current.computeBoundingSphere();
    }
  }, [pointsData]);

  if (pointsData.count === 0) return null;

  return (
    <points>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial size={0.5} vertexColors sizeAttenuation transparent opacity={0.9} clippingPlanes={planes} />
    </points>
  );
}

function SeismicPlaneVisualization({ payload, planes }: { payload: any, planes: THREE.Plane[] }) {
  const vp = payload.vp_m_s || [];
  const twt = payload.twt_ms || [];

  const { geometry } = useMemo(() => {
    const segments = 32;
    const geo = new THREE.PlaneGeometry(16, 16, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const avgVp = vp.length > 0 ? vp.reduce((s: number, val: number) => s + val, 0) / vp.length : 2500;
    const avgTwt = twt.length > 0 ? twt.reduce((s: number, val: number) => s + val, 0) / twt.length : 1500;
    
    const freq1 = 0.2 + (avgVp / 15000);
    const freq2 = 0.3 + (avgTwt / 6000);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let yDisp = Math.sin(x * freq1) * Math.cos(z * freq2) * 1.8;
      yDisp += Math.cos(x * freq1 * 2.1) * Math.sin(z * freq2 * 1.8) * 0.5;

      pos.setY(i, yDisp);

      const normalizedHeight = (yDisp + 2.3) / 4.6;
      const capped = Math.max(0, Math.min(1, normalizedHeight));

      const colorVal = new THREE.Color();
      colorVal.setHSL(0.66 * (1 - capped), 1.0, 0.5);

      colors[i * 3] = colorVal.r;
      colors[i * 3 + 1] = colorVal.g;
      colors[i * 3 + 2] = colorVal.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return { geometry: geo };
  }, [vp, twt]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} flatShading roughness={0.6} metalness={0.1} clippingPlanes={planes} />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.12} clippingPlanes={planes} />
      </mesh>
    </group>
  );
}

function WellBoreholeVisualization({ payload, planes }: { payload: any, planes: THREE.Plane[] }) {
  const depths = payload.depth_ft || [];
  const gr = payload.gamma_ray_api || [];

  const segments = useMemo(() => {
    if (depths.length === 0) return [];

    const minDepth = Math.min(...depths);
    const maxDepth = Math.max(...depths);
    const depthSpan = maxDepth - minDepth || 1;

    const list: { yStart: number; yEnd: number; color: string; grVal: number }[] = [];

    for (let i = 0; i < depths.length - 1; i++) {
      const d1 = depths[i];
      const d2 = depths[i + 1];
      const g = gr[i] !== undefined ? gr[i] : (gr[i - 1] !== undefined ? gr[i - 1] : 50);

      const yStart = 5 - ((d1 - minDepth) / depthSpan) * 10;
      const yEnd = 5 - ((d2 - minDepth) / depthSpan) * 10;

      let segmentColor = '#fcd34d';
      if (g > 100) {
        segmentColor = '#4b5563';
      } else if (g > 60) {
        segmentColor = '#9ca3af';
      } else if (g > 30) {
        segmentColor = '#facc15';
      }

      list.push({ yStart, yEnd, color: segmentColor, grVal: g });
    }

    return list;
  }, [depths, gr]);

  if (segments.length === 0) {
    return (
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 10, 16]} />
        <meshStandardMaterial color="#888888" roughness={0.4} clippingPlanes={planes} />
      </mesh>
    );
  }

  return (
    <group>
      {segments.map((seg, idx) => {
        const height = Math.abs(seg.yStart - seg.yEnd);
        const yPos = (seg.yStart + seg.yEnd) / 2;
        if (height <= 0.01) return null;

        return (
          <mesh key={idx} position={[0, yPos, 0]}>
            <cylinderGeometry args={[0.5, 0.5, height, 16]} />
            <meshStandardMaterial color={seg.color} roughness={0.5} metalness={0.1} clippingPlanes={planes} />
          </mesh>
        );
      })}
    </group>
  );
}

function generateStratumGeometry(
  width: number,
  length: number,
  xSegs: number,
  ySegs: number,
  hBottomFn: (x: number, z: number) => number,
  hTopFn: (x: number, z: number) => number
) {
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  const halfW = width / 2;
  const halfL = length / 2;
  const dx = width / xSegs;
  const dz = length / ySegs;

  const addTriangle = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ) => {
    const startIdx = vertices.length / 3;
    vertices.push(...p1, ...p2, ...p3);
    indices.push(startIdx, startIdx + 1, startIdx + 2);
    uvs.push(0, 0, 1, 0, 1, 1);
  };

  const addQuad = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    p4: [number, number, number]
  ) => {
    addTriangle(p1, p2, p3);
    addTriangle(p1, p3, p4);
  };

  // 1. Top and Bottom Surfaces
  for (let i = 0; i < xSegs; i++) {
    for (let j = 0; j < ySegs; j++) {
      const x0 = -halfW + i * dx;
      const x1 = x0 + dx;
      const z0 = -halfL + j * dz;
      const z1 = z0 + dz;

      const yTop00 = hTopFn(x0, z0);
      const yTop10 = hTopFn(x1, z0);
      const yTop11 = hTopFn(x1, z1);
      const yTop01 = hTopFn(x0, z1);

      addQuad(
        [x0, yTop00, z0],
        [x0, yTop01, z1],
        [x1, yTop11, z1],
        [x1, yTop10, z0]
      );

      const yBot00 = hBottomFn(x0, z0);
      const yBot10 = hBottomFn(x1, z0);
      const yBot11 = hBottomFn(x1, z1);
      const yBot01 = hBottomFn(x0, z1);

      addQuad(
        [x0, yBot00, z0],
        [x1, yBot10, z0],
        [x1, yBot11, z1],
        [x0, yBot01, z1]
      );
    }
  }

  // 2. Side Walls
  // Left wall (x = -halfW)
  for (let j = 0; j < ySegs; j++) {
    const x = -halfW;
    const z0 = -halfL + j * dz;
    const z1 = z0 + dz;

    const yBot0 = hBottomFn(x, z0);
    const yBot1 = hBottomFn(x, z1);
    const yTop0 = hTopFn(x, z0);
    const yTop1 = hTopFn(x, z1);

    addQuad(
      [x, yBot1, z1],
      [x, yBot0, z0],
      [x, yTop0, z0],
      [x, yTop1, z1]
    );
  }

  // Right wall (x = halfW)
  for (let j = 0; j < ySegs; j++) {
    const x = halfW;
    const z0 = -halfL + j * dz;
    const z1 = z0 + dz;

    const yBot0 = hBottomFn(x, z0);
    const yBot1 = hBottomFn(x, z1);
    const yTop0 = hTopFn(x, z0);
    const yTop1 = hTopFn(x, z1);

    addQuad(
      [x, yBot0, z0],
      [x, yBot1, z1],
      [x, yTop1, z1],
      [x, yTop0, z0]
    );
  }

  // Front wall (z = -halfL)
  for (let i = 0; i < xSegs; i++) {
    const z = -halfL;
    const x0 = -halfW + i * dx;
    const x1 = x0 + dx;

    const yBot0 = hBottomFn(x0, z);
    const yBot1 = hBottomFn(x1, z);
    const yTop0 = hTopFn(x0, z);
    const yTop1 = hTopFn(x1, z);

    addQuad(
      [x0, yBot0, z],
      [x1, yBot1, z],
      [x1, yTop1, z],
      [x0, yTop0, z]
    );
  }

  // Back wall (z = halfL)
  for (let i = 0; i < xSegs; i++) {
    const z = halfL;
    const x0 = -halfW + i * dx;
    const x1 = x0 + dx;

    const yBot0 = hBottomFn(x0, z);
    const yBot1 = hBottomFn(x1, z);
    const yTop0 = hTopFn(x0, z);
    const yTop1 = hTopFn(x1, z);

    addQuad(
      [x1, yBot1, z],
      [x0, yBot0, z],
      [x0, yTop0, z],
      [x1, yTop1, z]
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function CompassAxis() {
  return (
    <group position={[6.5, -3.9, 6.5]}>
      {/* Circle dial */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.05, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} />
      </mesh>
      
      {/* N Arrow */}
      <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.1, 0.25, 4]} />
        <meshBasicMaterial color="#ff5722" />
      </mesh>
      {/* S, E, W marks */}
      <mesh position={[1.0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.18, 4]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
      <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.18, 4]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
      <mesh position={[0, 0, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.18, 4]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
    </group>
  );
}

interface EarthGeologicalBlockModelProps {
  sliceZ: number;
  planes: THREE.Plane[];
}

function EarthGeologicalBlockModel({ sliceZ, planes }: EarthGeologicalBlockModelProps) {
  const layers = useGeoDataStore(state => state.layers);
  const points = useGeoDataStore(state => state.points);

  const stratumRanges = useMemo(() => {
    if (!layers || layers.length === 0) {
      return [
        { name: 'Basement', color: '#7c3aed', hBot: -4, hTop: 4 }
      ];
    }
    const sorted = [...layers].sort((a, b) => b.depthStart - a.depthStart);
    
    const minDepth = Math.min(...sorted.map(l => l.depthEnd), -60);
    const maxDepth = Math.max(...sorted.map(l => l.depthStart), 0);
    const depthSpan = maxDepth - minDepth || 1;

    const mapDepthToY = (depth: number) => {
      const pct = (depth - minDepth) / depthSpan;
      return -4.0 + pct * 8.0;
    };

    return sorted.map((layer) => ({
      name: layer.name,
      color: layer.color,
      hBot: mapDepthToY(layer.depthEnd),
      hTop: mapDepthToY(layer.depthStart)
    }));
  }, [layers]);

  const getBoundaryHeights = useCallback((x: number, z: number) => {
    const N = stratumRanges.length;
    const heights: number[] = [];
    
    heights.push(-4.0);
    
    for (let k = 1; k <= N; k++) {
      const targetBot = stratumRanges[k - 1].hBot;
      const targetTop = stratumRanges[k - 1].hTop;
      const targetThickness = targetTop - targetBot;

      const depthFactor = 1.0 - Math.abs((targetBot + targetTop) / 8.0);
      const foldAmp = 0.55 * depthFactor;
      
      const fold1 = foldAmp * Math.sin(0.35 * x + k * 0.4) * Math.cos(0.3 * z + k * 0.3);
      const fold2 = 0.15 * Math.sin(0.8 * x - k * 0.6);
      const dip = -0.06 * x;
      
      let dataPerturbation = 0;
      if (points && points.length > 0) {
        let totalWeight = 0;
        let weightedVal = 0;
        const samplePts = points.slice(0, 20);
        for (const pt of samplePts) {
          const [px, py, pz] = pt.position;
          const dx = x - px;
          const dz = z - pz;
          const dSq = dx * dx + dz * dz + 0.3;
          const w = 1.0 / dSq;
          totalWeight += w;
          weightedVal += py * w;
        }
        if (totalWeight > 0) {
          dataPerturbation = (weightedVal / totalWeight) * 0.25;
        }
      }

      const totalUndulation = fold1 + fold2 + dip + dataPerturbation;
      const undulatedHeight = Math.max(heights[k - 1] + 0.15, heights[k - 1] + targetThickness + totalUndulation);
      heights.push(undulatedHeight);
    }
    return heights;
  }, [stratumRanges, points]);

  const stratumGeometries = useMemo(() => {
    const N = stratumRanges.length;
    const geometries: THREE.BufferGeometry[] = [];

    for (let layerIdx = 0; layerIdx < N; layerIdx++) {
      const hBottomFn = (x: number, z: number) => {
        const bounds = getBoundaryHeights(x, z);
        return bounds[layerIdx];
      };

      const hTopFn = (x: number, z: number) => {
        const bounds = getBoundaryHeights(x, z);
        return bounds[layerIdx + 1];
      };

      const geo = generateStratumGeometry(16, 16, 16, 16, hBottomFn, hTopFn);
      geometries.push(geo);
    }

    return geometries;
  }, [stratumRanges, getBoundaryHeights]);

  return (
    <group>
      {stratumGeometries.map((geo, idx) => {
        const info = stratumRanges[idx];
        if (!info) return null;

        return (
          <group key={`stratum_group_${idx}`}>
            <mesh geometry={geo}>
              <meshStandardMaterial 
                color={info.color} 
                roughness={0.7} 
                metalness={0.15} 
                clippingPlanes={planes}
                side={THREE.DoubleSide}
              />
            </mesh>

            <mesh geometry={geo}>
              <meshBasicMaterial 
                color="#0c0d10" 
                wireframe 
                transparent 
                opacity={0.16} 
                clippingPlanes={planes}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(16, 8, 16)]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.25} />
      </lineSegments>

      <CompassAxis />
    </group>
  );
}

function GeologicalModel({ sliceZ, activePayload }: { sliceZ: number, activePayload: any }) {
  const points = useGeoDataStore(state => state.points);

  const planes = useMemo(() => {
    const offset = 8.0 - (sliceZ / 100) * 16.0;
    return [new THREE.Plane(new THREE.Vector3(0, 0, -1), offset)];
  }, [sliceZ]);

  const isScenarioA = useMemo(() => {
    if (!activePayload) return false;
    if (activePayload.geometry_type === "Raw Point Cloud 3D") return true;
    if (activePayload.features && Array.isArray(activePayload.features)) return true;
    if (activePayload.x && activePayload.y && activePayload.z) return true;
    return false;
  }, [activePayload]);

  const isScenarioB = useMemo(() => {
    if (!activePayload) return false;
    return activePayload.vp_m_s && activePayload.twt_ms;
  }, [activePayload]);

  const isScenarioC = useMemo(() => {
    if (!activePayload) return false;
    return activePayload.depth_ft && activePayload.gamma_ray_api;
  }, [activePayload]);

  const isTopography = useMemo(() => {
    if (!activePayload) return false;
    if (activePayload.geometry_type === "Topography 3D" || activePayload.geometry_type === "Elevation Grid") return true;
    return false;
  }, [activePayload]);

  return (
    <group>
      <EarthGeologicalBlockModel sliceZ={sliceZ} planes={planes} />

      {isTopography && (
        <MountainVisualization payload={activePayload} planes={planes} />
      )}

      {isScenarioA && (
        <PointCloudVisualization payload={activePayload} planes={planes} />
      )}

      {isScenarioB && (
        <SeismicPlaneVisualization payload={activePayload} planes={planes} />
      )}

      {isScenarioC && (
        <WellBoreholeVisualization payload={activePayload} planes={planes} />
      )}

      {points.length > 0 && (
         <group>
          {points.map((pt) => {
            const [x, y, z] = pt.position;
            return (
              <mesh key={pt.id} position={[x, y, z]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshStandardMaterial color={pt.color} emissive={pt.color} emissiveIntensity={0.6} clippingPlanes={planes} />
              </mesh>
            );
          })}
         </group>
      )}
    </group>
  );
}

export default function SpatialTwinEngine({ sliceZ, activePayload, eventSource }: { sliceZ: number, activePayload: any, eventSource: HTMLDivElement | null }) {
  const points = useGeoDataStore(state => state.points);
  return (
    <SceneErrorBoundary>
      <DebugDump data={[]} forceShow={false} />
      <Canvas camera={{ position: [18, 12, 18], fov: 42 }} gl={{ localClippingEnabled: true, antialias: true }}>
        <color attach="background" args={['#070709']} />
        <fog attach="fog" args={['#070709', 20, 60]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} color="#fff1e6" />
        <pointLight position={[-15, -5, -15]} intensity={1.0} color="#b8c5e6" />
        <Center>
          <GeologicalModel sliceZ={sliceZ} activePayload={activePayload} />
        </Center>
        <Grid infiniteGrid fadeDistance={40} fadeStrength={5} cellColor="#222" sectionColor="#333" position={[0, -5, 0]} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI} minPolarAngle={0} />
      </Canvas>
    </SceneErrorBoundary>
  );
}