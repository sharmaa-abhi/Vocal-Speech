"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PointMaterial, Points } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

type SceneCanvasProps = { stage: number; energy: number; emotion: number; compact?: boolean; pointerX?: number; pointerY?: number };
const PARTICLE_COUNT = 3600;

function makeSphereSamples(count: number) {
  const list: { x: number; y: number; z: number; u: number; phi: number; jitter: number }[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    list.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius, u: i / count, phi: theta, jitter: Math.sin(i * 78.233) * 0.5 + 0.5 });
  }
  return list;
}

function NeuralModel({ stage, energy, emotion, compact, pointerX = 0, pointerY = 0 }: { stage: number; energy: number; emotion: number; compact?: boolean; pointerX?: number; pointerY?: number }) {
  const particleRef = useRef<THREE.Points>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Group>(null!);
  const smoothedStage = useRef(stage);
  const smoothedEnergy = useRef(0);
  const samples = useMemo(() => makeSphereSamples(PARTICLE_COUNT), []);
  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const targetA = new THREE.Vector3();
  const targetB = new THREE.Vector3();

  const positionForShape = (sample: (typeof samples)[number], index: number, shape: number, time: number, audioEnergy: number, emotionValue: number, out: THREE.Vector3) => {
    const { x, y, z, u, phi, jitter } = sample;
    if (shape === 0) {
      const r = 1.58 + audioEnergy * 0.44 + Math.sin(time * 2.2 + phi * 2.1) * 0.055;
      out.set(x * r, y * r, z * r);
    } else if (shape === 1) {
      const lane = (index % 3) - 1;
      const waveX = (u - 0.5) * 5.3;
      const waveY = Math.sin(u * 30 + time * 1.6 + lane) * (0.22 + audioEnergy * 0.45)
        + Math.sin(u * 8.5 + time * 0.8 + lane * 0.9) * 0.33
        + Math.sin(u * 69 + time * 2.5 + lane) * 0.045;
      out.set(waveX, waveY + lane * 0.48, Math.cos(u * 14 + time + lane) * 0.23 + lane * 0.1);
    } else if (shape === 2) {
      const ringSegment = index % 72;
      const depthSegment = Math.floor(index / 72) % 50;
      const theta = (ringSegment / 72) * Math.PI * 2 + time * 0.08;
      const depth = (depthSegment / 49 - 0.5) * 5.2;
      const r = 1.05 + Math.sin(depth * 3.5 + time * 1.4 + jitter) * 0.15 + audioEnergy * 0.08;
      out.set(Math.cos(theta) * r, Math.sin(theta) * r, depth);
    } else if (shape === 3) {
      const base = 1.1 + audioEnergy * 0.18;
      const axis = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
      const spike = Math.pow(axis, 10) * (0.3 + emotionValue * 0.82);
      const r = base + spike + Math.sin(time * (1.2 + emotionValue) + phi * 4) * 0.035;
      out.set(x * r, y * r, z * r);
    } else {
      const shieldWidth = 1.48 * (1 - 0.2 * y);
      const shieldHeight = 1.68;
      const edge = 1 + 0.025 * Math.cos(phi * 8 + time * 0.45);
      out.set(x * shieldWidth * edge, y * shieldHeight, z * 1.13 * (1 - 0.11 * y) * edge);
      if (y < -0.45) out.y -= Math.pow((-y - 0.45) * 2.2, 2) * 0.15;
    }
    return out;
  };

  useFrame((state, delta) => {
    if (!particleRef.current) return;
    const time = state.clock.elapsedTime;
    smoothedStage.current = THREE.MathUtils.damp(smoothedStage.current, stage, 1.65, delta);
    smoothedEnergy.current = THREE.MathUtils.damp(smoothedEnergy.current, energy, 4.2, delta);
    const tStage = smoothedStage.current;
    // Camera choreography is scroll-linked: push into the spectral tunnel, then ease back for triage.
    const cameraTargetZ = tStage > 1.55 && tStage < 2.7 ? 4.65 : tStage > 3.35 ? 6.7 : 7.4;
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, cameraTargetZ, 1.1, delta);
    const cameraSway = compact ? Math.sin(time * 0.55) * 0.18 : 0;
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, (tStage > 1.6 && tStage < 2.7 ? 0.18 : 0) + cameraSway, 1.0, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, compact ? Math.cos(time * 0.42) * 0.1 : 0, 1.0, delta);
    state.camera.lookAt(0, 0, 0);
    const stageA = Math.floor(tStage);
    const stageB = Math.min(4, stageA + 1);
    const mix = THREE.MathUtils.smoothstep(tStage - stageA, 0, 1);
    const currentEnergy = smoothedEnergy.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const sample = samples[i];
      positionForShape(sample, i, stageA, time, currentEnergy, emotion, targetA);
      positionForShape(sample, i, stageB, time, currentEnergy, emotion, targetB);
      const k = i * 3;
      positions[k] = THREE.MathUtils.lerp(targetA.x, targetB.x, mix);
      positions[k + 1] = THREE.MathUtils.lerp(targetA.y, targetB.y, mix);
      positions[k + 2] = THREE.MathUtils.lerp(targetA.z, targetB.z, mix);
    }
    const attribute = particleRef.current.geometry.attributes.position as THREE.BufferAttribute;
    attribute.needsUpdate = true;
    particleRef.current.rotation.y += delta * (0.055 + currentEnergy * 0.2);
    particleRef.current.rotation.x = THREE.MathUtils.damp(particleRef.current.rotation.x, pointerY * 0.14, 2.5, delta);
    particleRef.current.rotation.z = THREE.MathUtils.damp(particleRef.current.rotation.z, -pointerX * 0.12, 2.5, delta);
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * (0.13 + emotion * 0.18);
      coreRef.current.rotation.y += delta * (0.22 + currentEnergy * 0.8);
      const pulse = 1 + Math.sin(time * 2.1) * 0.035 + currentEnergy * 0.18;
      coreRef.current.scale.setScalar(pulse * (tStage > 1.6 && tStage < 2.65 ? 0.64 : 0.82));
    }
    if (haloRef.current) {
      haloRef.current.rotation.z += delta * (0.025 + emotion * 0.05);
      haloRef.current.rotation.x = Math.sin(time * 0.2) * 0.12;
      haloRef.current.position.y = compact ? Math.sin(time * 0.8) * 0.1 : 0;
    }
  });

  return (
    <group>
      <Points ref={particleRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#00F0FF" size={0.023} sizeAttenuation depthWrite={false} opacity={0.9} blending={THREE.AdditiveBlending} />
      </Points>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.77, 2]} />
        <meshBasicMaterial color="#00FF88" wireframe transparent opacity={0.72} />
      </mesh>
      <group ref={haloRef}>
        <mesh rotation={[Math.PI / 2.8, 0.5, 0]}>
          <torusGeometry args={[1.95, 0.006, 6, 160]} />
          <meshBasicMaterial color="#00F0FF" transparent opacity={0.42} />
        </mesh>
        <mesh rotation={[0.8, Math.PI / 3, 0.45]}>
          <torusGeometry args={[2.12, 0.004, 6, 160]} />
          <meshBasicMaterial color="#00FF88" transparent opacity={0.28} />
        </mesh>
        <mesh rotation={[0.2, 0.1, Math.PI / 2]}>
          <torusGeometry args={[1.68, 0.004, 6, 144]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.34} />
        </mesh>
      </group>
    </group>
  );
}

export default function SceneCanvas({ stage, energy, emotion, compact = false, pointerX = 0, pointerY = 0 }: SceneCanvasProps) {
  return (
    <div className={`scene-canvas ${compact ? "scene-canvas--compact" : ""}`} aria-hidden="true">
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7.4], fov: 43 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#020408", 8, 18]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 5]} color="#00F0FF" intensity={1.2} distance={14} />
        <pointLight position={[-3, -2, -2]} color="#00FF88" intensity={0.8} distance={12} />
        <NeuralModel stage={stage} energy={energy} emotion={emotion} compact={compact} pointerX={pointerX} pointerY={pointerY} />
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={(Math.PI * 2) / 3} rotateSpeed={0.28} autoRotate autoRotateSpeed={compact ? 0.3 : 0.12} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.05} luminanceThreshold={0.12} luminanceSmoothing={0.15} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
