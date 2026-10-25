"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  RadioTower,
  BellRing,
  Clock,
  User,
  PhoneCall,
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  FileText,
  CheckCircle2,
  ListFilter
} from "lucide-react";
import GlobalNav from "@/components/navigation/GlobalNav";
import PipelineTimeline from "@/components/navigation/PipelineTimeline";
import StageSwitcher from "@/components/navigation/StageSwitcher";
import { RADAR_TARGETS, type RadarCallTarget } from "@/components/scenes/PriorityRadarScene";

// Dynamically load unique 3D Priority Radar scene
const PriorityRadarScene = dynamic(
  () => import("@/components/scenes/PriorityRadarScene"),
  { ssr: false }
);

interface TriageCall {
  id: string;
  category: string;
  subType: string;
  location: string;
  timestamp: string;
  urgency: number;
  priorityLevel: "CRITICAL REVIEW" | "HIGH PRIORITY" | "STANDARD REVIEW";
  primaryEmotion: string;
  emotionBreakdown: { label: string; value: number }[];
  suggestedAction: string;
  transcriptExcerpt: string;
  recommendedReviewProtocol: string;
  accentColor: string;
}

const TRIAGE_CALLS: TriageCall[] = [
  {
    id: "VF-2048",
    category: "FINANCIAL FRAUD VICTIM",
    subType: "Senior Citizen Life-Savings Impersonation",
    location: "NCR / Helpline 1930",
    timestamp: "00:48 AGO",
    urgency: 95,
    priorityLevel: "CRITICAL REVIEW",
    primaryEmotion: "DISTRESS (96%)",
    emotionBreakdown: [
      { label: "Distress", value: 96 },
      { label: "Fear", value: 88 },
      { label: "Nervousness", value: 81 },
      { label: "Anger", value: 46 }
    ],
    suggestedAction: "IMMEDIATE SUPERVISOR INTERVENTION & BANK FREEZE ESCALATION",
    transcriptExcerpt: "“They are asking me to transfer the remaining fixed deposit balance right now or they will issue an arrest warrant… please help me, I am alone…”",
    recommendedReviewProtocol: "1. Promptly route to Duty Officer. 2. Verify fraudulent banking recipient account. 3. Initiate national cyber portal freeze request within 15-minute golden window.",
    accentColor: "#00FF88"
  },
  {
    id: "VF-2042",
    category: "SUSPECTED COERCION",
    subType: "Digital Arrest & Skype Video Extortion",
    location: "Delhi Cyber Cell Inbound",
    timestamp: "01:17 AGO",
    urgency: 78,
    priorityLevel: "HIGH PRIORITY",
    primaryEmotion: "NERVOUSNESS (79%)",
    emotionBreakdown: [
      { label: "Nervousness", value: 79 },
      { label: "Fear", value: 72 },
      { label: "Distress", value: 51 },
      { label: "Anger", value: 36 }
    ],
    suggestedAction: "VERIFY OFFICIAL NOTICE & ADVISE VICTIM TO DISCONNECT EXTORTION CALL",
    transcriptExcerpt: "“I cannot share my Aadhaar card and bank credentials on this call… someone claiming to be a CBI inspector is on my other laptop screen…”",
    recommendedReviewProtocol: "1. Inform caller that law enforcement never conducts virtual arrest rooms. 2. Instruct caller to sever webcam video link. 3. Log impersonator's Skype ID and IP coordinates.",
    accentColor: "#00F0FF"
  },
  {
    id: "VF-2037",
    category: "INFORMANT REPORT",
    subType: "Syndicate Call-Center Operation Tip",
    location: "Faridabad Inbound Line",
    timestamp: "02:04 AGO",
    urgency: 62,
    priorityLevel: "HIGH PRIORITY",
    primaryEmotion: "FEAR (64%)",
    emotionBreakdown: [
      { label: "Fear", value: 64 },
      { label: "Nervousness", value: 52 },
      { label: "Distress", value: 48 },
      { label: "Anger", value: 14 }
    ],
    suggestedAction: "ROUTE TO CYBER INTELLIGENCE SPECIALIST FOR CONFIDENTIAL INTAKE",
    transcriptExcerpt: "“I need to tell someone… they are running sixty VoIP workstations on the third floor of the business tower… but I am worried they will find out…”",
    recommendedReviewProtocol: "1. Secure caller confidentiality. 2. Verify location coordinates against active ISP subnet logs. 3. Relay briefing to field investigation dispatch.",
    accentColor: "#3B82F6"
  },
  {
    id: "VF-2031",
    category: "ACCOUNT TAKEOVER",
    subType: "SIM Swap & Crypto Wallet Drain",
    location: "Gurugram Desk 03",
    timestamp: "02:55 AGO",
    urgency: 48,
    priorityLevel: "STANDARD REVIEW",
    primaryEmotion: "ANGER (42%)",
    emotionBreakdown: [
      { label: "Anger", value: 42 },
      { label: "Distress", value: 38 },
      { label: "Nervousness", value: 29 },
      { label: "Fear", value: 22 }
    ],
    suggestedAction: "STANDARD HELPLINE INCIDENT TICKET & 2FA TELECOM AUDIT",
    transcriptExcerpt: "“My network signal dropped two hours ago and now both my trading and email passwords have been altered without OTPs.”",
    recommendedReviewProtocol: "1. File telecom carrier SIM-reissuance report. 2. Advise caller to contact carrier fraud desk for immediate number lock. 3. Log wallet addresses for blockchain tracking.",
    accentColor: "#78F7D0"
  },
  {
    id: "VF-2029",
    category: "GENERAL STATUS ENQUIRY",
    subType: "Case Reference Check & Follow-Up",
    location: "Noida General Helpline",
    timestamp: "03:26 AGO",
    urgency: 29,
    priorityLevel: "STANDARD REVIEW",
    primaryEmotion: "LOW SIGNAL (18%)",
    emotionBreakdown: [
      { label: "Nervousness", value: 22 },
      { label: "Distress", value: 18 },
      { label: "Anger", value: 15 },
      { label: "Fear", value: 12 }
    ],
    suggestedAction: "NORMAL QUEUE DISPATCH // REGULAR CASE WORKFLOW",
    transcriptExcerpt: "“Hello officer, I am calling to follow up on acknowledgment number NCR-8812 regarding a phishing SMS filed last Tuesday.”",
    recommendedReviewProtocol: "1. Provide current investigation status update from database. 2. Standard resolution without priority escalation required.",
    accentColor: "#64748B"
  }
];

