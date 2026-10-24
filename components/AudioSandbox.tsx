"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, AudioLines, FileAudio, Mic, MicOff, ShieldCheck, Square, Upload } from "lucide-react";
import type { AcousticMetrics, EmotionScores } from "@/lib/types";
import { clamp, INITIAL_METRICS } from "@/lib/types";

const PRESETS: { id: string; title: string; urgency: number; label: string; emotions: EmotionScores; pitch: number; tremor: number; pace: number; level: number; centroid: number; hint: string }[] = [
  { id: "victim", title: "DISTRESSED VICTIM", urgency: 95, label: "Critical financial-fraud panic", emotions: { fear: 88, anger: 46, distress: 96, nervousness: 81 }, pitch: 286, tremor: 74, pace: 168, level: 82, centroid: 2260, hint: "High urgency · illustrative scenario" },
  { id: "suspect", title: "SUSPECTED FRAUDSTER", urgency: 78, label: "Elevated vocal nervousness", emotions: { fear: 43, anger: 36, distress: 51, nervousness: 79 }, pitch: 231, tremor: 68, pace: 151, level: 57, centroid: 1910, hint: "Elevated signal · illustrative scenario" },
  { id: "informant", title: "INFORMANT CALL", urgency: 62, label: "Quiet voice · possible fear", emotions: { fear: 64, anger: 14, distress: 48, nervousness: 52 }, pitch: 196, tremor: 57, pace: 112, level: 31, centroid: 1430, hint: "Review required · illustrative scenario" }
];

function estimatePitch(data: Float32Array, sampleRate: number) {
  let rms = 0;
  for (let i = 0; i < data.length; i++) rms += data[i] * data[i];
  rms = Math.sqrt(rms / data.length);
  if (rms < 0.012) return 0;
  let crossings = 0;
  for (let i = 1; i < data.length; i++) if ((data[i - 1] <= 0 && data[i] > 0) || (data[i - 1] >= 0 && data[i] < 0)) crossings++;
  const pitchProxy = (crossings / 2) * (sampleRate / data.length);
  return pitchProxy > 60 && pitchProxy < 500 ? Math.round(pitchProxy) : 0;
}

function metricsFromSignal(level: number, pitch: number, previousPitch: number, zcr: number, centroid: number, label: string): AcousticMetrics {
  const pitchMotion = previousPitch > 0 && pitch > 0 ? Math.abs(pitch - previousPitch) / Math.max(previousPitch, 1) : zcr * 1.4;
  const energy = clamp(level * 100);
  const tremor = clamp(pitchMotion * 46 + zcr * 35);
  // These are transparent signal-reactivity heuristics for demonstration, not a trained SER model.
  const fear = clamp(12 + tremor * 0.52 + (pitch > 230 ? 12 : 2) + energy * 0.12);
  const anger = clamp(8 + energy * 0.44 + (pitch > 260 ? 13 : 0));
  const distress = clamp(10 + energy * 0.30 + tremor * 0.38 + (pitch > 210 ? 8 : 0));
  const nervousness = clamp(10 + tremor * 0.62 + (pitchMotion > 0.25 ? 10 : 0));
  const urgency = clamp(distress * 0.42 + fear * 0.28 + anger * 0.12 + nervousness * 0.18);
  return {
    level: Math.round(energy), spectralCentroid: centroid, pitch, tremor: Math.round(tremor), speechRate: Math.round(clamp(88 + zcr * 1150 + energy * 0.42, 70, 220)),
    urgency: Math.round(urgency), emotions: { fear: Math.round(fear), anger: Math.round(anger), distress: Math.round(distress), nervousness: Math.round(nervousness) },
    source: "microphone", label
  };
}

type AudioSandboxProps = {
  onMetrics: (metrics: AcousticMetrics) => void;
  compact?: boolean;
};

