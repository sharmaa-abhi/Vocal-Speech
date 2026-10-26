"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowDown, ArrowRight, Cpu, Fingerprint, LockKeyhole, Radio, ScanLine, ShieldCheck, Waves } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import AudioSandbox from "@/components/AudioSandbox";
import CalloutLines from "@/components/CalloutLines";
import GlobalNav from "@/components/navigation/GlobalNav";

const SceneCanvas = dynamic(() => import("@/components/SceneCanvas"), { ssr: false });
import { clamp, EMOTION_LABELS, INITIAL_METRICS, type AcousticMetrics, type EmotionKey } from "@/lib/types";

const emotionReadouts: Record<EmotionKey, { value: number; pitch: number; tremor: number; urgency: number; copy: string }> = {
  fear: { value: 88, pitch: 284, tremor: 72, urgency: 87, copy: "Elevated vocal instability" },
  anger: { value: 42, pitch: 246, tremor: 39, urgency: 58, copy: "Energy and spectral activity" },
  distress: { value: 94, pitch: 306, tremor: 81, urgency: 95, copy: "Combined stress-signal proxy" },
  nervousness: { value: 79, pitch: 268, tremor: 68, urgency: 78, copy: "Pitch variation indicator" }
};

function useStoryTimeline() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      let lastSync = 0;
      ScrollTrigger.create({
        trigger: "#story-track", start: "top top", end: "bottom bottom", scrub: 1,
        onUpdate: (self) => {
          const now = performance.now();
          if (now - lastSync > 28 || self.progress === 0 || self.progress === 1) {
            lastSync = now;
            setStage(Math.min(4, Math.max(0, self.progress * 5)));
          }
        }
      });
      gsap.utils.toArray<HTMLElement>(".cipher-word").forEach((element) => {
        const original = element.textContent ?? "";
        const chars = "01#$%&*ZXCVBN<>/\\";
        const scramble = () => {
          const progress = { value: 0 };
          gsap.to(progress, {
            value: 1, duration: 0.82, ease: "power2.out",
            onUpdate: () => {
              const fixed = Math.floor(progress.value * original.length);
              element.textContent = Array.from(original).map((char, index) => {
                if (char === " " || index < fixed) return char;
                return chars[Math.floor(Math.random() * chars.length)];
              }).join("");
            }, onComplete: () => { element.textContent = original; }
          });
        };
        ScrollTrigger.create({ trigger: element.closest("section") ?? element, start: "top 70%", once: true, onEnter: scramble });
      });
      gsap.utils.toArray<HTMLElement>(".section-index").forEach((el) => {
        gsap.fromTo(el, { opacity: 0.25, x: -12 }, { opacity: 1, x: 0, duration: 0.5, scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });
      });
    }, document.getElementById("story-track") ?? undefined);
    return () => ctx.revert();
  }, []);
  return stage;
}

function EmotionMeter({ label, value, active, color }: { label: string; value: number; active: boolean; color: string }) {
  return <div className={`emotion-meter ${active ? "emotion-meter--active" : ""}`}>
    <div className="meter-label"><span>{label}</span><strong>{value}%</strong></div>
    <div className="meter-track"><motion.span animate={{ width: `${value}%` }} transition={{ duration: 0.45, ease: "easeOut" }} style={{ background: `linear-gradient(90deg, #00F0FF, ${color})`, boxShadow: active ? `0 0 14px ${color}80` : "none" }} /></div>
  </div>;
}


