"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Wireframe, TorusKnot, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

function RAcceleratorMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();
  const isLight = theme === "light";
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
      <TorusKnot ref={meshRef} args={[1.2, 0.4, 256, 32]}>
        <meshStandardMaterial color={isLight ? "#e5e7eb" : "#0a0b0a"} metalness={isLight ? 0.3 : 0.9} roughness={isLight ? 0.2 : 0.1} />
        <Wireframe fillMix={isLight ? 0.2 : 0.1} fillOpacity={isLight ? 0.3 : 0.1} stroke={isLight ? "#0284c7" : "#e28c65"} thickness={0.01} colorBackfaces={false} />
      </TorusKnot>
    </Float>
  );
}

export function RAcceleratorModel() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="w-full h-full cursor-grab active:cursor-grabbing">
      <ambientLight intensity={isLight ? 1 : 0.5} />
      <directionalLight position={[10, 10, 5]} intensity={isLight ? 3 : 2} color={isLight ? "#0369a1" : "#e28c65"} />
      <directionalLight position={[-10, -10, -5]} intensity={isLight ? 2 : 1} color={isLight ? "#008992" : "#00f0ff"} />
      <RAcceleratorMesh />
    </Canvas>
  );
}

export function ReviewsIntelModel() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="w-full h-full cursor-grab active:cursor-grabbing">
      <ambientLight intensity={isLight ? 1 : 0.5} />
      <directionalLight position={[10, 10, 5]} intensity={isLight ? 3 : 2} color={isLight ? "#008992" : "#00f0ff"} />
      <directionalLight position={[-10, -10, -5]} intensity={isLight ? 2 : 1} color={isLight ? "#0369a1" : "#e28c65"} />
      <Float speed={3} rotationIntensity={1.5} floatIntensity={2}>
        <Icosahedron args={[1.5, 3]}>
          <MeshDistortMaterial color={isLight ? "#e5e7eb" : "#0a0b0a"} distort={0.5} speed={3} metalness={isLight ? 0.3 : 0.9} roughness={isLight ? 0.2 : 0.1} emissive={isLight ? "#ffffff" : "#001015"} />
          <Wireframe fillMix={0} stroke={isLight ? "#008992" : "#00f0ff"} thickness={0.01} colorBackfaces={false} />
        </Icosahedron>
      </Float>
    </Canvas>
  );
}
