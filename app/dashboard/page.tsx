"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowLeft, AudioLines, BellRing, ChevronRight, Clock3, FileAudio, Fingerprint, Headphones, LockKeyhole, Mic2, RadioTower, ShieldAlert, ShieldCheck, Signal, SlidersHorizontal, UserRound, Waves } from "lucide-react";
import AudioSandbox from "@/components/AudioSandbox";
import type { AcousticMetrics } from "@/lib/types";
import { INITIAL_METRICS } from "@/lib/types";

const SceneCanvas = dynamic(() => import("@/components/SceneCanvas"), { ssr: false });

type CallItem = { id: string; kind: string; location: string; age: string; urgency: number; emotion: string; excerpt: string; accent: string; assigned: string };
const initialQueue: CallItem[] = [
  { id: "VF-2048", kind: "FINANCIAL FRAUD VICTIM", location: "NCR / HELPLINE 1930", age: "00:48", urgency: 95, emotion: "DISTRESS", excerpt: "“They are asking me to transfer the remaining balance…”", accent: "#00FF88", assigned: "DESK 04" },
  { id: "VF-2042", kind: "SUSPECTED IMPERSONATION", location: "DELHI / DIGITAL ARREST", age: "01:17", urgency: 78, emotion: "NERVOUSNESS", excerpt: "“I cannot share those account details right now.”", accent: "#00F0FF", assigned: "DESK 02" },
  { id: "VF-2037", kind: "INFORMANT REPORT", location: "FARIDABAD / INBOUND", age: "02:04", urgency: 62, emotion: "FEAR", excerpt: "“I need to tell someone, but I am worried…”", accent: "#3B82F6", assigned: "DESK 01" },
  { id: "VF-2031", kind: "ACCOUNT TAKEOVER", location: "GURUGRAM / INBOUND", age: "02:55", urgency: 48, emotion: "ANGER", excerpt: "“My access was removed without any warning.”", accent: "#78F7D0", assigned: "DESK 03" },
  { id: "VF-2029", kind: "GENERAL ENQUIRY", location: "NOIDA / HELPLINE", age: "03:26", urgency: 29, emotion: "LOW SIGNAL", excerpt: "“I am calling to check the status of a complaint.”", accent: "#64748B", assigned: "DESK 05" }
];

import GlobalNav from "@/components/navigation/GlobalNav";

