"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "question",
    label: "Question",
    title: "The Inquiry",
    desc: "In complex domains, ambiguity is the enemy. Every workflow begins by isolating the precise question that demands a definitive answer."
  },
  {
    id: "claim",
    label: "Claim",
    title: "The Proposition",
    desc: "AI can generate claims effortlessly. But a claim standing alone is a liability. It must be treated as a hypothesis, not a conclusion."
  },
  {
    id: "evidence",
    label: "Evidence",
    title: "The Grounding",
    desc: "We demand hard, verifiable facts from authoritative sources—technical documentation, raw data, or independent reviews—to anchor the claim."
  },
  {
    id: "reasoning",
    label: "Reasoning",
    title: "The Connection",
    desc: "Intelligence isn't just finding the answer; it's showing the work. The logic connecting the evidence back to the claim must be visible and traceable."
  },
  {
    id: "decision",
    label: "Decision",
    title: "The Outcome",
    desc: "When the entire chain—from question to evidence to logic—is exposed, human experts and autonomous agents can authorize action with absolute confidence."
  }
];

export function WhyEvidenceMatters() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isAutoPlaying = useRef(true);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      if (isAutoPlaying.current) {
        setActiveIndex((prev) => (prev + 1) % STEPS.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSelect = (index: number) => {
    isAutoPlaying.current = false;
    setActiveIndex(index);
  };

  return (
    <section id="why-craton" className="bg-ink text-paper py-[120px] px-[var(--pad)] border-t border-[var(--line)] overflow-hidden">
      <Reveal>
        <div className="max-w-[700px] mb-[80px]">
          <p className="eyebrow text-[#9da197] mb-3">
            <span className="opacity-70 mr-3">04 /</span> The Philosophy
          </p>
          <h2 className="text-[clamp(38px,4.6vw,76px)] font-normal leading-[1.02] tracking-[-0.045em] text-white mb-6">
            Why evidence <span className="font-serif italic text-[#e6e5d9]">matters.</span>
          </h2>
          <p className="text-[16px] text-[#bfc2b6] leading-[1.7]">
            Trust cannot be hallucinated. We believe that applying intelligence to high-stakes problems requires fundamentally changing the architecture. The model is not the product. The truth, backed by a visible chain of evidence, is the product.
          </p>
        </div>
      </Reveal>

      {/* Interactive Visual Canvas */}
      <div className="relative w-full min-h-[500px] lg:h-[600px] bg-gradient-to-br from-[#1D283C] to-[#0a0c09] rounded-2xl border border-[var(--line)] p-8 lg:p-12 shadow-[inset_0_2px_40px_rgba(255,255,255,0.02)] flex flex-col lg:flex-row gap-12 lg:gap-0 lg:items-center">
        
        {/* Abstract Data Flow Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-sage/20 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-copper/10 blur-[100px]" />
        </div>

        {/* The Pipeline (Left/Top) */}
        <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center">
          
          {/* Connection Line Background */}
          <div className="absolute left-[24px] top-[24px] bottom-[24px] w-[1px] bg-white/5 z-0 hidden lg:block" />
          
          <div className="flex flex-col gap-6 relative z-10">
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;
              
              return (
                <div key={step.id} className="relative flex items-center gap-6 group">
                  
                  {/* SVG Connection Line linking nodes */}
                  {index !== STEPS.length - 1 && (
                    <svg className="absolute left-[24px] top-[48px] w-[1px] h-[24px] lg:h-[48px] overflow-visible z-0 pointer-events-none hidden lg:block">
                      <motion.line 
                        x1="0" y1="0" x2="0" y2="100%"
                        stroke="var(--copper)"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ 
                          pathLength: isPast ? 1 : (isActive ? 0.5 : 0),
                          opacity: isPast || isActive ? 1 : 0 
                        }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    </svg>
                  )}

                  <button 
                    onClick={() => handleManualSelect(index)}
                    className="flex items-center gap-6 text-left outline-none"
                  >
                    {/* Node Circle */}
                    <motion.div 
                      layout
                      className={cn(
                        "w-[48px] h-[48px] rounded-full flex items-center justify-center border font-mono text-[11px] transition-all duration-500 relative z-10 shrink-0",
                        isActive 
                          ? "bg-ink-2 border-copper text-copper shadow-[0_0_20px_rgba(2,132,199,0.3)] scale-110" 
                          : isPast 
                            ? "bg-white/5 border-sage/50 text-sage"
                            : "bg-ink-3 border-[var(--line)] text-muted hover:border-white/20"
                      )}
                    >
                      0{index + 1}
                      
                      {/* Active Pulse Ring */}
                      {isActive && (
                        <motion.div 
                          className="absolute inset-0 rounded-full border border-copper/50"
                          animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                    </motion.div>

                    {/* Node Label */}
                    <span className={cn(
                      "font-mono text-[13px] tracking-[0.14em] uppercase transition-all duration-500",
                      isActive ? "text-cream tracking-[0.2em]" : isPast ? "text-[#a9ac9f]" : "text-muted group-hover:text-[#a9ac9f]"
                    )}>
                      {step.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Explanation Panel (Right/Bottom) */}
        <div className="relative z-10 w-full lg:w-1/2 min-h-[200px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-6 pl-0 lg:pl-12 lg:border-l border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1px] bg-copper/50" />
                <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-copper">
                  Phase 0{activeIndex + 1}
                </span>
              </div>
              
              <h3 className="text-[32px] md:text-[42px] font-normal tracking-[-0.03em] leading-[1.1] text-white">
                {STEPS[activeIndex].title}
              </h3>
              
              <p className="text-[16px] text-[#a9ac9f] leading-[1.8] max-w-[400px]">
                {STEPS[activeIndex].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
