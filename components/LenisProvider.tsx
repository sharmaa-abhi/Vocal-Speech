"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.85 });
    const updateScroll = () => ScrollTrigger.update();
    const driveLenis = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", updateScroll);
    gsap.ticker.add(driveLenis);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.off("scroll", updateScroll);
      gsap.ticker.remove(driveLenis);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}
