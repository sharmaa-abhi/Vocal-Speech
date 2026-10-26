"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AudioWaveform,
  BarChart3,
  Brain,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Radio,
  RadioTower,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
  ShieldCheck,
  Zap,
  Terminal,
  Volume2,
  FileAudio,
  Lock,
  Eye,
  SlidersHorizontal,
  GitBranch,
  Clock,
  ExternalLink,
  PhoneCall
} from "lucide-react";
import GlobalNav from "@/components/navigation/GlobalNav";
import PipelineTimeline, { PIPELINE_STAGES } from "@/components/navigation/PipelineTimeline";
import { clamp } from "@/lib/types";

// Simulated Incident Profiles for the Interactive End-to-End Workflow Runner
interface IncidentScenario {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  audioCharacteristics: string;
  stage1: {
    rawSnr: string;
    filteredBand: string;
    rmsDecibels: number;
    attenuation: string;
  };
  stage2: {
    pitchF0: number; // Hz
    pitchBaseline: number;
    jitterPercent: number; // %
    shimmerPercent: number; // %
    wpm: number;
    mfccProfile: number[]; // 13 coeffs
  };
  stage3: {
    distress: number;
    fear: number;
    anger: number;
    nervousness: number;
    latentState: string;
    attentionFocus: string;
  };
  stage4: {
    urgencyScore: number;
    triageCategory: "CRITICAL REVIEW" | "HIGH PRIORITY" | "STANDARD REVIEW";
    riskFactors: string[];
    suggestedProtocol: string;
    assignedDesk: string;
  };
}

const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "scen-1",
    code: "VF-2048",
    title: "DISTRESS VICTIM: DIGITAL ARREST COERCION",
    subtitle: "Impersonation Extortion / Senior Citizen",
    description:
      "Elderly victim placed under fictitious 'digital arrest' by fraudsters threatening asset seizure. Experiencing acute physiological panic and respiratory restriction.",
    audioCharacteristics: "High F0 pitch spikes (+58%), extreme micro-tremor jitter, compressed vocal resonance.",
    stage1: {
      rawSnr: "14.2 dB (Degraded PSTN line)",
      filteredBand: "300 Hz – 3,400 Hz (Telephony Butterworth Bandpass)",
      rmsDecibels: -18.4,
      attenuation: "-36 dB @ 60 Hz hum, -42 dB @ 5.8 kHz line noise"
    },
    stage2: {
      pitchF0: 294,
      pitchBaseline: 185,
      jitterPercent: 8.4,
      shimmerPercent: 12.1,
      wpm: 188,
      mfccProfile: [82, 68, 74, 52, 45, 60, 55, 41, 38, 29, 22, 18, 14]
    },
    stage3: {
      distress: 96,
      fear: 89,
      anger: 18,
      nervousness: 82,
      latentState: "Sharp forward-backward divergence at frame 142 due to abrupt vocal pitch breaks.",
      attentionFocus: "Temporal attention peaked across frames 120–165 during payment demand repetition."
    },
    stage4: {
      urgencyScore: 95,
      triageCategory: "CRITICAL REVIEW",
      riskFactors: [
        "Acoustic distress index > 90% threshold",
        "Elevated vocal tremor (> 8.0% jitter)",
        "Rapid breath cadence indicative of shock",
        "Active extortion keywords detected"
      ],
      suggestedProtocol: "Immediate supervisor call-interception; trigger freeze alert with nodal financial security desk.",
      assignedDesk: "PRIORITY DESK 04 (CYBER-CRIME HELPLINE 1930)"
    }
  },
  {
    id: "scen-2",
    code: "VF-2042",
    title: "COERCED CALLER: DURESS BANK TRANSFER",
    subtitle: "Hostage / Physical Coercion Scenario",
    description:
      "Victim is forced to read prepared script to authorize large wire transfer while under active surveillance by perpetrators.",
    audioCharacteristics: "Constrained vocal tract, suppressed pitch modulation, unnaturally rigid monotone cadence.",
    stage1: {
      rawSnr: "22.5 dB (Cellular VoIP codec)",
      filteredBand: "300 Hz – 3,400 Hz (Clean Bandpass)",
      rmsDecibels: -22.1,
      attenuation: "-28 dB low rumble, -34 dB high hiss"
    },
    stage2: {
      pitchF0: 168,
      pitchBaseline: 172,
      jitterPercent: 5.8,
      shimmerPercent: 8.9,
      wpm: 112,
      mfccProfile: [65, 58, 62, 48, 52, 44, 38, 35, 30, 24, 19, 15, 11]
    },
    stage3: {
      distress: 72,
      fear: 84,
      anger: 22,
      nervousness: 88,
      latentState: "Unusual state flattening in BiGRU backward pass indicating suppressed emotional inflection.",
      attentionFocus: "Attention weights concentrated on prolonged inter-word hesitation silences (> 1.4s)."
    },
    stage4: {
      urgencyScore: 78,
      triageCategory: "HIGH PRIORITY",
      riskFactors: [
        "Severe vocal inflection flattening (monotone duress marker)",
        "Elevated nervousness probability (88%)",
        "Hesitation intervals 3.2x normal baseline"
      ],
      suggestedProtocol: "Verify caller identity via secondary covert safety questions; alert fraud prevention team.",
      assignedDesk: "PRIORITY DESK 02"
    }
  },
  {
    id: "scen-3",
    code: "VF-2037",
    title: "CONFIDENTIAL INFORMANT: COVERT WHISPER TIP",
    subtitle: "Low SNR / Subdued Voice Signal",
    description:
      "Informant secretly transmitting urgent location intelligence from inside an active illegal boiler-room call center.",
    audioCharacteristics: "Sub-vocalized whisper, low acoustic energy, high word rate, background ambient hum.",
    stage1: {
      rawSnr: "8.7 dB (Severe ambient acoustic bleed)",
      filteredBand: "300 Hz – 3,400 Hz (Aggressive Bandpass & Noise Gate)",
      rmsDecibels: -34.8,
      attenuation: "-44 dB low machinery rumble, -38 dB ambient HVAC"
    },
    stage2: {
      pitchF0: 135,
      pitchBaseline: 140,
      jitterPercent: 6.2,
      shimmerPercent: 14.5,
      wpm: 215,
      mfccProfile: [45, 52, 48, 55, 41, 36, 42, 33, 27, 21, 16, 12, 9]
    },
    stage3: {
      distress: 65,
      fear: 78,
      anger: 30,
      nervousness: 70,
      latentState: "High BiGRU recurrence activations triggered by whispered unvoiced fricative bursts.",
      attentionFocus: "Acoustic focus isolated on rapid unvoiced phonemes and suppressed vowel formants."
    },
    stage4: {
      urgencyScore: 62,
      triageCategory: "HIGH PRIORITY",
      riskFactors: [
        "Unusually rapid speech cadence (215 WPM whisper)",
        "High vocal shimmer (14.5%) indicating turbulent air passage",
        "Significant fear indicator (78%)"
      ],
      suggestedProtocol: "Route to Specialized Cyber Intelligence Desk; preserve clean DSP audio isolation stream.",
      assignedDesk: "PRIORITY DESK 01"
    }
  },
  {
    id: "scen-4",
    code: "VF-2031",
    title: "AGGRESSIVE THREAT: RANSOM EXPLOIT DEMAND",
    subtitle: "Hostile Attack / Escalated Anger",
    description:
      "Cyber extortionist issuing hostile countdown deadline on compromised critical enterprise infrastructure.",
    audioCharacteristics: "Explosive vocal attack, high spectral centroid, elevated decibel spikes, prominent vocal power.",
    stage1: {
      rawSnr: "28.0 dB (Direct VoIP connection)",
      filteredBand: "300 Hz – 3,400 Hz (Bandpass with Limiter)",
      rmsDecibels: -12.4,
      attenuation: "-24 dB limiter soft-clipping protection"
    },
    stage2: {
      pitchF0: 265,
      pitchBaseline: 175,
      jitterPercent: 4.2,
      shimmerPercent: 6.8,
      wpm: 175,
      mfccProfile: [94, 88, 82, 75, 70, 64, 58, 49, 42, 35, 28, 22, 17]
    },
    stage3: {
      distress: 35,
      fear: 25,
      anger: 91,
      nervousness: 44,
      latentState: "Maximal forward BiGRU activation driven by sustained high-energy formant saturation.",
      attentionFocus: "Attention spikes aligned with high-intensity consonant attacks and volume crests."
    },
    stage4: {
      urgencyScore: 84,
      triageCategory: "HIGH PRIORITY",
      riskFactors: [
        "Extreme anger emotion signature (91%)",
        "High RMS acoustic energy (-12.4 dB)",
        "Short-deadline threat posture identified"
      ],
      suggestedProtocol: "Escalate to Threat Mitigation Incident Commander; begin telecom IP tracing protocol.",
      assignedDesk: "PRIORITY DESK 03"
    }
  }
];

