"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AudioWaveform,
  BarChart3,
  Brain,
  ShieldAlert,
  RadioTower,
  Menu,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export interface NavRoute {
  num: string;
  label: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Activity;
  badge?: string;
}

export const NAV_ROUTES: NavRoute[] = [
  {
    num: "01",
    label: "HOME",
    title: "Cinematic Overview",
    description: "Mission introduction, cybercrime crisis & scrollytelling acoustic narrative",
    href: "/",
    icon: Activity
  },
  {
    num: "02",
    label: "AUDIO INGESTION",
    title: "Stage 01: Ingestion & Filtering",
    description: "Browser audio capture, local DSP decoding, waveform inspection & bandpass filter",
    href: "/pipeline/audio-ingestion",
    icon: AudioWaveform,
    badge: "STAGE 01"
  },
  {
    num: "03",
    label: "FEATURE EXTRACTION",
    title: "Stage 02: Spectral Features",
    description: "13-band MFCC envelope, F0 pitch tracking, jitter/shimmer proxies & speech pace",
    href: "/pipeline/feature-extraction",
    icon: BarChart3,
    badge: "STAGE 02"
  },
  {
    num: "04",
    label: "EMOTION MODELING",
    title: "Stage 03: Temporal Modeling",
    description: "Wav2Vec2 + BiGRU sequence architecture & 4 indicative emotion vectors",
    href: "/pipeline/emotion-modeling",
    icon: Brain,
    badge: "STAGE 03"
  },
  {
    num: "05",
    label: "PRIORITY TRIAGE",
    title: "Stage 04: Decision Support",
    description: "3D holographic radar, 5 simulated priority calls & assistive supervisor queues",
    href: "/pipeline/priority-triage",
    icon: ShieldAlert,
    badge: "STAGE 04"
  },
  {
    num: "06",
    label: "OFFICER HUD",
    title: "Live Officer Tactical HUD",
    description: "Real-time cybercrime dispatch desk, telemetry stream & incident actions",
    href: "/dashboard",
    icon: RadioTower,
    badge: "OPERATIONAL"
  }
];

export default function GlobalNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close overlay on Escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const activeRoute = NAV_ROUTES.find((r) =>
    r.href === "/" ? pathname === "/" : pathname?.startsWith(r.href)
  ) ?? NAV_ROUTES[0];

  return (
    <>
      {/* Floating Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 h-[72px] px-4 md:px-8 flex items-center justify-between border-b border-cyan-500/15 bg-black/80 backdrop-blur-md">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="Vocal Forensics Home"
        >
          <div className="w-9 h-9 border border-cyan-400/50 flex items-center justify-center text-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,240,255,0.15)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all">
            <Activity className="w-4 h-4 animate-pulse text-cyan-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Orbitron',sans-serif] text-xs font-bold tracking-widest text-white flex items-center gap-1">
              VOCAL<span className="text-cyan-400">/FORENSICS</span>
            </span>
            <span className="font-['JetBrains_Mono',monospace] text-[10px] text-slate-400 tracking-wider">
              ACOUSTIC INTELLIGENCE // SER
            </span>
          </div>
        </Link>

        {/* Center: Stage Indicator Pill (visible on desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-black/60 font-['JetBrains_Mono',monospace] text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="text-cyan-400 font-semibold">{activeRoute.num}</span>
          <span className="text-slate-500">//</span>
          <span className="text-white tracking-wider uppercase">{activeRoute.label}</span>
          {activeRoute.badge && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              {activeRoute.badge}
            </span>
          )}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {/* Quick HUD Link */}
          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-['JetBrains_Mono',monospace] border border-emerald-400/30 bg-emerald-950/20 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/30 transition-all rounded"
            >
              <RadioTower className="w-3.5 h-3.5 text-emerald-400" />
              <span>OFFICER HUD</span>
            </Link>
          )}

          {/* Navigation Menu Modal Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-['JetBrains_Mono',monospace] border border-cyan-400/30 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400 hover:text-white hover:bg-cyan-900/40 transition-all rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Open Navigation Directory"
            aria-expanded={isOpen}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wider">PIPELINE DIRECTORY</span>
            <Menu className="w-4 h-4 ml-1" />
          </button>
        </div>
      </header>

      {/* Futuristic Fullscreen Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Acoustic Intelligence Navigation Directory"
          >
            {/* Ambient cyber grid in modal */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,240,255,0.08)_0%,_transparent_70%)]" />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-cyan-500/30 bg-zinc-950/95 p-6 sm:p-8 md:p-10 shadow-[0_0_50px_rgba(0,240,255,0.15)] rounded-lg"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rotate-45 shadow-[0_0_10px_#00F0FF]" />
                  <div>
                    <h2 className="font-['Orbitron',sans-serif] text-lg sm:text-xl font-bold tracking-wider text-white">
                      VOCAL FORENSICS // MISSION ARCHITECTURE
                    </h2>
                    <p className="font-['JetBrains_Mono',monospace] text-xs text-slate-400 mt-1">
                      REAL-TIME SPEECH EMOTION ANALYSIS FOR CYBERCRIME INVESTIGATION
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-['JetBrains_Mono',monospace] border border-cyan-400/40 text-cyan-300 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-300 transition-all rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  aria-label="Close navigation overlay"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">ESC // CLOSE</span>
                </button>
              </div>

              {/* Grid of Navigation Destination Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {NAV_ROUTES.map((route) => {
                  const Icon = route.icon;
                  const isActive =
                    route.href === "/"
                      ? pathname === "/"
                      : pathname?.startsWith(route.href);

                  return (
                    <Link
                      key={route.num}
                      href={route.href}
                      onClick={() => setIsOpen(false)}
                      className={`group relative flex flex-col justify-between p-5 border transition-all rounded-md overflow-hidden ${
                        isActive
                          ? "border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(0,240,255,0.2)]"
                          : "border-zinc-800 bg-zinc-900/60 hover:border-cyan-500/50 hover:bg-zinc-900/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                      }`}
                    >
                      {/* Top Header inside card */}
                      <div>
                        <div className="flex items-center justify-between mb-3 font-['JetBrains_Mono',monospace] text-xs">
                          <span
                            className={`font-semibold ${
                              isActive ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-300"
                            }`}
                          >
                            {route.num} {"//"} {route.label}
                          </span>
                          {route.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded border ${
                                isActive
                                  ? "border-emerald-400 text-emerald-300 bg-emerald-950/60"
                                  : "border-zinc-700 text-slate-400 group-hover:border-cyan-500/40 group-hover:text-cyan-300"
                              }`}
                            >
                              {route.badge}
                            </span>
                          )}
                        </div>

                        {/* Title & Icon */}
                        <div className="flex items-start gap-3 my-2">
                          <div
                            className={`p-2.5 rounded border ${
                              isActive
                                ? "border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                : "border-zinc-700 bg-zinc-800/80 text-slate-300 group-hover:border-cyan-400/50 group-hover:text-cyan-300"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-['Orbitron',sans-serif] text-sm sm:text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                              {route.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {route.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between font-['JetBrains_Mono',monospace] text-[11px]">
                        <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">
                          {isActive ? "● CURRENT LOCATION" : "ACCESS STAGE"}
                        </span>
                        <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform">
                          <span>ENTER</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Active glowing indicator strip */}
                      {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Modal Bottom Footer / Responsible AI note */}
              <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-['JetBrains_Mono',monospace] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>LOCAL-FIRST ACOUSTIC COMPUTATION // ZERO EXTERNAL TELEMETRY</span>
                </div>
                <span>CYBERCRIME HUMAN REVIEW SUPPORT SYSTEM</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
