"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

interface SpectrogramTunnelProps {
  selectedFeature: "mfcc" | "pitch" | "jitter" | "pace";
  energy?: number;
  pointerX?: number;
  pointerY?: number;
}

const RING_COUNT = 32;
const SEGMENTS_PER_RING = 48;

function SpectrogramTunnelModel({
  selectedFeature,
  energy = 0.4,
  pointerX = 0,
  pointerY = 0
}: SpectrogramTunnelProps) {
  const tunnelGroupRef = useRef<THREE.Group>(null!);
  const gridGroupRef = useRef<THREE.Group>(null!);
  const ribbonsRef = useRef<THREE.Group>(null!);

  // Generate frequency ribbons along tunnel Z-axis
  const ribbons = useMemo(() => {
    // 8 frequency ribbons stretching along Z from -12 to 2
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const baseRadius = 1.6 + (i % 2) * 0.2;
      const isLowFreq = i < 3;
      return {
        id: i,
        angle,
        baseRadius,
        isLowFreq,
        color: isLowFreq ? "#00FF88" : i < 6 ? "#00F0FF" : "#3B82F6"
      };
    });
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Feature-specific behavior modifiers
    const isPitch = selectedFeature === "pitch";
    const isJitter = selectedFeature === "jitter";
    const isPace = selectedFeature === "pace";
    const isMfcc = selectedFeature === "mfcc";

    const rotSpeed = isPace ? 0.35 : 0.15;

    if (tunnelGroupRef.current) {
      // Rotate tunnel
      tunnelGroupRef.current.rotation.z += delta * rotSpeed;
      tunnelGroupRef.current.rotation.y = THREE.MathUtils.damp(
        tunnelGroupRef.current.rotation.y,
        pointerX * 0.2,
        2.5,
        delta
      );
      tunnelGroupRef.current.rotation.x = THREE.MathUtils.damp(
        tunnelGroupRef.current.rotation.x,
        pointerY * 0.15,
        2.5,
        delta
      );
    }

    // Animate ribbons
    if (ribbonsRef.current) {
      ribbonsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const ribbon = ribbons[i];
        if (!mesh || !ribbon) return;

        // Wave deformation
        const freqMultiplier = isMfcc ? 4.5 : isPitch ? 2.0 : isJitter ? 8.0 : 3.0;
        const amplitude = (isJitter ? 0.25 : 0.15) * (0.8 + energy * 0.6);
        const wave = Math.sin(time * 3 + i * 1.2 + ribbon.angle * freqMultiplier) * amplitude;

        const currentR = ribbon.baseRadius + wave;
        mesh.position.x = Math.cos(ribbon.angle + time * 0.05) * currentR;
        mesh.position.y = Math.sin(ribbon.angle + time * 0.05) * currentR;
      });
    }

    // Scroll tunnel rings towards camera to create infinite flythrough feeling
    if (tunnelGroupRef.current) {
      tunnelGroupRef.current.children.forEach((child) => {
        if (child.name.startsWith("ring_")) {
          child.position.z += delta * (isPace ? 2.5 : 1.4);
          if (child.position.z > 3.5) {
            child.position.z -= 16;
          }
        }
      });
    }
  });

  return (
    <group>
      {/* 3D Spectrogram Rings along tunnel depth */}
      <group ref={tunnelGroupRef}>
        {Array.from({ length: RING_COUNT }).map((_, index) => {
          const zPos = -12.5 + index * 0.5;
          const isKeyRing = index % 4 === 0;
          return (
            <mesh
              key={index}
              name={`ring_${index}`}
              position={[0, 0, zPos]}
              rotation={[0, 0, (index * Math.PI) / 12]}
            >
              <torusGeometry args={[1.75 + (index % 3) * 0.08, 0.012, 6, SEGMENTS_PER_RING]} />
              <meshBasicMaterial
                color={
                  index < 10
                    ? "#00FF88" // low frequency bands
                    : index < 22
                    ? "#00F0FF" // mid formant bands
                    : "#3B82F6" // high spectral energy
                }
                transparent
                opacity={isKeyRing ? 0.75 : 0.3}
              />
            </mesh>
          );
        })}

        {/* Dynamic Longitudinal Frequency Ribbons */}
        <group ref={ribbonsRef}>
          {ribbons.map((ribbon) => (
            <mesh key={ribbon.id} position={[0, 0, -4.5]}>
              <cylinderGeometry args={[0.025, 0.025, 14, 8, 32, true]} />
              <meshBasicMaterial
                color={ribbon.color}
                transparent
                opacity={0.8}
                wireframe={selectedFeature === "jitter"}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Holographic 3D Spectral Coordinate Grid and Hz Indicators */}
      <group ref={gridGroupRef} position={[0, 0, -2]}>
        {/* Horizontal & vertical coordinate axes */}
        <gridHelper
          args={[8, 8, "#00F0FF", "#063b45"]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, -2.1, -3]}
        />
        <gridHelper
          args={[8, 8, "#00FF88", "#063b45"]}
          rotation={[0, 0, Math.PI / 2]}
          position={[-2.3, 0, -3]}
        />
      </group>
    </group>
  );
}

export default function SpectrogramTunnelScene({
  selectedFeature = "mfcc",
  energy = 0.4,
  pointerX = 0,
  pointerY = 0
}: SpectrogramTunnelProps) {
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
        camera={{ position: [0, 0.4, 5.2], fov: 46 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#020408", 4, 14]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 2]} color="#00F0FF" intensity={1.8} distance={12} />
        <pointLight position={[0, 0, -6]} color="#00FF88" intensity={2.0} distance={14} />

        <SpectrogramTunnelModel
          selectedFeature={selectedFeature}
          energy={energy}
          pointerX={pointerX}
          pointerY={pointerY}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.0}
          maxDistance={7.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
          rotateSpeed={0.4}
        />

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.12}
            luminanceSmoothing={0.18}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
