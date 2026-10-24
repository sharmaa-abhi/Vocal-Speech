export type EmotionKey = "fear" | "anger" | "distress" | "nervousness";
export type EmotionScores = Record<EmotionKey, number>;
export type AcousticMetrics = {
  level: number;
  spectralCentroid?: number;
  pitch: number;
  tremor: number;
  speechRate: number;
  urgency: number;
  emotions: EmotionScores;
  source: "idle" | "microphone" | "upload" | "simulation";
  label: string;
};
export const INITIAL_METRICS: AcousticMetrics = {
  level: 0, pitch: 0, tremor: 0, speechRate: 0, urgency: 0,
  emotions: { fear: 22, anger: 18, distress: 25, nervousness: 20 },
  source: "idle", label: "Awaiting audio input"
};
export const EMOTION_LABELS: { key: EmotionKey; title: string; color: string; note: string }[] = [
  { key: "fear", title: "FEAR", color: "#00F0FF", note: "Elevated pitch / instability" },
  { key: "anger", title: "ANGER", color: "#3B82F6", note: "Energy and spectral activity" },
  { key: "distress", title: "DISTRESS", color: "#00FF88", note: "Combined signal reactivity" },
  { key: "nervousness", title: "NERVOUSNESS", color: "#78F7D0", note: "Pitch variation indicator" }
];
export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