export default function AudioSandbox({ onMetrics, compact = false }: AudioSandboxProps) {
  const [micActive, setMicActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("AUDIO SOURCE OFFLINE");
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<AudioNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const pitchRef = useRef(0);
  const tickRef = useRef(0);
  const lastMetricsRef = useRef<AcousticMetrics>(INITIAL_METRICS);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { fileSourceRef.current?.stop(); } catch { /* already stopped */ }
    fileSourceRef.current = null;
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") void audioContextRef.current.close();
    audioContextRef.current = null;
    setMicActive(false);
    setStatus("AUDIO SOURCE OFFLINE");
  }, []);

  useEffect(() => () => stop(), [stop]);

  const startMonitor = useCallback((context: AudioContext, analyser: AnalyserNode, sourceLabel: "microphone" | "upload") => {
    const timeData = new Float32Array(analyser.fftSize);
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    let previousLevel = 0;
    const loop = () => {
      analyser.getFloatTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);
      let energy = 0;
      let crossings = 0;
      for (let i = 0; i < timeData.length; i++) {
        energy += timeData[i] * timeData[i];
        if (i > 0 && ((timeData[i - 1] <= 0 && timeData[i] > 0) || (timeData[i - 1] >= 0 && timeData[i] < 0))) crossings++;
      }
      const rms = Math.sqrt(energy / timeData.length);
      const normalized = clamp(rms * 255, 0, 100) / 100;
      const zcr = crossings / timeData.length;
      let weightedFrequency = 0;
      let magnitudeTotal = 0;
      for (let bin = 0; bin < freqData.length; bin++) {
        const magnitude = freqData[bin] / 255;
        weightedFrequency += (bin * context.sampleRate / analyser.fftSize) * magnitude;
        magnitudeTotal += magnitude;
      }
      const spectralCentroid = magnitudeTotal > 0 ? Math.round(weightedFrequency / magnitudeTotal) : 0;
      tickRef.current++;
      let pitch = pitchRef.current;
      if (tickRef.current % 5 === 0) {
        pitch = estimatePitch(timeData, context.sampleRate);
        pitchRef.current = pitch;
      }
      // Publish at ~12 Hz; the WebGL scene itself continues rendering independently.
      if (tickRef.current % 5 === 0) {
        const next = metricsFromSignal(normalized, pitch, lastMetricsRef.current.pitch, zcr, spectralCentroid, sourceLabel === "microphone" ? "Live microphone · heuristic signal view" : "Local audio file · heuristic signal view");
        next.source = sourceLabel;
        // Avoid displaying pitch/urgency spikes while no meaningful audio is present.
        if (normalized < 0.025) {
          next.urgency = Math.round(lastMetricsRef.current.urgency * 0.88);
          next.emotions = {
            fear: Math.round(lastMetricsRef.current.emotions.fear * 0.91),
            anger: Math.round(lastMetricsRef.current.emotions.anger * 0.91),
            distress: Math.round(lastMetricsRef.current.emotions.distress * 0.91),
            nervousness: Math.round(lastMetricsRef.current.emotions.nervousness * 0.91)
          };
        }
        next.level = Math.round(normalized * 100);
        if (Math.abs(next.level - previousLevel) > 1 || tickRef.current % 10 === 0) onMetrics(next);
        lastMetricsRef.current = next;
        previousLevel = next.level;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
  }, [onMetrics]);

  const activateMic = useCallback(async () => {
    setError(""); setActivePreset("");
    if (micActive) { stop(); onMetrics({ ...INITIAL_METRICS, label: "Audio source stopped" }); return; }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is unavailable. Use HTTPS or localhost in a supported browser."); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const context = new AudioContext();
      await context.resume();
      const analyser = context.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.72;
      const source = context.createMediaStreamSource(stream); source.connect(analyser);
      streamRef.current = stream; audioContextRef.current = context; analyserRef.current = analyser; sourceRef.current = source;
      pitchRef.current = 0; tickRef.current = 0;
      setMicActive(true); setStatus("MICROPHONE LIVE · LOCAL PROCESSING");
      startMonitor(context, analyser, "microphone");
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      setError(name === "NotAllowedError" ? "Microphone permission denied. Allow access in your browser's site settings." : "Could not start microphone. Check that a microphone is connected and try again.");
    }
  }, [micActive, onMetrics, startMonitor, stop]);

  const loadAudio = useCallback(async (file?: File) => {
    if (!file) return;
    setError(""); setActivePreset("");
    if (!/\.(wav|mp3)$/i.test(file.name) && !file.type.includes("audio")) {
      setError("Choose a WAV or MP3 audio file."); return;
    }
    try {
      stop();
      const context = new AudioContext(); await context.resume();
      const bytes = await file.arrayBuffer();
      const buffer = await context.decodeAudioData(bytes);
      const analyser = context.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.76;
      const source = context.createBufferSource(); source.buffer = buffer; source.connect(analyser); analyser.connect(context.destination);
      audioContextRef.current = context; analyserRef.current = analyser; sourceRef.current = source; fileSourceRef.current = source;
      setFileName(file.name); setStatus("LOCAL FILE PLAYING · NO UPLOAD");
      source.onended = () => {
        if (audioContextRef.current !== context || sourceRef.current !== source) return;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        sourceRef.current = null;
        fileSourceRef.current = null;
        analyserRef.current = null;
        audioContextRef.current = null;
        setStatus("LOCAL FILE ANALYSIS COMPLETE");
        void context.close();
      };
      source.start(0); startMonitor(context, analyser, "upload");
    } catch {
      setError("This audio file could not be decoded by the browser. Try a standard WAV or MP3 file.");
    }
  }, [startMonitor, stop]);

  const simulate = (preset: typeof PRESETS[number]) => {
    stop(); setError(""); setActivePreset(preset.id); setFileName(""); setStatus("SIMULATED SCENARIO · NO REAL CALL AUDIO");
    const result: AcousticMetrics = {
      level: preset.level, spectralCentroid: preset.centroid, pitch: preset.pitch, tremor: preset.tremor, speechRate: preset.pace, urgency: preset.urgency,
      emotions: preset.emotions, source: "simulation", label: `${preset.title} · ${preset.label}`
    };
    lastMetricsRef.current = result;
    onMetrics(result);
  };

  return (
    <div className={`audio-sandbox ${compact ? "audio-sandbox--compact" : ""}`}>
      <div className="sandbox-status"><span className={`status-dot ${micActive ? "status-dot--live" : ""}`} />{status}<span className="sandbox-local"><ShieldCheck size={13} /> 100% BROWSER-LOCAL</span></div>
      <div className="sandbox-actions">
        <button className={`button button-primary ${micActive ? "button-recording" : ""}`} onClick={activateMic} type="button">
          {micActive ? <><MicOff size={16} /> STOP MICROPHONE</> : <><Mic size={16} /> ACTIVATE LIVE BROWSER MIC</>}
        </button>
        <label className="button button-ghost upload-button">
          <Upload size={15} /> UPLOAD WAV / MP3
          <input type="file" accept="audio/wav,audio/mpeg,.wav,.mp3" onChange={(e) => { void loadAudio(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
        </label>
        {micActive && <button className="icon-button" aria-label="Stop audio" onClick={stop} type="button"><Square size={15} /></button>}
      </div>
      {fileName && <p className="file-loaded"><FileAudio size={14} /> {fileName}</p>}
      <div className="preset-label"><Activity size={13} /> INSTANT SCENARIOS <span>— simulated data</span></div>
      <div className="preset-list">
        {PRESETS.map((preset, index) => (
          <button className={`preset-button ${activePreset === preset.id ? "preset-button--active" : ""}`} key={preset.id} onClick={() => simulate(preset)} type="button">
            <span className="preset-index">0{index + 1}</span>
            <span className="preset-copy"><strong>{preset.title}</strong><small>{preset.hint}</small></span>
            <span className="preset-score">{preset.urgency}%</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="audio-error">{error}</p>}
      <p className="audio-footnote"><AudioLines size={13} /> Acoustic readings are browser-side estimates. Emotion gauges are illustrative heuristics, not validated emotion recognition or forensic evidence.</p>
    </div>
  );
}
