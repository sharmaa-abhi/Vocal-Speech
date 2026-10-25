"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

interface PriorityRadarProps {
  selectedCallId?: string;
  pointerX?: number;
  pointerY?: number;
}

export interface RadarCallTarget {
  id: string;
  angle: number;
  radius: number; // distance from core
  height: number;
  urgency: number;
  color: string;
  label: string;
}

export const RADAR_TARGETS: RadarCallTarget[] = [
  { id: "VF-2048", angle: 0.6, radius: 1.2, height: 0.7, urgency: 95, color: "#00FF88", label: "FINANCIAL FRAUD VICTIM" },
  { id: "VF-2042", angle: 1.8, radius: 1.9, height: 0.5, urgency: 78, color: "#00F0FF", label: "SUSPECTED IMPERSONATION" },
  { id: "VF-2037", angle: 3.1, radius: 2.5, height: 0.35, urgency: 62, color: "#3B82F6", label: "INFORMANT REPORT" },
  { id: "VF-2031", angle: 4.4, radius: 3.0, height: 0.25, urgency: 48, color: "#78F7D0", label: "ACCOUNT TAKEOVER" },
  { id: "VF-2029", angle: 5.5, radius: 3.6, height: 0.15, urgency: 29, color: "#64748B", label: "GENERAL ENQUIRY" }
];

function PriorityRadarModel({
  selectedCallId = "VF-2048",
  pointerX = 0,
  pointerY = 0
}: PriorityRadarProps) {
  const radarGroupRef = useRef<THREE.Group>(null!);
  const sweepBeamRef = useRef<THREE.Mesh>(null!);
  const shieldDomeRef = useRef<THREE.Mesh>(null!);
  const reticleRef = useRef<THREE.Group>(null!);

  const selectedTarget = useMemo(() => {
    return RADAR_TARGETS.find((t) => t.id === selectedCallId) ?? RADAR_TARGETS[0];
  }, [selectedCallId]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Sweep beam rotation
    if (sweepBeamRef.current) {
      sweepBeamRef.current.rotation.z += delta * 1.6;
    }

    // Defensive cyber-shield gentle pulse & rotation
    if (shieldDomeRef.current) {
      shieldDomeRef.current.rotation.y += delta * 0.1;
      const pulse = 1 + Math.sin(time * 2.2) * 0.02;
      shieldDomeRef.current.scale.set(pulse * 3.8, pulse * 1.9, pulse * 3.8);
    }

    // Group tilt towards user cursor
    if (radarGroupRef.current) {
      radarGroupRef.current.rotation.x = THREE.MathUtils.damp(
        radarGroupRef.current.rotation.x,
        Math.PI / 4 + pointerY * 0.15,
        2.5,
        delta
      );
      radarGroupRef.current.rotation.z = THREE.MathUtils.damp(
        radarGroupRef.current.rotation.z,
        -pointerX * 0.15,
        2.5,
        delta
      );
    }

    // Reticle tracking target position
    if (reticleRef.current && selectedTarget) {
      const targetX = Math.cos(selectedTarget.angle) * selectedTarget.radius;
      const targetY = Math.sin(selectedTarget.angle) * selectedTarget.radius;
      reticleRef.current.position.x = THREE.MathUtils.damp(reticleRef.current.position.x, targetX, 4, delta);
      reticleRef.current.position.y = THREE.MathUtils.damp(reticleRef.current.position.y, targetY, 4, delta);
      reticleRef.current.position.z = THREE.MathUtils.damp(reticleRef.current.position.z, selectedTarget.height, 4, delta);
      reticleRef.current.rotation.z += delta * 2.0;
    }
  });

  return (
    <group ref={radarGroupRef} position={[0, -0.6, 0]}>
      {/* 3D Concentric Radar Rings on Plane */}
      {[1.0, 1.8, 2.6, 3.4, 4.2].map((radius, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <ringGeometry args={[radius - 0.015, radius + 0.015, 64]} />
          <meshBasicMaterial
            color={i === 0 ? "#00FF88" : "#00F0FF"}
            transparent
            opacity={0.35 - i * 0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Crosshair Sector Grid Lines */}
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((rad, i) => (
        <mesh key={i} rotation={[0, 0, rad]}>
          <planeGeometry args={[8.4, 0.02]} />
          <meshBasicMaterial color="#00F0FF" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Rotating Radar Sweep Beam */}
      <mesh ref={sweepBeamRef} position={[0, 0, 0.01]}>
        <ringGeometry args={[0, 4.2, 32, 1, 0, Math.PI / 3]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiting / Positioned Call Blips with Vertical Projections */}
      {RADAR_TARGETS.map((target) => {
        const x = Math.cos(target.angle) * target.radius;
        const y = Math.sin(target.angle) * target.radius;
        const isSelected = target.id === selectedCallId;

        return (
          <group key={target.id}>
            {/* Ground ring marker */}
            <mesh position={[x, y, 0.01]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color={target.color} />
            </mesh>

            {/* Vertical projection beam */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([x, y, 0, x, y, target.height])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={target.color} transparent opacity={0.6} />
            </line>

            {/* Elevated 3D Call Marker */}
            <mesh position={[x, y, target.height]}>
              <octahedronGeometry args={[isSelected ? 0.22 : 0.14, 0]} />
              <meshBasicMaterial
                color={target.color}
                wireframe={!isSelected}
              />
            </mesh>
          </group>
        );
      })}

      {/* Selected Call Target Lock Reticle */}
      <group ref={reticleRef}>
        <mesh>
          <ringGeometry args={[0.26, 0.3, 24]} />
          <meshBasicMaterial color="#00FF88" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.7, 0.02]} />
          <meshBasicMaterial color="#00FF88" transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <planeGeometry args={[0.7, 0.02]} />
          <meshBasicMaterial color="#00FF88" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Protective Geodesic Cyber-Shield Dome Canopy */}
      <mesh ref={shieldDomeRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          color="#00F0FF"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

export default function PriorityRadarScene({
  selectedCallId = "VF-2048",
  pointerX = 0,
  pointerY = 0
}: PriorityRadarProps) {
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
        camera={{ position: [0, 2.2, 5.2], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 5, 4]} color="#00F0FF" intensity={1.8} distance={15} />
        <pointLight position={[-3, 4, -2]} color="#00FF88" intensity={1.5} distance={15} />

        <PriorityRadarModel
          selectedCallId={selectedCallId}
          pointerX={pointerX}
          pointerY={pointerY}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={8.0}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 4}
          rotateSpeed={0.4}
        />

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.13}
            luminanceSmoothing={0.17}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
