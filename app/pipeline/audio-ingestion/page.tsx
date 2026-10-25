"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Upload,
  Play,
  Square,
  ShieldCheck,
  Activity,
  Sliders,
  Volume2,
  FileAudio,
  AlertCircle,
  ArrowRight,
  Info,
  Radio,
  Sparkles,
  Layers,
  Cpu
} from "lucide-react";
import GlobalNav from "@/components/navigation/GlobalNav";
import PipelineTimeline from "@/components/navigation/PipelineTimeline";
import StageSwitcher from "@/components/navigation/StageSwitcher";
import { clamp, INITIAL_METRICS, type AcousticMetrics } from "@/lib/types";

// Dynamically load the unique 3D Ingestion Sphere scene
const IngestionSphereScene = dynamic(
  () => import("@/components/scenes/IngestionSphereScene"),
  { ssr: false }
);

const DEMO_PRESETS = [
  {
    id: "distress-victim",
    title: "DISTRESSED CITIZEN",
    type: "Urgent Panic Call",
    freq: "High Peak Energy",
    rate: "48,000 Hz",
    energy: 0.85,
    note: "Simulated senior citizen fraud report with sudden vocal amplitude spikes."
  },
  {
    id: "coerced-caller",
    title: "COERCED CALLER",
    type: "Digital Arrest Coercion",
    freq: "Tensed Monotone",
    rate: "44,100 Hz",
    energy: 0.62,
    note: "Simulated constrained vocal tract with suppressed pitch variability."
  },
  {
    id: "informant-tip",
    title: "CONFIDENTIAL INFORMANT",
    type: "Subdued Whisper",
    freq: "Low-amplitude Band",
    rate: "48,000 Hz",
    energy: 0.38,
    note: "Simulated low signal-to-noise ratio requiring vocal bandpass isolation."
  }
];

