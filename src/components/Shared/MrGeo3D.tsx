import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  activeGesture: string;
  isSpeaking: boolean;
  dragged?: boolean;
}

function ProceduralMannequin({ activeGesture, isSpeaking, dragged }: Props) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  
  // Left Arm Joints
  const leftShoulder = useRef<THREE.Group>(null);
  const leftElbow = useRef<THREE.Group>(null);
  
  // Right Arm Joints
  const rightShoulder = useRef<THREE.Group>(null);
  const rightElbow = useRef<THREE.Group>(null);
  
  // Legs
  const leftHip = useRef<THREE.Group>(null);
  const leftKnee = useRef<THREE.Group>(null);
  const rightHip = useRef<THREE.Group>(null);
  const rightKnee = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (group.current) {
      group.current.position.y = Math.sin(t * 1) * 0.02;
      if (dragged) {
         group.current.rotation.y = t * 1.5;
         group.current.rotation.z = Math.sin(t * 3) * 0.1;
      } else {
         group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, 0.1);
         group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, 0.1);
      }
    }
    
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.8) * 0.1;
      head.current.rotation.x = Math.sin(t * 0.5) * 0.05;
      if (isSpeaking) {
        head.current.position.y = 1.15 + Math.abs(Math.sin(t * 8)) * 0.02;
      } else {
        head.current.position.y = 1.15;
      }
    }

    if (mouth.current) {
      if (isSpeaking) {
        mouth.current.scale.y = 0.5 + Math.abs(Math.sin(t * 15)) * 1.5;
        mouth.current.scale.x = 1.2;
      } else if (activeGesture === 'SAD' || activeGesture === 'ALERT') {
        mouth.current.scale.y = 0.2;
        mouth.current.scale.x = 0.5;
      } else if (activeGesture === 'SMILE' || activeGesture === 'GREETING' || activeGesture === 'DANCE') {
        mouth.current.scale.y = 0.8;
        mouth.current.scale.x = 1.5;
      } else {
        mouth.current.scale.y = 0.2;
        mouth.current.scale.x = 1;
      }
    }
    
    // Smooth reset function
    const lerpRot = (ref: React.RefObject<THREE.Group>, x: number, y: number, z: number) => {
      if (ref.current) {
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, x, 0.1);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, y, 0.1);
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, z, 0.1);
      }
    };

    if (leftShoulder.current && rightShoulder.current && leftElbow.current && rightElbow.current) {
      if (activeGesture === 'DANCE') {
        lerpRot(leftShoulder, Math.sin(t * 4), 0, Math.abs(Math.sin(t * 2)) * 1.5);
        lerpRot(leftElbow, -Math.abs(Math.sin(t * 4)), 0, 0);
        lerpRot(rightShoulder, -Math.sin(t * 4), 0, -Math.abs(Math.sin(t * 2)) * 1.5);
        lerpRot(rightElbow, -Math.abs(Math.cos(t * 4)), 0, 0);
      } else if (activeGesture === 'GREETING') {
        lerpRot(rightShoulder, -Math.PI / 2 + Math.sin(t * 5) * 0.2, 0, -0.5);
        lerpRot(rightElbow, -Math.PI / 4 + Math.sin(t * 5) * 0.3, 0, 0);
        lerpRot(leftShoulder, 0.1, 0, 0.1);
        lerpRot(leftElbow, -0.1, 0, 0);
      } else if (activeGesture === 'THUMBS_UP' || activeGesture === 'POINT_RIGHT') {
        lerpRot(rightShoulder, -Math.PI / 2, 0, 0);
        lerpRot(rightElbow, -Math.PI / 2, 0, 0);
        lerpRot(leftShoulder, 0.1, 0, 0.1);
        lerpRot(leftElbow, -0.1, 0, 0);
      } else if (activeGesture === 'COFFEE') {
        lerpRot(rightShoulder, -Math.PI / 2.5, 0, -0.2);
        lerpRot(rightElbow, -Math.PI / 2, 0, 0);
        lerpRot(leftShoulder, 0.1, 0, 0.1);
        lerpRot(leftElbow, -0.1, 0, 0);
      } else if (activeGesture === 'SEARCH' || activeGesture === 'READ') {
        lerpRot(leftShoulder, -Math.PI / 2.5, 0.3, 0.1);
        lerpRot(leftElbow, -Math.PI / 4, 0, 0);
        lerpRot(rightShoulder, -Math.PI / 2.5, -0.3, -0.1);
        lerpRot(rightElbow, -Math.PI / 4, 0, 0);
      } else {
        // Idle
        lerpRot(leftShoulder, Math.sin(t * 1) * 0.05, 0, 0.1);
        lerpRot(leftElbow, -0.1 + Math.sin(t * 1) * 0.02, 0, 0);
        lerpRot(rightShoulder, -Math.sin(t * 1) * 0.05, 0, -0.1);
        lerpRot(rightElbow, -0.1 - Math.sin(t * 1) * 0.02, 0, 0);
      }
    }
  });

  const skinColor = "#fbcfe8";
  const suitColor = "#1e1e1e";
  const pantColor = "#171717";
  const shoeColor = "#0a0a0a";

  const Hand = ({ isLeft }: { isLeft: boolean }) => (
    <group position={[0, -0.4, 0]}>
      {/* Palm */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.04]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Thumb */}
      <mesh position={[isLeft ? 0.05 : -0.05, -0.02, 0.02]} rotation={[0, 0, isLeft ? Math.PI/4 : -Math.PI/4]}>
        <cylinderGeometry args={[0.012, 0.012, 0.06]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Fingers */}
      {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
        <mesh key={i} position={[x, -0.12, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.06 - Math.abs(x)*0.5]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group ref={group} position={[0, -0.9, 0]}>
      {/* Body / Torso */}
      <mesh position={[0, 0.6, 0]}>
        {/* Wider shoulders, narrower waist */}
        <cylinderGeometry args={[0.25, 0.2, 0.7, 16]} />
        <meshStandardMaterial color={suitColor} roughness={0.7} />
      </mesh>
      
      {/* Tie */}
      <mesh position={[0, 0.7, 0.26]}>
        <boxGeometry args={[0.05, 0.4, 0.02]} />
        <meshStandardMaterial color="#ff5722" />
      </mesh>

      {/* Head Group */}
      <group ref={head} position={[0, 1.15, 0]}>
        {/* Neck */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.15]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.4} />
        </mesh>
        {/* Sunglasses */}
        <mesh position={[0, 0.05, 0.23]}>
          <boxGeometry args={[0.35, 0.1, 0.1]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.1} />
        </mesh>
        {/* Mouth */}
        <mesh ref={mouth} position={[0, -0.1, 0.23]}>
          <boxGeometry args={[0.08, 0.02, 0.05]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Hair / Headpiece */}
        <mesh position={[0, 0.2, -0.05]}>
          <boxGeometry args={[0.4, 0.15, 0.4]} />
          <meshStandardMaterial color="#2d3748" roughness={0.9} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftShoulder} position={[-0.32, 0.85, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.4, 16]} />
          <meshStandardMaterial color={suitColor} />
        </mesh>
        <group ref={leftElbow} position={[0, -0.4, 0]}>
          {/* Elbow Joint */}
          <mesh position={[0, 0, 0]}>
             <sphereGeometry args={[0.06, 16, 16]} />
             <meshStandardMaterial color={suitColor} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.06, 0.05, 0.4, 16]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <Hand isLeft={true} />
          {/* Props Left Hand */}
          {(activeGesture === 'SEARCH' || activeGesture === 'READ') && (
            <mesh position={[0, -0.45, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.2, 0.3, 0.02]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          )}
        </group>
      </group>

      {/* Right Arm */}
      <group ref={rightShoulder} position={[0.32, 0.85, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.4, 16]} />
          <meshStandardMaterial color={suitColor} />
        </mesh>
        <group ref={rightElbow} position={[0, -0.4, 0]}>
          {/* Elbow Joint */}
          <mesh position={[0, 0, 0]}>
             <sphereGeometry args={[0.06, 16, 16]} />
             <meshStandardMaterial color={suitColor} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.06, 0.05, 0.4, 16]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          <Hand isLeft={false} />
          
          {/* Props Right Hand */}
          {activeGesture === 'COFFEE' && (
            <mesh position={[0, -0.45, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          )}
        </group>
      </group>
      
      {/* Pelvis */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.2]} />
        <meshStandardMaterial color={pantColor} />
      </mesh>

      {/* Left Leg */}
      <group ref={leftHip} position={[-0.12, 0.15, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.5, 16]} />
          <meshStandardMaterial color={pantColor} />
        </mesh>
        <group ref={leftKnee} position={[0, -0.5, 0]}>
          {/* Knee Joint */}
          <mesh position={[0, 0, 0]}>
             <sphereGeometry args={[0.07, 16, 16]} />
             <meshStandardMaterial color={pantColor} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.5, 16]} />
            <meshStandardMaterial color={pantColor} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.5, 0.05]}>
            <boxGeometry args={[0.12, 0.08, 0.25]} />
            <meshStandardMaterial color={shoeColor} metalness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group ref={rightHip} position={[0.12, 0.15, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.5, 16]} />
          <meshStandardMaterial color={pantColor} />
        </mesh>
        <group ref={rightKnee} position={[0, -0.5, 0]}>
          {/* Knee Joint */}
          <mesh position={[0, 0, 0]}>
             <sphereGeometry args={[0.07, 16, 16]} />
             <meshStandardMaterial color={pantColor} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.5, 16]} />
            <meshStandardMaterial color={pantColor} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.5, 0.05]}>
            <boxGeometry args={[0.12, 0.08, 0.25]} />
            <meshStandardMaterial color={shoeColor} metalness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function MrGeo3D({ activeGesture, isSpeaking, dragged }: Props) {
  return (
    <div className="w-[120px] h-[150px] relative z-10 pointer-events-auto">
      <Canvas 
        camera={{ position: [0, 0.2, 3.5], fov: 50 }} 
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 5, 2]} intensity={2.5} castShadow />
        <pointLight position={[-2, -2, -2]} intensity={1} color="#00e5ff" />
        
        <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
          <ProceduralMannequin activeGesture={activeGesture} isSpeaking={isSpeaking} dragged={dragged} />
        </Float>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
