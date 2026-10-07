"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function EvidenceShaderScene() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Simulate high speed motion by scaling and moving
      const time = state.clock.elapsedTime;
      meshRef.current.position.z = (time * 10) % 20 - 10;
      meshRef.current.rotation.z = time * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[1, 5, 20, 32, 1, true]} />
        <meshBasicMaterial 
          color="#38BDF8" 
          wireframe 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
}