export default function HomeExperience() {
  const stage = useStoryTimeline();
  const [emotion, setEmotion] = useState<EmotionKey>("distress");
  const [metrics, setMetrics] = useState<AcousticMetrics>(INITIAL_METRICS);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const lastPointerUpdate = useRef(0);
  const handlePointerMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const now = performance.now();
    if (now - lastPointerUpdate.current < 32) return;
    lastPointerUpdate.current = now;
    setPointer({ x: (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2, y: (0.5 - event.clientY / Math.max(window.innerHeight, 1)) * 2 });
  }, []);
  const currentEmotion = emotionReadouts[emotion];
  const onMetrics = useCallback((next: AcousticMetrics) => setMetrics(next), []);
  const visualEnergy = metrics.level / 100 * 0.8 + (metrics.source === "simulation" ? 0.14 : 0);
  const activeEmotionIntensity = (metrics.source === "idle" ? currentEmotion.value : metrics.emotions[emotion]) / 100;
  const activeScores = metrics.source !== "idle" ? metrics.emotions : Object.fromEntries(EMOTION_LABELS.map((e) => [e.key, emotionReadouts[e.key].value])) as AcousticMetrics["emotions"];
  const auraStyle = { "--aura-alpha": `${(0.10 + clamp(metrics.urgency) / 100 * 0.10).toFixed(3)}` } as React.CSSProperties;
  const activateSandbox = () => document.getElementById("sandbox")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const emotionNodes = useMemo(() => EMOTION_LABELS.map((item) => ({ ...item, score: emotionReadouts[item.key].value })), []);

  return (
    <main className="experience" style={auraStyle} onMouseMove={handlePointerMove}>
      <div className="ambient-glow" aria-hidden="true" />
      <div className="cyber-grid" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="edge-vignette" aria-hidden="true" />
      <SceneCanvas stage={stage} energy={visualEnergy} emotion={activeEmotionIntensity} pointerX={pointer.x} pointerY={pointer.y} />

      <GlobalNav />

      <div className="story-progress" aria-hidden="true"><span style={{ height: `${Math.min(100, (stage / 4) * 100)}%` }} /></div>
      <div className="scene-counter"><span>SCENE</span><strong>0{Math.min(5, Math.floor(stage) + 1)}</strong><i>/ 05</i></div>

      <div id="story-track" className="story-track">
        <section className="story-section hero-section" id="mission" aria-labelledby="hero-title">
          <div className="hero-copy">
            <motion.div className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}><span className="pulse-dot" /> NATIONAL CYBERSECURITY VOCAL FORENSICS <span className="eyebrow-divider">{"//"}</span> REAL-TIME SER ENGINE</motion.div>
            <h1 id="hero-title" className="hero-title">
              <span className="title-white cipher-word">Real-Time Speech</span>
              <span className="title-blue cipher-word">EMOTION ANALYSIS</span>
              <span className="title-white title-sm cipher-word">FOR CYBERCRIME INVESTIGATION</span>
            </h1>
            <p className="hero-subtitle">When milliseconds matter, <span>listen beyond words.</span> Analyze live or recorded voice signals to help officers identify potential distress and prioritize critical cybercrime calls.</p>
            <div className="hero-actions">
              <Link className="text-action" href="/pipeline">EXPLORE 4-STAGE PIPELINE WORKFLOW <ArrowRight size={17} /></Link>
              <button className="quiet-link" onClick={activateSandbox} type="button">LIVE VOICE SANDBOX <ArrowDown size={14} /></button>
            </div>
            <div className="hero-footline"><span><Waves size={15} /> ACOUSTIC SIGNALS, NOT JUST WORDS</span><span className="green-text">● PRIVACY-FIRST · LOCAL PROCESSING</span></div>
          </div>
          <div className="hero-side-telemetry" aria-hidden="true"><span>NEURAL SIGNAL / 001</span><strong>48.7 <small>kHz*</small></strong><i>3D ACOUSTIC FIELD</i><div className="telemetry-bars">{Array.from({ length: 22 }, (_, i) => <b key={i} style={{ height: `${8 + ((i * 19 + 7) % 38)}px`, animationDelay: `${i * -0.08}s` }} />)}</div><small>* VISUAL REFERENCE ONLY</small></div>
          <a href="#problem" className="scroll-cue"><span className="scroll-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span><span>SCROLL TO INITIALIZE PIPELINE</span><ArrowDown size={14} /></a>
          <span className="crosshair crosshair--hero" aria-hidden="true">+</span>
        </section>

        <section className="story-section problem-section" id="problem" aria-labelledby="problem-title">
          <CalloutLines />
          <div className="section-copy section-copy--left">
            <div className="section-index">01 <span>{"//"}</span> THE PROBLEM STATEMENT</div>
            <h2 id="problem-title"><span className="cipher-word">WHEN EVERY CALL</span><br /><em className="cipher-word">CARRIES A SIGNAL.</em></h2>
            <p>Cybercrime response teams may hear from <strong>distressed victims, suspected fraudsters, and informants</strong> under intense pressure. While officers juggle multiple cases, subtle changes in vocal energy, pitch, and stability can be difficult to assess consistently.</p>
            <p className="muted-paragraph">The challenge is not to judge a caller. It is to surface signals that may deserve a closer, faster human review.</p>
            <div className="problem-tags"><span><i /> CALL OVERLOAD</span><span><i /> HIDDEN DISTRESS</span><span><i /> TIME-SENSITIVE TRIAGE</span></div>
          </div>
          <div className="floating-caption floating-caption--right"><span>INCOMING SIGNALS</span><strong>UNFILTERED / OVERLAPPING</strong><i className="caption-line" /></div>
          <div className="section-coord">FIELD 01 / SIGNAL CONFLICT <span>+ 18.493 N</span></div>
        </section>

        <section className="story-section solution-section" id="pipeline" aria-labelledby="pipeline-title">
          <CalloutLines variant="reverse" />
          <div className="section-copy section-copy--right">
            <div className="section-index green-index">02 <span>{"//"}</span> THE 4-STAGE SER PIPELINE</div>
            <h2 id="pipeline-title"><span className="cipher-word">WE FORMAT THE VOICE.</span><br /><em className="cipher-word">THEN READ THE SIGNAL.</em></h2>
            <p className="pipeline-intro">A client-side acoustic pipeline surfaces voice features for review—not a black-box verdict. Click any stage to access its dedicated 3D laboratory, or inspect the end-to-end workflow.</p>
            <div className="pipeline-list">
              <Link href="/pipeline" className="pipeline-step hover:border-cyan-400 group transition-all border-cyan-500/40 bg-cyan-950/20"><span>BLUEPRINT</span><div><strong className="group-hover:text-cyan-300 transition-colors">End-to-end pipeline workflow</strong><small>Data flow diagram · live simulation · math specs</small></div><b className="group-hover:translate-x-1 transition-transform">→</b></Link>
              <Link href="/pipeline/audio-ingestion" className="pipeline-step hover:border-cyan-400 group transition-all"><span>STAGE 01</span><div><strong className="group-hover:text-cyan-300 transition-colors">Audio ingestion & filtering</strong><small>Local capture · noise suppression · waveform</small></div><b className="group-hover:translate-x-1 transition-transform">↗</b></Link>
              <Link href="/pipeline/feature-extraction" className="pipeline-step hover:border-cyan-400 group transition-all"><span>STAGE 02</span><div><strong className="group-hover:text-cyan-300 transition-colors">Spectral feature extraction</strong><small>MFCC concepts · pitch · jitter/shimmer proxies · pace</small></div><b className="group-hover:translate-x-1 transition-transform">↗</b></Link>
              <Link href="/pipeline/emotion-modeling" className="pipeline-step hover:border-cyan-400 group transition-all"><span>STAGE 03</span><div><strong className="group-hover:text-cyan-300 transition-colors">Temporal emotion modeling</strong><small>Wav2Vec2 + BiGRU reference architecture</small></div><b className="group-hover:translate-x-1 transition-transform">↗</b></Link>
              <Link href="/pipeline/priority-triage" className="pipeline-step hover:border-cyan-400 group transition-all"><span>STAGE 04</span><div><strong className="group-hover:text-cyan-300 transition-colors">Priority triage support</strong><small>0–100 demo score · human review required</small></div><b className="group-hover:translate-x-1 transition-transform">↗</b></Link>
            </div>
            <p className="model-note"><Cpu size={14} /> Each stage features a dedicated 3D model, interactive telemetry, and mathematical explanations.</p>
          </div>
          <div className="spectral-label"><span>ACOUSTIC FEATURE FIELD</span><strong>MFCC <i>·</i> F0 <i>·</i> JITTER <i>·</i> WPM</strong><small>SIMULATED SPECTRAL TUNNEL</small></div>
          <div className="section-coord">PIPELINE / 04 STAGES <span>CLIENT-SIDE ONLY</span></div>
        </section>

        <section className="story-section emotion-section" id="emotions" aria-labelledby="emotions-title">
          <div className="emotion-heading">
            <div className="section-index">03 <span>{"//"}</span> VOCAL EMOTION SIGNALS</div>
            <h2 id="emotions-title"><span className="cipher-word">FOUR SIGNALS.</span> <em>ONE HUMAN REVIEW.</em></h2>
            <p>Select a signal to change the 3D core, motion intensity, and illustrative acoustic readout.</p>
          </div>
          <div className="emotion-orbit" role="group" aria-label="Select an emotion signal">
            {emotionNodes.map((item, index) => (
              <motion.button key={item.key} className={`emotion-node emotion-node--${index} ${emotion === item.key ? "emotion-node--active" : ""}`} onMouseEnter={() => setEmotion(item.key)} onFocus={() => setEmotion(item.key)} onClick={() => setEmotion(item.key)} type="button" aria-pressed={emotion === item.key}>
                <span className="emotion-node-index">0{index + 1} / SIGNAL</span><strong>{item.title}</strong><span className="emotion-node-score">{metrics.source === "idle" ? item.score : metrics.emotions[item.key]}% <small>{metrics.source === "idle" ? "DEMO" : "LIVE EST."}</small></span><span className="emotion-underline" style={{ background: `linear-gradient(90deg, #00F0FF, ${item.color})` }} /><small className="emotion-node-note">{item.note}</small>
              </motion.button>
            ))}
            <div className="orbit-center-label"><span>ACTIVE SIGNAL</span><strong>{emotion.toUpperCase()}</strong><small>{currentEmotion.copy}</small><span className="orbit-center-ring" /></div>
          </div>
          <div className="emotion-readout">
            <div className="readout-title"><span>SIMULATED SIGNAL CONFIDENCE</span><strong>{metrics.source === "idle" ? currentEmotion.value : activeScores[emotion]}<small>%</small></strong></div>
            <EmotionMeter label="FEAR" value={activeScores.fear} active={emotion === "fear"} color="#00F0FF" />
            <EmotionMeter label="ANGER" value={activeScores.anger} active={emotion === "anger"} color="#3B82F6" />
            <EmotionMeter label="DISTRESS" value={activeScores.distress} active={emotion === "distress"} color="#00FF88" />
            <EmotionMeter label="NERVOUSNESS" value={activeScores.nervousness} active={emotion === "nervousness"} color="#78F7D0" />
            <p className="metrics-mini"><span>F0 / {metrics.pitch || currentEmotion.pitch} Hz</span><span>TREMOR / {metrics.tremor || currentEmotion.tremor}%</span><span>URGENCY / {metrics.source === "idle" ? currentEmotion.urgency : metrics.urgency}%</span></p>
          </div>
          <div className="section-coord">SIGNAL CLASS / 04 <span>HOVER OR CLICK TO MORPH</span></div>
        </section>

        <section className="story-section objective-section" id="objective" aria-labelledby="objective-title">
          <div className="section-copy objective-copy">
            <div className="section-index green-index">04 <span>{"//"}</span> OBJECTIVE & RESPONSIBLE AI</div>
            <h2 id="objective-title"><span className="cipher-word">PRIORITIZE CRITICAL CALLS.</span><br /><em className="green-headline">NEVER AUTOMATE GUILT.</em></h2>
            <p>Give officers a real-time signal view to support faster triage while respecting <strong>privacy, security, and human judgement</strong>. The demo&apos;s microphone and file analysis stay inside this browser tab.</p>
            <div className="ethics-statement"><ShieldCheck size={19} /><p><strong>INDICATIVE SIGNAL ONLY.</strong> Emotion predictions are not definitive evidence of a person&apos;s intentions, honesty, or guilt. Scores must never be used as the sole basis for enforcement decisions.</p></div>
          </div>
          <div className="sandbox-content" id="sandbox">
            <div className="sandbox-heading"><span><Radio size={15} /> LIVE VOICE SANDBOX</span><strong>LOCAL AUDIO / NO SERVER</strong></div>
            <AudioSandbox onMetrics={onMetrics} />
          </div>
          <div className="section-coord">PRIVACY LAYER / ENABLED <span>MIC ACCESS REQUIRES PERMISSION</span></div>
        </section>

        <footer className="site-footer"><span>VOCAL/FORENSICS <i>— CONCEPT PROTOTYPE</i></span><span><LockKeyhole size={12} /> CLIENT-SIDE AUDIO PROCESSING</span><Link href="/dashboard">Open Tactical HUD <ArrowRight size={13} /></Link></footer>
      </div>

      <div className="live-telemetry" aria-live="polite">
        <div className="live-telemetry-top"><span className={metrics.source === "idle" ? "" : "green-text"}><span className={`status-dot ${metrics.source === "microphone" ? "status-dot--live" : ""}`} /> {metrics.source === "idle" ? "AWAITING AUDIO" : metrics.source === "simulation" ? "SIMULATION ACTIVE" : "AUDIO ANALYSIS ACTIVE"}</span><span>60 FPS TARGET</span></div>
        <div className="telemetry-main"><span>PRIORITY INDEX</span><strong>{metrics.urgency.toString().padStart(2, "0")}<small>%</small></strong></div>
        <div className="telemetry-mini"><span>F0 <strong>{metrics.pitch || "—"}</strong> Hz</span><span>LEVEL <strong>{metrics.level.toString().padStart(2, "0")}</strong>%</span></div>
        <div className="telemetry-footer"><ScanLine size={12} /> {metrics.source === "idle" ? "NO AUDIO STREAM" : metrics.label.toUpperCase().slice(0, 29)}</div>
      </div>

      <div className="privacy-chip"><Fingerprint size={14} /> LOCAL-FIRST AUDIO <span>·</span> <ShieldCheck size={14} /> RESPONSIBLE AI</div>
      <span className="edge-coord edge-coord--left" aria-hidden="true">VF.SER / 26.10 <br /> OPTICAL FIELD ACTIVE</span>
      <span className="edge-coord edge-coord--right" aria-hidden="true">X: {Math.round(stage * 25).toString().padStart(3, "0")} <br /> Y: {Math.round(metrics.level * 0.8).toString().padStart(3, "0")}</span>
    </main>
  );
}
