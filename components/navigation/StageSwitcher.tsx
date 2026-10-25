"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, RadioTower } from "lucide-react";
import { PIPELINE_STAGES } from "./PipelineTimeline";

interface StageSwitcherProps {
  currentStage: number; // 1, 2, 3, 4
}

export default function StageSwitcher({ currentStage }: StageSwitcherProps) {
  const prevStage = currentStage > 1 ? PIPELINE_STAGES[currentStage - 2] : null;
  const nextStage = currentStage < 4 ? PIPELINE_STAGES[currentStage] : null;
  const current = PIPELINE_STAGES[currentStage - 1];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full border border-cyan-500/30 bg-black/85 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.15)] font-['JetBrains_Mono',monospace] text-xs">
      {/* Prev Stage Link */}
      {prevStage ? (
        <Link
          href={prevStage.route}
          className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-full transition-all"
          title={`Previous: ${prevStage.title}`}
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">STAGE {prevStage.stageNumber}</span>
          <span className="sm:hidden">PREV</span>
        </Link>
      ) : (
        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-full transition-all"
          title="Return to Home"
        >
          <Home className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">HOME</span>
        </Link>
      )}

      {/* Stage Progress Pills */}
      <div className="flex items-center gap-1 px-2 border-x border-zinc-800">
        {PIPELINE_STAGES.map((s, idx) => {
          const isActive = idx + 1 === currentStage;
          return (
            <Link
              key={s.id}
              href={s.route}
              title={s.title}
              className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                isActive
                  ? "bg-cyan-400 text-black shadow-[0_0_10px_#00F0FF]"
                  : "bg-zinc-900 text-slate-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              0{idx + 1}
            </Link>
          );
        })}
      </div>

      {/* Next Stage Link */}
      {nextStage ? (
        <Link
          href={nextStage.route}
          className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-full transition-all font-semibold"
          title={`Next: ${nextStage.title}`}
        >
          <span className="hidden sm:inline">STAGE {nextStage.stageNumber}</span>
          <span className="sm:hidden">NEXT</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-2.5 py-1 text-emerald-300 hover:text-white hover:bg-emerald-950/50 rounded-full transition-all font-semibold"
          title="Open Officer Tactical HUD"
        >
          <RadioTower className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">OFFICER HUD</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </Link>
      )}
    </div>
  );
}
