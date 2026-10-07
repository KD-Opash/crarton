"use client";

import { ArrowRight, ArrowDown, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/Reveal";
import { HeroCanvas } from "./HeroCanvas";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PHASES = [
  { id: 0, title: "Ideas", num: "01" },
  { id: 1, title: "Focus", num: "02" },
  { id: 2, title: "Innovation", num: "03" },
  { id: 3, title: "Forward", num: "04" },
  { id: 4, title: "Craton", num: "05" },
];

export function Hero() {
  const [phase, setPhase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle subtle desktop mouse interaction for the canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[min(100svh,900px)] pt-[150px] pb-[80px] px-[var(--pad)] bg-ink overflow-hidden isolate">
      {/* Subtle Background Glow - Warm Mocha / Sunset */}
      <div 
        className="absolute inset-0 z-[-1] pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle at 80% 50%, #2A1D17 0%, #171412 60%)"
        }}
      />
      
      <div className="max-w-[1440px] mx-auto w-full h-full flex flex-col lg:flex-row items-center gap-[60px] lg:gap-[120px]">
        {/* Left Side: Soft Editorial Typography */}
        <div className="relative z-10 flex flex-col items-start w-full lg:w-[55%] pt-10">
          
          <Reveal>
            <div className="flex items-center gap-[12px] text-copper mb-[24px] font-mono text-[11px] tracking-[0.2em] uppercase font-medium">
              <span className="w-[30px] h-[1px] bg-copper/50 block" />
              Innovation-first. Research-led.
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display font-medium text-[clamp(48px,6vw,84px)] leading-[1.0] tracking-[-0.01em] mb-[28px] text-white">
              Bold ideas.<br/>
              Engineered <span className="italic text-copper font-normal">forward.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-[16px] leading-[1.7] text-[#a9ac9f] max-w-[500px] mb-[40px]">
              Craton invents, protects, and ships AI-enabled products for regulated, evidence-heavy work — starting with medical-device regulatory affairs, and applying the same method across new domains.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-wrap items-center gap-[24px] mb-[50px]">
              <Button variant="primary" asChild className="h-[50px] px-7">
                <Link href="#what-we-build">
                  Explore our products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <TextLink href="#how-it-works">
                Our approach
              </TextLink>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="font-mono text-[11.5px] tracking-[0.06em] text-[#888B9E] flex flex-wrap items-center gap-2">
              <span className="font-medium text-cream">3</span> granted US patents
              <span className="text-[16px] leading-none opacity-40">&middot;</span>
              <span className="font-medium text-cream">9</span> pending
              <span className="text-[16px] leading-none opacity-40">&middot;</span>
              Frisco, Texas
            </div>
          </Reveal>
        </div>

        {/* Right Side: Framed 3D Visual */}
        <div className="relative z-10 w-full lg:w-[45%] h-[400px] lg:h-[550px] flex flex-col justify-end">
          {/* Framed Canvas Container */}
          <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <HeroCanvas phase={phase} isPaused={isPaused} mousePos={mousePos} />
          </div>
          
          {/* Internal Phase Interface */}
          <div className="relative z-20 w-full p-6 pt-0 mt-auto pointer-events-auto">
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-display font-medium text-[20px] text-white tracking-[-0.01em]">
                {PHASES[phase].title}
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-copper">
                0{phase + 1} / 05
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-2 w-full">
              {PHASES.map((p) => {
                const isActive = p.id === phase;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPhase(p.id)}
                    aria-pressed={isActive}
                    className="group relative flex flex-col text-left pt-[8px] border-t border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-copper"
                  >
                    <span 
                      className={cn(
                        "absolute top-[-1px] left-0 h-[1px] bg-copper transition-all origin-left",
                        isActive ? "w-full duration-[3.4s] ease-linear" : "w-0 duration-300"
                      )}
                    />
                    <span className={cn(
                      "font-mono text-[9px] tracking-[0.12em] mb-1 transition-colors",
                      isActive ? "text-copper" : "text-muted group-hover:text-cream"
                    )}>
                      {p.num}
                    </span>
                    <span className={cn(
                      "text-[10px] sm:text-[11px] transition-colors truncate w-full",
                      isActive ? "text-cream" : "text-[#888B9E] group-hover:text-cream"
                    )}>
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Scroll Indicator */}
      <div className="absolute bottom-0 left-[var(--pad)] right-[var(--pad)] z-10 h-[70px] border-t border-white/10 flex items-center justify-between gap-4 text-[11.5px] text-[#888B9E]">
        <Link href="#craton-in-one-view" className="flex items-center gap-[12px] hover:text-white transition-colors group">
          <ArrowDown className="w-4 h-4 text-copper transition-transform group-hover:translate-y-1" />
          From possibility to purpose.
        </Link>

        {/* Motion Control */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-copper px-2 py-1 rounded bg-white/5 border border-white/10"
          aria-label={isPaused ? "Play decorative animation" : "Pause decorative animation"}
        >
          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          <span className="hidden sm:inline">{isPaused ? "Play motion" : "Pause motion"}</span>
        </button>
      </div>
    </section>
  );
}