export default function PriorityTriagePage() {
  const [selectedCallId, setSelectedCallId] = useState<string>("VF-2048");
  const [sortBy, setSortBy] = useState<"urgency" | "timestamp">("urgency");

  // Sort queue
  const sortedCalls = [...TRIAGE_CALLS].sort((a, b) => {
    if (sortBy === "urgency") return b.urgency - a.urgency;
    return a.id.localeCompare(b.id);
  });

  const activeCall = TRIAGE_CALLS.find((c) => c.id === selectedCallId) ?? TRIAGE_CALLS[0];

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      <GlobalNav />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-28 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Stage Header */}
        <section className="mb-10">
          <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-emerald-400 tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STAGE 04 {"//"} PRIORITY TRIAGE SUPPORT</span>
          </div>

          <h1 className="font-['Orbitron',sans-serif] text-2xl sm:text-4xl md:text-5xl font-black tracking-wide text-white mb-4">
            BRING URGENT CALLS <span className="text-emerald-400">INTO FOCUS.</span>
          </h1>

          <p className="font-['Inter',sans-serif] text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Transform explicitly identified demonstration outputs into a review-priority interface that supports—not replaces—human judgment. Real-time acoustic urgency indicators empower cybercrime desks to triage high-risk distress calls first, maximizing response speed during the critical golden hour.
          </p>
        </section>

        {/* 3D Holographic Dispatch Radar + Priority Queue Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-12">
          {/* 3D Radar Container (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border border-emerald-500/25 bg-zinc-950/80 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(0,255,136,0.12)]">
            <div className="px-5 py-3 border-b border-emerald-500/20 bg-black/60 flex items-center justify-between font-['JetBrains_Mono',monospace] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-semibold">3D HOLOGRAPHIC DISPATCH RADAR</span>
              </div>
              <span className="text-emerald-300 uppercase">
                TARGET LOCKED: {activeCall.id}
              </span>
            </div>

            {/* 3D Canvas Scene */}
            <div className="relative w-full h-[380px] sm:h-[440px] bg-black">
              <PriorityRadarScene
                selectedCallId={selectedCallId}
              />

              {/* Overlaid Radar HUD Readouts */}
              <div className="absolute top-4 left-4 pointer-events-none font-['JetBrains_Mono',monospace] text-[11px] text-cyan-300/80 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-cyan-500/20">
                ACTIVE RADAR SWEEP: 360° // 5 TARGETS
              </div>

              <div className="absolute top-4 right-4 pointer-events-none font-['JetBrains_Mono',monospace] text-[11px] text-emerald-400/80 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-emerald-500/20">
                DEFENSIVE SHIELD: ACTIVE
              </div>

              <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex items-center justify-between font-['JetBrains_Mono',monospace] text-[11px] text-slate-300 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded border border-zinc-800">
                <span>RADAR SECTOR: {activeCall.location}</span>
                <span className="text-emerald-400 font-bold">
                  URGENCY INDEX: {activeCall.urgency}%
                </span>
              </div>
            </div>

            {/* Selected Target Quick Status Strip */}
            <div className="p-4 border-t border-emerald-500/20 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 font-['JetBrains_Mono',monospace] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeCall.accentColor }} />
                <strong className="text-white">{activeCall.id}</strong>
                <span className="text-slate-400">· {activeCall.category}</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                activeCall.priorityLevel === "CRITICAL REVIEW"
                  ? "border-red-500 bg-red-950/60 text-red-300"
                  : activeCall.priorityLevel === "HIGH PRIORITY"
                  ? "border-amber-500 bg-amber-950/60 text-amber-300"
                  : "border-zinc-700 bg-zinc-900 text-slate-300"
              }`}>
                {activeCall.priorityLevel}
              </span>
            </div>
          </div>

          {/* Interactive Inbound Call Queue (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 border border-zinc-800 bg-zinc-950/70 rounded-xl p-5 sm:p-6 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-['JetBrains_Mono',monospace] text-xs">
                <div className="flex items-center gap-2">
                  <RadioTower className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">INBOUND CALL QUEUE (05)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>SORT: URGENCY</span>
                </div>
              </div>

              {/* Call List Buttons */}
              <div className="space-y-2 my-4">
                {sortedCalls.map((call) => {
                  const isSelected = selectedCallId === call.id;

                  return (
                    <button
                      key={call.id}
                      onClick={() => setSelectedCallId(call.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-950/40 text-emerald-100 shadow-[0_0_20px_rgba(0,255,136,0.18)] ring-1 ring-emerald-400/50"
                          : "border-zinc-800 bg-zinc-900/40 text-slate-400 hover:border-zinc-700 hover:bg-zinc-900/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: call.accentColor }}
                          />
                          <strong className="font-['Orbitron',sans-serif] text-xs text-white">
                            {call.id}
                          </strong>
                          <span className="font-['JetBrains_Mono',monospace] text-[10px] text-slate-400">
                            {call.timestamp}
                          </span>
                        </div>

                        <span
                          className={`font-['JetBrains_Mono',monospace] text-xs font-bold ${
                            call.urgency >= 80
                              ? "text-red-400"
                              : call.urgency >= 60
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        >
                          {call.urgency}%
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-semibold truncate mb-1">
                        {call.category}
                      </div>

                      <div className="flex items-center justify-between font-['JetBrains_Mono',monospace] text-[10px] text-slate-500">
                        <span>{call.primaryEmotion}</span>
                        <span className="text-emerald-400">
                          {isSelected ? "● TRACKING IN 3D" : "SELECT TARGET"}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${call.urgency}%`,
                            backgroundColor: call.accentColor
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Call Detail Inspector */}
            <div className="p-4 rounded-lg border border-emerald-500/20 bg-zinc-900/70">
              <div className="flex items-center justify-between mb-2 font-['JetBrains_Mono',monospace] text-xs">
                <span className="text-emerald-300 font-bold">HUMAN OFFICER DECISION SUPPORT</span>
                <span className="text-slate-400">{activeCall.id}</span>
              </div>

              {/* Fictional Transcript Quote */}
              <div className="p-2.5 rounded bg-black/60 border border-zinc-800 text-xs italic text-slate-300 font-['Inter',sans-serif] mb-3">
                {activeCall.transcriptExcerpt}
              </div>

              {/* Suggested Action */}
              <div className="text-xs font-['JetBrains_Mono',monospace]">
                <strong className="text-emerald-400 block text-[10px] uppercase mb-1">
                  SUGGESTED DISPATCH PROTOCOL:
                </strong>
                <p className="text-white font-semibold leading-relaxed">
                  {activeCall.suggestedAction}
                </p>
              </div>
            </div>

            {/* Mandatory Responsible AI Notice */}
            <div className="p-3 rounded border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-2.5 text-[11px] font-['JetBrains_Mono',monospace] text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">INDICATIVE SIGNALS ONLY — HUMAN REVIEW REQUIRED</strong>
                Urgency scores represent prototype triage prioritization and are never automated proof of criminal intent, deception, or guilt.
              </div>
            </div>
          </div>
        </div>

        {/* 4 Decision Support Architecture Principles */}
        <section className="my-14">
          <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-xs text-emerald-400 tracking-widest uppercase mb-2">
            <span>{"//"} HUMAN-IN-THE-LOOP FRAMEWORK</span>
          </div>
          <h2 className="font-['Orbitron',sans-serif] text-xl sm:text-2xl font-bold tracking-wide text-white mb-6">
            ETHICAL TRIAGE <span className="text-emerald-400">PRINCIPLES</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950/70">
              <div className="w-8 h-8 rounded border border-emerald-500/40 bg-emerald-950/40 flex items-center justify-center text-emerald-400 mb-3 font-['JetBrains_Mono',monospace] text-xs font-bold">
                01
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white mb-2">
                Assistive, Never Automated
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                The triage engine does not make autonomous operational decisions, block callers, or file legal charges. It provides an indicative queue sort order for human dispatcher evaluation.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950/70">
              <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 mb-3 font-['JetBrains_Mono',monospace] text-xs font-bold">
                02
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white mb-2">
                Mitigating Call Overload
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                Cybercrime hotlines receive hundreds of simultaneous inquiries. Surfacing acute vocal distress prevents panicked senior victims from waiting behind routine paperwork queries.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950/70">
              <div className="w-8 h-8 rounded border border-blue-500/40 bg-blue-950/40 flex items-center justify-center text-blue-400 mb-3 font-['JetBrains_Mono',monospace] text-xs font-bold">
                03
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white mb-2">
                Transparent Proxy Transparency
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                All urgency rankings clearly expose the underlying acoustic proxies (pitch, tremor, spectral centroid) so reviewing officers know exactly why a signal was flagged.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950/70">
              <div className="w-8 h-8 rounded border border-teal-500/40 bg-teal-950/40 flex items-center justify-center text-teal-400 mb-3 font-['JetBrains_Mono',monospace] text-xs font-bold">
                04
              </div>
              <h3 className="font-['Orbitron',sans-serif] text-sm font-bold text-white mb-2">
                Context Supremacy
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-['Inter',sans-serif]">
                Acoustic signals reflect physiological arousal, which can be influenced by accent, illness, or background noise. Conversation content and independent factual evidence always take legal precedence.
              </p>
            </div>
          </div>
        </section>

        {/* Pipeline Stage Progression Explorer */}
        <PipelineTimeline currentStage={4} />

        {/* Stage 04 CTA to Tactical HUD */}
        <div className="mt-10 p-6 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-['JetBrains_Mono',monospace] text-xs text-emerald-400 tracking-wider">
              OPERATIONAL COMMAND DESK
            </span>
            <h3 className="font-['Orbitron',sans-serif] text-lg sm:text-xl font-bold text-white mt-1">
              Launch The Full Live Officer Tactical HUD
            </h3>
          </div>
          <Link
            href="/dashboard"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded border border-emerald-400 bg-emerald-500 text-black font-['JetBrains_Mono',monospace] text-xs font-bold hover:bg-emerald-400 shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all"
          >
            <span>OPEN OFFICER TACTICAL HUD</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Floating Stage Switcher */}
      <StageSwitcher currentStage={4} />
    </div>
  );
}