export default function AudioIngestionPage() {
  const [micActive, setMicActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState("AWAITING AUDIO INPUT");
  const [error, setError] = useState<string | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(0.25);
  const [sampleRate, setSampleRate] = useState<number>(48000);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("00:00");
  const [channelCount, setChannelCount] = useState<number>(1);
  const [peakDb, setPeakDb] = useState<number>(-42);

  // Audio nodes and refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<AudioNode | null>(null);
  const fileBufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop all active audio streams and timers
  const stopAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    try {
      fileBufferSourceRef.current?.stop();
    } catch {
      /* ignore */
    }
    fileBufferSourceRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    sourceRef.current?.disconnect();
    sourceRef.current = null;

    analyserRef.current?.disconnect();
    analyserRef.current = null;

    biquadFilterRef.current?.disconnect();
    biquadFilterRef.current = null;

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }
    audioContextRef.current = null;

    setMicActive(false);
    setIsPlaying(false);
    setStatus("AUDIO SOURCE OFFLINE");
    setEnergyLevel(0.15);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  // Real-time animation loop for waveform rendering and energy tracking
  const startAnalyzerLoop = useCallback((analyser: AnalyserNode) => {
    const timeData = new Float32Array(analyser.fftSize);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const render = () => {
      analyser.getFloatTimeDomainData(timeData);

      // Calculate RMS energy
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < timeData.length; i++) {
        const val = timeData[i];
        sum += val * val;
        if (Math.abs(val) > peak) peak = Math.abs(val);
      }
      const rms = Math.sqrt(sum / timeData.length);
      const computedEnergy = clamp(rms * 4.5, 0.08, 1.0);
      setEnergyLevel(computedEnergy);

      // Peak dBFS
      const db = peak > 0 ? Math.max(-60, Math.round(20 * Math.log10(peak))) : -60;
      setPeakDb(db);

      // Draw Waveform to canvas
      if (ctx && canvas) {
        ctx.fillStyle = "#020408";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1.8;
        ctx.strokeStyle = isFiltered ? "#00FF88" : "#00F0FF";
        ctx.shadowBlur = 8;
        ctx.shadowColor = isFiltered ? "#00FF88" : "#00F0FF";

        ctx.beginPath();
        const sliceWidth = canvas.width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i];
          const y = (canvas.height / 2) + v * (canvas.height * 0.42);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    render();
  }, [isFiltered]);

  // Activate Live Browser Microphone
  const startMicrophone = async () => {
    stopAudio();
    setError(null);
    setActivePreset(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia is not supported by your current browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;

      const source = ctx.createMediaStreamSource(stream);

      // Setup Vocal Bandpass Filter (300Hz - 3400Hz)
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1850;
      filter.Q.value = 1.0;

      if (isFiltered) {
        source.connect(filter);
        filter.connect(analyser);
      } else {
        source.connect(analyser);
      }

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      biquadFilterRef.current = filter;
      streamRef.current = stream;
      sourceRef.current = source;

      setSampleRate(ctx.sampleRate);
      setChannelCount(1);
      setMicActive(true);
      setIsPlaying(true);
      setStatus("LIVE MICROPHONE STREAMING");
      startAnalyzerLoop(analyser);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Microphone permission was denied or unavailable.";
      setError(`Audio Capture Failed: ${message}`);
      setStatus("PERMISSION REJECTED / UNAVAILABLE");
    }
  };

  // Upload and decode local WAV/MP3 file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    stopAudio();
    setError(null);
    setActivePreset(null);
    setFileName(file.name);
    setStatus("DECODING LOCAL AUDIO FILE...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;

      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = decodedBuffer;
      bufferSource.loop = true;

      // Bandpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1850;
      filter.Q.value = 1.0;

      if (isFiltered) {
        bufferSource.connect(filter);
        filter.connect(analyser);
      } else {
        bufferSource.connect(analyser);
      }

      analyser.connect(ctx.destination); // Play locally
      bufferSource.start(0);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      biquadFilterRef.current = filter;
      fileBufferSourceRef.current = bufferSource;

      setSampleRate(decodedBuffer.sampleRate);
      setChannelCount(decodedBuffer.numberOfChannels);
      const minutes = Math.floor(decodedBuffer.duration / 60);
      const seconds = Math.floor(decodedBuffer.duration % 60);
      setDuration(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      setIsPlaying(true);
      setStatus(`PLAYING LOCAL FILE: ${file.name.slice(0, 24)}`);
      startAnalyzerLoop(analyser);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to decode local audio stream.";
      setError(`File Decoding Failed: ${message}`);
      setStatus("DECODE ERROR");
    }
  };

  // Toggle Vocal Bandpass Filter
  const toggleFilter = () => {
    const nextState = !isFiltered;
    setIsFiltered(nextState);

    if (sourceRef.current && analyserRef.current && biquadFilterRef.current) {
      try {
        sourceRef.current.disconnect();
        biquadFilterRef.current.disconnect();

        if (nextState) {
          sourceRef.current.connect(biquadFilterRef.current);
          biquadFilterRef.current.connect(analyserRef.current);
        } else {
          sourceRef.current.connect(analyserRef.current);
        }
      } catch {
        /* ignore reconnect errors */
      }
    }
  };

  // Play demonstration scenario simulation
  const playPreset = (preset: typeof DEMO_PRESETS[0]) => {
    stopAudio();
    setActivePreset(preset.id);
    setFileName(`SIMULATED: ${preset.title}`);
    setStatus(`SIMULATED STREAM: ${preset.title}`);
    setSampleRate(preset.id === "coerced-caller" ? 44100 : 48000);
    setChannelCount(1);
    setDuration("02:45");
    setEnergyLevel(preset.energy);
    setIsPlaying(true);

    // Animate synthetic waveform on canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let step = 0;

    const renderSynth = () => {
      step++;
      const currentEnergy = preset.energy + Math.sin(step * 0.08) * 0.12;
      setEnergyLevel(clamp(currentEnergy, 0.1, 1));
      setPeakDb(Math.round(-18 + currentEnergy * 14));

      if (ctx && canvas) {
        ctx.fillStyle = "#020408";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = isFiltered ? "#00FF88" : "#00F0FF";
        ctx.shadowBlur = 8;
        ctx.shadowColor = isFiltered ? "#00FF88" : "#00F0FF";

        ctx.beginPath();
        const points = 128;
        const sliceWidth = canvas.width / points;

        for (let i = 0; i < points; i++) {
          const u = i / points;
          const noise = isFiltered ? 0 : Math.sin(u * 50 + step * 0.3) * 0.15;
          const wave =
            Math.sin(u * 14 + step * 0.15) * 0.35 +
            Math.sin(u * 28 + step * 0.25) * 0.18 +
            noise;
          const y = canvas.height / 2 + wave * (canvas.height * 0.4) * currentEnergy;

          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * sliceWidth, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(renderSynth);
    };

    renderSynth();
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      <GlobalNav />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-28 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Stage Header */}
        <section className="mb-10">
          <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-cyan-400 tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>STAGE 01 {"//"} AUDIO INGESTION & FILTERING</span>
          </div>

          <h1 className="font-['Orbitron',sans-serif] text-2xl sm:text-4xl md:text-5xl font-black tracking-wide text-white mb-4">
            EVERY SIGNAL BEGINS <span className="text-cyan-400">WITH A VOICE.</span>
          </h1>

          <p className="font-['Inter',sans-serif] text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Capture, decode, inspect, and prepare live or recorded audio for downstream acoustic analysis—all inside the browser. High-fidelity time-domain inspection ensures clean feature extraction without leaking sensitive audio to external clouds.
          </p>
        </section>

        {/* 3D Scene + Real-Time Telemetry Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-12">
          {/* 3D Visualizer Container (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border border-cyan-500/25 bg-zinc-950/80 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.12)]">
            <div className="px-5 py-3 border-b border-cyan-500/20 bg-black/60 flex items-center justify-between font-['JetBrains_Mono',monospace] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-semibold">REACTIVE ACOUSTIC PARTICLE SPHERE</span>
              </div>
              <span className="text-slate-400">
                {isFiltered ? "BANDPASS ISOLATION [ACTIVE]" : "RAW SPECTRAL FLUID"}
              </span>
            </div>

            {/* 3D Canvas Scene */}
            <div className="relative w-full h-[380px] sm:h-[440px] bg-black">
              <IngestionSphereScene
                energy={energyLevel}
                isFiltered={isFiltered}
              />

              {/* Overlaid 3D telemetry tags */}
              <div className="absolute top-4 left-4 pointer-events-none font-['JetBrains_Mono',monospace] text-[11px] text-cyan-300/80 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-cyan-500/20">
                STATUS: {status}
              </div>

              <div className="absolute bottom-4 right-4 pointer-events-none font-['JetBrains_Mono',monospace] text-[11px] text-emerald-400/80 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-500/20">
                ENERGY REACTIVITY: {Math.round(energyLevel * 100)}%
              </div>
            </div>

            {/* Live Waveform Canvas */}
            <div className="p-4 border-t border-cyan-500/20 bg-zinc-950">
              <div className="flex items-center justify-between text-xs font-['JetBrains_Mono',monospace] text-slate-400 mb-2">
                <span>TIME-DOMAIN PCM OSCILLOSCOPE</span>
                <span className="text-cyan-400">PEAK: {peakDb} dBFS</span>
              </div>
              <canvas
                ref={canvasRef}
                width={700}
                height={75}
                className="w-full h-[75px] bg-black rounded border border-zinc-800"
              />
            </div>
          </div>

          {/* Interactive Audio Ingestion Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5 border border-zinc-800 bg-zinc-950/70 rounded-xl p-5 sm:p-6 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-['JetBrains_Mono',monospace] text-xs">
                <span className="text-cyan-400 font-semibold">// INGESTION WORKBENCH</span>
                <span className="text-slate-400">{sampleRate.toLocaleString()} HZ</span>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="my-4 p-3 rounded bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200 font-['JetBrains_Mono',monospace]">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Primary Ingestion Action Buttons */}
              <div className="grid grid-cols-2 gap-3 my-5 font-['JetBrains_Mono',monospace] text-xs">
                {micActive ? (
                  <button
                    onClick={stopAudio}
                    className="flex items-center justify-center gap-2 p-3 rounded border border-red-500/60 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-all font-semibold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    <MicOff className="w-4 h-4 text-red-400" />
                    <span>STOP MIC</span>
                  </button>
                ) : (
                  <button
                    onClick={startMicrophone}
                    className="flex items-center justify-center gap-2 p-3 rounded border border-cyan-400/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition-all font-semibold shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span>LIVE MIC</span>
                  </button>
                )}

                {/* Local File Upload Label */}
                <label className="flex items-center justify-center gap-2 p-3 rounded border border-zinc-700 bg-zinc-900/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 cursor-pointer transition-all font-semibold">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">UPLOAD WAV/MP3</span>
                  <input
                    type="file"
                    accept="audio/wav,audio/mp3,audio/mpeg,audio/ogg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* DSP Bandpass Filter Switch */}
              <div className="p-3.5 rounded border border-cyan-500/20 bg-zinc-900/60 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono',monospace]">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">SPEECH BANDPASS FILTER</span>
                  </div>
                  <button
                    onClick={toggleFilter}
                    className={`px-2.5 py-1 rounded text-[11px] font-['JetBrains_Mono',monospace] font-bold border transition-all ${
                      isFiltered
                        ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_#00FF88]"
                        : "bg-zinc-800 text-slate-400 border-zinc-700 hover:text-white"
                    }`}
                  >
                    {isFiltered ? "ENABLED (300Hz-3.4kHz)" : "BYPASSED (RAW)"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                  Attenuates low-frequency rumbles (&lt;300 Hz) and high-frequency background hiss (&gt;3400 Hz) to isolate vocal formants.
                </p>
              </div>

              {/* Simulated Scenario Presets */}
              <div className="space-y-2 mb-4">
                <span className="font-['JetBrains_Mono',monospace] text-[11px] text-slate-400 uppercase tracking-wider block">
                  OR TEST FICTIONAL SCENARIO PRESETS:
                </span>
                <div className="space-y-1.5">
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => playPreset(preset)}
                      className={`w-full text-left p-2.5 rounded border transition-all text-xs flex items-center justify-between ${
                        activePreset === preset.id
                          ? "border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                          : "border-zinc-800 bg-zinc-900/40 text-slate-300 hover:border-zinc-700 hover:bg-zinc-900/80"
                      }`}
                    >
                      <div>
                        <strong className="font-['Orbitron',sans-serif] text-[12px] block text-white">
                          {preset.title}
                        </strong>
                        <span className="text-[10px] font-['JetBrains_Mono',monospace] text-slate-400">
                          {preset.type} · {preset.rate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-['JetBrains_Mono',monospace] text-cyan-400">
                        <Play className="w-3.5 h-3.5" />
                        <span>TEST</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Stream Telemetry Readout */}
            <div className="pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 font-['JetBrains_Mono',monospace] text-[11px] text-center">
              <div className="p-2 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="text-slate-500 block text-[9px]">SAMPLE RATE</span>
                <strong className="text-cyan-300 font-semibold">{sampleRate} Hz</strong>
              </div>
              <div className="p-2 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="text-slate-500 block text-[9px]">CHANNELS</span>
                <strong className="text-emerald-300 font-semibold">{channelCount} {channelCount === 1 ? "MONO" : "STEREO"}</strong>
              </div>
              <div className="p-2 rounded bg-zinc-900/70 border border-zinc-800">
                <span className="text-slate-500 block text-[9px]">DURATION</span>
                <strong className="text-white font-semibold">{duration}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Explanatory Technical Areas */}
        <section className="my-14">
          <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-cyan-400 tracking-widest uppercase mb-2">
            <span>// ARCHITECTURAL SPECIFICATIONS</span>
          </div>
          <h2 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white mb-6">
            CORE INGESTION <span className="text-cyan-400">PRINCIPLES</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950/70">
              <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 mb-3 font-['JetBrains_Mono',monospace] text-xs font-bold">
                01
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white mb-2">
                Live Browser Ingestion
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                Uses Web Audio API and <code className="text-cyan-300 font-['JetBrains_Mono',monospace]">MediaDevices.getUserMedia</code> with disabled hardware auto-gain to capture natural acoustic dynamics and raw vocal stress cues without browser coloration.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950/70">
              <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 mb-3 font-['JetBrains_Mono',monospace] text-xs font-bold">
                02
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white mb-2">
                PCM Decoding
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                Locally decodes raw byte containers into 32-bit floating-point pulse-code modulation (PCM) linear buffers at standard 44.1 kHz or 48.0 kHz sampling rates directly inside RAM.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950/70">
              <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 mb-3 font-['JetBrains_Mono',monospace] text-xs font-bold">
                03
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white mb-2">
                Vocal Bandpass Isolation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                A 2nd-order Biquad Butterworth bandpass filter centered at 1.85 kHz constrains spectral analysis to standard forensic telephone bands (300 Hz – 3400 Hz), rejecting environmental hum.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950/70">
              <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 mb-3 font-['JetBrains_Mono',monospace] text-xs font-bold">
                04
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white mb-2">
                Zero Cloud Leakage
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                All buffer allocations, Fast Fourier Transforms, and filtering pipelines reside solely in the client execution thread. No voice snippets or identity hashes leave the investigator’s terminal.
              </p>
            </div>
          </div>
        </section>

        {/* Pipeline Stage Progression Explorer */}
        <PipelineTimeline currentStage={1} />

        {/* Stage 01 CTA to Stage 02 */}
        <div className="mt-10 p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-zinc-950 to-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-['JetBrains_Mono',monospace] text-xs text-cyan-400 tracking-wider">
              READY FOR DOWNSTREAM SPECTRAL EXTRACTION?
            </span>
            <h3 className="font-['Orbitron',sans-serif] text-lg sm:text-xl font-bold text-white mt-1">
              Decompose Clean Audio Into Mel Frequency Cepstral Coefficients
            </h3>
          </div>
          <Link
            href="/pipeline/feature-extraction"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded border border-cyan-400 bg-cyan-500 text-black font-['JetBrains_Mono',monospace] text-xs font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
          >
            <span>EXPLORE SPECTRAL FEATURES</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Floating Stage Switcher */}
      <StageSwitcher currentStage={1} />
    </div>
  );
}
