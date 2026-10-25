"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Brain,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Workflow,
  Sparkles,
  GitBranch,
  Network
} from "lucide-react";
import GlobalNav from "@/components/navigation/GlobalNav";
import PipelineTimeline from "@/components/navigation/PipelineTimeline";
import StageSwitcher from "@/components/navigation/StageSwitcher";
import type { EmotionKey } from "@/lib/types";

// Dynamically load unique 3D Neural Network scene
const NeuralNetworkScene = dynamic(
  () => import("@/components/scenes/NeuralNetworkScene"),
  { ssr: false }
);

interface EmotionProfile {
  key: EmotionKey;
  label: string;
  color: string;
  score: number;
  acousticMarkers: string;
  neurologicalTrigger: string;
  biGruLatentState: string;
  description: string;
}

const EMOTIONS: Record<EmotionKey, EmotionProfile> = {
  fear: {
    key: "fear",
    label: "FEAR",
    color: "#00F0FF",
    score: 88,
    acousticMarkers: "Elevated F0 pitch (+42%), sudden micro-tremor bursts, suppressed vowel elongation.",
    neurologicalTrigger: "Amygdala-driven sympathetic nervous system surge leading to laryngeal constriction.",
    biGruLatentState: "High forward-backward state discrepancy due to sudden abrupt acoustic discontinuities.",
    description: "Acute threat perception inducing physiological tightening of the vocal tract and erratic fundamental frequency leaps."
  },
  anger: {
    key: "anger",
    label: "ANGER",
    color: "#3B82F6",
    score: 42,
    acousticMarkers: "Elevated spectral energy in 1.5–3.5 kHz formant range, sharp attack slopes, increased decibel volume.",
    neurologicalTrigger: "Prefrontal-limbic confrontation impulse causing forceful glottal closure and hyper-articulated consonants.",
    biGruLatentState: "Sustained high-energy latent activation vectors across consecutive 250ms temporal windows.",
    description: "Aggressive vocal output characterized by elevated spectral centroid and dense harmonic energy."
  },
  distress: {
    key: "distress",
    label: "DISTRESS",
    color: "#00FF88",
    score: 94,
    acousticMarkers: "Simultaneous pitch instability, elevated jitter (>65%), breathing dysrhythmia and broken cadence.",
    neurologicalTrigger: "Overwhelmed cognitive appraisal resulting in loss of steady breath support and laryngeal tremor.",
    biGruLatentState: "Pronounced temporal variance across attention heads; bidirectional layers reflect prolonged systemic tension.",
    description: "Multi-factor crisis indicator signaling intense psychological pressure, helplessness, or panic."
  },
  nervousness: {
    key: "nervousness",
    label: "NERVOUSNESS",
    color: "#78F7D0",
    score: 79,
    acousticMarkers: "Fluctuating pitch contours, micro-hesitations (150–400ms silent blocks), mild shimmer variance.",
    neurologicalTrigger: "Inhibition of motor speech planning during deceptive stress, questioning, or intense interrogation.",
    biGruLatentState: "Periodic latent state oscillations correlating with irregular syllable intervals.",
    description: "Anxiety and cognitive overload producing rapid micro-adjustments in vocal pitch and speech tempo."
  }
};

