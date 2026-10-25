"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  BarChart3,
  Activity,
  Layers,
  Sliders,
  AudioWaveform,
  Waves,
  ArrowRight,
  Info,
  CheckCircle2,
  Cpu,
  Sparkles,
  HelpCircle,
  Clock
} from "lucide-react";
import GlobalNav from "@/components/navigation/GlobalNav";
import PipelineTimeline from "@/components/navigation/PipelineTimeline";
import StageSwitcher from "@/components/navigation/StageSwitcher";
import { clamp } from "@/lib/types";

// Dynamically load unique 3D Spectrogram Tunnel scene
const SpectrogramTunnelScene = dynamic(
  () => import("@/components/scenes/SpectrogramTunnelScene"),
  { ssr: false }
);

type FeatureKey = "mfcc" | "pitch" | "jitter" | "pace";

interface FeatureDetail {
  id: FeatureKey;
  name: string;
  category: string;
  metric: string;
  unit: string;
  calculationType: "CALCULATED DSP PROXY" | "ESTIMATED CONTOUR";
  description: string;
  mathFormula: string;
  forensicRelevance: string;
  proxyDisclaimer: string;
}

const FEATURES: Record<FeatureKey, FeatureDetail> = {
  mfcc: {
    id: "mfcc",
    name: "MFCC — Spectral Envelope",
    category: "Vocal Tract Shape",
    metric: "13 Coeffs",
    unit: "Mel Scale Bands",
    calculationType: "CALCULATED DSP PROXY",
    description: "Mel-Frequency Cepstral Coefficients describe the short-term spectral shape of voice audio, modeling the resonance of human vocal tract cavities independently of pitch.",
    mathFormula: "c_n = \\sum_{m=1}^{M} \\log(S_m) \\cdot \\cos\\left[\\frac{\\pi n}{M}\\left(m - \\frac{1}{2}\\right)\\right]",
    forensicRelevance: "Identifies shifts in acoustic timbre and vocal resonance caused by physiological throat constriction under extreme panic.",
    proxyDisclaimer: "13 Mel filterbanks generated via triangular weighting across 0–4000 Hz. Used as primary acoustic feature representation."
  },
  pitch: {
    id: "pitch",
    name: "Fundamental Pitch — F0",
    category: "Vocal Fold Vibration",
    metric: "284",
    unit: "Hz (C4 Range)",
    calculationType: "CALCULATED DSP PROXY",
    description: "Fundamental frequency (F0) estimates the base vibration speed of vocal folds. Segments without periodic vibration are designated as unvoiced consonants or background silence.",
    mathFormula: "F_0 = \\arg\\max_{\\tau} \\sum_{t} x[t] \\cdot x[t - \\tau] \\quad (60 \\le F_0 \\le 500\\text{ Hz})",
    forensicRelevance: "Sustained elevation above baseline pitch (e.g., >260 Hz for adult speakers) strongly correlates with sympathetic nervous arousal.",
    proxyDisclaimer: "Calculated using zero-crossing auto-correlation windowing. Unvoiced segments (<10 dBFS RMS) are appropriately clamped to zero."
  },
  jitter: {
    id: "jitter",
    name: "Jitter & Shimmer",
    category: "Cycle Micro-Perturbations",
    metric: "68",
    unit: "% Proxy Index",
    calculationType: "CALCULATED DSP PROXY",
    description: "Jitter quantifies cycle-to-cycle frequency variations, while Shimmer quantifies cycle-to-cycle amplitude perturbations caused by involuntary laryngeal tremor.",
    mathFormula: "\\text{Jitter}(\\%) = \\frac{\\frac{1}{N-1} \\sum_{i=1}^{N-1} |T_i - T_{i+1}|}{\\frac{1}{N} \\sum_{i=1}^N T_i} \\times 100",
    forensicRelevance: "High micro-instability signals involuntary neuromuscular tension or trembling in high-stress coercion or hostage scenarios.",
    proxyDisclaimer: "In-browser implementation computes short-term variance across consecutive pitch peaks as an indicative proxy index."
  },
  pace: {
    id: "pace",
    name: "Speech Pace — WPM",
    category: "Temporal Cadence",
    metric: "162",
    unit: "Estimated WPM",
    calculationType: "ESTIMATED CONTOUR",
    description: "Speech rate estimation measures conversational speed through acoustic energy modulation bursts and syllabic vowel peaks across temporal windows.",
    mathFormula: "\\text{Pace} \\approx \\text{Syllabic Burst Count} \\times \\left(\\frac{60}{\\Delta t}\\right) \\times 0.75",
    forensicRelevance: "Distinguishes between rushed panic speech (hyper-articulation) and hesitation/freezing pauses typical of coerced statements.",
    proxyDisclaimer: "Estimated via energy envelope segmentation; definitive word-boundary alignment requires linguistic speech-to-text decoding."
  }
};

