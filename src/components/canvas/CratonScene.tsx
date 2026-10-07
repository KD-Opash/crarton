"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, Stars } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 3000;

// Pre-calculate target shapes
const generateData = () => {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const rnd = new Float32Array(PARTICLE_COUNT);
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = 10 * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
    
    rnd[i] = Math.random();
  }
  return { positions: pos, randoms: rnd };
};

const { positions, randoms } = generateData();

export function CratonScene() {
  const scroll = useScroll();
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const offset = scroll.offset;
    const time = state.clock.getElapsedTime();
    
    // Rotate entire group slowly
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
      groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }

    if (pointsRef.current) {
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const r = randoms[i];
        
        // Target 0: Random chaos (offset < 0.05)
        const x0 = positions[i3] * 3;
        const y0 = positions[i3+1] * 3;
        const z0 = positions[i3+2] * 3;
        
        // Target 1: Tight Core (offset 0.1)
        const d1 = Math.sqrt(positions[i3]**2 + positions[i3+1]**2 + positions[i3+2]**2) || 1;
        const x1 = (positions[i3] / d1) * (1 + r * 2);
        const y1 = (positions[i3+1] / d1) * (1 + r * 2);
        const z1 = (positions[i3+2] / d1) * (1 + r * 2);

        // Target 2: RAccelerator Map (offset 0.25)
        const x2 = positions[i3] * 0.5 - 4;
        const y2 = (Math.sin(r * Math.PI * 2 + time) * 3);
        const z2 = positions[i3+2] * 0.5;

        // Target 3: ReviewsIntel (offset 0.35)
        const x3 = positions[i3] * 0.5 - 4;
        const y3 = positions[i3+1] * 0.5;
        const z3 = positions[i3+2] * 0.5;

        // Target 4: Core with Rings (offset 0.55)
        const isRing = r > 0.8;
        const radius = isRing ? 6 + r * 2 : 2 * r;
        const theta = r * Math.PI * 2;
        const x4 = isRing ? Math.cos(theta + time) * radius : positions[i3] * 0.3;
        const y4 = isRing ? Math.sin(time * 2 + r) * 0.5 : positions[i3+1] * 0.3;
        const z4 = isRing ? Math.sin(theta + time) * radius : positions[i3+2] * 0.3;

        // Blending logic based on offset
        let tx = x0, ty = y0, tz = z0;
        
        if (offset < 0.1) {
          const t = Math.min(1, offset / 0.1);
          tx = THREE.MathUtils.lerp(x0, x1, t);
          ty = THREE.MathUtils.lerp(y0, y1, t);
          tz = THREE.MathUtils.lerp(z0, z1, t);
        } else if (offset < 0.25) {
          const t = Math.min(1, (offset - 0.1) / 0.15);
          tx = THREE.MathUtils.lerp(x1, x2, t);
          ty = THREE.MathUtils.lerp(y1, y2, t);
          tz = THREE.MathUtils.lerp(z1, z2, t);
        } else if (offset < 0.35) {
          const t = Math.min(1, (offset - 0.25) / 0.1);
          tx = THREE.MathUtils.lerp(x2, x3, t);
          ty = THREE.MathUtils.lerp(y2, y3, t);
          tz = THREE.MathUtils.lerp(z2, z3, t);
        } else if (offset < 0.55) {
          const t = Math.min(1, (offset - 0.35) / 0.2);
          tx = THREE.MathUtils.lerp(x3, x4, t);
          ty = THREE.MathUtils.lerp(y3, y4, t);
          tz = THREE.MathUtils.lerp(z3, z4, t);
        } else {
          const t = Math.min(1, (offset - 0.55) / 0.3);
          tx = THREE.MathUtils.lerp(x4, x1, t);
          ty = THREE.MathUtils.lerp(y4, y1, t);
          tz = THREE.MathUtils.lerp(z4, z1, t);
        }

        // Add subtle wave motion to all
        tx += Math.sin(time * 2 + r * 10) * 0.05;
        ty += Math.cos(time * 2 + r * 10) * 0.05;
        
        // Smooth interpolation towards target
        positionsArray[i3] = THREE.MathUtils.lerp(positionsArray[i3], tx, 0.05);
        positionsArray[i3+1] = THREE.MathUtils.lerp(positionsArray[i3+1], ty, 0.05);
        positionsArray[i3+2] = THREE.MathUtils.lerp(positionsArray[i3+2], tz, 0.05);
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Material Color evolution
    if (materialRef.current) {
      const color = new THREE.Color();
      if (offset < 0.3) color.setHex(0xE28C65); // Sage
      else if (offset < 0.6) color.setHex(0xFFB284); // Copper
      else color.setHex(0xF8F3EC); // Cream
      
      materialRef.current.color.lerp(color, 0.05);
      
      // Flash intensity at signal
      if (offset > 0.4 && offset < 0.5) {
        materialRef.current.size = THREE.MathUtils.lerp(materialRef.current.size, 0.1, 0.1);
      } else {
        materialRef.current.size = THREE.MathUtils.lerp(materialRef.current.size, 0.03, 0.1);
      }
    }
    
    // Camera movement
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(offset * Math.PI * 2) * 5, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 10 - offset * 4, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={["#1D283C"]} />
      <ambientLight intensity={0.5} />
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      
      <group ref={groupRef}>
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={materialRef}
            size={0.03}
            color="#00F0FF"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </>
  );
}