export default function DashboardPage() {
  const [queue, setQueue] = useState(initialQueue);
  const [selectedId, setSelectedId] = useState("VF-2048");
  const [metrics, setMetrics] = useState<AcousticMetrics>(INITIAL_METRICS);
  const [showAudioTools, setShowAudioTools] = useState(false);
  const [clock, setClock] = useState("LIVE SIMULATION");
  const onMetrics = useCallback((next: AcousticMetrics) => setMetrics(next), []);

  useEffect(() => {
    let tick = 0;
    const interval = window.setInterval(() => {
      tick++;
      setQueue((previous) => previous.map((item, index) => ({
        ...item,
        urgency: Math.max(18, Math.min(98, item.urgency + Math.sin(tick * 0.65 + index * 1.9) * (index === 0 ? 2.1 : 3.3)))
      })).sort((a, b) => b.urgency - a.urgency));
      setClock(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    }, 3200);
    return () => window.clearInterval(interval);
  }, []);

  const selectedCall = useMemo(() => queue.find((item) => item.id === selectedId) ?? queue[0], [queue, selectedId]);
  const currentUrgency = metrics.source === "idle" ? Math.round(selectedCall.urgency) : metrics.urgency;
  const currentEmotions = metrics.source === "idle" ? { fear: 64, anger: 22, distress: 94, nervousness: 79 } : metrics.emotions;

  return (
    <main className="hud-page pt-[86px]">
      <GlobalNav />
      <div className="hud-backdrop" aria-hidden="true"><div className="hud-grid" /><div className="hud-glow" /></div>

      <section className="hud-titlebar">
        <div>
          <div className="section-index green-index">DISPATCH / TRIAGE OPERATIONS</div>
          <h1>VOICE SIGNAL <em>COMMAND.</em></h1>
          <p>Local audio telemetry and illustrative priority queue for human-led cybercrime response.</p>

          {/* Quick Pipeline Showcase Switcher Links */}
          <div className="flex flex-wrap items-center gap-2 mt-3 font-['JetBrains_Mono',monospace] text-[11px]">
            <span className="text-slate-500">PIPELINE INSPECTION:</span>
            <Link href="/pipeline" className="px-2 py-0.5 rounded border border-cyan-400 bg-cyan-950/50 text-cyan-200 hover:border-cyan-300 hover:bg-cyan-900/60 transition-colors font-bold">
              00 {"//"} WORKFLOW OVERVIEW
            </Link>
            <Link href="/pipeline/audio-ingestion" className="px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 transition-colors">
              01 {"//"} INGESTION
            </Link>
            <Link href="/pipeline/feature-extraction" className="px-2 py-0.5 rounded border border-blue-500/30 text-blue-300 hover:border-blue-400 hover:bg-blue-950/40 transition-colors">
              02 {"//"} SPECTRAL FEATURES
            </Link>
            <Link href="/pipeline/emotion-modeling" className="px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-950/40 transition-colors">
              03 {"//"} EMOTION MODELING
            </Link>
            <Link href="/pipeline/priority-triage" className="px-2 py-0.5 rounded border border-teal-500/30 text-teal-300 hover:border-teal-400 hover:bg-teal-950/40 transition-colors">
              04 {"//"} PRIORITY TRIAGE
            </Link>
          </div>
        </div>
        <div className="hud-security"><ShieldCheck size={16} /><span>LOCAL PROCESSING</span><i>·</i><span>HUMAN REVIEW REQUIRED</span></div>
      </section>

      <div className="hud-layout">
        <aside className="hud-panel queue-panel">
          <div className="panel-heading"><div><span className="panel-kicker">INBOUND STREAM / 05</span><h2><RadioTower size={16} /> PRIORITY CALL QUEUE</h2></div><button className="panel-tool" type="button" aria-label="Queue filters"><SlidersHorizontal size={15} /></button></div>
          <div className="queue-legend"><span><i className="legend-dot legend-dot--critical" /> HIGH PRIORITY</span><span><i className="legend-dot" /> STANDARD</span></div>
          <div className="queue-list">
            <AnimatePresence initial={false}>
              {queue.map((item, index) => (
                <motion.button layout key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ layout: { type: "spring", stiffness: 260, damping: 28 }, duration: 0.22 }} className={`queue-item ${selectedId === item.id ? "queue-item--selected" : ""}`} onClick={() => setSelectedId(item.id)} type="button">
                  <span className="queue-item-top"><span className="queue-id"><i style={{ background: item.accent }} />{item.id}</span><span className={`priority-chip ${item.urgency >= 80 ? "priority-chip--high" : ""}`}>{Math.round(item.urgency)}%</span></span>
                  <strong>{item.kind}</strong><small className="queue-location">{item.location}</small>
                  <span className="queue-item-bottom"><span className="queue-emotion">{item.emotion}</span><span><Clock3 size={12} /> {item.age}</span><ChevronRight size={14} /></span>
                  <span className="queue-item-progress"><i style={{ width: `${item.urgency}%`, background: item.accent }} /></span>
                  {index === 0 && <span className="queue-hotline">TOP PRIORITY</span>}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          <div className="queue-footer"><span><Activity size={13} /> SIMULATED PRIORITY UPDATES</span><span>03.2s</span></div>
        </aside>

        <section className="hud-main-column">
          <div className="hud-panel visualizer-panel">
            <div className="panel-heading"><div><span className="panel-kicker">ACOUSTIC VIEW / {selectedCall.id}</span><h2><AudioLines size={16} /> 3D SPECTRAL VISUALIZER</h2></div><span className="live-state"><i /> {metrics.source === "microphone" ? "LIVE MIC" : metrics.source === "upload" ? "FILE INPUT" : "SIMULATED FEED"}</span></div>
            <div className="hud-3d"><SceneCanvas stage={metrics.source === "idle" ? 2 : 4} energy={metrics.level / 100 + 0.08} emotion={currentUrgency / 100} compact /><div className="hud-model-hud hud-model-hud--left"><span>FREQUENCY BAND</span><strong>0—4.2 kHz</strong><i>LOCAL SIGNAL</i></div><div className="hud-model-hud hud-model-hud--right"><span>PRIORITY INDEX</span><strong>{String(currentUrgency).padStart(2, "0")}<small>%</small></strong><i>{metrics.source === "idle" ? "SCENARIO DATA" : "AUDIO ESTIMATE"}</i></div><div className="hud-model-footer"><Waves size={13} /> {metrics.label.toUpperCase().slice(0, 35)}</div></div>
            <div className="waveform-scope" aria-hidden="true"><div className="waveform-label"><span>CH-A / AMPLITUDE</span><span>CH-B / SPECTRAL ACTIVITY</span></div><div className="waveform-bars">{Array.from({ length: 62 }, (_, index) => <i key={index} style={{ height: `${8 + ((index * 29 + Math.floor(metrics.level * 1.7)) % 38)}px`, opacity: 0.35 + ((index * 13) % 60) / 100 }} />)}</div></div>
            <div className="biometric-strip"><div><span>FUNDAMENTAL PITCH*</span><strong>{metrics.pitch || 284}<small>Hz</small></strong></div><div><span>SPECTRAL CENTROID</span><strong>{metrics.spectralCentroid || 1840}<small>Hz</small></strong></div><div><span>JITTER / REACTIVITY*</span><strong>{metrics.tremor || 64}<small>%</small></strong></div><div><span>SPEECH PACE EST.*</span><strong>{metrics.speechRate || 142}<small>WPM*</small></strong></div><div><span>INPUT LEVEL</span><strong>{metrics.level}<small>%</small></strong></div></div>
          </div>
          <div className="hud-panel audio-tools-panel">
            <div className="panel-heading"><div><span className="panel-kicker">INTERACTIVE SANDBOX</span><h2><Mic2 size={16} /> AUDIO INPUT / SIMULATION</h2></div><button className="panel-tool panel-tool--label" type="button" onClick={() => setShowAudioTools((value) => !value)}>{showAudioTools ? "COLLAPSE" : "OPEN CONTROLS"}</button></div>
            {showAudioTools ? <AudioSandbox onMetrics={onMetrics} compact /> : <div className="audio-tool-preview"><span><Headphones size={17} /> Activate browser microphone or test one of three simulated scenarios.</span><button className="button button-primary" onClick={() => setShowAudioTools(true)} type="button">OPEN AUDIO CONTROLS <ChevronRight size={14} /></button></div>}
          </div>
        </section>

        <aside className="hud-right-column">
          <div className="hud-panel transcript-panel">
            <div className="panel-heading"><div><span className="panel-kicker">LIVE REVIEW / TEXT IS SIMULATED</span><h2><FileAudio size={16} /> CALL CONTEXT</h2></div><span className="transcript-live"><span className="status-dot" /> DEMO</span></div>
            <div className="transcript-meta"><span><UserRound size={13} /> {selectedCall.kind}</span><span><Clock3 size={13} /> {selectedCall.age}</span></div>
            <div className="transcript-body"><span className="transcript-time">[00:04.120]</span><p>{selectedCall.excerpt.split(" ").map((word, i) => <span key={`${word}-${i}`} className={/[!…?]|balance|transfer|worried|asking|removed/i.test(word) ? "transcript-highlight" : ""}>{word} </span>)}</p><div className="transcript-note"><Signal size={13} /> Content shown is fictional scenario text; no speech-to-text engine is connected.</div></div>
            <div className="emotion-summary"><div className="summary-top"><span>EMOTION SIGNAL PROXIES</span><span>DEMO READOUT</span></div>{Object.entries(currentEmotions).map(([name, value]) => <div className="summary-meter" key={name}><span>{name.toUpperCase()}</span><div><i style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>)}</div>
          </div>
          <div className="hud-panel recommendation-panel"><div className="panel-heading"><div><span className="panel-kicker">DECISION SUPPORT</span><h2><ShieldAlert size={16} /> HUMAN TRIAGE</h2></div></div><div className="recommendation-priority"><span>INDICATIVE URGENCY</span><strong>{currentUrgency}<small>%</small></strong><i className="priority-arc" /></div><div className="recommendation-text"><span className="recommendation-tag"><BellRing size={12} /> SUGGESTED REVIEW</span><p>{currentUrgency >= 80 ? "Prompt a trained officer to review this call promptly and confirm the reported risk through normal procedures." : currentUrgency >= 55 ? "Queue for timely human review. Context, conversation content, and independent evidence remain essential." : "Continue normal queue handling. Do not infer safety or credibility from a low signal score alone."}</p></div><div className="ethical-badge"><ShieldCheck size={15} /><span><strong>INDICATIVE SIGNAL ONLY</strong><small>Never evidence of guilt, intent, or honesty.</small></span></div></div>
        </aside>
      </div>

      <footer className="hud-footer"><span><Fingerprint size={13} /> AUDIO PROCESSING REMAINS IN THIS BROWSER</span><span><LockKeyhole size={13} /> NO BACKEND · NO DATABASE · NO EXTERNAL STREAMS</span><span>* SPEECH PACE AND EMOTION METRICS ARE DEMO ESTIMATES, NOT VALIDATED MODEL OUTPUT</span></footer>
    </main>
  );
}