export default function FeatureExtractionPage() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey>("mfcc");
  const [showMelFilterbank, setShowMelFilterbank] = useState(true);
  const [showPitchContour, setShowPitchContour] = useState(true);
  const [showJitterScatter, setShowJitterScatter] = useState(false);
  const [energy, setEnergy] = useState(0.45);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeFeature = FEATURES[selectedFeature];

  // Render animated Spectrogram Waterfall on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let step = 0;
    const bins = 64;

    const renderSpectrogram = () => {
      step++;
      const w = canvas.width;
      const h = canvas.height;

      // Shift existing canvas to the left by 2px (waterfall timeline)
      ctx.drawImage(canvas, 2, 0, w - 2, h, 0, 0, w - 2, h);

      // Render new column at the right edge
      const colX = w - 2;
      const binHeight = h / bins;

      for (let b = 0; b < bins; b++) {
        const freqNorm = b / bins;
        // Feature specific energy emphasis
        let intensity = Math.sin(step * 0.05 + b * 0.15) * 0.5 + 0.5;

        if (selectedFeature === "pitch") {
          const pitchCenter = 18; // approx 280 Hz bin
          const dist = Math.abs(b - pitchCenter);
          if (dist < 3) intensity = 0.95 + Math.sin(step * 0.2) * 0.05;
          else intensity *= 0.25;
        } else if (selectedFeature === "mfcc") {
          // formant bands
          if (b % 12 < 4) intensity = 0.85;
          else intensity *= 0.4;
        } else if (selectedFeature === "jitter") {
          intensity += (Math.random() - 0.5) * 0.4;
          intensity = clamp(intensity, 0, 1);
        }

        // Color gradient from Void -> Deep Cyan -> Electric Green
        const r = Math.round(intensity * 0);
        const g = Math.round(intensity * 255);
        const bCol = Math.round((1 - intensity * 0.4) * 255);

        ctx.fillStyle = `rgb(${r}, ${g}, ${bCol})`;
        ctx.fillRect(colX, h - (b + 1) * binHeight, 2, binHeight);
      }

      // Draw Pitch Contour Overlay if active
      if (showPitchContour) {
        ctx.fillStyle = "#00FF88";
        const pitchY = h - (18 / bins) * h + Math.sin(step * 0.08) * 6;
        ctx.fillRect(colX, pitchY, 2, 3);
      }

      animId = requestAnimationFrame(renderSpectrogram);
    };

    renderSpectrogram();
    return () => cancelAnimationFrame(animId);
  }, [selectedFeature, showPitchContour]);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      <GlobalNav />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-28 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Stage Header */}
        <section className="mb-10">
          <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-blue-400 tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>STAGE 02 {"//"} SPECTRAL FEATURE EXTRACTION</span>
          </div>

          <h1 className="font-['Orbitron',sans-serif] text-2xl sm:text-4xl md:text-5xl font-black tracking-wide text-white mb-4">
            DECODE THE SIGNATURE <span className="text-cyan-400">BEHIND THE SOUND.</span>
          </h1>

          <p className="font-['Inter',sans-serif] text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Examine acoustic patterns beyond words to understand measurable properties of a voice signal. By decomposing time-domain waveforms into frequency bands, pitch tracks, and vocal perturbation proxies, investigators uncover physiological markers of distress.
          </p>
        </section>

        {/* 3D Spectrogram Tunnel + Feature Selector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-12">
          {/* 3D Visualizer Container (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border border-cyan-500/25 bg-zinc-950/80 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.12)]">
            <div className="px-5 py-3 border-b border-cyan-500/20 bg-black/60 flex items-center justify-between font-['JetBrains_Mono',monospace] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-white font-semibold">ROTATING 3D SPECTROGRAM TUNNEL</span>
              </div>
              <span className="text-cyan-300 uppercase">
                FEATURE FOCUS: {selectedFeature}
              </span>
            </div>

            {/* 3D Canvas Scene */}
            <div className="relative w-full h-[380px] sm:h-[440px] bg-black">
              <SpectrogramTunnelScene
                selectedFeature={selectedFeature}
                energy={energy}
              />

              {/* Overlaid Depth & Coordinate Tags */}
              <div className="absolute top-4 left-4 pointer-events-none font-['JetBrains_Mono',monospace] text-[11px] text-cyan-300/80 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-cyan-500/20">
                SPECTRAL GRID: 0 Hz — 4000 Hz
              </div>

              <div className="absolute bottom-4 right-4 pointer-events-none font-['JetBrains_Mono',monospace] text-[11px] text-emerald-400/80 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-500/20">
                TIME WINDOW: 25ms STFT / 10ms HOP
              </div>
            </div>

            {/* Live 2D Spectrogram Waterfall */}
            <div className="p-4 border-t border-cyan-500/20 bg-zinc-950">
              <div className="flex items-center justify-between text-xs font-['JetBrains_Mono',monospace] text-slate-400 mb-2">
                <span>TIME-FREQUENCY SPECTROGRAM WATERFALL (0 — 4 kHz)</span>
                <span className="text-emerald-400">● 64 MEL FILTERBANKS</span>
              </div>
              <canvas
                ref={canvasRef}
                width={700}
                height={85}
                className="w-full h-[85px] bg-black rounded border border-zinc-800"
              />
            </div>
          </div>

          {/* Interactive Feature Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5 border border-zinc-800 bg-zinc-950/70 rounded-xl p-5 sm:p-6 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-['JetBrains_Mono',monospace] text-xs">
                <span className="text-cyan-400 font-semibold">// SPECTRAL FEATURE DIRECTORY</span>
                <span className="text-slate-400">SELECT FEATURE</span>
              </div>

              {/* Feature Selection Buttons */}
              <div className="grid grid-cols-2 gap-2.5 my-4">
                {(Object.keys(FEATURES) as FeatureKey[]).map((key) => {
                  const feat = FEATURES[key];
                  const isSelected = selectedFeature === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedFeature(key)}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                          : "border-zinc-800 bg-zinc-900/40 text-slate-400 hover:border-zinc-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="font-['JetBrains_Mono',monospace] text-[10px] text-slate-500 block uppercase">
                        {feat.category}
                      </span>
                      <strong className="font-['Orbitron',sans-serif] text-xs font-bold block text-white mt-1">
                        {feat.name.split(" — ")[0]}
                      </strong>
                      <span className="font-['JetBrains_Mono',monospace] text-[11px] text-cyan-400 mt-1 block">
                        {feat.metric} {feat.unit.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Feature Detail Card */}
              <div className="p-4 rounded-lg border border-cyan-500/20 bg-zinc-900/60 my-3">
                <div className="flex items-center justify-between mb-2 font-['JetBrains_Mono',monospace] text-xs">
                  <span className="text-white font-bold">{activeFeature.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 bg-cyan-950/50">
                    {activeFeature.calculationType}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif] mb-3">
                  {activeFeature.description}
                </p>

                {/* Mathematical Formulation */}
                <div className="p-2.5 rounded bg-black/70 border border-zinc-800 font-['JetBrains_Mono',monospace] text-[11px] text-cyan-300 mb-3 overflow-x-auto">
                  <code>{activeFeature.mathFormula}</code>
                </div>

                <div className="text-[11px] text-slate-400 font-['Inter',sans-serif]">
                  <strong className="text-white block font-['JetBrains_Mono',monospace] text-[10px] uppercase mb-1">
                    FORENSIC INVESTIGATION RELEVANCE:
                  </strong>
                  {activeFeature.forensicRelevance}
                </div>
              </div>

              {/* Explanatory Overlay Toggles */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="font-['JetBrains_Mono',monospace] text-[10px] text-slate-400 uppercase tracking-wider block">
                  VISUAL LAYER TOGGLES:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-['JetBrains_Mono',monospace]">
                  <button
                    onClick={() => setShowPitchContour((v) => !v)}
                    className={`px-3 py-2 rounded border text-left flex items-center justify-between transition-all ${
                      showPitchContour
                        ? "border-emerald-400 bg-emerald-950/40 text-emerald-300"
                        : "border-zinc-800 bg-zinc-900/40 text-slate-400 hover:border-zinc-700"
                    }`}
                  >
                    <span>F0 PITCH TRACK</span>
                    <span className="text-[10px]">{showPitchContour ? "ON" : "OFF"}</span>
                  </button>

                  <button
                    onClick={() => setShowMelFilterbank((v) => !v)}
                    className={`px-3 py-2 rounded border text-left flex items-center justify-between transition-all ${
                      showMelFilterbank
                        ? "border-cyan-400 bg-cyan-950/40 text-cyan-300"
                        : "border-zinc-800 bg-zinc-900/40 text-slate-400 hover:border-zinc-700"
                    }`}
                  >
                    <span>MEL FILTERBANK</span>
                    <span className="text-[10px]">{showMelFilterbank ? "ON" : "OFF"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scientific Rigor Disclaimer */}
            <div className="pt-3 border-t border-zinc-800 flex items-start gap-2 text-[11px] font-['JetBrains_Mono',monospace] text-slate-400">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{activeFeature.proxyDisclaimer}</span>
            </div>
          </div>
        </div>

        {/* 4 Feature Deep Dive Sections */}
        <section className="my-14">
          <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-cyan-400 tracking-widest uppercase mb-2">
            <span>// DEEP DIVE ACOUSTIC TAXONOMY</span>
          </div>
          <h2 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white mb-6">
            MATHEMATICAL SPECIFICATIONS <span className="text-cyan-400">& CONSTRAINTS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border border-blue-500/40 bg-blue-950/40 flex items-center justify-center text-blue-400 font-['JetBrains_Mono',monospace] text-xs font-bold">
                  01
                </div>
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-white">
                  Mel-Frequency Cepstral Coefficients (MFCC)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif] mb-3">
                Calculated by computing the Short-Time Fourier Transform (STFT) of windowed frames (25 ms with 10 ms hop), mapping the resulting power spectrum onto the non-linear Mel scale using triangular overlapping filters, taking the logarithm of filterbank energies, and applying the Discrete Cosine Transform (DCT-II).
              </p>
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-['JetBrains_Mono',monospace] text-slate-400">
                <strong className="text-cyan-300 block mb-1">ACOUSTIC INSIGHT:</strong>
                Lower coefficients (c1–c4) capture overall vocal tract resonance; higher coefficients capture spectral tilt and fine harmonic detail.
              </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border border-emerald-500/40 bg-emerald-950/40 flex items-center justify-center text-emerald-400 font-['JetBrains_Mono',monospace] text-xs font-bold">
                  02
                </div>
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-white">
                  Fundamental Frequency (F0) & Voiced Segmentation
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif] mb-3">
                Human speech alternates between voiced phonemes (vowels, nasals) produced by vocal fold oscillations and unvoiced phonemes (fricatives, plosives) generated by turbulence. Autocorrelation calculates periodic cycle peaks while rejecting background noise below the 60 Hz – 500 Hz human vocal boundary.
              </p>
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-['JetBrains_Mono',monospace] text-slate-400">
                <strong className="text-emerald-300 block mb-1">ACOUSTIC INSIGHT:</strong>
                Sudden upward pitch octave jumps or sustained high F0 standard deviation indicate heightened acute stress response.
              </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 font-['JetBrains_Mono',monospace] text-xs font-bold">
                  03
                </div>
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-white">
                  Jitter (Pitch Perturbation) & Shimmer (Amplitude Perturbation)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif] mb-3">
                Jitter measures cycle-to-cycle variability in fundamental period duration, while Shimmer measures cycle-to-cycle variability in waveform peak amplitudes. In healthy, calm phonation, jitter remains under 1.04%; under neuromuscular panic, vocal fold control deteriorates rapidly.
              </p>
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-['JetBrains_Mono',monospace] text-slate-400">
                <strong className="text-cyan-300 block mb-1">ACOUSTIC INSIGHT:</strong>
                Serves as a reliable physiological indicator of vocal tremor when acoustic recording quality is clear and uncompressed.
              </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded border border-purple-500/40 bg-purple-950/40 flex items-center justify-center text-purple-400 font-['JetBrains_Mono',monospace] text-xs font-bold">
                  04
                </div>
                <h3 className="font-['Orbitron',sans-serif] text-base font-bold text-white">
                  Speech Rate & Articulation Cadence
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif] mb-3">
                Measures words per minute (WPM) by detecting zero-crossing rates and short-term energy envelope modulations. The system distinguishes between articulation rate (excluding pauses) and speaking rate (including hesitations and silent blocks).
              </p>
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-['JetBrains_Mono',monospace] text-slate-400">
                <strong className="text-purple-300 block mb-1">ACOUSTIC INSIGHT:</strong>
                Irregular, prolonged pauses interspersed with rapid bursts often indicate deception coaching or forced script reading.
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline Stage Progression Explorer */}
        <PipelineTimeline currentStage={2} />

        {/* Stage 02 CTA to Stage 03 */}
        <div className="mt-10 p-6 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-zinc-950 to-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-['JetBrains_Mono',monospace] text-xs text-blue-400 tracking-wider">
              READY FOR TEMPORAL EMOTION MODELING?
            </span>
            <h3 className="font-['Orbitron',sans-serif] text-lg sm:text-xl font-bold text-white mt-1">
              Feed Spectral Vectors Into Wav2Vec2 & BiGRU Sequence Layers
            </h3>
          </div>
          <Link
            href="/pipeline/emotion-modeling"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded border border-blue-400 bg-blue-500 text-black font-['JetBrains_Mono',monospace] text-xs font-bold hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
          >
            <span>EXPLORE EMOTION MODELING</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Floating Stage Switcher */}
      <StageSwitcher currentStage={2} />
    </div>
  );
}
