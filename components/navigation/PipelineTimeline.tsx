"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  AudioWaveform,
  BarChart3,
  Brain,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from "lucide-react";

export interface StageInfo {
  id: string;
  stageNumber: string;
  title: string;
  headline: string;
  description: string;
  route: string;
  icon: typeof AudioWaveform;
  badge: string;
  tag: string;
  color: string;
}

export const PIPELINE_STAGES: StageInfo[] = [
  {
    id: "stage-01",
    stageNumber: "01",
    title: "Audio Ingestion & Filtering",
    headline: "Every Signal Begins With A Voice",
    description: "Capture, decode, inspect, and prepare live or recorded audio for downstream acoustic analysis—all inside the browser.",
    route: "/pipeline/audio-ingestion",
    icon: AudioWaveform,
    badge: "STAGE 01",
    tag: "RAW & FILTERED DSP",
    color: "#00F0FF"
  },
  {
    id: "stage-02",
    stageNumber: "02",
    title: "Spectral Feature Extraction",
    headline: "Decode The Signature Behind The Sound",
    description: "Examine acoustic patterns beyond words to understand measurable properties of a voice signal.",
    route: "/pipeline/feature-extraction",
    icon: BarChart3,
    badge: "STAGE 02",
    tag: "MFCC · F0 · JITTER · WPM",
    color: "#3B82F6"
  },
  {
    id: "stage-03",
    stageNumber: "03",
    title: "Temporal Emotion Modeling",
    headline: "From Acoustic Patterns To Indicative Signals",
    description: "Explore how a speech-emotion-recognition system could model changes in vocal characteristics over time.",
    route: "/pipeline/emotion-modeling",
    icon: Brain,
    badge: "STAGE 03",
    tag: "WAV2VEC2 + BiGRU REFERENCE",
    color: "#00FF88"
  },
  {
    id: "stage-04",
    stageNumber: "04",
    title: "Priority Triage Support",
    headline: "Bring Urgent Calls Into Focus",
    description: "Transform explicitly identified demonstration outputs into a review-priority interface that supports human judgment.",
    route: "/pipeline/priority-triage",
    icon: ShieldAlert,
    badge: "STAGE 04",
    tag: "0–100 URGENCY RADAR",
    color: "#10B981"
  }
];

interface PipelineTimelineProps {
  currentStage?: number; // 1 to 4
  className?: string;
  showHeader?: boolean;
}

export default function PipelineTimeline({
  currentStage,
  className = "",
  showHeader = true
}: PipelineTimelineProps) {
  const pathname = usePathname();

  // If currentStage is not explicitly passed, infer from pathname
  const activeIndex = currentStage
    ? currentStage - 1
    : PIPELINE_STAGES.findIndex((s) => pathname?.includes(s.route));

  return (
    <section className={`relative w-full my-12 py-8 px-4 sm:px-6 md:px-8 border border-cyan-500/15 bg-zinc-950/70 backdrop-blur-md rounded-xl ${className}`}>
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-cyan-500/15">
          <div>
            <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-cyan-400 tracking-widest mb-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>END-TO-END 4-STAGE PIPELINE ARCHITECTURE</span>
            </div>
            <h2 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white">
              ACOUSTIC INTELLIGENCE <span className="text-cyan-400">EXECUTION STAGES</span>
            </h2>
          </div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-slate-400 max-w-md">
            Click any stage to enter its dedicated interactive 3D laboratory, explore mathematical formulations, and inspect real-time signal behaviors.
          </p>
        </div>
      )}

      {/* Connected Timeline Cards Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Animated Connecting SVG Line (desktop only) */}
        <div className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] h-[2px] pointer-events-none -z-0">
          <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none">
            <line
              x1="0%"
              y1="2"
              x2="100%"
              y2="2"
              stroke="rgba(0, 240, 255, 0.2)"
              strokeWidth="2"
              strokeDasharray="4 6"
            />
            {/* Progress line */}
            <motion.line
              x1="0%"
              y1="2"
              x2={
                activeIndex >= 0
                  ? `${Math.min(100, (activeIndex / (PIPELINE_STAGES.length - 1)) * 100)}%`
                  : "0%"
              }
              y2="2"
              stroke="#00F0FF"
              strokeWidth="2.5"
              className="filter drop-shadow-[0_0_8px_#00F0FF]"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
        </div>

        {PIPELINE_STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = activeIndex === index;
          const isPassed = activeIndex > index;

          return (
            <motion.div
              key={stage.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex flex-col justify-between"
            >
              <Link
                href={stage.route}
                className={`group relative flex flex-col justify-between h-full p-5 rounded-lg border transition-all overflow-hidden ${
                  isActive
                    ? "border-cyan-400 bg-cyan-950/30 shadow-[0_0_30px_rgba(0,240,255,0.22)] ring-1 ring-cyan-400/50"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-cyan-500/40 hover:bg-zinc-900/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                }`}
              >
                {/* Stage Header */}
                <div>
                  <div className="flex items-center justify-between mb-3 font-['JetBrains_Mono',monospace] text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                          isActive
                            ? "bg-cyan-400 text-black border-cyan-300 shadow-[0_0_12px_#00F0FF]"
                            : isPassed
                            ? "bg-emerald-950 border-emerald-400/60 text-emerald-300"
                            : "bg-zinc-800 border-zinc-700 text-slate-400 group-hover:border-cyan-400 group-hover:text-cyan-300"
                        }`}
                      >
                        {stage.stageNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
                        {stage.badge}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-['JetBrains_Mono',monospace] ${
                        isActive
                          ? "border-cyan-400/60 bg-cyan-900/40 text-cyan-300"
                          : "border-zinc-700 text-slate-400"
                      }`}
                    >
                      {isActive ? "ACTIVE STAGE" : stage.tag}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-2.5 my-3">
                    <div
                      className={`p-2 rounded border ${
                        isActive
                          ? "border-cyan-400 bg-cyan-950/70 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                          : "border-zinc-800 bg-zinc-800/80 text-slate-400 group-hover:border-cyan-400/40 group-hover:text-cyan-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {stage.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {stage.description}
                  </p>
                </div>

                {/* Footer Link / CTA */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between font-['JetBrains_Mono',monospace] text-xs">
                  <span
                    className={`text-[11px] ${
                      isActive ? "text-cyan-300 font-semibold" : "text-slate-500 group-hover:text-cyan-400"
                    }`}
                  >
                    {isActive ? "VIEWING LABORATORY" : "EXPLORE STAGE"}
                  </span>
                  <div
                    className={`flex items-center gap-1 transition-transform group-hover:translate-x-1 ${
                      isActive ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-400"
                    }`}
                  >
                    <span>ENTER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Glowing top line for active stage */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00F0FF]" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
