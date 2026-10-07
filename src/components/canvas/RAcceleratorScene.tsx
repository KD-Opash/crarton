"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function RAcceleratorScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[2, 0, 0]}>
      {/* Abstract structure representing the regulatory map */}
      <mesh>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.2} />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.2} />
      </mesh>

      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#38BDF8" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}
