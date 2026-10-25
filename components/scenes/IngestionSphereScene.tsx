"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PointMaterial, Points } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

interface IngestionSphereProps {
  energy: number;
  isFiltered: boolean;
  pointerX?: number;
  pointerY?: number;
}

const PARTICLE_COUNT = 3200;

function IngestionSphereModel({ energy, isFiltered, pointerX = 0, pointerY = 0 }: IngestionSphereProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const innerCoreRef = useRef<THREE.Mesh>(null!);
  const ringsRef = useRef<THREE.Group>(null!);
  const smoothedEnergy = useRef(energy);
  const smoothedFilter = useRef(isFiltered ? 1 : 0);

  // Fibonacci sphere particle distribution
  const { initialPositions, goldenThetas, yNormals } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const thetas = new Float32Array(PARTICLE_COUNT);
    const yNorms = new Float32Array(PARTICLE_COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;

      pos[i * 3] = Math.cos(theta) * radius * 1.8;
      pos[i * 3 + 1] = y * 1.8;
      pos[i * 3 + 2] = Math.sin(theta) * radius * 1.8;

      thetas[i] = theta;
      yNorms[i] = y;
    }

    return { initialPositions: pos, goldenThetas: thetas, yNormals: yNorms };
  }, []);

  const dynamicPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    smoothedEnergy.current = THREE.MathUtils.damp(smoothedEnergy.current, energy, 4.0, delta);
    smoothedFilter.current = THREE.MathUtils.damp(smoothedFilter.current, isFiltered ? 1 : 0, 3.0, delta);

    const curEnergy = smoothedEnergy.current;
    const filterFactor = smoothedFilter.current; // 0 = raw, 1 = filtered

    // Particle deformation
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const k = i * 3;
      const baseX = initialPositions[k];
      const baseY = initialPositions[k + 1];
      const baseZ = initialPositions[k + 2];
      const theta = goldenThetas[i];
      const y = yNormals[i];

      // Raw noise vs filtered harmonic harmonics
      const rawNoise = (Math.sin(theta * 12 + time * 6) * Math.cos(y * 8 - time * 4)) * (1 - filterFactor) * (0.35 + curEnergy * 0.5);
      const harmonicWave = (Math.sin(theta * 4 + time * 2.5) * 0.12 + Math.cos(y * 6 + time * 3) * 0.08) * filterFactor * (0.2 + curEnergy * 0.4);
      const pulse = 1 + (curEnergy * 0.45) + rawNoise + harmonicWave;

      dynamicPositions[k] = baseX * pulse;
      dynamicPositions[k + 1] = baseY * pulse;
      dynamicPositions[k + 2] = baseZ * pulse;
    }

    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    attr.needsUpdate = true;

    // Gentle rotation
    pointsRef.current.rotation.y += delta * (0.12 + curEnergy * 0.35);
    pointsRef.current.rotation.x = THREE.MathUtils.damp(pointsRef.current.rotation.x, pointerY * 0.2, 3, delta);
    pointsRef.current.rotation.z = THREE.MathUtils.damp(pointsRef.current.rotation.z, -pointerX * 0.2, 3, delta);

    // Inner wireframe core
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * (0.18 + curEnergy * 0.4);
      innerCoreRef.current.rotation.x += delta * 0.1;
      const coreScale = 0.9 + Math.sin(time * 3) * 0.05 + curEnergy * 0.3;
      innerCoreRef.current.scale.setScalar(coreScale);
    }

    // Expanding sound-wave rings
    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, index) => {
        const ring = child as THREE.Mesh;
        const ringSpeed = 0.8 + index * 0.3;
        const cycle = ((time * ringSpeed + index * 1.5) % 4.5);
        const radius = 1.2 + cycle * 0.9 + curEnergy * 0.5;
        ring.scale.setScalar(radius);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.7 - (cycle / 4.5) * 0.7) * (0.4 + curEnergy * 0.6);
        ring.rotation.z += delta * (0.1 + index * 0.05);
      });
    }
  });

  return (
    <group>
      {/* Dynamic Audio Particle Sphere */}
      <Points ref={pointsRef} positions={dynamicPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={isFiltered ? "#00FF88" : "#00F0FF"}
          size={0.038}
          sizeAttenuation
          depthWrite={false}
          opacity={0.88}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Inner Central Octahedron Core */}
      <mesh ref={innerCoreRef}>
        <octahedronGeometry args={[0.9, 2]} />
        <meshBasicMaterial
          color={isFiltered ? "#10B981" : "#00F0FF"}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Expanding Waveform Sonar Rings */}
      <group ref={ringsRef}>
        {[0, 1, 2, 3].map((ringIndex) => (
          <mesh key={ringIndex} rotation={[Math.PI / 2 + ringIndex * 0.2, 0, 0]}>
            <ringGeometry args={[0.95, 0.98, 64]} />
            <meshBasicMaterial
              color={ringIndex % 2 === 0 ? "#00FF88" : "#00F0FF"}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function IngestionSphereScene({
  energy = 0.2,
  isFiltered = false,
  pointerX = 0,
  pointerY = 0
}: IngestionSphereProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full min-h-[420px] bg-black/60 rounded-xl" aria-hidden="true" />;
  }

  return (
    <div className="w-full h-full min-h-[420px] relative rounded-xl overflow-hidden" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 6]} color="#00F0FF" intensity={1.5} distance={15} />
        <pointLight position={[-4, -3, -4]} color="#00FF88" intensity={1.2} distance={15} />
        <IngestionSphereModel
          energy={energy}
          isFiltered={isFiltered}
          pointerX={pointerX}
          pointerY={pointerY}
        />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={9.0}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.4}
        />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
