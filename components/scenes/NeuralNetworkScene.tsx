"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import type { EmotionKey } from "@/lib/types";

interface NeuralNetworkProps {
  selectedEmotion: EmotionKey;
  activityLevel?: number;
  pointerX?: number;
  pointerY?: number;
}

// 4 distinct layers: X coordinates from -3.5 to +3.5
interface NodeDef {
  id: string;
  layer: number; // 0 = input, 1 = wav2vec2, 2 = bigru, 3 = emotion heads
  pos: [number, number, number];
  color: string;
  label?: string;
}

const EMOTION_OUTPUT_INDICES: Record<EmotionKey, number> = {
  fear: 0,
  anger: 1,
  distress: 2,
  nervousness: 3
};

function NeuralNetworkModel({
  selectedEmotion,
  activityLevel = 0.6,
  pointerX = 0,
  pointerY = 0
}: NeuralNetworkProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const signalPacketsRef = useRef<THREE.Group>(null!);

  // Build the multi-layer neural architecture nodes
  const { nodes, connections } = useMemo(() => {
    const nList: NodeDef[] = [];
    const cList: { from: [number, number, number]; to: [number, number, number]; targetEmotionIndex?: number }[] = [];

    // Layer 0: Input Acoustic Features (6 nodes) at X = -3.5
    const layer0: NodeDef[] = [];
    for (let i = 0; i < 6; i++) {
      const y = (i - 2.5) * 0.75;
      const z = Math.sin(i * 1.5) * 0.4;
      const node: NodeDef = { id: `in_${i}`, layer: 0, pos: [-3.4, y, z], color: "#00F0FF" };
      layer0.push(node);
      nList.push(node);
    }

    // Layer 1: Wav2Vec2 Latents (8 nodes) at X = -1.2
    const layer1: NodeDef[] = [];
    for (let i = 0; i < 8; i++) {
      const y = (i - 3.5) * 0.65;
      const z = Math.cos(i * 1.3) * 0.6;
      const node: NodeDef = { id: `w2v_${i}`, layer: 1, pos: [-1.2, y, z], color: "#3B82F6" };
      layer1.push(node);
      nList.push(node);

      // Connect each input node to several layer1 nodes
      layer0.forEach((src, srcIdx) => {
        if ((srcIdx + i) % 2 === 0) {
          cList.push({ from: src.pos, to: node.pos });
        }
      });
    }

    // Layer 2: BiGRU Temporal Recurrent Units (6 nodes) at X = 1.1
    const layer2: NodeDef[] = [];
    for (let i = 0; i < 6; i++) {
      const y = (i - 2.5) * 0.8;
      const z = Math.sin(i * 2.0) * 0.5;
      const node: NodeDef = { id: `bigru_${i}`, layer: 2, pos: [1.1, y, z], color: "#00FF88" };
      layer2.push(node);
      nList.push(node);

      layer1.forEach((src, srcIdx) => {
        if ((srcIdx + i) % 2 === 0 || (srcIdx + i) % 3 === 0) {
          cList.push({ from: src.pos, to: node.pos });
        }
      });
    }

    // Layer 3: Output Emotion Heads (4 nodes) at X = 3.3
    // 0: Fear, 1: Anger, 2: Distress, 3: Nervousness
    const emotionColors = ["#00F0FF", "#3B82F6", "#00FF88", "#78F7D0"];
    const emotionLabels = ["FEAR", "ANGER", "DISTRESS", "NERVOUSNESS"];
    for (let i = 0; i < 4; i++) {
      const y = (i - 1.5) * 1.1;
      const z = 0;
      const node: NodeDef = {
        id: `out_${i}`,
        layer: 3,
        pos: [3.3, y, z],
        color: emotionColors[i],
        label: emotionLabels[i]
      };
      nList.push(node);

      // Connect Layer 2 nodes to Layer 3 output heads
      layer2.forEach((src) => {
        cList.push({ from: src.pos, to: node.pos, targetEmotionIndex: i });
      });
    }

    return { nodes: nList, connections: cList };
  }, []);

  // Connection geometry line positions
  const linePositions = useMemo(() => {
    const pos = new Float32Array(connections.length * 6);
    connections.forEach((conn, i) => {
      pos[i * 6] = conn.from[0];
      pos[i * 6 + 1] = conn.from[1];
      pos[i * 6 + 2] = conn.from[2];
      pos[i * 6 + 3] = conn.to[0];
      pos[i * 6 + 4] = conn.to[1];
      pos[i * 6 + 5] = conn.to[2];
    });
    return pos;
  }, [connections]);

  const activeEmotionIdx = EMOTION_OUTPUT_INDICES[selectedEmotion] ?? 2;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Gentle floating oscillation
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        pointerX * 0.25 + Math.sin(time * 0.4) * 0.08,
        2.5,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        pointerY * 0.15 + Math.cos(time * 0.5) * 0.05,
        2.5,
        delta
      );
    }

    // Animate signal packets along pathways
    if (signalPacketsRef.current) {
      signalPacketsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const conn = connections[i % connections.length];
        if (!conn) return;

        const speed = 1.2 + (i % 3) * 0.4;
        const progress = ((time * speed + i * 0.2) % 1);

        mesh.position.x = THREE.MathUtils.lerp(conn.from[0], conn.to[0], progress);
        mesh.position.y = THREE.MathUtils.lerp(conn.from[1], conn.to[1], progress);
        mesh.position.z = THREE.MathUtils.lerp(conn.from[2], conn.to[2], progress);

        // Highlight packets flowing to active emotion
        const isTargetStream = conn.targetEmotionIndex === activeEmotionIdx;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = isTargetStream ? 0.95 : 0.25;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Neural Network Nodes */}
      {nodes.map((node) => {
        const isOutput = node.layer === 3;
        const isSelectedHead =
          isOutput &&
          ((node.id === "out_0" && selectedEmotion === "fear") ||
            (node.id === "out_1" && selectedEmotion === "anger") ||
            (node.id === "out_2" && selectedEmotion === "distress") ||
            (node.id === "out_3" && selectedEmotion === "nervousness"));

        return (
          <group key={node.id} position={node.pos}>
            <mesh>
              <sphereGeometry args={[isSelectedHead ? 0.26 : isOutput ? 0.18 : 0.12, 16, 16]} />
              <meshBasicMaterial
                color={isSelectedHead ? "#00FF88" : node.color}
                wireframe={!isSelectedHead && node.layer !== 0}
              />
            </mesh>
            {/* Halo ring for selected emotion output */}
            {isSelectedHead && (
              <mesh>
                <ringGeometry args={[0.32, 0.36, 32]} />
                <meshBasicMaterial color="#00FF88" side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Network Connections */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length * 2}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.22}
        />
      </lineSegments>

      {/* Travelling Signal Pulse Packets */}
      <group ref={signalPacketsRef}>
        {connections.slice(0, 36).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial
              color="#00FF88"
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function NeuralNetworkScene({
  selectedEmotion = "distress",
  activityLevel = 0.6,
  pointerX = 0,
  pointerY = 0
}: NeuralNetworkProps) {
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
        camera={{ position: [0, 0, 6.2], fov: 46 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[-4, 2, 4]} color="#00F0FF" intensity={1.5} distance={14} />
        <pointLight position={[4, -2, 4]} color="#00FF88" intensity={1.5} distance={14} />

        <NeuralNetworkModel
          selectedEmotion={selectedEmotion}
          activityLevel={activityLevel}
          pointerX={pointerX}
          pointerY={pointerY}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={8.5}
          rotateSpeed={0.4}
        />

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.25}
            luminanceThreshold={0.14}
            luminanceSmoothing={0.16}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