export default function EmotionModelingPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey>("distress");
  const activeProfile = EMOTIONS[selectedEmotion];

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      <GlobalNav />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-28 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Stage Header */}
        <section className="mb-10">
          <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-emerald-400 tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STAGE 03 {"//"} TEMPORAL EMOTION MODELING</span>
          </div>

          <h1 className="font-['Orbitron',sans-serif] text-2xl sm:text-4xl md:text-5xl font-black tracking-wide text-white mb-4">
            FROM ACOUSTIC PATTERNS <span className="text-emerald-400">TO INDICATIVE SIGNALS.</span>
          </h1>

          <p className="font-['Inter',sans-serif] text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Explore how a modern speech-emotion-recognition system models changes in vocal characteristics over time. By feeding extracted acoustic frames into pretrained representations and bidirectional temporal networks, the architecture models context rather than isolated acoustic frames.
          </p>
        </section>

        {/* 3D Neural Scene + Emotion Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-12">
          {/* 3D Visualizer Container (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border border-emerald-500/25 bg-zinc-950/80 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(0,255,136,0.12)]">
            <div className="px-5 py-3 border-b border-emerald-500/20 bg-black/60 flex items-center justify-between font-['JetBrains_Mono',monospace] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-semibold">LAYERED NEURAL NETWORK VISUALIZATION</span>
              </div>
              <span className="text-emerald-300 uppercase">
                ACTIVE PATHWAY: {activeProfile.label}
              </span>
            </div>

            {/* 3D Canvas Scene */}
            <div className="relative w-full h-[380px] sm:h-[440px] bg-black">
              <NeuralNetworkScene
                selectedEmotion={selectedEmotion}
              />

              {/* Overlaid Architecture Diagram Labels */}
              <div className="absolute top-4 left-4 pointer-events-none font-['JetBrains_Mono',monospace] text-[10px] text-cyan-300/80 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-cyan-500/20">
                L0: ACOUSTIC FRAMES
              </div>
              <div className="absolute top-4 left-1/3 pointer-events-none font-['JetBrains_Mono',monospace] text-[10px] text-blue-300/80 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-blue-500/20">
                L1: WAV2VEC2 LATENTS
              </div>
              <div className="absolute top-4 right-1/4 pointer-events-none font-['JetBrains_Mono',monospace] text-[10px] text-emerald-300/80 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-emerald-500/20">
                L2: BiGRU TEMPORAL
              </div>
              <div className="absolute top-4 right-4 pointer-events-none font-['JetBrains_Mono',monospace] text-[10px] text-teal-300/80 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-teal-500/20">
                L3: EMOTION HEADS
              </div>

              {/* Dynamic Bottom Tag */}
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex items-center justify-between font-['JetBrains_Mono',monospace] text-[11px] text-slate-400 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded border border-zinc-800">
                <span>SIGNAL PROPAGATION: FORWARD & BACKWARD</span>
                <span className="text-emerald-400 font-bold">
                  HEAD: {activeProfile.label} (ACTIVE)
                </span>
              </div>
            </div>

            {/* Reference Pipeline Flowchart Strip */}
            <div className="p-4 border-t border-emerald-500/20 bg-zinc-950 font-['JetBrains_Mono',monospace] text-xs">
              <span className="text-slate-500 block text-[10px] uppercase mb-2">
                ILLUSTRATIVE PIPELINE ARCHITECTURE FLOW:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold">
                  ACOUSTIC FEATURES
                </span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300 font-semibold">
                  WAV2VEC2 PRETRAINED
                </span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold">
                  BiGRU SEQUENCE
                </span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-teal-950/60 border border-teal-500/40 text-teal-300 font-semibold">
                  EMOTION HEADS
                </span>
              </div>
            </div>
          </div>

          {/* Emotion Head Selector & Indicative Readout (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5 border border-zinc-800 bg-zinc-950/70 rounded-xl p-5 sm:p-6 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-['JetBrains_Mono',monospace] text-xs">
                <span className="text-emerald-400 font-semibold">// 4 EMOTION CATEGORIES</span>
                <span className="text-slate-400">SELECT TO ACTIVATE</span>
              </div>

              {/* Emotion Selection Head Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-4">
                {(Object.keys(EMOTIONS) as EmotionKey[]).map((key) => {
                  const emo = EMOTIONS[key];
                  const isSelected = selectedEmotion === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedEmotion(key)}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                          : "border-zinc-800 bg-zinc-900/40 text-slate-400 hover:border-zinc-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-['Orbitron',sans-serif] text-xs font-bold block text-white">
                          {emo.label}
                        </strong>
                        <span className="font-['JetBrains_Mono',monospace] text-[11px] font-bold text-emerald-400">
                          {emo.score}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                          style={{ width: `${emo.score}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Emotion Inspector Card */}
              <div className="p-4 rounded-lg border border-emerald-500/20 bg-zinc-900/60 my-3">
                <div className="flex items-center justify-between mb-2 font-['JetBrains_Mono',monospace] text-xs">
                  <span className="text-white font-bold">{activeProfile.label} INFERENCE PROFILE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300 bg-emerald-950/50">
                    OUTPUT CONFIDENCE: {activeProfile.score}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif] mb-3">
                  {activeProfile.description}
                </p>

                <div className="space-y-2 text-[11px] font-['Inter',sans-serif]">
                  <div className="p-2.5 rounded bg-black/60 border border-zinc-800">
                    <strong className="text-cyan-300 block font-['JetBrains_Mono',monospace] text-[10px] uppercase mb-0.5">
                      ACOUSTIC FEATURE CORRELATES:
                    </strong>
                    <span className="text-slate-300">{activeProfile.acousticMarkers}</span>
                  </div>

                  <div className="p-2.5 rounded bg-black/60 border border-zinc-800">
                    <strong className="text-emerald-300 block font-['JetBrains_Mono',monospace] text-[10px] uppercase mb-0.5">
                      BiGRU TEMPORAL ENCODING:
                    </strong>
                    <span className="text-slate-300">{activeProfile.biGruLatentState}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Accuracy Rule Banner */}
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-950/20 text-amber-200 text-xs font-['JetBrains_Mono',monospace]">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>SIMULATED EMOTION OUTPUT — NOT MODEL INFERENCE</span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed font-['Inter',sans-serif]">
                This frontend demonstration illustrates neural speech emotion recognition architecture. Pretrained model weights (such as a 300MB+ Wav2Vec2 checkpoint) are referenced conceptually and are not executed in client JavaScript without an ONNX/WASM runtime.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Deep Dive Architecture Sections */}
        <section className="my-14">
          <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-emerald-400 tracking-widest uppercase mb-2">
            <span>// DEEP DIVE ARCHITECTURE TAXONOMY</span>
          </div>
          <h2 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white mb-6">
            SEQUENCE MODELING <span className="text-emerald-400">FOUNDATIONS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 font-['JetBrains_Mono',monospace] text-xs font-bold">
                  01
                </div>
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-white">
                  Temporal Acoustic Representation
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif]">
                Single audio frames (e.g., a 25ms slice) are insufficient to determine vocal emotion. A speaker’s natural tone may have a high fundamental pitch, but an authentic distress response manifests as progressive pitch drift, erratic contour instability, and breathlessness across multiple seconds of connected discourse.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border border-blue-500/40 bg-blue-950/40 flex items-center justify-center text-blue-400 font-['JetBrains_Mono',monospace] text-xs font-bold">
                  02
                </div>
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-white">
                  Wav2Vec2 Self-Supervised Speech Representations
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif]">
                Pretrained on tens of thousands of hours of unlabelled speech via contrastive learning, Wav2Vec2 extracts rich contextualized latent representations directly from raw audio waveforms. This overcomes acoustic variations across different telephone microphones and compression codecs.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border border-emerald-500/40 bg-emerald-950/40 flex items-center justify-center text-emerald-400 font-['JetBrains_Mono',monospace] text-xs font-bold">
                  03
                </div>
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-white">
                  Bidirectional GRU (BiGRU) Temporal Modeling
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif]">
                A Gated Recurrent Unit processes speech sequences in both forward and backward temporal directions. This dual pass captures both anticipatory tension leading into a panic outburst and the trailing vocal tremor that lingers after an emotional utterance.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border border-teal-500/40 bg-teal-950/40 flex items-center justify-center text-teal-400 font-['JetBrains_Mono',monospace] text-xs font-bold">
                  04
                </div>
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-white">
                  Multi-Head Attention Pooling & Emotion Heads
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif]">
                Not all seconds of a phone call contain high emotional valence. Attention pooling dynamically learns weights that prioritize emotionally salient phrases (e.g., sudden gasps, cries for help) while down-weighting silent pauses and routine dial tones.
              </p>
            </div>
          </div>
        </section>

        {/* Pipeline Stage Progression Explorer */}
        <PipelineTimeline currentStage={3} />

        {/* Stage 03 CTA to Stage 04 */}
        <div className="mt-10 p-6 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-['JetBrains_Mono',monospace] text-xs text-emerald-400 tracking-wider">
              READY FOR OPERATIONAL DISPATCH TRIAGE?
            </span>
            <h3 className="font-['Orbitron',sans-serif] text-lg sm:text-xl font-bold text-white mt-1">
              Transform Emotion Signals Into Officer Priority Queues
            </h3>
          </div>
          <Link
            href="/pipeline/priority-triage"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded border border-emerald-400 bg-emerald-500 text-black font-['JetBrains_Mono',monospace] text-xs font-bold hover:bg-emerald-400 shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all"
          >
            <span>EXPLORE PRIORITY TRIAGE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Floating Stage Switcher */}
      <StageSwitcher currentStage={3} />
    </div>
  );
}
