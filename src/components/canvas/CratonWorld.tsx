"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const PARTICLE_COUNT = 3000;

function CoreModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
    
    // Animate color based on progress (Bulb is at progress 0.5)
    const progress = useStore.getState().progress;
    if (materialRef.current) {
      const distToBulb = Math.abs(progress - 0.5);
      const intensity = Math.max(0, 1 - distToBulb * 6); // peaks at 1 when progress is 0.5
      
      const defaultColor = new THREE.Color("#38BDF8");
      const bulbColor = new THREE.Color("#FBBF24"); // Glowing filament color
      
      materialRef.current.color.lerpColors(defaultColor, bulbColor, intensity);
      materialRef.current.opacity = 0.15 + intensity * 0.4;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 1]} />
      <meshBasicMaterial ref={materialRef} color="#38BDF8" wireframe transparent opacity={0.15} />
    </mesh>
  );
}

export function CratonWorld() {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);

  // Generate the 5 shapes
  const shapes = useMemo(() => {
    const random = new Float32Array(PARTICLE_COUNT * 3);
    const sphere = new Float32Array(PARTICLE_COUNT * 3);
    const bulb = new Float32Array(PARTICLE_COUNT * 3);
    const infinity = new Float32Array(PARTICLE_COUNT * 3);
    const grid = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // 1. Scattered (Random)
      random[i3] = (Math.random() - 0.5) * 40;
      random[i3 + 1] = (Math.random() - 0.5) * 40;
      random[i3 + 2] = (Math.random() - 0.5) * 40;

      // 2. Sphere
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
      const r = 6;
      sphere[i3] = r * Math.cos(theta) * Math.sin(phi);
      sphere[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      sphere[i3 + 2] = r * Math.cos(phi);

      // 3. Lightbulb (Lamp shape)
      const bulbT = i / PARTICLE_COUNT;
      // Parametric lightbulb curve: y goes from -4 to 4
      const y = -4 + bulbT * 8; 
      let br = 0;
      if (y > 1) {
        // Top spherical globe (radius 3, center at y=1)
        br = Math.sqrt(9 - Math.pow(y - 1, 2)); 
      } else if (y > -2) {
        // Tapering neck
        // at y=1, r=3; at y=-2, r=1.5
        br = 1.5 + (y + 2) * 0.5;
      } else {
        // Base threads / cylinder
        br = 1.5;
      }
      
      // Add some subtle noise to make it look like a particle cloud
      const noise = (Math.random() - 0.5) * 0.3;
      const finalR = br + noise;
      const bTheta = i * 2.39996; // Golden angle for even distribution
      
      bulb[i3] = finalR * Math.cos(bTheta);
      bulb[i3 + 1] = y + 1; // Shift up so it centers visually
      bulb[i3 + 2] = finalR * Math.sin(bTheta);

      // 4. Infinity Loop (Lissajous)
      const t = (i / PARTICLE_COUNT) * Math.PI * 2;
      const spread = Math.random() * 1.5; 
      infinity[i3] = 10 * Math.sin(t) + (Math.random() - 0.5) * spread;
      infinity[i3 + 1] = 5 * Math.sin(t) * Math.cos(t) + (Math.random() - 0.5) * spread;
      infinity[i3 + 2] = (Math.random() - 0.5) * 2;

      // 5. Grid (Represents "Craton" foundation)
      const gridSize = Math.ceil(Math.sqrt(PARTICLE_COUNT));
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const spacing = 0.5;
      grid[i3] = (col - gridSize / 2) * spacing;
      grid[i3 + 1] = (row - gridSize / 2) * spacing;
      grid[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    return [random, sphere, bulb, infinity, grid];
  }, []);

  // Initialize particles at the random shape
  const positions = useMemo(() => new Float32Array(shapes[0]), [shapes]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Performance opt: read directly from state instead of re-rendering
    const progress = useStore.getState().progress;
    
    // Determine which two shapes we are morphing between
    const scaledProgress = progress * 4;
    const currentShapeIndex = Math.min(Math.floor(scaledProgress), 3);
    const nextShapeIndex = currentShapeIndex + 1;
    const morphFactor = scaledProgress - currentShapeIndex; 

    const currentArray = shapes[currentShapeIndex];
    const nextArray = shapes[nextShapeIndex];
    const geom = pointsRef.current.geometry;
    const posAttribute = geom.attributes.position;

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      const targetVal = THREE.MathUtils.lerp(currentArray[i], nextArray[i], morphFactor);
      positions[i] = THREE.MathUtils.lerp(positions[i], targetVal, 0.1); 
    }
    posAttribute.needsUpdate = true;

    // Slowly rotate the entire system
    pointsRef.current.rotation.y += delta * 0.1;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
    // Animate color based on progress (Bulb is at progress 0.5)
    if (pointsMaterialRef.current) {
      const distToBulb = Math.abs(progress - 0.5);
      const intensity = Math.max(0, 1 - distToBulb * 6);
      const defaultColor = new THREE.Color("#38BDF8");
      const bulbColor = new THREE.Color("#FBBF24");
      pointsMaterialRef.current.color.lerpColors(defaultColor, bulbColor, intensity);
    }
  });

  return (
    <group>
      <CoreModel />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMaterialRef}
          size={0.08}
          color="#38BDF8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
}