export default function PipelineOverviewPage() {
  // Selected interactive incident scenario
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const scenario = INCIDENT_SCENARIOS[selectedScenarioIndex];

  // Pipeline simulation state machine
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simActiveStage, setSimActiveStage] = useState<number>(0); // 0 = idle, 1 = ingestion, 2 = features, 3 = emotion, 4 = triage
  const [simProgress, setSimProgress] = useState(0); // 0 to 100
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active stage tab for deep-dive blueprint inspection
  const [inspectStageId, setInspectStageId] = useState<string>("stage-01");

  // Dynamic canvas waveform animation ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Run or Stop the interactive pipeline workflow simulation
  const handleStartSimulation = () => {
    if (simulationRunning) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      setSimulationRunning(false);
      return;
    }

    setSimulationRunning(true);
    setSimActiveStage(1);
    setSimProgress(5);
    setSimLogs([
      `[00:00.000] >> INBOUND PACKET: Received audio stream ${scenario.code} (${scenario.stage1.rawSnr})`,
      `[00:00.015] DSP: Initializing 16,000 Hz Decimation & 4th-order Butterworth Bandpass (300–3,400 Hz)...`
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;

      if (step === 3) {
        setSimActiveStage(2);
        setSimProgress(30);
        setSimLogs((prev) => [
          ...prev,
          `[00:00.042] DSP: Telephony bandpass completed. Noise floor reduced by 38.4 dB.`,
          `[00:00.065] FEATURES: Windowing audio into 25ms Hamming frames with 10ms hop stride...`,
          `[00:00.090] FEATURES: Computing 13 Mel-frequency cepstral coefficients (MFCCs)...`,
          `[00:00.115] FEATURES: Autocorrelation F0 pitch tracked at ${scenario.stage2.pitchF0} Hz (+${scenario.stage2.pitchF0 - scenario.stage2.pitchBaseline} Hz vs baseline). Jitter: ${scenario.stage2.jitterPercent}%`
        ]);
      } else if (step === 6) {
        setSimActiveStage(3);
        setSimProgress(65);
        setSimLogs((prev) => [
          ...prev,
          `[00:00.140] NEURAL_SER: Feeding 17-dim acoustic matrix into Wav2Vec2 convolutional embedding space...`,
          `[00:00.180] NEURAL_SER: BiGRU recurrent forward & backward pass over 3.2s temporal sequence...`,
          `[00:00.220] NEURAL_SER: Multi-head attention pooling resolved. Latent state: ${scenario.stage3.latentState.slice(0, 48)}...`,
          `[00:00.255] NEURAL_SER: Calibrated Softmax: Distress=${scenario.stage3.distress}%, Fear=${scenario.stage3.fear}%, Anger=${scenario.stage3.anger}%, Nervousness=${scenario.stage3.nervousness}%`
        ]);
      } else if (step === 9) {
        setSimActiveStage(4);
        setSimProgress(95);
        setSimLogs((prev) => [
          ...prev,
          `[00:00.285] TRIAGE_ENGINE: Evaluating multi-factor heuristic formula: 0.40(Acoustic) + 0.25(Cadence) + 0.35(Lexical)...`,
          `[00:00.310] TRIAGE_ENGINE: Calculated Urgency Score: ${scenario.stage4.urgencyScore} / 100`,
          `[00:00.335] TRIAGE_ENGINE: Classification -> [${scenario.stage4.triageCategory}]. Routed to ${scenario.stage4.assignedDesk}.`,
          `[00:00.360] >> WORKFLOW COMPLETE: Dispatch telemetry packet published to Officer Tactical HUD.`
        ]);
      } else if (step >= 11) {
        setSimProgress(100);
        setSimulationRunning(false);
        clearInterval(interval);
      }
    }, 700);

    simTimerRef.current = interval;
  };

  const handleResetSimulation = () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    setSimulationRunning(false);
    setSimActiveStage(0);
    setSimProgress(0);
    setSimLogs([
      `[SYSTEM] Pipeline in standby. Select an incident and click "EXECUTE WORKFLOW SIMULATION".`
    ]);
  };

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  // Update logs when scenario changes
  useEffect(() => {
    if (!simulationRunning && simActiveStage === 0) {
      setSimLogs([
        `[READY] Loaded incident ${scenario.code}: "${scenario.title}"`,
        `[CONFIG] Pipeline ready. 4 processing stages primed in memory.`
      ]);
    }
  }, [scenario, simulationRunning, simActiveStage]);

  // Live Animated Canvas Waveform (visualizes DSP stage activity)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    const render = () => {
      time += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background subtle grid lines
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center baseline
      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const centerY = height / 2;
      const amplitudeFactor = simulationRunning ? 1.6 : 0.8;
      const waveFreq = scenario.stage2.pitchF0 / 140;

      // Draw Wave 1: Raw Signal (Noisy & Jittery in red/amber or cyan)
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = simActiveStage >= 1 ? "rgba(0, 240, 255, 0.35)" : "rgba(100, 116, 139, 0.4)";
      for (let x = 0; x < width; x++) {
        const u = x / width;
        const noise = Math.sin(x * 1.5 + time * 6) * 4 + (Math.random() - 0.5) * 5;
        const primary = Math.sin(u * 25 * waveFreq + time * 3.5) * (20 * amplitudeFactor);
        const y = centerY + primary + (simActiveStage === 1 ? noise * 2 : noise * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Wave 2: Filtered & Feature-Extracted Bandpass Signal (Clean neon pulse)
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle =
        simActiveStage >= 2
          ? "#00FF88"
          : simActiveStage === 1
          ? "#00F0FF"
          : "rgba(0, 240, 255, 0.7)";
      ctx.shadowColor = simActiveStage >= 2 ? "#00FF88" : "#00F0FF";
      ctx.shadowBlur = 10;

      for (let x = 0; x < width; x++) {
        const u = x / width;
        const harm1 = Math.sin(u * 18 * waveFreq + time * 4.2) * (24 * amplitudeFactor);
        const harm2 = Math.sin(u * 36 * waveFreq + time * 2.1) * (8 * amplitudeFactor);
        const modulation = Math.sin(u * 4 + time * 1.2) * 0.5 + 0.5;
        const y = centerY + (harm1 + harm2) * modulation;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animFrame);
  }, [simulationRunning, simActiveStage, scenario]);

  return (
    <main className="relative min-h-screen bg-black text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-white">
      {/* Ambient background atmosphere */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_15%,_rgba(0,240,255,0.08)_0%,_rgba(0,255,136,0.03)_40%,_transparent_75%)]" />
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.8)_3px)]" />

      {/* Global Application Navigation Bar */}
      <GlobalNav />

      {/* Hero & Architectural Title Section */}
      <div className="relative pt-28 pb-12 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto z-10">
        {/* Breadcrumb & System Telemetry Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-cyan-500/20 font-['JetBrains_Mono',monospace] text-xs">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00F0FF]" />
            <span className="tracking-widest uppercase">
              NATIONAL CYBERSECURITY VOCAL FORENSICS // ARCHITECTURAL BLUEPRINT
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% IN-BROWSER DSP</span>
            </span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>EST. TOTAL LATENCY: ~46ms</span>
            </span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="text-emerald-300">CORE STATUS: FULL DUPLEX 4-STAGE ENGINE</span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 font-['JetBrains_Mono',monospace] text-xs tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
            <span>END-TO-END PIPELINE WORKFLOW & DATA BUS</span>
          </div>

          <h1 className="font-['Orbitron',sans-serif] text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
            REAL-TIME ACOUSTIC <span className="text-cyan-400 text-glow">SIGNAL WORKFLOW</span>
          </h1>

          <p className="font-['Inter',sans-serif] text-slate-300 text-base sm:text-lg leading-relaxed mt-4 max-w-3xl">
            From raw, degraded emergency telephony audio to millisecond-priority triage: Explore the complete
            local digital signal processing (DSP) filters, spectral MFCC feature extraction, deep recurrent BiGRU
            sequence modeling, and multi-factor decision-support heuristics powering real-time cybercrime vocal forensics.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 font-['JetBrains_Mono',monospace]">
            <div className="p-3.5 rounded border border-cyan-500/20 bg-zinc-950/70 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">STAGE 01 INGESTION</div>
              <div className="text-sm font-bold text-cyan-300">300–3,400 Hz</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Telephony Butterworth DSP</div>
            </div>
            <div className="p-3.5 rounded border border-blue-500/20 bg-zinc-950/70 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">STAGE 02 FEATURES</div>
              <div className="text-sm font-bold text-blue-300">17-Dim Vector</div>
              <div className="text-[10px] text-slate-500 mt-0.5">13 MFCCs · F0 · Jitter · WPM</div>
            </div>
            <div className="p-3.5 rounded border border-emerald-500/20 bg-zinc-950/70 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">STAGE 03 SER MODEL</div>
              <div className="text-sm font-bold text-emerald-300">Wav2Vec2 + BiGRU</div>
              <div className="text-[10px] text-slate-500 mt-0.5">128-Unit Bidirectional RNN</div>
            </div>
            <div className="p-3.5 rounded border border-teal-500/20 bg-zinc-950/70 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">STAGE 04 TRIAGE</div>
              <div className="text-sm font-bold text-teal-300">0–100 Radar Index</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Human-in-the-Loop Protocol</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE END-TO-END WORKFLOW DIAGRAM */}
      <section className="relative py-8 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto z-10">
        <div className="p-6 sm:p-8 rounded-xl border border-cyan-500/25 bg-zinc-950/80 backdrop-blur-md shadow-[0_0_40px_rgba(0,240,255,0.08)]">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-cyan-500/15">
            <div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-cyan-400 tracking-widest mb-1.5 uppercase">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>INTERACTIVE ARCHITECTURE DATA BUS</span>
              </div>
              <h2 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white">
                END-TO-END PIPELINE <span className="text-cyan-400">DATA FLOW DIAGRAM</span>
              </h2>
            </div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-slate-400 max-w-md">
              Follow how an incoming emergency audio signal transforms sequentially across each specialized forensic station.
              Click any stage card to inspect its mathematical formulation and input/output contracts.
            </p>
          </div>

          {/* Connected Workflow Pipeline Stations Flowchart */}
          <div className="relative">
            {/* Desktop Connecting Data Flow Rail */}
            <div className="hidden xl:block absolute top-[68px] left-[6%] right-[6%] h-[3px] pointer-events-none z-0">
              <div className="w-full h-full bg-cyan-950 border-t border-b border-cyan-500/20" />
              {/* Animated glowing packet tracer */}
              <motion.div
                className="absolute top-[-2px] h-[7px] w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00F0FF] rounded-full"
                animate={{
                  left: ["0%", "100%"]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "linear"
                }}
              />
            </div>

            {/* 5-Station Interactive Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Station 00: Inbound Audio Source */}
              <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono',monospace] text-slate-400 mb-2">
                    <span>SOURCE 00</span>
                    <span className="px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-[9px]">INBOUND</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <h3 className="font-['Orbitron',sans-serif] text-xs font-bold text-white">
                      Raw Voice Inbound
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Emergency call audio via Web Audio API mic stream, PSTN telephony, or uploaded WAV PCM forensic buffer.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-['JetBrains_Mono',monospace] text-[10px] text-slate-400">
                  <span className="text-cyan-400 font-semibold">PAYLOAD:</span> 16–48 kHz PCM Float32
                </div>
              </div>

              {/* Station 01: Ingestion & Filtering */}
              <div
                onClick={() => setInspectStageId("stage-01")}
                className={`cursor-pointer p-4 rounded-lg border transition-all flex flex-col justify-between ${
                  inspectStageId === "stage-01"
                    ? "border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(0,240,255,0.2)] ring-1 ring-cyan-400/50"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-cyan-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono',monospace] mb-2">
                    <span className="text-cyan-400 font-bold">STAGE 01</span>
                    <span className="px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40 text-[9px] text-cyan-300">
                      DSP FILTER
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded bg-cyan-950/50 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.25)]">
                      <AudioWaveform className="w-4 h-4" />
                    </div>
                    <h3 className="font-['Orbitron',sans-serif] text-xs font-bold text-white">
                      Ingestion & Filter
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    4th-order Butterworth bandpass (300–3,400 Hz) isolates speech formants and suppresses line rumble and high hiss.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-['JetBrains_Mono',monospace] text-[10px] text-slate-400 flex items-center justify-between">
                  <span>CLEAN BUFFER</span>
                  <Link
                    href="/pipeline/audio-ingestion"
                    className="text-cyan-400 hover:underline flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>LAB</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              {/* Station 02: Feature Extraction */}
              <div
                onClick={() => setInspectStageId("stage-02")}
                className={`cursor-pointer p-4 rounded-lg border transition-all flex flex-col justify-between ${
                  inspectStageId === "stage-02"
                    ? "border-blue-400 bg-blue-950/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-400/50"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-blue-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono',monospace] mb-2">
                    <span className="text-blue-400 font-bold">STAGE 02</span>
                    <span className="px-1.5 py-0.5 rounded border border-blue-500/30 bg-blue-950/40 text-[9px] text-blue-300">
                      EXTRACTION
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded bg-blue-950/50 border border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.25)]">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h3 className="font-['Orbitron',sans-serif] text-xs font-bold text-white">
                      Spectral Features
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    13-band Mel-frequency cepstral coefficients (MFCCs), autocorrelation F0 pitch, jitter/shimmer micro-tremors, and WPM pace.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-['JetBrains_Mono',monospace] text-[10px] text-slate-400 flex items-center justify-between">
                  <span>17-DIM VECTOR</span>
                  <Link
                    href="/pipeline/feature-extraction"
                    className="text-blue-400 hover:underline flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>LAB</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              {/* Station 03: Emotion Modeling */}
              <div
                onClick={() => setInspectStageId("stage-03")}
                className={`cursor-pointer p-4 rounded-lg border transition-all flex flex-col justify-between ${
                  inspectStageId === "stage-03"
                    ? "border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(0,255,136,0.2)] ring-1 ring-emerald-400/50"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-emerald-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono',monospace] mb-2">
                    <span className="text-emerald-400 font-bold">STAGE 03</span>
                    <span className="px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/40 text-[9px] text-emerald-300">
                      NEURAL SER
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded bg-emerald-950/50 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(0,255,136,0.25)]">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h3 className="font-['Orbitron',sans-serif] text-xs font-bold text-white">
                      Temporal SER Model
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Wav2Vec 2.0 self-supervised representations with Bidirectional GRU (BiGRU) sequence tracking for distress, fear, and tension.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-['JetBrains_Mono',monospace] text-[10px] text-slate-400 flex items-center justify-between">
                  <span>EMOTION LOGITS</span>
                  <Link
                    href="/pipeline/emotion-modeling"
                    className="text-emerald-400 hover:underline flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>LAB</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>

              {/* Station 04: Priority Triage Support */}
              <div
                onClick={() => setInspectStageId("stage-04")}
                className={`cursor-pointer p-4 rounded-lg border transition-all flex flex-col justify-between ${
                  inspectStageId === "stage-04"
                    ? "border-teal-400 bg-teal-950/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-teal-400/50"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-teal-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono',monospace] mb-2">
                    <span className="text-teal-400 font-bold">STAGE 04</span>
                    <span className="px-1.5 py-0.5 rounded border border-teal-500/30 bg-teal-950/40 text-[9px] text-teal-300">
                      DECISION
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded bg-teal-950/50 border border-teal-400 text-teal-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h3 className="font-['Orbitron',sans-serif] text-xs font-bold text-white">
                      Priority Triage Support
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Synthesizes acoustic urgency (0–100), maps onto 3D holographic radar, and populates prioritized queue for human officers.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-['JetBrains_Mono',monospace] text-[10px] text-slate-400 flex items-center justify-between">
                  <span>DISPATCH QUEUE</span>
                  <Link
                    href="/pipeline/priority-triage"
                    className="text-teal-400 hover:underline flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>LAB</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Inspector Drawer for Selected Stage */}
          <div className="mt-8 pt-6 border-t border-cyan-500/20">
            {inspectStageId === "stage-01" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-['JetBrains_Mono',monospace]">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs mb-2">
                    <AudioWaveform className="w-4 h-4" />
                    <span className="font-bold">STAGE 01 SPECIFICATION // AUDIO INGESTION & BANDPASS DSP</span>
                  </div>
                  <h4 className="font-['Orbitron',sans-serif] text-lg font-bold text-white mb-2">
                    Acoustic Pre-Processing & Frequency Domain Bandpass
                  </h4>
                  <p className="text-xs text-slate-300 font-['Inter',sans-serif] leading-relaxed mb-4">
                    In emergency telephony, raw signals suffer from ambient background noise, low-frequency 50/60 Hz
                    electrical hum, and high-frequency codec aliasing. Stage 01 implements a 4th-order Butterworth
                    digital bandpass filter configured strictly between 300 Hz and 3,400 Hz (the international ITU-T G.712 standard
                    for voice frequencies).
                  </p>
                  <div className="p-3.5 rounded bg-black/80 border border-cyan-500/20 text-xs text-cyan-300">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">MATHEMATICAL TRANSFER FUNCTION</div>
                    <code className="text-xs text-white">
                      H(s) = [ (ω_0 / Q) · s ] / [ s² + (ω_0 / Q) · s + ω_0² ]
                    </code>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Cutoffs: f_low = 300 Hz, f_high = 3,400 Hz, Sampling: 16 kHz, Latency: &lt; 4.2 ms.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded border border-cyan-500/20 bg-black/60 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-cyan-400 mb-2 uppercase">DATA CONTRACT</div>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li><strong className="text-white">Input:</strong> Float32Array PCM [-1.0, 1.0]</li>
                      <li><strong className="text-white">Sample Rate:</strong> 16,000 Hz Decimated</li>
                      <li><strong className="text-white">SNR Improvement:</strong> +18.4 dB nominal</li>
                      <li><strong className="text-white">Execution:</strong> Web Audio API + OfflineAudioContext</li>
                    </ul>
                  </div>
                  <Link
                    href="/pipeline/audio-ingestion"
                    className="mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-bold transition-all"
                  >
                    <span>ENTER 3D INGESTION SPHERE LAB</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {inspectStageId === "stage-02" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-['JetBrains_Mono',monospace]">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 text-blue-400 text-xs mb-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="font-bold">STAGE 02 SPECIFICATION // SPECTRAL FEATURE EXTRACTION</span>
                  </div>
                  <h4 className="font-['Orbitron',sans-serif] text-lg font-bold text-white mb-2">
                    Short-Term Spectral Envelope & Prosodic Biomarkers
                  </h4>
                  <p className="text-xs text-slate-300 font-['Inter',sans-serif] leading-relaxed mb-4">
                    Stage 02 slices the filtered signal into overlapping 25ms Hamming-windowed frames with a 10ms hop
                    stride (100 frames/sec). It applies a Fast Fourier Transform (FFT) followed by a 26-channel triangular
                    Mel-scale filterbank and Discrete Cosine Transform (DCT-II) to extract 13 MFCC coefficients representing
                    vocal tract shape. In parallel, it calculates autocorrelation F0 pitch, cycle-to-cycle jitter proxies,
                    and syllable cadence.
                  </p>
                  <div className="p-3.5 rounded bg-black/80 border border-blue-500/20 text-xs text-blue-300">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">MEL SCALE FORMULATION</div>
                    <code className="text-xs text-white">
                      Mel(f) = 2595 · log₁₀( 1 + f / 700 ) | c_n = ∑ log(S_m) · cos[ π n / M · (m - 0.5) ]
                    </code>
                    <div className="text-[11px] text-slate-400 mt-1">
                      17 Acoustic Parameters per frame: 13 MFCCs + F0 (Hz) + Jitter (%) + Shimmer (%) + WPM Pace.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded border border-blue-500/20 bg-black/60 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-blue-400 mb-2 uppercase">DATA CONTRACT</div>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li><strong className="text-white">Input:</strong> 25ms Windowed Float32 Frames</li>
                      <li><strong className="text-white">Output Tensor:</strong> [Batch, TimeSteps, 17]</li>
                      <li><strong className="text-white">Frame Rate:</strong> 100 fps (10ms stride)</li>
                      <li><strong className="text-white">Pitch Range:</strong> 65 Hz – 500 Hz (Autocorrelation)</li>
                    </ul>
                  </div>
                  <Link
                    href="/pipeline/feature-extraction"
                    className="mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400 text-blue-300 text-xs font-bold transition-all"
                  >
                    <span>ENTER 3D SPECTROGRAM TUNNEL LAB</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {inspectStageId === "stage-03" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-['JetBrains_Mono',monospace]">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs mb-2">
                    <Brain className="w-4 h-4" />
                    <span className="font-bold">STAGE 03 SPECIFICATION // TEMPORAL EMOTION MODELING</span>
                  </div>
                  <h4 className="font-['Orbitron',sans-serif] text-lg font-bold text-white mb-2">
                    Wav2Vec2 Convolutions + Bidirectional GRU Recurrence
                  </h4>
                  <p className="text-xs text-slate-300 font-['Inter',sans-serif] leading-relaxed mb-4">
                    Stage 03 captures long-range temporal context across 3 to 5 second vocal segments. High-level acoustic
                    embeddings pass into a 2-layer Bidirectional Gated Recurrent Unit (BiGRU) with 128 hidden units. The forward
                    pass tracks emotional escalation, while the backward pass contextualizes sudden pitch drops or tremors
                    against surrounding speech. A temporal multi-head attention pooling layer collapses the sequence into
                    4 calibrated emotion probabilities.
                  </p>
                  <div className="p-3.5 rounded bg-black/80 border border-emerald-500/20 text-xs text-emerald-300">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">BIGRU RECURRENT GATING</div>
                    <code className="text-xs text-white">
                      h_t = (1 - z_t) ⊙ h_{`{t-1}`} + z_t ⊙ tanh(W_h x_t + U_h (r_t ⊙ h_{`{t-1}`}))
                    </code>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Target Indicative Vectors: Distress (Panic), Fear (Threat), Anger (Hostility), Nervousness (Coercion).
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded border border-emerald-500/20 bg-black/60 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-400 mb-2 uppercase">DATA CONTRACT</div>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li><strong className="text-white">Input:</strong> [Batch, 300, 17] Acoustic Sequence</li>
                      <li><strong className="text-white">Hidden States:</strong> 128-dim BiGRU (256 concatenated)</li>
                      <li><strong className="text-white">Output Vector:</strong> 4 Softmax Emotion Probabilities</li>
                      <li><strong className="text-white">Inference Time:</strong> ~32 ms (Client-Side Wasm/WebGPU)</li>
                    </ul>
                  </div>
                  <Link
                    href="/pipeline/emotion-modeling"
                    className="mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-xs font-bold transition-all"
                  >
                    <span>ENTER 3D NEURAL NETWORK LAB</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {inspectStageId === "stage-04" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-['JetBrains_Mono',monospace]">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 text-teal-400 text-xs mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="font-bold">STAGE 04 SPECIFICATION // PRIORITY TRIAGE SUPPORT ENGINE</span>
                  </div>
                  <h4 className="font-['Orbitron',sans-serif] text-lg font-bold text-white mb-2">
                    Multi-Factor Urgency Scoring & Human-in-the-Loop Queue
                  </h4>
                  <p className="text-xs text-slate-300 font-['Inter',sans-serif] leading-relaxed mb-4">
                    Stage 04 synthesizes acoustic biomarkers, emotion classification probabilities, and lexical threat
                    heuristics into a composite Urgency Index (0–100). Calls are mapped onto a 3D holographic radar and
                    sorted into 3 actionable tiers: Critical Review (Urgency ≥ 85), High Priority (60–84), and Standard Review.
                    Crucially, AI acts strictly as an assistive prioritization filter—the human officer retains 100% operational
                    decision authority.
                  </p>
                  <div className="p-3.5 rounded bg-black/80 border border-teal-500/20 text-xs text-teal-300">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">TRIAGE HEURISTIC EQUATION</div>
                    <code className="text-xs text-white">
                      Urgency = min(100, 0.40 · S_acoustic + 0.25 · S_cadence + 0.35 · S_lexical)
                    </code>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Automated classification tags: Financial Fraud, Digital Arrest, Coercion, Account Takeover.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded border border-teal-500/20 bg-black/60 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-teal-400 mb-2 uppercase">DATA CONTRACT</div>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li><strong className="text-white">Input:</strong> Emotion Vector + Jitter + Lexical Alert</li>
                      <li><strong className="text-white">Output Score:</strong> Integer Urgency Index (0–100)</li>
                      <li><strong className="text-white">Tier Thresholds:</strong> Critical (≥85) / High (≥60)</li>
                      <li><strong className="text-white">Target Interface:</strong> Officer Tactical HUD (/dashboard)</li>
                    </ul>
                  </div>
                  <Link
                    href="/pipeline/priority-triage"
                    className="mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400 text-teal-300 text-xs font-bold transition-all"
                  >
                    <span>ENTER 3D HOLOGRAPHIC RADAR LAB</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: LIVE INTERACTIVE SIGNAL WORKFLOW SIMULATOR */}
      <section className="relative py-8 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto z-10">
        <div className="p-6 sm:p-8 rounded-xl border border-cyan-500/30 bg-zinc-950/90 backdrop-blur-md shadow-[0_0_50px_rgba(0,240,255,0.12)]">
          {/* Simulator Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-8 border-b border-cyan-500/20">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-['JetBrains_Mono',monospace] text-xs mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>INTERACTIVE WORKFLOW SIMULATION LAB</span>
              </div>
              <h2 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white">
                TEST AN INCIDENT THROUGH <span className="text-cyan-400">THE 4-STAGE PIPELINE</span>
              </h2>
              <p className="font-['Inter',sans-serif] text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Select a simulated emergency call scenario below, execute the live workflow runner, and observe
                how raw audio decodes into filtered waveforms, spectral MFCCs, BiGRU emotion logits, and prioritized triage.
              </p>
            </div>

            {/* Simulation Execution Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleStartSimulation}
                className={`flex items-center gap-2 px-5 py-2.5 rounded font-['JetBrains_Mono',monospace] text-xs font-bold transition-all shadow-lg ${
                  simulationRunning
                    ? "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    : "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                }`}
              >
                {simulationRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>PAUSE WORKFLOW</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>EXECUTE WORKFLOW SIMULATION</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetSimulation}
                className="flex items-center gap-2 px-4 py-2.5 rounded border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-slate-300 font-['JetBrains_Mono',monospace] text-xs transition-all"
                title="Reset simulation to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Incident Scenario Selector Cards */}
          <div className="mb-8">
            <div className="text-[11px] font-['JetBrains_Mono',monospace] text-slate-400 uppercase tracking-wider mb-3">
              STEP 1: SELECT SIMULATED CYBERCRIME INBOUND CALL SCENARIO:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {INCIDENT_SCENARIOS.map((scen, idx) => {
                const isSelected = selectedScenarioIndex === idx;
                return (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setSelectedScenarioIndex(idx);
                      if (simulationRunning) handleResetSimulation();
                    }}
                    className={`text-left p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] ring-1 ring-cyan-400/40"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80"
                    }`}
                  >
                    <div className="flex items-center justify-between font-['JetBrains_Mono',monospace] text-[10px] mb-1.5">
                      <span className={isSelected ? "text-cyan-300 font-bold" : "text-slate-400"}>
                        {scen.code}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded border text-[9px] ${
                          scen.stage4.urgencyScore >= 85
                            ? "border-red-500/40 bg-red-950/40 text-red-300"
                            : "border-amber-500/40 bg-amber-950/40 text-amber-300"
                        }`}
                      >
                        URGENCY {scen.stage4.urgencyScore}
                      </span>
                    </div>
                    <div className="font-['Orbitron',sans-serif] text-xs font-bold text-white line-clamp-1 mb-1">
                      {scen.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {scen.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Pipeline Execution Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Step Progress & Live Waveform + Real-time Stage Meters */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Progress Rail */}
              <div className="p-4 rounded-lg border border-cyan-500/20 bg-zinc-950/60 font-['JetBrains_Mono',monospace]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">WORKFLOW PROGRESSION</span>
                    <span className="text-slate-500">{"//"}</span>
                    <span className="text-slate-300">
                      {simActiveStage === 0
                        ? "STANDBY"
                        : simActiveStage === 1
                        ? "STAGE 01: AUDIO INGESTION & FILTERING"
                        : simActiveStage === 2
                        ? "STAGE 02: SPECTRAL FEATURE EXTRACTION"
                        : simActiveStage === 3
                        ? "STAGE 03: TEMPORAL EMOTION MODELING"
                        : "STAGE 04: PRIORITY TRIAGE & DISPATCH"}
                    </span>
                  </div>
                  <span className="text-cyan-400 font-bold">{simProgress}%</span>
                </div>

                <div className="relative w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 shadow-[0_0_12px_#00F0FF]"
                    style={{ width: `${simProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Stage Indicators */}
                <div className="grid grid-cols-4 gap-2 mt-3 text-[10px] text-center">
                  {[
                    { num: "01", name: "INGESTION", stage: 1, color: "text-cyan-400" },
                    { num: "02", name: "FEATURES", stage: 2, color: "text-blue-400" },
                    { num: "03", name: "NEURAL SER", stage: 3, color: "text-emerald-400" },
                    { num: "04", name: "TRIAGE", stage: 4, color: "text-teal-400" }
                  ].map((s) => {
                    const isDone = simActiveStage > s.stage || simProgress === 100;
                    const isCurrent = simActiveStage === s.stage;

                    return (
                      <div
                        key={s.num}
                        className={`p-1.5 rounded border transition-all ${
                          isCurrent
                            ? "border-cyan-400 bg-cyan-950/50 text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                            : isDone
                            ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                            : "border-zinc-800 bg-zinc-900/30 text-slate-500"
                        }`}
                      >
                        <div className="font-bold flex items-center justify-center gap-1">
                          {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : null}
                          <span>STAGE {s.num}</span>
                        </div>
                        <div className="text-[9px] opacity-80">{s.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Signal Canvas: Raw vs Filtered Bandpass */}
              <div className="relative p-4 rounded-lg border border-cyan-500/20 bg-black/80 overflow-hidden">
                <div className="flex items-center justify-between font-['JetBrains_Mono',monospace] text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-white font-bold">LIVE DSP SIGNAL OSCILLOSCOPE</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-3 h-0.5 bg-slate-500 inline-block" /> Raw Input
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-3 h-0.5 bg-emerald-400 inline-block shadow-[0_0_6px_#00FF88]" />
                      Filtered Bandpass (300–3,400 Hz)
                    </span>
                  </div>
                </div>

                {/* Oscilloscope Canvas */}
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={150}
                  className="w-full h-[150px] rounded bg-zinc-950/90 border border-zinc-800"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 font-['JetBrains_Mono',monospace] text-[11px]">
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-slate-500 block text-[9px]">PITCH F0</span>
                    <span className="text-cyan-300 font-bold">{scenario.stage2.pitchF0} Hz</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-slate-500 block text-[9px]">JITTER (TREMOR)</span>
                    <span className="text-blue-300 font-bold">{scenario.stage2.jitterPercent}%</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-slate-500 block text-[9px]">SPEECH PACE</span>
                    <span className="text-emerald-300 font-bold">{scenario.stage2.wpm} WPM</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-slate-500 block text-[9px]">RMS POWER</span>
                    <span className="text-teal-300 font-bold">{scenario.stage1.rmsDecibels} dB</span>
                  </div>
                </div>
              </div>

              {/* Live Intermediate Stages Output Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stage 02: 13 MFCC Spectral Bars Preview */}
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950/70">
                  <div className="flex items-center justify-between text-xs font-['JetBrains_Mono',monospace] mb-2">
                    <span className="text-blue-400 font-bold">STAGE 02 // 13 MFCC BANDS</span>
                    <span className="text-[10px] text-slate-500">VOICE TRACT SHAPE</span>
                  </div>
                  <div className="flex items-end gap-1 h-20 pt-2">
                    {scenario.stage2.mfccProfile.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <motion.div
                          className="w-full rounded-t bg-gradient-to-t from-blue-700 to-cyan-400"
                          initial={{ height: 0 }}
                          animate={{
                            height: simActiveStage >= 2 || simProgress === 100 ? `${val}%` : "15%"
                          }}
                          transition={{ duration: 0.4, delay: i * 0.02 }}
                        />
                        <span className="text-[8px] font-['JetBrains_Mono',monospace] text-slate-500">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage 03: Emotion Logits Breakdown */}
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950/70 font-['JetBrains_Mono',monospace]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-emerald-400 font-bold">STAGE 03 // BiGRU EMOTION VECTORS</span>
                    <span className="text-[10px] text-slate-500">SER SOFTMAX</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    {[
                      { label: "DISTRESS", val: scenario.stage3.distress, color: "#00FF88" },
                      { label: "FEAR", val: scenario.stage3.fear, color: "#00F0FF" },
                      { label: "ANGER", val: scenario.stage3.anger, color: "#3B82F6" },
                      { label: "NERVOUSNESS", val: scenario.stage3.nervousness, color: "#78F7D0" }
                    ].map((emo) => (
                      <div key={emo.label}>
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="text-slate-400">{emo.label}</span>
                          <span className="font-bold text-white">
                            {simActiveStage >= 3 || simProgress === 100 ? `${emo.val}%` : "—"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: emo.color }}
                            animate={{
                              width: simActiveStage >= 3 || simProgress === 100 ? `${emo.val}%` : "0%"
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Triage Escalation Card & Real-time Console Log Terminal */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Triage Decision Card */}
              <div
                className={`p-5 rounded-lg border transition-all ${
                  simActiveStage >= 4 || simProgress === 100
                    ? scenario.stage4.urgencyScore >= 85
                      ? "border-red-500/50 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                      : "border-amber-500/50 bg-amber-950/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                    : "border-zinc-800 bg-zinc-950/70"
                }`}
              >
                <div className="flex items-center justify-between font-['JetBrains_Mono',monospace] text-xs pb-3 mb-3 border-b border-zinc-800">
                  <span className="text-teal-400 font-bold">STAGE 04 OUTPUT</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scenario.stage4.urgencyScore >= 85
                        ? "bg-red-500 text-black"
                        : "bg-amber-500 text-black"
                    }`}
                  >
                    {simActiveStage >= 4 || simProgress === 100
                      ? scenario.stage4.triageCategory
                      : "AWAITING TRIAGE"}
                  </span>
                </div>

                {/* Big Score Display */}
                <div className="text-center py-3">
                  <div className="text-[11px] font-['JetBrains_Mono',monospace] text-slate-400 mb-1">
                    COMPUTED URGENCY INDEX
                  </div>
                  <div
                    className={`font-['Orbitron',sans-serif] text-5xl font-black ${
                      scenario.stage4.urgencyScore >= 85
                        ? "text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        : "text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    }`}
                  >
                    {simActiveStage >= 4 || simProgress === 100 ? scenario.stage4.urgencyScore : "--"}
                    <span className="text-xl text-slate-500 font-normal"> / 100</span>
                  </div>
                  <div className="text-xs font-['JetBrains_Mono',monospace] text-slate-400 mt-2">
                    Assigned: {scenario.stage4.assignedDesk}
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="mt-4 pt-3 border-t border-zinc-800 font-['JetBrains_Mono',monospace] text-xs">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">
                    ACOUSTIC RISK AUDIT TRAIL:
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {scenario.stage4.riskFactors.map((rf, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">›</span>
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Protocol */}
                <div className="mt-4 p-3 rounded bg-black/60 border border-zinc-800 text-xs font-['JetBrains_Mono',monospace]">
                  <div className="text-[10px] text-amber-400 font-bold mb-1 uppercase flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>RECOMMENDED DISPATCH PROTOCOL:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {scenario.stage4.suggestedProtocol}
                  </p>
                </div>

                {/* Action Link to HUD */}
                <Link
                  href="/dashboard"
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-['JetBrains_Mono',monospace] text-xs font-bold transition-all"
                >
                  <RadioTower className="w-4 h-4 text-emerald-400" />
                  <span>VIEW IN LIVE OFFICER HUD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Console Event Log Terminal */}
              <div className="p-4 rounded-lg border border-zinc-800 bg-black/90 font-['JetBrains_Mono',monospace] text-xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>REAL-TIME PIPELINE EVENT LOG</span>
                    </div>
                    <span className="text-emerald-400">LIVE BUFFER</span>
                  </div>

                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto text-[10.5px] leading-tight pr-1">
                    {simLogs.map((log, index) => (
                      <div
                        key={index}
                        className={
                          log.includes(">>")
                            ? "text-cyan-300 font-bold"
                            : log.includes("TRIAGE")
                            ? "text-amber-300"
                            : log.includes("NEURAL")
                            ? "text-emerald-300"
                            : "text-slate-400"
                        }
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-[9px] text-slate-500 flex items-center justify-between">
                  <span>TERMINAL: TTY-ACOUSTIC-01</span>
                  <span>ENCRYPTION: LOCAL SHA-256</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ARCHITECTURAL DATA FLOW CONTRACTS & BENCHMARKS TABLE */}
      <section className="relative py-8 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto z-10">
        <div className="p-6 sm:p-8 rounded-xl border border-cyan-500/20 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-cyan-500/15">
            <div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-cyan-400 tracking-widest mb-1.5 uppercase">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>TECHNICAL BENCHMARK MATRIX</span>
              </div>
              <h2 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white">
                STAGE-BY-STAGE <span className="text-cyan-400">DATA SPECIFICATIONS</span>
              </h2>
            </div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-slate-400 max-w-md">
              Full contract definitions of payload formats, mathematical operators, and latency budgets across the
              system pipeline.
            </p>
          </div>

          {/* High-Tech Specs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-['JetBrains_Mono',monospace] text-xs border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/30 text-cyan-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Input Format</th>
                  <th className="py-3 px-4">DSP / Neural Operator</th>
                  <th className="py-3 px-4">Latency Budget</th>
                  <th className="py-3 px-4">Output Artifact</th>
                  <th className="py-3 px-4">Target Consumer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-slate-300">
                <tr className="hover:bg-cyan-950/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      01 // Ingestion
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Raw Mic / Telephony WAV (16–48 kHz)</td>
                  <td className="py-3.5 px-4">4th-order Butterworth Bandpass (300–3,400 Hz)</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">&lt; 4.2 ms</td>
                  <td className="py-3.5 px-4 text-white">Decimated Float32 Mono Buffer</td>
                  <td className="py-3.5 px-4 text-slate-400">Stage 02 (Feature Extraction)</td>
                </tr>

                <tr className="hover:bg-blue-950/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-blue-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      02 // Features
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Filtered 25ms Hamming Frames (10ms Hop)</td>
                  <td className="py-3.5 px-4">26-Mel FFT Filterbank + DCT-II + Yin Pitch Tracker</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">&lt; 7.8 ms</td>
                  <td className="py-3.5 px-4 text-white">17-dim Acoustic Feature Vector</td>
                  <td className="py-3.5 px-4 text-slate-400">Stage 03 (Neural SER)</td>
                </tr>

                <tr className="hover:bg-emerald-950/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-emerald-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      03 // Neural SER
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Sequence Matrix [T=300, Dim=17]</td>
                  <td className="py-3.5 px-4">Wav2Vec2 Convolutions + 128-unit BiGRU + Attention</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">&lt; 32.5 ms</td>
                  <td className="py-3.5 px-4 text-white">4 Calibrated Emotion Softmax Logits</td>
                  <td className="py-3.5 px-4 text-slate-400">Stage 04 (Triage Support)</td>
                </tr>

                <tr className="hover:bg-teal-950/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-teal-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      04 // Triage Support
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Emotion Vector + Prosodic Tremor + Lexical</td>
                  <td className="py-3.5 px-4">Multi-Factor Heuristic Urgency Equation (0–100)</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">&lt; 1.5 ms</td>
                  <td className="py-3.5 px-4 text-white">Urgency Score + Holographic Radar Coords</td>
                  <td className="py-3.5 px-4 text-slate-400">Officer Tactical HUD (/dashboard)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-[11px] font-['JetBrains_Mono',monospace] text-slate-400">
            <div>
              TOTAL ESTIMATED PIPELINE LATENCY:{" "}
              <strong className="text-cyan-400 font-bold">46.0 ms</strong> (Well within 150 ms real-time telephony ITU-T threshold)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-emerald-300">ZERO NETWORK DEPENDENCY / AIR-GAPPED READY</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ETHICAL AI & PRIVACY COMPLIANCE BLUEPRINT */}
      <section className="relative py-8 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-['JetBrains_Mono',monospace]">
          <div className="p-5 rounded-lg border border-cyan-500/20 bg-zinc-950/70">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-2">
              <Lock className="w-4 h-4" />
              <span>100% IN-BROWSER PRIVACY</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif]">
              Audio waveforms and extracted spectral features are processed entirely in client-side volatile memory.
              No citizen voice recordings or raw biometric tokens are transmitted to external servers or third-party cloud APIs.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-emerald-500/20 bg-zinc-950/70">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
              <Eye className="w-4 h-4" />
              <span>HUMAN-IN-THE-LOOP MANDATE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif]">
              The triage engine provides decision-support prioritization, NOT automated legal determinations.
              Human dispatch officers retain full discretionary control to override, confirm, or dismiss any AI distress alert.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-teal-500/20 bg-zinc-950/70">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-2">
              <GitBranch className="w-4 h-4" />
              <span>EXPLAINABLE ACOUSTIC LINEAGE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-['Inter',sans-serif]">
              Every urgency score is fully auditable back to fundamental acoustic features (F0 pitch deviations,
              vocal tract MFCC shifts, jitter tremors), preventing opaque black-box scoring.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: PIPELINE TIMELINE COMPONENT & STAGE LAUNCHPAD */}
      <section className="relative py-8 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto z-10">
        {/* Render the standard connected PipelineTimeline component */}
        <PipelineTimeline
          showHeader={true}
          className="border-cyan-500/25 bg-zinc-950/90 shadow-[0_0_40px_rgba(0,240,255,0.1)]"
        />

        {/* Global Bottom Navigation Links */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-5 rounded-lg border border-zinc-800 bg-zinc-950/80 font-['JetBrains_Mono',monospace] text-xs">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-slate-300 hover:text-white hover:border-cyan-400 transition-all"
            >
              <span>← RETURN TO HOME</span>
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              NEXT UP: <span className="text-cyan-400">STAGE 01 AUDIO INGESTION</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pipeline/audio-ingestion"
              className="flex items-center gap-1.5 px-4 py-2 rounded border border-cyan-400/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-300 font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <span>BEGIN AT STAGE 01 (LAB)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded border border-emerald-400/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-300 font-bold transition-all shadow-[0_0_15px_rgba(0,255,136,0.15)]"
            >
              <RadioTower className="w-3.5 h-3.5 text-emerald-400" />
              <span>OPEN OFFICER TACTICAL HUD</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Padding */}
      <div className="h-16" />
    </main>
  );
}
